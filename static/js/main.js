/**
 * AgriSathi Main JavaScript
 * Handles navigation, smooth scrolling, and general UI interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lenis smooth scrolling
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // GSAP ScrollTrigger integration
    gsap.registerPlugin(ScrollTrigger);

    // Animate elements on scroll
    gsap.utils.toArray('.feature-card').forEach((card, index) => {
        gsap.fromTo(card, 
            { 
                opacity: 0, 
                y: 50,
                scale: 0.9
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                delay: index * 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Hero section parallax effect
    gsap.to('.hero-bg', {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
            trigger: ".hero-section",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });

    // Mobile menu functionality
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            
            // Animate menu items
            if (!mobileMenu.classList.contains('hidden')) {
                gsap.fromTo(mobileMenu.querySelectorAll('a'), 
                    { opacity: 0, x: -20 },
                    { 
                        opacity: 1, 
                        x: 0, 
                        duration: 0.3, 
                        stagger: 0.1,
                        ease: "power2.out"
                    }
                );
            }
        });
    }

    // Smooth anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                lenis.scrollTo(target, {
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });

    // Form input animations
    const formInputs = document.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });

    // Sample question click handlers
    document.querySelectorAll('.sample-question').forEach(question => {
        question.addEventListener('click', function() {
            const marathiText = this.querySelector('p:first-child').textContent;
            // Navigate to chat page with pre-filled text
            window.location.href = `/chat?text=${encodeURIComponent(marathiText)}`;
        });
    });

    // Loading state management
    window.showLoading = function(element) {
        if (element) {
            element.classList.remove('hidden');
            element.querySelector('.loading-dots')?.classList.add('animate-pulse');
        }
    };

    window.hideLoading = function(element) {
        if (element) {
            element.classList.add('hidden');
        }
    };

    // Error handling
    window.showError = function(message, element) {
        if (element) {
            element.classList.remove('hidden');
            const errorMessage = element.querySelector('#error-message');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
        }
    };

    window.hideError = function(element) {
        if (element) {
            element.classList.add('hidden');
        }
    };

    // Success notifications
    window.showSuccess = function(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    };

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);

    // Observe elements for fade-in animation
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // Lenis animation frame
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Handle page visibility changes
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Pause animations when page is hidden
            gsap.globalTimeline.pause();
        } else {
            // Resume animations when page is visible
            gsap.globalTimeline.resume();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Escape key closes mobile menu
        if (e.key === 'Escape' && mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }
    });

    // Preload critical images
    const criticalImages = [
        '/static/assets/logo.svg',
        '/static/assets/hero-plant.json'
    ];

    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = src;
        link.as = src.endsWith('.svg') ? 'image' : 'fetch';
        document.head.appendChild(link);
    });

    console.log('AgriSathi initialized successfully! 🌱');
});


