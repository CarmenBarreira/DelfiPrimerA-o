/* app.js — configuración y lógica principal (limpio y combinado) */

/* ========== CONFIG (edita solo estas) ========== */
const EVENT_DATE_ISO = "2025-12-06T18:00:00-03:00"; // hora coherente con banner
const KID_NAME = "Delfina";

/* assets */
const PORTADA_IMAGE = "assets/portada_delfi.png"; // imagen de portada circular y fondo
const HERO_PHOTO = "assets/delfi.png";
const PARTY_ICON = "assets/icono-fiesta.svg";
const AUDIO_SRC = "assets/musica.mp3";

/* Google Form (embed) */
const GOOGLE_FORM_EMBED_URL = "https://forms.gle/2PJjdBRAdbj6QGfX7?embedded=true";
const OWNER_EMAIL = "csilbarreira@gmail.com";

/* Lugar / mapa */
const EVENT_LOCATION_NAME = "Salón Aventurina";
const EVENT_ADDRESS = "Av. Millán 3724";
const EVENT_MAP_URL = "https://maps.app.goo.gl/8hMPPE5CuvhBQKms6";
const EVENT_TIMEZONE = "America/Montevideo";
/* ========== FIN CONFIG ========== */

let confettiEngine = null;

document.querySelectorAll('.scroll-flecha').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) window.scrollTo({ top: target.offsetTop - 12, behavior: 'smooth' });
  });
});

document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('.lazy-bg').forEach(el => {
    const bg = el.dataset.bg;
    if (bg) el.style.backgroundImage = `url(${bg})`;
  });


  const portadaMedia = document.querySelector('.portada-media');
  if (portadaMedia) portadaMedia.style.backgroundImage = `url('${PORTADA_IMAGE}')`;
  const delfi = document.getElementById('delfiPhoto'); if (delfi) delfi.src = PORTADA_IMAGE;
  const partyIcon = document.getElementById('partyIcon'); if (partyIcon) partyIcon.src = PARTY_ICON;
  const kidNameEl = document.getElementById('kidName'); if (kidNameEl) kidNameEl.textContent = KID_NAME;

  // animate portada title
  const portadaInner = document.querySelector('.portada-inner');
  if (portadaInner) setTimeout(() => portadaInner.classList.add('visible'), 280);

  // banner date — usar locale es-UY + timezone
  const bannerDate = document.getElementById('bannerDate');
  if (bannerDate) {
    const evt = new Date(EVENT_DATE_ISO);
    const dayStr = evt.toLocaleDateString('es-UY', { day: '2-digit', month: 'long', timeZone: EVENT_TIMEZONE });
    const timeStr = evt.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit', timeZone: EVENT_TIMEZONE });
    bannerDate.querySelector('.date-left').textContent = dayStr;
    bannerDate.querySelector('.date-right').innerHTML = `<span class="time">${timeStr}</span> — <span class="place">${EVENT_LOCATION_NAME}</span>`;
  }

  // map link
  const comoLlegar = document.getElementById('comoLlegar'); if (comoLlegar) comoLlegar.href = EVENT_MAP_URL;

  // gallery images + captions (array de objetos)
  const galleryImgs = [
    { src: 'assets/1.jpg', caption: 'Primeros sonrisas' },
    { src: 'assets/2.png', caption: 'Cakesmash y risas' },
    { src: 'assets/3.png', caption: 'Mimos infinitos' },
    { src: 'assets/4.png', caption: 'Abrazos de la familia' },
    { src: 'assets/5.jpeg', caption: 'Descubrimientos' },
    { src: 'assets/6.jpeg', caption: 'Pequeños pasos' },
    { src: 'assets/7.jpeg', caption: 'Besos y juegos' },
    { src: 'assets/8.jpeg', caption: 'Nuestra princesita' }
  ];
  loadGallery(galleryImgs);

  // countdown
  startCountdown(EVENT_DATE_ISO);

  // audio toggle + autoplay attempt
  setupAudioToggle();

  // smooth scroll chevrons
  document.querySelectorAll('.scroll-flecha').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // init RSVP + helpers
  initRsvp();

  // confetti engine
  confettiEngine = createConfettiEngine('confettiCanvas');

  // show small message when the form modal closes (UX)
  try {
    $('#formModal').on('hidden.bs.modal', function () {
      if (confettiEngine) confettiEngine.fire(70);
      const after = document.getElementById('afterRsvpMsg');
      if (after) { after.style.display = 'block'; setTimeout(() => after.style.display = 'none', 4200); }
    });
  } catch (e) { /* ignore if bootstrap not present */ }

  // accessibility: ArrowDown navigates to next section
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      const sections = Array.from(document.querySelectorAll('.seccion'));
      const top = window.scrollY;
      const currentIndex = sections.findIndex(s => s.offsetTop > top + 10);
      const next = sections[Math.max(0, currentIndex)];
      if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ===== load gallery (carousel + thumbs) ===== */
