// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// 3D tilt on profile photo
(function(){
  var wrap = document.getElementById('photoWrap');
  if (!wrap) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;
  wrap.addEventListener('mousemove', function(e){
    var r = wrap.getBoundingClientRect();
    var dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
    var dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
    wrap.style.transition = 'transform 0.05s ease';
    wrap.style.transform = 'perspective(700px) rotateY(' + (dx * 14) + 'deg) rotateX(' + (-dy * 14) + 'deg) scale(1.04)';
  });
  wrap.addEventListener('mouseleave', function(){
    wrap.style.transition = 'transform 0.5s cubic-bezier(.22,1,.36,1)';
    wrap.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg) scale(1)';
  });
})();

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
  links.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

// Cursor-reactive hero: spotlight, trailing dot, magnetic button, nudge headline word
(function(){
  var hero = document.getElementById('hero');
  var spotlight = document.getElementById('spotlight');
  var dot = document.getElementById('cursorDot');
  var btn = document.getElementById('magBtn');
  var word = document.getElementById('magWord');
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch devices

  hero.addEventListener('mousemove', function(e){
    var r = hero.getBoundingClientRect();
    var x = e.clientX - r.left;
    var y = e.clientY - r.top;

    spotlight.style.setProperty('--mx', x + 'px');
    spotlight.style.setProperty('--my', y + 'px');

    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
    dot.style.opacity = '1';

    var br = btn.getBoundingClientRect();
    var bx = e.clientX - (br.left + br.width / 2);
    var by = e.clientY - (br.top + br.height / 2);
    var bd = Math.hypot(bx, by);
    btn.style.transform = bd < 130 ? 'translate(' + bx * 0.25 + 'px,' + by * 0.25 + 'px)' : 'translate(0,0)';

    var wr = word.getBoundingClientRect();
    var wx = e.clientX - (wr.left + wr.width / 2);
    var wy = e.clientY - (wr.top + wr.height / 2);
    var wd = Math.hypot(wx, wy);
    word.style.transform = wd < 170 ? 'translate(' + wx * 0.06 + 'px,' + wy * 0.06 + 'px)' : 'translate(0,0)';
  });

  hero.addEventListener('mouseleave', function(){
    dot.style.opacity = '0';
    btn.style.transform = 'translate(0,0)';
    word.style.transform = 'translate(0,0)';
  });
})();

// Subtle tilt on project cards
(function(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.project-card').forEach(function(card){
    card.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = 'perspective(700px) rotateY(' + x * 6 + 'deg) rotateX(' + -y * 6 + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', function(){
      card.style.transform = '';
    });
  });
})();
