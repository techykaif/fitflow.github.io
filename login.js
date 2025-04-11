// Import Firebase modules
import { auth, database, signInWithEmailAndPassword, ref, update, get } from "./firebaseConfig.js";

// Function to format email for Firebase keys
function formatEmail(email) {
    return email.toLowerCase().replace(/\./g, "_dot_").replace(/@/g, "_at_");
}

// Function to get current date & time in Indian Standard Time (IST)
function getCurrentIST() {
    const now = new Date();
    const options = { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" };
    return new Intl.DateTimeFormat("en-GB", options).format(now).replace(",", "");
}

// Event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("loginBtn");
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const loadingMessage = document.getElementById('loadingMessage');
    const incorrectMessage = document.getElementById('incorrectMessage');

    loginBtn.addEventListener("click", login);
    
    emailInput.addEventListener("focus", () => { emailError.style.display = "none"; });
    passwordInput.addEventListener("focus", () => { passwordError.style.display = "none"; });
});

// Function to handle user login
export function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const loadingMessage = document.getElementById('loadingMessage');
    const incorrectMessage = document.getElementById('incorrectMessage');

    // Validate inputs
    if (!validateEmail(email)) {
        emailError.textContent = "Please enter a valid email address";
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
        .then((userCredential) => {
            const user = userCredential.user;
            const formattedEmail = formatEmail(email);
            const loginRef = ref(database, `users/${formattedEmail}/login_activity`);
            const currentLoginTime = getCurrentIST(); // Get IST formatted time

            // Fetch the current login activity
            get(loginRef)
                .then((snapshot) => {
                    const loginData = snapshot.val();
                    let previousLogins = [];

                    // If "last_login" exists, move it to "previous_logins"
                    if (loginData && loginData.last_login) {
                        previousLogins = loginData.previous_logins || [];
                        previousLogins.push(loginData.last_login);
                    }

                    // Update login activity with new last login and past logins
                    update(loginRef, {
                        last_login: currentLoginTime,
                        previous_logins: previousLogins
                    })
                    .then(() => {
                        // Save session to Firebase
                        const sessionRef = ref(database, `users/${formattedEmail}/session`);
                        const sessionData = {
                            active: true,
                            lastLogin: currentLoginTime
                        };

                        update(sessionRef, sessionData)
                            .then(() => {
                                window.location.href = "dashboard.html";
                            })
                            .catch((error) => {
                                alert('Error saving session: ' + error.message);
                            });
                    })
                    .catch((error) => {
                        alert('Database error: ' + error.message);
                    });
                })
                .catch((error) => {
                    alert('Error fetching login data: ' + error.message);
                });
        })
        .catch(() => {
            // Show incorrect message and clear input fields
            incorrectMessage.style.display = "block";
            document.getElementById('email').value = "";
            document.getElementById('password').value = "";
        })
        .finally(() => {
            // Hide loading message
            loadingMessage.style.display = "none";
        });
}

// Email validation function
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Password validation function (minimum 6 characters)
function validatePassword(password) {
    return password.length >= 6;
}
