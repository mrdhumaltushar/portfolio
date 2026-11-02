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
          card.style.display = 'flex';
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

});
