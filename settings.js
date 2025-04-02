import { auth, database, ref, get, update, onAuthStateChanged, signOut } from "./firebaseConfig.js";

// Function to format email for Firebase keys
function formatEmail(email) {
    return email.toLowerCase().replace(/\./g, "_dot_").replace(/@/g, "_at_");
}

const changePass=document.getElementById("changePasswordBtn")
changePass.addEventListener("click", () => {
    window.location.href = "changepassword.html";
});
// Function to show custom toast messages
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");
    }, 100); // Smooth fade-in

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 500); // Smooth fade-out
    }, 3000);
}

// Get UI elements
const logoutBtn = document.getElementById("logoutBtn");
const saveChangesBtn = document.getElementById("saveChangesBtn");
const nameInput = document.getElementById("name");

// Check if the user is logged in and fetch data
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "tracker.html";
    } else {
        const formattedEmail = formatEmail(user.email);
        const userRef = ref(database, `users/${formattedEmail}/personal_information`);

        get(userRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    document.getElementById("user-name").textContent = userData.name || "User";
                    nameInput.value = userData.name || "";
                    document.getElementById("user-email").textContent = userData.email || "No Email";

                    const avatarElement = document.getElementById("user-avatar");
                    if (user.photoURL) {
                        avatarElement.innerHTML = `<img src="${user.photoURL}" alt="User Avatar">`;
                    } else {
                        const initials = userData.name ? userData.name[0].toUpperCase() : "U";
                        avatarElement.textContent = initials;
                    }
                }
            })
            .catch((error) => console.error("Error fetching user data:", error));
    }
});

// Save Changes - Update Name in Firebase
saveChangesBtn.addEventListener("click", () => {
    const newName = nameInput.value.trim();
    if (newName === "") {
        showToast("Name cannot be empty.", "error");
        return;
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const formattedEmail = formatEmail(user.email);
            const userRef = ref(database, `users/${formattedEmail}/personal_information`);

            update(userRef, { name: newName })
                .then(() => {
                    document.getElementById("user-name").textContent = newName;
                    showToast("Name updated successfully!", "success");
                })
                .catch((error) => {
                    showToast("Error updating name: " + error.message, "error");
                });
        }
    });
});

// Logout Button - Sign out the user
document.addEventListener("DOMContentLoaded", () => {
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            signOut(auth)
                .then(() => {
                    showToast("Logged out successfully!", "success");
                    setTimeout(() => (window.location.href = "login.html"), 1500);
                })
                .catch((error) => {
                    showToast("Error logging out: " + error.message, "error");
                });
        });
    }
});

// Dashboard Navigation
document.getElementById("dashboardBtn").addEventListener("click", () => {
    window.location.href = "dashboard.html";
});