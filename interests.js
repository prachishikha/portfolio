(function () {
  var wrap = document.querySelector('.interests-scroll-wrap');
  var scroll = document.querySelector('.interests-scroll');
  var dots = document.querySelectorAll('.interests-dot');
  var cards = document.querySelectorAll('.interest-card');
  if (!scroll || !cards.length) return;

  function updateState() {
    var scrollLeft = scroll.scrollLeft;
    var maxScroll = scroll.scrollWidth - scroll.clientWidth;

    // Fade + hint: hide when fully scrolled
    if (wrap) wrap.classList.toggle('is-end', scrollLeft >= maxScroll - 4);

    // Dots
    if (!dots.length) return;
    var cardWidth = cards[0].offsetWidth + 18;
    var index = Math.round(scrollLeft / cardWidth);
    index = Math.max(0, Math.min(index, dots.length - 1));
    dots.forEach(function (d, i) { d.classList.toggle('active', i === index); });
  }

  scroll.addEventListener('scroll', updateState, { passive: true });

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      var cardWidth = cards[0].offsetWidth + 18;
      scroll.scrollTo({ left: cardWidth * i, behavior: 'smooth' });
    });
  });
})();
