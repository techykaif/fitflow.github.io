 // DOM Elements
 const menuToggle = document.querySelector('.menu-toggle');
 const sidebar = document.querySelector('.sidebar');
 const addSleepBtn = document.querySelector('.add-sleep-btn');
 const sleepModal = document.getElementById('sleep-modal');
 const closeModal = document.querySelector('.close-modal');
 const cancelBtn = document.querySelector('.cancel-btn');
 const sleepForm = document.getElementById('sleep-form');
 const bellIcon = document.getElementById('bell-icon');
 const loginHistory = document.getElementById('login-history');
 const userName = document.getElementById('user-name');
 const userAvatar = document.getElementById('user-avatar');

 // Sample sleep data
 const sleepData = [
     { 
         date: '2025-04-06', 
         bedtime: '22:30', 
         wakeTime: '06:30', 
         duration: 8, 
         quality: 'Excellent',
         deepSleep: 3.2,
         lightSleep: 2.4,
         remSleep: 1.6,
         awake: 0.8
     },
     { 
         date: '2025-04-05', 
         bedtime: '23:15', 
         wakeTime: '07:00', 
         duration: 7.75, 
         quality: 'Good',
         deepSleep: 2.8,
         lightSleep: 2.6,
         remSleep: 1.5,
         awake: 0.85
     },
     { 
         date: '2025-04-04', 
         bedtime: '23:45', 
         wakeTime: '06:45', 
         duration: 7, 
         quality: 'Fair',
         deepSleep: 2.5,
         lightSleep: 2.3,
         remSleep: 1.4,
         awake: 0.8
     },
     { 
         date: '2025-04-03', 
         bedtime: '22:00', 
         wakeTime: '06:15', 
         duration: 8.25, 
         quality: 'Excellent',
         deepSleep: 3.3,
         lightSleep: 2.5,
         remSleep: 1.7,
         awake: 0.75
     },
     { 
         date: '2025-04-02', 
         bedtime: '23:30', 
         wakeTime: '07:30', 
         duration: 8, 
         quality: 'Good',
         deepSleep: 3.0,
         lightSleep: 2.6,
         remSleep: 1.6,
         awake: 0.8
     },
     { 
         date: '2025-04-01', 
         bedtime: '22:45', 
         wakeTime: '06:45', 
         duration: 8, 
         quality: 'Good',
         deepSleep: 3.1,
         lightSleep: 2.5,
         remSleep: 1.6,
         awake: 0.8
     },
     { 
         date: '2025-03-31', 
         bedtime: '23:00', 
         wakeTime: '07:00', 
         duration: 8, 
         quality: 'Good',
         deepSleep: 3.0,
         lightSleep: 2.6,
         remSleep: 1.6,
         awake: 0.8
     }
 ];

 // Sample notifications
 const notifications = [
     { message: 'You achieved your sleep goal yesterday!', time: '2 hours ago' },
     { message: 'Your sleep quality has improved by 15% this week', time: '1 day ago' },
     { message: 'New sleep insights available', time: '3 days ago' }
 ];

 // Initialize the page
 function initPage() {
     // Set user info
     userName.textContent = 'John Doe';
     
     // Update stats
     updateSleepStats();
     
     // Render charts
     renderWeeklySleepChart();
     renderSleepStagesChart();
     
     // Render sleep records
     renderSleepRecords();
     
     // Render notifications
     renderNotifications();
     
     // Set today's date in the form
     document.getElementById('sleep-date').valueAsDate = new Date();
     
     // Check if mobile and setup responsive behavior
     checkIfMobile();
     
     // Set event listeners
     setupEventListeners();
 }

 // Update sleep statistics
 function updateSleepStats() {
     // Get the latest sleep record
     const latestSleep = sleepData[0];
     
     // Update duration
     const durationValue = document.getElementById('duration-value');
     const durationProgress = document.getElementById('duration-progress');
     const hours = Math.floor(latestSleep.duration);
     const minutes = Math.round((latestSleep.duration - hours) * 60);
     durationValue.textContent = `${hours}h ${minutes}m`;
     durationProgress.style.width = `${(latestSleep.duration / 8) * 100}%`;
     
     // Update quality
     const qualityValue = document.getElementById('quality-value');
     const qualityProgress = document.getElementById('quality-progress');
     let qualityPercent;
     switch(latestSleep.quality) {
         case 'Excellent': qualityPercent = 90; break;
         case 'Good': qualityPercent = 75; break;
         case 'Fair': qualityPercent = 60; break;
         case 'Poor': qualityPercent = 40; break;
         default: qualityPercent = 0;
     }
     qualityValue.textContent = `${qualityPercent}%`;
     qualityProgress.style.width = `${qualityPercent}%`;
     
     // Update bedtime
     const bedtimeValue = document.getElementById('bedtime-value');
     const bedtimeProgress = document.getElementById('bedtime-progress');
     bedtimeValue.textContent = formatTime(latestSleep.bedtime);
     // Calculate progress based on how close to target (10:30 PM)
     const targetBedtime = 22.5; // 10:30 PM in decimal hours
     const actualBedtime = parseTimeToDecimal(latestSleep.bedtime);
     const bedtimeAccuracy = 100 - Math.min(Math.abs(targetBedtime - actualBedtime) * 20, 100);
     bedtimeProgress.style.width = `${bedtimeAccuracy}%`;
     
     // Update wake-up time
     const wakeupValue = document.getElementById('wakeup-value');
     const wakeupProgress = document.getElementById('wakeup-progress');
     wakeupValue.textContent = formatTime(latestSleep.wakeTime);
     // Calculate progress based on how close to target (6:30 AM)
     const targetWakeup = 6.5; // 6:30 AM in decimal hours
     const actualWakeup = parseTimeToDecimal(latestSleep.wakeTime);
     const wakeupAccuracy = 100 - Math.min(Math.abs(targetWakeup - actualWakeup) * 20, 100);
     wakeupProgress.style.width = `${wakeupAccuracy}%`;
 }

 // Render weekly sleep chart
 function renderWeeklySleepChart() {
     const chartBars = document.querySelectorAll('.chart-bar');
     const maxDuration = Math.max(...sleepData.map(item => item.duration));
     
     sleepData.forEach((sleep, index) => {
         if (index < chartBars.length) {
             const bar = chartBars[chartBars.length - 1 - index];
             const barFill = bar.querySelector('.bar-fill');
             const height = (sleep.duration / maxDuration) * 180;
             barFill.style.height = `${height}px`;
             bar.setAttribute('data-value', sleep.duration);
         }
     });
 }

 // Render sleep stages chart
 function renderSleepStagesChart() {
     const latestSleep = sleepData[0];
     const donutHole = document.querySelector('.donut-hole');
     const deepSegment = document.querySelector('.donut-segment.deep');
     const lightSegment = document.querySelector('.donut-segment.light');
     const remSegment = document.querySelector('.donut-segment.rem');
     const awakeSegment = document.querySelector('.donut-segment.awake');
     
     // Update donut hole text
     donutHole.textContent = `${Math.floor(latestSleep.duration)}h`;
     
     // Calculate percentages
     const total = latestSleep.deepSleep + latestSleep.lightSleep + latestSleep.remSleep + latestSleep.awake;
     const deepPercent = (latestSleep.deepSleep / total) * 100;
     const lightPercent = (latestSleep.lightSleep / total) * 100;
     const remPercent = (latestSleep.remSleep / total) * 100;
     const awakePercent = (latestSleep.awake / total) * 100;
     
     // Update segments
     deepSegment.style.setProperty('--value', deepPercent);
     deepSegment.style.setProperty('--offset', 0);
     
     lightSegment.style.setProperty('--value', lightPercent);
     lightSegment.style.setProperty('--offset', deepPercent);
     
     remSegment.style.setProperty('--value', remPercent);
     remSegment.style.setProperty('--offset', deepPercent + lightPercent);
     
     awakeSegment.style.setProperty('--value', awakePercent);
     awakeSegment.style.setProperty('--offset', deepPercent + lightPercent + remPercent);
 }

 // Render sleep records
 function renderSleepRecords() {
     const recordsList = document.getElementById('records-list');
     recordsList.innerHTML = '';
     
     sleepData.forEach(sleep => {
         const recordItem = document.createElement('div');
         recordItem.className = 'record-item';
         
         const date = new Date(sleep.date);
         const formattedDate = date.toLocaleDateString('en-US', { 
             weekday: 'short', 
             month: 'short', 
             day: 'numeric' 
         });
         
         const qualityClass = `quality-${sleep.quality.toLowerCase()}`;
         
         recordItem.innerHTML = `
             <div class="record-icon">💤</div>
             <div class="record-details">
                 <div class="record-date">${formattedDate}</div>
                 <div class="record-info">
                     ${formatTime(sleep.bedtime)} - ${formatTime(sleep.wakeTime)} (${Math.floor(sleep.duration)}h ${Math.round((sleep.duration - Math.floor(sleep.duration)) * 60)}m)
                 </div>
             </div>
             <span class="record-quality ${qualityClass}">${sleep.quality}</span>
         `;
         
         recordsList.appendChild(recordItem);
     });
 }

 // Render notifications
 function renderNotifications() {
     const notificationsList = document.querySelector('#login-history ul');
     notificationsList.innerHTML = '';
     
     notifications.forEach(notification => {
         const li = document.createElement('li');
         li.innerHTML = `
             <strong>${notification.message}</strong>
             <div>${notification.time}</div>
         `;
         notificationsList.appendChild(li);
     });
 }

 // Setup event listeners
 function setupEventListeners() {
     // Mobile menu toggle
     if (menuToggle) {
         menuToggle.addEventListener('click', () => {
             sidebar.classList.toggle('expanded');
         });
     }
     
     // Modal open
     addSleepBtn.addEventListener('click', () => {
         sleepModal.classList.add('active');
     });
     
     // Modal close
     closeModal.addEventListener('click', () => {
         sleepModal.classList.remove('active');
     });
     
     cancelBtn.addEventListener('click', () => {
         sleepModal.classList.remove('active');
     });
     
     // Form submit
     sleepForm.addEventListener('submit', (e) => {
         e.preventDefault();
         
         // Get form values
         const date = document.getElementById('sleep-date').value;
         const bedtime = document.getElementById('bedtime').value;
         const wakeTime = document.getElementById('wake-time').value;
         const quality = document.getElementById('sleep-quality').value;
         const deepSleep = parseFloat(document.getElementById('deep-sleep').value) || 0;
         const lightSleep = parseFloat(document.getElementById('light-sleep').value) || 0;
         const remSleep = parseFloat(document.getElementById('rem-sleep').value) || 0;
         
         // Calculate duration
         const bedtimeHours = parseTimeToDecimal(bedtime);
         const wakeTimeHours = parseTimeToDecimal(wakeTime);
         let duration;
         
         if (wakeTimeHours < bedtimeHours) {
             // If wake time is earlier than bedtime, assume it's the next day
             duration = (24 - bedtimeHours) + wakeTimeHours;
         } else {
             duration = wakeTimeHours - bedtimeHours;
         }
         
         // Calculate awake time (assuming the rest is awake time)
         const totalTracked = deepSleep + lightSleep + remSleep;
         const awake = Math.max(0, duration - totalTracked);
         
         // Create new sleep record
         const newSleep = {
             date,
             bedtime,
             wakeTime,
             duration,
             quality,
             deepSleep,
             lightSleep,
             remSleep,
             awake
         };
         
         // Add to sleep data
         sleepData.unshift(newSleep);
         
         // Update UI
         updateSleepStats();
         renderWeeklySleepChart();
         renderSleepStagesChart();
         renderSleepRecords();
         
         // Close modal
         sleepModal.classList.remove('active');
         
         // Reset form
         sleepForm.reset();
         document.getElementById('sleep-date').valueAsDate = new Date();
     });
     
     // Notification toggle
     bellIcon.addEventListener('click', () => {
         loginHistory.classList.toggle('hidden');
     });
     
     // Close notifications when clicking outside
     document.addEventListener('click', (e) => {
         if (!bellIcon.contains(e.target) && !loginHistory.contains(e.target)) {
             loginHistory.classList.add('hidden');
         }
     });
 }

 // Helper function to format time (24h to 12h)
 function formatTime(time24) {
     const [hours, minutes] = time24.split(':');
     const hour = parseInt(hours, 10);
     const period = hour >= 12 ? 'PM' : 'AM';
     const hour12 = hour % 12 || 12;
     return `${hour12}:${minutes} ${period}`;
 }

 // Helper function to parse time to decimal hours
 function parseTimeToDecimal(time) {
     const [hours, minutes] = time.split(':');
     return parseInt(hours, 10) + (parseInt(minutes, 10) / 60);
 }

 // Check if mobile and setup responsive behavior
 function checkIfMobile() {
     const isMobile = window.innerWidth <= 576;
     
     if (isMobile && !menuToggle) {
         // Create menu toggle button if it doesn't exist
         const toggle = document.createElement('button');
         toggle.className = 'menu-toggle';
         toggle.innerHTML = '☰';
         document.body.appendChild(toggle);
         
         // Add event listener
         toggle.addEventListener('click', () => {
             sidebar.classList.toggle('expanded');
         });
     } else if (!isMobile && menuToggle) {
         menuToggle.classList.add('hidden');
     }
 }

 // Initialize on load
 window.addEventListener('load', initPage);
 
 // Update responsive layout on resize
 window.addEventListener('resize', checkIfMobile);