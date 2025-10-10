/* app.js — configuración y lógica principal (actualizado) */

/* ========== CONFIG (edita solo estas) ========== */
const EVENT_DATE_ISO = "2025-12-06T21:00:00-03:00";
const KID_NAME = "Delfina";

const YOUTUBE_VIDEO_ID = "-n7G5Dqb3UM";


/* assets (pon todo en assets/) */
const PORTADA_IMAGE = "assets/portada.jpg";         // fondo portada
const HERO_PHOTO = "assets/delfi.png";             // foto de Delfi
const PARTY_ICON = "assets/icono-fiesta.svg";      // iconito fiesta
const AUDIO_SRC = "assets/musica.mp3";             // música
const PLAY_ICON = "assets/icono-musica_play.svg";
const PAUSE_ICON = "assets/icono-musica_pausa.svg";

/* Google Form (opcional) */
/* Usamos la URL que pegaste como embedded. Si el shortlink no embebe, el modal abrirá en nueva pestaña */
const GOOGLE_FORM_EMBED_URL = "https://forms.gle/2PJjdBRAdbj6QGfX7?embedded=true";
const OWNER_EMAIL = "csilbarreira@gmail.com";

/* Lugar / mapa */
const EVENT_LOCATION_NAME = "Salón Aventurina";
const EVENT_ADDRESS = "Av. Millán 3724";
const EVENT_MAP_URL = "https://maps.app.goo.gl/8hMPPE5CuvhBQKms6";
/* ========== FIN CONFIG ========== */

document.addEventListener('DOMContentLoaded', () => {
  console.info('app.js cargado — inicializando UI');

  // portada background & images
  const portadaMedia = document.querySelector('.portada-media');
  if (portadaMedia) portadaMedia.style.backgroundImage = `url('${PORTADA_IMAGE}')`;
  const delfi = document.getElementById('delfiPhoto'); if (delfi) delfi.src = HERO_PHOTO;
  const partyIcon = document.getElementById('partyIcon'); if (partyIcon) partyIcon.src = PARTY_ICON;

  // kid name
  const kidNameEl = document.getElementById('kidName'); if (kidNameEl) kidNameEl.textContent = KID_NAME;

  // banner date
  const bannerDate = document.getElementById('bannerDate');
  if (bannerDate) {
    bannerDate.querySelector('.date-left').textContent = new Date(EVENT_DATE_ISO).toLocaleString('es-ES', { day: '2-digit', month: 'long' });
    bannerDate.querySelector('.date-right').textContent = new Date(EVENT_DATE_ISO).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ` — ${EVENT_LOCATION_NAME}`;
  }

  // map link
  const mapLink = document.getElementById('mapLink'); if (mapLink) mapLink.href = EVENT_MAP_URL;
  const comoLlegar = document.getElementById('comoLlegar'); if (comoLlegar) comoLlegar.href = EVENT_MAP_URL;
  const showMapBtn = document.getElementById('showMapBtn'); if (showMapBtn) showMapBtn.addEventListener('click', () => window.open(EVENT_MAP_URL, '_blank'));

  // Confirm links (embed form or mailto)
  const confirmLink = document.getElementById('openFormBtn');
  const confirmLink2 = document.getElementById('openFormBtn2');
  const mailtoLink = document.getElementById('mailtoLink');
  if (GOOGLE_FORM_EMBED_URL && GOOGLE_FORM_EMBED_URL.length > 5) {
    if (confirmLink) confirmLink.addEventListener('click', () => openFormModal(GOOGLE_FORM_EMBED_URL));
    if (confirmLink2) confirmLink2.addEventListener('click', () => openFormModal(GOOGLE_FORM_EMBED_URL));
    if (mailtoLink) mailtoLink.href = `mailto:${OWNER_EMAIL}?subject=RSVP%20-%20${encodeURIComponent(KID_NAME)}`;
    console.info('Confirm buttons configured to open Google Form modal');
  } else {
    if (confirmLink) confirmLink.addEventListener('click', () => fallbackMail());
    if (confirmLink2) confirmLink2.addEventListener('click', () => fallbackMail());
    if (mailtoLink) mailtoLink.href = `mailto:${OWNER_EMAIL}?subject=RSVP%20-%20${encodeURIComponent(KID_NAME)}`;
    console.info('Confirm buttons configured to use mailto fallback');
  }

  // gallery (assets images)
  const galleryImgs = [
    'assets/1.jpg', 'assets/2.jpg', 'assets/3.jpg', 'assets/4.jpg',
    'assets/5.jpg', 'assets/6.jpg', 'assets/7.jpg', 'assets/8.jpg'
  ];
  const galleryWrap = document.getElementById('galleryWrap');
  if (galleryWrap) {
    galleryWrap.innerHTML = '';
    galleryImgs.forEach(src => {
      const col = document.createElement('div');
      col.className = 'col-6 col-md-3 thumb';
      col.innerHTML = `<a data-fancybox="gallery" href="${src}"><img src="${src}" alt="" class="img-fluid rounded"/></a>`;
      galleryWrap.appendChild(col);
    });
    console.info('Galería cargada con', galleryImgs.length, 'imágenes');
  }

  // countdown
  startCountdown(EVENT_DATE_ISO);

  // audio toggle
  setupAudioToggle();

  // smooth scroll fallback for older browsers: intercept SVG links for precise offset
  document.querySelectorAll('.scroll-flecha').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // keyboard navigation (ArrowDown to go next)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      const sections = Array.from(document.querySelectorAll('.seccion'));
      const top = window.scrollY;
      const currentIndex = sections.findIndex(s => s.offsetTop > top + 10);
      const next = sections[Math.max(0, currentIndex)];
      if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  console.info('Inicialización completa');
});

