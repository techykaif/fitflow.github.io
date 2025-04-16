function createSidebar() {
  const sidebar = document.createElement("aside");
  sidebar.className = "sidebar";

  const currentPath = window.location.pathname;
  const pageName = currentPath.split("/").pop() || "index.html";

  sidebar.innerHTML = `
    <div class="logo">
      <h2 style="cursor: pointer;font-weight: 700 !important;font-size: 1.5rem !important;
    line-height: 1.2;
    margin-bottom: 0.5rem; " onclick="window.location.href='index.html'">FitFlow</h2>
    </div>
    <button class="close-sidebar-btn">❌</button>
    <nav class="nav">
      <ul>
        <li class="${pageName === "dashboard.html" ? "active" : ""}">
          <a href="dashboard.html"><span class="icon">📊</span> Dashboard</a>
        </li>
        <li class="${pageName === "progress.html" ? "active" : ""}">
          <a href="progress.html"><span class="icon">📈</span> Progress</a>
        </li>
        <li class="${pageName === "activites.html" ? "active" : ""}">
          <a href="activites.html"><span class="icon">👟</span> Activities</a>
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
  `;

  return sidebar;
}

// Mobile sidebar setup
function setupMobileMenu() {
  const dashboard = document.querySelector(".dashboard");
  const header = document.querySelector(".header");
  const sidebar = document.querySelector(".sidebar");

  // Hamburger button
  let hamburger = document.querySelector(".hamburger-menu");
  if (!hamburger) {
    hamburger = document.createElement("button");
    hamburger.className = "hamburger-menu";
    hamburger.innerHTML = "☰";
    hamburger.style.cssText = `
      display: none;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      margin-right: 15px;
    `;
    header.prepend(hamburger);
  }

  // Close button is already in sidebar HTML (class="close-sidebar-btn")
  const closeSidebarBtn = sidebar.querySelector(".close-sidebar-btn");
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

  const mediaQuery = window.matchMedia("(max-width: 768px)");

  function handleScreenChange(e) {
    if (e.matches) {
      hamburger.style.display = "block";
      closeSidebarBtn.style.display = "block";
    } else {
      hamburger.style.display = "none";
      closeSidebarBtn.style.display = "none";
      sidebar.classList.remove("active");
    }
  }

  mediaQuery.addEventListener("change", handleScreenChange);
  handleScreenChange(mediaQuery);

  hamburger.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });

  closeSidebarBtn.addEventListener("click", () => {
    sidebar.classList.remove("active");
  });
}

// Initialize sidebar component
function initSidebar() {
  const dashboard = document.querySelector(".dashboard");

  if (dashboard) {
    const existingSidebar = document.querySelector(".sidebar");
    const newSidebar = createSidebar();

    if (existingSidebar) {
      dashboard.replaceChild(newSidebar, existingSidebar);
    } else {
      dashboard.prepend(newSidebar);
    }

    setupMobileMenu();
    loadUserData();
  }
}

function loadUserData() {
  // Load user info here
}

export { initSidebar };
