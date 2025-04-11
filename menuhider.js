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
                console.log("Hiding login/signup links...");

                const loginLinks = document.querySelectorAll("#nav-menu li a[href='login.html']");
                const signupLinks = document.querySelectorAll("#nav-menu li a[href='signup.html']");

                console.log("Found login links:", loginLinks);
                console.log("Found signup links:", signupLinks);

                loginLinks.forEach(el => {
                    console.log("Hiding login link element:", el);
                    el.parentElement.style.display = "none";
                });

                signupLinks.forEach(el => {
                    console.log("Hiding signup link element:", el);
                    el.parentElement.style.display = "none";
                });
            }

            resolve(user); // Pass user to next block
        });
    });
});