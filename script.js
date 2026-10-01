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
window.addEventListener('pageshow', () => {
  // 페이지 안의 메뉴 이동은 유지하고, 진입·새로고침·복귀 시에만 첫 화면으로 이동합니다.
  if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
  window.scrollTo({top:0,left:0,behavior:'instant'});
  updateNavigation();
});
document.fonts.ready.then(refreshScroll);
configureMotion();updateNavigation();
