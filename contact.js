document.addEventListener("DOMContentLoaded", () => {
    // Form submission with feedback
    const contactForm = document.querySelector(".contact-form form")
    const formFeedback = document.createElement("div")
    formFeedback.className = "form-feedback"
    contactForm.after(formFeedback)
  
    const loadingSpinner = document.createElement("div")
    loadingSpinner.className = "loading-spinner"
    contactForm.after(loadingSpinner)
  
    contactForm.addEventListener("submit", (e) => {
      // Don't prevent default as we want the form to submit to Formspree
      // But we can add visual feedback
  
      const submitButton = contactForm.querySelector('button[type="submit"]')
      submitButton.disabled = true
      submitButton.textContent = "Sending..."
  
      loadingSpinner.style.display = "block"
  
      // This will run regardless of the form submission result
      // In a real implementation, you'd want to use fetch API to handle the submission
      // and provide accurate feedback based on the response
  
      // For demo purposes, we'll simulate a successful submission
      setTimeout(() => {
        loadingSpinner.style.display = "none"
        formFeedback.style.display = "block"
        formFeedback.className = "form-feedback success"
        formFeedback.textContent = "Your message has been sent! We'll get back to you soon."
  
        // Reset form after successful submission
        submitButton.disabled = false
        submitButton.textContent = "Send Message"
      }, 1500)
    })
  
    // Add subtle hover effects to the contact section
    const contactSection = document.querySelector(".contact")
  
    contactSection.addEventListener("mouseenter", () => {
      contactSection.style.boxShadow = "0 15px 40px rgba(0, 0, 0, 0.15)"
    })
  
    contactSection.addEventListener("mouseleave", () => {
      contactSection.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)"
    })
  
    // Map view button functionality
    const viewMapBtn = document.querySelector(".view-map-btn")
    if (viewMapBtn) {
      viewMapBtn.addEventListener("click", () => {
        // Open Google Maps in a new tab with the location
        window.open(
          "https://www.google.com/maps/search/?api=1&query=Newada+Samogar+Industrial+Area+Naini+Prayagraj+UP+211010",
          "_blank",
        )
      })
    }
  
    // Add animation to contact info items
    const contactInfoItems = document.querySelectorAll(".contact-info p")
    contactInfoItems.forEach((item, index) => {
      item.style.opacity = "0"
      item.style.transform = "translateX(-20px)"
      item.style.transition = "all 0.5s ease"
  
      setTimeout(
        () => {
          item.style.opacity = "1"
          item.style.transform = "translateX(0)"
        },
        300 + index * 100,
      )
    })
  
    // Add pulse animation to social media icons
    const socialIcons = document.querySelectorAll(".contact-social a")
    socialIcons.forEach((icon, index) => {
      setTimeout(
        () => {
          icon.classList.add("pulse")
        },
        500 + index * 200,
      )
    })
  
    // Optional: Add floating label functionality
    const inputFields = document.querySelectorAll(".input-container input, .input-container textarea")
    inputFields.forEach((field) => {
      field.addEventListener("focus", () => {
        field.parentElement.classList.add("focused")
      })
  
      field.addEventListener("blur", () => {
        if (field.value === "") {
          field.parentElement.classList.remove("focused")
        }
      })
  
      // Check on load if the field already has a value
      if (field.value !== "") {
        field.parentElement.classList.add("focused")
      }
    })
  })
  
  // Add a subtle parallax effect to the contact section
  window.addEventListener("scroll", () => {
    const contactSection = document.querySelector(".contact")
    const scrollPosition = window.scrollY
  
    if (contactSection) {
      const offset = scrollPosition * 0.05
      contactSection.style.backgroundPosition = `center ${offset}px`
    }
  })
  