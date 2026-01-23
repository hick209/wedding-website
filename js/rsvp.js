/**
 * RSVP Form Handler
 *
 * Handles the RSVP form submission and guest name validation.
 * Communicates with Google Apps Script backend to update the spreadsheet.
 */

// TODO: Replace with your deployed Apps Script URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxDX2GYe_dScbo325fdGeCiqIqr2VbcZKcOVOmTGCvio1Mf2WXUNP7H6SUaE0Jw3_jo/exec';

let guestNames = [];
let isLoadingNames = false;

/**
 * Load guest names from the backend for autocomplete/validation
 * Uses JSONP to bypass CORS restrictions on localhost
 */
async function loadGuestNames() {
  if (isLoadingNames) return;
  isLoadingNames = true;

  try {
    // Use JSONP to bypass CORS (works from any origin)
    const data = await loadGuestNamesJsonp();
    guestNames = data.names || [];

    // Populate datalist for autocomplete
    const datalist = document.getElementById('guest-names');
    if (datalist) {
      datalist.innerHTML = ''; // Clear existing options
      guestNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        datalist.appendChild(option);
      });
    }

    console.log(`Loaded ${guestNames.length} guest names`);
  } catch (error) {
    console.error('Failed to load guest names:', error);
    // Don't show error to user - form will still work, just without autocomplete
  } finally {
    isLoadingNames = false;
  }
}

/**
 * Load guest names using JSONP (bypasses CORS)
 */
function loadGuestNamesJsonp() {
  return new Promise((resolve, reject) => {
    const callbackName = 'rsvpCallback_' + Date.now();
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP request timeout'));
    }, 10000);

    // Create global callback function
    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    function cleanup() {
      clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    }

    // Create and inject script element
    const script = document.createElement('script');
    script.src = APPS_SCRIPT_URL + '?callback=' + callbackName;
    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP script load failed'));
    };
    document.head.appendChild(script);
  });
}

/**
 * Validate that a name exists in the guest list (case-insensitive)
 * If guest names haven't loaded (CORS error on localhost), skip validation
 */
function validateName(name) {
  if (!name) return false;
  // If guest names couldn't be loaded, skip client-side validation
  // The server will validate the name
  if (guestNames.length === 0) return true;
  return guestNames.some(n =>
    n.toLowerCase().trim() === name.toLowerCase().trim()
  );
}

/**
 * Show/hide attendance details based on attendance selection
 */
function setupAttendanceToggle() {
  const radios = document.querySelectorAll('input[name="attending"]');
  const details = document.getElementById('attendance-details');

  if (!details) return;

  radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const isAttending = e.target.value === 'yes';
      details.style.display = isAttending ? 'block' : 'none';

      // If not attending, clear the detail fields
      if (!isAttending) {
        document.querySelectorAll('input[name="hotel"]').forEach(r => r.checked = false);
        document.getElementById('rsvp-adults').value = '1';
        document.getElementById('rsvp-children-paying').value = '0';
        document.getElementById('rsvp-children-free').value = '0';
        document.getElementById('rsvp-notes').value = '';
      }
    });
  });
}

/**
 * Hide name error when user starts typing
 */
function setupNameInput() {
  const nameInput = document.getElementById('rsvp-name');
  const nameError = document.getElementById('name-error');

  if (!nameInput || !nameError) return;

  nameInput.addEventListener('input', () => {
    nameError.style.display = 'none';
  });
}

/**
 * Reset form state (hide messages, re-enable button)
 */
function resetFormState() {
  document.getElementById('rsvp-success').style.display = 'none';
  document.getElementById('rsvp-error').style.display = 'none';
  document.getElementById('name-error').style.display = 'none';
}

/**
 * Handle RSVP form submission
 */
