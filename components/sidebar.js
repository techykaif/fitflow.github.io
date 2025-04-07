// This file creates a reusable sidebar component that can be included in all pages

function createSidebar() {
    // Create the sidebar element
    const sidebar = document.createElement("aside")
    sidebar.className = "sidebar"
  
    // Get the current page path to highlight the active link
    const currentPath = window.location.pathname
    const pageName = currentPath.split("/").pop() || "index.html"
  
    // Create the sidebar content
    sidebar.innerHTML = `
      <div class="logo">
        <h2 style="cursor: pointer;" onclick="window.location.href='index.html'">FitFlow</h2>
      </div>
      <nav class="nav">
        <ul>
          <li class="${pageName === "dashboard.html" ? "active" : ""}">
            <a href="dashboard.html"><span class="icon">📊</span> Dashboard</a>
          </li>
          <li class="${pageName === "activites.html" ? "active" : ""}">
            <a href="activites.html"><span class="icon">👟</span> Activities</a>
          </li>
          <li class="${pageName === "progress.html" ? "active" : ""}">
            <a href="progress.html"><span class="icon">📈</span> Progress</a>
          </li>
          <li class="${pageName === "nutrition.html" ? "active" : ""}">
            <a href="nutrition.html"><span class="icon">🍎</span> Nutrition</a>
          </li>
          <li class="${pageName === "sleep.html" ? "active" : ""}">
            <a href="sleep.html"><span class="icon">💤</span> Sleep</a>
          </li>
          <li class="${pageName === "settings.html" ? "active" : ""}">
            <a href="settings.html"><span class="icon">⚙️</span> Settings</a>
          </li>
        </ul>
      </nav>
      <div class="user-profile">
        <div class="avatar" id="user-avatar">JD</div>
        <div class="user-info">
          <h4 id="user-name">Loading...</h4>
        </div>
      </div>
    `
  
    return sidebar
  }
  
  // Function to add mobile menu toggle functionality
  function setupMobileMenu() {
    const dashboard = document.querySelector(".dashboard")
    const sidebar = document.querySelector(".sidebar")
  
    // Check if mobile toggle already exists
    let menuToggle = document.querySelector(".menu-toggle")
  
    // Create mobile menu toggle if it doesn't exist
    if (!menuToggle) {
      menuToggle = document.createElement("button")
      menuToggle.className = "menu-toggle"
      menuToggle.innerHTML = "☰"
      menuToggle.style.display = "none" // Hide by default
      dashboard.prepend(menuToggle)
    }
  
    // Add event listener to toggle sidebar
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("expanded")
    })
  
    // Check screen size and adjust sidebar visibility
    function checkScreenSize() {
      const isMobile = window.innerWidth <= 576
  
      if (isMobile) {
        menuToggle.style.display = "flex"
        sidebar.classList.remove("expanded")
      } else {
        menuToggle.style.display = "none"
        sidebar.classList.remove("expanded")
      }
    }
  
    // Initial check
    checkScreenSize()
  
    // Listen for window resize
    window.addEventListener("resize", checkScreenSize)
  }
  
  // Function to initialize the sidebar
  function initSidebar() {
    const dashboard = document.querySelector(".dashboard")
  
    if (dashboard) {
      // Get existing sidebar if any
      const existingSidebar = document.querySelector(".sidebar")
  
      if (existingSidebar) {
        // Replace existing sidebar
        const newSidebar = createSidebar()
        dashboard.replaceChild(newSidebar, existingSidebar)
      } else {
        // Add new sidebar at the beginning of dashboard
        const newSidebar = createSidebar()
        dashboard.prepend(newSidebar)
      }
  
      // Setup mobile menu
      setupMobileMenu()
  
      // Load user data
      loadUserData()
    }
  }
  
  // Function to load user data
  function loadUserData() {
    
  }
  
  // Export the initialization function
  export { initSidebar }
  
  