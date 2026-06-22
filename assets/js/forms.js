// ═══════════════════════════════════════════════════════════
// LATISHA BLAKE — FORM SUBMISSION HANDLER
// Sends form data to Google Apps Script CRM via doPost()
// ═══════════════════════════════════════════════════════════

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwqnkiSiwlZEir6MDjSTk43KNw_4mmuYqLLafsE7adArL36vjAIuRn5HaoSaPclTH0drw/exec';

// Initialize form handlers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeFormHandlers();
});

function initializeFormHandlers() {
  const valuationForm = document.getElementById('valuation-form');
  const contactForm = document.getElementById('contact-form');

  if (valuationForm) {
    valuationForm.addEventListener('submit', handleFormSubmit);
  }
  if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const formType = formData.get('form_type');

  // Honeypot validation - silently block spam
  if (formData.get('website') && formData.get('website').length > 0) {
    console.log('Spam detected - form blocked');
    return;
  }

  // Disable submit button to prevent duplicate submissions
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  // Convert to JSON
  const data = {
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address') || '',
    message: formData.get('message') || '',
    form_type: formType,
    timestamp: new Date().toISOString()
  };

  try {
    // Send to Google Apps Script
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(data)
    });

    // With no-cors, we can't read the response, so assume success after a delay
    setTimeout(() => {
      showFormSuccess(form, formType);
      form.reset();
      if (submitBtn) submitBtn.disabled = false;
    }, 500);

  } catch (error) {
    console.error('Form submission error:', error);
    showFormError(form, 'Could not connect to server. Please try again.');
    if (submitBtn) submitBtn.disabled = false;
  }
}

function showFormSuccess(form, formType) {
  const successBox = form.querySelector('[class*="success"]');
  const errorBox = form.querySelector('[class*="error"]');

  if (errorBox) errorBox.hidden = true;
  if (successBox) {
    successBox.hidden = false;
    if (formType === 'valuation') {
      successBox.textContent = '✅ Valuation request received! Latisha will follow up within 24 hours.';
    } else {
      successBox.textContent = '✅ Message received! Latisha will contact you soon.';
    }
  }
}

function showFormError(form, message) {
  const errorBox = form.querySelector('[class*="error"]');
  const successBox = form.querySelector('[class*="success"]');

  if (successBox) successBox.hidden = true;
  if (errorBox) {
    errorBox.hidden = false;
    errorBox.textContent = `❌ ${message}`;
  }
}
