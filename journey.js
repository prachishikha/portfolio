(function () {
  var stops = document.querySelectorAll('.journey__stop');
  if (!stops.length) return;

  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stops.forEach(function (stop) { stop.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25, rootMargin: '0px 0px -40px 0px' }
  );

  stops.forEach(function (stop) { observer.observe(stop); });
})();
