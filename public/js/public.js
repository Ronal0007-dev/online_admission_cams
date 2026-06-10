// ── Multi-step form with validation ─────────────────────────

const sections = document.querySelectorAll('.form-section');
const steps    = document.querySelectorAll('.step');

// ── Validation rules per section ─────────────────────────
// hidden: true = value lives in input[type=hidden] (searchable select)
const sectionRules = {
  1: [
    { name: 'fullName',       label: 'Full Name' },
    { name: 'dateOfBirth',    label: 'Date of Birth' },
    { name: 'gender',         label: 'Gender' },
    { name: 'countryOfBirth', label: 'Country of Birth', hidden: true },
    { name: 'citizenship',    label: 'Citizenship',      hidden: true },
    { name: 'languageSpoken', label: 'Language(s) Spoken' }
  ],
  2: [],  // entirely optional
  3: [],  // parent info — optional
  4: [
    { name: 'emergencyName',  label: 'Emergency Contact Name' },
    { name: 'emergencyPhone', label: 'Emergency Contact Phone' }
  ]
};

// ── Helpers ───────────────────────────────────────────────

function clearErrors(sectionEl) {
  sectionEl.querySelectorAll('.field-error-msg').forEach(e => e.remove());
  sectionEl.querySelectorAll('.field-error').forEach(e => e.classList.remove('field-error'));
}

function markError(visibleEl, message) {
  visibleEl.classList.add('field-error');
  // Remove any existing message first
  const existing = visibleEl.closest('.searchable-select-wrap')
    ? visibleEl.closest('.searchable-select-wrap').nextElementSibling
    : visibleEl.nextElementSibling;
  if (existing && existing.classList.contains('field-error-msg')) existing.remove();

  const msg = document.createElement('span');
  msg.className = 'field-error-msg';
  msg.textContent = message;
  const anchor = visibleEl.closest('.searchable-select-wrap') || visibleEl;
  anchor.insertAdjacentElement('afterend', msg);
}

function validateSection(sectionNum) {
  const sectionEl = document.querySelector(`.form-section[data-section="${sectionNum}"]`);
  if (!sectionEl) return true;

  clearErrors(sectionEl);
  const rules = sectionRules[sectionNum] || [];
  let valid = true;
  let firstErrorEl = null;

  rules.forEach(rule => {
    const fieldEl = rule.hidden
      ? sectionEl.querySelector(`input[type="hidden"][name="${rule.name}"]`)
      : sectionEl.querySelector(`[name="${rule.name}"]`);
    if (!fieldEl) return;

    const value = (fieldEl.value || '').trim();
    if (!value) {
      valid = false;
      const visibleEl = rule.hidden
        ? sectionEl.querySelector(`.searchable-input[data-target="${rule.name}"]`)
        : fieldEl;
      if (visibleEl) {
        markError(visibleEl, `${rule.label} is required.`);
        if (!firstErrorEl) firstErrorEl = visibleEl;
      }
    }
  });

  if (firstErrorEl) {
    firstErrorEl.focus();
    firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  return valid;
}

function shakeSection(sectionNum) {
  const el = document.querySelector(`.form-section[data-section="${sectionNum}"]`);
  if (!el) return;
  el.classList.remove('section-shake');
  void el.offsetWidth; // force reflow
  el.classList.add('section-shake');
  el.addEventListener('animationend', () => el.classList.remove('section-shake'), { once: true });
}

// ── Step display ──────────────────────────────────────────

function showSection(n) {
  sections.forEach((s, i) => {
    s.classList.toggle('active', i + 1 === n);
  });
  steps.forEach((s, i) => {
    s.classList.remove('active', 'completed');
    if (i + 1 === n) s.classList.add('active');
    if (i + 1 < n)  s.classList.add('completed');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Next buttons ──────────────────────────────────────────

document.querySelectorAll('.btn-next').forEach(btn => {
  btn.addEventListener('click', () => {
    const currentSection = parseInt(btn.closest('.form-section').dataset.section);
    const next = parseInt(btn.dataset.next);
    if (validateSection(currentSection)) {
      showSection(next);
    } else {
      shakeSection(currentSection);
    }
  });
});

// ── Prev buttons ──────────────────────────────────────────

document.querySelectorAll('.btn-prev').forEach(btn => {
  btn.addEventListener('click', () => {
    const currentSection = parseInt(btn.closest('.form-section').dataset.section);
    const sectionEl = document.querySelector(`.form-section[data-section="${currentSection}"]`);
    if (sectionEl) clearErrors(sectionEl);
    showSection(parseInt(btn.dataset.prev));
  });
});

// ── Final submit: validate all required sections ──────────

const form = document.getElementById('admissionForm');
if (form) {
  form.addEventListener('submit', function (e) {
    const requiredSections = [1, 4];
    let failSection = null;

    for (const sNum of requiredSections) {
      if (!validateSection(sNum)) {
        if (failSection === null) failSection = sNum;
      }
    }

    if (failSection !== null) {
      e.preventDefault();
      showSection(failSection);
      shakeSection(failSection);
    }
  });
}

// ── Live clear errors on change ───────────────────────────

document.addEventListener('input', function (e) {
  const el = e.target;
  if (el.classList.contains('field-error')) {
    el.classList.remove('field-error');
    const wrap = el.closest('.searchable-select-wrap');
    const next = wrap ? wrap.nextElementSibling : el.nextElementSibling;
    if (next && next.classList.contains('field-error-msg')) next.remove();
  }
});

document.addEventListener('change', function (e) {
  const el = e.target;
  if (el.tagName === 'SELECT') {
    el.classList.remove('field-error');
    const next = el.nextElementSibling;
    if (next && next.classList.contains('field-error-msg')) next.remove();
  }
  if (el.type === 'hidden') {
    const wrap = el.closest('.searchable-select-wrap');
    if (wrap) {
      const vis = wrap.querySelector('.searchable-input');
      if (vis) {
        vis.classList.remove('field-error');
        const msg = wrap.nextElementSibling;
        if (msg && msg.classList.contains('field-error-msg')) msg.remove();
      }
    }
  }
});

// ── Parent tabs ───────────────────────────────────────────

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.parent-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(tab)?.classList.add('active');
  });
});
