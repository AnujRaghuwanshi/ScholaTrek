import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js"
import { auth, db } from "./firebaseConfig.js"; 

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadPublications(user); // pass user to load function
  } else {
    const noPublicationsMsg = document.getElementById("no-publications-msg");
    noPublicationsMsg.innerText = "Please log in to view your publications.";
    noPublicationsMsg.style.display = "block";
  }
});

async function loadPublications(user) {
  const listContainer = document.getElementById("Publication-list");
  const noPublicationsMsg = document.getElementById("no-publications-msg");


  try {
    const userID = user.uid;
    const q = query(collection(db, "Publication"), where("userId", "==", userID));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      noPublicationsMsg.style.display = "block";
      return;
    }

    noPublicationsMsg.style.display = "none"; // Hide if publications found

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      const dateObj = new Date(data.date);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });

      const listItem = document.createElement("li");
      listItem.classList.add("list-item");
      listItem.innerHTML = `
        <h2>${data.title}</h2>
        <h6>${data.doi}</h6>
        <h5>${data.journalName}</h5>
        <div class="meta">
          <span>${formattedDate}</span>
        </div>
      `;
      listContainer.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error loading publications:", error);
    noPublicationsMsg.innerText = "An error occurred while fetching publications.";
    noPublicationsMsg.style.display = "block";
  }
}


