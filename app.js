// ---------- AUDIO TOGGLE ----------
const audio = document.getElementById('bgAudio');
const audioToggle = document.getElementById('audioToggle');
const audioPlay = document.getElementById('audioPlay');
const audioPause = document.getElementById('audioPause');

audioToggle.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    audioPlay.classList.add('hidden');
    audioPause.classList.remove('hidden');
    audioToggle.setAttribute('aria-pressed', 'true');
  } else {
    audio.pause();
    audioPlay.classList.remove('hidden');
    audioPause.classList.add('hidden');
    audioToggle.setAttribute('aria-pressed', 'false');
  }
});

// ---------- COUNTDOWN ----------
const countdownDate = new Date('December 6, 2025 18:00:00').getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = countdownDate - now;

  if (distance < 0) return;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById('cd-days').innerText = days;
  document.getElementById('cd-hours').innerText = hours;
  document.getElementById('cd-mins').innerText = minutes;
  document.getElementById('cd-secs').innerText = seconds;
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ---------- SMOOTH SCROLL ----------
document.querySelectorAll('a.scroll-flecha').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ---------- GALERÍA EJEMPLO ----------
const galleryWrap = document.getElementById('galleryWrap');
for (let i = 1; i <= 6; i++) {
  const imgEl = document.createElement('img');
  imgEl.src = `img/galeria${i}.jpg`;
  imgEl.alt = `Foto ${i}`;
  imgEl.classList.add('img-fluid', 'rounded');
  galleryWrap.appendChild(imgEl);
}

// ---------- MODAL FORMULARIO ----------
const openFormBtn2 = document.getElementById('openFormBtn2');
const formIframe = document.getElementById('formIframe');

openFormBtn2.addEventListener('click', () => {
  formIframe.src = 'https://docs.google.com/forms/d/e/1FAIpQLSfXXXXXXXXXXX/viewform?embedded=true';
  $('#formModal').modal('show');
});


