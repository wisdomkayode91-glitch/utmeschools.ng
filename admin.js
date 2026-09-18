/* ============================================================
   UTMESchools v2 — auth.js
   Access code system. No email required.
   Eye toggle for password visibility.
   ============================================================ */

const SUPABASE_URL = 'https://hxrfakdqnuzdigbbvszp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cmZha2RxbnV6ZGlnYmJ2c3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MjY0MzgsImV4cCI6MjEwNTAwMjQzOH0.-xz5Y08e_RQ-C6OHKnSfeoVPSV7kAqzeZcL62MO0tOY';

/* ================================================================
   CHECK IF ALREADY ACTIVATED ON THIS DEVICE
   If yes, skip auth entirely and go straight to app
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const deviceCode = localStorage.getItem('utme_access_code');
  const devicePaid = localStorage.getItem('utme_is_paid');

  /* If device is already activated, go straight to app */
  if (deviceCode && devicePaid === 'true') {
    window.location.href = 'select-subjects.html';
    return;
  }

  /* Wire up eye toggle */
  const toggle = document.getElementById('eyeToggle');
  const codeInput = document.getElementById('accessCodeInput');
  if (toggle && codeInput) {
    toggle.addEventListener('click', () => {
      const isHidden = codeInput.type === 'password';
      codeInput.type = isHidden ? 'text' : 'password';
      toggle.textContent = isHidden ? '🙈' : '👁️';
    });
  }

  /* Wire activate button */
  const activateBtn = document.getElementById('activateBtn');
  if (activateBtn) {
    activateBtn.addEventListener('click', activateCode);
  }

  /* Wire free start button */
  const freeBtn = document.getElementById('freeBtn');
  if (freeBtn) {
    freeBtn.addEventListener('click', startFree);
  }

  /* Wire pay button */
  const payBtn = document.getElementById('payBtn');
  if (payBtn) {
    payBtn.addEventListener('click', openPayment);
  }
});

/* ================================================================
   ACTIVATE ACCESS CODE
   ================================================================ */
