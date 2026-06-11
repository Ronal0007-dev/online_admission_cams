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
    { name: 'classLevel',    label: 'Class Level to Join' },
    { name: 'languageSpoken', label: 'Language(s) Spoken' }
  ],
  2: [],  // entirely optional
  3: [
    // Mother — required fields
    { name: 'motherFullName',       label: "Mother's Full Name",       tab: 'mother' },
    { name: 'motherOccupation',     label: "Mother's Occupation",      tab: 'mother' },
    { name: 'motherAddress',        label: "Mother's Physical Address", tab: 'mother' },
    { name: 'motherCountryOfBirth', label: "Mother's Country of Birth", tab: 'mother', hidden: true },
    { name: 'motherCitizenship',    label: "Mother's Citizenship",      tab: 'mother', hidden: true },
    { name: 'motherPhone',          label: "Mother's Phone Number",     tab: 'mother' },
    { name: 'motherEmail',          label: "Mother's Email Address",    tab: 'mother' },
    // Father — required fields
    { name: 'fatherFullName',       label: "Father's Full Name",       tab: 'father' },
    { name: 'fatherOccupation',     label: "Father's Occupation",      tab: 'father' },
    { name: 'fatherAddress',        label: "Father's Physical Address", tab: 'father' },
    { name: 'fatherCountryOfBirth', label: "Father's Country of Birth", tab: 'father', hidden: true },
    { name: 'fatherCitizenship',    label: "Father's Citizenship",      tab: 'father', hidden: true },
    { name: 'fatherPhone',          label: "Father's Phone Number",     tab: 'father' },
    { name: 'fatherEmail',          label: "Father's Email Address",    tab: 'father' }
  ],
  4: [
    { name: 'emergencyName',  label: 'Emergency Contact Name' },
    { name: 'emergencyPhone', label: 'Emergency Contact Phone' }
  ]
};

// ── Helpers ───────────────────────────────────────────────

function clearErrors(sectionEl) {
  sectionEl.querySelectorAll('.field-error-msg').forEach(e => e.remove());
  sectionEl.querySelectorAll('.field-error').forEach(e => e.classList.remove('field-error'));
  // Clear tab error badges
  sectionEl.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('tab-has-error'));
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

function switchParentTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabName);
  });
  document.querySelectorAll('.parent-panel').forEach(p => {
    p.classList.toggle('active', p.id === tabName);
  });
}

function validateSection(sectionNum) {
  const sectionEl = document.querySelector(`.form-section[data-section="${sectionNum}"]`);
  if (!sectionEl) return true;

  clearErrors(sectionEl);
  const rules = sectionRules[sectionNum] || [];
  let valid = true;
  let firstErrorEl = null;
  let firstErrorTab = null;

  // Group errors by tab so we can switch to the first tab that has errors
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
        // Track first error and its tab
        if (!firstErrorEl) {
          firstErrorEl = visibleEl;
          firstErrorTab = rule.tab || null;
        }
      }
    }
  });

  // Mark tabs that have errors with a visual badge
  const errorTabs = new Set(
    rules
      .filter(r => r.tab && !(r.hidden
        ? (sectionEl.querySelector(`input[type="hidden"][name="${r.name}"]`)?.value || '').trim()
        : (sectionEl.querySelector(`[name="${r.name}"]`)?.value || '').trim()))
      .map(r => r.tab)
  );
  sectionEl.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('tab-has-error', errorTabs.has(btn.dataset.tab));
  });

  // Switch to the tab containing the first error (for section 3)
  if (firstErrorTab) {
    switchParentTab(firstErrorTab);
  }

  if (firstErrorEl) {
    // Small delay so the tab switch completes before scrolling
    setTimeout(() => {
      firstErrorEl.focus();
      firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
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
    const requiredSections = [1, 3, 4];
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

function clearFieldError(el) {
  const wrap = el.closest('.searchable-select-wrap');
  const target = wrap ? wrap.querySelector('.searchable-input') : el;
  if (target) target.classList.remove('field-error');
  const msgSibling = wrap ? wrap.nextElementSibling : el.nextElementSibling;
  if (msgSibling && msgSibling.classList.contains('field-error-msg')) msgSibling.remove();

  // If no more errors remain on this tab, remove the tab error badge
  const panel = el.closest('.parent-panel');
  if (panel) {
    const tabId = panel.id;
    const section = el.closest('.form-section');
    const hasErrors = section && section.querySelector(`#${tabId} .field-error`);
    if (!hasErrors && section) {
      const tabBtn = section.querySelector(`.tab-btn[data-tab="${tabId}"]`);
      if (tabBtn) tabBtn.classList.remove('tab-has-error');
    }
  }
}

document.addEventListener('input', function (e) {
  const el = e.target;
  if (el.classList.contains('field-error') || el.closest('.searchable-select-wrap')) {
    clearFieldError(el);
  }
});

document.addEventListener('change', function (e) {
  const el = e.target;
  if (el.tagName === 'SELECT' || el.type === 'hidden') {
    clearFieldError(el);
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
