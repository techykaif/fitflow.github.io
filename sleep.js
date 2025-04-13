<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
document.addEventListener("DOMContentLoaded", () => {
  const sleepDate = document.getElementById("sleepDate");
  const sleepStart = document.getElementById("sleepStart");
  const wakeTime = document.getElementById("wakeTime");
  const calculatedHours = document.getElementById("calculatedHours");
  const saveBtn = document.getElementById("saveSleepBtn");

  // Set default date to today
  sleepDate.valueAsDate = new Date();

  function calculateSleepDuration() {
    const start = sleepStart.value;
    const end = wakeTime.value;
    if (start && end) {
      const [h1, m1] = start.split(":").map(Number);
      const [h2, m2] = end.split(":").map(Number);
      let startDate = new Date(0, 0, 0, h1, m1);
      let endDate = new Date(0, 0, 0, h2, m2);
      if (endDate <= startDate) endDate.setDate(endDate.getDate() + 1); // next day
      const diff = (endDate - startDate) / 1000 / 60 / 60;
      calculatedHours.value = diff.toFixed(2);
    }
  }

  sleepStart.addEventListener("change", calculateSleepDuration);
  wakeTime.addEventListener("change", calculateSleepDuration);

  saveBtn.addEventListener("click", () => {
    const data = {
      date: sleepDate.value,
      sleepStart: sleepStart.value,
      wakeTime: wakeTime.value,
      sleepHours: parseFloat(calculatedHours.value),
      sleepQuality: document.getElementById("sleepQuality").value,
      notes: document.getElementById("sleepNotes").value.trim()
    };

    console.log("Saving sleep data:", data);
    // TODO: Save to Firebase using current user's formatted email
  });

  // Dummy Chart Init
  const ctx = document.getElementById("sleepChart").getContext("2d");
  const sleepChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [], // will be populated dynamically
      datasets: [{
        label: 'Sleep Hours',
        data: [],
        borderColor: '#42a5f5',
        backgroundColor: 'rgba(66, 165, 245, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 10
        }
      }
    }
  });

  // TODO: Fetch data from Firebase and update chart dynamically
});

