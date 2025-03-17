// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
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

// Function to format email for Firebase path
function formatEmail(email) {
    return email.replace(/\./g, "_dot_").replace(/@/g, "_at_");
}

// Ensure DOM is Loaded before Adding Event Listeners
document.addEventListener("DOMContentLoaded", function () {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const formattedEmail = formatEmail(user.email);
            setupFormListeners(formattedEmail);
        }
    });
});

function setupFormListeners(userEmail) {
    const fitnessForm = document.getElementById("fitnessLogForm");
    const weightForm = document.getElementById("weightLogForm");

    if (fitnessForm) {
        fitnessForm.addEventListener("submit", function (event) {
            event.preventDefault();
            
            // Get form data
            const steps = document.getElementById("steps").value;
            const exercises = document.getElementById("exercises").value;
            const meals = document.getElementById("meals").value;
            const mealType = document.getElementById("mealType").value;
            const portionSize = document.getElementById("portionSize").value;
            const ingredients = document.getElementById("ingredients").value;
            
            // Get current date and time in IST
            const now = new Date();
            const nowIST = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            const dateIST = nowIST.toISOString().split("T")[0];
            const timeIST = nowIST.toTimeString().split(" ")[0].replace(/:/g, "-");
            
            // Create an object to store the fitness log
            const fitnessLog = {
                steps,
                exercises,
                meals,
                mealType,
                portionSize,
                ingredients,
                fullTimestampIST: nowIST.toISOString(),
            };
            
            // Push data under the formatted email with IST date & time
            push(ref(db, `users/${userEmail}/fitnessLogs/${dateIST}/${timeIST}`), fitnessLog)
                .then(() => {
                    alert("Fitness log saved successfully!");
                    fitnessForm.reset();
                });
        });
    }

    if (weightForm) {
        weightForm.addEventListener("submit", function (event) {
            event.preventDefault();
            
            // Get form data
            const currentWeight = document.getElementById("currentWeight").value;
            const targetWeight = document.getElementById("targetWeight").value;
            
            // Get current date and time in IST
            const now = new Date();
            const nowIST = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            const dateIST = nowIST.toISOString().split("T")[0];
            const timeIST = nowIST.toTimeString().split(" ")[0].replace(/:/g, "-");
            
            // Create an object to store the weight log
            const weightLog = {
                currentWeight,
                targetWeight,
                fullTimestampIST: nowIST.toISOString(),
            };
            
            // Push data under the formatted email with IST date & time
            push(ref(db, `users/${userEmail}/weightLogs/${dateIST}/${timeIST}`), weightLog)
                .then(() => {
                    alert("Weight log saved successfully!");
                    weightForm.reset();
                });
        });
    }
}
