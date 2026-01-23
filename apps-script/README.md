# Google Apps Script - RSVP Backend

This directory contains the Google Apps Script code that serves as the backend for the wedding website RSVP functionality.

## Files

- `Code.gs` - Main script file with GET/POST handlers

## How It Works

The script is deployed as a web app that:
1. **GET requests** - Returns a list of guest names for autocomplete/validation
   - Supports JSONP via `?callback=functionName` parameter (bypasses CORS for local testing)
2. **POST requests** - Updates the guest's RSVP information in the spreadsheet

## Deployment Instructions

### Initial Setup

1. Open the Google Spreadsheet: [Wedding Guest List](https://docs.google.com/spreadsheets/d/1nblCMPod4bukG7xuU2YCp3kdz_G2xmKG882VBUvsbhk/edit)

2. Go to **Extensions → Apps Script**

3. Delete any existing code and paste the contents of `Code.gs`

4. Click **Deploy → New deployment**

5. Configure deployment:
   - Select type: **Web app**
   - Description: "RSVP Handler v1"
   - Execute as: **Me** (your account)
   - Who has access: **Anyone**

6. Click **Deploy**

7. **Authorize the app** when prompted (it needs access to your spreadsheet)

8. Copy the **Web app URL** (looks like: `https://script.google.com/macros/s/xxx/exec`)

9. Update `js/rsvp.js` with the URL:
    ```javascript
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';
    ```

### Testing

After deployment, you can test the endpoints:

**Test GET (list names):**
Open the web app URL in a browser - should return JSON with guest names.

**Test GET with JSONP (for local development):**
Open `YOUR_WEB_APP_URL?callback=myFunction` - returns JavaScript that calls `myFunction({names: [...]})`.

**Test POST (submit RSVP):**
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"name":"Test Guest","attending":"Sim","stayingHotel":"Sim","adults":2,"childrenPaying":0,"childrenFree":0,"notes":""}' \
  "YOUR_WEB_APP_URL"
```

### Updating the Script

When you make changes to `Code.gs`:

1. Copy the updated code to Apps Script editor
2. Go to **Deploy → Manage deployments**
3. Click the pencil icon on your deployment
4. Select **New version**
5. Click **Deploy**

Note: The URL stays the same when updating an existing deployment.

## Column Mapping

| Column | Header | Updated by RSVP |
|--------|--------|-----------------|
| A | Name | No (lookup key) |
| B | Save the Date | No |
| C | Confirmou que vai | Yes |
| D | Staying in Hotel | Yes |
| E | Adultos | Yes |
| F | Criancas pagantes meia | Yes |
| G | Criancas nao pagante | Yes |
| H | Notes | Yes |
| I | RSVP Date | Yes (auto timestamp) |

## Troubleshooting

**"Script function not found: doGet"**
- Make sure you saved the script after pasting

**"Authorization required"**
- Run the `testGetNames` function first to trigger authorization
- Grant the required permissions

**CORS errors on localhost**
- The GET endpoint supports JSONP which bypasses CORS
- The JavaScript automatically uses JSONP for loading guest names
- POST requests use `no-cors` mode as a fallback for local testing

**"Name not found" error**
- Check that the name matches exactly (case-insensitive)
- Verify the sheet name is "Guest list" or update `SHEET_NAME` constant
