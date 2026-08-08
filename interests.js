(function () {
  const chips = document.querySelectorAll('.interest-chip');
  const panel = document.getElementById('interestPanel');
  if (!chips.length || !panel) return;

  const contents = panel.querySelectorAll('.interest-panel__content');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      const key = chip.dataset.interest;
      const isOpen = chip.getAttribute('aria-expanded') === 'true';

      chips.forEach(function (c) { c.setAttribute('aria-expanded', 'false'); });
      contents.forEach(function (c) { c.hidden = true; });

      chip.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
      const target = panel.querySelector('[data-panel="' + key + '"]');
      if (target) target.hidden = false;
    });
  });
})();
