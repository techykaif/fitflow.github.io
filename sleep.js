// Sleep Tracker JavaScript
import { auth, database, onAuthStateChanged, ref, get, push, set, remove } from "./firebaseConfig.js"
document.addEventListener("DOMContentLoaded", () => {
  let formattedEmail = ""

  // Format email for Firebase path (matching login.js approach)
  function formatEmail(email) {
    const formatted = email.toLowerCase().replace(/\./g, "_dot_").replace(/@/g, "_at_")
    return formatted
  }

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "tracker.html"
    } else {
      formattedEmail = formatEmail(user.email)
      init()
    }
  })
  // DOM Elements
  const sleepDateInput = document.getElementById("sleepDate")
  const sleepStartInput = document.getElementById("sleepStart")
  const wakeTimeInput = document.getElementById("wakeTime")
  const sleepQualityInput = document.getElementById("sleepQuality")

  const sleepNotesInput = document.getElementById("sleepNotes")
  const calculatedHoursInput = document.getElementById("calculatedHours")
  const sleepRecommendation = document.getElementById("sleepRecommendation")
  const saveSleepBtn = document.getElementById("saveSleepBtn")
  const sleepRecordsList = document.getElementById("sleepRecordsList")
  const sleepChart = document.getElementById("sleepChart")
  const chartTabs = document.querySelectorAll(".chart-tab")
  const filterMonth = document.getElementById("filterMonth")
  const sortBy = document.getElementById("sortBy")
  const sleepGoalHours = document.getElementById("sleepGoalHours")
  const sleepGoalDays = document.getElementById("sleepGoalDays")
  const saveGoalBtn = document.getElementById("saveGoalBtn")
  const weeklyProgressBar = document.getElementById("weeklyProgressBar")
  const weeklyProgressText = document.getElementById("weeklyProgressText")
  const dayIndicators = document.getElementById("dayIndicators")
  const modal = document.getElementById("sleepDetailModal")
  const modalContent = document.getElementById("modalContent")
  const closeModal = document.querySelector(".close-modal")

  // Stats elements
  const averageSleepEl = document.getElementById("averageSleep")
  const averageQualityEl = document.getElementById("averageQuality")
  const sleepGoalProgressEl = document.getElementById("sleepGoalProgress")
  const currentStreakEl = document.getElementById("currentStreak")

  // Charts
  let sleepChartInstance = null

  // Set default date to today
  const today = new Date()
  sleepDateInput.value = formatDateForInput(today)

  // Initialize sleep records from localStorage
  const sleepRecords = JSON.parse(localStorage.getItem("sleepRecords")) || []

  // Initialize sleep goals from localStorage
  let sleepGoals = JSON.parse(localStorage.getItem("sleepGoals")) || {
    targetHours: 8,
    targetDays: 5,
  }

  // Set initial goal values
  sleepGoalHours.value = sleepGoals.targetHours
  sleepGoalDays.value = sleepGoals.targetDays

  // Event Listeners
  sleepStartInput.addEventListener("change", calculateSleepDuration)
  wakeTimeInput.addEventListener("change", calculateSleepDuration)
  saveSleepBtn.addEventListener("click", saveSleepRecord)
  filterMonth.addEventListener("change", renderSleepRecords)
  sortBy.addEventListener("change", renderSleepRecords)
  saveGoalBtn.addEventListener("click", saveSleepGoal)

  // Chart tab event listeners
  chartTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      chartTabs.forEach((t) => t.classList.remove("active"))
      tab.classList.add("active")
      renderChart(tab.dataset.chart)
    })
  })

  // Modal event listeners
  closeModal.addEventListener("click", () => {
    modal.style.display = "none"
  })

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none"
    }
  })

  // Initialize the app
  init()

  // Functions
  function init() {
    // Set today's date as default for the date input
    const today = new Date()
    sleepDateInput.value = formatDateForInput(today)

    // Initialize sleep goals from localStorage
    const savedGoals = localStorage.getItem("sleepGoals")
    if (savedGoals) {
      sleepGoals = JSON.parse(savedGoals)
      sleepGoalHours.value = sleepGoals.targetHours
      sleepGoalDays.value = sleepGoals.targetDays
    }

    // Load sleep records
    renderSleepRecords()

    // Initialize chart with weekly view
    renderChart("weekly")

    // Update dashboard stats
    updateDashboardStats()

    // Update goal progress
    updateGoalProgress()

    // Initialize day indicators
    initializeDayIndicators()
  }

  function calculateSleepDuration() {
    if (!sleepStartInput.value || !wakeTimeInput.value) return

    const sleepDate = new Date(sleepDateInput.value)
    const sleepStart = new Date(sleepDate)
    const wakeTime = new Date(sleepDate)

    // Parse sleep start time
    const [startHours, startMinutes] = sleepStartInput.value.split(":").map(Number)
    sleepStart.setHours(startHours, startMinutes, 0)

    // Parse wake time
    const [wakeHours, wakeMinutes] = wakeTimeInput.value.split(":").map(Number)
    wakeTime.setHours(wakeHours, wakeMinutes, 0)

    // If wake time is earlier than sleep time, assume it's the next day
    if (wakeTime < sleepStart) {
      wakeTime.setDate(wakeTime.getDate() + 1)
    }

    // Calculate duration in milliseconds
    const durationMs = wakeTime - sleepStart
    const durationHours = durationMs / (1000 * 60 * 60)
    const hours = Math.floor(durationHours)
    const minutes = Math.round((durationHours - hours) * 60)

    calculatedHoursInput.value = `${hours}h ${minutes}m`

    // Provide sleep recommendation
    provideSleepRecommendation(durationHours)

    return durationHours
  }

  function provideSleepRecommendation(durationHours) {
    let recommendation = ""

    if (durationHours < 6) {
      recommendation = "⚠️ You might not be getting enough sleep. Adults typically need 7-9 hours."
    } else if (durationHours >= 6 && durationHours < 7) {
      recommendation = "'⚠️ You're slightly below the recommended sleep duration for adults (7-9 hours).'"
    } else if (durationHours >= 7 && durationHours <= 9) {
      recommendation = "'✅ Great job! You're within the recommended sleep range for adults.'"
    } else if (durationHours > 9 && durationHours <= 10) {
      recommendation = "'ℹ️ You're sleeping a bit more than the typical recommendation, which is fine for some people.'"
    } else {
      recommendation =
        "'⚠️ You're sleeping more than typically recommended. If you feel excessively tired, consider consulting a doctor.'"
    }

    sleepRecommendation.textContent = recommendation
  }
  function saveSleepRecord(e) {
    e.preventDefault()

    if (!sleepDateInput.value || !sleepStartInput.value || !wakeTimeInput.value || !sleepQualityInput.value) {
      alert("Please fill in all required fields")
      return
    }

    const durationHours = calculateSleepDuration()
    if (!durationHours) return

    const sleepStartFormatted = formatTime(sleepStartInput.value)
    const wakeTimeFormatted = formatTime(wakeTimeInput.value)

    const sleepRecord = {
      date: sleepDateInput.value,
      sleepStart: sleepStartInput.value,
      wakeTime: wakeTimeInput.value,
      sleepStartFormatted,
      wakeTimeFormatted,
      quality: sleepQualityInput.value,
      duration: durationHours,
      durationFormatted: calculatedHoursInput.value,
      notes: sleepNotesInput.value,
      timestamp: Date.now(),
    }

    const newSleepRef = push(ref(database, `users/${formattedEmail}/sleep`))
    set(newSleepRef, sleepRecord)
      .then(() => {
        // Reset form
        sleepQualityInput.value = ""
        sleepNotesInput.value = ""
        calculatedHoursInput.value = ""
        sleepRecommendation.textContent = ""

        // UI updates
        renderSleepRecords() // You’ll need to update this to use Firebase data
        renderChart("weekly")
        updateDashboardStats()
        updateGoalProgress()

        alert("Sleep record saved successfully!")
      })
      .catch((error) => {
        console.error("Error saving sleep record:", error)
      })
  }
  function renderSleepRecords() {
    // Get the reference to the Firebase database
    const sleepRecordsRef = ref(database, `users/${formattedEmail}/sleep`)

    // Fetch sleep records from Firebase
    get(sleepRecordsRef)
      .then((snapshot) => {
        if (!snapshot.exists()) {
          sleepRecordsList.innerHTML = `
            <div class="empty-state">
              <div class="empty-icon">😴</div>
              <p>No sleep records found. Start tracking your sleep!</p>
            </div>
          `
          return
        }

        // Convert snapshot data into an array
        const sleepRecords = []
        snapshot.forEach((childSnapshot) => {
          sleepRecords.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          })
        })

        // Apply filters
        let filteredRecords = [...sleepRecords]

        // Filter by month
        if (filterMonth.value !== "all") {
          const now = new Date()
          const currentMonth = now.getMonth()
          const currentYear = now.getFullYear()

          if (filterMonth.value === "current") {
            filteredRecords = filteredRecords.filter((record) => {
              const recordDate = new Date(record.date)
              return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
            })
          } else if (filterMonth.value === "last") {
            let lastMonth = currentMonth - 1
            let lastMonthYear = currentYear
            if (lastMonth < 0) {
              lastMonth = 11
              lastMonthYear = currentYear - 1
            }

            filteredRecords = filteredRecords.filter((record) => {
              const recordDate = new Date(record.date)
              return recordDate.getMonth() === lastMonth && recordDate.getFullYear() === lastMonthYear
            })
          }
        }

        // Apply sorting
        switch (sortBy.value) {
          case "date-desc":
            filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date))
            break
          case "date-asc":
            filteredRecords.sort((a, b) => new Date(a.date) - new Date(b.date))
            break
          case "duration-desc":
            filteredRecords.sort((a, b) => b.duration - a.duration)
            break
          case "duration-asc":
            filteredRecords.sort((a, b) => a.duration - b.duration)
            break
          case "quality-desc":
            const qualityOrder = { Excellent: 4, Good: 3, Average: 2, Poor: 1 }
            filteredRecords.sort((a, b) => qualityOrder[b.quality] - qualityOrder[a.quality])
            break
        }

        // Render records
        sleepRecordsList.innerHTML = ""

        filteredRecords.forEach((record) => {
          const recordElement = document.createElement("div")
          recordElement.className = "sleep-record"
          recordElement.innerHTML = `
            <div class="record-date">${formatDate(record.date)}</div>
            <div class="record-time">${record.sleepStartFormatted} - ${record.wakeTimeFormatted}</div>
            <div class="record-duration">${record.durationFormatted}</div>
            <div class="record-quality">
              <span class="quality-indicator quality-${record.quality}"></span>
              ${record.quality}
            </div>
            <div class="record-actions">
              <button class="action-btn view-btn" title="View Details" data-id="${record.id}">👁️</button>
              <button class="action-btn edit-btn" title="Edit Record" data-id="${record.id}">✏️</button>
              <button class="action-btn delete-btn" title="Delete Record" data-id="${record.id}">🗑️</button>
            </div>
          `

          sleepRecordsList.appendChild(recordElement)
        })

        // Add event listeners to action buttons
        document.querySelectorAll(".view-btn").forEach((btn) => {
          btn.addEventListener("click", () => viewSleepRecord(btn.dataset.id))
        })

        document.querySelectorAll(".edit-btn").forEach((btn) => {
          btn.addEventListener("click", () => editSleepRecord(btn.dataset.id))
        })

        document.querySelectorAll(".delete-btn").forEach((btn) => {
          btn.addEventListener("click", () => deleteSleepRecord(btn.dataset.id))
        })
      })
      .catch((error) => {
        console.error("Error fetching sleep records:", error)
      })
  }

  function viewSleepRecord(id) {
    // Get the reference to the Firebase database
    const sleepRecordRef = ref(database, `users/${formattedEmail}/sleep/${id}`)

    // Fetch the specific sleep record from Firebase
    get(sleepRecordRef)
      .then((snapshot) => {
        if (!snapshot.exists()) {
          console.error("Record not found")
          return
        }

        const record = snapshot.val()

        modalContent.innerHTML = `
          <div class="detail-group">
            <div class="detail-label">Date</div>
            <div class="detail-value">${formatDate(record.date)}</div>
          </div>
          <div class="detail-group">
            <div class="detail-label">Sleep Time</div>
            <div class="detail-value">${record.sleepStartFormatted} - ${record.wakeTimeFormatted}</div>
          </div>
          <div class="detail-group">
            <div class="detail-label">Duration</div>
            <div class="detail-value">${record.durationFormatted}</div>
          </div>
          <div class="detail-group">
            <div class="detail-label">Quality</div>
            <div class="detail-value">
              <span class="quality-indicator quality-${record.quality}"></span>
              ${record.quality}
            </div>
          </div>
          ${
            record.notes
              ? `
            <div class="detail-group">
              <div class="detail-label">Notes</div>
              <div class="detail-value">${record.notes}</div>
            </div>
          `
              : ""
          }
        `

        modal.style.display = "flex"
      })
      .catch((error) => {
        console.error("Error fetching sleep record:", error)
      })
  }
  function editSleepRecord(id) {
    // Get the reference to the Firebase database for the specific record
    const sleepRecordRef = ref(database, `users/${formattedEmail}/sleep/${id}`)

    // Fetch the specific sleep record from Firebase
    get(sleepRecordRef)
      .then((snapshot) => {
        if (!snapshot.exists()) {
          console.error("Record not found")
          return
        }

        const record = snapshot.val()

        // Fill form with record data
        sleepDateInput.value = record.date
        sleepStartInput.value = record.sleepStart
        wakeTimeInput.value = record.wakeTime
        sleepQualityInput.value = record.quality
        sleepNotesInput.value = record.notes || ""
        calculatedHoursInput.value = record.durationFormatted

        // Provide recommendation based on duration
        provideSleepRecommendation(record.duration)

        // Delete the record (it will be replaced when saved)
        deleteSleepRecord(id, false)

        // Scroll to form
        document.querySelector(".sleep-tracker-section").scrollIntoView({ behavior: "smooth" })
      })
      .catch((error) => {
        console.error("Error fetching sleep record:", error)
      })
  }
  function deleteSleepRecord(id, confirm = true) {
    if (confirm && !window.confirm("Are you sure you want to delete this sleep record?")) {
      return
    }

    // Get the reference to the Firebase database for the specific record
    const sleepRecordRef = ref(database, `users/${formattedEmail}/sleep/${id}`)

    // Remove the record from Firebase
    remove(sleepRecordRef)
      .then(() => {
        // Refresh the UI after deletion
        renderSleepRecords()
        renderChart("weekly")
        updateDashboardStats()
        updateGoalProgress()
      })
      .catch((error) => {
        console.error("Error deleting sleep record:", error)
      })
  }

  function renderChart(type) {
    // Destroy existing chart if it exists
    if (sleepChartInstance) {
      sleepChartInstance.destroy()
    }

    // Get the reference to the Firebase database
    const sleepRecordsRef = ref(database, `users/${formattedEmail}/sleep`)

    // Fetch sleep records from Firebase
    get(sleepRecordsRef)
      .then((snapshot) => {
        const sleepRecords = []
        if (snapshot.exists()) {
          // Convert snapshot data into an array
          snapshot.forEach((childSnapshot) => {
            sleepRecords.push({
              id: childSnapshot.key,
              ...childSnapshot.val(),
            })
          })
        }

        // Sort records by date
        const sortedRecords = [...sleepRecords].sort((a, b) => new Date(a.date) - new Date(b.date))

        let chartData
        let chartOptions

        if (type === "weekly") {
          // Get last 7 days of data
          const last7Days = getLast7DaysData(sortedRecords)

          chartData = {
            labels: last7Days.map((day) => day.label),
            datasets: [
              {
                label: "Sleep Duration (hours)",
                data: last7Days.map((day) => day.duration),
                backgroundColor: "rgba(106, 17, 203, 0.2)",
                borderColor: "rgba(106, 17, 203, 1)",
                borderWidth: 2,
                tension: 0.3,
                fill: true,
              },
            ],
          }

          chartOptions = {
            scales: {
              y: {
                beginAtZero: true,
                max: 12,
                title: {
                  display: true,
                  text: "Hours",
                },
              },
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const hours = Math.floor(context.raw)
                    const minutes = Math.round((context.raw - hours) * 60)
                    return `Sleep: ${hours}h ${minutes}m`
                  },
                },
              },
            },
          }
        } else if (type === "monthly") {
          // Get last 30 days of data
          const last30Days = getLast30DaysData(sortedRecords)

          chartData = {
            labels: last30Days.map((day) => day.label),
            datasets: [
              {
                label: "Sleep Duration (hours)",
                data: last30Days.map((day) => day.duration),
                backgroundColor: "rgba(37, 117, 252, 0.2)",
                borderColor: "rgba(37, 117, 252, 1)",
                borderWidth: 2,
                tension: 0.1,
                fill: true,
              },
            ],
          }

          chartOptions = {
            scales: {
              y: {
                beginAtZero: true,
                max: 12,
                title: {
                  display: true,
                  text: "Hours",
                },
              },
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const hours = Math.floor(context.raw)
                    const minutes = Math.round((context.raw - hours) * 60)
                    return `Sleep: ${hours}h ${minutes}m`
                  },
                },
              },
            },
          }
        } else if (type === "quality") {
          // Get quality distribution
          const qualityData = getQualityDistribution(sortedRecords)

          chartData = {
            labels: ["Poor", "Average", "Good", "Excellent"],
            datasets: [
              {
                label: "Sleep Quality Distribution",
                data: [qualityData.Poor, qualityData.Average, qualityData.Good, qualityData.Excellent],
                backgroundColor: [
                  "rgba(229, 62, 62, 0.7)",
                  "rgba(246, 173, 85, 0.7)",
                  "rgba(72, 187, 120, 0.7)",
                  "rgba(66, 153, 225, 0.7)",
                ],
                borderColor: [
                  "rgba(229, 62, 62, 1)",
                  "rgba(246, 173, 85, 1)",
                  "rgba(72, 187, 120, 1)",
                  "rgba(66, 153, 225, 1)",
                ],
                borderWidth: 1,
              },
            ],
          }

          chartOptions = {
            plugins: {
              legend: {
                position: "right",
              },
            },
          }
        }

        // Create new chart
        sleepChartInstance = new Chart(sleepChart, {
          type: type === "quality" ? "doughnut" : "line",
          data: chartData,
          options: chartOptions,
        })

        // Update sleep insights
        updateSleepInsights(type, sortedRecords)
      })
      .catch((error) => {
        console.error("Error fetching sleep records for chart:", error)
      })
  }

  function getLast7DaysData(records) {
    if (!records) records = []

    const result = []
    const today = new Date()

    // Create array for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const dayStr = formatDateForComparison(date)
      const dayLabel = i === 0 ? "Today" : i === 1 ? "Yesterday" : formatDateShort(date)

      // Find matching record
      const record = records.find((r) => formatDateForComparison(new Date(r.date)) === dayStr)

      result.push({
        date: dayStr,
        label: dayLabel,
        duration: record ? record.duration : 0,
      })
    }

    return result
  }

  function getLast30DaysData(records) {
    if (!records) records = []

    const result = []
    const today = new Date()

    // Create array for last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const dayStr = formatDateForComparison(date)
      const dayLabel = formatDateShort(date)

      // Find matching record
      const record = records.find((r) => formatDateForComparison(new Date(r.date)) === dayStr)

      result.push({
        date: dayStr,
        label: dayLabel,
        duration: record ? record.duration : 0,
      })
    }

    return result
  }

  function getQualityDistribution(records) {
    if (!records) records = []

    const distribution = {
      Poor: 0,
      Average: 0,
      Good: 0,
      Excellent: 0,
    }

    records.forEach((record) => {
      if (record.quality in distribution) {
        distribution[record.quality]++
      }
    })

    return distribution
  }

  function updateSleepInsights(type, sleepRecords) {
    const insightsElement = document.getElementById("sleepInsights")

    if (!sleepRecords || sleepRecords.length === 0) {
      insightsElement.innerHTML = `
      <h3>Sleep Insights</h3>
      <p>Log your sleep to receive personalized insights.</p>
    `
      return
    }

    let insights = "<h3>Sleep Insights</h3>"

    if (type === "weekly" || type === "monthly") {
      const avgDuration = calculateAverageSleepDuration(sleepRecords)
      const avgQuality = calculateAverageSleepQuality(sleepRecords)
      const consistencyScore = calculateSleepConsistency(sleepRecords)

      insights += `
      <p>Your average sleep duration is <strong>${formatDuration(avgDuration)}</strong> over the last 7 days.</p>
      <p>Your sleep consistency score is <strong>${consistencyScore}%</strong> (lower variation is better).</p>
    `

      // Add recommendations
      if (avgDuration < 7) {
        insights += `<p>⚠️ <strong>Recommendation:</strong> Try to increase your sleep duration to at least 7 hours.</p>`
      }

      if (consistencyScore > 20) {
        insights += `<p>⚠️ <strong>Recommendation:</strong> Your sleep schedule varies significantly. Try to maintain consistent sleep and wake times.</p>`
      }
    } else if (type === "quality") {
      const qualityDistribution = getQualityDistribution(sleepRecords)
      const totalRecords = Object.values(qualityDistribution).reduce((sum, val) => sum + val, 0)

      if (totalRecords > 0) {
        const goodAndExcellent = qualityDistribution.Good + qualityDistribution.Excellent
        const goodPercentage = Math.round((goodAndExcellent / totalRecords) * 100)

        insights += `<p>You rated your sleep as Good or Excellent <strong>${goodPercentage}%</strong> of the time.</p>`

        if (qualityDistribution.Poor > 0) {
          const poorPercentage = Math.round((qualityDistribution.Poor / totalRecords) * 100)
          insights += `<p>You rated your sleep as Poor <strong>${poorPercentage}%</strong> of the time.</p>`

          if (poorPercentage > 20) {
            insights += `<p>⚠️ <strong>Recommendation:</strong> Consider reviewing your sleep habits to improve quality.</p>`
          }
        }
      }
    }

    insightsElement.innerHTML = insights
  }

  function updateDashboardStats() {
    // Get the reference to the Firebase database
    const sleepRecordsRef = ref(database, `users/${formattedEmail}/sleep`)

    // Fetch sleep records from Firebase
    get(sleepRecordsRef)
      .then((snapshot) => {
        const sleepRecords = []
        if (snapshot.exists()) {
          // Convert snapshot data into an array
          snapshot.forEach((childSnapshot) => {
            sleepRecords.push({
              id: childSnapshot.key,
              ...childSnapshot.val(),
            })
          })
        }

        // Calculate average sleep duration
        const avgDuration = calculateAverageSleepDuration(sleepRecords)
        averageSleepEl.textContent = formatDuration(avgDuration)

        // Calculate average sleep quality
        const avgQuality = calculateAverageSleepQuality(sleepRecords)
        averageQualityEl.textContent = avgQuality || "--"

        // Calculate sleep goal progress
        const goalProgress = calculateGoalProgress(sleepRecords)
        sleepGoalProgressEl.textContent = `${goalProgress}%`

        // Calculate current streak
        const streak = calculateCurrentStreak(sleepRecords)
        currentStreakEl.textContent = streak
      })
      .catch((error) => {
        console.error("Error fetching sleep records for dashboard:", error)
      })
  }

  function calculateAverageSleepDuration(sleepRecords) {
    if (!sleepRecords || sleepRecords.length === 0) return 0

    const last7Days = getLast7DaysData(sleepRecords)
    const recordsWithSleep = last7Days.filter((day) => day.duration > 0)

    if (recordsWithSleep.length === 0) return 0

    const totalDuration = recordsWithSleep.reduce((sum, day) => sum + day.duration, 0)
    return totalDuration / recordsWithSleep.length
  }

  function calculateAverageSleepQuality(sleepRecords) {
    if (!sleepRecords || sleepRecords.length === 0) return null

    // Get records from last 7 days
    const last7Days = new Date()
    last7Days.setDate(last7Days.getDate() - 7)

    const recentRecords = sleepRecords.filter((record) => new Date(record.date) >= last7Days)

    if (recentRecords.length === 0) return null

    // Count quality occurrences
    const qualityCounts = {
      Poor: 0,
      Average: 0,
      Good: 0,
      Excellent: 0,
    }

    recentRecords.forEach((record) => {
      qualityCounts[record.quality]++
    })

    // Find most common quality
    let maxCount = 0
    let mostCommonQuality = null

    for (const quality in qualityCounts) {
      if (qualityCounts[quality] > maxCount) {
        maxCount = qualityCounts[quality]
        mostCommonQuality = quality
      }
    }

    return mostCommonQuality
  }

  function calculateSleepConsistency(sleepRecords) {
    if (!sleepRecords || sleepRecords.length < 3) return 0

    const last7Days = getLast7DaysData(sleepRecords)
    const recordsWithSleep = last7Days.filter((day) => day.duration > 0)

    if (recordsWithSleep.length < 3) return 0

    const durations = recordsWithSleep.map((day) => day.duration)
    const avgDuration = durations.reduce((sum, duration) => sum + duration, 0) / durations.length

    // Calculate standard deviation
    const squaredDiffs = durations.map((duration) => Math.pow(duration - avgDuration, 2))
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / durations.length
    const stdDev = Math.sqrt(variance)

    // Convert to percentage (coefficient of variation)
    const consistencyScore = Math.round((stdDev / avgDuration) * 100)

    return consistencyScore
  }

  function calculateGoalProgress(sleepRecords) {
    const targetHours = sleepGoals.targetHours
    const avgDuration = calculateAverageSleepDuration(sleepRecords)

    if (avgDuration === 0) return 0

    const progress = Math.min(Math.round((avgDuration / targetHours) * 100), 100)
    return progress
  }

  function calculateCurrentStreak(sleepRecords) {
    if (!sleepRecords || sleepRecords.length === 0) return 0

    // Sort records by date (newest first)
    const sortedRecords = [...sleepRecords].sort((a, b) => new Date(b.date) - new Date(a.date))

    let streak = 0
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    // Check each day going backwards
    while (true) {
      const dateStr = formatDateForComparison(currentDate)
      const record = sortedRecords.find((r) => formatDateForComparison(new Date(r.date)) === dateStr)

      // If no record or duration less than goal, break streak
      if (!record || record.duration < sleepGoals.targetHours) {
        break
      }

      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    }

    return streak
  }

  function saveSleepGoal() {
    const targetHours = Number.parseFloat(sleepGoalHours.value)
    const targetDays = Number.parseInt(sleepGoalDays.value)

    if (
      isNaN(targetHours) ||
      isNaN(targetDays) ||
      targetHours < 4 ||
      targetHours > 12 ||
      targetDays < 1 ||
      targetDays > 7
    ) {
      alert("Please enter valid goal values")
      return
    }

    sleepGoals = {
      targetHours,
      targetDays,
    }

    localStorage.setItem("sleepGoals", JSON.stringify(sleepGoals))

    updateGoalProgress()
    updateDashboardStats()

    alert("Sleep goal updated successfully!")
  }

  function updateGoalProgress() {
    // Get the reference to the Firebase database
    const sleepRecordsRef = ref(database, `users/${formattedEmail}/sleep`)

    // Fetch sleep records from Firebase
    get(sleepRecordsRef)
      .then((snapshot) => {
        const sleepRecords = []
        if (snapshot.exists()) {
          // Convert snapshot data into an array
          snapshot.forEach((childSnapshot) => {
            sleepRecords.push({
              id: childSnapshot.key,
              ...childSnapshot.val(),
            })
          })
        }

        // Get records from current week
        const today = new Date()
        const dayOfWeek = today.getDay() // 0 = Sunday, 6 = Saturday
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - dayOfWeek)
        startOfWeek.setHours(0, 0, 0, 0)

        // Get days with sufficient sleep
        const daysMetGoal = []

        for (let i = 0; i < 7; i++) {
          const date = new Date(startOfWeek)
          date.setDate(startOfWeek.getDate() + i)

          const dateStr = formatDateForComparison(date)
          const record = sleepRecords.find((r) => formatDateForComparison(new Date(r.date)) === dateStr)

          if (record && record.duration >= sleepGoals.targetHours) {
            daysMetGoal.push(i)
          }
        }

        // Update progress bar
        const progressPercentage = Math.min((daysMetGoal.length / sleepGoals.targetDays) * 100, 100)
        weeklyProgressBar.style.width = `${progressPercentage}%`
        weeklyProgressText.textContent = `${daysMetGoal.length}/${sleepGoals.targetDays} days`

        // Update day indicators
        const dayIndicatorElements = document.querySelectorAll(".day-indicator")
        dayIndicatorElements.forEach((indicator) => {
          const day = Number.parseInt(indicator.dataset.day)
          if (daysMetGoal.includes(day)) {
            indicator.classList.add("met-goal")
          } else {
            indicator.classList.remove("met-goal")
          }
        })
      })
      .catch((error) => {
        console.error("Error fetching sleep records for goal progress:", error)
      })
  }

  function initializeDayIndicators() {
    if (!dayIndicators) return

    dayIndicators.innerHTML = ""

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    for (let i = 0; i < 7; i++) {
      const indicator = document.createElement("div")
      indicator.className = "day-indicator"
      indicator.dataset.day = i
      indicator.innerHTML = `<span>${dayNames[i]}</span>`
      dayIndicators.appendChild(indicator)
    }
  }

  // Helper Functions
  function formatDateForInput(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  function formatDateForComparison(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  function formatDateShort(date) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  function formatDuration(hours) {
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    return `${wholeHours}h ${minutes}m`
  }
})
