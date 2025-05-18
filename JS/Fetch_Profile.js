import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js"
import { auth, db } from "./firebaseConfig.js";

document.addEventListener("DOMContentLoaded", function (e) {
  document.getElementById("logout-button").addEventListener("click", function(event){
    event.preventDefault();
    logout();
});
  // Check auth state on page load
  auth.onAuthStateChanged(function (user) {
    if (user) {
      fetchUserDetails(user.uid);
    } else {
      alert("Session expired. Please log in again.");
      window.location.href = "auth.html";
    }
  });
   updateProfileCard();

});

let fetched = false;
async function fetchUserDetails(uid) {
    try {
        const userDocRef = doc(db, "Users", uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = {
                name : userDocSnap.data().name,
                role : userDocSnap.data().role,
                department : userDocSnap.data().department,
                email : userDocSnap.data().email,
                employeeCode : userDocSnap.data().employeeCode,
        }
        localStorage.setItem("userProfile", JSON.stringify(userData)); 
           
            fetched =- true;

        } else {
            alert("User record not found.");
        }
    } catch (error) {
        console.error(error);
        alert("Error fetching user details: " + error.message);
        logout();
    }
}

function updateProfileCard() {
    const userProfile = JSON.parse(localStorage.getItem("userProfile"));
    if(userProfile){
    document.getElementById("user-name").innerText = userProfile.name || "No Name";
    document.getElementById("profile-name").innerText = userProfile.name || "No Name";
    document.getElementById("user-role").innerText = userProfile.role.toUpperCase() || "No Role";
    document.getElementById("user-department").innerText = userProfile.department.toUpperCase() || "No Department";
    document.getElementById("user-email").innerText = userProfile.email || "No Email";
    document.getElementById("user-employee-code").innerText = userProfile.employeeCode || "No Code";

    const initial = (userProfile.name && userProfile.name[0]) ? userProfile.name[0].toUpperCase() : "?";
    document.getElementById("user-initial").innerText = initial;
    document.getElementById("profile-initial").innerText = initial;
    }else{
        console.warn("No cached profile found. Redirecting to login...");
        window.location.href = "auth.html";
    }
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
                localStorage.clear();
                window.location.href = "auth.html";

            }catch(error){
                console.error("Error signing out:", error);
                alert("Error while signing out. Please try again!");
                return;
            }
        }
      });
}