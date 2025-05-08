import { auth, db } from "./firebaseConfig.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged,setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", function (e) {
 
    document.getElementById("login-form").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevents form from reloading the page
        login();
    });

    document.getElementById("signup-form").addEventListener("submit", function(event){
        event.preventDefault();
        signUp();
    });
});

// Sign Up Function
async function signUp() {
    const name = document.getElementById('full-name').value;
    const role = document.getElementById('user-type').value;
    const Ecode = document.getElementById('employee-code').value;   
    const email = document.getElementById("signup-email").value;
    const dept = document.getElementById('department').value;
    const password = document.getElementById("signup-password").value;
    const confirm_password = document.getElementById('confirm-password').value;

     // Check if all fields are filled
     if (!name || !role || !Ecode || !email || !dept || !password || !confirm_password) {
        alert("Please fill all fields.");
        return;
    }

    // Check if passwords match
    if (password !== confirm_password) {
        alert("Passwords do not match. Please re-enter.");
        return;
    }


    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user data in Firestore
        await setDoc(doc(db, "Users", user.uid), {
            userId: user.uid,
            email: user.email,
            name: name,
            role: role,
            employeeCode: Ecode,
            department: dept,
            password: password,
            createdAt: new Date().toISOString(), // Store timestamp
            learningProgress: {} // Empty object to store progress later
        });
        
        alert("Account created successfully!");
        window.location.href = "Admin.html";
    } catch (error) {
        switch (error.code) {
            case "auth/network-request-failed":
                alert("Network error. Please check your connection.");
                break;
            case "auth/email-already-in-use":
                alert("This email is already registered. Please log in instead.");
                break;
            case "auth/invalid-email":
                alert("Invalid email format. Please enter a valid email.");
                break;
            case "auth/weak-password":
                alert("Password must be at least 6 characters long.");
                break;
            case "auth/missing-email":
                alert("Email is required.");
                break;
            case "auth/missing-password":
                alert("Password is required.");
                break;
            default:
                alert("Error: " + error.message);
        }
    }
}


// Login Function
async function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        await setPersistence(auth, browserLocalPersistence);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, "Users", user.uid));
        if (userDoc.exists()) {
            const role = userDoc.data().role;
            console.log("Login Successfully! Role:", role);
            
            localStorage.setItem("loggedInUserId", user.uid);
            
            // Redirect based on role
            redirectUser(role);
        } else {
            alert("User data not found. Please signup first.");
        }
    } catch (error) {
        switch (error.code) {
            case "auth/network-request-failed":
                alert("Network error. Please check your connection.");
                break;
            case "auth/invalid-login-credentials":
            case "auth/user-not-found":
            case "auth/wrong-password":
                alert("Invalid credentials. Please try again.");
                break;
            case "auth/too-many-requests":
                alert("Too many failed attempts. Try again later or reset your password.");
                break;
            case "auth/user-disabled":
                alert("This account has been disabled. Contact support.");
                break;
            default:
                console.log(error);
                alert("Error: " + error.message);
        }
    }
}

function redirectUser(role) {
    if (role === "faculty") {
        window.location.href = "Dashboard.html"; // Redirect to Faculty Dashboard
    } else if (role === "admin") {
        window.location.href = "Admin.html"; // Redirect to Admin Dashboard
    } else {
        console.log("Invalid role. Redirecting to default page.");
        window.location.href = "index.html"; // Default redirection
    }
}

window.signUp = signUp;
window.login = login;

 // Tab switching logic
 const loginTab = document.getElementById('login-tab');
 const signupTab = document.getElementById('signup-tab');
 const loginForm = document.getElementById('login-form');
 const signupForm = document.getElementById('signup-form');
 
 loginTab.addEventListener('click', () => {
     loginTab.classList.add('active');
     signupTab.classList.remove('active');
     loginForm.classList.add('active');
     signupForm.classList.remove('active');
 });
 
 signupTab.addEventListener('click', () => {
     signupTab.classList.add('active');
     loginTab.classList.remove('active');
     signupForm.classList.add('active');
     loginForm.classList.remove('active');
 });
 
// User type selection 
const facultyType = document.getElementById('faculty-type');
const adminType = document.getElementById('admin-type');
const departmentGroup = document.querySelector('#department').closest('.form-group');
const userTypeInput = document.getElementById('user-type');

userTypeInput.value = 'faculty';

// Function to handle user type selection
function handleUserTypeSelection(isAdmin) {
// Update the hidden input value
userTypeInput.value = isAdmin ? 'admin' : 'faculty';

if (isAdmin) {
 // Admin selected - hide department field with smooth transition
 departmentGroup.style.maxHeight = departmentGroup.scrollHeight + 'px';
 setTimeout(() => {
     departmentGroup.style.maxHeight = '0px';
     departmentGroup.style.opacity = '0';
     departmentGroup.style.marginBottom = '0';
 }, 10);
 setTimeout(() => {
     departmentGroup.style.display = 'none';
 }, 300);
} else {
 // Faculty selected - show department field with smooth transition
 departmentGroup.style.display = 'block';
 setTimeout(() => {
     departmentGroup.style.opacity = '1';
     departmentGroup.style.maxHeight = departmentGroup.scrollHeight + 'px';
     departmentGroup.style.marginBottom = '15px';
 }, 10);
}
}

// Initialize CSS properties for transitions
departmentGroup.style.transition = 'all 0.3s ease';
departmentGroup.style.overflow = 'hidden';

// Set click event listeners
facultyType.addEventListener('click', () => {
facultyType.classList.add('active');
adminType.classList.remove('active');
handleUserTypeSelection(false); // Faculty selected
});

adminType.addEventListener('click', () => {
adminType.classList.add('active');
facultyType.classList.remove('active');
handleUserTypeSelection(true); // Admin selected
});

//Show Password
const passwordInput = document.getElementById("login-password");
const togglePassword = document.getElementById("toggle-password");

togglePassword.addEventListener("click", function () {
    if(passwordInput.value.trim()===""){
        return;
    }
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);

  // Change the icon if you want
  this.innerHTML = type === "password" ? `<i class="fa-solid fa-eye-slash"></i>` : `<i class="fa-solid fa-eye"></i>`; 
});

