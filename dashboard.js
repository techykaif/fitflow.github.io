// Import Firebase modules
import { auth, database, ref, push, getAuth, onAuthStateChanged } from "./firebaseConfig.js";

// Function to format email for Firebase path
function formatEmail(email) {
    return email.toLowerCase().replace(/\./g, "_dot_").replace(/@/g, "_at_");
}

// Function to get current date & time in Indian Standard Time (IST)
function getCurrentIST() {
    const now = new Date();
    const nowIST = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    
    const dateIST = nowIST.toISOString().split("T")[0]; // YYYY-MM-DD
    const timeIST = nowIST.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS

    return { fullTimestampIST: nowIST.toISOString(), dateIST, timeIST };
}

// Ensure DOM is Loaded before Adding Event Listeners
document.addEventListener("DOMContentLoaded", function () {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const formattedEmail = formatEmail(user.email);
            setupFormListeners(formattedEmail);
        } else {
            alert("User not logged in. Please log in first.");
            window.location.href = "login.html"; // Redirect to login page if not authenticated
        }
    });
});

// Setup form listeners
function setupFormListeners(userEmail) {
    const fitnessForm = document.getElementById("fitnessLogForm");
    const weightForm = document.getElementById("weightLogForm");

    if (fitnessForm) {
        fitnessForm.addEventListener("submit", function (event) {
            event.preventDefault();
            
            // Get form data
            const steps = document.getElementById("steps").value.trim();
            const exercises = document.getElementById("exercises").value.trim();
            const meals = document.getElementById("meals").value.trim();
            const mealType = document.getElementById("mealType").value.trim();
            const portionSize = document.getElementById("portionSize").value.trim();
            const ingredients = document.getElementById("ingredients").value.trim();
            
            // Validate inputs
            if (!steps || !exercises || !meals || !mealType || !portionSize || !ingredients) {
                alert("Please fill in all fields before submitting.");
                return;
            }

            // Get current IST date & time
            const { fullTimestampIST, dateIST, timeIST } = getCurrentIST();

            // Create fitness log object
            const fitnessLog = {
                steps,
                exercises,
                meals,
                mealType,
                portionSize,
                ingredients,
                fullTimestampIST,
            };
            
            // Save to Firebase under: users/{email}/fitnessLogs/{date}/{time}
            push(ref(database, `users/${userEmail}/fitnessLogs/${dateIST}/${timeIST}`), fitnessLog)
                .then(() => {
                    alert("Fitness log saved successfully!");
                    fitnessForm.reset();
                })
                .catch((error) => {
                    alert("Error saving fitness log: " + error.message);
                });
        });
    }

    if (weightForm) {
        weightForm.addEventListener("submit", function (event) {
            event.preventDefault();
            
            // Get form data
            const currentWeight = document.getElementById("currentWeight").value.trim();
            const targetWeight = document.getElementById("targetWeight").value.trim();

            // Validate inputs
            if (!currentWeight || !targetWeight) {
                alert("Please fill in both weight fields before submitting.");
                return;
            }

            // Get current IST date & time
            const { fullTimestampIST, dateIST, timeIST } = getCurrentIST();

            // Create weight log object
            const weightLog = {
                currentWeight,
                targetWeight,
                fullTimestampIST,
            };
            
            // Save to Firebase under: users/{email}/weightLogs/{date}/{time}
            push(ref(database, `users/${userEmail}/weightLogs/${dateIST}/${timeIST}`), weightLog)
                .then(() => {
                    alert("Weight log saved successfully!");
                    weightForm.reset();
                })
                .catch((error) => {
                    alert("Error saving weight log: " + error.message);
                });
        });
    }
}
