import { auth, database, onAuthStateChanged, ref, update, get, push, set } from "./firebaseConfig.js";

document.addEventListener('DOMContentLoaded', function () {
    // Set today's date as default for the date input
    document.getElementById('meal-date').valueAsDate = new Date();
    console.log('Default meal date set to today.');

    // Initialize Firebase
    let formattedEmail = '';

    // Format email for Firebase path (matching login.js approach)
    function formatEmail(email) {
        const formatted = email.toLowerCase().replace(/\./g, "_dot_").replace(/@/g, "_at_");
        console.log(`Formatted email: ${formatted}`);
        return formatted;
    }

    onAuthStateChanged(auth, (user) => {
        if (!user) {
            console.log('User  not authenticated, redirecting to tracker.html');
            window.location.href = "tracker.html";
        } else {
            formattedEmail = formatEmail(user.email);
            console.log(`User  authenticated: ${formattedEmail}`);
            loadMeals();
        }
    });

    // Initialize Chart.js charts
    let macroChart;
    let calorieChart;

    function initCharts() {
        console.log('Initializing charts...');
        // Macro distribution pie chart
        const macroCtx = document.getElementById('macro-chart').getContext('2d');
        macroChart = new Chart(macroCtx, {
            type: 'pie',
            data: {
                labels: ['Protein', 'Carbs', 'Fats'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(255, 99, 132, 0.7)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            generateLabels: function (chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map(function (label, i) {
                                        const meta = chart.getDatasetMeta(0);
                                        const style = meta.controller.getStyle(i);
                                        const value = chart.config.data.datasets[0].data[i];

                                        return {
                                            text: `${label}: ${value}g`,
                                            fillStyle: style.backgroundColor,
                                            strokeStyle: style.borderColor,
                                            lineWidth: style.borderWidth,
                                            hidden: isNaN(value) || meta.data[i].hidden,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value}g`;
                            }
                        }
                    }
                }
            }
        });

        // Calorie intake bar chart
        const calorieCtx = document.getElementById('calorie-chart').getContext('2d');
        calorieChart = new Chart(calorieCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Calories',
                    data: [],
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Calories (kcal)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
        console.log('Charts initialized successfully.');
    }

    // Initialize charts
    initCharts();

    // Handle form submission
    const mealForm = document.getElementById('meal-form');
    mealForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form values
        const mealType = document.getElementById('meal-type').value;
        const foodName = document.getElementById('food-name').value;
        const calories = parseInt(document.getElementById('calories').value);
        const protein = parseFloat(document.getElementById('protein').value);
        const carbs = parseFloat(document.getElementById('carbs').value);
        const fats = parseFloat(document.getElementById('fats').value);
        const mealDate = document.getElementById('meal-date').value;

        console.log(`Logging meal: ${mealType}, ${foodName}, ${calories} kcal, P: ${protein}g, C: ${carbs}g, F: ${fats}g on ${mealDate}`);

        // Create meal object
        const meal = {
            type: mealType,
            name: foodName,
            calories: calories,
            protein: protein,
            carbs: carbs,
            fats: fats,
            date: mealDate,
            timestamp: Date.now()
        };

        // Save to Firebase
        const mealRef = ref(database, `users/${formattedEmail}/nutrition`);
const newMealRef = push(mealRef);
set(newMealRef, meal)
    .then(() => {
        console.log('Meal logged successfully:', meal);
        mealForm.reset();
        document.getElementById('meal-date').valueAsDate = new Date();
        alert('Meal logged successfully!');
        loadMeals();
    })
    .catch(error => {
        console.error('Error logging meal:', error);
        alert('Error logging meal. Please try again.');
    });

    });

    // Load meals from Firebase
    function loadMeals() {
        const mealLog = document.getElementById('meal-log');
        mealLog.innerHTML = '<div class="loading-meals">Loading your meal data...</div>';
        console.log('Loading meals from Firebase...');

        const mealRef = ref(database, `users/${formattedEmail}/nutrition`);
        get(mealRef)
            .then(snapshot => {
                const meals = [];
                snapshot.forEach(childSnapshot => {
                    const meal = childSnapshot.val();
                    meal.id = childSnapshot.key;
                    meals.push(meal);
                });
        
                console.log(`Loaded ${meals.length} meals from Firebase.`);
        
                if (meals.length === 0) {
                    mealLog.innerHTML = '<div class="no-meals">No meals logged yet. Start tracking your nutrition above!</div>';
                    updateDateFilter([]);
                    updateCharts(meals);
                    return;
                }
        
                // Sort meals by date (newest first) and then by timestamp
                meals.sort((a, b) => {
                    if (a.date === b.date) {
                        return b.timestamp - a.timestamp;
                    }
                    return new Date(b.date) - new Date(a.date);
                });
        
                const uniqueDates = [...new Set(meals.map(meal => meal.date))];
                updateDateFilter(uniqueDates);
                filterAndDisplayMeals(meals);
                updateCharts(meals);
            })
            .catch(error => {
                console.error('Error loading meals:', error);
                mealLog.innerHTML = '<div class="loading-error">Error loading meals. Please refresh the page.</div>';
            });
        
    }

    // Update date filter dropdown
    function updateDateFilter(dates) {
        const dateFilter = document.getElementById('date-filter');

        // Save current selection
        const currentSelection = dateFilter.value;

        // Clear options except "All Dates"
        while (dateFilter.options.length > 1) {
            dateFilter.remove(1);
        }

        // Add date options
        dates.forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = formatDate(date);
            dateFilter.appendChild(option);
        });

        // Restore selection if it still exists
        if (dates.includes(currentSelection)) {
            dateFilter.value = currentSelection;
        }
        console.log(`Updated date filter with ${dates.length} options.`);
    }

    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }

    // Filter and display meals
    function filterAndDisplayMeals(meals) {
        const dateFilter = document.getElementById('date-filter').value;
        const mealFilter = document.getElementById('meal-filter').value;
        const searchFilter = document.getElementById('food-search').value.toLowerCase();

        console.log(`Filtering meals with date: ${dateFilter}, type: ${mealFilter}, search: ${searchFilter}`);

        // Apply filters
        let filteredMeals = meals;

        if (dateFilter !== 'all') {
            filteredMeals = filteredMeals.filter(meal => meal.date === dateFilter);
        }

        if (mealFilter !== 'all') {
            filteredMeals = filteredMeals.filter(meal => meal.type === mealFilter);
        }

        if (searchFilter) {
            filteredMeals = filteredMeals.filter(meal =>
                meal.name.toLowerCase().includes(searchFilter)
            );
        }

        console.log(`Filtered meals count: ${filteredMeals.length}`);
        // Display filtered meals
        displayMeals(filteredMeals);
    }

    // Display meals grouped by date
    function displayMeals(meals) {
        const mealLog = document.getElementById('meal-log');

        if (meals.length === 0) {
            mealLog.innerHTML = '<div class="no-meals">No meals match your filters. Try adjusting your search criteria.</div>';
            return;
        }

        mealLog.innerHTML = '';

        // Group meals by date
        const mealsByDate = {};
        meals.forEach(meal => {
            if (!mealsByDate[meal.date]) {
                mealsByDate[meal.date] = [];
            }
            mealsByDate[meal.date].push(meal);
        });

        // Display meals by date
        Object.keys(mealsByDate).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
            const dateGroup = document.createElement('div');
            dateGroup.className = 'date-group';

            // Calculate daily totals
            const dailyMeals = mealsByDate[date];
            const totalCalories = dailyMeals.reduce((sum, meal) => sum + meal.calories, 0);
            const totalProtein = dailyMeals.reduce((sum, meal) => sum + meal.protein, 0);
            const totalCarbs = dailyMeals.reduce((sum, meal) => sum + meal.carbs, 0);
            const totalFats = dailyMeals.reduce((sum, meal) => sum + meal.fats, 0);

            // Create date header
            const dateHeader = document.createElement('div');
            dateHeader.className = 'date-header';
            dateHeader.innerHTML = `
                <div>${formatDate(date)}</div>
                <div class="date-total">
                    Total: ${totalCalories} kcal (P: ${totalProtein.toFixed(1)}g, C: ${totalCarbs.toFixed(1)}g, F: ${totalFats.toFixed(1)}g)
                </div>
            `;
            dateGroup.appendChild(dateHeader);

            // Add meals for this date
            dailyMeals.forEach(meal => {
                const mealItem = document.createElement('div');
                mealItem.className = 'meal-item';
                mealItem.innerHTML = `
                    <div class="meal-type ${meal.type}">${meal.type}</div>
                    <div class="meal-details">
                        <h3>${meal.name}</h3>
                        <div class="meal-macros">
                            <span class="meal-calories">${meal.calories} kcal</span>
                            <span>P: ${meal.protein}g</span>
                            <span>C: ${meal.carbs}g</span>
                            <span>F: ${meal.fats}g</span>
                        </div>
                    </div>
                    <div class="meal-actions">
                        <button class="edit-btn" data-id="${meal.id}">✏️</button>
                        <button class="delete-btn" data-id="${meal.id}">🗑️</button>
                    </div>
                `;

                dateGroup.appendChild(mealItem);

                // Add event listeners for edit and delete buttons
                mealItem.querySelector('.delete-btn').addEventListener('click', function () {
                    if (confirm('Are you sure you want to delete this meal?')) {
                        deleteMeal(meal.id);
                    }
                });

                mealItem.querySelector('.edit-btn').addEventListener('click', function () {
                    editMeal(meal);
                });
            });

            mealLog.appendChild(dateGroup);
        });
    }

    // Delete meal
    function deleteMeal(mealId) {
        console.log(`Deleting meal with ID: ${mealId}`);
        database.ref(`users/${formattedEmail}/nutrition/${mealId}`).remove()
            .then(() => {
                alert('Meal deleted successfully!');
                loadMeals();
            })
            .catch(error => {
                console.error('Error deleting meal:', error);
                alert('Error deleting meal. Please try again.');
            });
    }

    // Edit meal
    function editMeal(meal) {
        console.log(`Editing meal: ${meal.name}`);
        // Fill form with meal data
        document.getElementById('meal-type').value = meal.type;
        document.getElementById('food-name').value = meal.name;
        document.getElementById('calories').value = meal.calories;
        document.getElementById('protein').value = meal.protein;
        document.getElementById('carbs').value = meal.carbs;
        document.getElementById('fats').value = meal.fats;
        document.getElementById('meal-date').value = meal.date;

        // Change button text
        const submitBtn = document.querySelector('.log-meal-btn');
        submitBtn.textContent = 'Update Meal';

        // Store meal ID in a data attribute
        submitBtn.dataset.editId = meal.id;

        // Scroll to form
        document.querySelector('.meal-form-container').scrollIntoView({ behavior: 'smooth' });

        // Change form submission handler
        mealForm.onsubmit = function (e) {
            e.preventDefault();

            // Get form values
            const mealType = document.getElementById('meal-type').value;
            const foodName = document.getElementById('food-name').value;
            const calories = parseInt(document.getElementById('calories').value);
            const protein = parseFloat(document.getElementById('protein').value);
            const carbs = parseFloat(document.getElementById('carbs').value);
            const fats = parseFloat(document.getElementById('fats').value);
            const mealDate = document.getElementById('meal-date').value;

            // Create updated meal object
            const updatedMeal = {
                type: mealType,
                name: foodName,
                calories: calories,
                protein: protein,
                carbs: carbs,
                fats: fats,
                date: mealDate,
                timestamp: meal.timestamp,
                updated: Date.now()
            };

            console.log(`Updating meal: ${updatedMeal.name}`);
            // Update in Firebase
            database.ref(`users/${formattedEmail}/nutrition/${meal.id}`).update(updatedMeal)
                .then(() => {
                    // Reset form
                    mealForm.reset();
                    document.getElementById('meal-date').valueAsDate = new Date();

                    // Reset button text
                    submitBtn.textContent = 'Log Meal';
                    delete submitBtn.dataset.editId;

                    // Reset form submission handler
                    mealForm.onsubmit = null;

                    // Show success message
                    alert('Meal updated successfully!');

                    // Refresh meals list
                    loadMeals();
                })
                .catch(error => {
                    console.error('Error updating meal:', error);
                    alert('Error updating meal. Please try again.');
                });
        };
    }

    // Update charts with meal data
    function updateCharts(meals) {
        console.log('Updating charts with meal data...');
        // Calculate total macros for pie chart
        const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
        const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
        const totalFats = meals.reduce((sum, meal) => sum + meal.fats, 0);

        // Update macro chart
        macroChart.data.datasets[0].data = [
            parseFloat(totalProtein.toFixed(1)),
            parseFloat(totalCarbs.toFixed(1)),
            parseFloat(totalFats.toFixed(1))
        ];
        macroChart.update();
        console.log('Macro chart updated:', macroChart.data.datasets[0].data);

        // Get last 7 days for calorie chart
        const last7Days = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }

        // Calculate calories per day
        const caloriesPerDay = {};
        last7Days.forEach(day => {
            caloriesPerDay[day] = 0;
        });

        meals.forEach(meal => {
            if (last7Days.includes(meal.date)) {
                caloriesPerDay[meal.date] += meal.calories;
            }
        });

        // Update calorie chart
        calorieChart.data.labels = last7Days.map(day => {
            const date = new Date(day);
            return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
        });

        calorieChart.data.datasets[0].data = last7Days.map(day => caloriesPerDay[day]);
        calorieChart.update();
        console.log('Calorie chart updated:', calorieChart.data.datasets[0].data);
    }

    // Event listeners for filters
    document.getElementById('date-filter').addEventListener('change', function () {
        console.log('Date filter changed, loading meals...');
        loadMeals();
    });

    document.getElementById('meal-filter').addEventListener('change', function () {
        console.log('Meal filter changed, loading meals...');
        loadMeals();
    });

    document.getElementById('food-search').addEventListener('input', function () {
        console.log('Food search input changed, loading meals...');
        loadMeals();
    });

    // Load meals on page load
    loadMeals();
});