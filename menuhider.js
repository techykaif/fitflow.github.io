import { auth, onAuthStateChanged } from "./firebaseConfig.js";
window.isUserLoggedIn = false;

console.log("Before auth state check: ", window.isUserLoggedIn);

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.isUserLoggedIn = true;
        console.log("User is logged in. Setting isUserLoggedIn to: ", window.isUserLoggedIn);
        
        // Hide login and signup buttons
        document.querySelectorAll("#nav-menu li a[href='login.html']").forEach(el => el.parentElement.style.display = "none");
        document.querySelectorAll("#nav-menu li a[href='signup.html']").forEach(el => el.parentElement.style.display = "none");
    } else {
        window.isUserLoggedIn = false;
        console.log("User is logged out. Setting isUserLoggedIn to: ", window.isUserLoggedIn);
    }
});

console.log("After auth state check: ", window.isUserLoggedIn);