async function activateCode() {
  const input = document.getElementById('accessCodeInput');
  const code  = (input?.value || '').trim().toUpperCase();

  if (!code) {
    showToast('Please enter your access code');
    return;
  }

  showToast('Checking code...');

  try {
    /* Check code in Supabase */
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/access_codes?code=eq.${code}&select=*`,
      {
        headers: {
          'apikey':        SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    );

    const data = await res.json();

    if (!data || data.length === 0) {
      showToast('Invalid code. Please check and try again.');
      return;
    }

    const record = data[0];

    /* Check if code is expired */
    if (record.expires_at && new Date(record.expires_at) < new Date()) {
      showToast('This code has expired. Please renew your subscription.');
      return;
    }

    /* Check device limit */
    const devices = record.activated_devices || [];
    const deviceId = getDeviceId();

    if (!devices.includes(deviceId) && devices.length >= record.max_devices) {
      showToast(`This code is already active on ${record.max_devices} device(s). Contact support to add more.`);
      return;
    }

    /* Add this device if not already there */
    if (!devices.includes(deviceId)) {
      devices.push(deviceId);
      await fetch(
        `${SUPABASE_URL}/rest/v1/access_codes?code=eq.${code}`,
        {
          method: 'PATCH',
          headers: {
            'apikey':        SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({ activated_devices: devices })
        }
      );
    }

    /* Save to localStorage — device is now activated */
    localStorage.setItem('utme_access_code', code);
    localStorage.setItem('utme_is_paid', 'true');
    localStorage.setItem('utme_plan', record.plan || 'jamb');
    localStorage.setItem('utme_expires', record.expires_at || '');
    localStorage.setItem('utme_device_id', deviceId);

    showToast('Access activated! Welcome to UTMESchools 🎉');
    setTimeout(() => { window.location.href = 'select-subjects.html'; }, 1200);

  } catch(e) {
    console.error(e);
    showToast('Connection error. Please check your internet and try again.');
  }
}

/* ================================================================
   START FREE (10 questions per subject)
   ================================================================ */
function startFree() {
  localStorage.setItem('utme_is_paid', 'false');
  window.location.href = 'select-subjects.html';
}

/* ================================================================
   OPEN PAYSTACK PAYMENT
   ================================================================ */
function openPayment() {
  /* Check if Paystack script is loaded */
  if (typeof PaystackPop === 'undefined') {
    showToast('Loading payment system...');
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => launchPaystack();
    document.head.appendChild(script);
  } else {
    launchPaystack();
  }
}

function launchPaystack() {
  const plan = document.getElementById('planSelect')?.value || 'jamb';
  const phone = document.getElementById('phoneInput')?.value?.trim() || '';

  const prices = {
    jamb:     250000,  /* ₦2,500 in kobo */
    waec:     250000,
    neco:     250000,
    postutme: 250000,
    jamb_waec: 400000, /* ₦4,000 bundle */
    all_four:  700000, /* ₦7,000 bundle */
  };

  const amount = prices[plan] || 250000;

  const handler = PaystackPop.setup({
    key:    'pk_test_79cdf7943af134f028eacba68108922699a830fe',
    amount: amount,
    currency: 'NGN',
    ref:    'UTME-' + Date.now(),
    metadata: { plan, phone, device_id: getDeviceId() },
    callback: function(response) {
      /* Payment successful — verify and activate */
      verifyPayment(response.reference, plan, phone);
    },
    onClose: function() {
      showToast('Payment cancelled.');
    }
  });
  handler.openIframe();
}

/* ================================================================
   VERIFY PAYMENT AND GENERATE ACCESS CODE
   ================================================================ */
async function verifyPayment(reference, plan, phone) {
  showToast('Verifying payment...');
  try {
    /* Generate access code */
    const code = generateCode();

    /* Save code to Supabase */
    const deviceId = getDeviceId();
    const expires  = new Date();
    expires.setFullYear(expires.getFullYear() + 1); /* 1 year access */

    const res = await fetch(`${SUPABASE_URL}/rest/v1/access_codes`, {
      method: 'POST',
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify({
        code,
        plan,
        phone,
        paystack_ref:       reference,
        activated_devices:  [deviceId],
        max_devices:        2,
        expires_at:         expires.toISOString(),
        created_at:         new Date().toISOString(),
      })
    });

    if (res.ok || res.status === 201) {
      /* Activate on this device immediately */
      localStorage.setItem('utme_access_code', code);
      localStorage.setItem('utme_is_paid', 'true');
      localStorage.setItem('utme_plan', plan);
      localStorage.setItem('utme_expires', expires.toISOString());
      localStorage.setItem('utme_device_id', deviceId);

      /* Show code to student */
      const codeDisplay = document.getElementById('codeDisplay');
      const codeValue   = document.getElementById('codeValue');
      if (codeDisplay && codeValue) {
        codeValue.textContent = code;
        codeDisplay.style.display = 'block';
      }

      showToast('Payment successful! Your code: ' + code);
      setTimeout(() => { window.location.href = 'select-subjects.html'; }, 3000);
    } else {
      showToast('Payment received but activation failed. Contact support with ref: ' + reference);
    }
  } catch(e) {
    showToast('Error activating. Save this reference: ' + reference);
  }
}

/* ================================================================
   HELPERS
   ================================================================ */
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg   = () => Array.from({length:4}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
  return `UTME-${seg()}-${seg()}-${new Date().getFullYear()}`;
}

function getDeviceId() {
  let id = localStorage.getItem('utme_device_id');
  if (!id) {
    id = 'DEV-' + Date.now() + '-' + Math.random().toString(36).slice(2,8).toUpperCase();
    localStorage.setItem('utme_device_id', id);
  }
  return id;
}

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
                 }
     
