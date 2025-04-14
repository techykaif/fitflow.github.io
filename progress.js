import {
    auth,
    database,
    ref,
    onAuthStateChanged,
    get
  } from "./firebaseConfig.js";
  
  document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, user => {
      if (!user) {
        window.location.href = "login.html";
      } else {
        const formattedEmail = formatEmail(user.email);
        fetchAllProgress(formattedEmail);
      }
    });
  });
  
  function formatEmail(email) {
    return email.toLowerCase().replace(/\./g, "_dot_").replace(/@/g, "_at_");
  }
  
  async function fetchAllProgress(formattedEmail) {
    try {
      const [sleepSnap, nutritionSnap, activitySnap] = await Promise.all([
        get(ref(database, `users/${formattedEmail}/sleepRecords`)),
        get(ref(database, `users/${formattedEmail}/nutritionRecords`)),
        get(ref(database, `users/${formattedEmail}/activityRecords`))
      ]);
  
      const sleepData = sleepSnap.exists() ? Object.entries(sleepSnap.val()) : [];
      const nutritionData = nutritionSnap.exists() ? Object.entries(nutritionSnap.val()) : [];
      const activityData = activitySnap.exists() ? Object.entries(activitySnap.val()) : [];
  
      renderSleepProgress(sleepData);
      renderNutritionProgress(nutritionData);
      renderActivityProgress(activityData);
    } catch (error) {
      console.error("Error fetching progress data:", error);
    }
  }
  
  function renderSleepProgress(data) {
    const labels = data.map(([date]) => formatDate(date));
    const values = data.map(([_, record]) => parseFloat(record.hours) || 0);
    const avg = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 0;
  
    new Chart(document.getElementById('sleepProgressChart'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Hours Slept',
          data: values,
          fill: true,
          backgroundColor: 'rgba(155, 135, 245, 0.2)',
          borderColor: '#9b87f5',
          tension: 0.4
        }]
      },
      options: chartOptions('Sleep (hrs)')
    });
  
    document.getElementById('sleepSummary').innerHTML = `Avg Sleep: <strong>${avg} hrs</strong>`;
  }
  
  function renderNutritionProgress(data) {
    const labels = data.map(([date]) => formatDate(date));
    const values = data.map(([_, record]) => parseFloat(record.calories) || 0);
    const avg = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(0) : 0;
  
    new Chart(document.getElementById('nutritionProgressChart'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Calories Intake',
          data: values,
          fill: true,
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          borderColor: '#4caf50',
          tension: 0.4
        }]
      },
      options: chartOptions('Calories (kcal)')
    });
  
    document.getElementById('nutritionSummary').innerHTML = `Avg Calories: <strong>${avg} kcal</strong>`;
  }
  
  function renderActivityProgress(data) {
    const labels = data.map(([date]) => formatDate(date));
    const values = data.map(([_, record]) => parseFloat(record.duration) || 0);
    const avg = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(0) : 0;
  
    new Chart(document.getElementById('activityProgressChart'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Active Minutes',
          data: values,
          fill: true,
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          borderColor: '#2196f3',
          tension: 0.4
        }]
      },
      options: chartOptions('Activity (mins)')
    });
  
    document.getElementById('activitySummary').innerHTML = `Avg Activity: <strong>${avg} mins</strong>`;
  }
  
  function formatDate(rawDate) {
    // Adjust this depending on how you store the date keys (e.g. "2025-04-14")
    const d = new Date(rawDate);
    return !isNaN(d) ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : rawDate;
  }
  
  function chartOptions(yLabel) {
    return {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: yLabel }
        },
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 0
          }
        }
      },
      plugins: {
        legend: { display: false }
      }
    };
  }
  