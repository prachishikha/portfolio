// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Protect images — block right-click save and drag
(function(){
  document.addEventListener('contextmenu', function(e){
    if (e.target.tagName === 'IMG') e.preventDefault();
  });
  document.addEventListener('dragstart', function(e){
    if (e.target.tagName === 'IMG') e.preventDefault();
  });
})();

// Mobile nav toggle
(function(){
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  toggle.addEventListener('click', function(){
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.querySelectorAll('a, button').forEach(function(el){
    el.addEventListener('click', function(){
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

// Magnetic hover on the hero CTA button
(function(){
  var hero = document.getElementById('hero');
  var btn = document.getElementById('magBtn');
  if (!hero || !btn || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch devices

  hero.addEventListener('mousemove', function(e){
    var br = btn.getBoundingClientRect();
    var bx = e.clientX - (br.left + br.width / 2);
    var by = e.clientY - (br.top + br.height / 2);
    var bd = Math.hypot(bx, by);
    btn.style.transform = bd < 130 ? 'translate(' + bx * 0.25 + 'px,' + by * 0.25 + 'px)' : 'translate(0,0)';
  });

  hero.addEventListener('mouseleave', function(){
    btn.style.transform = 'translate(0,0)';
  });
})();
