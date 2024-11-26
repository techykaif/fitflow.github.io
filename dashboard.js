// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";

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

// Reference to the Firebase Realtime Database
const fitnessLogRef = ref(db, "fitnessLogs");
const weightLogRef = ref(db, "weightLogs");

// Function to store fitness log
document.getElementById("fitnessLogForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Get form data
    const steps = document.getElementById("steps").value;
    const exercises = document.getElementById("exercises").value;
    const meals = document.getElementById("meals").value;
    const mealType = document.getElementById("mealType").value;
    const portionSize = document.getElementById("portionSize").value;
    const ingredients = document.getElementById("ingredients").value;

    // Create an object to store the fitness log
    const fitnessLog = {
        steps,
        exercises,
        meals,
        mealType,
        portionSize,
        ingredients,
        timestamp: new Date().toISOString()
    };

    // Push fitness log to Firebase
    push(fitnessLogRef, fitnessLog)
        .then(() => {
            alert("Fitness log saved successfully!");
            document.getElementById("fitnessLogForm").reset(); // Reset the form
        })
        .catch((error) => {
            console.error("Error saving fitness log: ", error);
        });
});

// Function to store weight log
document.getElementById("weightLogForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Get form data
    const currentWeight = document.getElementById("currentWeight").value;
    const targetWeight = document.getElementById("targetWeight").value;

    // Create an object to store the weight log
    const weightLog = {
        currentWeight,
        targetWeight,
        timestamp: new Date().toISOString()
    };

    // Push weight log to Firebase
    push(weightLogRef, weightLog)
        .then(() => {
            alert("Weight log saved successfully!");
            document.getElementById("weightLogForm").reset(); // Reset the form
        })
        .catch((error) => {
            console.error("Error saving weight log: ", error);
        });
});
