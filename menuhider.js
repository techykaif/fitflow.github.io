import { auth, database, ref, get, onAuthStateChanged } from "/firebaseConfig.js";

// Generate or retrieve device ID
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

// Function to hide login and signup links using MutationObserver
function hideAuthLinksInMenu(selector = "a") {
    const hideLinks = () => {
        const loginLinks = document.querySelectorAll(`${selector}[href$='login.html']`);
        const signupLinks = document.querySelectorAll(`${selector}[href$='signup.html']`);

        let hidden = false;

        loginLinks.forEach(el => {
            if (el?.parentElement) {
                el.parentElement.style.display = "none";
                console.log("Hiding login link element:", el);
                hidden = true;
            }
        });

        signupLinks.forEach(el => {
            if (el?.parentElement) {
                el.parentElement.style.display = "none";
                console.log("Hiding signup link element:", el);
                hidden = true;
            }
        });

        return hidden;
    };

    if (hideLinks()) return;

    const observer = new MutationObserver(() => {
        if (hideLinks()) {
            observer.disconnect(); // Stop observing once hidden
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Optional safety: stop observing after 10 seconds
    setTimeout(() => observer.disconnect(), 10000);
}

// DOM ready listener
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");

    window.authReady = new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            console.log("onAuthStateChanged triggered. User:", user);

            window.isUserLoggedIn = !!user;
            console.log("Is user logged in?", window.isUserLoggedIn);

            if (window.isUserLoggedIn) {
                setTimeout(() => {
                    // Main nav
                    hideAuthLinksInMenu("a");

                    // Tooltip/hamburger nav (if used)
                    hideAuthLinksInMenu("#tooltip a");
                }, 100);
            }

            resolve(user);
        });
    });
});
