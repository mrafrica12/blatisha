const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL';
const WHATSAPP_URL = 'https://wa.me/16784380539';

const header = document.getElementById('site-header');
const burger = document.getElementById('nav-burger');
const overlay = document.getElementById('nav-overlay');
const navClose = document.getElementById('nav-close');
const overlayLinks = document.querySelectorAll('.nav-overlay-link');

window._formLoadTime = Date.now();
document.querySelectorAll('input[name="form_load_time"]').forEach((el) => {
  el.value = window._formLoadTime;
});

document.querySelectorAll('.whatsapp-link').forEach((link) => {
  link.href = WHATSAPP_URL;
});

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function setMenuOpen(isOpen) {
  burger?.classList.toggle('open', isOpen);
  overlay?.classList.toggle('open', isOpen);
  document.body.classList.toggle('nav-open', isOpen);
  burger?.setAttribute('aria-expanded', String(isOpen));
  overlay?.setAttribute('aria-hidden', String(!isOpen));
}

function getAnchorOffset() {
  const headerHeight = header?.offsetHeight || (window.innerWidth < 480 ? 60 : 72);
  return headerHeight + (window.innerWidth < 480 ? 16 : 24);
}

function getAnchorTarget(target) {
  if (target.id === 'hero' || target.id === 'search') return target;
  return target.querySelector('.eyebrow, h2, .contact-info h2') || target;
}

const updateHeader = debounce(() => {
  header?.classList.toggle('scrolled', window.scrollY > 80);
}, 50);

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

burger?.addEventListener('click', () => {
  setMenuOpen(!overlay?.classList.contains('open'));
});

navClose?.addEventListener('click', () => setMenuOpen(false));
overlayLinks.forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setMenuOpen(false);
  }
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    setMenuOpen(false);

    const scrollTarget = getAnchorTarget(target);
    window.scrollTo({
      top: Math.max(0, scrollTarget.getBoundingClientRect().top + window.scrollY - getAnchorOffset()),
      behavior: 'smooth'
    });
  });
});

document.getElementById('search-btn')?.addEventListener('click', () => {
  const city = document.getElementById('search-city')?.value.trim();
  const minPrice = document.getElementById('search-min')?.value;
  const maxPrice = document.getElementById('search-max')?.value;
  const beds = document.getElementById('search-beds')?.value;
  const params = new URLSearchParams();

  if (city) params.set('city', city);
  if (minPrice) params.set('minprice', minPrice);
  if (maxPrice) params.set('maxprice', maxPrice);
  if (beds) params.set('beds', beds);

  const query = params.toString();
  const url = `https://latishablake.joestockdale.com/${query ? `?${query}` : ''}`;
  window.open(url, '_blank', 'noopener,noreferrer');
});

document.querySelectorAll('.filter-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach((item) => item.classList.remove('active'));
    chip.classList.add('active');
  });
});

function validateFormData(data, formType) {
  const errors = [];
  const phoneRegex = /^\+?1?\s*\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!data.full_name?.trim()) errors.push('Please enter your full name.');
  if (!data.phone?.trim() || !phoneRegex.test(data.phone.trim())) errors.push('Please enter a valid phone number.');
  if (!data.email?.trim() || !emailRegex.test(data.email.trim())) errors.push('Please enter a valid email address.');
  if (formType === 'valuation' && !data.address?.trim()) errors.push('Please enter the property address.');
  if (formType === 'contact' && !data.message?.trim()) errors.push('Please enter your message.');

  return errors;
}

function setFormMessage(form, message, isError) {
  const errorBox = form.querySelector('.form-error');
  if (!errorBox) return;

  errorBox.textContent = message || '';
  errorBox.hidden = !isError || !message;
}

function setSubmitting(form, isSubmitting) {
  const submitButton = form.querySelector('button[type="submit"]');
  form.classList.toggle('is-submitting', isSubmitting);
  if (submitButton) {
    submitButton.disabled = isSubmitting;
    submitButton.dataset.originalText ||= submitButton.textContent;
    submitButton.textContent = isSubmitting ? 'Sending...' : submitButton.dataset.originalText;
  }
}

function showSuccess(form, successId) {
  const success = document.getElementById(successId);
  form.querySelectorAll('input:not([type="hidden"]):not(.honeypot), select, textarea, button[type="submit"], .form-error')
    .forEach((el) => {
      el.hidden = true;
    });

  if (success) {
    success.hidden = false;
  }
}

async function sendToGoogleSheets(data) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL') {
    throw new Error('The Google Apps Script web app URL has not been configured.');
  }

  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'The submission could not be saved.');
  }

  return result;
}

async function handleFormSubmit(event, formType, successId) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  if (data.website) return;

  const errors = validateFormData(data, formType);
  if (errors.length) {
    setFormMessage(form, errors[0], true);
    return;
  }

  const loadTime = Number(data.form_load_time || window._formLoadTime);
  const timeElapsed = Date.now() - loadTime;
  if (timeElapsed < 2500) return;

  data.form_type = formType;
  data.time_elapsed = timeElapsed;
  data.timestamp = new Date().toISOString();
  data.page_url = window.location.href;

  setFormMessage(form, '', false);
  setSubmitting(form, true);

  try {
    await sendToGoogleSheets(data);
    form.reset();
    showSuccess(form, successId);
  } catch (error) {
    setFormMessage(form, error.message || 'Something went wrong. Please call Latisha directly.', true);
  } finally {
    setSubmitting(form, false);
    const now = Date.now();
    document.querySelectorAll('input[name="form_load_time"]').forEach((el) => {
      el.value = now;
    });
  }
}

document.getElementById('valuation-form')?.addEventListener('submit', (event) => {
  handleFormSubmit(event, 'valuation', 'valuation-success');
});

document.getElementById('contact-form')?.addEventListener('submit', (event) => {
  handleFormSubmit(event, 'contact', 'contact-success');
});

class Carousel {
  constructor() {
    this.track = document.getElementById('carousel-track');
    this.cards = document.querySelectorAll('.testimonial-card');
    this.prevBtn = document.getElementById('carousel-prev');
    this.nextBtn = document.getElementById('carousel-next');
    this.dotsContainer = document.getElementById('carousel-dots');
    this.currentIndex = 0;
    this.autoPlayInterval = null;
  }

  init() {
    if (!this.track || this.cards.length === 0 || !this.dotsContainer) return;

    this.createDots();
    this.attachEventListeners();
    this.displayCard(0);
    this.startAutoPlay();
  }

  createDots() {
    this.cards.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Show testimonial ${index + 1}`);
      dot.classList.toggle('active', index === 0);
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

    let touchStartX = 0;
    this.track.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    this.track.addEventListener('touchend', (event) => {
      const touchEndX = event.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) this.next();
      if (touchEndX - touchStartX > 50) this.prev();
    }, { passive: true });
  }

  displayCard(index) {
    this.currentIndex = index;
    this.track.style.transform = `translateX(-${index * 100}%)`;
    this.dotsContainer.querySelectorAll('.dot').forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
    });
  }

  prev() {
    this.displayCard((this.currentIndex - 1 + this.cards.length) % this.cards.length);
  }

  next() {
    this.displayCard((this.currentIndex + 1) % this.cards.length);
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = window.setInterval(() => this.next(), 6000);
  }

  stopAutoPlay() {
    window.clearInterval(this.autoPlayInterval);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Carousel().init();
});
