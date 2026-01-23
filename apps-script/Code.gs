/**
 * Google Apps Script for Wedding RSVP
 *
 * This script handles RSVP submissions from the wedding website
 * and updates the guest spreadsheet.
 *
 * Deployment:
 * 1. Open spreadsheet → Extensions → Apps Script
 * 2. Paste this code
 * 3. Deploy → New deployment → Web app
 * 4. Execute as: "Me", Access: "Anyone"
 * 5. Copy the web app URL to js/rsvp.js
 */

const SHEET_NAME = 'Guest list';

/**
 * GET handler - Returns list of guest names for autocomplete/validation
 * Supports JSONP via ?callback=functionName parameter (bypasses CORS)
 */
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const names = sheet.getRange('A2:A').getValues().flat().filter(n => n);
    const jsonData = JSON.stringify({ names: names });

    // Check for JSONP callback parameter (e may be undefined when testing in editor)
    const callback = e && e.parameter && e.parameter.callback;
    if (callback) {
      // Return JSONP response (bypasses CORS)
      return ContentService
        .createTextOutput(callback + '(' + jsonData + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    // Regular JSON response
    return ContentService
      .createTextOutput(jsonData)
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    const errorJson = JSON.stringify({ error: error.message });
    const callback = e && e.parameter && e.parameter.callback;

    if (callback) {
      return ContentService
        .createTextOutput(callback + '(' + errorJson + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService
      .createTextOutput(errorJson)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * POST handler - Updates guest RSVP in spreadsheet
 *
 * Expected payload:
 * {
 *   name: string,           // Guest name (must match spreadsheet)
 *   attending: string,      // "Sim" or "Não"
 *   stayingHotel: string,   // "Sim" or "Não" or ""
 *   adults: number,         // Number of adults
 *   childrenPaying: number, // Children 6-12 (half price)
 *   childrenFree: number,   // Children under 6 (free)
 *   notes: string           // Optional notes/dietary restrictions
 * }
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    // Find row by name (case-insensitive)
    const names = sheet.getRange('A2:A').getValues().flat();
    const rowIndex = names.findIndex(n =>
      n.toString().toLowerCase() === data.name.toLowerCase()
    );

    if (rowIndex === -1) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Name not found'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const row = rowIndex + 2; // +2 for header row and 0-index

    // Update columns:
    // C: Confirmou que vai (Attending)
    // D: Staying in Hotel
    // E: Adultos
    // F: Criancas pagantes meia
    // G: Criancas nao pagante
    // H: Notes
    // I: RSVP Date (timestamp)

    sheet.getRange(row, 3).setValue(data.attending);       // C
    sheet.getRange(row, 4).setValue(data.stayingHotel);    // D
    sheet.getRange(row, 5).setValue(data.adults);          // E
    sheet.getRange(row, 6).setValue(data.childrenPaying);  // F
    sheet.getRange(row, 7).setValue(data.childrenFree);    // G
    sheet.getRange(row, 8).setValue(data.notes);           // H
    sheet.getRange(row, 9).setValue(new Date());           // I

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
function testGetNames() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const names = sheet.getRange('A2:A').getValues().flat().filter(n => n);
  Logger.log('Guest names: ' + JSON.stringify(names));
}