async function handleSubmit(event) {
  event.preventDefault();
  resetFormState();

  const nameInput = document.getElementById('rsvp-name');
  const name = nameInput.value.trim();
  const nameError = document.getElementById('name-error');

  // Validate name exists in guest list
  if (!validateName(name)) {
    nameError.style.display = 'block';
    nameInput.focus();
    return;
  }

  const attendingRadio = document.querySelector('input[name="attending"]:checked');
  if (!attendingRadio) {
    // HTML5 validation should catch this, but just in case
    return;
  }

  const isAttending = attendingRadio.value === 'yes';

  // Build RSVP data payload
  const data = {
    name: name,
    attending: isAttending ? 'Sim' : 'Não',
    stayingHotel: '',
    adults: 0,
    childrenPaying: 0,
    childrenFree: 0,
    notes: ''
  };

  // Only include details if attending
  if (isAttending) {
    const hotelRadio = document.querySelector('input[name="hotel"]:checked');
    data.stayingHotel = hotelRadio?.value === 'yes' ? 'Sim' : 'Não';
    data.adults = parseInt(document.getElementById('rsvp-adults').value) || 1;
    data.childrenPaying = parseInt(document.getElementById('rsvp-children-paying').value) || 0;
    data.childrenFree = parseInt(document.getElementById('rsvp-children-free').value) || 0;
    data.notes = document.getElementById('rsvp-notes').value.trim();
  }

  // Update UI to show loading state
  const submitBtn = document.getElementById('rsvp-submit');
  const originalBtnHtml = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span data-i18n="rsvp.submitting">Sending...</span>';

  // Re-apply translations for the loading text
  if (typeof applyTranslations === 'function' && typeof getCurentLanguage === 'function') {
    applyTranslations(getCurentLanguage());
  }

  try {
    let response;
    let result;

    try {
      // Try normal CORS request first (works from https origins)
      response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      result = await response.json();
    } catch (corsError) {
      // CORS failed (likely local http:// testing)
      // Try no-cors mode - we won't get a response but request may still work
      console.warn('CORS request failed, trying no-cors mode:', corsError.message);

      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(data)
      });

      // Can't read response in no-cors mode, assume success
      // The server will validate and process
      result = { success: true, noCorsMode: true };
    }

    if (result.success) {
      // Show success message
      document.getElementById('rsvp-success').style.display = 'block';

      if (result.noCorsMode) {
        console.log('RSVP submitted (no-cors mode - verify in spreadsheet)');
      }

      // Reset form
      document.getElementById('rsvp-form').reset();
      document.getElementById('attendance-details').style.display = 'none';

      // Close dialog after a short delay so user can see success message
      setTimeout(() => {
        closeRsvpDialog();
      }, 2000);
    } else {
      console.error('RSVP failed:', result.error);
      document.getElementById('rsvp-error').style.display = 'block';
    }
  } catch (error) {
    console.error('RSVP submission failed:', error);
    document.getElementById('rsvp-error').style.display = 'block';
  } finally {
    // Restore button state
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHtml;

    // Re-apply translations
    if (typeof applyTranslations === 'function' && typeof getCurentLanguage === 'function') {
      applyTranslations(getCurentLanguage());
    }
  }
}

/**
 * Open the RSVP dialog
 */
function openRsvpDialog() {
  const dialog = document.getElementById('dialog-rsvp');
  if (dialog) {
    dialog.showModal();
    // Load guest names if not already loaded
    if (guestNames.length === 0) {
      loadGuestNames();
    }
  }
}

/**
 * Close the RSVP dialog
 */
function closeRsvpDialog() {
  const dialog = document.getElementById('dialog-rsvp');
  if (dialog) {
    dialog.close();
    // Reset form state on close
    resetFormState();
    document.getElementById('rsvp-form')?.reset();
    const details = document.getElementById('attendance-details');
    if (details) details.style.display = 'none';
  }
}

/**
 * Initialize RSVP functionality when DOM is ready
 */
function initRSVP() {
  const form = document.getElementById('rsvp-form');
  if (!form) {
    // RSVP form not on this page
    return;
  }

  // Setup event handlers
  setupAttendanceToggle();
  setupNameInput();
  form.addEventListener('submit', handleSubmit);

  // Setup RSVP button click handlers
  document.querySelectorAll('.rsvp-btn').forEach(btn => {
    btn.addEventListener('click', openRsvpDialog);
  });

  console.log('RSVP form initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRSVP);
} else {
  initRSVP();
}
