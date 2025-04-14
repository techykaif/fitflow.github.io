

import { database,
    ref,
    get,
    child, firebaseConfig } from "../firebaseConfig.js";
import Chart from "https://cdn.jsdelivr.net/npm/chart.js";

// Format user email
function formatEmail(email) {
  return email.replace(/\./g, "_dot_").replace(/@/g, "_at_");
}

const user = JSON.parse(localStorage.getItem("currentUser"));
if (!user || !user.email) {
  window.location.href = "/login.html";
}
const formattedEmail = formatEmail(user.email);
document.getElementById("user-name1").textContent = user.name || "User";

// Sleep Summary
async function fetchSleepSummary() {
  const snapshot = await get(child(ref(db), `users/${formattedEmail}/sleepData`));
  if (snapshot.exists()) {
    const data = snapshot.val();
    const durations = Object.values(data).map(entry => parseFloat(entry.duration));
    const totalSleep = durations.reduce((sum, d) => sum + d, 0);
    const avgSleep = (totalSleep / durations.length).toFixed(1);

    document.getElementById("sleep-value").textContent = `${avgSleep} hrs`;
    renderChart("Sleep Duration", "sleepChart", durations);
  }
}

// Nutrition Summary
async function fetchNutritionSummary() {
  const snapshot = await get(child(ref(db), `users/${formattedEmail}/nutritionData`));
  if (snapshot.exists()) {
    const data = snapshot.val();
    const calories = Object.values(data).map(entry => parseInt(entry.calories));
    const totalCalories = calories.reduce((sum, c) => sum + c, 0);
    const avgCalories = Math.round(totalCalories / calories.length);

    document.getElementById("nutrition-value").textContent = `${avgCalories} kcal`;
    renderChart("Calories Intake", "nutritionChart", calories);
  }
}

// Activity Summary
async function fetchActivitySummary() {
  const snapshot = await get(child(ref(db), `users/${formattedEmail}/activityData`));
  if (snapshot.exists()) {
    const data = snapshot.val();
    const durations = Object.values(data).map(entry => parseFloat(entry.duration));
    const totalActivity = durations.reduce((sum, d) => sum + d, 0);
    const avgActivity = (totalActivity / durations.length).toFixed(1);

    document.getElementById("activity-value").textContent = `${avgActivity} hrs`;
    renderChart("Activity Time", "activityChart", durations);
  }
}

// Chart Renderer
function renderChart(title, canvasId, data) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map((_, i) => `Day ${i + 1}`),
      datasets: [
        {
          label: title,
          data,
          borderColor: "#9b87f5",
          backgroundColor: "rgba(155, 135, 245, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: "#7e69ab",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

// Init
function initDashboard() {
  fetchSleepSummary();
  fetchNutritionSummary();
  fetchActivitySummary();
}

initDashboard();
