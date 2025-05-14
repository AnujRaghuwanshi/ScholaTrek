import { collection, addDoc,query,where,getDocs,serverTimestamp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { auth, db } from "./firebaseConfig.js";
import { loadRecentActivities } from './FetchPublications.js';

document.getElementById("Verify-Button").addEventListener("click",function(event){
    event.preventDefault();
    verifyDOI();
});

async function verifyDOI() {
    const doi = document.getElementById("Publication_DOI").value.trim();
    
    const submitButton = document.getElementById("submit-button");
    const userTitle = document.getElementById("Publication_title").value.trim().toLowerCase();
    const userDate = document.getElementById("Publication_date").value.trim();
    const userJournal = document.getElementById("Publication_journal").value.trim().toLowerCase();

    const usertype =  document.getElementById("Publication_type").value;
    const coAuthors =  document.getElementById("Publication_CoAuthors").value.split(",").map(name => name.trim());
    const indexedIn =  document.getElementById("Publication_Indexed").value;
    const role = document.getElementById("Author_Role").value;
    const abstract = document.getElementById("Publication_text").value;

    if (!doi || !userTitle || !userDate || !userJournal || !usertype || !coAuthors || !indexedIn || !role || !abstract) {
        alert("Please fill all fields.");
        return;
    }

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = '<span style="color: orange; font-weight: bold">Pending</span>';
  
    try {
        const response = await fetch(`https://api.crossref.org/works/${doi}`);
        const data = await response.json();

        if (data.status === "ok") {
            
            const publication = data.message;
            const title = (publication.title[0] || "").toLowerCase();
            const author = publication.author.map(a => `${a.given} ${a.family}`).join(", ");
            const publishedDate = publication.published["date-parts"][0].join("-");
            const journal = (publication["container-title"][0] || "").toLowerCase();
            const type = publication.type || "N/A";

            const userDateObject = new Date(userDate);
            let dateMatch = false;
  
            const [apiYear, apiMonth, apiDay] = publishedDate.split('-');
            const apiDateObject = new Date(apiYear, apiMonth - 1, apiDay);
  
            userDateObject.setHours(0, 0, 0, 0);
            apiDateObject.setHours(0, 0, 0, 0);
  
            if (userDateObject.getTime() === apiDateObject.getTime()) {
              dateMatch = true;
            }

            const titleMatch = title === userTitle;
            const journalMatch = journal === userJournal;

            console.log(title);
            console.log(author);
            console.log(publishedDate);
            console.log(journal);
            console.log(type)

            if (titleMatch && dateMatch && journalMatch) {
                    resultDiv.innerHTML = '<span style="color: green; font-weight: bold">Verified</span>';
                    submitButton.disabled = false;
                    submitButton.style.cursor = "pointer";
            }else {
            resultDiv.innerHTML = `<span style="color: red;">DOI not found or invalid</span>`;
        }
        } else {
            resultDiv.innerHTML = "Publication not found.";
        }
    } catch (error) {
        console.error("Error verifying DOI:", error);
        resultDiv.innerHTML = "Error verifying DOI. Please try again.";
    }
}

// Store Publication
document.getElementById("publication").addEventListener("submit", async function (e) {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    alert("User not logged in");
    window.location.href = "auth.html";
    return;
  }
  const doi = document.getElementById("Publication_DOI").value;
  const q = query(collection(db, "Publication"), where("doi", "==", doi));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    alert("This publication already exists.");
    document.getElementById("result").innerHTML="";
    document.querySelectorAll("#publication input, #publication select, #publication textarea").forEach(el => el.value = "");
    return;
  }

  const PDFInput = document.getElementById('Publication_pdf').files[0];

  const IndexProof = document.getElementById("Publication_Indexing").files[0];


  if (!PDFInput) {
    alert("Please upload publication pdf.");
    return;
  }
  if(!IndexProof){
    alert("Please upload indexing proof.");
    return;
  }

let uploadedPDFUrl = "";
let uploadedIndexURL = "";
  try {
  uploadedPDFUrl = await uploadToCloudinary(PDFInput);
  uploadedIndexURL = await uploadToCloudinary(IndexProof);
  // Save `uploadedUrl` to Firestore or use in your app
  } catch (error) {
    alert("Failed to upload file.");
  }

  const data = {
    title: document.getElementById("Publication_title").value,
    type: document.getElementById("Publication_type").value,
    journalName: document.getElementById("Publication_journal").value,
    date: document.getElementById("Publication_date").value,
    doi: document.getElementById("Publication_DOI").value,
    coAuthors: document.getElementById("Publication_CoAuthors").value.split(",").map(name => name.trim()),
    indexedIn: document.getElementById("Publication_Indexed").value,
    role: document.getElementById("Author_Role").value,
    abstract: document.getElementById("Publication_text").value,
    userId: user.uid,
    email: user.email,
    pdfURL: uploadedPDFUrl,
    IndexURL: uploadedIndexURL
  };

  try {
    await addDoc(collection(db, "Publication"), data);
    // Call this after adding the publication or project
    await addDoc(collection(db, "ActivityLogs"), {
      userId: user.uid,
      email: user.email,
      type: "Publication",
      title: data.title,
      timestamp: serverTimestamp()
    });
    document.querySelectorAll("#publication input, #publication select, #publication textarea").forEach(el => el.value = "");
    await loadPublications(user);
    await loadRecentActivities(user);
    alert("Publication submitted successfully!");

    const countElement = document.getElementById("publication-count");
    const q = query(collection(db, "Publication"), where("userId", "==", user.userID));
    const querySnapshot = await getDocs(q);
    countElement = querySnapshot.size;
  } catch (error) {
    console.error("Error adding document:", error);
    alert("Failed to submit publication.");
  }
});

document.getElementById("cancel-button").addEventListener("click",function(e){
    e.preventDefault();
    document.getElementById("result").innerHTML = "";
    document.querySelectorAll("#publication input, #publication select, #publication textarea").forEach(el => el.value = "");
});


// uploadToCloudinary

async function uploadToCloudinary(fileInput) {
  const formData = new FormData();
  formData.append("file", fileInput);
  formData.append("upload_preset", "faculty_uploads"); // Your preset
  formData.append("folder", "myfiles"); // Folder in Cloudinary

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/dku72t1ue/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.secure_url) {
      return data.secure_url; // ✅ Return the uploaded file URL
    } else {
      throw new Error(data.error?.message || "Upload failed");
    }
  } catch (err) {
    console.error("Upload failed:", err);
    throw err; // Re-throw so the calling code can handle it
  }
}
