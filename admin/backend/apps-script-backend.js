/**
 * Google Apps Script backend for Latisha Blake Real Estate forms.
 *
 * Setup:
 * 1. Create a Google Sheet with the column headers listed below.
 * 2. Replace SHEET_ID with the ID from the sheet URL.
 * 3. Deploy this Apps Script as a Web app.
 * 4. Set "Execute as" to your account and "Who has access" to Anyone.
 * 5. Paste the deployed Web app URL into APPS_SCRIPT_URL in assets/js/main.js.
 */

const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID';
const SHEET_NAME = 'Leads';
const ADMIN_EMAIL = 'youragentlatisha@gmail.com';

const REQUIRED_FIELDS = {
  valuation: ['full_name', 'phone', 'email', 'address'],
  contact: ['full_name', 'phone', 'email', 'message']
};

function doPost(e) {
  try {
    const data = parseRequest(e);
    const validation = validateSubmission(data);

    if (!validation.valid) {
      return jsonResponse({ success: false, error: validation.error });
    }

    appendLead(data);
    sendLeadNotification(data);

    return jsonResponse({ success: true });
  } catch (error) {
    Logger.log(`doPost error: ${error}`);
    return jsonResponse({ success: false, error: 'Unable to save your request right now.' });
  }
}

function parseRequest(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Missing request body');
  }

  return JSON.parse(e.postData.contents);
}

function validateSubmission(data) {
  if (data.website && String(data.website).trim()) {
    return { valid: false, error: 'Submission blocked.' };
  }

  if (!data.time_elapsed || Number(data.time_elapsed) < 2500) {
    return { valid: false, error: 'Submission blocked.' };
  }

  const formType = data.form_type === 'valuation' ? 'valuation' : 'contact';
  const required = REQUIRED_FIELDS[formType];
  const missing = required.find((field) => !String(data[field] || '').trim());

  if (missing) {
    return { valid: false, error: 'Please complete all required fields.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }

  if (!/^\+?1?\s*\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/.test(String(data.phone))) {
    return { valid: false, error: 'Please enter a valid phone number.' };
  }

  return { valid: true };
}

function appendLead(data) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error(`Sheet not found: ${SHEET_NAME}`);
  }

  sheet.appendRow([
    new Date(),
    data.timestamp || '',
    data.form_type || '',
    clean(data.full_name),
    clean(data.phone),
    clean(data.email),
    clean(data.address),
    clean(data.best_time),
    clean(data.message),
    clean(data.page_url),
    'New'
  ]);
}

function sendLeadNotification(data) {
  const formLabel = data.form_type === 'valuation' ? 'Home Valuation Request' : 'Contact Form';
  const subject = `New ${formLabel}: ${clean(data.full_name)}`;
  const htmlBody = `
    <h2 style="color:#1A1A2E;font-family:Georgia,serif;">New Lead Received</h2>
    <p><strong>Form:</strong> ${formLabel}</p>
    <p><strong>Name:</strong> ${escapeHtml(data.full_name)}</p>
    <p><strong>Phone:</strong> <a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></p>
    <p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
    ${data.address ? `<p><strong>Property Address:</strong> ${escapeHtml(data.address)}</p>` : ''}
    ${data.best_time ? `<p><strong>Best Time:</strong> ${escapeHtml(data.best_time)}</p>` : ''}
    ${data.message ? `<p><strong>Message:</strong><br>${escapeHtml(data.message).replace(/\n/g, '<br>')}</p>` : ''}
    <p><strong>Page:</strong> ${escapeHtml(data.page_url || '')}</p>
  `;

  MailApp.sendEmail(ADMIN_EMAIL, subject, '', { htmlBody });
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function clean(value) {
  return String(value || '').trim();
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
