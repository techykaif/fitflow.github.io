


// Testimonial slider
let currentTestimonialIndex = 0;
const testimonials = document.querySelectorAll('.testimonial');

// Function to show the correct testimonial based on the index
function showTestimonial(index) {
    testimonials.forEach((testimonial, i) => {
        testimonial.classList.remove('active');
        if (i === index) {
            testimonial.classList.add('active');
        }
    });
}

// Next and previous testimonial functions
function nextTestimonial() {
    currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
    showTestimonial(currentTestimonialIndex);
}

function prevTestimonial() {
    currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
    showTestimonial(currentTestimonialIndex);
}

// Automatically switch testimonials every 5 seconds
setInterval(nextTestimonial, 5000);

// Initial call to show the first testimonial
showTestimonial(currentTestimonialIndex);

// Form validation
function validateForm() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    if (name === '' || email === '' || message === '') {
        alert('Please fill out all fields.');
        return false;
    }

    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    return true;
}

// Email validation helper function
function validateEmail(email) {
    const re = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return re.test(String(email).toLowerCase());
}

// Select the "Get Started" button
const ctaButton = document.querySelector('#trackerPageBtn');

// Function to animate the button and then navigate to the desired page
ctaButton.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent default anchor behavior

    // Add animation effect
    ctaButton.style.transition = 'transform 0.3s ease, background-color 0.3s ease';
    ctaButton.style.transform = 'scale(1.1)';
    ctaButton.style.backgroundColor = '#27ae60'; // Change color during animation

    // Timeout to wait for animation to complete, then navigate to the desired page
    setTimeout(() => {
        window.location.href = 'tracker.html'; // Replace with the actual page you want to navigate to
    }, 300); // Duration should match the animation time (300ms)
});

// Add hover effect for scaling up
ctaButton.addEventListener('mouseover', function () {
    ctaButton.style.transform = 'scale(1.05)';
    ctaButton.style.transition = 'transform 0.3s ease';
});

ctaButton.addEventListener('mouseout', function () {
    ctaButton.style.transform = 'scale(1)';
    ctaButton.style.transition = 'transform 0.3s ease';
});
