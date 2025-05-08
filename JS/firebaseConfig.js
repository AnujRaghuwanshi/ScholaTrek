// firebaseConfig.js

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBxjdqjET2WK_fqt3L83tWzLYggiDimS-U",
    authDomain: "anuj-raghuwanshi.firebaseapp.com",
    projectId: "anuj-raghuwanshi",
    storageBucket: "anuj-raghuwanshi.appspot.com",
    messagingSenderId: "64337598636",
    appId: "1:64337598636:web:8f50231c047bf1706d6709",
    measurementId: "G-DCW0S2MXLX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase instances
export { app, auth, db };
