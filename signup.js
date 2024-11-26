// Import and configure Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

// Your web app's Firebase configuration
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

// Event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
    const signUpBtn = document.getElementById("signUpBtn");
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    // Error message elements
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    signUpBtn.addEventListener("click", signup);
    name.addEventListener('focus', () => {
        nameError.style.display = "none";
    });
    email.addEventListener('focus', () => {
        emailError.style.display = "none";
    });
    password.addEventListener("focus", () => {
        passwordError.style.display = "none";
    });
    confirmPassword.addEventListener("focus", () => {
        confirmPasswordError.style.display = "none";
    });

});
document.addEventListener("DOMContentLoaded", function () {

});
// Function for registering users
export function signup() {
    // Get input fields
    const name = document.getElementById('name').value.trim(); // Trim whitespace
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Get error message elements
    const name1 = document.getElementById('name');
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');

    // Hide error messages initially
    nameError.style.display = 'none';
    emailError.style.display = 'none';
    passwordError.style.display = 'none';
    confirmPasswordError.style.display = 'none';

    let isValid = true;

    // Validate inputs
    if (!name || !name1) {
        nameError.textContent = "Please enter your name";
        nameError.style.display = 'block';
        isValid = false;
    }

    if (!validateEmail(email)) {
        emailError.textContent = "Please enter a valid email address";
        emailError.style.display = 'block';
        isValid = false;
    }

    if (!validatePassword(password)) {
        passwordError.textContent = "Password must be at least 6 characters long";
        passwordError.style.display = 'block';
        isValid = false;
    }
    if (password !== confirmPassword) {
        confirmPasswordError.textContent = "Passwords do not match";
        confirmPasswordError.style.display = 'block';
        isValid = false;
    }

    // If validation fails, stop the function
    if (!isValid) return;

    const statusMessage = document.getElementById('statusMessage');

    // Create user with Firebase Authentication
    createUserWithEmailAndPassword(auth, email, password) // Call as a function
        .then((userCredential) => {
            const user = userCredential.user;

            // Store user data in Firebase database
            const userData = {
                email: email,
                name: name,
                last_login: Date.now()
            };

            set(ref(database, 'users/' + user.uid), userData) // Use set with the ref function
                .then(() => {
                    statusMessage.textContent = "User registered successfully!";
                    statusMessage.style.color = "green";
                })
                .catch((error) => {
                    alert('Database error: ' + error.message);
                });
        })
        .catch((error) => {
            alert('Error: ' + error.message);
        });
}

// Email validation
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Password validation (minimum 6 characters)
function validatePassword(password) {
    return password.length >= 6;
}

// General field validation
function validateField(field) {
    return field != null && field.length > 0;
}
