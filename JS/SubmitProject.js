import { collection, addDoc,query,where,getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { auth, db } from "./firebaseConfig.js";
import { loadRecentActivities, loadPublications } from './FetchPublications.js';

// Form submission handler
document.getElementById("projectForm").addEventListener("submit", function (event) {
    event.preventDefault();
    StoreintoDB();
});

async function StoreintoDB() {
    const user = auth.currentUser;
    if (!user) {
       alert("User not logged in");
       return;
    } 

    const data = {
    title: document.getElementById("projectTitle").value,
    type: document.getElementById("projectType").value,
    domain: document.getElementById("domain").value,
    startDate: document.getElementById("startDate").value,
    EndDate: document.getElementById("endDate").value,
    PI: document.getElementById("principalInvestigator").value,
    coInvestigators: document.getElementById("coInvestigators").value.split(",").map(name => name.trim()),
    abstract: document.getElementById("projectDescription").value,
    GitHubLink: document.getElementById("githubLink").value,
    userId: user.uid,
    email: user.email
  };

  try {
    await addDoc(collection(db, "Projects"), data);
    // Call this after adding the publication or project
    await addDoc(collection(db, "ActivityLogs"), {
    userId: user.uid,
    email: user.email,
    type: "Project",
    title: data.title,
    timestamp: serverTimestamp()
    });

    alert("Project added successfully!");
    document.getElementById('projectForm').reset();
     loadPublications(user);
    loadRecentActivities(user);
  } catch (error) {
    console.error("Error adding document:", error);
    alert("Failed to submit project.");
  }
}