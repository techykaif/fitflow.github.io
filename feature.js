document.addEventListener("DOMContentLoaded", () => {
    // Tab functionality
    const tabButtons = document.querySelectorAll(".tab-btn")
    const tabPanes = document.querySelectorAll(".tab-pane")
  
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Remove active class from all buttons and panes
        tabButtons.forEach((btn) => btn.classList.remove("active"))
        tabPanes.forEach((pane) => pane.classList.remove("active"))
  
        // Add active class to clicked button and corresponding pane
        button.classList.add("active")
        const tabId = button.getAttribute("data-tab")
        document.getElementById(tabId).classList.add("active")
      })
    })
  
    // Animate elements when they come into view
    const animateOnScroll = () => {
      const elements = document.querySelectorAll(".step, .feature-box")
  
      elements.forEach((element) => {
        const elementPosition = element.getBoundingClientRect().top
        const screenPosition = window.innerHeight / 1.3
  
        if (elementPosition < screenPosition) {
          element.style.opacity = "1"
          element.style.transform = "translateY(0)"
        }
      })
    }
  
    // Initial animation check
    animateOnScroll()
  
    // Listen for scroll events
    window.addEventListener("scroll", animateOnScroll)
  
    // Add hover effects to feature boxes
    const featureBoxes = document.querySelectorAll(".feature-box")
    featureBoxes.forEach((box) => {
      box.addEventListener("mouseenter", () => {
        box.style.transform = "translateY(-10px)"
        box.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.1)"
      })
  
      box.addEventListener("mouseleave", () => {
        box.style.transform = "translateY(0)"
        box.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"
      })
    })
  })
  
  