function loadGallery(items) {
  const carouselInner = document.getElementById('carouselInner');
  const galleryThumbs = document.getElementById('galleryThumbs');
  if (!carouselInner || !galleryThumbs) return;

  carouselInner.innerHTML = '';
  galleryThumbs.innerHTML = '';

  items.forEach((it, i) => {
    const active = i === 0 ? ' active' : '';
    const slide = document.createElement('div');
    slide.className = `carousel-item${active}`;
    slide.innerHTML = `
      <a data-fancybox="gallery" href="${it.src}">
        <img src="${it.src}" class="d-block w-100" alt="Foto ${i + 1}">
      </a>
      <div class="carousel-caption d-none d-md-block"><small>${it.caption}</small></div>
    `;
    carouselInner.appendChild(slide);

    const col = document.createElement('div');
    col.className = 'col-auto thumb mb-2';
    col.innerHTML = `<a data-fancybox="gallery" href="${it.src}"><img src="${it.src}" alt="Mini ${i + 1}" /></a>`;
    galleryThumbs.appendChild(col);
  });

  try { $('#galleryCarousel').carousel(); } catch (e) { }
}

/* ===== Countdown ===== */
function startCountdown(isoDate) {
  const target = new Date(isoDate).getTime();
  if (isNaN(target)) return;
  const liveRegion = document.getElementById('countdown');
  if (liveRegion) liveRegion.setAttribute('aria-live', 'polite');

  const tick = () => {
    const now = Date.now();
    const diff = Math.max(0, target - now);
    const s = Math.floor(diff / 1000);
    const days = Math.floor(s / (3600 * 24));
    const hours = Math.floor((s % (3600 * 24)) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    const d = document.getElementById('cd-days'); if (d) d.textContent = days;
    const h = document.getElementById('cd-hours'); if (h) h.textContent = String(hours).padStart(2, '0');
    const m = document.getElementById('cd-mins'); if (m) m.textContent = String(minutes).padStart(2, '0');
    const sec = document.getElementById('cd-secs'); if (sec) sec.textContent = String(seconds).padStart(2, '0');

    if (diff <= 0) {
      clearInterval(iv);
      const cd = document.getElementById('countdown');
      if (cd) cd.innerHTML = `<p role="status">¡Feliz Cumpleaños, ${KID_NAME}!</p>`;
    }
  };
  tick();
  const iv = setInterval(tick, 1000);
}

/* ===== Audio control (MP3 autoplay attempt, toggle) ===== */
function setupAudioToggle() {
  const audio = document.getElementById('bgAudio');
  const toggle = document.getElementById('audioToggle');
  const volumeControl = document.getElementById('audioVolume');

  if (audio && AUDIO_SRC && AUDIO_SRC.length > 3) audio.src = AUDIO_SRC;
  if (!toggle || !audio) return console.warn('Audio elements no encontrados');

  // try autoplay once (user may block it)
  audio.play().then(() => { syncAudioIcons(true); }).catch(() => { syncAudioIcons(false); });

  toggle.style.zIndex = 14000;
  toggle.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(err => console.warn('Autoplay blocked', err));
      syncAudioIcons(true);
    } else {
      audio.pause();
      syncAudioIcons(false);
    }
  });

  // Control de volumen
  volumeControl.addEventListener('input', () => { audio.volume = volumeControl.value; });

  audio.addEventListener('play', () => syncAudioIcons(true));
  audio.addEventListener('pause', () => syncAudioIcons(false));
  audio.addEventListener('ended', () => syncAudioIcons(false));
}
function syncAudioIcons(isPlaying) {
  const playI = document.getElementById('audioPlay');
  const pauseI = document.getElementById('audioPause');
  const toggle = document.getElementById('audioToggle');
  if (!playI || !pauseI) return;
  if (isPlaying) { playI.classList.add('hidden'); pauseI.classList.remove('hidden'); toggle.setAttribute('aria-pressed', 'true'); }
  else { playI.classList.remove('hidden'); pauseI.classList.add('hidden'); toggle.setAttribute('aria-pressed', 'false'); }
}

