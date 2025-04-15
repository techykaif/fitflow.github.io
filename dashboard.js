document.addEventListener('DOMContentLoaded', function() {
  // Initialize dashboard components
  loadSummaryData();
  setupCharts();
  setDailyQuote();
});

// --------------------------------
// Summary Cards Data
// --------------------------------
function loadSummaryData() {
  // In a real application, this would fetch data from an API or database
  // For now, we're using placeholder data
  document.getElementById('dashboardSleep').textContent = '7.5 hrs';
  document.getElementById('dashboardNutrition').textContent = '1,850 cal';  
  document.getElementById('dashboardActivity').textContent = '45 min';
}

// --------------------------------
// Chart.js Setup
// --------------------------------
function setupCharts() {
  // Setup Sleep Chart
  const sleepCtx = document.getElementById('dashboardSleepChart').getContext('2d');
  const sleepChart = new Chart(sleepCtx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Hours Slept',
        data: [7.2, 6.5, 8.1, 7.6, 6.9, 8.3, 7.5],
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
          beginAtZero: false,
          min: 5,
          max: 10,
          ticks: {
            stepSize: 1
          },
          title: {
            display: true,
            text: 'Hours'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.raw} hours`;
            }
          }
        }
      }
    }
  });

  // Setup Activity Chart
  const activityCtx = document.getElementById('dashboardActivityChart').getContext('2d');
  const activityChart = new Chart(activityCtx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Exercise Minutes',
        data: [30, 45, 60, 0, 30, 90, 45],
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
          max: 100,
          title: {
            display: true,
            text: 'Minutes'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.raw} minutes`;
            }
          }
        }
      }
    }
  });
}

// --------------------------------
// Quote of the Day System
// --------------------------------
function setDailyQuote() {
  const quotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
    { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
    { text: "Physical fitness is not only one of the most important keys to a healthy body, it is the basis of dynamic and creative intellectual activity.", author: "John F. Kennedy" },
    { text: "The greatest wealth is health.", author: "Virgil" },
    { text: "It is health that is real wealth and not pieces of gold and silver.", author: "Mahatma Gandhi" },
    { text: "Early to bed and early to rise makes a man healthy, wealthy, and wise.", author: "Benjamin Franklin" },
    { text: "The first wealth is health.", author: "Ralph Waldo Emerson" },
    { text: "To keep the body in good health is a duty, otherwise we shall not be able to keep our mind strong and clear.", author: "Buddha" },
    { text: "Your health is an investment, not an expense.", author: "Unknown" },
    { text: "You're only one workout away from a good mood.", author: "Unknown" },
    { text: "Strength does not come from physical capacity. It comes from an indomitable will.", author: "Mahatma Gandhi" },
    { text: "The difference between the impossible and the possible lies in a person's determination.", author: "Tommy Lasorda" },
    { text: "Don't count the days, make the days count.", author: "Muhammad Ali" }
  ];
  
  // Use the current date as a seed to select a quote
  // This ensures the same quote shows each day but changes day to day
  const today = new Date();
  const dayOfYear = getDayOfYear(today);
  const quoteIndex = dayOfYear % quotes.length;
  const todaysQuote = quotes[quoteIndex];
  
  // Update the quote in the DOM
  document.querySelector('#quoteOfTheDay .quote-text').textContent = `"${todaysQuote.text}"`;
  document.querySelector('#quoteOfTheDay .quote-author').textContent = `— ${todaysQuote.author}`;
}

// Helper function to get day of year (1-366)
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}