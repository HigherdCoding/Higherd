// Higherd – small progressive enhancements (the page works without JS)

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Respect prefers-reduced-motion: stop the hero video (CSS shows the poster instead)
const heroVideo = document.querySelector('.hero__video');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function syncVideoWithMotionPreference() {
  if (!heroVideo) return;

  if (reducedMotion.matches) {
    heroVideo.removeAttribute('autoplay');
    heroVideo.pause();
  } else {
    // play() can reject (e.g. data saver); the poster stays visible then
    heroVideo.play().catch(() => {});
  }
}

syncVideoWithMotionPreference();
reducedMotion.addEventListener('change', syncVideoWithMotionPreference);

// Contact form: inline validation + submit via fetch (no page reload)
const form = document.getElementById('contact-form');

const messages = {
  name: 'Please enter your name.',
  company: 'Please enter your company name.',
  email: 'Please enter a valid email address.',
  phone: 'Please enter a valid phone number.',
  role: 'Please enter your role in the company.',
  requestType: 'Please choose what you are interested in.',
  message: 'Please tell us how we can help.',
};

function fieldError(field) {
  const value = field.value.trim();
  if (!value) return messages[field.name];
  if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return messages.email;
  if (field.type === 'tel' && !/^[0-9 +()\/-]{6,}$/.test(value)) return messages.phone;
  return '';
}

function showFieldError(field, message) {
  const errorEl = document.getElementById(`${field.id}-error`);
  errorEl.textContent = message;
  if (message) {
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', errorEl.id);
  } else {
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  }
}

if (form) {
  const fields = [...form.querySelectorAll('input, select, textarea')];
  const statusEl = form.querySelector('.form__status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const successEl = form.parentElement.querySelector('.form__success');

  // Validate on blur, then live once a field has been flagged
  fields.forEach((field) => {
    field.addEventListener('blur', () => {
      if (!form.hidden) showFieldError(field, fieldError(field));
    });
    field.addEventListener('input', () => {
      if (field.hasAttribute('aria-invalid')) showFieldError(field, fieldError(field));
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    statusEl.textContent = '';

    let firstInvalid = null;
    fields.forEach((field) => {
      const message = fieldError(field);
      showFieldError(field, message);
      if (message && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    if (form.getAttribute('action').includes('FORM_ENDPOINT_HERE')) {
      statusEl.textContent = 'This form is not connected yet. Please try again later.';
      console.warn('Contact form: set the form action to your form endpoint (see TODO in index.html).');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      form.reset();
      form.hidden = true;
      successEl.hidden = false;
      successEl.focus();
    } catch (error) {
      statusEl.textContent = 'Something went wrong while sending. Please try again.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  });
}
