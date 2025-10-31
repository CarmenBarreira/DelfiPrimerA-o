/* app.js — configuración y lógica principal */

/* ========== CONFIG ========== */
const EVENT_DATE_ISO = "2025-12-06T18:00:00-03:00"; // hora local (GMT-3)
const KID_NAME = "Delfina";

/* assets (unificados a lo que usás en HTML) */
const PORTADA_BG = "assets/portada_delfi.webp";     // fondo portada
const HERO_PHOTO = "assets/portada_delfi.webp";     // foto circular
const PARTY_ICON = "assets/icono-fiesta.svg";
const AUDIO_SRC = "assets/musica.mp3";

/* Google Form (embed) */
const GOOGLE_FORM_EMBED_URL = "https://forms.gle/2PJjdBRAdbj6QGfX7?embedded=true";
/* ========== FIN CONFIG ========== */

/* Scroll suave en flechas (único listener) */
document.querySelectorAll('.scroll-flecha').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

let confettiEngine = null;

document.addEventListener('DOMContentLoaded', () => {
  // fondo lazy
  document.querySelectorAll('.lazy-bg').forEach(el => {
    const bg = el.dataset.bg;
    if (bg) el.style.backgroundImage = `url(${bg})`;
  });

  // portada
  const portadaMedia = document.querySelector('.portada-media');
  if (portadaMedia && PORTADA_BG) portadaMedia.style.backgroundImage = `url('${PORTADA_BG}')`;

  const delfi = document.getElementById('delfiPhoto');
  if (delfi && HERO_PHOTO) delfi.src = HERO_PHOTO;

  const partyIcon = document.getElementById('partyIcon');
  if (partyIcon) partyIcon.src = PARTY_ICON;

  // animación sutil portada
  const portadaInner = document.querySelector('.portada-inner');
  if (portadaInner) setTimeout(() => portadaInner.classList.add('visible'), 280);

  // link mapa (si querés cambiar el href, hacelo acá)
  const comoLlegar = document.getElementById('comoLlegar');
  if (comoLlegar) comoLlegar.href = "https://maps.app.goo.gl/8hMPPE5CuvhBQKms6";

  // Galería (se abre con Fancybox)
  const galleryImgs = [
    { src: 'assets/1.jpeg', caption: 'En la panza de mi mami' },
    { src: 'assets/2.png',  caption: 'Princesa' },
    { src: 'assets/3.jpeg', caption: 'Explorando el mundo' },
    { src: 'assets/4.jpeg', caption: 'Abrazos de la familia' },
    { src: 'assets/5.jpeg', caption: 'Mi momento favorito del día' },
    { src: 'assets/6.jpeg', caption: 'Pequeños pasos' },
    { src: 'assets/7.jpeg', caption: 'Besos y juegos' },
    { src: 'assets/8.jpeg', caption: 'Nuestra princesita' }
  ];
  loadGallery(galleryImgs);

  // countdown (fix TDZ)
  startCountdown(EVENT_DATE_ISO);

  // Audio
  setupAudioToggle();

  // RSVP + helpers
  initRsvp();

  // confetti engine
  confettiEngine = createConfettiEngine('confettiCanvas');

  // mostrar mensajito cuando se cierra el modal (y tirar confeti)
  try {
    $('#formModal').on('hidden.bs.modal', function () {
      if (confettiEngine) confettiEngine.fire(70);
      const after = document.getElementById('afterRsvpMsg');
      if (after) { after.style.display = 'block'; setTimeout(() => after.style.display = 'none', 4200); }
    });
  } catch (e) { /* bootstrap ausente */ }

  // Accesibilidad: ArrowDown navega a la siguiente sección
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      const sections = Array.from(document.querySelectorAll('.seccion'));
      const next = sections.find(s => s.offsetTop > window.scrollY + 10);
      if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ===== load gallery ===== */
function loadGallery(items) {
  const carouselInner = document.getElementById('carouselInner');
  const galleryThumbs = document.getElementById('galleryThumbs');
  if (!carouselInner || !galleryThumbs) return;

  carouselInner.innerHTML = '';
  galleryThumbs.innerHTML = '';

  items.forEach((it, i) => {
    const slide = document.createElement('div');
    slide.className = `carousel-item${i === 0 ? ' active' : ''}`;
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

  try { $('#galleryCarousel').carousel(); } catch (e) {}
}

/* ===== Countdown (fix TDZ) ===== */
function startCountdown(isoDate) {
  const target = new Date(isoDate).getTime();
  if (isNaN(target)) return;
  const liveRegion = document.getElementById('countdown');
  if (liveRegion) liveRegion.setAttribute('aria-live', 'polite');

  let iv; // declarado antes para evitar TDZ
  const tick = () => {
    const now = Date.now();
    const diff = Math.max(0, target - now);
    const s = Math.floor(diff / 1000);
    const days = Math.floor(s / (3600 * 24));
    const hours = Math.floor((s % (3600 * 24)) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;

    const d = document.getElementById('cd-days');  if (d) d.textContent = days;
    const h = document.getElementById('cd-hours'); if (h) h.textContent = String(hours).padStart(2, '0');
    const m = document.getElementById('cd-mins');  if (m) m.textContent = String(minutes).padStart(2, '0');
    const sec = document.getElementById('cd-secs'); if (sec) sec.textContent = String(seconds).padStart(2, '0');

    if (diff <= 0) {
      clearInterval(iv);
      const cd = document.getElementById('countdown');
      if (cd) cd.innerHTML = `<p role="status">¡Feliz Cumpleaños, ${KID_NAME}!</p>`;
    }
  };
  tick();
  iv = setInterval(tick, 1000);
}

/* ===== Audio control ===== */
function setupAudioToggle() {
  const audio = document.getElementById('bgAudio');
  const toggle = document.getElementById('audioToggle');
  const volumeControl = document.getElementById('audioVolume'); // opcional

  if (!toggle || !audio) return;
  if (AUDIO_SRC) audio.src = AUDIO_SRC;

  // intento de autoplay (puede ser bloqueado)
  audio.play().then(() => { syncAudioIcons(true); }).catch(() => { syncAudioIcons(false); });

  toggle.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(err => console.warn('Autoplay bloqueado', err));
    } else {
      audio.pause();
    }
  });

  if (volumeControl) {
    audio.volume = volumeControl.value ?? 1;
    volumeControl.addEventListener('input', () => { audio.volume = volumeControl.value; });
  }

  audio.addEventListener('play',  () => syncAudioIcons(true));
  audio.addEventListener('pause', () => syncAudioIcons(false));
  audio.addEventListener('ended', () => syncAudioIcons(false));
}
function syncAudioIcons(isPlaying) {
  const playI = document.getElementById('audioPlay');
  const pauseI = document.getElementById('audioPause');
  const toggle = document.getElementById('audioToggle');
  if (!playI || !pauseI || !toggle) return;
  if (isPlaying) {
    playI.classList.add('hidden');
    pauseI.classList.remove('hidden');
    toggle.setAttribute('aria-pressed', 'true');
  } else {
    playI.classList.remove('hidden');
    pauseI.classList.add('hidden');
    toggle.setAttribute('aria-pressed', 'false');
  }
}

/* ===== RSVP helpers ===== */
function initRsvp() {
  const openMain = document.getElementById('openFormBtnMain');
  if (openMain) openMain.addEventListener('click', () => openFormModal(GOOGLE_FORM_EMBED_URL));

  // share + copy (si más adelante agregás botones con estos IDs)
  const shareWhats = document.getElementById('shareWhats');
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  if (shareWhats) {
    const text = encodeURIComponent(`Invitación al cumple de ${KID_NAME}! 🎉 — ${location.href}`);
    shareWhats.href = `https://wa.me/?text=${text}`;
  }
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        const notice = document.getElementById('copyNotice');
        if (notice) { notice.style.display = 'block'; setTimeout(() => notice.style.display = 'none', 2600); }
      } catch (e) { alert('No se pudo copiar el enlace: ' + e); }
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

/* ===== Modal de Form ===== */
function openFormModal(url) {
  const iframe = document.getElementById('formIframe');
  if (iframe) iframe.src = url;
  try { $('#formModal').modal('show'); }
  catch (e) { window.open(url, '_blank'); }
}

/* ===== Confetti engine ===== */
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
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06; // gravedad
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

  return {
    fire(count = 80) {
      for (let i = 0; i < count; i++) particles.push(newParticle());
      canvas.style.display = 'block';
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    }
  };
}
