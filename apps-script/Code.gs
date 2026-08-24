/**
 * Google Apps Script for Wedding RSVP
 *
 * This script handles RSVP submissions from the wedding website
 * and appends them to a dedicated submissions sheet.
 *
 * Deployment:
 * 1. Open spreadsheet → Extensions → Apps Script
 * 2. Paste this code
 * 3. Deploy → New deployment → Web app
 * 4. Execute as: "Me", Access: "Anyone"
 * 5. Copy the web app URL to js/rsvp.js
 */

const SUBMISSIONS_SHEET = 'RSVP Submissions';

/**
 * POST handler - Appends RSVP submission to spreadsheet
 *
 * Expected payload:
 * {
 *   name: string,           // Guest name
 *   email: string,          // Email address (optional if phone provided)
 *   phone: string,          // Phone number (optional if email provided)
 *   attending: string,      // "Sim" or "Não"
 *   adults: number,         // Number of adults
 *   childrenPaying: number, // Children 6-12 (half price)
 *   childrenFree: number,   // Children under 6 (free)
 *   notes: string           // Optional notes/dietary restrictions
 * }
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Get or create the submissions sheet
    let sheet = ss.getSheetByName(SUBMISSIONS_SHEET);
    if (!sheet) {
      sheet = ss.insertSheet(SUBMISSIONS_SHEET);
      // Add headers
      sheet.getRange(1, 1, 1, 9).setValues([[
        'Name', 'Email', 'Phone', 'Attending',
        'Adults', 'Children (5-12)', 'Children (<5)', 'Notes', 'Timestamp'
      ]]);
    }

    // Append new row
    sheet.appendRow([
      data.name,
      data.email || '',
      data.phone || '',
      data.attending,
      data.adults,
      data.childrenPaying,
      data.childrenFree,
      data.notes,
      new Date(),
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function - Run this to verify spreadsheet access
 */
function testAppend() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SUBMISSIONS_SHEET);
  if (!sheet) {
    Logger.log('Submissions sheet not found - will be created on first submission');
  } else {
    const lastRow = sheet.getLastRow();
    Logger.log('Submissions sheet exists with ' + lastRow + ' rows');
  }
}
