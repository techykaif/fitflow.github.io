import { auth, ref, get, database } from "./firebaseConfig.js";

const bellIcon = document.getElementById("bell-icon");
const loginDropdown = document.getElementById("login-history");

// Format email key for Firebase path
function formatEmail(email) {
  return email.toLowerCase().replace(/\./g, "_dot_").replace(/@/g, "_at_");
}function timeAgo(entry) {
    let date;
  
    if (typeof entry === "string") {
      const match = entry.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
      if (match) {
        const [_, dd, mm, yyyy, hh, min, ss] = match;
        date = new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`);
      } else {
        return "Invalid date format";
      }
    } else if (typeof entry === "number") {
      date = new Date(entry);
    } else {
      return "Invalid date format";
    }
  
    if (isNaN(date.getTime())) return "Invalid date";
  
    const now = new Date();
    const diff = now - date;
  
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
  
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  
    if (days > 0) return rtf.format(-days, "day");
    if (hours > 0) return rtf.format(-hours, "hour");
    if (minutes > 0) return rtf.format(-minutes, "minute");
    return rtf.format(-seconds, "second");
  }
    

// Handle bell icon click
bellIcon.addEventListener("click", async (e) => {
  e.stopPropagation();

  // Toggle dropdown visibility
  if (!loginDropdown.classList.contains("hidden")) {
    loginDropdown.classList.add("hidden");
    return;
  }

  const user = auth.currentUser;
  if (!user) return;

  const emailKey = formatEmail(user.email);
  const loginRef = ref(database, `users/${emailKey}/login_activity`);

  try {
    const snapshot = await get(loginRef);
    const ul = loginDropdown.querySelector("ul");
    if (!ul) return console.error("Dropdown <ul> not found");
    ul.innerHTML = "";

    if (snapshot.exists()) {
      const data = snapshot.val();
      const previousLogins = data.previous_logins || [];
      const lastLogin = data.last_login || null;

      const combinedLogins = [...previousLogins, lastLogin].filter(Boolean).slice(-3).reverse();

      combinedLogins.forEach((entry, index) => {
        const li = document.createElement("li");

        // Top one = "x minutes ago", others = raw timestamp
        if (index === 0) {
          li.innerHTML = `
            <div class="login-time">
              <span class="icon">🕒</span>
              <span>${timeAgo(entry)}</span>
            </div>
          `;
        } else {
          li.innerHTML = `
            <div class="login-time">
              <span class="icon">📅</span>
              <span>${entry}</span>
            </div>
          `;
        }

        ul.appendChild(li);
      });

      loginDropdown.classList.remove("hidden");
      bellIcon.style.setProperty("--dot-visible", "none");
    } else {
      ul.innerHTML = "<li><div class='login-time'><span class='icon'>ℹ️</span><span>No login history found.</span></div></li>";
      loginDropdown.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error fetching login history:", error);
  }
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!bellIcon.contains(e.target) && !loginDropdown.contains(e.target)) {
    loginDropdown.classList.add("hidden");
  }
});
