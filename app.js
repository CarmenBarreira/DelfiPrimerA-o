/* scripts.js — configuración y lógica principal */

/* ========== CONFIG (edita solo estas) ========== */
const EVENT_DATE_ISO = "2025-12-06T21:00:00-03:00";
const KID_NAME = "Delfina";

/* assets (sube tus imágenes a assets/) */
const PORTADA_IMAGE = "assets/portada.jpg";         // fondo portada
const HERO_PHOTO = "img/delfi.png";             // foto de Delfi
const PARTY_ICON = "img/icono-fiesta.svg";      // iconito fiesta
const AUDIO_SRC = "img/musica.mp3";             // música
const PLAY_ICON = "img/icono-musica_play.svg";
const PAUSE_ICON = "img/icono-musica_pausa.svg";

/* Google Form (opcional) */
const GOOGLE_FORM_EMBED_URL = ""; // p.ej. ".../viewform?embedded=true"
const OWNER_EMAIL = "csilbarreira@gmail.com";

/* Lugar / mapa */
const EVENT_LOCATION_NAME = "Salón Campo Norte";
const EVENT_ADDRESS = "Ruta E53, Córdoba";
const EVENT_MAP_URL = "https://goo.gl/maps/UxEZgL3xGRCqKSy37";
/* ========== FIN CONFIG ========== */

document.addEventListener('DOMContentLoaded', ()=> {
  // portada background & images
  const portadaMedia = document.querySelector('.portada-media');
  if(portadaMedia) portadaMedia.style.backgroundImage = `url('${PORTADA_IMAGE}')`;
  const delfi = document.getElementById('delfiPhoto'); if(delfi) delfi.src = HERO_PHOTO;
  const partyIcon = document.getElementById('partyIcon'); if(partyIcon) partyIcon.src = PARTY_ICON;

  // banner date
  const bannerDate = document.getElementById('bannerDate');
  if(bannerDate){
    bannerDate.querySelector('.date-left').textContent = new Date(EVENT_DATE_ISO).toLocaleString('es-ES',{ day:'2-digit', month:'long' });
    bannerDate.querySelector('.date-right').textContent = new Date(EVENT_DATE_ISO).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}) + ` — ${EVENT_LOCATION_NAME}`;
  }

  // map link
  const mapLink = document.getElementById('mapLink'); if(mapLink) mapLink.href = EVENT_MAP_URL;
  const comoLlegar = document.getElementById('comoLlegar'); if(comoLlegar) comoLlegar.href = EVENT_MAP_URL;
  const showMapBtn = document.getElementById('showMapBtn'); if(showMapBtn) showMapBtn.addEventListener('click', ()=> window.open(EVENT_MAP_URL,'_blank'));

  // Confirm links
  const confirmLink = document.getElementById('openFormBtn');
  const confirmLink2 = document.getElementById('openFormBtn2');
  const mailtoLink = document.getElementById('mailtoLink');
  if(GOOGLE_FORM_EMBED_URL && GOOGLE_FORM_EMBED_URL.length>5){
    if(confirmLink) confirmLink.addEventListener('click', ()=> openFormModal(GOOGLE_FORM_EMBED_URL));
    if(confirmLink2) confirmLink2.addEventListener('click', ()=> openFormModal(GOOGLE_FORM_EMBED_URL));
    if(mailtoLink) mailtoLink.href = `mailto:${OWNER_EMAIL}?subject=RSVP%20-%20${encodeURIComponent(KID_NAME)}`;
  } else {
    if(confirmLink) confirmLink.addEventListener('click', ()=> fallbackMail());
    if(confirmLink2) confirmLink2.addEventListener('click', ()=> fallbackMail());
    if(mailtoLink) mailtoLink.href = `mailto:${OWNER_EMAIL}?subject=RSVP%20-%20${encodeURIComponent(KID_NAME)}`;
  }

  // gallery (sample images; reemplazá por tus rutas)
  const galleryImgs = ['assets/1.jpg','assets/2.jpg','assets/3.jpg','assets/4.jpg','assets/5.jpg','assets/6.jpg','assets/7.jpg','assets/8.jpg'];
  const galleryWrap = document.getElementById('galleryWrap');
  if(galleryWrap){
    galleryWrap.innerHTML = '';
    galleryImgs.forEach(src => {
      const col = document.createElement('div');
      col.className = 'col-6 col-md-3 thumb';
      col.innerHTML = `<a data-fancybox="gallery" href="${src}"><img src="${src}" alt="" class="img-fluid rounded"/></a>`;
      galleryWrap.appendChild(col);
    });
  }

  // countdown
  startCountdown(EVENT_DATE_ISO);

  // audio toggle
  setupAudioToggle();

  // smooth scroll fallback for older browsers: intercept SVG links for precise offset
  document.querySelectorAll('.scroll-flecha').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if(!target) return;
      target.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });

  // accessibility: allow chevron key navigation (arrow down)
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowDown'){
      const sections = Array.from(document.querySelectorAll('.seccion'));
      const top = window.scrollY;
      const currentIndex = sections.findIndex(s => s.offsetTop > top + 10);
      const next = sections[Math.max(0, currentIndex)];
      if(next) next.scrollIntoView({behavior:'smooth',block:'start'});
    }
  });
});

