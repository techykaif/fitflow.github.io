document.addEventListener("DOMContentLoaded", () => {
    // Animate stats in hero section
    animateStats()
  
    // Testimonial slider functionality
    initTestimonialSlider()
  
    // Animate elements on scroll
    window.addEventListener("scroll", animateOnScroll)
    animateOnScroll() // Initial check
  })
  
  // Stats animation
  function animateStats() {
    // Steps counter animation
    const stepCounter = document.getElementById("step-counter")
    const stepProgress = document.getElementById("step-progress")
    animateCounter(stepCounter, 0, 8432, 2000)
    setTimeout(() => {
      stepProgress.style.width = "84.32%"
    }, 500)
  
    // Calories counter animation
    const calorieCounter = document.getElementById("calorie-counter")
    const calorieProgress = document.getElementById("calorie-progress")
    animateCounter(calorieCounter, 0, 320, 2000)
    setTimeout(() => {
      calorieProgress.style.width = "64%"
    }, 500)
  
    // Heart rate counter animation
    const heartCounter = document.getElementById("heart-counter")
    animateCounter(heartCounter, 0, 72, 2000)
  
    // Water intake counter animation
    const waterCounter = document.getElementById("water-counter")
    const waterLevel = document.getElementById("water-level")
    animateCounter(waterCounter, 0, 1.5, 2000, 1)
    setTimeout(() => {
      waterLevel.style.height = "75%"
    }, 500)
  }
  
  function animateCounter(element, start, end, duration, decimals = 0) {
    let startTimestamp = null
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const value = progress * (end - start) + start
      element.innerHTML = value.toFixed(decimals)
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
  }
  
  // Testimonial slider
  function initTestimonialSlider() {
    const testimonials = document.querySelectorAll(".testimonial-card")
    const indicators = document.querySelectorAll(".indicator")
    const prevBtn = document.getElementById("prev-testimonial")
    const nextBtn = document.getElementById("next-testimonial")
    let currentIndex = 0
  
    // Function to show testimonial at specific index
    function showTestimonial(index) {
      // Remove active class from all testimonials and indicators
      testimonials.forEach((testimonial) => testimonial.classList.remove("active"))
      indicators.forEach((indicator) => indicator.classList.remove("active"))
  
      // Add active class to current testimonial and indicator
      testimonials[index].classList.add("active")
      indicators[index].classList.add("active")
      currentIndex = index
    }
  
    // Event listeners for indicators
    indicators.forEach((indicator) => {
      indicator.addEventListener("click", () => {
        const index = Number.parseInt(indicator.getAttribute("data-index"))
        showTestimonial(index)
      })
    })
  
    // Event listeners for prev/next buttons
    prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length
      showTestimonial(currentIndex)
    })
  
    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % testimonials.length
      showTestimonial(currentIndex)
    })
  
    // Auto-rotate testimonials
    let testimonialInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % testimonials.length
      showTestimonial(currentIndex)
    }, 5000)
  
    // Pause auto-rotation when hovering over testimonials
    const testimonialContainer = document.querySelector(".testimonial-container")
    testimonialContainer.addEventListener("mouseenter", () => {
      clearInterval(testimonialInterval)
    })
  
    testimonialContainer.addEventListener("mouseleave", () => {
      testimonialInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % testimonials.length
        showTestimonial(currentIndex)
      }, 5000)
    })
  }
  
  // Animate elements when they come into view
  function animateOnScroll() {
    const elements = document.querySelectorAll(".feature-card, .step, .section-header")
  
    elements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top
      const screenPosition = window.innerHeight / 1.3
  
      if (elementPosition < screenPosition) {
        element.style.opacity = "1"
        element.style.transform = "translateY(0)"
      } else {
        element.style.opacity = "0"
        element.style.transform = "translateY(20px)"
      }
    })
  }
  
  // Add hover effects to feature cards
  document.querySelectorAll(".feature-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-10px)"
      card.style.boxShadow = "0 15px 30px rgba(0, 0, 0, 0.1)"
    })
  
    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0)"
      card.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"
    })
  })
  
  