/* ===== Countdown ===== */
function startCountdown(isoDate) {
  const target = new Date(isoDate).getTime();
  if (isNaN(target)) { console.warn('startCountdown: fecha inválida:', isoDate); return; }
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
    if (diff <= 0) clearInterval(iv);
  };
  tick();
  const iv = setInterval(tick, 1000);
}

/* ===== Audio control ===== */
function setupAudioToggle() {
  const audio = document.getElementById('bgAudio');
  const toggle = document.getElementById('audioToggle');
  const playI = document.getElementById('audioPlay');
  const pauseI = document.getElementById('audioPause');
  if (audio && AUDIO_SRC && AUDIO_SRC.length > 3) audio.src = AUDIO_SRC;

  if (!toggle || !audio) { console.warn('Audio toggle or audio element no encontrados'); return; }
  toggle.style.zIndex = 14000;
  toggle.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => { /* autoplay blocked */ });
      syncAudioIcons(true);
    } else {
      audio.pause();
      syncAudioIcons(false);
    }
  });
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

/* ===== Form modal or mailto fallback ===== */
function openFormModal(url) {
  const iframe = document.getElementById('formIframe');
  if (iframe) iframe.src = url;
  // Try to open modal; if modal unavailable, open in new tab
  try { $('#formModal').modal('show'); }
  catch (e) { window.open(url, '_blank'); }
}
function fallbackMail() {
  const body = encodeURIComponent(`Hola,%0A%0AMi nombre es:%0AConfirmo mi asistencia: Sí/No%0ACantidad adultos:%0ACantidad peques:%0AEdades:%0ARestricciones alimentarias:%0AMensaje:%0A`);
  window.location.href = `mailto:${OWNER_EMAIL}?subject=RSVP%20-%20${encodeURIComponent(KID_NAME)}&body=${body}`;
}


let ytPlayer = null;
let usingYouTube = false;

