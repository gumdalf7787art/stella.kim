import { initMoltenMetal } from './moltenMetal.js';

/**
 * STELLA KIM Portfolio - Main Script
 */

function initApp() {
  initScrollSpy();
  initAnimations();
  initPortfolio();
  initContactForm();
  initHeroRotation();
  
  // Initialize MoltenMetal Background
  initMoltenMetal('#hero-bg-container', {
    color1: '#5227FF',
    color2: '#FF9FFC',
    color3: '#FFFFFF',
    opacity: 0.8
  });
}

/* =========================================
   1. Scroll Spy & Navigation
========================================= */
function initScrollSpy() {
  const sections = document.querySelectorAll('.section');
  const navDots = document.querySelectorAll('.nav-dot');
  const scrollContainer = document.getElementById('scroll-container');
  
  // Intersection Observer for Navigation Dots
  const observerOptions = {
    root: scrollContainer,
    threshold: 0.5 // Trigger when 50% of the section is visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        // Update nav dots
        navDots.forEach(dot => {
          dot.classList.remove('active', 'active-dark');
          if (dot.getAttribute('data-target') === id) {
            dot.classList.add('active');
            // Change dot color based on section background
            if (id === 'about' || id === 'profile') {
              dot.classList.add('active-dark');
            }
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // Smooth scroll for nav dots and buttons
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* =========================================
   2. Scroll Animations
========================================= */
function initAnimations() {
  const sections = document.querySelectorAll('.section');
  const scrollContainer = document.getElementById('scroll-container');
  
  // A slightly different observer for triggering entrance animations earlier
  const animObserverOptions = {
    root: scrollContainer,
    threshold: 0.1
  };

  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Optional: stop observing once animated to keep them visible
        // animObserver.unobserve(entry.target); 
      }
    });
  }, animObserverOptions);

  sections.forEach(section => {
    animObserver.observe(section);
  });
}

/* =========================================
   3. Portfolio Data & Rendering
========================================= */
// 교체 방법: src 속성의 URL을 'images/photo-01.jpg' 와 같은 실제 파일 경로로 변경하세요.
const portfolioData = [
  { src: 'images/20260521_130329.jpg', id: 'photo-1' },
  { src: 'images/20260521_205007.jpg', id: 'photo-2' },
  { src: 'images/20260522_132518.jpg', id: 'photo-3' },
  { src: 'images/20260522_133057(1).jpg', id: 'photo-4' },
  { src: 'images/20260523_105134.jpg', id: 'photo-5' },
  { src: 'images/20260523_200731(1).jpg', id: 'photo-6' },
  { src: 'images/20260525_091523.jpg', id: 'photo-7' },
  { src: 'images/20260525_093042.jpg', id: 'photo-8' },
  { src: 'images/20260525_095648.jpg', id: 'photo-9' },
  { src: 'images/20260526_085204.jpg', id: 'photo-10' },
  { src: 'images/20260526_091011.jpg', id: 'photo-11' },
  { src: 'images/20260526_093940.jpg', id: 'photo-12' },
  { src: 'images/20260527_155516.jpg', id: 'photo-13' },
  { src: 'images/7A6G9261.JPG', id: 'photo-14' },
  { src: 'images/IMG_2313.JPG', id: 'photo-15' },
  { src: 'images/IMG_2572.JPG', id: 'photo-16' },
  { src: 'images/IMG_3637_2.JPG', id: 'photo-17' },
  { src: 'images/IMG_4770.jpg', id: 'photo-18' },
  { src: 'images/IMG_4771.JPG', id: 'photo-19' },
  { src: 'images/IMG_5112_001 (209).jpg', id: 'photo-20' },
  { src: 'images/IMG_5418.JPG', id: 'photo-21' },
  { src: 'images/IMG_E1205.JPG', id: 'photo-22' },
  { src: 'images/IMG_E1317.JPG', id: 'photo-23' },
  { src: 'images/IMG_E1444.JPG', id: 'photo-24' },
  { src: 'images/IMG_E2192.JPG', id: 'photo-25' },
  { src: 'images/IMG_E2416.JPG', id: 'photo-26' },
  { src: 'images/IMG_E2894.JPG', id: 'photo-27' },
  { src: 'images/IMG_E3203.JPG', id: 'photo-28' },
  { src: 'images/익선동 8.jpg', id: 'photo-29' }
];

import { VanillaMasonry } from './vanillaMasonry.js';
import { VanillaDepthCarousel } from './vanillaDepthCarousel.js';

