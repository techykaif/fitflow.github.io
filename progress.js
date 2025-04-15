
// Import Firebase configuration
import { auth, database, onAuthStateChanged, ref, get } from "./firebaseConfig.js"

document.addEventListener("DOMContentLoaded", () => {
  let formattedEmail = ""
  let currentTimeRange = "week"
  let sleepData = []
  let nutritionData = []
  let activityData = []

  // Chart instances
  let sleepChart = null
  let nutritionChart = null
  let activityChart = null
  let combinedChart = null

  // Format email for Firebase path
  function formatEmail(email) {
    return email.toLowerCase().replace(/\./g, "_dot_").replace(/@/g, "_at_")
  }

  // Check if user is logged in
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "tracker.html"
    } else {
      formattedEmail = formatEmail(user.email)
      initializePage()
    }
  })

  // Initialize page
  function initializePage() {
    // Set up notification dropdown
    const bellIcon = document.getElementById("bellIcon")
    const loginHistory = document.getElementById("login-history")

    if (bellIcon) {
      bellIcon.addEventListener("click", () => {
        loginHistory.classList.toggle("hidden")
      })
    }

    // Set up time range buttons
    const timeButtons = document.querySelectorAll(".time-btn")
    timeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        timeButtons.forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")
        currentTimeRange = btn.dataset.range
        loadAllData()
      })
    })

    // Set up insight modals
    setupInsightModals()

    // Load initial data
    loadAllData()

    // Load achievements
    loadAchievements()
  }

  // Load all data based on current time range
  function loadAllData() {
    loadSleepData()
    loadNutritionData()
    loadActivityData()
  }

  // Load sleep data from Firebase
  function loadSleepData() {
    const sleepRef = ref(database, `users/${formattedEmail}/sleep`)

    get(sleepRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          sleepData = []
          snapshot.forEach((childSnapshot) => {
            sleepData.push({
              id: childSnapshot.key,
              ...childSnapshot.val(),
            })
          })

          // Sort by date
          sleepData.sort((a, b) => new Date(a.date) - new Date(b.date))

          // Filter by time range
          sleepData = filterDataByTimeRange(sleepData)

          // Update sleep chart
          updateSleepChart()

          // Update sleep summary
          updateSleepSummary()

          // Update overview stats
          updateOverviewStats()
        } else {
          // No sleep data
          document.getElementById("sleepSummary").textContent = "No sleep data available for this time period."
          initializeSleepChart()
        }
      })
      .catch((error) => {
        console.error("Error loading sleep data:", error)
        document.getElementById("sleepSummary").textContent = "Error loading sleep data. Please try again."
      })
  }

  // Load nutrition data from Firebase
  function loadNutritionData() {
    const nutritionRef = ref(database, `users/${formattedEmail}/nutrition`)

    get(nutritionRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          nutritionData = []
          snapshot.forEach((childSnapshot) => {
            nutritionData.push({
              id: childSnapshot.key,
              ...childSnapshot.val(),
            })
          })

          // Sort by date
          nutritionData.sort((a, b) => new Date(a.date) - new Date(b.date))

          // Filter by time range
          nutritionData = filterDataByTimeRange(nutritionData)

          // Update nutrition chart
          updateNutritionChart()

          // Update nutrition summary
          updateNutritionSummary()

          // Update overview stats
          updateOverviewStats()
        } else {
          // No nutrition data
          document.getElementById("nutritionSummary").textContent = "No nutrition data available for this time period."
          initializeNutritionChart()
        }
      })
      .catch((error) => {
        console.error("Error loading nutrition data:", error)
        document.getElementById("nutritionSummary").textContent = "Error loading nutrition data. Please try again."
      })
  }

  // Load activity data from Firebase
  function loadActivityData() {
    const activityRef = ref(database, `users/${formattedEmail}/activities`)

    get(activityRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          activityData = []
          snapshot.forEach((childSnapshot) => {
            activityData.push({
              id: childSnapshot.key,
              ...childSnapshot.val(),
            })
          })

          // Sort by date
          activityData.sort((a, b) => new Date(a.date) - new Date(b.date))

          // Filter by time range
          activityData = filterDataByTimeRange(activityData)

          // Update activity chart
          updateActivityChart()

          // Update activity summary
          updateActivitySummary()

          // Update overview stats
          updateOverviewStats()

          // Update combined chart
          updateCombinedChart()
        } else {
          // No activity data
          document.getElementById("activitySummary").textContent = "No activity data available for this time period."
          initializeActivityChart()
        }
      })
      .catch((error) => {
        console.error("Error loading activity data:", error)
        document.getElementById("activitySummary").textContent = "Error loading activity data. Please try again."
      })
  }

  // Filter data by selected time range
  function filterDataByTimeRange(data) {
    const today = new Date()
    let startDate

    switch (currentTimeRange) {
      case "week":
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 7)
        break
      case "month":
        startDate = new Date(today)
        startDate.setMonth(today.getMonth() - 1)
        break
      case "year":
        startDate = new Date(today)
        startDate.setFullYear(today.getFullYear() - 1)
        break
      default:
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 7)
    }

    return data.filter((item) => new Date(item.date) >= startDate)
  }

  // Sleep Chart Functions
  function initializeSleepChart() {
    const ctx = document.getElementById("sleepProgressChart").getContext("2d")

    if (sleepChart) {
      sleepChart.destroy()
    }

    sleepChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Sleep Duration (hours)",
            data: [],
            backgroundColor: "rgba(106, 17, 203, 0.2)",
            borderColor: "rgba(106, 17, 203, 1)",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Hours",
            },
          },
          x: {
            title: {
              display: true,
              text: "Date",
            },
          },
        },
      },
    })
  }

  function updateSleepChart() {
    if (!sleepChart) {
      initializeSleepChart()
    }

    const labels = []
    const durations = []
    const qualities = []

    sleepData.forEach((record) => {
      labels.push(formatDateForDisplay(record.date))
      durations.push(record.duration)

      // Map quality to numeric value
      const qualityMap = { Poor: 1, Average: 2, Good: 3, Excellent: 4 }
      qualities.push(qualityMap[record.quality] || 0)
    })

    sleepChart.data.labels = labels
    sleepChart.data.datasets[0].data = durations

    // Add quality dataset if we have quality data
    if (qualities.some((q) => q > 0)) {
      if (sleepChart.data.datasets.length < 2) {
        sleepChart.data.datasets.push({
          label: "Sleep Quality",
          data: qualities,
          backgroundColor: "rgba(237, 137, 54, 0.2)",
          borderColor: "rgba(237, 137, 54, 1)",
          borderWidth: 2,
          tension: 0.3,
          fill: false,
          yAxisID: "quality",
        })

        // Add second y-axis for quality
        sleepChart.options.scales.quality = {
          type: "linear",
          position: "right",
          min: 0,
          max: 5,
          title: {
            display: true,
            text: "Quality",
          },
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            stepSize: 1,
            callback: (value) => {
              const qualityLabels = ["", "Poor", "Average", "Good", "Excellent"]
              return qualityLabels[value] || ""
            },
          },
        }
      } else {
        sleepChart.data.datasets[1].data = qualities
      }
    }

    sleepChart.update()
  }

  function updateSleepSummary() {
    if (sleepData.length === 0) {
      document.getElementById("sleepSummary").textContent = "No sleep data available for this time period."
      return
    }

    const avgDuration = calculateAverageSleepDuration()
    const consistencyScore = calculateSleepConsistency()
    const qualityDistribution = calculateQualityDistribution(sleepData, "quality")

    let summary = `Over the past ${getTimeRangeText()}, you've slept an average of ${formatDuration(avgDuration)} per night. `

    if (consistencyScore < 15) {
      summary += `Your sleep schedule has been very consistent (${consistencyScore}% variation). `
    } else if (consistencyScore < 30) {
      summary += `Your sleep schedule has been somewhat consistent (${consistencyScore}% variation). `
    } else {
      summary += `Your sleep schedule has been quite variable (${consistencyScore}% variation). `
    }

    // Add quality info if available
    if (qualityDistribution.total > 0) {
      const goodPercentage = Math.round(
        ((qualityDistribution.Good + qualityDistribution.Excellent) / qualityDistribution.total) * 100,
      )
      summary += `You rated your sleep as Good or Excellent ${goodPercentage}% of the time.`
    }

    document.getElementById("sleepSummary").textContent = summary
  }

  // Nutrition Chart Functions
  function initializeNutritionChart() {
    const ctx = document.getElementById("nutritionProgressChart").getContext("2d")

    if (nutritionChart) {
      nutritionChart.destroy()
    }

    nutritionChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "Calories",
            data: [],
            backgroundColor: "rgba(56, 178, 172, 0.6)",
            borderColor: "rgba(56, 178, 172, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Calories",
            },
          },
          x: {
            title: {
              display: true,
              text: "Date",
            },
          },
        },
      },
    })
  }

  function updateNutritionChart() {
    if (!nutritionChart) {
      initializeNutritionChart()
    }

    const labels = []
    const calories = []
    const proteins = []
    const carbs = []
    const fats = []

    nutritionData.forEach((record) => {
      labels.push(formatDateForDisplay(record.date))
      calories.push(record.calories || 0)
      proteins.push(record.protein || 0)
      carbs.push(record.carbs || 0)
      fats.push(record.fat || 0)
    })

    nutritionChart.data.labels = labels
    nutritionChart.data.datasets[0].data = calories

    // Add macronutrient datasets if we have the data
    if (proteins.some((p) => p > 0) || carbs.some((c) => c > 0) || fats.some((f) => f > 0)) {
      // Reset datasets
      nutritionChart.data.datasets = [
        {
          label: "Calories",
          data: calories,
          backgroundColor: "rgba(56, 178, 172, 0.6)",
          borderColor: "rgba(56, 178, 172, 1)",
          borderWidth: 1,
          yAxisID: "calories",
        },
      ]

      // Add macronutrient datasets
      nutritionChart.data.datasets.push({
        label: "Protein (g)",
        data: proteins,
        backgroundColor: "rgba(72, 187, 120, 0.6)",
        borderColor: "rgba(72, 187, 120, 1)",
        borderWidth: 1,
        yAxisID: "macros",
      })

      nutritionChart.data.datasets.push({
        label: "Carbs (g)",
        data: carbs,
        backgroundColor: "rgba(66, 153, 225, 0.6)",
        borderColor: "rgba(66, 153, 225, 1)",
        borderWidth: 1,
        yAxisID: "macros",
      })

      nutritionChart.data.datasets.push({
        label: "Fats (g)",
        data: fats,
        backgroundColor: "rgba(237, 137, 54, 0.6)",
        borderColor: "rgba(237, 137, 54, 1)",
        borderWidth: 1,
        yAxisID: "macros",
      })

      // Update chart type to line for better visualization
      nutritionChart.config.type = "line"

      // Add second y-axis for macronutrients
      nutritionChart.options.scales = {
        calories: {
          type: "linear",
          position: "left",
          beginAtZero: true,
          title: {
            display: true,
            text: "Calories",
          },
        },
        macros: {
          type: "linear",
          position: "right",
          beginAtZero: true,
          title: {
            display: true,
            text: "Grams",
          },
          grid: {
            drawOnChartArea: false,
          },
        },
        x: {
          title: {
            display: true,
            text: "Date",
          },
        },
      }
    }

    nutritionChart.update()
  }

  function updateNutritionSummary() {
    if (nutritionData.length === 0) {
      document.getElementById("nutritionSummary").textContent = "No nutrition data available for this time period."
      return
    }

    const avgCalories = calculateAverageCalories()
    const calorieConsistency = calculateConsistency(nutritionData, "calories")

    let summary = `Over the past ${getTimeRangeText()}, you've consumed an average of ${Math.round(avgCalories)} calories per day. `

    if (calorieConsistency < 15) {
      summary += `Your calorie intake has been very consistent (${calorieConsistency}% variation). `
    } else if (calorieConsistency < 30) {
      summary += `Your calorie intake has been somewhat consistent (${calorieConsistency}% variation). `
    } else {
      summary += `Your calorie intake has been quite variable (${calorieConsistency}% variation). `
    }

    // Add macronutrient info if available
    const hasMacros = nutritionData.some((item) => item.protein || item.carbs || item.fat)
    if (hasMacros) {
      const avgProtein = calculateAverage(nutritionData, "protein")
      const avgCarbs = calculateAverage(nutritionData, "carbs")
      const avgFat = calculateAverage(nutritionData, "fat")

      summary += `Your average macronutrient breakdown is ${Math.round(avgProtein)}g protein, ${Math.round(avgCarbs)}g carbs, and ${Math.round(avgFat)}g fat.`
    }

    document.getElementById("nutritionSummary").textContent = summary
  }

  // Activity Chart Functions
  function initializeActivityChart() {
    const ctx = document.getElementById("activityProgressChart").getContext("2d")

    if (activityChart) {
      activityChart.destroy()
    }

    activityChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "Calories Burned",
            data: [],
            backgroundColor: "rgba(237, 137, 54, 0.6)",
            borderColor: "rgba(237, 137, 54, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Calories",
            },
          },
          x: {
            title: {
              display: true,
              text: "Date",
            },
          },
        },
      },
    })
  }

  function updateActivityChart() {
    if (!activityChart) {
      initializeActivityChart()
    }

    // Group activities by date
    const activitiesByDate = {}

    activityData.forEach((activity) => {
      if (!activitiesByDate[activity.date]) {
        activitiesByDate[activity.date] = {
          calories: 0,
          duration: 0,
          activities: [],
        }
      }

      activitiesByDate[activity.date].calories += activity.calories || 0
      activitiesByDate[activity.date].duration += activity.duration || 0
      activitiesByDate[activity.date].activities.push(activity.name)
    })

    const dates = Object.keys(activitiesByDate).sort()
    const labels = dates.map((date) => formatDateForDisplay(date))
    const calorieData = dates.map((date) => activitiesByDate[date].calories)
    const durationData = dates.map((date) => activitiesByDate[date].duration)

    activityChart.data.labels = labels
    activityChart.data.datasets = [
      {
        label: "Calories Burned",
        data: calorieData,
        backgroundColor: "rgba(237, 137, 54, 0.6)",
        borderColor: "rgba(237, 137, 54, 1)",
        borderWidth: 1,
        yAxisID: "calories",
      },
      {
        label: "Duration (minutes)",
        data: durationData,
        backgroundColor: "rgba(66, 153, 225, 0.6)",
        borderColor: "rgba(66, 153, 225, 1)",
        borderWidth: 1,
        yAxisID: "duration",
      },
    ]

    // Update chart options for dual y-axes
    activityChart.options.scales = {
      calories: {
        type: "linear",
        position: "left",
        beginAtZero: true,
        title: {
          display: true,
          text: "Calories",
        },
      },
      duration: {
        type: "linear",
        position: "right",
        beginAtZero: true,
        title: {
          display: true,
          text: "Minutes",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
    }

    activityChart.update()
  }

  function updateActivitySummary() {
    if (activityData.length === 0) {
      document.getElementById("activitySummary").textContent = "No activity data available for this time period."
      return
    }

    // Group activities by date
    const activitiesByDate = {}
    let totalCalories = 0
    let totalDuration = 0
    let activeDays = 0
    const activityTypes = new Set()

    activityData.forEach((activity) => {
      if (!activitiesByDate[activity.date]) {
        activitiesByDate[activity.date] = {
          calories: 0,
          duration: 0,
          activities: [],
        }
        activeDays++
      }

      activitiesByDate[activity.date].calories += activity.calories || 0
      activitiesByDate[activity.date].duration += activity.duration || 0
      activitiesByDate[activity.date].activities.push(activity.name)

      totalCalories += activity.calories || 0
      totalDuration += activity.duration || 0
      activityTypes.add(activity.name)
    })

    const avgCaloriesPerActiveDay = Math.round(totalCalories / activeDays)
    const avgDurationPerActiveDay = Math.round(totalDuration / activeDays)

    let summary = `Over the past ${getTimeRangeText()}, you've been active for ${activeDays} days, burning a total of ${totalCalories} calories. `
    summary += `On active days, you've burned an average of ${avgCaloriesPerActiveDay} calories and exercised for ${avgDurationPerActiveDay} minutes. `

    if (activityTypes.size > 0) {
      summary += `Your activities included: ${Array.from(activityTypes).join(", ")}.`
    }

    document.getElementById("activitySummary").textContent = summary
  }

  // Combined Chart Function
  function updateCombinedChart() {
    const ctx = document.getElementById("combinedProgressChart").getContext("2d")

    if (combinedChart) {
      combinedChart.destroy()
    }

    // Create date range for x-axis
    const dateRange = createDateRange()
    const labels = dateRange.map((date) => formatDateForDisplay(date))

    // Prepare datasets
    const sleepDataset = prepareSleepDataset(dateRange)
    const nutritionDataset = prepareNutritionDataset(dateRange)
    const activityDataset = prepareActivityDataset(dateRange)

    combinedChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [sleepDataset, nutritionDataset, activityDataset],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Percentage of Goal",
            },
          },
          x: {
            title: {
              display: true,
              text: "Date",
            },
          },
        },
      },
    })

    // Update combined summary
    updateCombinedSummary(sleepDataset.data, nutritionDataset.data, activityDataset.data)
  }

  function createDateRange() {
    const dateRange = []
    const today = new Date()
    let startDate

    switch (currentTimeRange) {
      case "week":
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 7)
        break
      case "month":
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 30)
        break
      case "year":
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 365)
        break
      default:
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 7)
    }

    // Create array of dates
    const currentDate = new Date(startDate)
    while (currentDate <= today) {
      dateRange.push(formatDateForComparison(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dateRange
  }

  function prepareSleepDataset(dateRange) {
    // Assume 8 hours is 100% goal
    const sleepGoal = 8
    const data = []

    dateRange.forEach((date) => {
      const sleepRecord = sleepData.find((record) => formatDateForComparison(new Date(record.date)) === date)
      if (sleepRecord) {
        // Calculate percentage of goal
        const percentage = Math.min(Math.round((sleepRecord.duration / sleepGoal) * 100), 100)
        data.push(percentage)
      } else {
        data.push(null) // No data for this date
      }
    })

    return {
      label: "Sleep Goal",
      data: data,
      backgroundColor: "rgba(106, 17, 203, 0.2)",
      borderColor: "rgba(106, 17, 203, 1)",
      borderWidth: 2,
      tension: 0.3,
      fill: false,
    }
  }

  function prepareNutritionDataset(dateRange) {
    // Assume 2000 calories is 100% goal
    const calorieGoal = 2000
    const data = []

    dateRange.forEach((date) => {
      const nutritionRecord = nutritionData.find((record) => formatDateForComparison(new Date(record.date)) === date)
      if (nutritionRecord && nutritionRecord.calories) {
        // Calculate percentage of goal (closer to 100% is better)
        const percentage = Math.min(
          Math.round((1 - Math.abs(nutritionRecord.calories - calorieGoal) / calorieGoal) * 100),
          100,
        )
        data.push(percentage)
      } else {
        data.push(null) // No data for this date
      }
    })

    return {
      label: "Nutrition Goal",
      data: data,
      backgroundColor: "rgba(56, 178, 172, 0.2)",
      borderColor: "rgba(56, 178, 172, 1)",
      borderWidth: 2,
      tension: 0.3,
      fill: false,
    }
  }

  function prepareActivityDataset(dateRange) {
    // Assume 300 calories burned is 100% goal
    const activityGoal = 300
    const data = []

    // Group activities by date
    const activitiesByDate = {}

    activityData.forEach((activity) => {
      const date = formatDateForComparison(new Date(activity.date))
      if (!activitiesByDate[date]) {
        activitiesByDate[date] = 0
      }
      activitiesByDate[date] += activity.calories || 0
    })

    dateRange.forEach((date) => {
      if (activitiesByDate[date]) {
        // Calculate percentage of goal
        const percentage = Math.min(Math.round((activitiesByDate[date] / activityGoal) * 100), 100)
        data.push(percentage)
      } else {
        data.push(null) // No data for this date
      }
    })

    return {
      label: "Activity Goal",
      data: data,
      backgroundColor: "rgba(237, 137, 54, 0.2)",
      borderColor: "rgba(237, 137, 54, 1)",
      borderWidth: 2,
      tension: 0.3,
      fill: false,
    }
  }

  function updateCombinedSummary(sleepData, nutritionData, activityData) {
    // Filter out null values
    const validSleepData = sleepData.filter((val) => val !== null)
    const validNutritionData = nutritionData.filter((val) => val !== null)
    const validActivityData = activityData.filter((val) => val !== null)

    // Calculate averages
    const avgSleep =
      validSleepData.length > 0 ? validSleepData.reduce((sum, val) => sum + val, 0) / validSleepData.length : 0

    const avgNutrition =
      validNutritionData.length > 0
        ? validNutritionData.reduce((sum, val) => sum + val, 0) / validNutritionData.length
        : 0

    const avgActivity =
      validActivityData.length > 0 ? validActivityData.reduce((sum, val) => sum + val, 0) / validActivityData.length : 0

    // Calculate overall score
    const overallScore = Math.round((avgSleep + avgNutrition + avgActivity) / 3)

    let summary = `Your overall health score for the past ${getTimeRangeText()}) is ${overallScore}%. `

    // Add specific feedback
    if (avgSleep > 80 && avgNutrition > 80 && avgActivity > 80) {
      summary += "You're doing great in all areas! Keep up the excellent work."
    } else if (avgSleep < 50 && avgNutrition < 50 && avgActivity < 50) {
      summary += "You have room for improvement in all areas. Start with small, consistent changes."
    } else {
      // Identify strongest and weakest areas
      const areas = [
        { name: "sleep", value: avgSleep },
        { name: "nutrition", value: avgNutrition },
        { name: "activity", value: avgActivity },
      ]

      areas.sort((a, b) => b.value - a.value)

      summary += `Your strongest area is ${areas[0].name} (${Math.round(areas[0].value)}%), `
      summary += `while ${areas[2].name} (${Math.round(areas[2].value)}%) could use more attention.`
    }

    document.getElementById("combinedSummary").textContent = summary
  }

  // Overview Stats Functions
  function updateOverviewStats() {
    // Update sleep stats
    const avgSleepHours = calculateAverageSleepDuration()
    document.getElementById("avgSleepHours").textContent = formatDuration(avgSleepHours)

    // Sleep progress (assuming 8 hours is 100%)
    const sleepProgress = Math.min(Math.round((avgSleepHours / 8) * 100), 100)
    document.getElementById("sleepProgress").style.width = `${sleepProgress}%`

    // Update nutrition stats
    const avgCalories = calculateAverageCalories()
    document.getElementById("avgCalories").textContent = Math.round(avgCalories)

    // Nutrition progress (assuming 2000 calories is 100%)
    const nutritionProgress = Math.min(Math.round((1 - Math.abs(avgCalories - 2000) / 2000) * 100), 100)
    document.getElementById("nutritionProgress").style.width = `${nutritionProgress}%`

    // Update activity stats
    const totalCaloriesBurned = calculateTotalCaloriesBurned()
    document.getElementById("caloriesBurned").textContent = totalCaloriesBurned

    // Activity progress (assuming 2100 calories per week is 100%)
    const activityGoal = currentTimeRange === "week" ? 2100 : currentTimeRange === "month" ? 9000 : 108000
    const activityProgress = Math.min(Math.round((totalCaloriesBurned / activityGoal) * 100), 100)
    document.getElementById("activityProgress").style.width = `${activityProgress}%`
  }

  // Calculation Helper Functions
  function calculateAverageSleepDuration() {
    if (sleepData.length === 0) return 0

    const totalDuration = sleepData.reduce((sum, record) => sum + record.duration, 0)
    return totalDuration / sleepData.length
  }

  function calculateSleepConsistency() {
    if (sleepData.length < 3) return 0

    const durations = sleepData.map((record) => record.duration)
    const avgDuration = durations.reduce((sum, duration) => sum + duration, 0) / durations.length

    // Calculate standard deviation
    const squaredDiffs = durations.map((duration) => Math.pow(duration - avgDuration, 2))
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / durations.length
    const stdDev = Math.sqrt(variance)

    // Convert to percentage (coefficient of variation)
    return Math.round((stdDev / avgDuration) * 100)
  }

  function calculateQualityDistribution(data, qualityField) {
    const distribution = {
      Poor: 0,
      Average: 0,
      Good: 0,
      Excellent: 0,
      total: 0,
    }

    data.forEach((record) => {
      if (record[qualityField] && record[qualityField] in distribution) {
        distribution[record[qualityField]]++
        distribution.total++
      }
    })

    return distribution
  }

  function calculateAverageCalories() {
    if (nutritionData.length === 0) return 0

    const totalCalories = nutritionData.reduce((sum, record) => sum + (record.calories || 0), 0)
    return totalCalories / nutritionData.length
  }

  function calculateConsistency(data, field) {
    if (data.length < 3) return 0

    const values = data.map((record) => record[field] || 0)
    const avgValue = values.reduce((sum, value) => sum + value, 0) / values.length

    // Calculate standard deviation
    const squaredDiffs = values.map((value) => Math.pow(value - avgValue, 2))
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length
    const stdDev = Math.sqrt(variance)

    // Convert to percentage (coefficient of variation)
    return Math.round((stdDev / avgValue) * 100)
  }

  function calculateAverage(data, field) {
    if (data.length === 0) return 0

    const validData = data.filter((record) => record[field] !== undefined && record[field] !== null)
    if (validData.length === 0) return 0

    const total = validData.reduce((sum, record) => sum + (record[field] || 0), 0)
    return total / validData.length
  }

  function calculateTotalCaloriesBurned() {
    if (activityData.length === 0) return 0

    return activityData.reduce((sum, record) => sum + (record.calories || 0), 0)
  }

  // Insight Modal Functions
  function setupInsightModals() {
    // Sleep insights
    const sleepInsightBtn = document.getElementById("sleepInsightBtn")
    const sleepInsightModal = document.getElementById("sleepInsightModal")
    const sleepInsightContent = document.getElementById("sleepInsightContent")
    const sleepInsightTemplate = document.getElementById("sleepInsightTemplate")

    if (sleepInsightBtn && sleepInsightModal) {
      sleepInsightBtn.addEventListener("click", () => {
        sleepInsightContent.innerHTML = sleepInsightTemplate.innerHTML
        sleepInsightModal.style.display = "flex"
      })
    }

    // Nutrition insights
    const nutritionInsightBtn = document.getElementById("nutritionInsightBtn")
    const nutritionInsightModal = document.getElementById("nutritionInsightModal")
    const nutritionInsightContent = document.getElementById("nutritionInsightContent")
    const nutritionInsightTemplate = document.getElementById("nutritionInsightTemplate")

    if (nutritionInsightBtn && nutritionInsightModal) {
      nutritionInsightBtn.addEventListener("click", () => {
        nutritionInsightContent.innerHTML = nutritionInsightTemplate.innerHTML
        nutritionInsightModal.style.display = "flex"
      })
    }

    // Activity insights
    const activityInsightBtn = document.getElementById("activityInsightBtn")
    const activityInsightModal = document.getElementById("activityInsightModal")
    const activityInsightContent = document.getElementById("activityInsightContent")
    const activityInsightTemplate = document.getElementById("activityInsightTemplate")

    if (activityInsightBtn && activityInsightModal) {
      activityInsightBtn.addEventListener("click", () => {
        activityInsightContent.innerHTML = activityInsightTemplate.innerHTML
        activityInsightModal.style.display = "flex"
      })
    }

    // Close buttons
    const closeButtons = document.querySelectorAll(".close-insight")
    closeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const modal = btn.closest(".insight-modal")
        if (modal) {
          modal.style.display = "none"
        }
      })
    })

    // Close on outside click
    const modals = document.querySelectorAll(".insight-modal")
    modals.forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.style.display = "none"
        }
      })
    })
  }

  // Load achievements
  function loadAchievements() {
    const achievementsContainer = document.getElementById("achievementsContainer")
    if (!achievementsContainer) return

    // Sample achievements - in a real app, these would come from Firebase
    const achievements = [
      {
        icon: "🌟",
        title: "Consistent Sleeper",
        date: "2 days ago",
        description: "Maintained a consistent sleep schedule for 7 days",
      },
      {
        icon: "🏃",
        title: "Activity Streak",
        date: "1 week ago",
        description: "Completed activities for 5 consecutive days",
      },
      {
        icon: "🥗",
        title: "Nutrition Master",
        date: "2 weeks ago",
        description: "Stayed within calorie goals for 10 days",
      },
      {
        icon: "🏆",
        title: "Health Champion",
        date: "1 month ago",
        description: "Achieved perfect balance in sleep, nutrition, and activity",
      },
    ]

    // Clear container
    achievementsContainer.innerHTML = ""

    // Add achievements
    achievements.forEach((achievement) => {
      const achievementCard = document.createElement("div")
      achievementCard.className = "achievement-card"
      achievementCard.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-title">${achievement.title}</div>
        <div class="achievement-date">${achievement.date}</div>
      `

      // Add tooltip with description
      achievementCard.title = achievement.description

      // Add animation
      achievementCard.style.animation = "slideIn 0.5s forwards"

      achievementsContainer.appendChild(achievementCard)
    })
  }

  // Helper Functions
  function formatDateForDisplay(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  function formatDateForComparison(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  function formatDuration(hours) {
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    return `${wholeHours}h ${minutes}m`
  }

  function getTimeRangeText() {
    switch (currentTimeRange) {
      case "week":
        return "7 days"
      case "month":
        return "30 days"
      case "year":
        return "year"
      default:
        return "7 days"
    }
  }
})
