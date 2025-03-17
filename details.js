// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// Firebase Configuration
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

// Ensure script runs after DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const formattedEmail = formatEmail(user.email);
            console.log("User signed in:", user.email, "→ Fetching data for:", formattedEmail);
            document.getElementById("userName").innerText = user.email.split("@")[0]; // Display username
            fetchUserData(formattedEmail);
        } else {
            console.log("No user signed in.");
            alert("No user logged in. Please log in to see your dashboard.");
            document.getElementById('loadingMessage').style.display = 'none';
        }
    });
});

// Function to format email for Firebase path
function formatEmail(email) {
    return email.replace(/\./g, "_dot_").replace(/@/g, "_at_");
}function fetchUserData(userEmail) {
    const date = new Date().toISOString().split('T')[0];

    console.log("Fetching user data for:", userEmail);

    // Fetch fitness logs
    get(ref(db, `users/${userEmail}/fitnessLogs/${date}`)).then(snapshot => {
        if (snapshot.exists()) {
            const logs = snapshot.val();
            console.log("✅ Fitness Logs:", logs);
    
            const latestLogKey = Object.keys(logs).pop(); // Get latest timestamp
            const latestLog = logs[latestLogKey]; // This still contains another nested object
    
            if (latestLog) {
                const innerKey = Object.keys(latestLog).pop(); // Extract nested object key
                const actualData = latestLog[innerKey]; // Get the actual log data
    
                document.getElementById('stepsDisplay').innerText = actualData?.steps || "No data";
                document.getElementById('exercisesDisplay').innerText = actualData?.exercises || "No data";
                document.getElementById('mealsDisplay').innerText = actualData?.meals || "No data";
            }
        } else {
            document.getElementById('stepsDisplay').innerText = "No activity logged for today.";
            document.getElementById('exercisesDisplay').innerText = "No exercises logged for today.";
            document.getElementById('mealsDisplay').innerText = "No meals logged for today.";
        }
    }).catch(error => {
        console.error("Error fetching fitness logs:", error);
    });
    
    // Fetch weight logs
    get(ref(db, `users/${userEmail}/weightLogs/${date}`)).then(snapshot => {
        if (snapshot.exists()) {
            const logs = snapshot.val();
            console.log("✅ Weight Logs:", logs);

            // Extract the latest weight entry properly
            const latestLogKey = Object.keys(logs).sort().pop(); // Get the latest timestamp
            const latestLog = Object.values(logs[latestLogKey])[0]; // Get first object in timestamp

            if (latestLog) {
                document.getElementById('currentWeightDisplay').innerText = latestLog.currentWeight || "No data";
                document.getElementById('targetWeightDisplay').innerText = latestLog.targetWeight || "No data";
            } else {
                document.getElementById('currentWeightDisplay').innerText = "No weight log found.";
                document.getElementById('targetWeightDisplay').innerText = "No target weight set.";
            }
        } else {
            console.log("❌ No weight log data found.");
            document.getElementById('currentWeightDisplay').innerText = "No weight log found.";
            document.getElementById('targetWeightDisplay').innerText = "No target weight set.";
        }
    }).catch(error => {
        console.error("Error fetching weight logs:", error);
    }).finally(() => {
        document.getElementById('loadingMessage').style.display = 'none'; // Hide loading message
        document.querySelector('.dashboard').style.display = 'block'; // Show dashboard
    });
}
