// script.js

document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMobileMenuButton = document.getElementById('close-mobile-menu');
    const learnMoreButtons = document.querySelectorAll('#programs .card button');
    const downloadProspectusButton = document.querySelector('#admission .btn-primary');
    const contactForm = document.querySelector('#contact form');
    const newsletterForm = document.querySelector('footer form');
    const scrollToTopButton = document.createElement('button'); // Defined here for broader scope

    // --- Custom Message Box Implementation (replaces alert/confirm) ---
    function showMessage(message, type = 'info') {
        let messageBox = document.getElementById('custom-message-box');
        if (!messageBox) {
            messageBox = document.createElement('div');
            messageBox.id = 'custom-message-box';
            messageBox.classList.add('fixed', 'bottom-8', 'left-1/2', '-translate-x-1/2', 'p-4', 'rounded-lg', 'shadow-lg', 'text-white', 'text-center', 'z-[1000]', 'opacity-0', 'transition-opacity', 'duration-300', 'pointer-events-none');
            document.body.appendChild(messageBox);
        }

        messageBox.textContent = message;
        messageBox.classList.remove('bg-green-500', 'bg-red-500', 'bg-blue-500'); // Clear previous types
        if (type === 'success') {
            messageBox.classList.add('bg-green-500');
        } else if (type === 'error') {
            messageBox.classList.add('bg-red-500');
        } else { // info
            messageBox.classList.add('bg-blue-500');
        }

        messageBox.classList.remove('opacity-0', 'pointer-events-none');
        messageBox.classList.add('opacity-100');

        setTimeout(() => {
            messageBox.classList.remove('opacity-100');
            messageBox.classList.add('opacity-0', 'pointer-events-none');
        }, 3000); // Message disappears after 3 seconds
    }
    // --- End Custom Message Box ---


    // Function to show a specific section
    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            // Scroll to the top of the section with a smooth behavior
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Event listeners for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            if (sectionId) {
                showSection(sectionId);
                // Close mobile menu if open
                mobileMenu.classList.remove('open');
            }
        });
    });

    // Handle initial hash in URL for direct access
    const initialHash = window.location.hash.substring(1);
    if (initialHash && document.getElementById(initialHash)) {
        showSection(initialHash);
    } else {
        showSection('home'); // Default to home section
    }

    // Mobile menu toggle
    mobileMenuButton.addEventListener('click', function() {
        mobileMenu.classList.add('open');
    });

    closeMobileMenuButton.addEventListener('click', function() {
        mobileMenu.classList.remove('open');
    });

    // Close mobile menu when clicking outside (optional, but good UX)
    document.addEventListener('click', function(event) {
        if (!mobileMenu.contains(event.target) && !mobileMenuButton.contains(event.target) && mobileMenu.classList.contains('open')) {
            mobileMenu.classList.remove('open');
        }
    });

    // Add scroll-to-top button functionality
    scrollToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollToTopButton.classList.add('fixed', 'bottom-8', 'right-8', 'bg-blue-600', 'text-white', 'p-4', 'rounded-full', 'shadow-lg', 'hover:bg-blue-700', 'transition-all', 'duration-300', 'z-40', 'opacity-0', 'pointer-events-none');
    document.body.appendChild(scrollToTopButton);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopButton.classList.remove('opacity-0', 'pointer-events-none');
            scrollToTopButton.classList.add('opacity-100');
        } else {
            scrollToTopButton.classList.remove('opacity-100');
            scrollToTopButton.classList.add('opacity-0', 'pointer-events-none');
        }
    });

    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- New Button Functionality ---

    // "Learn More" buttons in Programs section
    learnMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const programTitle = this.closest('.card').querySelector('h3').textContent;
            showMessage(`You clicked 'Learn More' for: ${programTitle}`, 'info');
            // In a real application, this would navigate to a detailed program page or open a modal with more info.
        });
    });

    // "Download Prospectus" button in Admission section
    if (downloadProspectusButton) {
        downloadProspectusButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent actual navigation
            showMessage('Simulating prospectus download...', 'success');
            // In a real application, you would trigger a file download here.
            // Example: window.open('path/to/your/prospectus.pdf', '_blank');
        });
    }

    // Contact Form submission - UPDATED FOR MAILTO
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default form submission

            const recipientEmail = 'ahsankhantareen991@gmail.com';
            const name = contactForm.name.value;
            const email = contactForm.email.value;
            const subject = contactForm.subject.value || 'General Inquiry from BUETK Website';
            const message = contactForm.message.value;

            // Construct the mailto link
            const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;

            // Open the user's default email client
            window.open(mailtoLink, '_blank');

            showMessage('Opening your email client to send the message...', 'info');
            contactForm.reset(); // Clear the form after attempting to open mail client
        });
    }

    // Newsletter Form submission
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default form submission
            // In a real application, you would send the email to a newsletter service.
            console.log('Newsletter signup:', newsletterForm.querySelector('input[type="email"]').value);

            showMessage('Thank you for subscribing to our newsletter!', 'success');
            newsletterForm.reset(); // Clear the form
        });
    }

    
});
