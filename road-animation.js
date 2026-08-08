(function () {
  const canvas = document.getElementById('roadCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* ─── PALETTE (matches portfolio) ───────────────────── */
  const P = {
    teal:    '#4A7A8A',
    amber:   '#B8875A',
    sage:    '#6B8F72',
    dust:    '#8A7A6A',
    inkDark: '#1C1A17',
    warmWht: '#F0EDE8',
    subGray: '#7A756D',
    grass1:  '#7DAB77',
    grass2:  '#6B9B65',
    sky1:    '#C8D8E8',
    sky2:    '#D8E8F2',
  };

  /* ─── STOPS ─────────────────────────────────────────── */
  const STOPS = [
    { frac: 0.00, label: 'BIT Mesra',    sub: '2014 – 2018', col: P.amber },
    { frac: 0.32, label: 'Amadeus Labs', sub: '2018 – 2021', col: P.teal  },
    { frac: 0.64, label: 'Workex',       sub: '2021 – 2023', col: P.dust  },
    { frac: 1.00, label: 'Digital Green',sub: '2023 – Present', col: P.sage },
  ];

  /* ─── STATE ──────────────────────────────────────────── */
  const S = { IDLE:0, DRIVING:1, AT_STOP:2, FINISHED:3 };
  let state = S.IDLE;
  let stopIdx = 0;
  let carT = 0;
  let segProg = 0;
  let segStart = 0, segEnd = 0;
  let W, H, pts, animId;
  let started = false;

  /* ─── PARTICLES & FX ─────────────────────────────────── */
  let exhausts = [];
  let confetti = [];
  let checkFlash = 0;
  let cardScale = 0;
  let pulse = 0;

  /* ─── INIT ───────────────────────────────────────────── */
  function init() {
    W = canvas.offsetWidth;
    H = 340;
    canvas.width  = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(devicePixelRatio, devicePixelRatio);
    pts = [
      [0.01,0.80],[0.07,0.74],[0.15,0.44],[0.25,0.28],
      [0.36,0.36],[0.47,0.60],[0.56,0.68],[0.65,0.54],
      [0.75,0.28],[0.85,0.20],[0.93,0.22],[0.99,0.24],
    ].map(([x,y])=>[x*W, y*H]);
  }

  /* ─── CATMULL-ROM ────────────────────────────────────── */
  function crp(t) {
    const n = pts.length-1;
    const s = Math.min(Math.floor(t*n), n-1);
    const u = t*n - s, u2=u*u, u3=u2*u;
    const p0=pts[Math.max(s-1,0)], p1=pts[s],
          p2=pts[Math.min(s+1,n)], p3=pts[Math.min(s+2,n)];
    return [
      0.5*(2*p1[0]+(-p0[0]+p2[0])*u+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*u2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*u3),
      0.5*(2*p1[1]+(-p0[1]+p2[1])*u+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*u2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*u3),
    ];
  }
  function ang(t) {
    const a=crp(Math.max(t-.003,0)), b=crp(Math.min(t+.003,1));
    return Math.atan2(b[1]-a[1], b[0]-a[0]);
  }

  /* ─── EASING ─────────────────────────────────────────── */
  function ease(x) {
    if(x < 0.25) return 2*x*x;
    if(x > 0.75) return 1-2*(1-x)*(1-x);
    return -0.125 + 1.25*x;
  }

  /* ─── INTERACTION ────────────────────────────────────── */
  function advance() {
    if(state === S.IDLE) {
      state = S.DRIVING;
      segStart = STOPS[0].frac; segEnd = STOPS[1].frac;
      segProg = 0; stopIdx = 1;
    } else if(state === S.AT_STOP) {
      if(stopIdx >= STOPS.length) { state = S.FINISHED; spawnConfetti(); }
      else {
        state = S.DRIVING;
        segStart = STOPS[stopIdx].frac; segEnd = STOPS[stopIdx+1]?.frac ?? 1;
        segProg = 0; stopIdx++;
      }
    }
  }
  canvas.addEventListener('click', advance);
  canvas.addEventListener('touchend', function(e){ e.preventDefault(); advance(); });
  document.addEventListener('keydown', function(e){
    if(e.code==='Space'||e.code==='ArrowRight') advance();
  });
  canvas.style.cursor = 'pointer';

  /* ─── PARTICLES ──────────────────────────────────────── */
  function spawnExhaust(x,y,a) {
    for(let i=0;i<2;i++) {
      exhausts.push({
        x: x-Math.cos(a)*14+(Math.random()-.5)*3,
        y: y-Math.sin(a)*14+(Math.random()-.5)*3,
        r: 2+Math.random()*3, a:0.4+Math.random()*0.15,
        vx: -Math.cos(a)*0.3+(Math.random()-.5)*0.5,
        vy: -Math.sin(a)*0.3+(Math.random()-.5)*0.5,
        life:1,
      });
    }
  }
  function spawnConfetti() {
    const cols=[P.teal, P.amber, P.sage, P.dust, '#C4A882', '#8AA4A8'];
    for(let i=0;i<70;i++) {
      confetti.push({
        x:crp(1)[0], y:crp(1)[1],
        vx:(Math.random()-.5)*6, vy:-4-Math.random()*5,
        r:3+Math.random()*4, col:cols[i%cols.length],
        rot:Math.random()*360, rspd:(Math.random()-.5)*10,
        life:1,
      });
    }
  }

  /* ─── BACKGROUND ─────────────────────────────────────── */
  function drawBg() {
    // Sky — single clean tone
    ctx.fillStyle = '#C8DCE8';
    ctx.fillRect(0, 0, W, H * 0.35);

    // Grass — single calm muted green, no texture
    ctx.fillStyle = '#A8BFA4';
    ctx.fillRect(0, H * 0.32, W, H);

    // Soft horizon blend
    const blend = ctx.createLinearGradient(0, H*0.28, 0, H*0.38);
    blend.addColorStop(0, '#C8DCE8');
    blend.addColorStop(1, '#A8BFA4');
    ctx.fillStyle = blend;
    ctx.fillRect(0, H*0.28, W, H*0.10);

    // Two minimal clouds
    drawCloud(0.18*W, 0.10*H, 38);
    drawCloud(0.62*W, 0.06*H, 48);
  }

  function drawCloud(x, y, s) {
    ctx.save(); ctx.globalAlpha = 0.60;
    [[-s*.35,0,s*.45],[0,0,s*.6],[s*.35,0,s*.45],[0,-s*.18,s*.35]].forEach(([dx,dy,r])=>{
      ctx.beginPath(); ctx.arc(x+dx, y+dy, r, 0, Math.PI*2);
      ctx.fillStyle = '#EEF4F8'; ctx.fill();
    });
    ctx.restore();
  }

  /* ─── ROAD ───────────────────────────────────────────── */
  const RW = 42;
  function buildPath() {
    ctx.beginPath(); ctx.moveTo(...crp(0));
    for(let t=0.004;t<=1;t+=0.004) ctx.lineTo(...crp(t));
  }

  function drawRoad() {
    // Shadow
    ctx.save(); ctx.shadowColor='rgba(0,0,0,0.14)'; ctx.shadowBlur=10; ctx.shadowOffsetY=4;
    buildPath(); ctx.strokeStyle='#1A1714'; ctx.lineWidth=RW+6;
    ctx.lineCap='round'; ctx.lineJoin='round'; ctx.stroke();
    ctx.restore();

    // Road surface — single calm tone
    buildPath(); ctx.strokeStyle='#4A4740'; ctx.lineWidth=RW;
    ctx.lineCap='round'; ctx.lineJoin='round'; ctx.stroke();

    // Single thin edge lines — one muted color, no movement
    buildPath(); ctx.strokeStyle='rgba(200,194,185,0.22)'; ctx.lineWidth=RW-4;
    ctx.lineCap='round'; ctx.lineJoin='round'; ctx.stroke();

    buildPath(); ctx.strokeStyle='#4A4740'; ctx.lineWidth=RW-8;
    ctx.lineCap='round'; ctx.lineJoin='round'; ctx.stroke();
  }

  /* ─── STOP MARKERS ───────────────────────────────────── */
  function drawStops() {
    STOPS.forEach((s,i)=>{
      const [x,y]=crp(s.frac);
      const arrived  = carT >= s.frac-0.01;
      const isCurrent= i===stopIdx-1 && (state===S.AT_STOP||state===S.FINISHED);
      const above    = y > H*0.55;
      const cardW=118, cardH=44;
      const ly = above ? y-28-cardH : y+28;
      const cx = Math.min(Math.max(x, cardW/2+6), W-cardW/2-6);

      // Glow ring when arrived
      if(arrived) {
        ctx.beginPath(); ctx.arc(x,y,20,0,Math.PI*2);
        ctx.fillStyle=s.col+'28'; ctx.fill();
      }

      // Pin dot
      ctx.beginPath(); ctx.arc(x,y,10,0,Math.PI*2);
      ctx.fillStyle=arrived ? s.col : 'rgba(120,112,105,0.40)'; ctx.fill();
      ctx.strokeStyle=P.warmWht; ctx.lineWidth=2.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(x,y,3.5,0,Math.PI*2);
      ctx.fillStyle=P.warmWht; ctx.fill();

      // Connector line (always shown, muted until arrived)
      ctx.beginPath();
      ctx.moveTo(x, y+(above?-10:10));
      ctx.lineTo(x, above?ly+cardH:ly);
      ctx.strokeStyle = arrived ? s.col+'55' : 'rgba(150,140,130,0.25)';
      ctx.lineWidth=1.5; ctx.setLineDash([3,4]); ctx.stroke(); ctx.setLineDash([]);

      // Label card — always visible; scale-in pop for current arrival
      const sc = isCurrent ? Math.min(cardScale,1) : 1;
      ctx.save();
      ctx.translate(cx, ly+cardH/2); ctx.scale(sc,sc); ctx.translate(-cx, -(ly+cardH/2));
      ctx.globalAlpha = arrived ? 1 : 0.45;

      ctx.shadowColor='rgba(0,0,0,0.10)'; ctx.shadowBlur=8; ctx.shadowOffsetY=2;
      ctx.beginPath(); ctx.roundRect(cx-cardW/2,ly,cardW,cardH,8);
      ctx.fillStyle='#FDFCFA'; ctx.fill();
      ctx.shadowColor='transparent';

      // Accent bar
      ctx.beginPath(); ctx.roundRect(cx-cardW/2,ly,4,cardH,[8,0,0,8]);
      ctx.fillStyle = arrived ? s.col : 'rgba(150,140,130,0.4)'; ctx.fill();

      // Text
      ctx.textAlign='center';
      ctx.font='bold 11px -apple-system,sans-serif';
      ctx.fillStyle = arrived ? P.inkDark : P.subGray;
      ctx.fillText(s.label, cx+2, ly+16);
      ctx.font='10px -apple-system,sans-serif';
      ctx.fillStyle=P.subGray;
      ctx.fillText(s.sub, cx+2, ly+31);

      ctx.restore();
    });
  }

  /* ─── CAR ────────────────────────────────────────────── */
  function drawCar() {
    const [x,y]=crp(carT);
    const a=ang(carT);
    const isBraking=state===S.AT_STOP||state===S.FINISHED;
    const isDriving=state===S.DRIVING;

    if(isDriving && Math.random()<0.35) spawnExhaust(x,y,a);

    ctx.save(); ctx.translate(x,y); ctx.rotate(a);

    // Shadow
    ctx.save(); ctx.translate(3,3);
    ctx.beginPath(); ctx.roundRect(-14,-8,28,16,5);
    ctx.fillStyle='rgba(0,0,0,0.18)'; ctx.fill(); ctx.restore();

    // Body — portfolio teal
    ctx.beginPath(); ctx.roundRect(-14,-8,28,16,5);
    ctx.fillStyle=P.teal; ctx.fill();

    // Roof
    ctx.beginPath(); ctx.roundRect(-5,-6,16,12,3);
    ctx.fillStyle='#3A6575'; ctx.fill();

    // Windshield
    ctx.beginPath(); ctx.roundRect(6,-5,8,10,2);
    ctx.fillStyle='rgba(200,228,235,0.88)'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(7,-4); ctx.lineTo(10,-4); ctx.lineTo(8,0); ctx.lineTo(7,0); ctx.closePath();
    ctx.fillStyle='rgba(255,255,255,0.38)'; ctx.fill();

    // Rear window
    ctx.beginPath(); ctx.roundRect(-9,-4,5,8,1.5);
    ctx.fillStyle='rgba(200,228,235,0.65)'; ctx.fill();

    // Headlights
    ctx.fillStyle='rgba(248,240,210,0.92)';
    [[14,-4.5,2.8,1.8],[14,4.5,2.8,1.8]].forEach(([ex,ey,rw,rh])=>{
      ctx.beginPath(); ctx.ellipse(ex,ey,rw,rh,0,0,Math.PI*2); ctx.fill();
    });
    ctx.save(); ctx.globalAlpha=0.22;
    ctx.fillStyle='rgba(248,240,180,1)';
    [[18,-4],[18,4]].forEach(([bx,by])=>{ ctx.beginPath(); ctx.arc(bx,by,5,0,Math.PI*2); ctx.fill(); });
    ctx.restore();

    // Tail lights
    ctx.fillStyle=isBraking?'rgba(200,60,60,0.95)':'rgba(150,40,40,0.65)';
    [[-14,-4.5],[-14,4.5]].forEach(([bx,by])=>{
      ctx.beginPath(); ctx.ellipse(bx,by,2.5,2,0,0,Math.PI*2); ctx.fill();
    });
    if(isBraking) {
      ctx.save(); ctx.globalAlpha=0.28;
      ctx.fillStyle='rgba(220,50,50,1)';
      [[-18,-4.5],[-18,4.5]].forEach(([bx,by])=>{ ctx.beginPath(); ctx.arc(bx,by,5,0,Math.PI*2); ctx.fill(); });
      ctx.restore();
    }

    // Wheels
    const wt=Date.now()/60;
    [[-7,-9.5],[5,-9.5],[-7,9.5],[5,9.5]].forEach(([wx,wy])=>{
      ctx.beginPath(); ctx.roundRect(wx,wy,7,4,1);
      ctx.fillStyle='#1C1A17'; ctx.fill();
      ctx.save(); ctx.translate(wx+3.5,wy+2); ctx.rotate(isDriving?wt:0);
      ctx.beginPath(); ctx.arc(0,0,1.4,0,Math.PI*2); ctx.fillStyle='#6A6A6A'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(0,-1.4); ctx.lineTo(0,1.4);
      ctx.strokeStyle='#4A4A4A'; ctx.lineWidth=0.8; ctx.stroke();
      ctx.restore();
    });

    // Subtle number plate
    ctx.font='bold 6px monospace'; ctx.fillStyle='rgba(240,237,232,0.6)';
    ctx.textAlign='center'; ctx.fillText('PS·01',2,2.5);

    ctx.restore();
  }

  /* ─── EXHAUST ────────────────────────────────────────── */
  function updateExhausts() {
    exhausts=exhausts.filter(p=>p.life>0);
    exhausts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.r+=0.12; p.life-=0.055;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(160,152,144,${p.life*0.28})`; ctx.fill();
    });
  }

  /* ─── CONFETTI ───────────────────────────────────────── */
  function updateConfetti() {
    confetti=confetti.filter(p=>p.life>0);
    confetti.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.14; p.rot+=p.rspd; p.life-=0.013;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180); ctx.globalAlpha=p.life*0.88;
      ctx.fillStyle=p.col; ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*1.6);
      ctx.restore();
    });
  }

  /* ─── HUD ────────────────────────────────────────────── */
  function drawHUD() {
    if(checkFlash>0) {
      const fc=STOPS[stopIdx-1]?.col||P.teal;
      ctx.save(); ctx.globalAlpha=Math.min(checkFlash,1)*0.88;
      ctx.font='bold 24px -apple-system,sans-serif';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillStyle=P.warmWht;
      ctx.shadowColor=fc; ctx.shadowBlur=18;
      ctx.fillText('CHECKPOINT  🏁',W/2,H/2);
      ctx.restore();
      checkFlash-=0.025;
    }

    if(state===S.FINISHED && confetti.length<5) {
      ctx.save();
      ctx.font='bold 22px -apple-system,sans-serif';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillStyle=P.warmWht; ctx.shadowColor=P.sage; ctx.shadowBlur=14;
      ctx.fillText('🏆  Journey complete!',W/2,H*0.5);
      ctx.restore();
    }

    // Progress bar
    const bH=5, bY=H-bH-3, bX=16, bW=W-32;
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.roundRect(bX,bY,bW,bH,3); ctx.fill();
    ctx.fillStyle=P.amber; ctx.beginPath(); ctx.roundRect(bX,bY,bW*carT,bH,3); ctx.fill();
    ctx.restore();

    // Prompt
    let prompt='';
    if(state===S.IDLE) prompt='👆  Click  (or press Space)  to start';
    else if(state===S.AT_STOP && stopIdx<STOPS.length) prompt='👆  Click to continue the journey';
    if(prompt) {
      pulse+=0.06;
      ctx.save(); ctx.globalAlpha=0.5+0.4*Math.sin(pulse);
      ctx.font='600 13px -apple-system,sans-serif'; ctx.textAlign='center';
      ctx.fillStyle=P.warmWht; ctx.shadowColor='rgba(0,0,0,0.4)'; ctx.shadowBlur=5;
      ctx.fillText(prompt,W/2,H-18);
      ctx.restore();
    }
  }

  /* ─── MAIN LOOP ──────────────────────────────────────── */
  let lastTs=0;
  function loop(ts) {
    const dt=Math.min(ts-lastTs,50); lastTs=ts;
    ctx.clearRect(0,0,W,H);
    drawBg(); drawRoad(); updateExhausts();
    drawStops(); drawCar(); updateConfetti(); drawHUD();

    if(state===S.DRIVING) {
      segProg=Math.min(segProg+dt*0.00055,1);
      carT=segStart+ease(segProg)*(segEnd-segStart);
      if(segProg>=1) {
        carT=segEnd; state=S.AT_STOP;
        cardScale=0; checkFlash=1.4;
        if(stopIdx>=STOPS.length){ state=S.FINISHED; spawnConfetti(); }
      }
    }

    if(state===S.AT_STOP||state===S.FINISHED) cardScale=Math.min(cardScale+0.08,1);
    animId=requestAnimationFrame(loop);
  }

  /* ─── VIEWPORT TRIGGER ───────────────────────────────── */
  const section=document.getElementById('experience');
  const obs=new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting && !started){
      started=true; init();
      requestAnimationFrame(ts=>{lastTs=ts; loop(ts);});
      obs.disconnect();
    }
  },{threshold:0.15});
  if(section) obs.observe(section);

  window.addEventListener('resize',()=>{
    if(!started) return;
    cancelAnimationFrame(animId);
    const sv=carT, ss=state, si=stopIdx;
    init(); carT=sv; state=ss; stopIdx=si;
    requestAnimationFrame(ts=>{lastTs=ts; loop(ts);});
  });
})();
