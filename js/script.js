        // Form step navigation
        let currentStep = 1;
        const totalSteps = 3;
        
        function updateProgressBar() {
            const progress = (currentStep / totalSteps) * 100;
            document.getElementById('progressBar').style.width = progress + '%';
        }
        
        function showStep(step) {
            // Hide all steps
            document.querySelectorAll('.form-step').forEach(s => {
                s.classList.add('d-none');
                s.classList.remove('active');
            });
            
            // Show current step
            const stepElement = document.getElementById('step' + step);
            if (stepElement) {
                stepElement.classList.remove('d-none');
                stepElement.classList.add('active');
            }
            
            currentStep = step;
            updateProgressBar();
        }
        
        function nextStep() {
            if (validateCurrentStep() && currentStep < totalSteps) {
                showStep(currentStep + 1);
            }
        }
        
        function prevStep() {
            if (currentStep > 1) {
                showStep(currentStep - 1);
            }
        }
        
        function validateCurrentStep() {
            const currentStepElement = document.getElementById('step' + currentStep);
            if (!currentStepElement) return false;
            
            const requiredInputs = currentStepElement.querySelectorAll('[required]');
            let isValid = true;
            
            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('is-invalid');
                    isValid = false;
                } else {
                    input.classList.remove('is-invalid');
                }
            });
            
            // Special validation for equipment checkboxes in step 2
            if (currentStep === 2) {
                const equipmentChecked = currentStepElement.querySelectorAll('input[name="equipment[]"]:checked');
                if (equipmentChecked.length === 0) {
                    alert('Please select at least one equipment type.');
                    isValid = false;
                }
            }
            
            return isValid;
        }
        
        // Earnings calculator
        document.getElementById('calculateEarnings')?.addEventListener('click', function() {
            const equipmentType = document.getElementById('equipmentType').value;
            const milesPerWeek = parseFloat(document.getElementById('milesPerWeek').value);
            const ratePerMile = parseFloat(document.getElementById('ratePerMile').value);
            const driverType = document.getElementById('driverType').value;
            
            if (!equipmentType || !milesPerWeek || !ratePerMile) {
                alert('Please fill in all fields');
                return;
            }
            
            // Determine dispatch fee based on equipment type
            let dispatchFeePercent = 0.06; // 6% default
            if (equipmentType === 'box_truck' || equipmentType === 'carhauler') {
                dispatchFeePercent = 0.12; // 12% for box truck and car hauler
            }
            if(equipmentType === 'sprintervan') {
                dispatchFeePercent = 0.15; // 12% for sprinter van
            }
            if(equipmentType === 'power_only') {
                dispatchFeePercent = 0.08; // 8% for Power Only
            }
            
            // Adjust for team drivers (roughly double the miles)
            const adjustedMiles = driverType === 'team' ? milesPerWeek * 1.8 : milesPerWeek;
            
            const grossRevenue = adjustedMiles * ratePerMile;
            const dispatchFee = grossRevenue * dispatchFeePercent;
            const netEarnings = grossRevenue - dispatchFee;
            
            // Display results
            document.getElementById('grossRevenue').textContent = '$' + grossRevenue.toLocaleString('en-US', {maximumFractionDigits: 0});
            document.getElementById('dispatchFee').textContent = '$' + dispatchFee.toLocaleString('en-US', {maximumFractionDigits: 0}) + ' (' + (dispatchFeePercent * 100) + '%)';
            document.getElementById('netEarnings').textContent = '$' + netEarnings.toLocaleString('en-US', {maximumFractionDigits: 0});
            
            document.getElementById('earningsResult').classList.remove('d-none');
        });
        
        // Update equipment rates when equipment type changes
        document.getElementById('equipmentType')?.addEventListener('change', function() {
            const rateInput = document.getElementById('ratePerMile');
            const rates = {
                'power_only': 2.50,
                'dry_van': 2.70,
                'reefer': 3.40,
                'flatbed': 3.20,
                'step_deck': 3.50,
                'box_truck': 2,
                'sprintervan': 1,
                'carhauler': 1.5,
                'hotshot': 2.5
            };
            
            if (rates[this.value]) {
                rateInput.value = rates[this.value];
            }
        });
        
        // Form submissions
        document.getElementById('carrierForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateCurrentStep()) {
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';
            submitBtn.disabled = true;
            
            // Use FormSpree to handle form submission
            const formData = new FormData(this);
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    // Hide form steps and show success
                    document.querySelectorAll('.form-step').forEach(s => s.classList.add('d-none'));
                    document.getElementById('successStep').classList.remove('d-none');
                    document.getElementById('progressBar').style.width = '100%';
                    
                    // Scroll to top of form
                    document.getElementById('onboarding').scrollIntoView({ behavior: 'smooth' });
                } else {
                    throw new Error('Form submission failed');
                }
            }).catch(error => {
                alert('There was an error submitting your application. Please try again or contact us directly.');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
        
        // Contact form submission
        document.getElementById('contactForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
            submitBtn.disabled = true;
            
            const formData = new FormData(this);
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    // Show success message
                    const successAlert = document.createElement('div');
                    successAlert.className = 'alert alert-success mt-3';
                    successAlert.innerHTML = '<i class="fas fa-check-circle me-2"></i>Thank you! Your message has been sent successfully. We\'ll contact you within 24 hours.';
                    this.parentNode.insertBefore(successAlert, this.nextSibling);
                    
                    // Reset form
                    this.reset();
                    
                    // Remove success message after 5 seconds
                    setTimeout(() => {
                        successAlert.remove();
                    }, 5000);
                } else {
                    throw new Error('Form submission failed');
                }
            }).catch(error => {
                // Show error message
                const errorAlert = document.createElement('div');
                errorAlert.className = 'alert alert-danger mt-3';
                errorAlert.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Sorry, there was an error sending your message. Please try again or call us directly.';
                this.parentNode.insertBefore(errorAlert, this.nextSibling);
                
                setTimeout(() => {
                    errorAlert.remove();
                }, 5000);
            }).finally(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
        
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            // Show first step
            showStep(1);
            
            // Add animation to elements when they come into view
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-on-scroll');
                    }
                });
            }, observerOptions);
            
            // Observe elements for animation
            document.querySelectorAll('.service-card, .truck-card, .stats-card, .testimonial-card, .state-item').forEach(el => {
                observer.observe(el);
            });
        });
        
        // Navbar background change on scroll
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(27, 54, 93, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.background = 'var(--gradient)';
                navbar.style.backdropFilter = 'none';
            }
        });

        // Update navbar active links on scroll
        window.addEventListener('scroll', function() {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
            
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.getBoundingClientRect().top;
                if (sectionTop <= 100) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        });