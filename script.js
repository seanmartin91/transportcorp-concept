/* TransportCorp — Mean Trucker Edition */

// ---- STEAM ANIMATION ----
(function initSteam() {
  const hero = document.querySelector('.hero__media');
  if (!hero) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none;';
  canvas.id = 'steamCanvas';
  hero.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W, H, particles;

  // Two exhaust stack positions (as % of canvas) — left and right stacks
  const STACKS = [
    { xPct: 0.485, yPct: 0.18 },
    { xPct: 0.555, yPct: 0.18 },
  ];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    if (!particles) spawnAll();
  }

  function spawnAll() {
    particles = [];
    STACKS.forEach(stack => {
      for (let i = 0; i < 28; i++) {
        particles.push(spawn(stack, true));
      }
    });
  }

  function spawn(stack, scatter) {
    const age = scatter ? Math.random() * 180 : 0;
    return {
      stack,
      x: stack.xPct * W + (Math.random() - 0.5) * 14,
      y: stack.yPct * H + (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.52) * 0.5,   // slight leftward drift
      vy: -(Math.random() * 1.2 + 0.6),    // always upward
      size: Math.random() * 18 + 10,
      maxSize: Math.random() * 60 + 50,
      alpha: Math.random() * 0.18 + 0.12,
      age,
      maxAge: Math.random() * 160 + 120,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p, i) => {
      p.age++;
      p.x += p.vx + Math.sin(p.age * 0.03) * 0.3; // subtle horizontal wobble
      p.y += p.vy;
      p.vy *= 0.998; // slight deceleration
      p.size += 0.55;

      const lifeRatio = p.age / p.maxAge;
      // Fade in then fade out
      const a = lifeRatio < 0.2
        ? (lifeRatio / 0.2) * p.alpha
        : (1 - lifeRatio) * p.alpha;

      // Steam colour — slightly warm grey
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      grad.addColorStop(0,   `rgba(220, 215, 210, ${a})`);
      grad.addColorStop(0.5, `rgba(190, 185, 180, ${a * 0.6})`);
      grad.addColorStop(1,   `rgba(160, 155, 150, 0)`);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Respawn when dead
      if (p.age >= p.maxAge || p.size > p.maxSize) {
        particles[i] = spawn(p.stack, false);
        // Recalculate stack position in case canvas resized
        particles[i].x = p.stack.xPct * W + (Math.random() - 0.5) * 14;
        particles[i].y = p.stack.yPct * H + (Math.random() - 0.5) * 8;
      }
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

// ---- HEADLIGHT FLICKER ----
(function initLightFlicker() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Overlay that simulates lightning/headlight flashes through rain
  const flash = document.createElement('div');
  flash.style.cssText = [
    'position:absolute',
    'inset:0',
    'z-index:4',
    'pointer-events:none',
    'background:radial-gradient(ellipse 60% 50% at 58% 55%, rgba(255,240,200,0.18) 0%, rgba(255,220,150,0.06) 40%, transparent 70%)',
    'opacity:0',
    'mix-blend-mode:screen',
    'transition:opacity 60ms ease-out',
  ].join(';');
  hero.appendChild(flash);

  // Amber running-light pulse — separate element on lower half
  const amber = document.createElement('div');
  amber.style.cssText = [
    'position:absolute',
    'bottom:0','left:0','right:0',
    'height:45%',
    'z-index:4',
    'pointer-events:none',
    'background:radial-gradient(ellipse 80% 60% at 50% 100%, rgba(200,80,10,0.22) 0%, transparent 70%)',
    'opacity:0.6',
    'mix-blend-mode:screen',
  ].join(';');
  hero.appendChild(amber);

  let flickerTimeout;

  function scheduleFlicker() {
    // Random interval 800ms – 3200ms between flickers
    const delay = Math.random() * 2400 + 800;
    flickerTimeout = setTimeout(doFlicker, delay);
  }

  function doFlicker() {
    // Decide: single flash or rapid double/triple
    const count = Math.random() < 0.3 ? Math.floor(Math.random() * 2) + 2 : 1;
    flashSequence(count, 0);
  }

  function flashSequence(total, done) {
    if (done >= total) { scheduleFlicker(); return; }

    const intensity = Math.random() * 0.5 + 0.3; // 0.3 – 0.8
    flash.style.opacity = intensity;

    const onDur  = Math.random() * 60 + 40;   // 40–100ms on
    const offDur = Math.random() * 80 + 60;   // 60–140ms off

    setTimeout(() => {
      flash.style.opacity = 0;
      setTimeout(() => flashSequence(total, done + 1), offDur);
    }, onDur);
  }

  // Amber running lights — slow breathe
  function breatheAmber() {
    const lo = 0.45, hi = 0.75;
    let dir = 1, val = lo;
    setInterval(() => {
      val += dir * 0.008;
      if (val >= hi) dir = -1;
      if (val <= lo) dir = 1;
      amber.style.opacity = val;
      // Also flicker randomly in rain
      if (Math.random() < 0.04) {
        amber.style.opacity = val * (Math.random() * 0.4 + 0.6);
      }
    }, 33);
  }

  scheduleFlicker();
  breatheAmber();
})();

// ---- RAIN ANIMATION ----
(function initRain() {
  const canvas = document.getElementById('rainCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Respect reduced motion
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  const DROPS = 350;
  const ANGLE = 12; // degrees from vertical — slight wind
  const ANGLE_RAD = (ANGLE * Math.PI) / 180;

  let W, H, drops;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    initDrops();
  }

  function initDrops() {
    drops = Array.from({ length: DROPS }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      len:  Math.random() * 18 + 10,   // 10–28px
      speed: Math.random() * 14 + 18,  // 18–32px/frame
      width: Math.random() * 0.6 + 0.4, // 0.4–1px
      alpha: Math.random() * 0.35 + 0.25, // 0.25–0.6
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    drops.forEach(d => {
      // Headlight-tinted rain — slightly warm white
      ctx.strokeStyle = `rgba(210, 220, 230, ${d.alpha})`;
      ctx.lineWidth = d.width;
      ctx.lineCap = 'round';

      ctx.beginPath();
      // Angled drop — x offset by angle over the drop length
      const dx = Math.sin(ANGLE_RAD) * d.len;
      const dy = Math.cos(ANGLE_RAD) * d.len;
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + dx, d.y + dy);
      ctx.stroke();

      // Advance the drop
      d.y += d.speed;
      d.x += d.speed * Math.tan(ANGLE_RAD);

      // Wrap: if off bottom or right, reset to top
      if (d.y > H) {
        d.y = -d.len;
        d.x = Math.random() * W;
      }
      if (d.x > W + 40) {
        d.x = -40;
        d.y = Math.random() * H * 0.4;
      }
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

// ---- NAV ----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ---- BURGER ----
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('mobile-nav');
let open = false;

burger.addEventListener('click', () => {
  open = !open;
  mobileNav.classList.toggle('open', open);
  mobileNav.setAttribute('aria-hidden', String(!open));
  const s = burger.querySelectorAll('span');
  if (open) {
    s[0].style.transform = 'translateY(7px) rotate(45deg)';
    s[1].style.opacity = '0';
    s[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    s[0].style.transform = s[1].style.opacity = s[2].style.transform = '';
    s[1].style.opacity = '';
  }
});
mobileNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    open = false;
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    const s = burger.querySelectorAll('span');
    s[0].style.transform = s[2].style.transform = '';
    s[1].style.opacity = '';
  });
});

// ---- SCROLL REVEAL ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));

// ---- PARALLAX on image divider ----
const imgDivider = document.querySelector('.img-divider__video') || document.querySelector('.img-divider img');
if (imgDivider) {
  const updateParallax = () => {
    const rect = imgDivider.closest('.img-divider').getBoundingClientRect();
    const viewH = window.innerHeight;
    if (rect.bottom < 0 || rect.top > viewH) return;
    const pct = (rect.top / viewH);
    const offset = pct * 30;
    imgDivider.style.transform = `scale(1.08) translateY(${offset}px)`;
  };
  window.addEventListener('scroll', updateParallax, { passive: true });
  updateParallax();
}

// ---- SMOOTH ANCHOR ----
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const t = document.querySelector(link.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ---- TICKER pause on hover ----
const ticker = document.querySelector('.ticker__track');
if (ticker) {
  ticker.addEventListener('mouseenter', () => ticker.style.animationPlayState = 'paused');
  ticker.addEventListener('mouseleave', () => ticker.style.animationPlayState = 'running');
}

// ---- FORM ----
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const success = document.getElementById('form-success');
  btn.textContent = 'Sending…';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Enquiry Sent ✓';
    btn.style.background = '#437a22';
    success.textContent = 'Received. Our dispatch team will be in touch within a few hours.';
    e.target.reset();
  }, 1100);
}

// ---- REDUCED MOTION fallback ----
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.fade-in').forEach(el => {
    el.style.opacity = 1; el.style.transform = 'none'; el.style.animation = 'none';
  });
  if (ticker) ticker.style.animation = 'none';
}

// ---- LAZY LOAD FLATBED VIDEO ----
// Don't load it until it's near the viewport
const flatbedVideo = document.querySelector('.img-divider__video');
if (flatbedVideo) {
  const videoObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      flatbedVideo.load();
      flatbedVideo.play().catch(() => {});
      videoObserver.disconnect();
    }
  }, { rootMargin: '200px' });
  videoObserver.observe(flatbedVideo);
}

// ---- VIDEO FALLBACK ----
// If video fails to load (slow connection), show the poster image gracefully
const video = document.querySelector('.hero__video');
if (video) {
  video.addEventListener('error', () => {
    video.style.display = 'none';
    const poster = document.querySelector('.hero__media');
    poster.style.backgroundImage = `url('assets/hero-truck.png')`;
    poster.style.backgroundSize = 'cover';
    poster.style.backgroundPosition = 'center 40%';
  });
}
