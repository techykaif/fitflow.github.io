import { auth, onAuthStateChanged } from "/firebaseConfig.js";

// Get or generate device ID
function getDeviceId() {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
        deviceId = "device-" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
}

const deviceId = getDeviceId();

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

// Observer for dynamic nav injection
function observeAndHideAuthLinks(selector = "a") {
    if (hideAuthLinks(selector)) return;

    const observer = new MutationObserver(() => {
        if (hideAuthLinks(selector)) {
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 10000); // Stop after 10s max
}

document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (user) => {
        window.isUserLoggedIn = !!user;

        if (window.isUserLoggedIn) {
            setTimeout(() => {
                observeAndHideAuthLinks("a");
                observeAndHideAuthLinks("#tooltip a");
            }, 100);
        }
    });
});
