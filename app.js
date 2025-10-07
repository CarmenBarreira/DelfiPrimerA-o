/* ================== CONFIG - EDITA SOLO ESTO ================== */
/* Fecha y hora del evento (ISO) */
const EVENT_DATE_ISO = "2025-11-23T21:00:00-03:00";

/* Nombre */
const KID_NAME = "Delfina";

/* Assets (sube a assets/) */
const INTRO_BG = "assets/portada.jpg";
const INTRO_PHOTO = "img/delfi_placeholder.png";
const PORTADA_IMAGE = "assets/portada.jpg";
const HERO_PHOTO = "img/delfi_placeholder.png";
const PARTY_ICON = "assets/icono-fiesta.svg";
const AUDIO_SRC = "assets/musica.mp3";
const PLAY_ICON = "assets/icono-musica_play.svg";
const PAUSE_ICON = "assets/icono-musica_pausa.svg";

/* Google Form (opcional) - si lo pones con ?embedded=true abrirá en modal */
const GOOGLE_FORM_EMBED_URL = ""; // p.ej. "https://docs.google.com/forms/d/XXXXX/viewform?embedded=true"
const OWNER_EMAIL = "csilbarreira@gmail.com";

/* Lugar / mapa */
const EVENT_LOCATION_NAME = "Salón Campo Norte";
const EVENT_ADDRESS = "Ruta E53, Córdoba";
const EVENT_MAP_URL = "https://goo.gl/maps/UxEZgL3xGRCqKSy37";
/* ================== FIN CONFIG ================== */

