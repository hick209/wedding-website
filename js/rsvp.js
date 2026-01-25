/**
 * RSVP Form Handler
 *
 * Handles the RSVP form submission with validation.
 * Communicates with Google Apps Script backend to store submissions.
 */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyeyVbg_OklaIbMzNKJRS9-BG2LveJLzXlvK1kMCJ7AXlW7o_BvUT-CO2u5-1ikz0by/exec';

/**
 * Validate name (at least 3 characters)
 */
function validateName(name) {
  return name && name.trim().length >= 3;
}

/**
 * Validate email format
 */
function validateEmail(email) {
  if (!email) return true; // Empty is OK (phone might be provided instead)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (at least 11 digits after removing formatting)
 */
function validatePhone(phone) {
  if (!phone) return true; // Empty is OK (email might be provided instead)
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 11;
}

/**
 * Validate that at least one valid contact method is provided
 * Returns an object with 'valid' boolean and optional 'reason' for error display
 */
function validateContact() {
  const email = document.getElementById('rsvp-email').value.trim();
  const phone = document.getElementById('rsvp-phone').value.trim();

  // At least one must be provided
  if (!email && !phone) return { valid: false, reason: 'missing' };

  // If email provided, it must be valid
  if (email && !validateEmail(email)) return { valid: false, reason: 'invalidEmail' };

  // If phone provided, it must be valid
  if (phone && !validatePhone(phone)) return { valid: false, reason: 'invalidPhone' };

  return { valid: true };
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
 * Hide contact error when user starts typing in email or phone
 */
function setupContactInputs() {
  const emailInput = document.getElementById('rsvp-email');
  const phoneInput = document.getElementById('rsvp-phone');
  const contactError = document.getElementById('contact-error');

  if (!contactError) return;

  [emailInput, phoneInput].forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        contactError.style.display = 'none';
      });
    }
  });
}

/**
 * Reset form state (hide messages, re-enable button)
 */
function resetFormState() {
  document.getElementById('rsvp-success').style.display = 'none';
  document.getElementById('rsvp-error').style.display = 'none';
  document.getElementById('name-error').style.display = 'none';
  document.getElementById('contact-error').style.display = 'none';
}

/**
 * Get error message for contact validation failure
 */
function getContactErrorMessage(reason) {
  // Try to get translations if available
  if (typeof translations !== 'undefined' && typeof getCurentLanguage === 'function') {
    const lang = getCurentLanguage();
    if (reason === 'invalidEmail' && translations[lang]['rsvp.invalidEmail']) {
      return translations[lang]['rsvp.invalidEmail'];
    }
    if (reason === 'invalidPhone' && translations[lang]['rsvp.invalidPhone']) {
      return translations[lang]['rsvp.invalidPhone'];
    }
    if (translations[lang]['rsvp.contactError']) {
      return translations[lang]['rsvp.contactError'];
    }
  }

  // Fallback messages
  if (reason === 'invalidEmail') return 'Please enter a valid email address';
  if (reason === 'invalidPhone') return 'Please enter a valid phone number (at least 8 digits)';
  return 'Please provide email or phone number';
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

  // Validate name (at least 3 characters)
  if (!validateName(name)) {
    nameError.style.display = 'block';
    nameInput.focus();
    return;
  }

  // Validate contact info (at least one valid email or phone)
  const contactResult = validateContact();
  if (!contactResult.valid) {
    const contactError = document.getElementById('contact-error');
    contactError.textContent = getContactErrorMessage(contactResult.reason);
    contactError.style.display = 'block';
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
    email: document.getElementById('rsvp-email').value.trim(),
    phone: document.getElementById('rsvp-phone').value.trim(),
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
  setupContactInputs();
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
