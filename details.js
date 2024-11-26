// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDfU_CER8IJqqmNIKIQyVEUJJhEWtxNIzI",
    authDomain: "fitflow-fitness-website.firebaseapp.com",
    projectId: "fitflow-fitness-website",
    storageBucket: "fitflow-fitness-website.appspot.com",
    messagingSenderId: "826583269123",
    appId: "1:826583269123:web:2f9cab4b7fdf17eec77336",
    measurementId: "G-5LGXQ81QRQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Listen for authentication state changes
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("User is signed in:", user.uid); // Log the user ID
        fetchUserData(user.uid);
    } else {
        console.log("No user is signed in."); // Log this if no user is signed in
        alert("No user is logged in. Please log in to see your dashboard.");
        document.getElementById('loadingMessage').style.display = 'none'; // Hide loading message
    }
});

function fetchUserData(uid) {
    const date = new Date().toISOString().split('T')[0];
    console.log("Fetching user data for UID:", uid);

    // Get user profile data
    get(ref(db, 'users/' + uid + '/profile')).then(snapshot => {
        console.log("Profile snapshot:", snapshot);
        if (snapshot.exists()) {
            const profile = snapshot.val();
            console.log("Profile data:", profile);
            document.getElementById('userName').innerText = profile.name; // Display user's name
            document.getElementById('currentWeightDisplay').innerText = profile.currentWeight;
            document.getElementById('targetWeightDisplay').innerText = profile.targetWeight;
        } else {
            alert("Profile data not found.");
        }
    }).catch(error => {
        console.error("Error fetching profile data: ", error);
    });

    // Get user's logs for the current date
    get(ref(db, 'users/' + uid + '/logs/' + date)).then(snapshot => {
        console.log("Logs snapshot:", snapshot);
        if (snapshot.exists()) {
            const log = snapshot.val();
            console.log("Log data:", log);
            document.getElementById('stepsDisplay').innerText = log.steps;
            document.getElementById('exercisesDisplay').innerText = log.exercises;
            document.getElementById('mealsDisplay').innerText = log.meals;
        } else {
            document.getElementById('stepsDisplay').innerText = "No activity logged for today.";
            document.getElementById('exercisesDisplay').innerText = "No exercises logged for today.";
            document.getElementById('mealsDisplay').innerText = "No meals logged for today.";
        }
    }).catch(error => {
        console.error("Error fetching logs: ", error);
    }).finally(() => {
        document.getElementById('loadingMessage').style.display = 'none'; // Hide loading message
        document.querySelector('.dashboard').style.display = 'block'; // Show dashboard
    });
}
