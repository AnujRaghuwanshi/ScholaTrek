import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js"
import { collection, addDoc,query,where,getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { auth, db } from "./firebaseConfig.js";

document.addEventListener("DOMContentLoaded", function (e) {
  document.getElementById("logout-button").addEventListener("click", function(event){
    event.preventDefault();
    logout();
});
});


// When page loads
window.onload = async function() {
    const userId = localStorage.getItem("loggedInUserId");

    if (userId) {
        fetchUserDetails(userId);
    } else {
        // If UID not found, force logout or go back to login
        alert("Session expired. Please login again.");
        window.location.href = "auth.html";
    }
}

async function fetchUserDetails(uid) {
    try {
        const userDocRef = doc(db, "Users", uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();

            updateProfileCard(userData);
        } else {
            alert("User document not found. Please contact support.");
        }
    } catch (error) {
        console.error(error);
        alert("Error fetching user details: " + error.message);
    }
}

function updateProfileCard(userData) {
    document.getElementById("user-name").innerText = userData.name || "No Name";
    document.getElementById("profile-name").innerText = userData.name || "No Name";
    document.getElementById("user-role").innerText = userData.role.toUpperCase() || "No Role";
    document.getElementById("user-department").innerText = userData.department.toUpperCase() || "No Department";
    document.getElementById("user-email").innerText = userData.email || "No Email";
    document.getElementById("user-employee-code").innerText = userData.employeeCode || "No Code";

    const initial = (userData.name && userData.name[0]) ? userData.name[0].toUpperCase() : "?";
    document.getElementById("user-initial").innerText = initial;
    document.getElementById("profile-initial").innerText = initial;
}

async function logout() {
    Swal.fire({
        title: "<h5 style='color:black'>Are you sure you want to logout?</h5>",
        showCancelButton: true,
        background: "#FFF",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes"
      }).then(async (result) => {
        if (result.isConfirmed) {
            try{
                await signOut(auth);
                window.location.href = "auth.html";

            }catch(error){
                console.error("Error signing out:", error);
                alert("Error while signing out. Please try again!");
                return;
            }
        }
      });
}

document.getElementById("Verify-Button").addEventListener("click",function(event){
    event.preventDefault();
    verifyDOI();
});

async function verifyDOI() {
    const doi = document.getElementById("Publication_DOI").value.trim();
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = '<span style="color: orange; font-weight: bold">Pending</span>';

    const submitButton = document.getElementById("submit-button");
    const userTitle = document.getElementById("Publication_title").value.trim().toLowerCase();
    const userDate = document.getElementById("Publication_date").value.trim();
    const userJournal = document.getElementById("Publication_journal").value.trim().toLowerCase();

    if (!doi || !userTitle || !userDate || !userJournal) {
        alert("Please fill all fields.")
        return;
    }

    try {
        const response = await fetch(`https://api.crossref.org/works/${doi}`);
        const data = await response.json();

        if (data.status === "ok") {
            
            const publication = data.message;
            const title = (publication.title[0] || "").toLowerCase();
            const author = publication.author.map(a => `${a.given} ${a.family}`).join(", ");
            const publishedDate = publication.published["date-parts"][0].join("-");
            const journal = (publication["container-title"][0] || "").toLowerCase();

            const userDateObject = new Date(userDate);
            let dateMatch = false;
  
            const [apiYear, apiMonth, apiDay] = publishedDate.split('-');
            const apiDateObject = new Date(apiYear, apiMonth - 1, apiDay);
  
            userDateObject.setHours(0, 0, 0, 0);
            apiDateObject.setHours(0, 0, 0, 0);
  
            if (userDateObject.getTime() === apiDateObject.getTime()) {
              dateMatch = true;
            }

            const titleMatch = title.includes(userTitle);
            const journalMatch = journal.includes(userJournal);

            console.log(title);
            console.log(author);
            console.log(publishedDate);
            console.log(journal);

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
    return;
  }
  const doi = document.getElementById("Publication_DOI").value;
  const q = query(collection(db, "Publication"), where("doi", "==", doi));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    alert("This publication already exists.");
    document.querySelectorAll("#publication input, #publication select, #publication textarea").forEach(el => el.value = "");
    return;
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
    email: user.email
  };

  try {
    await addDoc(collection(db, "Publication"), data);
    alert("Publication submitted successfully!");
    document.querySelectorAll("#publication input, #publication select, #publication textarea").forEach(el => el.value = "");
  } catch (error) {
    console.error("Error adding document:", error);
    alert("Failed to submit publication.");
  }
});

document.getElementById("cancel-button").addEventListener("click",function(e){
    e.preventDefault();
    document.querySelectorAll("#publication input, #publication select, #publication textarea").forEach(el => el.value = "");
});