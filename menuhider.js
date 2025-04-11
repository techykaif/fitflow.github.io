import { auth, database, ref, get, onAuthStateChanged } from "./firebaseConfig.js";

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

// Wait for DOM
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");

    // Wait for auth
    onAuthStateChanged(auth, (user) => {
        console.log("onAuthStateChanged triggered. User:", user);

        if (user) {
            console.log("User is logged in. Hiding login/signup links...");

            // Make sure nav-menu exists before selecting
            const navMenu = document.querySelector("#nav-menu");
            if (!navMenu) {
                console.warn("Navbar menu not found in DOM");
                return;
            }

            const loginLinks = navMenu.querySelectorAll("li a[href='login.html']");
            const signupLinks = navMenu.querySelectorAll("li a[href='signup.html']");

            loginLinks.forEach(el => {
                console.log("Hiding login link element:", el);
                el.parentElement.style.display = "none";
            });

            signupLinks.forEach(el => {
                console.log("Hiding signup link element:", el);
                el.parentElement.style.display = "none";
            });
        } else {
            console.log("No user logged in. Showing all links.");
        }
    });
});
