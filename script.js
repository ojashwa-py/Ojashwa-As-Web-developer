/**
 * Portfolio — script.js
 * Creative UX: custom cursor, particle canvas, magnetic buttons,
 * mouse spotlight, text scramble, counter animation, skill bars,
 * tilt cards, trail particles, and more.
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ================================================
       1.  CUSTOM CURSOR
    ================================================ */
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let raf;

    // Optimized Mouse movement throttled for performance
    const isMobile = window.innerWidth < 768;
    
    window.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Spotlight (only on desktop for better perf)
        if (!isMobile) {
            const spot = document.getElementById('mouseSpotlight');
            if (spot) {
                spot.style.left = mouseX + 'px';
                spot.style.top = mouseY + 'px';
            }
            // Trail particles logic
            spawnTrail(mouseX, mouseY);
        }
    });

    function animateCursor() {
        if (!isMobile && dot) {
            dot.style.left = mouseX + 'px';
            dot.style.top = mouseY + 'px';
        }

        // Ring follows with lerp (smooth lag)
        if (!isMobile && ring) {
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;
            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';
        }

        raf = requestAnimationFrame(animateCursor);
    }

    if (!isMobile) animateCursor();
    else {
        // Hide custom cursor on mobile to avoid lag
        if (dot) dot.style.display = 'none';
        if (ring) ring.style.display = 'none';
        document.body.style.cursor = 'default';
    }

    // Hover state on interactive elements
    const hoverTargets = document.querySelectorAll(
        'a, button, .project-card, .skill-card, .tool-item, .social-icon, .testimonial-card, .process-step, .timeline-card, input, textarea, select'
    );

    if (!isMobile) {
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    document.addEventListener('mousedown', (e) => {
        if (!isMobile) document.body.classList.add('cursor-click');
        const ripple = document.createElement('div');
        ripple.classList.add('click-ripple');
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 800);
    });
    document.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'));

    /* ================================================
       2.  CURSOR TRAIL PARTICLES
    ================================================ */
    const trailContainer = document.getElementById('cursorTrails');
    let trailTimer = 0;

    function spawnTrail(x, y) {
        if (isMobile) return; 
        const now = Date.now();
        if (now - trailTimer < 60) return;   // spawn every ~60ms (reduced frequency)
        trailTimer = now;

        if (!trailContainer) return;

        const size = Math.random() * 6 + 2;
        const trail = document.createElement('div');
        trail.classList.add('cursor-trail');
        trail.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
        `;
        trailContainer.appendChild(trail);
        setTimeout(() => trail.remove(), 500);
    }

    /* ================================================
       3.  PARTICLE CANVAS — mouse-reactive dots
    ================================================ */
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let W, H, particles = [];

        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        }

        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor() { this.reset(); }

            reset() {
                this.x = Math.random() * W;
                this.y = Math.random() * H;
                this.vx = (Math.random() - 0.5) * 0.3;
                this.vy = (Math.random() - 0.5) * 0.3;
                this.r = Math.random() * 1.5 + 0.5;
                this.alpha = Math.random() * 0.5 + 0.1;
            }

            update() {
                // Attract slightly toward mouse
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const force = Math.max(0, (120 - dist) / 120);

                this.vx += dx / dist * force * 0.06;
                this.vy += dy / dist * force * 0.06;

                // Dampen
                this.vx *= 0.96;
                this.vy *= 0.96;

                this.x += this.vx;
                this.y += this.vy;

                // Wrap
                if (this.x < 0) this.x = W;
                if (this.x > W) this.x = 0;
                if (this.y < 0) this.y = H;
                if (this.y > H) this.y = 0;
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // Optimized connections: reduced count on mobile
        const pCount = isMobile ? 30 : 70;
        for (let i = 0; i < pCount; i++) particles.push(new Particle());

        function drawConnections() {
            ctx.beginPath();
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    // Skip Math.sqrt for performance, check squared distance
                    const distSq = dx * dx + dy * dy;

                    if (distSq < 10000) { // 100 * 100
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                    }
                }
            }
            ctx.stroke();
        }

        function loopCanvas() {
            ctx.clearRect(0, 0, W, H);
            particles.forEach(p => { p.update(); p.draw(); });
            drawConnections();
            requestAnimationFrame(loopCanvas);
        }

        loopCanvas();
    }

    /* ================================================
       4.  MAGNETIC BUTTONS
    ================================================ */
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) * 0.35;
            const dy = (e.clientY - cy) * 0.35;
            btn.style.transform = `translate(${dx}px, ${dy}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    /* ================================================
       5.  TEXT SCRAMBLE — Hero heading
    ================================================ */
    const scrambleEl = document.getElementById('scrambleText');
    if (scrambleEl) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
        const words = ['Digital', 'Stunning', 'Blazing', 'Elegant', 'Immersive'];
        let wordIdx = 0;
        let scramTimer;

        function scramble(target) {
            let iteration = 0;
            clearInterval(scramTimer);
            scramTimer = setInterval(() => {
                scrambleEl.innerText = target
                    .split('')
                    .map((ch, i) => {
                        if (i < iteration) return target[i];
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('');
                if (iteration >= target.length) clearInterval(scramTimer);
                iteration += 0.5;
            }, 40);
        }

        // Cycle every 3s
        setInterval(() => {
            wordIdx = (wordIdx + 1) % words.length;
            scramble(words[wordIdx]);
        }, 3000);
    }

    /* ================================================
       6.  COUNTER ANIMATION — Stats
    ================================================ */
    const counters = document.querySelectorAll('.stat-num');
    let counted = false;

    function runCounters() {
        if (counted) return;
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.count, 10);
            const duration = 1800;
            const step = duration / target;
            let current = 0;

            const inc = setInterval(() => {
                current++;
                counter.textContent = current;
                if (current >= target) clearInterval(inc);
            }, step);
        });
        counted = true;
    }

    // Observe hero stats
    const statsEl = document.querySelector('.hero-stats');
    if (statsEl) {
        const statsObserver = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) runCounters();
        }, { threshold: 0.5 });
        statsObserver.observe(statsEl);
    }

    /* ================================================
       7.  SKILL BAR ANIMATION
    ================================================ */
    const skillFills = document.querySelectorAll('.skill-fill');

    const skillObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const width = fill.dataset.width + '%';
                // Timeout for CSS transition to kick in
                requestAnimationFrame(() => { fill.style.width = width; });
                skillObserver.unobserve(fill);
            }
        });
    }, { threshold: 0.4 });

    skillFills.forEach(f => skillObserver.observe(f));

    /* ================================================
       8.  SCROLL REVEAL
    ================================================ */
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.08 });

    document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

    /* ================================================
       9.  SCROLL PROGRESS BAR
    ================================================ */
    const progress = document.getElementById('scrollProgress');
    window.addEventListener('scroll', () => {
        const scrolled = (document.documentElement.scrollTop /
            (document.documentElement.scrollHeight - document.documentElement.clientHeight)) * 100;
        if (progress) progress.style.width = scrolled + '%';
    });

    /* ================================================
       10. HEADER SCROLL SHRINK
    ================================================ */
    const header = document.getElementById('mainHeader');
    window.addEventListener('scroll', () => {
        if (!header) return;
        header.classList.toggle('scrolled', window.scrollY > 60);
    });

    /* ================================================
       11. MOBILE MENU TOGGLE
    ================================================ */
    const toggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            toggle.classList.toggle('active'); // Also toggle active on button
            const icon = toggle.querySelector('i');
            
            if (navLinks.classList.contains('active')) {
                icon.className = 'fas fa-times';
                document.body.style.overflow = 'hidden';
                
                // Staggered link animation
                const links = navLinks.querySelectorAll('li');
                links.forEach((child, index) => {
                    child.style.transitionDelay = `${index * 0.1}s`;
                    child.classList.add('reveal');
                });
            } else {
                icon.className = 'fas fa-bars';
                document.body.style.overflow = '';
                
                const links = navLinks.querySelectorAll('li');
                links.forEach(child => {
                    child.style.transitionDelay = '0s';
                    child.classList.remove('reveal');
                });
            }
        });
    }

    /* ================================================
       12. SMOOTH SCROLL
    ================================================ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                if (navLinks) navLinks.classList.remove('active');
                document.body.style.overflow = '';
                window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
            }
        });
    });

    /* ================================================
       13. TILT EFFECT — Tool items
    ================================================ */
    document.querySelectorAll('[data-tilt]').forEach(el => {
        el.addEventListener('mousemove', e => {
            const rect = el.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
            el.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${-y}deg) scale(1.04)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });

    /* ================================================
       14. CONTACT FORM SUBMISSION
    ================================================ */
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            const originalHTML = btn.innerHTML;

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> Redirecting...';
                btn.style.background = '#2ddd8a';
                btn.style.color = '#000';
                form.reset();

                setTimeout(() => {
                    window.location.href = "https://www.instagram.com/ojashwa.py";
                }, 1500);
            }, 1600);
        });
    }

    /* ================================================
       15. MARQUEE PAUSE ON HOVER
    ================================================ */
    const track = document.querySelector('.marquee-track');
    if (track) {
        track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
        track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
    }

    /* ================================================
       16. SECTION HIGHLIGHT on scroll  (nav active link)
    ================================================ */
    const sections = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 200) current = sec.id;
        });

        navAnchors.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href') === '#' + current ||
                (current === 'hero' && a.getAttribute('href') === 'index.html')) {
                a.classList.add('active');
            }
        });
    });

    /* ================================================
       17. VIDEO LOADER / PAGE TRANSITION
    ================================================ */
    const loaderHTML = `
        <div id="video-loader">
            <video src="assets/Untitled design.mp4" autoplay loop muted playsinline id="loader-video"></video>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', loaderHTML);
    const loader = document.getElementById('video-loader');
    const loaderVideo = document.getElementById('loader-video');

    // Hide loader after a short initial time (simulate starting speed)
    setTimeout(() => {
        if (loader) loader.classList.add('hidden');
    }, 1800);

    // Fade the body in
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.6s ease';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.body.style.opacity = '1';
        });
    });

    // Handle outbound links with video transition
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', e => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !href.includes('index.html#') && href !== window.location.pathname.split('/').pop() && !link.target) {
                e.preventDefault();
                loader.classList.remove('hidden');

                // Jump to beginning of video to show the impact
                if (loaderVideo) {
                    loaderVideo.currentTime = 0;
                    loaderVideo.play();
                }

                setTimeout(() => {
                    window.location.href = href;
                }, 1200); // 1.2s delay for the video transition to be visible
            }
        });
    });

    /* ================================================
       18. PORTFOLIO TABS / FILTERS
    ================================================ */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const filterItems = document.querySelectorAll('.filter-item');

    if (filterBtns.length > 0 && filterItems.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                filterItems.forEach(item => {
                    if (filterValue === 'all' || item.classList.contains(filterValue)) {
                        item.classList.remove('hidden');
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            if (!item.classList.contains('hidden')) {
                                item.classList.add('hidden');
                            }
                        }, 300);
                    }
                });
            });
        });
    }
});
