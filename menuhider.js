import { auth, database, ref, get, onAuthStateChanged } from "/firebaseConfig.js";

// Generate device ID (must match login.js logic)
function getDeviceId() {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
        deviceId = "device-" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("deviceId", deviceId);
        console.log("Generated new deviceId:", deviceId);
    } else {
        console.log("Retrieved existing deviceId from localStorage:", deviceId);
    }
    return deviceId;
}

const deviceId = getDeviceId();

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");

    window.authReady = new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            console.log("onAuthStateChanged triggered. User:", user);

            window.isUserLoggedIn = !!user;
            console.log("Is user logged in?", window.isUserLoggedIn);

            if (window.isUserLoggedIn) {
                // Slight delay to give DOM a bit more time
                setTimeout(() => waitForNavLinks(), 100);
            }

            resolve(user); // Pass user to next block
        });
    });
});

function waitForNavLinks(retries = 20) {
    const loginLinks = document.querySelectorAll("a[href$='login.html']");
    const signupLinks = document.querySelectorAll("a[href$='signup.html']");

    if (loginLinks.length === 0 && signupLinks.length === 0) {
        if (retries > 0) {
            console.log("Nav links not found yet. Retrying...");
            setTimeout(() => waitForNavLinks(retries - 1), 200);
        } else {
            console.warn("Failed to find nav links after multiple retries.");
        }
        return;
    }

    console.log("Found login links:", loginLinks);
    console.log("Found signup links:", signupLinks);

    loginLinks.forEach(el => {
        if (el?.parentElement) {
            el.parentElement.style.display = "none";
            console.log("Hiding login link element:", el);
        }
    });

    signupLinks.forEach(el => {
        if (el?.parentElement) {
            el.parentElement.style.display = "none";
            console.log("Hiding signup link element:", el);
        }
    });
}
