// === NAPRAWIONA APLIKACJA - BARTŁOMIEJ PŁÓCIENNIK ===
// TYLKO GOOGLE SHEETS - BEZ NETLIFY + OBSŁUGA CHECKBOXA RODO

class ModernApp {
    constructor() {
        this.isInitialized = false;
        this.observers = new Map();
        this.formState = {
            isSubmitting: false,
            validationEnabled: false
        };
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize(), { once: true });
        } else {
            this.initialize();
        }
    }

    // === INICJALIZACJA ===
    initialize() {
        if (this.isInitialized) return;
        
        console.log('🚀 Initializing app...');
        
        try {
            this.initializeHeader();
            this.initializeMobileMenu();
            this.initializeForm();
            this.initializeCTAPopup();
            this.initializeScrollEffects();
            this.initializeSmoothScroll();
            this.initializeMouseGradient();
            this.initializeFloatingWords();
            
            this.isInitialized = true;
            console.log('✅ App initialized successfully');
        } catch (error) {
            console.error('❌ App initialization failed:', error);
        }
    }

    // === HEADER SCROLL ===
    initializeHeader() {
        const header = document.querySelector('.main-header');
        if (!header) return;

        let isScrolled = false;

        const updateHeader = () => {
            const scrolledNow = window.pageYOffset > 50;
            if (scrolledNow !== isScrolled) {
                isScrolled = scrolledNow;
                header.classList.toggle('scrolled', isScrolled);
            }
        };

        window.addEventListener('scroll', updateHeader, { passive: true });
        console.log('✅ Header initialized');
    }

    // === MOBILE MENU ===
    initializeMobileMenu() {
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const mainNav = document.getElementById('main-nav');
        const header = document.querySelector('.main-header');

        if (!hamburgerBtn || !mainNav) {
            console.warn('Mobile menu elements not found');
            return;
        }

        if (!hamburgerBtn.querySelector('.hamburger-line')) {
            hamburgerBtn.innerHTML = `
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            `;
        }

        let isOpen = false;

        const toggleMenu = () => {
            isOpen = !isOpen;
            
            hamburgerBtn.classList.toggle('active', isOpen);
            mainNav.classList.toggle('mobile-active', isOpen);
            if (header) header.classList.toggle('nav-open', isOpen);
            document.body.classList.toggle('nav-open', isOpen);
            
            hamburgerBtn.setAttribute('aria-expanded', isOpen.toString());
        };

        const closeMenu = () => {
            if (isOpen) {
                isOpen = false;
                hamburgerBtn.classList.remove('active');
                mainNav.classList.remove('mobile-active');
                if (header) header.classList.remove('nav-open');
                document.body.classList.remove('nav-open');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            }
        };

        hamburgerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });

        mainNav.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                closeMenu();
            }
        });

        document.addEventListener('click', (e) => {
            if (isOpen && !mainNav.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) {
                closeMenu();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && isOpen) {
                closeMenu();
            }
        }, { passive: true });

        console.log('✅ Mobile menu initialized');
    }

    // === FORMULARZ Z OBSŁUGĄ CHECKBOXA ===
    initializeForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        console.log('✅ Initializing form...');

        const elements = {
            form,
            submitButton: form.querySelector('.btn-submit'),
            successState: document.getElementById('form-success-state'),
            mainError: document.getElementById('form-main-error'),
            phoneInput: document.getElementById('phone'),
            messageInput: document.getElementById('message'),
            formContainer: document.querySelector('.form-container')
        };

        // Phone formatting
        if (elements.phoneInput) {
            elements.phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '').substring(0, 9);
                e.target.value = value.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
            });
        }

        // Real-time validation dla wszystkich pól WŁĄCZNIE Z CHECKBOXEM
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        inputs.forEach(input => {
            // Różne eventy dla różnych typów pól
            if (input.type === 'checkbox') {
                // Dla checkbox tylko change
                input.addEventListener('change', () => {
                    this.formState.validationEnabled = true;
                    this.validateField(input);
                });
            } else {
                // Dla pozostałych pól blur i input
                input.addEventListener('blur', () => {
                    this.formState.validationEnabled = true;
                    this.validateField(input);
                });
                
                input.addEventListener('input', () => {
                    if (this.formState.validationEnabled || input.classList.contains('error')) {
                        this.validateField(input);
                    }
                });

                input.addEventListener('focus', () => {
                    this.clearFieldError(input);
                });
            }
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!this.formState.isSubmitting) {
                await this.handleFormSubmit(elements);
            }
        });

        console.log('✅ Form initialized');
    }

    validateField(field) {
        const value = field.value ? field.value.trim() : '';
        const errorSpan = field.closest('.form-group')?.querySelector('.error-message');
        let isValid = true;
        let message = '';

        // Usuń poprzednie klasy
        field.classList.remove('valid', 'error');
        
        // OBSŁUGA CHECKBOXA RODO
        if (field.type === 'checkbox' && field.name === 'privacy_consent') {
            const privacyLabel = document.querySelector('.privacy-checkbox');
            const privacyGroup = document.querySelector('.privacy-consent-group');
            
            if (field.required && !field.checked) {
                isValid = false;
                message = 'Musisz wyrazić zgodę na przetwarzanie danych osobowych.';
                
                if (privacyLabel) privacyLabel.classList.add('error');
                if (privacyGroup) privacyGroup.classList.add('error');
            } else if (field.checked) {
                if (privacyLabel) privacyLabel.classList.remove('error');
                if (privacyGroup) privacyGroup.classList.remove('error');
            }
        }
        // WALIDACJA DLA POZOSTAŁYCH PÓL
        else if (field.required && !value) {
            isValid = false;
            message = 'To pole jest wymagane.';
        } else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = 'Proszę podać poprawny adres e-mail.';
            }
        } else if (field.type === 'tel' && value) {
            const phoneNumber = value.replace(/\s/g, '');
            if (phoneNumber.length < 9) {
                isValid = false;
                message = 'Numer telefonu musi mieć co najmniej 9 cyfr.';
            }
        }

        // Dodaj klasy dla zwykłych pól (nie checkbox)
        if (field.type !== 'checkbox') {
            if (isValid && value) {
                if (field.id === 'message') {
                    if (value.length > 0) {
                        field.classList.add('valid');
                    }
                } else {
                    field.classList.add('valid');
                }
            } else if (!isValid) {
                field.classList.add('error');
            }
        }

        // Pokaż/ukryj komunikat błędu
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.classList.toggle('visible', !isValid && message);
        }

        return isValid;
    }

    clearFieldError(field) {
        const errorSpan = field.closest('.form-group')?.querySelector('.error-message');
        if (errorSpan && errorSpan.classList.contains('visible')) {
            errorSpan.classList.remove('visible');
        }
        
        // Dla checkboxa także wyczyść klasy error
        if (field.type === 'checkbox' && field.name === 'privacy_consent') {
            const privacyLabel = document.querySelector('.privacy-checkbox');
            const privacyGroup = document.querySelector('.privacy-consent-group');
            if (privacyLabel) privacyLabel.classList.remove('error');
            if (privacyGroup) privacyGroup.classList.remove('error');
        }
    }

    // === OBSŁUGA WYSYŁANIA FORMULARZA - TYLKO GOOGLE SHEETS ===
    async handleFormSubmit(elements) {
        const { form, submitButton, successState, mainError, formContainer } = elements;
        
        this.formState.isSubmitting = true;
        this.formState.validationEnabled = true;
        
        // Waliduj wszystkie wymagane pola WŁĄCZNIE Z CHECKBOXEM
        const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        let firstInvalidField = null;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
            }
        });

        if (!isValid) {
            this.showMainError(mainError, 'Proszę uzupełnić wszystkie wymagane pola.');
            
            if (firstInvalidField) {
                firstInvalidField.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                // Dla checkboxa nie focusuj, ale dla innych tak
                if (firstInvalidField.type !== 'checkbox') {
                    firstInvalidField.focus();
                }
            }
            
            this.formState.isSubmitting = false;
            return;
        }

        this.hideMainError(mainError);
        this.setSubmitButtonState(submitButton, true, 'Wysyłanie...');

        try {
            // Zbierz dane z formularza
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.timestamp = new Date().toISOString();
            
            console.log('📤 Sending form data:', data);
            
            // GOOGLE SHEETS URL - SPRAWDŹ CZY TO NAJNOWSZY!
            const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby3uZB6Jfda0FswbjnDncNoTSZnWPeZe2XzL3NwEmaml6Yg-xCvH3GCq7b2bYdL_U2-/exec';
            
            // Próba 1: Standardowy POST z obsługą CORS
            let success = false;
            
            try {
                console.log('🔄 Próba wysłania do Google Sheets...');
                
                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Odpowiedź z Google Sheets:', result);
                    
                    if (result.success) {
                        success = true;
                    } else {
                        throw new Error(result.error || result.message || 'Nieznany błąd serwera');
                    }
                } else {
                    throw new Error(`Błąd HTTP: ${response.status}`);
                }
                
            } catch (fetchError) {
                console.log('⚠️ Pierwszy POST nieudany:', fetchError.message);
                
                // Próba 2: no-cors mode (dla problemów z CORS)
                try {
                    console.log('🔄 Próba z no-cors mode...');
                    
                    await fetch(GOOGLE_SCRIPT_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });
                    
                    // W no-cors nie możemy sprawdzić odpowiedzi
                    // Ale jeśli nie ma błędu, prawdopodobnie poszło
                    console.log('✅ Wysłano w trybie no-cors');
                    success = true;
                    
                } catch (noCorsError) {
                    console.log('⚠️ No-cors również nieudany:', noCorsError.message);
                    
                    // Próba 3: przez ukryty formularz HTML
                    try {
                        console.log('🔄 Próba przez formularz HTML...');
                        
                        const hiddenForm = document.createElement('form');
                        hiddenForm.method = 'POST';
                        hiddenForm.action = GOOGLE_SCRIPT_URL;
                        hiddenForm.target = '_blank';
                        hiddenForm.style.display = 'none';
                        
                        Object.entries(data).forEach(([key, value]) => {
                            const input = document.createElement('input');
                            input.type = 'hidden';
                            input.name = key;
                            input.value = value;
                            hiddenForm.appendChild(input);
                        });
                        
                        document.body.appendChild(hiddenForm);
                        hiddenForm.submit();
                        document.body.removeChild(hiddenForm);
                        
                        // Poczekaj chwilę i załóż sukces
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        console.log('✅ Wysłano przez formularz HTML');
                        success = true;
                        
                    } catch (htmlError) {
                        console.error('❌ Wszystkie metody nieudane:', htmlError);
                        throw new Error('Nie udało się wysłać formularza żadną metodą');
                    }
                }
            }
            
            if (success) {
                // Pokaż sukces
                this.showFormSuccess(form, successState, formContainer);
                console.log('✅ Form submitted successfully!');
            } else {
                throw new Error('Nieznany błąd podczas wysyłania');
            }
            
        } catch (error) {
            console.error('❌ Form submission failed:', error);
            
            let errorMessage = 'Wystąpił błąd podczas wysyłania. Spróbuj ponownie lub skontaktuj się telefonicznie.';
            
            if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
                errorMessage = 'Sprawdź połączenie internetowe i spróbuj ponownie.';
            } else if (error.message.includes('CORS')) {
                errorMessage = 'Formularz może być wysłany, ale nie można potwierdzić. Jeśli nie otrzymasz odpowiedzi w 24h, zadzwoń: +48 661 576 007';
                // W przypadku CORS pokaż też sukces po błędzie
                setTimeout(() => {
                    this.hideMainError(mainError);
                    this.showFormSuccess(form, successState, formContainer);
                }, 3000);
            }
            
            this.showMainError(mainError, errorMessage);
            
        } finally {
            this.setSubmitButtonState(submitButton, false, 'Wyślij wiadomość');
            this.formState.isSubmitting = false;
        }
    }

    showMainError(errorElement, message) {
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('visible');
        }
    }

    hideMainError(errorElement) {
        if (errorElement) {
            errorElement.classList.remove('visible');
        }
    }

    setSubmitButtonState(button, isLoading, text) {
        if (!button) return;
        
        button.disabled = isLoading;
        button.classList.toggle('loading', isLoading);
        
        const buttonText = button.querySelector('.btn-text') || button;
        buttonText.textContent = text;
    }

    showFormSuccess(form, successState, formContainer) {
        if (!successState || !formContainer) return;

        // Trigger confetti first
        this.triggerConfetti();

        // Hide form with animation
        form.style.transition = 'all 0.6s ease';
        form.style.opacity = '0';
        form.style.transform = 'translateY(-30px) scale(0.95)';
        
        setTimeout(() => {
            form.style.display = 'none';
            
            // Create success HTML
            successState.innerHTML = `
                <div class="success-checkmark">
                    <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                        <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                        <path class="checkmark-check" fill="none" d="m14.1 27.2l7.1 7.2 16.7-16.8"/>
                    </svg>
                </div>
                
                <div class="success-content">
                    <h2>🎉 Dziękuję!</h2>
                    <p class="success-main-text">
                        Twoja wiadomość została wysłana pomyślnie. Cieszę się, że chcesz rozpocząć naukę języka!
                    </p>
                    
                    <div class="success-next-steps">
                        <h3>📋 Co dzieje się dalej?</h3>
                        <ul>
                            <li>✨ Odpowiem Ci w ciągu <strong>24 godzin</strong></li>
                            <li>📞 Umówimy się na <strong>bezpłatną konsultację</strong></li>
                            <li>🎯 Ustalimy Twoje cele i poziom językowy</li>
                            <li>🚀 Rozpoczniemy Twoją przygodę z językiem!</li>
                        </ul>
                    </div>
                    
                    <div class="success-contact-info">
                        <h3>📞 Pilna sprawa?</h3>
                        <p>Możesz też zadzwonić bezpośrednio:</p>
                        <a href="tel:+48661576007" class="contact-phone">+48 661 576 007</a>
                    </div>
                </div>
            `;
            
            successState.style.display = 'flex';
            
            // Show success state
            requestAnimationFrame(() => {
                successState.classList.add('visible');
            });
            
            // Scroll do góry
            setTimeout(() => {
                const formSection = document.querySelector('.form-section');
                if (formSection) {
                    const offsetTop = formSection.offsetTop - 100;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }, 300);
            
        }, 600);
    }

    triggerConfetti() {
        const confettiColors = ['🎉', '🎊', '✨', '🎈', '🥳'];
        
        for (let i = 0; i < 15; i++) {
            const confetti = document.createElement('div');
            confetti.textContent = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.fontSize = '2rem';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '10000';
            confetti.style.animation = `confettiFall 3s ease-out forwards`;
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 3500);
        }
    }

    // === CTA POPUP ===
    initializeCTAPopup() {
        const popup = document.getElementById('cta-popup');
        if (!popup) return;

        const openBtn = document.getElementById('cta-open-btn');
        const closeBtn = document.getElementById('cta-close-btn');
        const modal = popup.querySelector('.cta-modal');

        if (!openBtn || !closeBtn || !modal) {
            console.warn('CTA popup elements not found');
            return;
        }

        let isOpen = false;

        openBtn.style.display = 'flex';
        modal.style.display = 'none';

        const openModal = () => {
            if (isOpen) return;
            
            isOpen = true;
            openBtn.style.display = 'none';
            modal.style.display = 'block';
            
            setTimeout(() => {
                modal.classList.add('visible');
            }, 10);

            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
        };

        const closeModal = () => {
            if (!isOpen) return;
            
            isOpen = false;
            modal.classList.remove('visible');
            
            setTimeout(() => {
                modal.style.display = 'none';
                openBtn.style.display = 'flex';
            }, 300);
        };

        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openModal();
        });
        
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });
        
        document.addEventListener('click', (e) => {
            if (isOpen && !modal.contains(e.target) && !openBtn.contains(e.target)) {
                closeModal();
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) {
                closeModal();
            }
        });

        console.log('✅ CTA popup initialized');
    }

    // === SCROLL EFFECTS ===
    initializeScrollEffects() {
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported');
            return;
        }

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    element.style.animation = 'fadeIn 0.6s ease-out forwards';
                    element.classList.add('revealed');
                    revealObserver.unobserve(element);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        const revealElements = document.querySelectorAll('.reveal-element, .feature-item, .pricing-card, .testimonial-card');
        revealElements.forEach(element => {
            element.style.opacity = '1';
            element.style.visibility = 'visible';
            revealObserver.observe(element);
        });

        this.observers.set('reveal', revealObserver);
        console.log('✅ Scroll effects initialized');
    }

    // === SMOOTH SCROLL ===
    initializeSmoothScroll() {
        if (typeof Lenis !== 'undefined') {
            try {
                const lenis = new Lenis({
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    smooth: true
                });

                const raf = (time) => {
                    lenis.raf(time);
                    requestAnimationFrame(raf);
                };
                
                requestAnimationFrame(raf);
                console.log('✅ Smooth scroll initialized');
            } catch (error) {
                console.warn('Smooth scroll failed:', error);
            }
        }
    }

    // === MOUSE GRADIENT ===
    initializeMouseGradient() {
        const gradient = document.querySelector('.mouse-gradient-background');
        if (!gradient || window.innerWidth <= 768) return;

        let mouseX = 0;
        let mouseY = 0;
        let isMoving = false;

        const updateGradient = () => {
            gradient.style.transform = `translate(${mouseX - 200}px, ${mouseY - 200}px)`;
            isMoving = false;
        };

        const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            if (!isMoving) {
                requestAnimationFrame(updateGradient);
                isMoving = true;
            }
        };

        document.addEventListener('mousemove', handleMouseMove, { passive: true });
        console.log('✅ Mouse gradient initialized');
    }

    // === FLOATING WORDS ===
    initializeFloatingWords() {
        const container = document.getElementById('floating-words-container');
        if (!container || window.innerWidth <= 768) return;

        const words = [
            'Hello', 'Bonjour', 'Płynność', 'Fluency', 'Grammar', 'Conversation', 
            'Cześć', 'Apprendre', 'Learn', 'Merci', 'Thanks', 'Język'
        ];
        
        const wordCount = Math.min(15, Math.floor(window.innerWidth / 100));
        
        for (let i = 0; i < wordCount; i++) {
            const word = document.createElement('span');
            word.className = 'floating-word';
            word.textContent = words[i % words.length];
            word.style.left = Math.random() * (window.innerWidth - 100) + 'px';
            word.style.top = Math.random() * (window.innerHeight - 50) + 'px';
            word.style.opacity = Math.random() * 0.08 + 0.02;
            word.style.animationDelay = Math.random() * 8 + 's';
            
            container.appendChild(word);
        }
        
        console.log('✅ Floating words initialized');
    }

    // === CLEANUP ===
    destroy() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
        console.log('✅ App cleaned up');
    }
}

// === CSS ANIMATIONS ===
const injectAnimations = () => {
    if (document.getElementById('app-animations')) return;

    const style = document.createElement('style');
    style.id = 'app-animations';
    style.textContent = `
        @keyframes fadeIn {
            from { 
                opacity: 0; 
                transform: translateY(20px); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0); 
            }
        }

        @keyframes confettiFall {
            0% {
                transform: translateY(-100vh) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }

        .reveal-element {
            opacity: 1 !important;
            visibility: visible !important;
        }

        .revealed {
            animation: fadeIn 0.6s ease-out forwards;
        }

        .loading {
            position: relative;
            overflow: hidden;
        }

        .loading::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, 
                transparent, 
                rgba(255, 255, 255, 0.3), 
                transparent
            );
            animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }
    `;
    
    document.head.appendChild(style);
};

// === INITIALIZATION ===
injectAnimations();
const app = new ModernApp();
window.app = app;

console.log('🎯 App loaded successfully - Google Sheets + checkbox RODO version');
