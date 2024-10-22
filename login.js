// Import Firebase modules (Ensure these imports are correct)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getDatabase, ref, set, update } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

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
    email = document.getElementById('email').value;
    const emailError = document.getElementById('emailError');
    password = document.getElementById('password').value;
    const passwordError = document.getElementById('passwordError');
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
    signInWithEmailAndPassword(auth, email, password)
        .then(function (userCredential) { // Pass userCredential here
            const user = userCredential.user;

            // Store user data in Firebase database
            const userData = {
                last_login: Date.now()
            };

            // Update the user's last login data in Firebase
            update(ref(database, 'users/' + user.uid), userData) // Use update correctly
                .then(() => {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userId', user.uid);
                    window.location.href = "dashboard.html";
                })
                .catch((error) => {
                    alert('Database error: ' + error.message);
                });

        })
        .catch((error) => {
            alert('Error: ' + error.message);
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