/* ===== RSVP helpers ===== */
function initRsvp() {
  const openMain = document.getElementById('openFormBtnMain');
  if (openMain) openMain.addEventListener('click', () => openFormModal(GOOGLE_FORM_EMBED_URL));

  document.querySelectorAll('.chip').forEach(ch => { ch.addEventListener('click', () => { document.querySelectorAll('.chip').forEach(c => c.classList.remove('active')); ch.classList.add('active'); }); });

  const miniSubmit = document.getElementById('miniSubmit');
  const miniClear = document.getElementById('miniClear');
  if (miniSubmit) {
    miniSubmit.addEventListener('click', () => {
      const name = document.getElementById('miniName').value || '---';
      const adults = document.getElementById('miniAdults').value || '0';
      const kids = document.getElementById('miniKids').value || '0';
      const chip = document.querySelector('.chip.active');
      const restr = chip ? chip.dataset.val : 'Ninguna';
      const body = encodeURIComponent(`Hola,%0A%0AConfirmo mi asistencia al cumple de ${KID_NAME}.%0A%0ANombre: ${name}%0AAdultos: ${adults}%0APeques: ${kids}%0ARestricciones: ${restr}%0A%0AMuchas gracias!`);
      window.location.href = `mailto:${OWNER_EMAIL}?subject=RSVP%20-%20${encodeURIComponent(KID_NAME)}&body=${body}`;
      document.getElementById('miniFeedback').style.display = 'block';
      if (confettiEngine) confettiEngine.fire(60);
    });
  }
  if (miniClear) {
    miniClear.addEventListener('click', () => {
      document.getElementById('miniName').value = '';
      document.getElementById('miniAdults').value = '';
      document.getElementById('miniKids').value = '';
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      document.getElementById('miniFeedback').style.display = 'none';
    });
  }

  // share + copy
  const shareWhats = document.getElementById('shareWhats');
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  if (shareWhats) {
    const text = encodeURIComponent(`Invitación al cumple de ${KID_NAME}! 🎉 — ${location.href}`);
    shareWhats.href = `https://wa.me/?text=${text}`;
  }
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(location.href); const notice = document.getElementById('copyNotice'); if (notice) { notice.style.display = 'block'; setTimeout(() => notice.style.display = 'none', 2600); } }
      catch (e) { alert('No se pudo copiar el enlace: ' + e); }
    });
  }

  const confettiBtn = document.getElementById('confettiBtn');
  if (confettiBtn) {
    confettiBtn.addEventListener('click', () => {
      if (confettiEngine) confettiEngine.fire(120);
      const msg = document.getElementById('afterRsvpMsg');
      if (msg) { msg.style.display = 'block'; setTimeout(() => msg.style.display = 'none', 3800); }
    });
  }
}

/* ===== modal form or mailto fallback ===== */
function openFormModal(url) {
  const iframe = document.getElementById('formIframe');
  if (iframe) iframe.src = url;
  try { $('#formModal').modal('show'); }
  catch (e) { window.open(url, '_blank'); }
}

/* ===== Confetti engine (simple, no dependencias) ===== */
function createConfettiEngine(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, particles = [];
  const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
  window.addEventListener('resize', resize); resize();

  function newParticle() {
    return {
      x: Math.random() * w,
      y: -10 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 6,
      vy: 2 + Math.random() * 4,
      size: 6 + Math.random() * 8,
      rot: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 10,
      color: ['#ffd6e8', '#ffd9f0', '#f6d8ff', '#fff0f6', '#ffd6ea'][Math.floor(Math.random() * 5)]
    };
  }

  let raf = 0;
  function frame() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06; // gravity
      p.rot += p.vrot;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    particles = particles.filter(p => p.y < h + 60);
    if (particles.length > 0) raf = requestAnimationFrame(frame);
    else { cancelAnimationFrame(raf); canvas.style.display = 'none'; }
  }

  return { fire(count = 80) { for (let i = 0; i < count; i++) particles.push(newParticle()); canvas.style.display = 'block'; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); } };
}

