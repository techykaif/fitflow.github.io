// ========================= DOM Elements ========================= //
// Buttons
const addActivityBtn = document.querySelector('.add-activity-btn');
const closeModalBtn = document.querySelector('.close-modal');
const cancelBtn = document.querySelector('.cancel-btn');

// Modal & Form
const modal = document.getElementById('activity-modal');
const activityForm = document.getElementById('activity-form');
const activitiesList = document.getElementById('activities-list');

// Stats Elements
const stepsValue = document.getElementById('steps-value');
const caloriesValue = document.getElementById('calories-value');
const distanceValue = document.getElementById('distance-value');
const activeValue = document.getElementById('active-value');

// Progress Bars
const stepsProgress = document.getElementById('steps-progress');
const caloriesProgress = document.getElementById('calories-progress');
const distanceProgress = document.getElementById('distance-progress');
const activeProgress = document.getElementById('active-progress');

// Chart Bars
const chartBars = document.querySelectorAll('.chart-bar');

// ========================= Data ========================= //
// User data with default values
const userData = {
    steps: 0,
    calories: 0,
    distance: 0,
    activeMinutes: 0,
    goals: { steps: 10000, calories: 2500, distance: 5, activeMinutes: 60 }
};

// Sample activity data
const sampleActivities = [
    { type: 'Running', duration: 45, distance: 5.2, calories: 450, date: '2023-04-01' },
    { type: 'Cycling', duration: 60, distance: 15, calories: 500, date: '2023-04-02' },
    { type: 'Walking', duration: 30, distance: 2.5, calories: 200, date: '2023-04-03' },
    { type: 'Gym', duration: 75, distance: 0, calories: 350, date: '2023-04-04' }
];

// Weekly data for chart
const weeklyData = [30, 45, 25, 60, 35, 50, 40];

// ========================= Functions ========================= //
// Initialize the dashboard
function initDashboard() {
    simulateDataLoading();
    renderActivities();
    initWeeklyChart();
}

// Simulate data loading with animation
function simulateDataLoading() {
    let count = 0;
    const interval = setInterval(() => {
        count += 1;
        const progress = count / 100;

        updateProgressUI(progress);

        if (count >= 100) clearInterval(interval);
    }, 20);
}

// Update UI elements and progress bars
function updateProgressUI(progress) {
    // Update values
    const steps = Math.floor(userData.goals.steps * progress);
    const calories = Math.floor(userData.goals.calories * progress);
    const distance = (userData.goals.distance * progress).toFixed(1);
    const activeMinutes = Math.floor(userData.goals.activeMinutes * progress);

    // Update UI
    stepsValue.textContent = steps.toLocaleString();
    caloriesValue.textContent = calories.toLocaleString();
    distanceValue.textContent = `${distance} km`;
    activeValue.textContent = `${activeMinutes} min`;

    // Update progress bars
    stepsProgress.style.width = `${progress * 100}%`;
    caloriesProgress.style.width = `${progress * 100}%`;
    distanceProgress.style.width = `${progress * 100}%`;
    activeProgress.style.width = `${progress * 100}%`;

    // Update user data
    Object.assign(userData, { steps, calories, distance: parseFloat(distance), activeMinutes });
}

// Initialize weekly chart
function initWeeklyChart() {
    chartBars.forEach((bar, index) => {
        const value = weeklyData[index];
        const maxValue = Math.max(...weeklyData);
        const height = (value / maxValue) * 180; // Max height = 180px
        bar.dataset.value = value;

        setTimeout(() => {
            bar.querySelector('.bar-fill').style.height = `${height}px`;
        }, 100 * index);
    });
}

// Render activities list
function renderActivities() {
    activitiesList.innerHTML = '';

    sampleActivities.forEach(activity => {
        const formattedDate = new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            ${getActivityEmoji(activity.type)}
            ${activity.type}
            ${formattedDate}
            Duration: ${activity.duration} min
            Distance: ${activity.distance} km
            Calories: ${activity.calories}
        `;
        activitiesList.appendChild(activityItem);
    });
}

// Get emoji for activity type
function getActivityEmoji(type) {
    const emojis = { 'Running': '🏃', 'Walking': '👟', 'Cycling': '🚴', 'Swimming': '🏊', 'Gym': '🏋️', 'Yoga': '🧘' };
    return emojis[type] || '🏃';
}

// ========================= Event Listeners ========================= //
// Open modal
addActivityBtn.addEventListener('click', () => modal.classList.add('active'));

// Close modal
closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (!e.target.closest('.modal-content')) {
        modal.classList.remove('active');
    }
});


// Handle form submission
activityForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get input values
    const type = document.getElementById('activity-type').value;
    const duration = parseInt(document.getElementById('activity-duration').value);
    const distance = parseFloat(document.getElementById('activity-distance').value) || 0;
    const calories = parseInt(document.getElementById('activity-calories').value) || 0;
    const date = document.getElementById('activity-date').value;
    const notes = document.getElementById('activity-notes').value;

    // Create new activity
    const newActivity = { type, duration, distance, calories, date, notes };
    sampleActivities.unshift(newActivity);

    // Update user data
    userData.steps += Math.floor(distance * 1300); // Approx steps per km
    userData.calories += calories;
    userData.distance += distance;
    userData.activeMinutes += duration;

    // Update UI
    updateProgressUI(1);
    renderActivities();

    // Close modal and reset form
    modal.classList.remove('active');
    activityForm.reset();
});

// ========================= Mobile Sidebar Toggle ========================= //
// ========================= Mobile Sidebar Toggle ========================= //
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const sidebar = document.querySelector('.sidebar');

    // Create Hamburger Menu Button
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger-menu';
    hamburger.innerHTML = '☰';
    hamburger.style.cssText = `
        display: none;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        margin-right: 15px;
    `;
    header.prepend(hamburger);

    // Create Close Button for Sidebar
    const closeSidebarBtn = document.createElement('button');
    closeSidebarBtn.className = 'close-sidebar-btn';
    closeSidebarBtn.innerHTML = '❌';
    closeSidebarBtn.style.cssText = `
        display: none;
        position: absolute;
        top: 25px;
        right: 15px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
    `;
    sidebar.prepend(closeSidebarBtn);

    const mediaQuery = window.matchMedia('(max-width: 768px)');

    function handleScreenChange(e) {
        if (e.matches) {
            hamburger.style.display = 'block';
            closeSidebarBtn.style.display = 'block';
        } else {
            hamburger.style.display = 'none';
            closeSidebarBtn.style.display = 'none';
            sidebar.classList.remove('active');
        }
    }

    mediaQuery.addEventListener('change', handleScreenChange);
    handleScreenChange(mediaQuery);

    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });

    // Initialize dashboard
    initDashboard();

    // Set default activity date
    document.getElementById('activity-date').value = new Date().toISOString().split('T')[0];
});
