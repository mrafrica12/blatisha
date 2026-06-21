/**
 * Google Apps Script Backend for Latisha Blake Real Estate Website
 *
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Go to script.google.com
 * 2. Create a new Apps Script project
 * 3. Replace default code with this script
 * 4. Create a Google Sheet (or use existing)
 * 5. Copy the Sheet ID from the URL: sheets.google.com/spreadsheets/d/[SHEET_ID]/edit
 * 6. Update the SHEET_ID constant below
 * 7. Deploy as Web App:
 *    - Deploy > New deployment > Web app
 *    - Execute as: Your account (youragentlatisha@gmail.com)
 *    - Who has access: Anyone
 * 8. Copy the deployment URL: https://script.googleusercontent.com/...
 * 9. Paste URL into main.js, line 139: const scriptUrl = 'YOUR_APPS_SCRIPT_URL';
 * 10. Test by submitting a form
 */

// ===== CONFIGURATION =====
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'; // Replace with your sheet ID
const ADMIN_EMAIL = 'youragentlatisha@gmail.com';
const SHEET_NAME = 'Leads';

// ===== MAIN POST HANDLER =====
function doPost(e) {
  try {
    // Parse JSON request body
    const data = JSON.parse(e.postData.contents);

    // ===== SPAM DETECTION =====
    // Check honeypot field (should be empty)
    if (data.website && data.website.trim() !== '') {
      return ContentService.createTextOutput('blocked')
        .setMimeType(ContentService.MimeType.TEXT);
    }

    // Check time elapsed (form should take at least 3 seconds)
    if (!data.time_elapsed || data.time_elapsed < 3000) {
      return ContentService.createTextOutput('blocked')
        .setMimeType(ContentService.MimeType.TEXT);
    }

    // Basic validation
    if (!data.full_name || !data.email || !data.phone) {
      return ContentService.createTextOutput('invalid')
        .setMimeType(ContentService.MimeType.TEXT);
    }

    // ===== SAVE TO GOOGLE SHEET =====
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    // Create row data
    const row = [
      data.timestamp || new Date().toISOString(),
      data.form_type || 'unknown',
      data.full_name || '',
      data.phone || '',
      data.email || '',
      data.address || data.message || '',
      data.best_time || '',
      'new' // Status: new lead
    ];

    sheet.appendRow(row);

    // ===== SEND EMAIL NOTIFICATION =====
    sendLeadNotification(data);

    return ContentService.createTextOutput('success')
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput('error')
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

// ===== EMAIL NOTIFICATION FUNCTION =====
function sendLeadNotification(data) {
  try {
    const formType = data.form_type === 'valuation' ? 'Home Valuation Request' : 'Contact Form';
    const subject = `New Lead: ${data.full_name} (${formType})`;

    const htmlBody = `
      <h2 style="color:#1A1A2E; font-family:Georgia,serif;">New Lead Received</h2>

      <table style="width:100%; border-collapse:collapse; font-family:Inter,sans-serif; font-size:14px;">
        <tr>
          <td style="padding:8px; border-bottom:1px solid #E8E4DC;"><strong>Name:</strong></td>
          <td style="padding:8px; border-bottom:1px solid #E8E4DC;">${escapeHtml(data.full_name || '')}</td>
        </tr>
        <tr>
          <td style="padding:8px; border-bottom:1px solid #E8E4DC;"><strong>Email:</strong></td>
          <td style="padding:8px; border-bottom:1px solid #E8E4DC;"><a href="mailto:${escapeHtml(data.email || '')}">${escapeHtml(data.email || '')}</a></td>
        </tr>
        <tr>
          <td style="padding:8px; border-bottom:1px solid #E8E4DC;"><strong>Phone:</strong></td>
          <td style="padding:8px; border-bottom:1px solid #E8E4DC;"><a href="tel:${escapeHtml(data.phone || '')}">${escapeHtml(data.phone || '')}</a></td>
        </tr>
        <tr>
          <td style="padding:8px; border-bottom:1px solid #E8E4DC;"><strong>Form Type:</strong></td>
          <td style="padding:8px; border-bottom:1px solid #E8E4DC;">${data.form_type === 'valuation' ? 'Home Valuation Request' : 'Contact Form'}</td>
        </tr>
        ${data.address ? `
        <tr>
          <td style="padding:8px; border-bottom:1px solid #E8E4DC;"><strong>Property Address:</strong></td>
          <td style="padding:8px; border-bottom:1px solid #E8E4DC;">${escapeHtml(data.address)}</td>
        </tr>
        ` : ''}
        ${data.best_time ? `
        <tr>
          <td style="padding:8px; border-bottom:1px solid #E8E4DC;"><strong>Best Time to Call:</strong></td>
          <td style="padding:8px; border-bottom:1px solid #E8E4DC;">${escapeHtml(data.best_time)}</td>
        </tr>
        ` : ''}
        ${data.message ? `
        <tr>
          <td style="padding:8px; border-bottom:1px solid #E8E4DC;"><strong>Message:</strong></td>
          <td style="padding:8px; border-bottom:1px solid #E8E4DC;">${escapeHtml(data.message).replace(/\n/g, '<br>')}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding:8px;"><strong>Submitted:</strong></td>
          <td style="padding:8px;">${data.timestamp}</td>
        </tr>
      </table>

      <hr style="border:none; border-top:1px solid #E8E4DC; margin:20px 0;">
      <p style="font-size:12px; color:#6B6B6B; font-family:Inter,sans-serif;">
        Automated lead notification from latishablake.com | Joe Stockdale Real Estate
      </p>
    `;

    MailApp.sendEmail(ADMIN_EMAIL, subject, '', { htmlBody: htmlBody });

  } catch (error) {
    Logger.log('Error sending email: ' + error.toString());
    // Don't throw - email failure shouldn't block form submission
  }
}

// ===== UTILITY: HTML ESCAPE =====
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ===== OPTIONAL: GET ALL LEADS =====
function getLeads(limit = 100) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    return data.slice(-limit).reverse(); // Latest first
  } catch (error) {
    Logger.log('Error getting leads: ' + error.toString());
    return [];
  }
}

// ===== OPTIONAL: UPDATE LEAD STATUS =====
function updateLeadStatus(rowIndex, status) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    sheet.getRange(rowIndex, 8).setValue(status); // Column H is status
  } catch (error) {
    Logger.log('Error updating lead: ' + error.toString());
  }
}

// ===== OPTIONAL: DELETE LEAD =====
function deleteLead(rowIndex) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    sheet.deleteRow(rowIndex);
  } catch (error) {
    Logger.log('Error deleting lead: ' + error.toString());
  }
}
