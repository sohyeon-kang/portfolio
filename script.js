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
const letterTouches = new Map();
const letterFeedbackTimers = new Map();
const minimumTouchFeedback = 160;

function animateLetter(letter, index, duration = 0.45) {
  if (!gsapAvailable || motionOff) return;
  gsap.to(letter,{y:-11,rotation:index%2===0?-5:5,scaleY:1.08,duration,ease:'back.out(2)',overwrite:true});
}
function restoreLetter(letter, immediate = false) {
  if (!gsapAvailable) return;
  if (immediate || motionOff) {
    gsap.killTweensOf(letter);
    gsap.set(letter, {clearProps:'transform'});
    return;
  }
  gsap.to(letter,{y:0,rotation:0,scaleY:1,duration:0.55,ease:'elastic.out(1,0.65)',overwrite:true});
}
function clearLetterFeedback(letter, immediate = false) {
  clearTimeout(letterFeedbackTimers.get(letter));
  letterFeedbackTimers.delete(letter);
  letter.classList.remove('is-touched');
  restoreLetter(letter, immediate);
}
function finishLetterTouch(pointerId, cancelled = false) {
  const touch = letterTouches.get(pointerId);
  if (!touch) return;
  letterTouches.delete(pointerId);
  if ([...letterTouches.values()].some(active => active.letter === touch.letter)) return;
  // 짧게 탭해도 색을 확인할 수 있게 하되, 스크롤이나 취소에는 즉시 정리합니다.
  const remaining = cancelled ? 0 : Math.max(0, minimumTouchFeedback - (performance.now() - touch.started));
  if (!remaining) clearLetterFeedback(touch.letter, cancelled);
  else letterFeedbackTimers.set(touch.letter, setTimeout(() => clearLetterFeedback(touch.letter), remaining));
}
function resetLetterTouches() {
  letterTouches.forEach(touch => clearLetterFeedback(touch.letter, true));
  letterTouches.clear();
  [...letterFeedbackTimers.keys()].forEach(letter => clearLetterFeedback(letter, true));
  // 손을 뗀 뒤 진행 중인 복귀 애니메이션도 화면 이탈 시 정리합니다.
  document.querySelectorAll('.name-letter').forEach(letter => restoreLetter(letter, true));
}
document.querySelectorAll('.name-letter').forEach((letter,index) => {
  letter.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    animateLetter(letter, index);
  });
  letter.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    restoreLetter(letter);
  });
  letter.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse') return;
    clearTimeout(letterFeedbackTimers.get(letter));
    letterFeedbackTimers.delete(letter);
    letterTouches.set(event.pointerId, {letter, started:performance.now(), x:event.clientX, y:event.clientY});
    letter.classList.add('is-touched');
    animateLetter(letter, index, 0.18);
  }, {passive:true});
});
window.addEventListener('pointerup', event => finishLetterTouch(event.pointerId), {passive:true});
window.addEventListener('pointercancel', event => finishLetterTouch(event.pointerId, true), {passive:true});
window.addEventListener('pointermove', event => {
  const touch = letterTouches.get(event.pointerId);
  if (touch && Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > 12) finishLetterTouch(event.pointerId, true);
}, {passive:true});
window.addEventListener('scroll', resetLetterTouches, {passive:true});
window.addEventListener('blur', resetLetterTouches);
window.addEventListener('pagehide', resetLetterTouches);
document.addEventListener('visibilitychange', () => {if (document.hidden) resetLetterTouches();});

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
  resetLetterTouches();
  // 페이지 안의 메뉴 이동은 유지하고, 진입·새로고침·복귀 시에만 첫 화면으로 이동합니다.
  if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
  window.scrollTo({top:0,left:0,behavior:'instant'});
  updateNavigation();
});
document.fonts.ready.then(refreshScroll);
configureMotion();updateNavigation();
