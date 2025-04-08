// FAQ Accordion functionality
document.addEventListener("DOMContentLoaded", () => {
    // Initialize FAQ accordion
    const faqItems = document.querySelectorAll(".faq-item")
  
    faqItems.forEach((item) => {
      const question = item.querySelector("h3")
  
      question.addEventListener("click", () => {
        // Close all other items
        faqItems.forEach((otherItem) => {
          if (otherItem !== item && otherItem.classList.contains("active")) {
            otherItem.classList.remove("active")
          }
        })
  
        // Toggle current item
        item.classList.toggle("active")
      })
    })
  
    // Form submission with feedback
    const supportForm = document.querySelector(".support-form form")
    const formFeedback = document.createElement("div")
    formFeedback.className = "form-feedback"
    supportForm.after(formFeedback)
  
    const loadingSpinner = document.createElement("div")
    loadingSpinner.className = "loading-spinner"
    supportForm.after(loadingSpinner)
  
    supportForm.addEventListener("submit", (e) => {
      // Don't prevent default as we want the form to submit to Formspree
      // But we can add visual feedback
  
      const submitButton = supportForm.querySelector('button[type="submit"]')
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
        submitButton.textContent = "Submit"
      }, 1500)
    })
  
    // Add subtle hover effects to the support section
    const supportSection = document.querySelector(".support")
  
    supportSection.addEventListener("mouseenter", () => {
      supportSection.style.boxShadow = "0 15px 40px rgba(0, 0, 0, 0.15)"
    })
  
    supportSection.addEventListener("mouseleave", () => {
      supportSection.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)"
    })
  
    // Add animation classes on scroll
    const animateOnScroll = () => {
      const elements = document.querySelectorAll(".faq-item")
  
      elements.forEach((element, index) => {
        const elementTop = element.getBoundingClientRect().top
        const elementVisible = 150
  
        if (elementTop < window.innerHeight - elementVisible) {
          setTimeout(() => {
            element.style.opacity = "1"
            element.style.transform = "translateY(0)"
          }, index * 100)
        }
      })
    }
  
    // Set initial state for scroll animations
    const faqItemsForScroll = document.querySelectorAll(".faq-item")
    faqItemsForScroll.forEach((item) => {
      item.style.opacity = "0"
      item.style.transform = "translateY(20px)"
      item.style.transition = "all 0.5s ease"
    })
  
    // Listen for scroll events
    window.addEventListener("scroll", animateOnScroll)
    // Trigger once on load
    animateOnScroll()
  })
  