/* Riri's eighteenth — a private little birthday surprise. */
'use strict';

const LETTER_EXACTLY_AS_WRITTEN = `Hmm so writing a message, hamn, this is one of the most overthinking, and 100% brain using part. What to write, what to not. Okay I will write straight forward, to the point and very quickly.

The smallest and the only living being in this earth who has borne all my stupid dramas yet so far. I don't know most of the time bawarchi banke apne liye to bahot achha khana banati hai, par mere time hi isse experiment karna hota hai. Thandi chaat wegera wegera. Hn ye bhi hai ki agar mujhe khana banane ka josh agar chadha hai to wo bhi isike karan hai. bachpan se competitive hai re baba. Log ghar mein chhoto ko bado se compare karte hai. Hamare yaha iss mahashay ke marks ko dekhhkar mujhe aur padhne bolte thhe. 

Aur bhai handwriting...isme aaj tak nhi jeet paya ;)

I know waha nahi hu iss bar. Infact, truely speaking iss baar koi gift to nhi deraha, ye kuchh samay baad, at right moment, at right time! But my wishes, blessings, daat, drama everything are always with youuu. Janamdin ki hardik shubhkamnaye "Lovely" Sisss. 

Radhe Radhe ;)`;

const photo = name => `assets/photos/${name}.webp`;
const chapters = [
  {title:'Chhoti Hai ♡', tab:'Chhoti Hai', hint:'chhoti si Riri, big memories ♡', symbol:'✿', label:'Chhoti Hai', photos:[photo('chhoti-01')]},
  {title:'Nakhre Bachpan Se Hai', tab:'Nakhre Bachpan Se', hint:'the posing era, never really ended, and should never! ✧', symbol:'✧', label:'Nakhre Bachpan Se Hai', photos:[1,2,3,4,5].map(i=>photo(`nakhre-${String(i).padStart(2,'0')}`))},
  {title:'Baawarchi', tab:'Baawarchi', hint:'and the kitchen experiments continue...', symbol:'✳', label:'Baawarchi', photos:[1,2,3,4].map(i=>photo(`baawarchi-${String(i).padStart(2,'0')}`))},
  {title:'Multitalented', tab:'Multitalented', hint:'so many little talents, in one chhoti Riri', symbol:'✺', label:'Multitalented', photos:[1,2,3].map(i=>photo(`multitalented-${String(i).padStart(2,'0')}`))},
  {title:'Hardworking, Achieving, Mehnati Unicorn', tab:'Mehnati Unicorn', hint:'a whole lot of hard work and a little 🦄', symbol:'✷', label:'Mehnati Unicorn', photos:[1,2,3].map(i=>photo(`hardworking-${String(i).padStart(2,'0')}`))},
  {title:'With Family', tab:'With Family', hint:'all the people, all the love ♡', symbol:'♡', label:'With Family', photos:[1,2,3,4].map(i=>photo(`family-${String(i).padStart(2,'0')}`))},
];

const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));
const audio = $('#soundtrack');
const screens = {wish:$('#wish-screen'), song:$('#song-screen'), gallery:$('#gallery-screen'), letter:$('#letter-screen')};
const audioPaths = {intro:'assets/audio/after-candle-blow.mp3',gallery:'assets/audio/for-photo-gallery.mp3'};
let screen = 'wish';
let currentChapter = 0;
let blowStarted = false;
let introCompleted = false;
let microphoneStream = null;
let micContext = null;
let micAnimation = null;
let toastTimer = null;
let musicWanted = true;
let galleryStarted = false;
let letterOpened = false;
audio.volume = .45;

