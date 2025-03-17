// Import Firebase modules (Ensure these imports are correct)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

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
document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("loginBtn");
    const emailInput = document.getElementById('email');
    const passwordError = document.getElementById('passwordError');
    const emailError = document.getElementById('emailError');
    const passwordInput = document.getElementById('password');
    
    loginBtn.addEventListener("click", login);
    emailInput.addEventListener("focus", () => {
        emailError.style.display = "none";
    });
    passwordInput.addEventListener('focus', () => {
        passwordError.style.display = "none";
    });
});

export function login() {
    const email = document.getElementById('email').value;
    const emailError = document.getElementById('emailError');
    const password = document.getElementById('password').value;
    const passwordError = document.getElementById('passwordError');
    const loadingMessage = document.getElementById('loadingMessage');
    const incorrectMessage=document.getElementById('incorrectMessage');
    
    //validate inputs
    if (!validateEmail(email)) {
        emailError.textContent = "Please Enter a Valid Email Address";
        emailError.style.display = "block";
        return;
    }
    if (!validatePassword(password)) {
        passwordError.textContent = "Password must be at least 6 characters long";
        passwordError.style.display = "block";
        return;
    }

    // Show loading message
    loadingMessage.style.display = "block";
    signInWithEmailAndPassword(auth, email, password)
    .then(function (userCredential) {
        loginSection.style.visibility="hidden";
            const user = userCredential.user;

            // Store user data in Firebase database
            const userData = {
                last_login: Date.now()
            };

            // Update the user's last login data in Firebase
            update(ref(database, 'users/' + user.uid), userData)
                .then(() => {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userId', user.uid);
                    window.location.href = "dashboard.html";
                })
                .catch((error) => {
                    alert('Database error: ' + error.message);
                });

        })
        .catch(() => {
            // Show the incorrectMessage and clear the input fields
            incorrectMessage.style.display = "block";
            document.getElementById('email').value = "";
            document.getElementById('password').value = "";
        })
        .finally(() => {
            // Hide loading message if there's an error
            loadingMessage.style.display = "none";
        });

}
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Password validation (minimum 6 characters)
function validatePassword(password) {
    return password.length >= 6;
}
