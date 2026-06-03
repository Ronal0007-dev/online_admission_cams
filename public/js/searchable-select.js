/**
 * Searchable Select Widget
 * Powers all .searchable-select-wrap elements on the page.
 * Works for both public (apply form) and admin (edit form).
 */
(function () {
  function initSearchableSelects() {
    const wraps = document.querySelectorAll('.searchable-select-wrap');

    wraps.forEach(function (wrap) {
      const input = wrap.querySelector('.searchable-input');
      const hidden = wrap.querySelector('input[type="hidden"]');
      const list = wrap.querySelector('.dropdown-list');
      const items = Array.from(list.querySelectorAll('.dropdown-item'));
      let highlightIndex = -1;

      // ── If a value is already set (form re-render), mark it ─
      if (hidden.value) {
        const matched = items.find(i => i.dataset.value === hidden.value);
        if (matched) matched.classList.add('selected');
      }

      // Add empty message node (hidden by default)
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'dropdown-empty';
      emptyMsg.textContent = 'No results found';
      emptyMsg.style.display = 'none';
      list.appendChild(emptyMsg);

      function openDropdown() {
        // Close all others first
        document.querySelectorAll('.searchable-select-wrap.open').forEach(function (w) {
          if (w !== wrap) closeDropdown(w);
        });
        wrap.classList.add('open');
        filterItems('');
        input.select();
        scrollToSelected();
      }

      function closeDropdown(targetWrap) {
        targetWrap = targetWrap || wrap;
        targetWrap.classList.remove('open');
        // Restore display value to the saved hidden value
        const h = targetWrap.querySelector('input[type="hidden"]');
        const inp = targetWrap.querySelector('.searchable-input');
        inp.value = h.value;
        // Reset filter
        targetWrap.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('hidden', 'highlighted'));
        targetWrap.querySelector('.dropdown-empty').style.display = 'none';
        highlightIndex = -1;
      }

      function scrollToSelected() {
        const sel = list.querySelector('.selected');
        if (sel) {
          sel.scrollIntoView({ block: 'nearest' });
        }
      }

      function filterItems(query) {
        const q = query.toLowerCase().trim();
        let visibleCount = 0;
        highlightIndex = -1;

        items.forEach(function (item) {
          const text = item.textContent.toLowerCase();
          const match = text.includes(q);
          item.classList.toggle('hidden', !match);
          item.classList.remove('highlighted');
          if (match) visibleCount++;
        });

        emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none';
      }

      function getVisibleItems() {
        return items.filter(i => !i.classList.contains('hidden'));
      }

      function setHighlight(idx) {
        const visible = getVisibleItems();
        visible.forEach(i => i.classList.remove('highlighted'));
        if (idx >= 0 && idx < visible.length) {
          visible[idx].classList.add('highlighted');
          visible[idx].scrollIntoView({ block: 'nearest' });
        }
        highlightIndex = idx;
      }

      function selectItem(item) {
        const value = item.dataset.value;
        hidden.value = value;
        input.value = value;
        items.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        wrap.classList.remove('open');
        highlightIndex = -1;
        // Trigger change for any listeners
        hidden.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // ── Events ──────────────────────────────────────────
      input.addEventListener('click', function () {
        if (wrap.classList.contains('open')) {
          closeDropdown();
        } else {
          openDropdown();
        }
      });

      input.addEventListener('input', function () {
        if (!wrap.classList.contains('open')) wrap.classList.add('open');
        filterItems(this.value);
        emptyMsg.style.display = getVisibleItems().length === 0 ? 'block' : 'none';
      });

      input.addEventListener('keydown', function (e) {
        const visible = getVisibleItems();
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (!wrap.classList.contains('open')) openDropdown();
          setHighlight(Math.min(highlightIndex + 1, visible.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlight(Math.max(highlightIndex - 1, 0));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (highlightIndex >= 0 && visible[highlightIndex]) {
            selectItem(visible[highlightIndex]);
          } else if (visible.length === 1) {
            selectItem(visible[0]);
          }
        } else if (e.key === 'Escape') {
          closeDropdown();
          input.blur();
        } else if (e.key === 'Tab') {
          closeDropdown();
        }
      });

      items.forEach(function (item) {
        item.addEventListener('mousedown', function (e) {
          e.preventDefault(); // prevent input blur before click fires
          selectItem(item);
        });
      });

      // Close on outside click
      document.addEventListener('mousedown', function (e) {
        if (!wrap.contains(e.target)) {
          if (wrap.classList.contains('open')) closeDropdown();
        }
      });
    });
  }

  // Run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchableSelects);
  } else {
    initSearchableSelects();
  }
})();
