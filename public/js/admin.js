// Sidebar mobile toggle
const sidebar = document.querySelector('.sidebar');
const toggle = document.getElementById('sidebarToggle');

if (toggle && sidebar) {
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

// Auto-dismiss alerts
setTimeout(() => {
  document.querySelectorAll('.alert-success, .alert-error').forEach(el => {
    el.style.transition = 'opacity 0.5s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 500);
  });
}, 5000);
