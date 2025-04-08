// Import Firebase modules
import { auth, database, ref, set, get, onAuthStateChanged } from "./firebaseConfig.js";

// Format email to use as Firebase key
function formatEmail(email) {
    return email.toLowerCase().replace(/\./g, "_dot_").replace(/@/g, "_at_");
}

// Get today's date in yyyy-mm-dd
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// Save sleep data to Firebase
function saveSleepData(hours, quality) {
    const user = auth.currentUser;
    if (!user) return alert("User not logged in");

    const formattedEmail = formatEmail(user.email);
    const date = getTodayDate();
    const sleepRef = ref(database, `users/${formattedEmail}/sleep_tracking/${date}`);

    set(sleepRef, {
        hours,
        quality
    }).then(() => {
        alert("Sleep data saved successfully!");
        fetchAndDisplaySleepData();
    }).catch(err => {
        alert("Error saving data: " + err.message);
    });
}

// Fetch and analyze sleep data
function fetchAndDisplaySleepData() {
    const user = auth.currentUser;
    if (!user) return;

    const formattedEmail = formatEmail(user.email);
    const sleepRef = ref(database, `users/${formattedEmail}/sleep_tracking`);

    get(sleepRef).then(snapshot => {
        const data = snapshot.val();
        if (!data) return;

        const labels = [];
        const hoursData = [];

        Object.entries(data).forEach(([date, record]) => {
            labels.push(date);
            hoursData.push(record.hours);
        });

        renderChart(labels, hoursData);
    });
}

// Render chart using Chart.js
function renderChart(labels, data) {
    const ctx = document.getElementById("sleepChart").getContext("2d");
    if (window.sleepChart) window.sleepChart.destroy(); // reset if reloading

    window.sleepChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Sleep Hours',
                data,
                borderColor: '#6c5ce7',
                backgroundColor: 'rgba(108, 92, 231, 0.2)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index' }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Hours' } },
                x: { title: { display: true, text: 'Date' } }
            }
        }
    });
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            fetchAndDisplaySleepData();

            document.getElementById("saveSleepBtn").addEventListener("click", () => {
                const hours = parseFloat(document.getElementById("sleepHours").value);
                const quality = document.getElementById("sleepQuality").value;

                if (isNaN(hours) || hours <= 0) {
                    alert("Please enter valid sleep hours.");
                    return;
                }
                saveSleepData(hours, quality);
            });
        }
    });
});
