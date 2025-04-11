import { auth, database, ref, get, onAuthStateChanged } from "./firebaseConfig.js";

// Generate device ID (must match login.js logic)
function getDeviceId() {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
        deviceId = "device-" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
}

const deviceId = getDeviceId();

window.authReady = new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
        window.isUserLoggedIn = !!user;

        // Immediately hide login/signup links if logged in
        if (window.isUserLoggedIn) {
            document.querySelectorAll("#nav-menu li a[href='login.html']").forEach(el => el.parentElement.style.display = "none");
            document.querySelectorAll("#nav-menu li a[href='signup.html']").forEach(el => el.parentElement.style.display = "none");
        }

        resolve(user); // Pass user to next block
    });
});

window.authReady.then(async (user) => {
    if (user) {
        const email = user.email;
        const formattedEmail = email.toLowerCase().replace(/\./g, "_dot_").replace(/@/g, "_at_");

        const sessionRef = ref(database, `users/${formattedEmail}/sessions/${deviceId}`);

        try {
            const sessionSnapshot = await get(sessionRef);

            if (sessionSnapshot.exists()) {
                const session = sessionSnapshot.val();

                if (session.active) {
                    // Show dashboard and logout links
                    document.querySelectorAll("#nav-menu li a[href='dashboard.html']").forEach(el => el.parentElement.style.display = "block");
                    document.querySelectorAll("#nav-menu li a[href='logout.html']").forEach(el => el.parentElement.style.display = "block");
                }
            }
        } catch (error) {
            console.error("Error checking session on Netlify:", error);
        }
    }
});
