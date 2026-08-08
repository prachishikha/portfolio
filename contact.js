// Powered by Web3Forms (https://web3forms.com) — free, no backend required.
// Get your access key at https://web3forms.com (enter your email, no signup) and paste it below.
const WEB3FORMS_ACCESS_KEY = 'YOUR_ACCESS_KEY_HERE';

(function () {
  const prompts = document.querySelectorAll('.contact__prompt');
  const messageField = document.getElementById('contactMessage');
  const form = document.getElementById('contactForm');
  const status = document.getElementById('contactStatus');
  const submitBtn = document.getElementById('contactSubmit');
  const success = document.getElementById('contactSuccess');
  const successName = document.getElementById('contactSuccessName');
  const successReset = document.getElementById('contactSuccessReset');
  if (!form || !messageField) return;

  const emailInput = document.getElementById('contactEmail');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validateEmail(val) {
    return emailRe.test(val.trim());
  }

  emailInput.addEventListener('blur', function () {
    if (emailInput.value && !validateEmail(emailInput.value)) {
      emailInput.style.borderColor = 'var(--accent2)';
      status.textContent = 'Please enter a valid email address.';
      status.className = 'contact__status contact__status--error';
    } else {
      emailInput.style.borderColor = '';
      if (status.classList.contains('contact__status--error') &&
          status.textContent === 'Please enter a valid email address.') {
        status.textContent = '';
        status.className = 'contact__status';
      }
    }
  });

  emailInput.addEventListener('input', function () {
    if (validateEmail(emailInput.value)) {
      emailInput.style.borderColor = '';
      if (status.textContent === 'Please enter a valid email address.') {
        status.textContent = '';
        status.className = 'contact__status';
      }
    }
  });

  prompts.forEach(function (btn) {
    btn.addEventListener('click', function () {
      messageField.value = btn.dataset.message || '';
      messageField.focus();
      messageField.setSelectionRange(messageField.value.length, messageField.value.length);
    });
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = messageField.value.trim();
    if (!name || !email || !message) return;
    if (!validateEmail(email)) {
      emailInput.style.borderColor = 'var(--accent2)';
      status.textContent = 'Please enter a valid email address.';
      status.className = 'contact__status contact__status--error';
      emailInput.focus();
      return;
    }

    if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === 'YOUR_ACCESS_KEY_HERE') {
      status.textContent = 'Form isn’t connected yet — email me directly at prachi@example.com instead.';
      status.className = 'contact__status contact__status--error';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    status.textContent = '';
    status.className = 'contact__status';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `Portfolio website message — ${name}`,
          from_name: 'Portfolio Website',
          name,
          email,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Request failed');

      successName.textContent = name.split(' ')[0] || 'there';
      form.hidden = true;
      success.hidden = false;
      form.reset();
    } catch (err) {
      status.textContent = "Couldn't send that just now — email me directly at prachi@example.com instead.";
      status.className = 'contact__status contact__status--error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
    }
  });

  if (successReset) {
    successReset.addEventListener('click', function () {
      success.hidden = true;
      form.hidden = false;
      status.textContent = '';
      status.className = 'contact__status';
    });
  }
})();
