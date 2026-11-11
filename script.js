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
        const categories = (card.getAttribute('data-category') || '').split(' ');
        if (filter === 'all' || categories.includes(filter)) {
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
  // 9. Automotive M-Performance Interactive Carousel & Fullscreen Lightbox
  // ==========================================================================
  (function initFleetShowcase() {
    // Dashboard Data Specifications
    const automotivePages = [
      {
        title: "Page 1: Macro Executive Overview",
        subtitle: "Global Fleet Performance & Dynamic YoY Growth Cockpit",
        src: "fleet-dashboard/fleet-overview.png",
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
        src: "fleet-dashboard/fleet-strategy.png",
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
        src: "fleet-dashboard/fleet-regional.png",
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
        src: "fleet-dashboard/fleet-desktop.png",
        kpis: [
          { k: "Data Architecture", v: "High-Performance Star Schema" },
          { k: "DAX Measures", v: "YoY Variance, PY Revenue, Dynamic %, Time-Intell" },
          { k: "Model Canvas", v: "Fact & Dimension Relationships" },
          { k: "Query Speed", v: "Optimized VertiPaq In-Memory Engine" }
        ]
      }
    ];

    // Card Carousel Elements
    const cardCarousel = document.getElementById("automotiveCardCarousel");
    const slides = document.querySelectorAll("#automotiveCardSlides .carousel-slide");
    const dots = document.querySelectorAll("#automotiveCardDots .carousel-dot");
    const prevBtn = document.getElementById("automotiveSlidePrev");
    const nextBtn = document.getElementById("automotiveSlideNext");
    const indicatorText = document.getElementById("automotiveIndicatorText");
    const expandTriggerBtn = document.getElementById("expandFleetLightboxBtn");
    const openModalBtn = document.getElementById("openFleetModalFromBtn");

    // Modal Elements
    const modal = document.getElementById("automotiveLightboxModal");
    const modalBackdrop = document.getElementById("automotiveLightboxBackdrop");
    const modalHeading = document.getElementById("automotiveModalHeading");
    const modalCounter = document.getElementById("automotiveModalCounter");
    const modalMainImg = document.getElementById("automotiveModalMainImg");
    const modalPrev = document.getElementById("automotiveModalPrev");
    const modalNext = document.getElementById("automotiveModalNext");
    const modalCloseBtn = document.getElementById("automotiveModalCloseBtn");
    const modalFullscreenBtn = document.getElementById("automotiveModalFullscreenBtn");
    const modalKpis = document.getElementById("automotiveModalKpis");
    const modalThumbs = document.querySelectorAll("#automotiveModalThumbStrip .automotive-thumb-card");

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

      if (indicatorText && automotivePages[currentCardIndex]) {
        const shortTitle = automotivePages[currentCardIndex].title.replace("Page ", "P").split(":")[1] || automotivePages[currentCardIndex].title;
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
      if (!modal || !automotivePages.length) return;
      currentModalIndex = (index + automotivePages.length) % automotivePages.length;
      const data = automotivePages[currentModalIndex];

      if (modalHeading) modalHeading.textContent = data.title;
      if (modalCounter) modalCounter.textContent = `${currentModalIndex + 1} / ${automotivePages.length}`;
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

});
