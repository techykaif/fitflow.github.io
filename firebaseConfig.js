import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut, 
    reauthenticateWithCredential, 
    updatePassword, 
    EmailAuthProvider,
    sendPasswordResetEmail // ✅ Added EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import { 
    getDatabase, 
    ref, 
    update, 
    set, 
    get, 
    push 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDfU_CER8IJqqmNIKIQyVEUJJhEWtxNIzI",
    authDomain: "fitflow-fitness-website.firebaseapp.com",
    projectId: "fitflow-fitness-website",
    storageBucket: "fitflow-fitness-website.appspot.com",
    messagingSenderId: "826583269123",
    appId: "1:826583269123:web:2f9cab4b7fdf17eec77336",
    measurementId: "G-5LGXQ81QRQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Export Firebase modules
export { 
    auth, 
    database, 
    signInWithEmailAndPassword, 
    ref, 
    update, 
    createUserWithEmailAndPassword, 
    set, 
    get, 
    getAuth, 
    push, 
    onAuthStateChanged, 
    signOut, 
    reauthenticateWithCredential, 
    updatePassword, 
    EmailAuthProvider,
    sendPasswordResetEmail // ✅ Added
};
