const stage = document.querySelector('.atom-stage');
const model = stage.querySelector('img');
let rotationX = 0;
let rotationY = 0;
let startX = 0;
let startY = 0;
let startRotationX = 0;
let startRotationY = 0;

model.addEventListener('dragstart', (event) => event.preventDefault());

stage.addEventListener('pointerdown', (event) => {
  startX = event.clientX;
  startY = event.clientY;
  startRotationX = rotationX;
  startRotationY = rotationY;
  stage.classList.add('is-dragging');
  stage.setPointerCapture(event.pointerId);
});

stage.addEventListener('pointermove', (event) => {
  if (!stage.hasPointerCapture(event.pointerId)) return;
  rotationY = startRotationY + (event.clientX - startX) * .55;
  rotationX = startRotationX - (event.clientY - startY) * .55;
  model.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
});

function stopDragging(event) {
  if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  stage.classList.remove('is-dragging');
}

stage.addEventListener('pointerup', stopDragging);
stage.addEventListener('pointercancel', stopDragging);

const slides = [...document.querySelectorAll('.object-slide')];
const nextButton = document.querySelector('.slider-next');
const previousButton = document.querySelector('.slider-prev');
let activeSlide = 0;

function showSlide(index) {
  slides[activeSlide].classList.remove('is-active');
  activeSlide = (index + slides.length) % slides.length;
  slides[activeSlide].classList.add('is-active');
}

nextButton.addEventListener('click', () => showSlide(activeSlide + 1));
previousButton.addEventListener('click', () => showSlide(activeSlide - 1));

const rockSlides = [...document.querySelectorAll('.rock-slide')];
const rockNextButton = document.querySelector('.rock-next');
const rockPreviousButton = document.querySelector('.rock-prev');
let activeRockSlide = 0;

function showRockSlide(index) {
  rockSlides[activeRockSlide].classList.remove('is-active');
  activeRockSlide = (index + rockSlides.length) % rockSlides.length;
  rockSlides[activeRockSlide].classList.add('is-active');
}

rockNextButton.addEventListener('click', () => showRockSlide(activeRockSlide + 1));
rockPreviousButton.addEventListener('click', () => showRockSlide(activeRockSlide - 1));

const loader = document.querySelector('#page-loader');
const minimumLoaderTime = 2000;
const loaderStartedAt = performance.now();
const maxImageRetries = 3;

function loadImageWithRetry(image, attempt = 0) {
  return new Promise((resolve) => {
    if (image.complete) {
      if (image.naturalWidth > 0) resolve();
      else if (attempt < maxImageRetries) {
        const retryUrl = new URL(image.currentSrc || image.src, window.location.href);
        retryUrl.searchParams.set('retry', `${Date.now()}-${attempt}`);
        window.setTimeout(() => {
          image.src = retryUrl.href;
          loadImageWithRetry(image, attempt + 1).then(resolve);
        }, 450 * (attempt + 1));
      } else {
        image.classList.add('image-load-failed');
        resolve();
      }
      return;
    }

    const finish = () => {
      image.removeEventListener('load', onLoad);
      image.removeEventListener('error', onError);
      resolve();
    };
    const onLoad = () => finish();
    const onError = () => {
      image.removeEventListener('load', onLoad);
      image.removeEventListener('error', onError);
      if (attempt < maxImageRetries) {
        const retryUrl = new URL(image.currentSrc || image.src, window.location.href);
        retryUrl.searchParams.set('retry', `${Date.now()}-${attempt}`);
        window.setTimeout(() => {
          image.src = retryUrl.href;
          loadImageWithRetry(image, attempt + 1).then(resolve);
        }, 450 * (attempt + 1));
      } else {
        image.classList.add('image-load-failed');
        resolve();
      }
    };
    image.addEventListener('load', onLoad, { once: true });
    image.addEventListener('error', onError, { once: true });
  });
}

async function finishPageLoading() {
  const images = [...document.images].filter((image) => !image.closest('.page-loader'));
  await Promise.all(images.map((image) => loadImageWithRetry(image)));
  const remainingTime = Math.max(0, minimumLoaderTime - (performance.now() - loaderStartedAt));
  window.setTimeout(() => loader.classList.add('is-hidden'), remainingTime);
}

finishPageLoading();
