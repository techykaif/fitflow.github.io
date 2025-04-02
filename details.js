// Import Firebase SDKs
import {database,ref,get} from "./firebaseConfig.js";
// Ensure script runs after DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const formattedEmail = formatEmail(user.email);
            document.getElementById("userName").innerText = user.email.split("@")[0]; // Display username
            fetchUserData(formattedEmail);
        } else {
            alert("No user logged in. Please log in to see your dashboard.");
            document.getElementById('loadingMessage').style.display = 'none';
        }
    });
});

// Function to format email for Firebase path
function formatEmail(email) {
    return email.replace(/\./g, "_dot_").replace(/@/g, "_at_");
}

// Function to fetch user data
function fetchUserData(userEmail) {
    const date = new Date().toISOString().split('T')[0];

    // Fetch fitness logs
    get(ref(db, `users/${userEmail}/fitnessLogs/${date}`)).then(snapshot => {
        if (snapshot.exists()) {
            const logs = snapshot.val();
            const latestLogKey = Object.keys(logs).pop(); // Get latest timestamp
            const latestLog = logs[latestLogKey];

            if (latestLog) {
                const innerKey = Object.keys(latestLog).pop();
                const actualData = latestLog[innerKey];

                document.getElementById('stepsDisplay').innerText = actualData?.steps || "No data";
                document.getElementById('exercisesDisplay').innerText = actualData?.exercises || "No data";
                document.getElementById('mealsDisplay').innerText = actualData?.meals || "No data";
            }
        } else {
            document.getElementById('stepsDisplay').innerText = "No activity logged for today.";
            document.getElementById('exercisesDisplay').innerText = "No exercises logged for today.";
            document.getElementById('mealsDisplay').innerText = "No meals logged for today.";
        }
    }).catch(() => {});

    // Fetch weight logs
    get(ref(db, `users/${userEmail}/weightLogs/${date}`)).then(snapshot => {
        if (snapshot.exists()) {
            const logs = snapshot.val();
            const latestLogKey = Object.keys(logs).sort().pop();
            const latestLog = Object.values(logs[latestLogKey])[0];

            if (latestLog) {
                document.getElementById('currentWeightDisplay').innerText = latestLog.currentWeight || "No data";
                document.getElementById('targetWeightDisplay').innerText = latestLog.targetWeight || "No data";
            } else {
                document.getElementById('currentWeightDisplay').innerText = "No weight log found.";
                document.getElementById('targetWeightDisplay').innerText = "No target weight set.";
            }
        } else {
            document.getElementById('currentWeightDisplay').innerText = "No weight log found.";
            document.getElementById('targetWeightDisplay').innerText = "No target weight set.";
        }
    }).catch(() => {}).finally(() => {
        document.getElementById('loadingMessage').style.display = 'none'; // Hide loading message
        document.querySelector('.dashboard').style.display = 'block'; // Show dashboard
    });
}