function showScreen(name){
  screen = name;
  Object.entries(screens).forEach(([key,el])=>{el.hidden = key !== name;el.classList.toggle('active',key === name);});
  $$('.step-dot').forEach(el=>el.classList.toggle('active',el.dataset.step === (name==='song'?'wish':name)));
  $('#floating-player').hidden = !['gallery','letter'].includes(name);
  window.scrollTo({top:0,behavior:'auto'});
  const title = {wish:'Happy 18th Birthday, Riri!',song:'A Birthday Song for Riri',gallery:'The Riri Archives',letter:'A Letter for Riri'};
  document.title = `${title[name]} ♡`;
}
function fmt(seconds){if(!Number.isFinite(seconds))return '0:00';const n=Math.floor(seconds);return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;}
function notify(message){const toast=$('#toast');toast.textContent=message;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),3800);}
function confetti(){
  const container=$('#confetti');container.textContent='';
  const palette=['#d9a6af','#e9c1bd','#9cac91','#f4d6ab','#c69b8a','#f5e7da'];
  for(let i=0;i<80;i++){
    const piece=document.createElement('span');piece.className='confetti-piece';
    piece.style.left=`${Math.random()*100}%`;
    piece.style.background=palette[i%palette.length];
    piece.style.setProperty('--dur',`${3+Math.random()*2.8}s`);
    piece.style.setProperty('--dx',`${(Math.random()-.5)*260}px`);
    piece.style.setProperty('--spin',`${Math.random()*1500-750}deg`);
    piece.style.animationDelay=`${Math.random()*1}s`;
    container.appendChild(piece);
  }
  setTimeout(()=>{container.textContent=''},7100);
}
function closeMic(){
  if(micAnimation)cancelAnimationFrame(micAnimation);micAnimation=null;
  if(microphoneStream){microphoneStream.getTracks().forEach(t=>t.stop());microphoneStream=null;}
  if(micContext){micContext.close().catch(()=>{});micContext=null;}
  $('#mic-button').classList.remove('listening');
}
async function enableBlowMic(){
  if(blowStarted)return;
  if(microphoneStream){closeMic();$('#mic-status').textContent='Tap to blow out the candles, or use your mic ♡';return;}
  if(!navigator.mediaDevices?.getUserMedia){notify('Your browser cannot use the microphone here — tap the candle button instead.');return;}
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    if(blowStarted){stream.getTracks().forEach(t=>t.stop());return;}
    microphoneStream=stream;
    const AudioContext=window.AudioContext||window.webkitAudioContext;
    micContext=new AudioContext();
    const source=micContext.createMediaStreamSource(stream);
    const analyser=micContext.createAnalyser();analyser.fftSize=1024;source.connect(analyser);
    const buffer=new Uint8Array(analyser.fftSize);
    let loudFrames=0;
    $('#mic-status').textContent='Microphone ready — blow gently towards it ♡';$('#mic-button').classList.add('listening');
    const watch=()=>{
      if(blowStarted||!microphoneStream)return;
      analyser.getByteTimeDomainData(buffer);
      let squares=0;for(const b of buffer){const v=(b-128)/128;squares+=v*v;}
      const rms=Math.sqrt(squares/buffer.length);
      loudFrames=(rms>.10)?loudFrames+1:Math.max(0,loudFrames-1);
      if(loudFrames>=7){blowCandles();return;}
      micAnimation=requestAnimationFrame(watch);
    };
    watch();
  }catch(error){notify('Mic permission was not available — use the big blow button ♡');$('#mic-status').textContent='You can always tap the candle button instead.';closeMic();}
}
function blowCandles(){
  if(blowStarted)return;
  blowStarted=true;
  closeMic();
  $('#cake-scene').classList.add('blown');
  $('#blow-button').disabled=true;$('#mic-button').disabled=true;
  $('#blow-button').innerHTML='Wish granted ♡';
  confetti();
  // Play immediately within the user interaction; this is important on mobile browsers.
  audio.loop=false;audio.src=audioPaths.intro;audio.load();
  audio.play().then(()=>{$('#song-hint').textContent='your memories are waiting on the other side ✧';}).catch(()=>{
    $('#retry-audio').hidden=false;$('#skip-song').hidden=false;
    $('#song-hint').textContent='Tap play to hear your special birthday song.';
  });
  setTimeout(()=>showScreen('song'),900);
}
function retryIntro(){
  $('#retry-audio').hidden=true;
  audio.play().then(()=>{$('#skip-song').hidden=true;$('#song-hint').textContent='your memories are waiting on the other side ✧';}).catch(()=>{
    $('#retry-audio').hidden=false;$('#skip-song').hidden=false;notify('Audio could not start. You can continue to your memories.');
  });
}
function updateAudioUI(){
  if(screen==='song'){
    const duration=Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:25;
    const pct=Math.min(100,Math.max(0,audio.currentTime/duration*100));
    $('#intro-fill').style.width=pct+'%';$('#intro-progress').setAttribute('aria-valuenow',String(Math.round(pct)));
    $('#song-time').textContent=`${fmt(audio.currentTime)} / ${fmt(duration)}`;
  }
  if(['gallery','letter'].includes(screen)){
    const pct=audio.duration?100*audio.currentTime/audio.duration:0;
    $('#gallery-progress').style.width=`${pct}%`;
  }
}
function enterGallery(){
  if(introCompleted)return;
  introCompleted=true;
  audio.pause();
  showScreen('gallery');renderChapter(0);
  audio.src=audioPaths.gallery;audio.loop=true;audio.load();
  galleryStarted=true;musicWanted=true;
  startGalleryAudio();
}
function startGalleryAudio(){
  if(!musicWanted)return;
  audio.play().then(()=>{updatePlayerButton();}).catch(()=>{
    updatePlayerButton();notify('Tap the music button to play the gallery soundtrack ♫');
  });
}
function updatePlayerButton(){
  const b=$('#player-toggle');
  b.textContent=audio.paused?'▶':'Ⅱ';
  b.setAttribute('aria-label',audio.paused?'Play gallery music':'Pause gallery music');
  $('#speaker-toggle').textContent=audio.muted||audio.volume===0?'♪̸':'♫';
  $('#speaker-toggle').setAttribute('aria-label',audio.muted?'Unmute music':'Mute music');
}
function flipPolaroid(event){
  const element=event.currentTarget;
  const flipped=element.classList.toggle('flipped');
  element.setAttribute('aria-pressed',String(flipped));
  element.querySelector('.polaroid-front').setAttribute('aria-hidden',String(flipped));
  element.querySelector('.polaroid-back').setAttribute('aria-hidden',String(!flipped));
  element.setAttribute('aria-label',flipped?`${element.querySelector('.back-chapter').textContent}. Turn photo back around`:element.dataset.alt);
}
function renderChapter(index){
  currentChapter=Math.max(0,Math.min(chapters.length-1,index));
  const chapter=chapters[currentChapter];
  $('#chapter-index').textContent=`CHAPTER ${String(currentChapter+1).padStart(2,'0')} / ${String(chapters.length).padStart(2,'0')}`;
  $('#chapter-title').textContent=chapter.title;
  $('#chapter-hint').textContent=chapter.hint;
  $('#chapter-doodle').textContent=chapter.symbol;
  $$('.chapter-tab').forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===currentChapter));tab.tabIndex=i===currentChapter?0:-1;});
  $$('.chapter-dot').forEach((dot,i)=>dot.classList.toggle('active',i===currentChapter));
  $('#previous-chapter').disabled=currentChapter===0;
  $('#next-chapter').innerHTML=currentChapter===chapters.length-1?'Open the letter <span aria-hidden="true">→</span>':'Next chapter <span aria-hidden="true">→</span>';
  const track=$('#polaroid-track');track.replaceChildren();
  chapter.photos.forEach((src,i)=>{
    const button=document.createElement('button');
    button.type='button';button.className='polaroid';button.style.setProperty('--tilt',`${[-4,3,-2,5,-3][i%5]}deg`);
    button.setAttribute('aria-pressed','false');
    button.dataset.alt=`Flip photo ${i+1} of ${chapter.photos.length} from ${chapter.label}`;
    button.setAttribute('aria-label',button.dataset.alt);
    const inner=document.createElement('span');inner.className='polaroid-inner';
    const front=document.createElement('span');front.className='polaroid-face polaroid-front';front.setAttribute('aria-hidden','false');
    const img=document.createElement('img');img.src=src;img.loading=i>2?'lazy':'eager';img.decoding='async';img.alt=`${chapter.label} photograph ${i+1} of ${chapter.photos.length}`;
    const caption=document.createElement('span');caption.className='photo-caption';caption.textContent=`Photuu ${String(i+1).padStart(2,'0')} ♡`;
    front.append(img,caption);
    const back=document.createElement('span');back.className='polaroid-face polaroid-back';back.setAttribute('aria-hidden','true');
    const heart=document.createElement('span');heart.className='back-heart';heart.textContent=chapter.symbol;
    const title=document.createElement('span');title.className='back-chapter';title.textContent=chapter.label;
    const count=document.createElement('span');count.className='back-number';count.textContent=`Yaaden ${String(i+1).padStart(2,'0')}`;
    const flipBack=document.createElement('span');flipBack.className='back-flip';flipBack.textContent='flip me back ↺';
    back.append(heart,title,count,flipBack);inner.append(front,back);button.append(inner);
    button.addEventListener('click',flipPolaroid);
    track.appendChild(button);
  });
  track.scrollLeft=0;
  if(window.innerWidth<751){const tab=$$('.chapter-tab')[currentChapter];tab?.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});}
}
function setupChapters(){
  const nav=$('#chapter-nav'),dots=$('#chapter-dots');
  chapters.forEach((chapter,i)=>{
    const tab=document.createElement('button');tab.className='chapter-tab';tab.setAttribute('role','tab');tab.type='button';tab.textContent=chapter.tab;
    tab.addEventListener('click',()=>renderChapter(i));nav.appendChild(tab);
    const dot=document.createElement('span');dot.className='chapter-dot';dots.appendChild(dot);
  });
}
function enterLetter(){
  showScreen('letter');
  if(galleryStarted && !audio.paused){audio.volume=Math.min(audio.volume,.25);$('#volume-control').value=Math.round(audio.volume*100);}
}
function openLetter(){
  if(letterOpened)return;letterOpened=true;
  const envelope=$('#envelope-button');envelope.classList.add('opened');envelope.disabled=true;
  $('#envelope-instruction').textContent='a little piece of the heart, on paper ♡';
  setTimeout(()=>{
    $('#actual-letter').hidden=false;$('#replay-button').hidden=false;
    $('#actual-letter').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});
  },850);
}
function replay(){
  audio.pause();audio.currentTime=0;audio.loop=false;audio.src=audioPaths.intro;
  musicWanted=true;introCompleted=false;blowStarted=false;galleryStarted=false;audio.muted=false;audio.volume=.45;$('#volume-control').value='45';
  closeMic();letterOpened=false;
  $('#cake-scene').classList.remove('blown');
  $('#blow-button').disabled=false;$('#mic-button').disabled=false;
  $('#blow-button').innerHTML='Make a wish &amp; blow <span aria-hidden="true">✦</span>';
  $('#retry-audio').hidden=true;$('#skip-song').hidden=true;
  $('#intro-fill').style.width='0%';$('#intro-progress').setAttribute('aria-valuenow','0');
  $('#envelope-button').classList.remove('opened');$('#envelope-button').disabled=false;
  $('#actual-letter').hidden=true;$('#replay-button').hidden=true;
  $('#envelope-instruction').textContent='tap the envelope to open your letter ✧';
  $('#mic-status').textContent='Tap to blow out the candles, or use your mic ♡';
  showScreen('wish');
}

