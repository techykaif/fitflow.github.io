// Import Firebase modules
import {
    auth,
    database,
    signInWithEmailAndPassword,
    ref,
    update,
    get,
} from "./firebaseConfig.js";

// Format email for Firebase paths
function formatEmail(email) {
    return email.toLowerCase().replace(/\./g, "_dot_").replace(/@/g, "_at_");
}

// Async: Generate device ID using SHA-256
async function generateDeviceId() {
    const info =
        navigator.userAgent +
        navigator.language +
        screen.width +
        screen.height +
        screen.colorDepth +
        navigator.platform;

    const encoder = new TextEncoder();
    const data = encoder.encode(info);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const deviceId = "device_" + hashHex.slice(0, 16);
    return deviceId;
}

// Async: Get device ID (from localStorage or generate and save it)
async function getDeviceId() {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
        deviceId = await generateDeviceId();
        localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
}

// Get current IST date/time
function getCurrentIST() {
    const now = new Date();
    const options = {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    };
    return new Intl.DateTimeFormat("en-GB", options)
        .format(now)
        .replace(",", "");
}

// DOM ready
document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("loginBtn");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const loadingMessage = document.getElementById("loadingMessage");
    const incorrectMessage = document.getElementById("incorrectMessage");

    loginBtn.addEventListener("click", login);

    emailInput.addEventListener("focus", () => {
        emailError.style.display = "none";
    });
    passwordInput.addEventListener("focus", () => {
        passwordError.style.display = "none";
    });
});

// Main login function
export async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const loadingMessage = document.getElementById("loadingMessage");
    const incorrectMessage = document.getElementById("incorrectMessage");

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

    loadingMessage.style.display = "block";

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const formattedEmail = formatEmail(email);
        const loginRef = ref(database, `users/${formattedEmail}/login_activity`);
        const currentLoginTime = getCurrentIST();

        // 🧠 Get persistent device ID
        const deviceId = await getDeviceId();

        // ⏱️ Fetch existing login history
        const snapshot = await get(loginRef);
        const loginData = snapshot.val();
        let previousLogins = [];

        if (loginData && loginData.last_login) {
            previousLogins = loginData.previous_logins || [];
            previousLogins.push(loginData.last_login);
        }

        // 🔁 Update login activity
        await update(loginRef, {
            last_login: currentLoginTime,
            previous_logins: previousLogins,
        });

        // 💡 Save session info under device
        const sessionRef = ref(database, `users/${formattedEmail}/sessions/${deviceId}`);
        const sessionData = {
            active: true,
            lastLogin: currentLoginTime,
        };

        await update(sessionRef, sessionData);

        // ✅ Redirect to dashboard
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("❌ Login failed:", error.message);
        incorrectMessage.style.display = "block";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
    } finally {
        loadingMessage.style.display = "none";
    }
}

// Validate email
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validate password
function validatePassword(password) {
    return password.length >= 6;
}