function setupAudioToggle(){
  const audio = document.getElementById('bgAudio');
  const toggle = document.getElementById('audioToggle');

  usingYouTube = Boolean(typeof YOUTUBE_VIDEO_ID !== 'undefined' && YOUTUBE_VIDEO_ID && YOUTUBE_VIDEO_ID.length > 3);

  // Asegurar fallback local
  if(audio && AUDIO_SRC && AUDIO_SRC.length > 3) audio.src = AUDIO_SRC;

  // Helper para cargar la API de YouTube si hace falta
  const ensureYTApiLoaded = () => {
    if (!usingYouTube) return Promise.resolve();
    return new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) return resolve();
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      tag.onload = () => {
        const waitFor = setInterval(()=>{
          if(window.YT && window.YT.Player){ clearInterval(waitFor); resolve(); }
        }, 100);
        setTimeout(()=>{ clearInterval(waitFor); resolve(); }, 3000);
      };
      tag.onerror = () => reject(new Error('YT API load error'));
      document.head.appendChild(tag);
    });
  };

  const createYTPlayer = () => {
    if(!usingYouTube) return;
    if(ytPlayer) return;
    // wrapper oculto para el iframe
    const wrapper = document.createElement('div');
    wrapper.id = 'yt-player-wrapper';
    wrapper.style.cssText = 'position:fixed;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;pointer-events:none;';
    document.body.appendChild(wrapper);

    ytPlayer = new YT.Player(wrapper.id, {
      height: '1',
      width: '1',
      videoId: YOUTUBE_VIDEO_ID,
      playerVars: {
        autoplay: 0,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1
      },
      events: {
        onReady: (e)=>{ console.info('YT player ready'); },
        onStateChange: (e)=> {
          if(e.data === YT.PlayerState.PLAYING) syncAudioIcons(true);
          if(e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) syncAudioIcons(false);
        },
        onError: (e) => {
          console.warn('YT player error', e);
          // NO abrir pestañas. Usar audio local como fallback.
          try { if(ytPlayer && ytPlayer.stopVideo) ytPlayer.stopVideo(); } catch(e){}
          if(audio){
            audio.play().catch(err => console.warn('No se pudo iniciar audio local tras fallo YT:', err));
            syncAudioIcons(true);
          }
        }
      }
    });
  };

  if(!toggle) return console.warn('Audio toggle no encontrado');

  toggle.addEventListener('click', async ()=>{
    // Si hay YT configurado, intentamos reproducir inline (si falla, caemos al mp3)
    if(usingYouTube){
      try {
        await ensureYTApiLoaded();
        if(!ytPlayer) createYTPlayer();

        const safeState = () => (ytPlayer && ytPlayer.getPlayerState) ? ytPlayer.getPlayerState() : -2;
        const state = safeState();

        if(state === YT.PlayerState.PLAYING){
          ytPlayer.pauseVideo();
          syncAudioIcons(false);
        } else {
          try {
            ytPlayer.playVideo();
            syncAudioIcons(true);
          } catch(err){
            // fallback silencioso a mp3 local (NO abrir pestañas)
            console.warn('Error reproduciendo YT in-page, usando mp3 local como fallback', err);
            if(audio){
              audio.play().catch(e=>console.warn('No se pudo reproducir audio local tras fallo YT:', e));
              syncAudioIcons(true);
            }
          }
        }
        return;
      } catch(err){
        console.warn('YT API no disponible o fallo cargando, fallback a audio local', err);
        // seguimos al fallback local abajo
      }
    }

    // Fallback: togglear el MP3 local
    if(audio){
      if(audio.paused){
        audio.play().catch((err)=>{ console.warn('No se pudo iniciar audio local:', err); });
        syncAudioIcons(true);
      } else {
        audio.pause();
        syncAudioIcons(false);
      }
    }
  });

  // Si se reproduce el MP3 local desde otro control, pausamos YT si está sonando
  if (audio) {
    audio.addEventListener('play', ()=> { 
      try { if(ytPlayer && ytPlayer.getPlayerState && ytPlayer.getPlayerState()===YT.PlayerState.PLAYING) ytPlayer.pauseVideo(); } catch(e){}
      syncAudioIcons(true); 
    });
    audio.addEventListener('pause', ()=> syncAudioIcons(false));
    audio.addEventListener('ended', ()=> syncAudioIcons(false));
  }
}