document.addEventListener('DOMContentLoaded', ()=> {
  // Intro splash background + photo
  const introMedia = document.querySelector('.intro-media');
  introMedia.style.backgroundImage = `url('${INTRO_BG}')`;
  document.getElementById('introDelfi').src = INTRO_PHOTO;
  document.getElementById('introName').textContent = KID_NAME;

  // When Enter -> hide splash and show main content
  document.getElementById('enterBtn').addEventListener('click', ()=> {
    const intro = document.getElementById('introSplash');
    intro.style.transition = 'opacity 420ms ease, transform 420ms ease';
    intro.style.opacity = '0';
    intro.style.transform = 'scale(.98)';
    setTimeout(()=> { intro.remove(); document.getElementById('pageContent').hidden = false; window.scrollTo({top:0, behavior:'smooth'}); }, 420);
    // attempt autoplay
    try{ document.getElementById('bgAudio').play(); syncAudioIcons(true); }catch(e){}
  });

  // Portada
  document.querySelector('.portada-media').style.backgroundImage = `url('${PORTADA_IMAGE}')`;
  document.getElementById('mainTitle').textContent = `Cumple 1 año • ${KID_NAME}`;
  document.getElementById('delfiPhoto').src = HERO_PHOTO;
  document.getElementById('partyIcon').src = PARTY_ICON;

  // Banner date + when / where
  const bannerDate = document.getElementById('bannerDate');
  const dateLeft = new Date(EVENT_DATE_ISO).toLocaleString('es-ES', { day:'2-digit', month:'long' });
  bannerDate.querySelector('.date-left').textContent = dateLeft;
  bannerDate.querySelector('.date-right').textContent = new Date(EVENT_DATE_ISO).toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'}) + ` — ${EVENT_LOCATION_NAME}`;
  document.getElementById('whenText').textContent = new Date(EVENT_DATE_ISO).toLocaleString('es-ES', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' });
  document.getElementById('whereText').textContent = `${EVENT_LOCATION_NAME} — ${EVENT_ADDRESS}`;
  document.getElementById('mapLink').href = EVENT_MAP_URL;
  document.getElementById('comoLlegar').href = EVENT_MAP_URL;

  // Confirm / form links
  const confirmLink = document.getElementById('confirmLink');
  const mailtoLink = document.getElementById('mailtoLink');
  if(GOOGLE_FORM_EMBED_URL && GOOGLE_FORM_EMBED_URL.length>5){
    mailtoLink.href = `mailto:${OWNER_EMAIL}?subject=RSVP%20-%20${encodeURIComponent(KID_NAME)}`;
    // open in modal handled below
  } else {
    mailtoLink.href = `mailto:${OWNER_EMAIL}?subject=RSVP%20-%20${encodeURIComponent(KID_NAME)}`;
  }

  // Open form buttons
  document.getElementById('openFormBtn').addEventListener('click', openFormHandler);
  document.getElementById('openFormBtn2').addEventListener('click', openFormHandler);

  // gallery (reemplaza por tus imágenes)
  const galleryImgs = ['assets/1.jpg','assets/2.jpg','assets/3.jpg','assets/4.jpg','assets/5.jpg','assets/6.jpg','assets/7.jpg','assets/8.jpg'];
  const galleryWrap = document.getElementById('galleryWrap');
  galleryImgs.forEach(src => {
    const col = document.createElement('div');
    col.className = 'col-6 col-md-3 thumb';
    col.innerHTML = `<a data-fancybox="gallery" href="${src}"><img src="${src}" alt="" class="img-fluid rounded"/></a>`;
    galleryWrap.appendChild(col);
  });

  // countdown
  startCountdown(EVENT_DATE_ISO);

  // audio toggle
  setupAudioToggle();

  // showMapBtn to open route
  document.getElementById('showMapBtn').addEventListener('click', ()=> {
    window.open(EVENT_MAP_URL, '_blank');
  });

  // confirmLink fallback if user clicks "confirm" in header
  document.getElementById('openFormBtn').addEventListener('click', ()=> {});
});

/* countdown */
function startCountdown(isoDate){
  const target = new Date(isoDate).getTime();
  function tick(){
    const now = Date.now();
    const diff = Math.max(0, target - now);
    const s = Math.floor(diff/1000);
    const days = Math.floor(s / (3600*24));
    const hours = Math.floor((s % (3600*24)) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    document.getElementById('cd-days').textContent = days;
    document.getElementById('cd-hours').textContent = String(hours).padStart(2,'0');
    document.getElementById('cd-mins').textContent = String(minutes).padStart(2,'0');
    document.getElementById('cd-secs').textContent = String(seconds).padStart(2,'0');
    if(diff <= 0) clearInterval(iv);
  }
  tick();
  const iv = setInterval(tick, 1000);
}

/* audio toggle */
function setupAudioToggle(){
  const audio = document.getElementById('bgAudio');
  const toggle = document.getElementById('audioToggle');
  const playI = document.getElementById('audioPlay');
  const pauseI = document.getElementById('audioPause');

  if(AUDIO_SRC && AUDIO_SRC.length>3) audio.src = AUDIO_SRC;

  toggle.addEventListener('click', ()=> {
    if(audio.paused){
      audio.play().catch(()=>{});
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
  if(isPlaying){
    playI.classList.add('hidden');
    pauseI.classList.remove('hidden');
    toggle.classList.add('playing');
    toggle.setAttribute('aria-pressed','true');
  } else {
    playI.classList.remove('hidden');
    pauseI.classList.add('hidden');
    toggle.classList.remove('playing');
    toggle.setAttribute('aria-pressed','false');
  }
}

/* abrir form o mailto */
function openFormHandler(){
  if(GOOGLE_FORM_EMBED_URL && GOOGLE_FORM_EMBED_URL.length>5){
    document.getElementById('formIframe').src = GOOGLE_FORM_EMBED_URL;
    $('#formModal').modal('show');
  } else {
    const body = encodeURIComponent(`Hola,%0A%0AMi nombre es:%0AConfirmo mi asistencia: Sí/No%0ACantidad adultos:%0ACantidad peques:%0AEdades:%0ARestricciones alimentarias:%0AMensaje/observaciones:%0A`);
    window.location.href = `mailto:${OWNER_EMAIL}?subject=RSVP%20-%20${encodeURIComponent(KID_NAME)}&body=${body}`;
  }
}
