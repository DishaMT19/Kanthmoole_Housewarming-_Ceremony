const CONFIG = {
    houseLat: 12.755061,
    houseLng: 75.124859,
    houseAddress: 'Kanthmoole Madatharu House, Vittal',
    averageSpeed: 40,
    ceremonyDate: new Date('2026-04-20T08:00:00+05:30'),
    typeMessages: [
        'new beginnings',
        'sacred blessings',
        'our joyful homecoming',
        'a house full of love'
    ],
    loaderStages: [
        'Preparing blessings and lights',
        'Arranging sacred details',
        'Opening the celebration'
    ]
};

const state = {
    loaderFinished: false,
    pageReady: false
};

class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
        this.particles = [];
        this.resize();
        this.seedParticles();
        this.handleResize();
        this.animate();
    }

    seedParticles() {
        const count = Math.min(110, Math.floor((this.width * this.height) / 18000));
        this.particles = Array.from({ length: count }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            radius: Math.random() * 2.6 + 0.8,
            speedX: (Math.random() - 0.5) * 0.24,
            speedY: (Math.random() - 0.5) * 0.22 - 0.05,
            opacity: Math.random() * 0.55 + 0.2,
            hue: Math.random() > 0.65 ? 38 : 46
        }));
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    handleResize() {
        window.addEventListener('resize', () => {
            this.resize();
            this.seedParticles();
        });
    }

    drawParticle(particle) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsla(${particle.hue}, 95%, 72%, ${particle.opacity})`;
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = 'rgba(255, 217, 102, 0.35)';
        this.ctx.fill();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.particles.forEach((particle) => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            if (particle.x < -8) particle.x = this.width + 8;
            if (particle.x > this.width + 8) particle.x = -8;
            if (particle.y < -8) particle.y = this.height + 8;
            if (particle.y > this.height + 8) particle.y = -8;
            this.drawParticle(particle);
        });
        requestAnimationFrame(() => this.animate());
    }
}

function animateWithGsap(target, props) {
    if (typeof gsap === 'undefined') return;
    gsap.to(target, props);
}

function playEntranceSweep(mainContent) {
    const lightSweep = document.createElement('div');
    lightSweep.className = 'light-sweep';
    mainContent.prepend(lightSweep);

    if (typeof gsap !== 'undefined') {
        gsap.fromTo(lightSweep, { left: '-120%' }, {
            left: '120%',
            duration: 1.2,
            ease: 'power2.inOut',
            onComplete: () => lightSweep.remove()
        });

        gsap.from('.navbar', {
            duration: 0.8,
            opacity: 0,
            y: -30,
            ease: 'power3.out'
        });

        gsap.from('.hero-container', {
            duration: 1.1,
            opacity: 0,
            y: 50,
            delay: 0.15,
            ease: 'power3.out'
        });
        return;
    }

    window.setTimeout(() => lightSweep.remove(), 1200);
}

function initLogoLoader() {
    const logoLoader = document.getElementById('logoLoader');
    const mainContent = document.getElementById('mainContent');
    const progressFill = document.querySelector('.progress-fill');
    const progressPercent = document.querySelector('.progress-percent');
    const loaderStage = document.getElementById('loaderStage');

    if (!logoLoader || !mainContent) return;

    document.body.classList.add('is-loading');
    const startedAt = Date.now();
    let progress = 0;
    let stageIndex = 0;

    const progressTimer = window.setInterval(() => {
        const target = state.pageReady ? 100 : 92;
        progress = Math.min(target, progress + Math.random() * 12 + 4);
        const rounded = Math.floor(progress);
        if (progressFill) progressFill.style.width = `${rounded}%`;
        if (progressPercent) progressPercent.textContent = `${rounded}%`;
        if (loaderStage && rounded > (stageIndex + 1) * 28 && stageIndex < CONFIG.loaderStages.length - 1) {
            stageIndex += 1;
            loaderStage.textContent = CONFIG.loaderStages[stageIndex];
        }
        if (rounded >= 100) window.clearInterval(progressTimer);
    }, 160);

    const finishLoader = () => {
        if (state.loaderFinished) return;
        state.loaderFinished = true;
        window.clearInterval(progressTimer);
        if (progressFill) progressFill.style.width = '100%';
        if (progressPercent) progressPercent.textContent = '100%';
        if (loaderStage) loaderStage.textContent = 'Welcome to the celebration';

        logoLoader.classList.add('hide');
        window.setTimeout(() => {
            logoLoader.style.display = 'none';
            mainContent.style.display = 'block';
            mainContent.classList.add('entrance-active');
            document.body.classList.remove('is-loading');
            playEntranceSweep(mainContent);
        }, 700);
    };

    const maybeFinish = () => {
        const elapsed = Date.now() - startedAt;
        window.setTimeout(finishLoader, Math.max(0, 2400 - elapsed));
    };

    window.addEventListener('load', () => {
        state.pageReady = true;
        maybeFinish();
    }, { once: true });

    window.setTimeout(() => {
        if (!state.loaderFinished) {
            state.pageReady = true;
            maybeFinish();
        }
    }, 4200);
}
function initTypewriter() {
    const target = document.getElementById('typewriterText');
    if (!target) return;

    let messageIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
        const current = CONFIG.typeMessages[messageIndex];
        charIndex += deleting ? -1 : 1;
        target.textContent = current.slice(0, charIndex);

        let delay = deleting ? 45 : 85;
        if (!deleting && charIndex === current.length) {
            delay = 1400;
            deleting = true;
        } else if (deleting && charIndex === 0) {
            deleting = false;
            messageIndex = (messageIndex + 1) % CONFIG.typeMessages.length;
            delay = 350;
        }

        window.setTimeout(tick, delay);
    };

    tick();
}

function pulseCountdownItem(element) {
    const card = element.closest('.countdown-item');
    if (!card) return;
    card.classList.remove('is-ticking');
    void card.offsetWidth;
    card.classList.add('is-ticking');
}

function initCountdown() {
    const units = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds')
    };

    if (!units.days) return;
    const previousValues = {};

    const updateCountdown = () => {
        const distance = CONFIG.ceremonyDate.getTime() - Date.now();
        if (distance <= 0) {
            Object.values(units).forEach((element) => {
                element.textContent = '00';
            });
            return;
        }

        const nextValues = {
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((distance / (1000 * 60)) % 60),
            seconds: Math.floor((distance / 1000) % 60)
        };

        Object.entries(nextValues).forEach(([key, value]) => {
            const formatted = String(value).padStart(2, '0');
            if (units[key].textContent !== formatted) units[key].textContent = formatted;
            if (previousValues[key] !== undefined && previousValues[key] !== value) pulseCountdownItem(units[key]);
            previousValues[key] = value;
        });
    };

    updateCountdown();
    window.setInterval(updateCountdown, 1000);
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const radius = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    return radius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function formatDistance(distanceKm) {
    return distanceKm < 1 ? `${Math.round(distanceKm * 1000)} meters` : `${distanceKm.toFixed(1)} km`;
}

function estimateEta(distanceKm) {
    return Math.max(3, Math.round((distanceKm / CONFIG.averageSpeed) * 60));
}

function initGoogleMaps() {
    const getDirectionsBtn = document.getElementById('getDirectionsBtn');
    const locationStatus = document.getElementById('locationStatus');
    const distanceDisplay = document.getElementById('distanceDisplay');
    const etaDisplay = document.getElementById('etaDisplay');
    const routeLinkBtn = document.querySelector('.route-link-btn');

    if (!getDirectionsBtn || !locationStatus || !distanceDisplay || !etaDisplay) return;

    const destinationUrl = `https://www.google.com/maps/dir/?api=1&destination=${CONFIG.houseLat},${CONFIG.houseLng}&travelmode=driving`;
    if (routeLinkBtn) routeLinkBtn.href = destinationUrl;

    getDirectionsBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            locationStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Geolocation is not supported on this device';
            window.open(destinationUrl, '_blank', 'noopener');
            return;
        }

        locationStatus.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Calculating your route...';
        getDirectionsBtn.disabled = true;

        navigator.geolocation.getCurrentPosition((position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            const distanceKm = calculateDistance(userLat, userLng, CONFIG.houseLat, CONFIG.houseLng);
            const etaMinutes = estimateEta(distanceKm);
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${CONFIG.houseLat},${CONFIG.houseLng}&travelmode=driving`;

            distanceDisplay.innerHTML = `<i class="fas fa-road"></i> Distance: ${formatDistance(distanceKm)}`;
            etaDisplay.innerHTML = `<i class="fas fa-clock"></i> ETA: About ${etaMinutes} minutes by car`;
            locationStatus.innerHTML = '<i class="fas fa-check-circle"></i> Route ready. Opening Google Maps...';
            locationStatus.style.color = '#c6ffb8';
            if (routeLinkBtn) routeLinkBtn.href = mapsUrl;

            window.setTimeout(() => {
                window.open(mapsUrl, '_blank', 'noopener');
                getDirectionsBtn.disabled = false;
            }, 900);
        }, (error) => {
            const errorText = error.code === error.PERMISSION_DENIED
                ? 'Location access was blocked. Opening destination instead.'
                : 'Could not detect your location. Opening destination instead.';

            locationStatus.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${errorText}`;
            window.open(destinationUrl, '_blank', 'noopener');
            getDirectionsBtn.disabled = false;
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        });
    });
}

