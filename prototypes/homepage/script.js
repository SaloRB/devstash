/* ===== Navbar scroll opacity ===== */
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ===== Scroll fade-in ===== */
const fadeEls = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.12 }
);
fadeEls.forEach(el => observer.observe(el));

/* ===== Chaos icon animation ===== */
(function () {
  const container = document.querySelector('.chaos-inner');
  if (!container) return;

  const icons = Array.from(container.querySelectorAll('.chaos-icon'));
  const W = () => container.offsetWidth;
  const H = () => container.offsetHeight;
  const ICON_SIZE = 64;
  const REPEL_RADIUS = 120;
  const REPEL_FORCE = 2.5;

  // Initial state
  const particles = icons.map(el => {
    const x = Math.random() * (W() - ICON_SIZE);
    const y = Math.random() * (H() - ICON_SIZE);
    const speed = 0.2 + Math.random() * 0.35;
    const angle = Math.random() * Math.PI * 2;
    const rotSpeed = (Math.random() - 0.5) * 0.3;
    return {
      el,
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * 360,
      rotSpeed,
      scale: 1,
      scaleDir: Math.random() < 0.5 ? 1 : -1,
      scaleT: Math.random() * Math.PI * 2,
    };
  });

  let mouseX = -9999, mouseY = -9999;

  window.addEventListener('mousemove', e => {
    const rect = container.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouseX = -9999; mouseY = -9999;
  });

  let last = 0;

  function tick(ts) {
    const dt = Math.min((ts - last) / 16.67, 3); // cap at 3× frame
    last = ts;

    const w = W(), h = H();

    for (const p of particles) {
      // Mouse repel
      const dx = p.x + ICON_SIZE / 2 - mouseX;
      const dy = p.y + ICON_SIZE / 2 - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < REPEL_RADIUS && dist > 0) {
        const force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
        p.vx += (dx / dist) * force * dt;
        p.vy += (dy / dist) * force * dt;
      }

      // Speed cap
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const maxSpeed = 1.0;
      if (speed > maxSpeed) {
        p.vx = (p.vx / speed) * maxSpeed;
        p.vy = (p.vy / speed) * maxSpeed;
      }

      // Move
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Bounce
      if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); }
      if (p.x > w - ICON_SIZE) { p.x = w - ICON_SIZE; p.vx = -Math.abs(p.vx); }
      if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy); }
      if (p.y > h - ICON_SIZE) { p.y = h - ICON_SIZE; p.vy = -Math.abs(p.vy); }

      // Rotation + scale pulse
      p.rot += p.rotSpeed * dt;
      p.scaleT += 0.02 * dt;
      p.scale = 0.92 + 0.1 * Math.sin(p.scaleT);

      p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg) scale(${p.scale})`;
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();

/* ===== Pricing toggle ===== */
(function () {
  const toggle = document.getElementById('billing-toggle');
  const priceEl = document.getElementById('pro-price');
  const periodEl = document.getElementById('pro-period');
  const monthlyLabel = document.getElementById('label-monthly');
  const yearlyLabel = document.getElementById('label-yearly');

  if (!toggle) return;

  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      priceEl.textContent = '72';
      periodEl.textContent = 'per year';
      monthlyLabel.classList.remove('active');
      yearlyLabel.classList.add('active');
    } else {
      priceEl.textContent = '8';
      periodEl.textContent = 'per month';
      monthlyLabel.classList.add('active');
      yearlyLabel.classList.remove('active');
    }
  });
})();
