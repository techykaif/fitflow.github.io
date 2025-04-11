import { auth, database, ref, get, signOut, onAuthStateChanged } from "/firebaseConfig.js";

// 📱 Get or generate device ID
function getDeviceId() {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
        deviceId = "device-" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
}
const deviceId = getDeviceId();

// 🔐 Format Firebase-safe email
function formatEmail(email) {
    return email.replace(/\./g, "_dot_").replace(/@/g, "_at_");
}

// 🧼 Hide login/signup links
function hideAuthLinks(selector = "a") {
    const loginLinks = document.querySelectorAll(`${selector}[href='/login'], ${selector}[href='login.html']`);
    const signupLinks = document.querySelectorAll(`${selector}[href='/signup'], ${selector}[href='signup.html']`);
    let anyHidden = false;

    loginLinks.forEach(link => {
        const wrapper = link.closest("li") || link;
        wrapper.style.display = "none";
        anyHidden = true;
    });

    signupLinks.forEach(link => {
        const wrapper = link.closest("li") || link;
        wrapper.style.display = "none";
        anyHidden = true;
    });

    return anyHidden;
}

// 👀 Watch for dynamic DOM nav links
function observeAndHideAuthLinks(selector = "a") {
    if (hideAuthLinks(selector)) return;

    const observer = new MutationObserver(() => {
        if (hideAuthLinks(selector)) {
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 10000); // Auto-stop after 10s
}

// 🍞 Toast Message
function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}

// 🔐 Session Validation + Auto Logout
async function handleSession(user) {
    const emailKey = formatEmail(user.email);
    const sessionRef = ref(database, `users/${emailKey}/sessions/${deviceId}`);

    try {
        const snapshot = await get(sessionRef);
        const sessionData = snapshot.val();

        if (!snapshot.exists() || sessionData.active === false) {
            showToast("Session expired or logged out from another device.");
            setTimeout(async () => {
                await signOut(auth);
                window.location.href = "login.html";
            }, 3000);
        } else {
            // Session valid → hide login/signup
            setTimeout(() => {
                observeAndHideAuthLinks("a");
                observeAndHideAuthLinks("#tooltip a");
            }, 100);
        }
    } catch (error) {
        console.error("❌ Error checking session:", error);
    }
}

// 🌐 DOM loaded
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (user) => {
        window.isUserLoggedIn = !!user;
        if (window.isUserLoggedIn) {
            handleSession(user);
        }
    });
});
