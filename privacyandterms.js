// Get modal elements
const privacyModal = document.getElementById("privacy-modal");
const termsModal = document.getElementById("terms-modal");

// Get close buttons
const closePrivacyBtn = document.querySelector(".close-btn");
const closeTermsBtn = document.querySelector(".terms-close-btn");

// Get understood buttons
const understoodPrivacyBtn = document.getElementById("understood-btn");
const understoodTermsBtn = document.getElementById("terms-understood-btn");

// Open Privacy modal
document.querySelector(".quick-links a[href='#']").addEventListener("click", function (event) {
    event.preventDefault(); // Prevent default link behavior
    privacyModal.style.display = "flex"; // Show Privacy modal
});

// Open Terms modal
document.querySelector(".quick-links a[href='#terms']").addEventListener("click", function (event) {
    event.preventDefault(); // Prevent default link behavior
    termsModal.style.display = "flex"; // Show Terms modal
});

// Close Privacy modal
closePrivacyBtn.addEventListener("click", function () {
    privacyModal.style.display = "none"; // Hide modal
});

// Close Terms modal
closeTermsBtn.addEventListener("click", function () {
    termsModal.style.display = "none"; // Hide modal
});

// Close modal on 'Understood' button
understoodPrivacyBtn.addEventListener("click", function () {
    privacyModal.style.display = "none"; // Hide modal
});
understoodTermsBtn.addEventListener("click", function () {
    termsModal.style.display = "none"; // Hide modal
});

// Close modal if clicked outside of the modal content
window.addEventListener("click", function (event) {
    if (event.target == privacyModal) {
        privacyModal.style.display = "none";
    }
    if (event.target == termsModal) {
        termsModal.style.display = "none";
    }
});