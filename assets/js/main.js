/* ===== FORM LOAD TIME TRACKING ===== */
window._formLoadTime = Date.now();
document.querySelectorAll('input[name="form_load_time"]').forEach(el => {
  el.value = window._formLoadTime;
});

/* ===== SAVE LEADS TO ADMIN DASHBOARD ===== */
function saveLead(data) {
  // Get existing leads from localStorage
  let leads = JSON.parse(localStorage.getItem('formLeads')) || [];

  // Create lead object
  const lead = {
    id: Date.now(),
    name: data.full_name || data.name || 'Unknown',
    phone: data.phone || '',
    email: data.email || '',
    address: data.address || '',
    message: data.message || '',
    bestTime: data.best_time || '',
    formType: data.form_type || 'contact',
    timestamp: data.timestamp || new Date().toISOString(),
    contacted: false
  };

  // Add to leads array
  leads.unshift(lead);

  // Save back to localStorage
  localStorage.setItem('formLeads', JSON.stringify(leads));
}

/* ===== STICKY HEADER ON SCROLL ===== */
const header = document.getElementById('site-header');

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const debouncedScroll = debounce(() => {
  header.classList.toggle('scrolled', window.scrollY > 80);
}, 50);

window.addEventListener('scroll', debouncedScroll, { passive: true });

/* ===== MOBILE NAV TOGGLE ===== */
const burger = document.getElementById('nav-burger');
const overlay = document.getElementById('nav-overlay');
const navClose = document.getElementById('nav-close');
const overlayLinks = document.querySelectorAll('.nav-overlay-link');

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  overlay.classList.toggle('open');
});

navClose.addEventListener('click', () => {
  burger.classList.remove('open');
  overlay.classList.remove('open');
});

overlayLinks.forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    overlay.classList.remove('open');
  });
});

// Close mobile nav when clicking on header (but not the burger button)
document.getElementById('site-header')?.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-burger')) {
    burger.classList.remove('open');
    overlay.classList.remove('open');
  }
});

/* ===== SMOOTH SCROLL for anchor links ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      // Close mobile nav when scrolling
      burger.classList.remove('open');
      overlay.classList.remove('open');

      // Calculate header height based on screen size
      const headerHeight = window.innerWidth < 480 ? 60 : 72;
      const targetPosition = target.offsetTop - headerHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

/* ===== SEARCH BAR ===== */
document.getElementById('search-btn').addEventListener('click', () => {
  const city = document.getElementById('search-city').value;
  const minPrice = document.getElementById('search-min').value;
  const maxPrice = document.getElementById('search-max').value;
  const beds = document.getElementById('search-beds').value;

  let url = 'https://latishablake.joestockdale.com/';
  const params = new URLSearchParams();

  if (city) params.set('city', encodeURIComponent(city));
  if (minPrice) params.set('minprice', minPrice);
  if (maxPrice) params.set('maxprice', maxPrice);
  if (beds) params.set('beds', beds);

  if ([...params].length > 0) {
    url += '?' + params.toString();
  }

  window.open(url, '_blank');
});

/* ===== FORM VALIDATION ===== */
function validateFormData(data) {
  const errors = [];

  // Phone format validation
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  if (!phoneRegex.test(data.phone?.replace(/\s/g, ''))) {
    errors.push('Invalid phone format');
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    errors.push('Invalid email format');
  }

  // Required fields
  if (!data.full_name?.trim() || !data.phone?.trim() || !data.email?.trim()) {
    errors.push('All fields required');
  }

  return { valid: errors.length === 0, errors };
}

/* ===== FORM SUBMISSION WITH SPAM PROTECTION ===== */
async function submitForm(formId, successId, formType) {
  const form = document.getElementById(formId);
  if (!form) return;

  // Prevent default
  event.preventDefault();

  // Get honeypot value
  const honeypot = form.querySelector('[name="website"]').value;
  if (honeypot) {
    return; // Bot detected
  }

  // Check time elapsed
  const loadTimeInput = form.querySelector('[name="form_load_time"]');
  const loadTime = parseInt(loadTimeInput.value);
  const timeElapsed = Date.now() - loadTime;

  if (timeElapsed < 3000) {
    return; // Submitted too quickly
  }

  // Collect form data
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  // Validate form data
  const validation = validateFormData(data);
  if (!validation.valid) {
    alert('Please fix the following: ' + validation.errors.join(', '));
    return;
  }

  data.form_type = formType;
  data.time_elapsed = timeElapsed;
  data.timestamp = new Date().toISOString();

  // Save to localStorage for admin dashboard
  saveLead(data);

  try {
    // Replace with your actual Google Apps Script URL
    const scriptUrl = 'YOUR_APPS_SCRIPT_URL';

    if (scriptUrl !== 'YOUR_APPS_SCRIPT_URL') {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    }

    // Show success state
    form.style.display = 'none';
    const successDiv = document.getElementById(successId);
    if (successDiv) {
      successDiv.style.display = 'block';
    }

    // Reset after 5 seconds
    setTimeout(() => {
      form.reset();
      form.style.display = 'flex';
      if (successDiv) {
        successDiv.style.display = 'none';
      }
      // Reset load time
      document.querySelectorAll('input[name="form_load_time"]').forEach(el => {
        el.value = Date.now();
      });
    }, 5000);

  } catch (error) {
    console.error('Form submission error:', error);
    // Still show success for UX purposes
    form.style.display = 'none';
    const successDiv = document.getElementById(successId);
    if (successDiv) {
      successDiv.style.display = 'block';
    }

    setTimeout(() => {
      form.reset();
      form.style.display = 'flex';
      if (successDiv) {
        successDiv.style.display = 'none';
      }
      document.querySelectorAll('input[name="form_load_time"]').forEach(el => {
        el.value = Date.now();
      });
    }, 5000);
  }
}

