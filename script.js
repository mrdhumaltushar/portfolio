/* ===================================================================
   TUSHAR PORTFOLIO - JAVASCRIPT INTERACTIONS
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Navbar Scroll Effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 2. Mobile Menu Toggle
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobLinks = document.querySelectorAll('.mob-link, .mob-talk');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    mobLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // 3. Smooth Ambient Cursor Follower
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      currentX += (mouseX - currentX) * 0.12;
      currentY += (mouseY - currentY) * 0.12;
      cursorGlow.style.left = `${currentX}px`;
      cursorGlow.style.top = `${currentY}px`;
      requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);
  }

  // 4. Hero Section 3D Interactive Parallax on Mouse Move
  const heroSection = document.getElementById('hero');
  const userPortrait = document.getElementById('userPortrait');
  const portfolioText = document.querySelector('.portfolio-svg text, .portfolio-text');
  const floatingAccents = document.querySelectorAll('.floating-item');

  if (heroSection && window.matchMedia('(pointer: fine)').matches) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const normX = x / (rect.width / 2);
      const normY = y / (rect.height / 2);

      // Shift user portrait subtly towards cursor
      if (userPortrait) {
        userPortrait.style.transform = `translateX(${normX * 12}px) translateY(${normY * 6}px) scale(1.01)`;
      }

      // Shift background text slightly in reverse (depth illusion)
      if (portfolioText) {
        portfolioText.style.transform = `translateX(${-normX * 15}px) translateY(${-normY * 8}px)`;
      }

      // Floating accent items
      floatingAccents.forEach((item, index) => {
        const factor = (index + 1) * 6;
        item.style.transform = `translate(${normX * factor}px, ${normY * factor}px)`;
      });
    });

    heroSection.addEventListener('mouseleave', () => {
      if (userPortrait) {
        userPortrait.style.transform = `translateX(0px) translateY(0px) scale(1)`;
      }
      if (portfolioText) {
        portfolioText.style.transform = `translateX(0px) translateY(0px)`;
      }
      floatingAccents.forEach((item) => {
        item.style.transform = `translate(0px, 0px)`;
      });
    });
  }

  // 5. Project Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = '';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease';
            card.style.opacity = '1';
          }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 6. Active Navigation Link on Scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = sectionId;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  // 7. Interactive Contact Form Submission Handler
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('.submit-btn');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = `<span>Sending...</span>`;
      submitBtn.disabled = true;

      // Simulate sending
      setTimeout(() => {
        submitBtn.innerHTML = `<span>Sent Successfully! ✓</span>`;
        submitBtn.style.background = '#10b981';
        formStatus.textContent = 'Thank you! Your message has been received. I will reply soon.';
        formStatus.className = 'form-status success';
        contactForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
          formStatus.textContent = '';
        }, 5000);
      }, 1200);
    });
  }

  // 8. Number Counter Animation for 10. Metric
  const counterElement = document.querySelector('.counter');
  if (counterElement) {
    const target = +counterElement.getAttribute('data-target') || 10;
    let count = 0;
    
    const updateCount = () => {
      const inc = Math.max(1, Math.ceil(target / 8));
      if (count < target) {
        count = Math.min(target, count + inc);
        counterElement.innerText = count;
        setTimeout(updateCount, 30);
      } else {
        counterElement.innerText = target;
      }
    };

    updateCount();
  }


  // ==========================================================================
  // 9. BMW M-Performance Interactive Carousel & Fullscreen Lightbox
  // ==========================================================================
  (function initBmwShowcase() {
    // Dashboard Data Specifications
    const bmwPages = [
      {
        title: "Page 1: Macro Executive Overview",
        subtitle: "Global Fleet Performance & Dynamic YoY Growth Cockpit",
        src: "bmw-dashboard/bmw-overview.png",
        kpis: [
          { k: "Global Revenue", v: "$19.0T" },
          { k: "Fleet Units", v: "253M" },
          { k: "YoY Growth", v: "+14.53%", success: true },
          { k: "Eco Fuel Mix", v: "Hybrid 24.6% • Electric 25.0%" },
          { k: "Top Series", v: "7 Series • 3 Series • i8" }
        ]
      },
      {
        title: "Page 2: Product & Vehicle Strategy",
        subtitle: "Pricing Elasticity, Powertrain Penetration & Mileage Dynamics",
        src: "bmw-dashboard/bmw-strategy.png",
        kpis: [
          { k: "Avg Selling Price", v: "$75.03K" },
          { k: "Eco-Friendly Share", v: "50.00%", success: true },
          { k: "Avg Engine Size", v: "3.25 L" },
          { k: "Regression", v: "Price vs. Mileage Scatter Clustering" },
          { k: "Transmission", v: "Auto vs Manual across 6 Continents" }
        ]
      },
      {
        title: "Page 3: Regional & Customer Segmentation",
        subtitle: "Dynamic DAX Waterfall Revenue Variance & Geographic Decomposition",
        src: "bmw-dashboard/bmw-regional.png",
        kpis: [
          { k: "Waterfall Variance", v: "Asia $3.25T • EU $3.19T • NA $3.18T" },
          { k: "High-Value %", v: "0.51% Elite Tier" },
          { k: "Global Footprint", v: "6 Continental Territories Analyzed" },
          { k: "Engine Trend", v: "Displacement Evolution by Model Year" }
        ]
      },
      {
        title: "Technical Architecture: Power BI Desktop Model",
        subtitle: "Star Schema Data Modeling & DAX Calculation Engine",
        src: "bmw-dashboard/bmw-desktop.png",
        kpis: [
          { k: "Data Architecture", v: "High-Performance Star Schema" },
          { k: "DAX Measures", v: "YoY Variance, PY Revenue, Dynamic %, Time-Intell" },
          { k: "Model Canvas", v: "Fact & Dimension Relationships" },
          { k: "Query Speed", v: "Optimized VertiPaq In-Memory Engine" }
        ]
      }
    ];

    // Card Carousel Elements
    const cardCarousel = document.getElementById("bmwCardCarousel");
    const slides = document.querySelectorAll("#bmwCardSlides .carousel-slide");
    const dots = document.querySelectorAll("#bmwCardDots .carousel-dot");
    const prevBtn = document.getElementById("bmwSlidePrev");
    const nextBtn = document.getElementById("bmwSlideNext");
    const indicatorText = document.getElementById("bmwIndicatorText");
    const expandTriggerBtn = document.getElementById("expandBmwLightboxBtn");
    const openModalBtn = document.getElementById("openBmwModalFromBtn");

    // Modal Elements
    const modal = document.getElementById("bmwLightboxModal");
    const modalBackdrop = document.getElementById("bmwLightboxBackdrop");
    const modalHeading = document.getElementById("bmwModalHeading");
    const modalCounter = document.getElementById("bmwModalCounter");
    const modalMainImg = document.getElementById("bmwModalMainImg");
    const modalPrev = document.getElementById("bmwModalPrev");
    const modalNext = document.getElementById("bmwModalNext");
    const modalCloseBtn = document.getElementById("bmwModalCloseBtn");
    const modalFullscreenBtn = document.getElementById("bmwModalFullscreenBtn");
    const modalKpis = document.getElementById("bmwModalKpis");
    const modalThumbs = document.querySelectorAll("#bmwModalThumbStrip .bmw-thumb-card");

    let currentCardIndex = 0;
    let currentModalIndex = 0;
    let autoSlideTimer = null;

    // Update Card Carousel Display
    function setCardSlide(index) {
      if (!slides.length) return;
      currentCardIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === currentCardIndex);
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === currentCardIndex);
      });

      if (indicatorText && bmwPages[currentCardIndex]) {
        const shortTitle = bmwPages[currentCardIndex].title.replace("Page ", "P").split(":")[1] || bmwPages[currentCardIndex].title;
        indicatorText.textContent = `${currentCardIndex + 1} / ${slides.length} • ${shortTitle.trim()}`;
      }
    }

    // Card Carousel Navigation
    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        setCardSlide(currentCardIndex - 1);
        resetAutoSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        setCardSlide(currentCardIndex + 1);
        resetAutoSlide();
      });
    }

    dots.forEach((dot) => {
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(dot.getAttribute("data-index"), 10);
        setCardSlide(idx);
        resetAutoSlide();
      });
    });

    // Auto Advance Carousel
    function startAutoSlide() {
      stopAutoSlide();
      autoSlideTimer = setInterval(() => {
        setCardSlide(currentCardIndex + 1);
      }, 5500);
    }

    function stopAutoSlide() {
      if (autoSlideTimer) {
        clearInterval(autoSlideTimer);
        autoSlideTimer = null;
      }
    }

    function resetAutoSlide() {
      stopAutoSlide();
      startAutoSlide();
    }

    if (cardCarousel) {
      cardCarousel.addEventListener("mouseenter", stopAutoSlide);
      cardCarousel.addEventListener("mouseleave", startAutoSlide);
      startAutoSlide();
    }

    // Clicking slide opens modal
    slides.forEach((slide) => {
      slide.addEventListener("click", () => {
        const idx = parseInt(slide.getAttribute("data-index"), 10) || 0;
        openModal(idx);
      });
    });

    // Modal Display Function
    function setModalSlide(index) {
      if (!modal || !bmwPages.length) return;
      currentModalIndex = (index + bmwPages.length) % bmwPages.length;
      const data = bmwPages[currentModalIndex];

      if (modalHeading) modalHeading.textContent = data.title;
      if (modalCounter) modalCounter.textContent = `${currentModalIndex + 1} / ${bmwPages.length}`;
      if (modalMainImg) {
        modalMainImg.src = data.src;
        modalMainImg.alt = data.title;
      }

      // Render KPIs
      if (modalKpis) {
        modalKpis.innerHTML = data.kpis
          .map(
            (item) => `
          <div class="modal-kpi-pill">
            <span class="kpi-k">${item.k}</span>
            <span class="kpi-v ${item.success ? "success" : ""}">${item.v}</span>
          </div>
        `
          )
          .join("");
      }

      // Update Thumbnails
      modalThumbs.forEach((thumb, i) => {
        thumb.classList.toggle("active", i === currentModalIndex);
      });
    }

    function openModal(index = 0) {
      if (!modal) return;
      currentModalIndex = index;
      setModalSlide(currentModalIndex);
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden"; // Prevent background scroll
      stopAutoSlide();
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      startAutoSlide();
    }

    // Modal Trigger Buttons
    if (expandTriggerBtn) {
      expandTriggerBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(currentCardIndex);
      });
    }

    if (openModalBtn) {
      openModalBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openModal(currentCardIndex);
      });
    }

    // Modal Nav Controls
    if (modalPrev) {
      modalPrev.addEventListener("click", () => {
        setModalSlide(currentModalIndex - 1);
      });
    }

    if (modalNext) {
      modalNext.addEventListener("click", () => {
        setModalSlide(currentModalIndex + 1);
      });
    }

    modalThumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        const idx = parseInt(thumb.getAttribute("data-index"), 10);
        setModalSlide(idx);
      });
    });

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", closeModal);
    }

    if (modalBackdrop) {
      modalBackdrop.addEventListener("click", closeModal);
    }

    // Toggle Native Fullscreen
    if (modalFullscreenBtn) {
      modalFullscreenBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
          modal.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    // Keyboard Shortcuts (Arrow Left/Right, Esc, F)
    document.addEventListener("keydown", (e) => {
      if (!modal || !modal.classList.contains("active")) return;

      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "ArrowLeft") {
        setModalSlide(currentModalIndex - 1);
      } else if (e.key === "ArrowRight") {
        setModalSlide(currentModalIndex + 1);
      } else if (e.key === "f" || e.key === "F") {
        if (!document.fullscreenElement) {
          modal.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    });
  })();


  // ==========================================================================
  // 10. TEXT SCRAMBLE / CIPHER REBUILD ENGINE
  // ==========================================================================
  class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = '!<>-_\\/[]{}—=+*^?#________0123456789ABCDEF';
      this.update = this.update.bind(this);
    }

    setText(newText) {
      const oldText = this.el.innerText;
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise((resolve) => (this.resolve = resolve));
      this.queue = [];
      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 25);
        const end = start + Math.floor(Math.random() * 25);
        this.queue.push({ from, to, start, end });
      }
      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
    }

    update() {
      let output = '';
      let complete = 0;
      for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];
        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = this.randomChar();
            this.queue[i].char = char;
          }
          output += `<span class="scramble-char">${char}</span>`;
        } else {
          output += from;
        }
      }
      this.el.innerHTML = output;
      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame++;
      }
    }

    randomChar() {
      return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
  }

  // Initialize Scramble on Hero Name & Title on load
  const heroNameEl = document.querySelector('.hero-name');
  const heroTitleEl = document.querySelector('.hero-title');

  if (heroNameEl) {
    const originalName = heroNameEl.innerText.trim();
    const scramblerName = new TextScramble(heroNameEl);
    setTimeout(() => {
      scramblerName.setText(originalName);
    }, 400);
  }

  if (heroTitleEl) {
    const originalTitle = heroTitleEl.innerText.trim();
    const scramblerTitle = new TextScramble(heroTitleEl);
    setTimeout(() => {
      scramblerTitle.setText(originalTitle);
    }, 850);
  }

  // Interactive Hover Scramble on Project Titles
  const projectTitleEls = document.querySelectorAll('.project-title');
  projectTitleEls.forEach((titleEl) => {
    const originalText = titleEl.innerText;
    const scrambler = new TextScramble(titleEl);
    let isScrambling = false;

    titleEl.addEventListener('mouseenter', () => {
      if (isScrambling) return;
      isScrambling = true;
      scrambler.setText(originalText).then(() => {
        isScrambling = false;
      });
    });
  });

  // ==========================================================================
  // 11. GSAP SCROLL-SCRUB REBUILD ENGINE
  // ==========================================================================
  (function initScrollScrubRebuild() {
    // Check if GSAP and ScrollTrigger are loaded
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not loaded. Animations falling back gracefully.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 992;

    // 1. Hero Depth Parallax Scrub
    const heroBg = document.querySelector('.giant-portfolio-bg');
    const heroPortrait = document.querySelector('.hero-center-portrait');
    const kpiCard1 = document.getElementById('kpiCard1');
    const kpiCard2 = document.getElementById('kpiCard2');

    if (heroBg) {
      gsap.to(heroBg, {
        y: isMobile ? 30 : 70,
        opacity: isMobile ? 0.08 : 0.22,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      });
    }

    if (heroPortrait && !isMobile) {
      gsap.to(heroPortrait, {
        y: 40,
        scale: 1.03,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      });
    }

    if (kpiCard1 && kpiCard2 && !isMobile) {
      gsap.to([kpiCard1, kpiCard2], {
        y: -30,
        stagger: 0.1,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2
        }
      });
    }

    // 2. Horizontal Project Cards Scroll-Scrub Assembly
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
      const banner = card.querySelector('.project-banner, .project-carousel-banner');
      const body = card.querySelector('.project-body');
      const kpiItems = card.querySelectorAll('.bpm-item, .bk-item');

      // Scroll-scrub timeline for card assembly
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: isMobile ? 'top 92%' : 'top 85%',
          end: isMobile ? 'top 65%' : 'top 50%',
          scrub: isMobile ? 0.5 : 0.8,
          toggleActions: 'play reverse play reverse'
        }
      });

      tl.fromTo(
        card,
        {
          y: isMobile ? 25 : 45,
          opacity: 0.82,
          scale: isMobile ? 0.99 : 0.97
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out'
        }
      );

      if (banner && !isMobile) {
        tl.fromTo(
          banner,
          { opacity: 0.85, x: -15 },
          { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' },
          '-=0.4'
        );
      }

      if (body && !isMobile) {
        tl.fromTo(
          body,
          { opacity: 0.85, x: 15 },
          { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' },
          '-=0.4'
        );
      }

      if (kpiItems && kpiItems.length > 0) {
        tl.fromTo(
          kpiItems,
          { y: 12, opacity: 0.7 },
          { y: 0, opacity: 1, stagger: 0.08, duration: 0.35, ease: 'power1.out' },
          '-=0.3'
        );
      }
    });

    // 3. Skills Bento Grid Rebuild & Assembly Scrub
    const bentoCards = document.querySelectorAll('.bento-card');
    if (bentoCards.length > 0) {
      gsap.fromTo(
        bentoCards,
        {
          y: isMobile ? 20 : 35,
          opacity: 0.75,
          scale: isMobile ? 0.99 : 0.96
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: isMobile ? 0.08 : 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.bento-grid',
            start: 'top 85%',
            end: 'top 45%',
            scrub: isMobile ? 0.5 : 0.8
          }
        }
      );
    }

    // 4. Professional Experience Dual-Matrix Scrub Reveal
    const expCards = document.querySelectorAll('.exp-card');
    if (expCards.length > 0) {
      gsap.fromTo(
        expCards,
        {
          y: isMobile ? 20 : 40,
          opacity: 0.75,
          scale: isMobile ? 0.99 : 0.97
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.experience-matrix',
            start: 'top 85%',
            end: 'top 50%',
            scrub: isMobile ? 0.5 : 0.8
          }
        }
      );
    }

    // 5. Contact Hub Cards Scrub Reveal
    const contactCards = document.querySelectorAll('.contact-card-modern');
    if (contactCards.length > 0) {
      gsap.fromTo(
        contactCards,
        {
          y: isMobile ? 15 : 30,
          opacity: 0.8
        },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.contact-cards-grid',
            start: 'top 88%',
            end: 'top 60%',
            scrub: 0.6
          }
        }
      );
    }

    // Refresh ScrollTrigger after assets finish loading
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
  })();

});
