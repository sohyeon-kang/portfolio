// 작품 이미지 확대: 네이티브 dialog로 키보드 초점과 Escape 동작을 제공합니다.
const viewer = document.querySelector('.image-viewer');
const viewerImage = viewer.querySelector('.viewer-image');
const viewerTitle = viewer.querySelector('#viewer-title');
const caption = viewer.querySelector('.viewer-caption');
const previous = viewer.querySelector('.viewer-prev');
const next = viewer.querySelector('.viewer-next');
let opener = null;
let gallery = [];
let galleryIndex = 0;

function showImage(index) {
  const focusedAction = document.activeElement;
  galleryIndex = index;
  const trigger = gallery[index];
  const source = trigger.querySelector('img');
  viewerImage.src = source.currentSrc || source.src;
  viewerImage.alt = source.alt;
  viewerTitle.textContent = trigger.dataset.title;
  caption.textContent = `${index + 1} / ${gallery.length} · ${trigger.closest('figure')?.querySelector('figcaption')?.textContent || source.alt}`;
  previous.disabled = index === 0;
  next.disabled = index === gallery.length - 1;
  // 끝 이미지에서 이동 버튼이 비활성화되어도 키보드 초점을 유지합니다.
  if (viewer.open && focusedAction === next && next.disabled) previous.focus();
  if (viewer.open && focusedAction === previous && previous.disabled) next.focus();
}

document.querySelectorAll('.zoom-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    opener = trigger;
    gallery = [...document.querySelectorAll('.zoom-trigger')].filter((item) => item.dataset.gallery === trigger.dataset.gallery);
    showImage(gallery.indexOf(trigger));
    viewer.showModal();
    document.documentElement.classList.add('viewer-open');
  });
});
viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
previous.addEventListener('click', () => { if (galleryIndex > 0) showImage(galleryIndex - 1); });
next.addEventListener('click', () => { if (galleryIndex < gallery.length - 1) showImage(galleryIndex + 1); });
viewer.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' && galleryIndex > 0) { event.preventDefault(); showImage(galleryIndex - 1); }
  if (event.key === 'ArrowRight' && galleryIndex < gallery.length - 1) { event.preventDefault(); showImage(galleryIndex + 1); }
});
viewer.addEventListener('click', (event) => { if (event.target === viewer) viewer.close(); });
viewer.addEventListener('close', () => {
  document.documentElement.classList.remove('viewer-open');
  opener?.focus({ preventScroll: true });
});

// 포트폴리오 안에서만 동작합니다. 작품 원본 서비스와는 연결하지 않습니다.
document.documentElement.classList.add('js-ready');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionOff = reduceMotion.matches;
let refreshTimer;
const gsapAvailable = typeof window.gsap !== 'undefined';

function refreshScroll() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    updateNavigation();
  }, 100);
}
function configureMotion() {
  motionOff = reduceMotion.matches;
  if (gsapAvailable) {
    gsap.killTweensOf('.name-letter');
    gsap.set('.name-letter', {clearProps:'transform'});
  }
}
reduceMotion.addEventListener('change', configureMotion);
document.querySelectorAll('.name-letter').forEach((letter,index) => {
  letter.addEventListener('pointerenter', () => {
    if (!gsapAvailable || motionOff) return;
    gsap.to(letter,{y:-11,rotation:index%2===0?-5:5,scaleY:1.08,duration:0.45,ease:'back.out(2)',overwrite:true});
  });
  letter.addEventListener('pointerleave', () => {
    if (!gsapAvailable) return;
    gsap.to(letter,{y:0,rotation:0,scaleY:1,duration:motionOff?0:0.55,ease:'elastic.out(1,0.65)',overwrite:true});
  });
});

const navLinks=[...document.querySelectorAll('.site-header nav a')];
const sectionIds=['about','work','memory','dua'];
let navQueued=false;
function updateNavigation(){
  let current='';
  for(const id of sectionIds)if(document.getElementById(id).getBoundingClientRect().top<=180)current=id;
  if(current==='dua'||current==='memory')current='work';
  navLinks.forEach(link=>{if(link.hash===`#${current}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  navQueued=false;
}
window.addEventListener('scroll',()=>{if(!navQueued){navQueued=true;requestAnimationFrame(updateNavigation);}},{passive:true});
window.addEventListener('resize',refreshScroll);
window.addEventListener('load',refreshScroll);
document.fonts.ready.then(refreshScroll);
configureMotion();updateNavigation();
