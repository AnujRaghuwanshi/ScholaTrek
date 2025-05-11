import {
  collection,
  getDocs,
  query,
  where,orderBy, limit 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { auth, db } from "./firebaseConfig.js"; 

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadPublications(user);
    loadRecentActivities(user);
  } else {
    const noPublicationsMsg = document.getElementById("no-publications-msg");
    noPublicationsMsg.innerText = "Please log in to view your publications.";
    noPublicationsMsg.style.display = "block";
  }
});

export async function loadPublications(user) {
  const listContainer = document.getElementById("Publication-list");
  const noPublicationsMsg = document.getElementById("no-publications-msg");
  const countElement = document.getElementById("publication-count");
  const countProject = document.getElementById("project-count");
//   const viewAllBtn = document.getElementById("view-all-btn"); // Button you should have in HTML

  try {
    const userID = user.uid;
    const q = query(collection(db, "Publication"), where("userId", "==", userID));
    const querySnapshot = await getDocs(q);
    const count = querySnapshot.size;
    
    const q2 = query(collection(db, "Projects"), where("userId", "==", userID));
    const querySnapshot2 = await getDocs(q2);
    const count2 = querySnapshot2.size;


    countElement.textContent = count;
    countProject.textContent = count2;

    const publications = [];
    querySnapshot.forEach((doc) => publications.push(doc.data()));

    if (publications.length === 0) {
      noPublicationsMsg.style.display = "block";
      return;
    }

    noPublicationsMsg.style.display = "none";

    // Show only first 3 publications
    const initial = publications.slice(0, 3);
    initial.forEach((data) => {
      const listItem = createPublicationItem(data);
      listContainer.appendChild(listItem);
    });

    // If more than 3, show "View All" button
    // if (publications.length > 3) {
    //   viewAllBtn.style.display = "block";
    //   viewAllBtn.addEventListener("click", () => {
    //     listContainer.innerHTML = ""; // Clear existing 3
    //     publications.forEach((data) => {
    //       const listItem = createPublicationItem(data);
    //       listContainer.appendChild(listItem);
    //     });
    //     viewAllBtn.style.display = "none"; // Hide after expanding
    //   });
    // }

  } catch (error) {
    console.error("Error loading publications:", error);
    noPublicationsMsg.innerText = "An error occurred while fetching publications.";
    noPublicationsMsg.style.display = "block";
  }
}

function createPublicationItem(data) {
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
  return listItem;
}


// Recent Logs
export async function loadRecentActivities(user) {
  const activityList = document.getElementById("recent-activity-list");

  try {
    const q = query(
      collection(db, "ActivityLogs"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(5)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      activityList.innerHTML = "<p>No recent activity found.</p>";
      return;
    }

    activityList.innerHTML = ""; // Clear existing content

    snapshot.forEach(doc => {
      const data = doc.data();
      const timestamp = data.timestamp?.toDate();
      const timeAgo = timeSince(timestamp);

      let icon = "📚"; // default icon for Publication
      let title = "Publication Added";

      if (data.type === "Project") {
        icon = "🛠️";
        title = "Project Added";
      } else if (data.type === "Seminar") {
        icon = "🎤";
        title = "Seminar Logged";
      }

      const activityHTML = `
        <div class="activity-item">
          <div class="activity-icon"><i>${icon}</i></div>
          <div class="activity-details">
            <h4>${title}</h4>
            <p>You added a new ${data.type.toLowerCase()} "${data.title}"</p>
          </div>
          <div class="activity-time">${timeAgo}</div>
        </div>
      `;
      activityList.innerHTML += activityHTML;
    });

  } catch (error) {
    console.error("Error loading activities:", error);
    activityList.innerHTML = "<p>Error loading activities.</p>";
  }
}

function timeSince(date) {
  if (!date) return "";
  const seconds = Math.floor((new Date() - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const count = Math.floor(seconds / secondsInUnit);
    if (count >= 1) {
      return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
}