/* ===== Countdown ===== */
function startCountdown(isoDate){
  const target = new Date(isoDate).getTime();
  if(isNaN(target)) return;
  const tick = ()=>{
    const now = Date.now();
    const diff = Math.max(0, target - now);
    const s = Math.floor(diff/1000);
    const days = Math.floor(s / (3600*24));
    const hours = Math.floor((s % (3600*24)) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    const d = document.getElementById('cd-days'); if(d) d.textContent = days;
    const h = document.getElementById('cd-hours'); if(h) h.textContent = String(hours).padStart(2,'0');
    const m = document.getElementById('cd-mins'); if(m) m.textContent = String(minutes).padStart(2,'0');
    const sec = document.getElementById('cd-secs'); if(sec) sec.textContent = String(seconds).padStart(2,'0');
    if(diff <= 0) clearInterval(iv);
  };
  tick();
  const iv = setInterval(tick,1000);
}

/* ===== Audio control ===== */
function setupAudioToggle(){
  const audio = document.getElementById('bgAudio');
  const toggle = document.getElementById('audioToggle');
  const playI = document.getElementById('audioPlay');
  const pauseI = document.getElementById('audioPause');
  if(audio && AUDIO_SRC && AUDIO_SRC.length>3) audio.src = AUDIO_SRC;

  if(!toggle || !audio) return;
  toggle.style.zIndex = 14000;
  toggle.addEventListener('click', ()=>{
    if(audio.paused){
      audio.play().catch(()=>{ /* autoplay blocked */ });
      syncAudioIcons(true);
    } else {
      audio.pause();
      syncAudioIcons(false);
    }
  });
  audio.addEventListener('ended', ()=> syncAudioIcons(false));
}
function syncAudioIcons(isPlaying){
  const playI = document.getElementById('audioPlay');
  const pauseI = document.getElementById('audioPause');
  const toggle = document.getElementById('audioToggle');
  if(!playI || !pauseI) return;
  if(isPlaying){ playI.classList.add('hidden'); pauseI.classList.remove('hidden'); toggle.setAttribute('aria-pressed','true'); }
  else { playI.classList.remove('hidden'); pauseI.classList.add('hidden'); toggle.setAttribute('aria-pressed','false'); }
}

/* ===== Form modal or mailto fallback ===== */
function openFormModal(url){
  const iframe = document.getElementById('formIframe');
  if(iframe) iframe.src = url;
  $('#formModal').modal('show');
}
function fallbackMail(){
  const body = encodeURIComponent(`Hola,%0A%0AMi nombre es:%0AConfirmo mi asistencia: Sí/No%0ACantidad adultos:%0ACantidad peques:%0AEdades:%0ARestricciones alimentarias:%0AMensaje:%0A`);
  window.location.href = `mailto:${OWNER_EMAIL}?subject=RSVP%20-%20${encodeURIComponent(KID_NAME)}&body=${body}`;
}