let depthCarouselInstance = null;
const carouselModal = document.getElementById('carousel-modal');
const closeModalBtn = document.getElementById('carousel-modal-close');

function initPortfolio() {
  const masonryContainer = document.getElementById('masonry-container');
  if (!masonryContainer || portfolioData.length === 0) return;

  new VanillaMasonry('#masonry-container', {
    items: portfolioData,
    ease: 'power3.out',
    duration: 0.8,
    stagger: 0.05,
    animateFrom: 'bottom',
    scaleOnHover: true,
    hoverScale: 0.95,
    blurToFocus: true,
    onClick: (index) => {
      openCarouselModal(index);
    }
  });

  // View All button logic
  const btnViewAll = document.getElementById('btn-view-all');
  const portfolioWrapper = document.getElementById('portfolio-wrapper');
  
  if (btnViewAll && portfolioWrapper) {
    btnViewAll.addEventListener('click', () => {
      portfolioWrapper.classList.add('expanded');
    });
  }

  // Modal close handler
  closeModalBtn.addEventListener('click', closeCarouselModal);
  carouselModal.addEventListener('click', (e) => {
    if (e.target === carouselModal) closeCarouselModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && carouselModal.classList.contains('active')) {
      closeCarouselModal();
    }
  });
}

function openCarouselModal(initialIndex) {
  carouselModal.classList.add('active');
  
  // Initialize Carousel if not done, else re-init with new index
  const container = document.getElementById('depth-carousel-container');
  container.innerHTML = ''; // Clear previous
  
  depthCarouselInstance = new VanillaDepthCarousel('#depth-carousel-container', {
    items: portfolioData,
    initialIndex: initialIndex,
    cardWidth: 350,
    cardHeight: 500,
    depth: 250,
    spread: 110,
    tilt: 25,
    visibleCards: 5,
    blur: 6,
    autoplay: false,
    loop: true
  });
}

function closeCarouselModal() {
  carouselModal.classList.remove('active');
  if (depthCarouselInstance) {
    depthCarouselInstance.destroy();
    depthCarouselInstance = null;
  }
}

/* =========================================
   5. Contact Form Simulation
========================================= */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusMsg = document.getElementById('form-status');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Disable submit button temporarily
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'SENDING...';

    // Simulate network request
    setTimeout(() => {
      // 프론트엔드 검증 완료 후, 실제 전송 로직이 들어갈 자리입니다.
      // 예: fetch('YOUR_API_ENDPOINT', { method: 'POST', body: new FormData(form) })
      
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'SEND MESSAGE';
      
      statusMsg.style.color = 'var(--color-charcoal-black)';
      statusMsg.textContent = 'Thank you. Your message has been sent successfully.';
      
      setTimeout(() => {
        statusMsg.textContent = '';
      }, 5000);
    }, 1500);
  });
}

/* =========================================
   5. Hero Image Rotation
========================================= */
function initHeroRotation() {
  const slots = document.querySelectorAll('.stagger-wrapper');
  if (slots.length === 0 || portfolioData.length === 0) return;

  // Dynamically build a pool of portrait-only images
  const pool = [];
  portfolioData.forEach(item => {
    const img = new Image();
    img.src = item.src;
    img.onload = () => {
      if (img.naturalHeight >= img.naturalWidth) {
        pool.push(item.src);
      }
    };
  });
  
  slots.forEach((slot, index) => {
    // Stagger the rotation for each slot slightly
    const intervalTime = 4000 + (index * 800) + (Math.random() * 500);
    let isPrimaryActive = true;
    
    const primaryImg = slot.querySelector('.hero-mini-img:first-child');
    const secondaryImg = slot.querySelector('.hero-mini-img:last-child');
    
    if (!primaryImg || !secondaryImg) return;
    
    setInterval(() => {
      // Wait until pool is populated
      if (pool.length === 0) return;
      
      // Pick random image from pool
      const randomSrc = pool[Math.floor(Math.random() * pool.length)];
      
      if (isPrimaryActive) {
        secondaryImg.src = randomSrc;
        secondaryImg.onload = () => {
          secondaryImg.classList.add('active');
          primaryImg.classList.remove('active');
          isPrimaryActive = false;
        };
      } else {
        primaryImg.src = randomSrc;
        primaryImg.onload = () => {
          primaryImg.classList.add('active');
          secondaryImg.classList.remove('active');
          isPrimaryActive = true;
        };
      }
    }, intervalTime);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
