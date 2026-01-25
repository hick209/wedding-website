# Google Apps Script - RSVP Backend

This directory contains the Google Apps Script code that serves as the backend for the wedding website RSVP functionality.

## Files

- `Code.gs` - Main script file with POST handler

## How It Works

The script is deployed as a web app that:
1. **POST requests** - Appends RSVP submissions to a dedicated "RSVP Submissions" sheet
2. Automatically creates the sheet with headers if it doesn't exist

## Deployment Instructions

### Initial Setup

1. Open the Google Spreadsheet: [Wedding Guest List](https://docs.google.com/spreadsheets/d/1nblCMPod4bukG7xuU2YCp3kdz_G2xmKG882VBUvsbhk/edit)

2. Go to **Extensions → Apps Script**

3. Delete any existing code and paste the contents of `Code.gs`

4. Click **Deploy → New deployment**

5. Configure deployment:
   - Select type: **Web app**
   - Description: "RSVP Handler v2"
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

After deployment, you can test the endpoint:

**Test POST (submit RSVP):**
```bash
curl -X POST -H "Content-Type: text/plain" \
  -d '{"name":"Test Guest","email":"test@example.com","phone":"+1234567890","attending":"Sim","stayingHotel":"Sim","adults":2,"childrenPaying":0,"childrenFree":0,"notes":""}' \
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

## Column Mapping (RSVP Submissions Sheet)

| Column | Header | Description |
|--------|--------|-------------|
| A | Name | Guest name |
| B | Email | Email address |
| C | Phone | Phone number |
| D | Attending | "Sim" or "Não" |
| E | Adults | Number of adults |
| F | Children (6-12) | Children paying half price |
| G | Children (<6) | Children free |
| H | Notes | Dietary restrictions, etc. |
| I | Timestamp | Auto-generated submission time |

## Troubleshooting

**"Script function not found: doPost"**
- Make sure you saved the script after pasting

**"Authorization required"**
- Run the `testAppend` function first to trigger authorization
- Grant the required permissions

**CORS errors on localhost**
- POST requests use `no-cors` mode as a fallback for local testing
- The submission still works but you won't see the response

**Sheet not created**
- The "RSVP Submissions" sheet is auto-created on first submission
- Run `testAppend()` to verify spreadsheet access