// Attach to form submit events
document.getElementById('valuation-form')?.addEventListener('submit', (e) => {
  submitForm('valuation-form', 'valuation-success', 'valuation');
});

document.getElementById('contact-form')?.addEventListener('submit', (e) => {
  submitForm('contact-form', 'contact-success', 'contact');
});

/* ===== TESTIMONIAL CAROUSEL ===== */
class Carousel {
  constructor() {
    this.track = document.getElementById('carousel-track');
    this.cards = document.querySelectorAll('.testimonial-card');
    this.prevBtn = document.getElementById('carousel-prev');
    this.nextBtn = document.getElementById('carousel-next');
    this.dotsContainer = document.getElementById('carousel-dots');

    this.currentIndex = 0;
    this.autoPlayInterval = null;

    this.init();
  }

  init() {
    this.createDots();
    this.attachEventListeners();
    this.startAutoPlay();
    this.displayCard(0);
  }

  createDots() {
    this.cards.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'dot';
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        this.stopAutoPlay();
        this.displayCard(index);
        this.startAutoPlay();
      });
      this.dotsContainer.appendChild(dot);
    });
  }

  attachEventListeners() {
    this.prevBtn?.addEventListener('click', () => {
      this.stopAutoPlay();
      this.prev();
      this.startAutoPlay();
    });

    this.nextBtn?.addEventListener('click', () => {
      this.stopAutoPlay();
      this.next();
      this.startAutoPlay();
    });

    this.track?.addEventListener('mouseenter', () => this.stopAutoPlay());
    this.track?.addEventListener('mouseleave', () => this.startAutoPlay());

    // Touch swipe
    let touchStartX = 0;
    let touchEndX = 0;

    this.track?.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    this.track?.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    });

    const handleSwipe = () => {
      if (touchStartX - touchEndX > 50) {
        this.stopAutoPlay();
        this.next();
        this.startAutoPlay();
      }
      if (touchEndX - touchStartX > 50) {
        this.stopAutoPlay();
        this.prev();
        this.startAutoPlay();
      }
    };

    this.handleSwipe = handleSwipe;
  }

  displayCard(index) {
    this.currentIndex = index;
    const offset = -index * 100;
    this.track.style.transform = `translateX(${offset}%)`;

    // Update dots
    document.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
    this.displayCard(this.currentIndex);
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.cards.length;
    this.displayCard(this.currentIndex);
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.next();
    }, 6000);
  }

  stopAutoPlay() {
    clearInterval(this.autoPlayInterval);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Carousel();
});

/* ===== FILTER CHIPS ===== */
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
  });
});

/* ===== KEYBOARD ACCESSIBILITY ===== */
document.addEventListener('keydown', (e) => {
  // Close mobile nav with Escape
  if (e.key === 'Escape') {
    burger.classList.remove('open');
    overlay.classList.remove('open');
  }
});

/* ===== LAZY LOAD IMAGES ===== */
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}

/* ===== PERFORMANCE: Prefetch external links ===== */
window.addEventListener('load', () => {
  const externalLinks = [
    'https://latishablake.joestockdale.com',
    'https://www.joestockdale.com',
    'https://www.joestockdale.com/home-valuation'
  ];

  externalLinks.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
});

/* ===== CONSOLE BRANDING ===== */
console.log('%cLatisha Blake | REALTOR®', 'font-family: Georgia, serif; font-size: 20px; font-weight: 600; color: #C9A84C;');
console.log('%cSimple. Smooth. Stress-Free.', 'font-family: Inter, sans-serif; font-size: 14px; color: #1A1A2E;');
