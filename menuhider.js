import { auth, onAuthStateChanged } from "./firebaseConfig.js";

// Create a promise that resolves once Firebase auth state is known
window.authReady = new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
        window.isUserLoggedIn = !!user; // true if user exists

        // Also hide login/signup in top nav immediately if needed
        if (window.isUserLoggedIn) {
            document.querySelectorAll("#nav-menu li a[href='login.html']").forEach(el => el.parentElement.style.display = "none");
            document.querySelectorAll("#nav-menu li a[href='signup.html']").forEach(el => el.parentElement.style.display = "none");
        }

        resolve(); // Let other scripts know auth is ready
    });
});

window.authReady.then(async (user) => {
    if (user) {
        const email = user.email;
        const formattedEmail = email.toLowerCase().replace(/\./g, "_dot_").replace(/@/g, "_at_");

        const sessionRef = ref(database, `users/${formattedEmail}/session`);

        try {
            const sessionSnapshot = await get(sessionRef);

            if (sessionSnapshot.exists()) {
                const session = sessionSnapshot.val();

                if (session.active) {
                    document.querySelectorAll("#nav-menu li a[href='dashboard.html']").forEach(el => el.parentElement.style.display = "block");
                    document.querySelectorAll("#nav-menu li a[href='logout.html']").forEach(el => el.parentElement.style.display = "block");
                }
            }
        } catch (error) {
            console.error("Error checking session:", error);
        }
    }
});