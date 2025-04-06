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