$('#letter-body').textContent=LETTER_EXACTLY_AS_WRITTEN;
setupChapters();
$('#blow-button').addEventListener('click',blowCandles);
$('#mic-button').addEventListener('click',enableBlowMic);
$('#retry-audio').addEventListener('click',retryIntro);
$('#skip-song').addEventListener('click',enterGallery);
$('#previous-chapter').addEventListener('click',()=>renderChapter(currentChapter-1));
$('#next-chapter').addEventListener('click',()=>currentChapter===chapters.length-1?enterLetter():renderChapter(currentChapter+1));
$('#open-letter-stage').addEventListener('click',enterLetter);
$('#envelope-button').addEventListener('click',openLetter);
$('#replay-button').addEventListener('click',replay);
$('#player-toggle').addEventListener('click',()=>{
  if(audio.paused){musicWanted=true;audio.play().catch(()=>notify('Could not play this audio — please check your browser permissions.'));}
  else{musicWanted=false;audio.pause();}
  updatePlayerButton();
});
$('#speaker-toggle').addEventListener('click',()=>{audio.muted=!audio.muted;updatePlayerButton();});
$('#volume-control').addEventListener('input',event=>{audio.volume=Number(event.target.value)/100;audio.muted=false;updatePlayerButton();});
audio.addEventListener('timeupdate',updateAudioUI);
audio.addEventListener('loadedmetadata',updateAudioUI);
audio.addEventListener('play',updatePlayerButton);
audio.addEventListener('pause',updatePlayerButton);
audio.addEventListener('ended',()=>{if(screen==='song'||(screen==='wish'&&blowStarted))enterGallery();});
audio.addEventListener('error',()=>{
  if(screen==='song' || (screen==='wish'&&blowStarted)){
    $('#retry-audio').hidden=false;$('#skip-song').hidden=false;
    $('#song-hint').textContent='The birthday song could not load. You can continue to the gallery.';
  } else if(screen==='gallery'||screen==='letter')notify('Gallery soundtrack could not be loaded.');
});
// Add arrow-key chapter navigation, without interfering with gallery swipe or buttons.
$('#chapter-nav').addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
  event.preventDefault();
  const index=(currentChapter+(event.key==='ArrowRight'?1:-1)+chapters.length)%chapters.length;
  renderChapter(index);$$('.chapter-tab')[index].focus();
});
showScreen('wish');