function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);

    if (!navbar) return;

    const syncNavbar = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 32);
        let activeId = '';
        sections.forEach((section) => {
            const bounds = section.getBoundingClientRect();
            if (bounds.top <= 180 && bounds.bottom >= 180) activeId = section.id;
        });
        navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
        });
    };

    syncNavbar();
    window.addEventListener('scroll', syncNavbar, { passive: true });

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            navMenu?.classList.remove('active');
            navToggle?.classList.remove('active');
        });
    });
}
function markRevealTargets() {
    const targets = [
        ['.section-header', ''],
        ['.countdown-3d-card', ''],
        ['.location-card', 'left'],
        ['.maps-card', 'right'],
        ['.tree-card', ''],
        ['.family-motto', '']
    ];

    targets.forEach(([selector, direction]) => {
        document.querySelectorAll(selector).forEach((element) => {
            element.classList.add('reveal-on-scroll');
            if (direction) element.dataset.reveal = direction;
        });
    });
}

function initScrollAnimations() {
    markRevealTargets();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal-on-scroll').forEach((element) => observer.observe(element));
}

function initTiltEffects() {
    const cards = document.querySelectorAll('.tree-card, .location-card, .maps-card');

    cards.forEach((card) => {
        card.addEventListener('mousemove', (event) => {
            const rect = card.getBoundingClientRect();
            const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
            const rotateX = ((event.clientY - rect.top) / rect.height - 0.5) * -10;
            card.classList.add('is-hovered');
            animateWithGsap(card, {
                rotateY,
                rotateX,
                transformPerspective: 1000,
                duration: 0.25,
                ease: 'power2.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            card.classList.remove('is-hovered');
            animateWithGsap(card, {
                rotateY: 0,
                rotateX: 0,
                duration: 0.45,
                ease: 'power3.out'
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particleCanvas');
    if (canvas) new ParticleSystem(canvas);

    initLogoLoader();
    initTypewriter();
    initCountdown();
    initGoogleMaps();
    initNavbar();
    initScrollAnimations();
    initTiltEffects();
});
