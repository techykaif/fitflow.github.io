// Import and configure Firebase
import { auth, database, createUserWithEmailAndPassword, ref, set } from "./firebaseConfig.js";

// Function to format email for Firebase keys
function formatEmail(email) {
    return email.toLowerCase().replace(/\./g, "_dot_").replace(/@/g, "_at_");
}

// Function to get Indian Standard Time (IST)
function getISTTime() {
    const now = new Date();
    const options = { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" };
    return new Intl.DateTimeFormat("en-GB", options).format(now).replace(",", "");
}

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
    const statusMessage = document.getElementById('statusMessage');

    // Add event listeners
    signUpBtn.addEventListener("click", signup);

    name.addEventListener('focus', () => { nameError.style.display = "none"; });
    email.addEventListener('focus', () => { emailError.style.display = "none"; });
    password.addEventListener("focus", () => { passwordError.style.display = "none"; });
    confirmPassword.addEventListener("focus", () => { confirmPasswordError.style.display = "none"; });
});

// Function for registering users
export function signup() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const statusMessage = document.getElementById('statusMessage');
    const signUpBtn = document.getElementById("signUpBtn");

    // Reset error messages
    nameError.style.display = 'none';
    emailError.style.display = 'none';
    passwordError.style.display = 'none';
    confirmPasswordError.style.display = 'none';
    statusMessage.textContent = "";
    statusMessage.style.color = "";

    let isValid = true;

    // Validate inputs
    if (!name) {
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

    if (!isValid) return;

    // Show loader effect
    signUpBtn.disabled = true;
    signUpBtn.innerHTML = `<span class="loader"></span> Signing up...`;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const formattedEmail = formatEmail(email); // Format email for Firebase
            const userUID = user.uid; // Get Firebase UID
            const creationTime = getISTTime(); // Get IST time

            const userData = {
                name: name,
                email: email, // Store original email
                uid: userUID // Store user UID
            };

            // Store personal information
            set(ref(database, `users/${formattedEmail}/personal_information`), userData)
                .then(() => {
                    // Store account creation time in separate login_activity
                    set(ref(database, `users/${formattedEmail}/login_activity`), {
                        account_created: creationTime
                    })
                    .then(() => {
                        statusMessage.textContent = "Account registered successfully!";
                        statusMessage.style.color = "green";
                    
                        // Clear input fields after successful registration
                        document.getElementById('name').value = "";
                        document.getElementById('email').value = "";
                        document.getElementById('password').value = "";
                        document.getElementById('confirmPassword').value = "";
                    
                        resetButton();
                    })                    
                    .catch((error) => {
                        statusMessage.textContent = "Some error occurred. Please try again later.";
                        statusMessage.style.color = "red";
                        resetButton();
                    });
                })
                .catch((error) => {
                    statusMessage.textContent = "Some error occurred. Please try again later.";
                    statusMessage.style.color = "red";
                    resetButton();
                });
        })
        .catch((error) => {
            if (error.code === "auth/email-already-in-use") {
                statusMessage.textContent = "User already exists.";
            } else {
                statusMessage.textContent = "Some error occurred. Please try again later.";
            }
            statusMessage.style.color = "red";
            resetButton();
        });

    function resetButton() {
        signUpBtn.disabled = false;
        signUpBtn.innerHTML = "Sign Up";
    }
}

// Fixed Email Validation
function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

// Password validation (minimum 6 characters)
function validatePassword(password) {
    return password.length >= 6;
}
function togglePassword(fieldId, icon) {
    const field = document.getElementById(fieldId);
    const isPassword = field.type === "password";
    field.type = isPassword ? "text" : "password";
    icon.textContent = isPassword ? "🙈" : "👁️";
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".toggle-password").forEach(toggle => {
        toggle.addEventListener("click", function () {
            const inputId = this.getAttribute("data-target");
            togglePassword(inputId, this);
        });
    });
});
