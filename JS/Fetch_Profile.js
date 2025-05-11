import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js"
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