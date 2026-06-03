// Multi-step form navigation
const sections = document.querySelectorAll('.form-section');
const steps = document.querySelectorAll('.step');

function showSection(n) {
  sections.forEach((s, i) => {
    s.classList.toggle('active', i + 1 === n);
  });
  steps.forEach((s, i) => {
    s.classList.remove('active', 'completed');
    if (i + 1 === n) s.classList.add('active');
    if (i + 1 < n) s.classList.add('completed');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.btn-next').forEach(btn => {
  btn.addEventListener('click', () => {
    const next = parseInt(btn.dataset.next);
    showSection(next);
  });
});

document.querySelectorAll('.btn-prev').forEach(btn => {
  btn.addEventListener('click', () => {
    const prev = parseInt(btn.dataset.prev);
    showSection(prev);
  });
});

// Parent tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.parent-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(tab)?.classList.add('active');
  });
});

// Checkbox visual
document.querySelectorAll('.checkbox-label input[type="checkbox"]').forEach(cb => {
  // handled via CSS
});
