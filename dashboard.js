import { auth, database, ref, get, onAuthStateChanged } from "./firebaseConfig.js";

document.addEventListener('DOMContentLoaded', function () {
  loadSummaryData();
  setDailyQuote();
});

// Utility to format email
function formatEmail(email) {
  return email.toLowerCase().replace(/\./g, "_dot_").replace(/@/g, "_at_");
}

function loadSummaryData() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "tracker.html";
    } else {
      const formattedEmail = formatEmail(user.email);
      const sleepRef = ref(database, `users/${formattedEmail}/sleep`);
      const nutritionRef = ref(database, `users/${formattedEmail}/nutrition`);
      const activityRef = ref(database, `users/${formattedEmail}/activities`);

      Promise.all([get(sleepRef), get(nutritionRef), get(activityRef)])
        .then(([sleepSnap, nutritionSnap, activitySnap]) => {
          // ---------------------
          // Sleep Summary & Chart
          // ---------------------
          let sleepChartData = [0, 0, 0, 0, 0, 0, 0];
          if (sleepSnap.exists()) {
            const sleepData = Object.values(sleepSnap.val());
            const sleepDurations = [];
            const sleepPerDay = {};

            sleepData.forEach(entry => {
              let duration = entry.duration || 0;
              if (!duration && entry.sleepStart && entry.wakeTime) {
                const start = new Date(`1970-01-01T${entry.sleepStart}`);
                const end = new Date(`1970-01-02T${entry.wakeTime}`);
                duration = (end - start) / (1000 * 60 * 60);
              }

              if (duration > 0 && duration < 24) {
                sleepDurations.push(duration);
                const day = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' });
                sleepPerDay[day] = (sleepPerDay[day] || 0) + duration;
              }
            });

            const avgSleep = (sleepDurations.reduce((a, b) => a + b, 0) / sleepDurations.length).toFixed(1);
            document.getElementById('dashboardSleep').textContent = `${avgSleep} hrs`;

            const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            sleepChartData = weekDays.map(day => +(sleepPerDay[day]?.toFixed(1) || 0));
          } else {
            document.getElementById('dashboardSleep').textContent = `0 hrs`;
          }

          setupSleepChart(sleepChartData);

          // -------------------------
          // Nutrition Summary (Total)
          // -------------------------
          if (nutritionSnap.exists()) {
            const nutritionData = Object.values(nutritionSnap.val());
            const totalCalories = nutritionData.reduce((sum, entry) => sum + (entry.calories || 0), 0);
            document.getElementById('dashboardNutrition').textContent = `${totalCalories} cal`;
          } else {
            document.getElementById('dashboardNutrition').textContent = `0 cal`;
          }

          // -------------------------
          // Activity Summary & Chart
          // -------------------------
          let activityChartData = [0, 0, 0, 0, 0, 0, 0];
          if (activitySnap.exists()) {
            const activityData = Object.values(activitySnap.val());
            const totalMinutes = activityData.reduce((sum, entry) => sum + (entry.duration || 0), 0);
            document.getElementById('dashboardActivity').textContent = `${totalMinutes} min`;

            const activityPerDay = {};
            activityData.forEach(entry => {
              const day = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' });
              activityPerDay[day] = (activityPerDay[day] || 0) + (entry.duration || 0);
            });

            const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            activityChartData = weekDays.map(day => activityPerDay[day] || 0);
          } else {
            document.getElementById('dashboardActivity').textContent = `0 min`;
          }

          setupActivityChart(activityChartData);
        })
        .catch((error) => {
          console.error("Error fetching summary data:", error);
        });
    }
  });
}

// -------------------------
// Chart Setup Functions
// -------------------------
function setupSleepChart(sleepChartData) {
  const ctx = document.getElementById('dashboardSleepChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Hours Slept',
        data: sleepChartData,
        backgroundColor: 'rgba(66, 99, 235, 0.2)',
        borderColor: 'rgba(66, 99, 235, 1)',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: 'rgba(66, 99, 235, 1)',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 12,
          ticks: { stepSize: 1 },
          title: { display: true, text: 'Hours' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.raw} hours`;
            }
          }
        }
      }
    }
  });
}

function setupActivityChart(activityChartData) {
  const ctx = document.getElementById('dashboardActivityChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Exercise Minutes',
        data: activityChartData,
        backgroundColor: 'rgba(55, 178, 77, 0.7)',
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 120,
          title: { display: true, text: 'Minutes' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.raw} minutes`;
            }
          }
        }
      }
    }
  });
}

// -------------------------
// Daily Quote System
// -------------------------
function setDailyQuote() {
  const quotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
    { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
    { text: "The greatest wealth is health.", author: "Virgil" },
    { text: "It is health that is real wealth and not pieces of gold and silver.", author: "Mahatma Gandhi" },
    { text: "You're only one workout away from a good mood.", author: "Unknown" },
    { text: "Strength does not come from physical capacity. It comes from an indomitable will.", author: "Mahatma Gandhi" },
    { text: "Don't count the days, make the days count.", author: "Muhammad Ali" }
  ];
  const today = new Date();
  const dayOfYear = getDayOfYear(today);
  const quote = quotes[dayOfYear % quotes.length];

  document.querySelector('#quoteOfTheDay .quote-text').textContent = `"${quote.text}"`;
  document.querySelector('#quoteOfTheDay .quote-author').textContent = `— ${quote.author}`;
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
