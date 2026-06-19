/**
 * Sporline Premium Animations - GSAP + ScrollTrigger
 */
(function () {
    if (typeof gsap === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const initSmoothScroll = () => {
        if (prefersReducedMotion) return;

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const href = btn.getAttribute('href');
                if (!href?.startsWith('#')) return;
                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                const menuToggle = document.getElementById('menu-toggle');
                if (menuToggle) menuToggle.checked = false;

                gsap.to(window, {
                    duration: 1.2,
                    scrollTo: { y: target, offsetY: 80 },
                    ease: 'power3.inOut'
                });
            });
        });
    };

    const initScrollReveal = () => {
        if (prefersReducedMotion) return;

        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);

            gsap.utils.toArray('[data-reveal], .reveal-up, .animated-card, .pricing-card').forEach((el, i) => {
                gsap.from(el, {
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 88%',
                        toggleActions: 'play none none none'
                    },
                    y: 60,
                    opacity: 0,
                    duration: 0.9,
                    delay: i % 4 * 0.08,
                    ease: 'power3.out'
                });
            });

            gsap.utils.toArray('section h2, section .section-label').forEach(el => {
                gsap.from(el, {
                    scrollTrigger: { trigger: el, start: 'top 90%' },
                    y: 40,
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power3.out'
                });
            });
        }
    };

    const initParallax = () => {
        if (prefersReducedMotion || typeof ScrollTrigger === 'undefined') return;

        const hero = document.getElementById('hero');
        const heroVideo = hero?.querySelector('video');
        if (heroVideo) {
            gsap.to(heroVideo, {
                scrollTrigger: {
                    trigger: hero,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1.5
                },
                y: 120,
                scale: 1.1,
                ease: 'none'
            });
        }

        const footer = document.querySelector('footer');
        if (footer) {
            gsap.from(footer.querySelector('.footer-glow'), {
                scrollTrigger: { trigger: footer, start: 'top 95%' },
                opacity: 0,
                scale: 0.8,
                duration: 1.2,
                ease: 'power2.out'
            });
        }
    };

    const initMagneticButtons = () => {
        if (prefersReducedMotion) return;

        document.querySelectorAll('.magnetic-btn, .pricing-card a, #whatsapp-widget').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                gsap.to(btn, { x: x * 0.15, y: y * 0.15, duration: 0.3, ease: 'power2.out' });
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
            });
        });
    };

    const initInstagramHover = () => {
        document.addEventListener('mouseover', (e) => {
            const btn = e.target.closest('.instagram-glow-btn');
            if (!btn || prefersReducedMotion) return;
            gsap.to(btn.querySelector('.social-icon'), {
                rotation: 360,
                scale: 1.15,
                duration: 0.6,
                ease: 'back.out(1.7)'
            });
        });
    };

    const initPreloader = () => {
        window.addEventListener('load', () => {
            const tl = gsap.timeline();
            tl.to('#preloader-bar', { width: '100%', duration: 1.2, ease: 'power4.inOut' })
              .to('#preloader-text', { opacity: 1, y: 0, duration: 0.4 }, '-=0.4')
              .to('#preloader', { opacity: 0, visibility: 'hidden', duration: 0.5, ease: 'power2.inOut' })
              .from('.reveal-text', { y: '100%', opacity: 0, duration: 0.8, ease: 'power4.out', stagger: 0.15 }, '-=0.2')
              .from('#hero-tagline', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4');
        });
    };

    const initNavScroll = () => {
        const nav = document.querySelector('nav');
        if (!nav) return;

        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const current = window.pageYOffset;
            if (current > 100) {
                nav.classList.add('nav-scrolled');
            } else {
                nav.classList.remove('nav-scrolled');
            }
            lastScroll = current;
        }, { passive: true });
    };

    document.addEventListener('DOMContentLoaded', () => {
        initSmoothScroll();
        initNavScroll();
        initMagneticButtons();
        initInstagramHover();

        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            setTimeout(() => {
                initScrollReveal();
                initParallax();
            }, 100);
        }

        initPreloader();
    });
})();
