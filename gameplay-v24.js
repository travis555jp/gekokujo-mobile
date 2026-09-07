/* GEKOKUJO pause system v24
   - pause/resume button on gameplay screen
   - freezes game simulation, timer, enemies and effects
   - pauses Web Audio/BGM while paused
   - P/Escape keyboard shortcut
   - auto-pause when the app/tab goes to background
*/
(() => {
  'use strict';

  let stateBeforePause24 = 'playing';

  const pauseBtn24 = document.createElement('button');
  pauseBtn24.id = 'pauseBtn24';
  pauseBtn24.type = 'button';
  pauseBtn24.textContent = 'Ⅱ';
  pauseBtn24.setAttribute('aria-label', '一時停止');
  Object.assign(pauseBtn24.style, {
    position: 'fixed',
    top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
    right: '14px',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '1.5px solid rgba(67,53,39,.72)',
    background: 'rgba(248,241,229,.88)',
    color: '#30261d',
    fontFamily: '"Yomogi", "Hiragino Sans", sans-serif',
    fontSize: '20px',
    lineHeight: '40px',
    textAlign: 'center',
    padding: '0',
    zIndex: '60',
    boxShadow: '0 2px 9px rgba(0,0,0,.20), inset 0 0 0 2px rgba(255,255,255,.25)',
    backdropFilter: 'blur(3px)',
    WebkitBackdropFilter: 'blur(3px)',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
    display: 'none'
  });
  document.body.appendChild(pauseBtn24);

  function audioPause24() {
    try {
      if (typeof SFX !== 'undefined' && SFX.ac && SFX.ac.state === 'running') SFX.ac.suspend();
    } catch (e) {}
  }

  async function audioResume24() {
    try {
      if (typeof SFX !== 'undefined') SFX.init();
      if (typeof SFX !== 'undefined' && SFX.ac && SFX.ac.state === 'suspended') await SFX.ac.resume();
      if (typeof BGM !== 'undefined' && BGM.started && SFX.ac) BGM.nextTime = SFX.ac.currentTime + 0.04;
    } catch (e) {}
  }

  function resetInputs24() {
    try {
      input.attack = false;
      input.sx = 0;
      input.sy = 0;
      if (typeof atkId !== 'undefined') atkId = null;
      if (typeof stickId !== 'undefined') stickId = null;
      if (typeof knobEl !== 'undefined' && knobEl) knobEl.style.transform = '';
      if (typeof keys !== 'undefined') for (const k of Object.keys(keys)) keys[k] = false;
    } catch (e) {}
  }

  function setPaused24(paused) {
    if (typeof G === 'undefined') return;
    if (paused) {
      if (G.state !== 'playing' && G.state !== 'clear') return;
      stateBeforePause24 = G.state;
      G.state = 'paused';
      G.paused24 = true;
      resetInputs24();
      pauseBtn24.textContent = '▶';
      pauseBtn24.setAttribute('aria-label', 'ゲームを再開');
      audioPause24();
    } else {
      if (G.state !== 'paused') return;
      G.state = stateBeforePause24 === 'clear' ? 'clear' : 'playing';
      G.paused24 = false;
      resetInputs24();
      pauseBtn24.textContent = 'Ⅱ';
      pauseBtn24.setAttribute('aria-label', '一時停止');
      audioResume24();
    }
  }

  function togglePause24() {
    if (typeof G === 'undefined') return;
    if (G.state === 'paused') setPaused24(false);
    else if (G.state === 'playing' || G.state === 'clear') setPaused24(true);
  }

  function stopPauseEvent24(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Use one primary input path only, so iOS does not fire both pointer + touch toggles.
  if ('PointerEvent' in window) {
    pauseBtn24.addEventListener('pointerdown', e => {
      stopPauseEvent24(e);
      togglePause24();
    }, { passive: false });
  } else {
    pauseBtn24.addEventListener('touchstart', e => {
      stopPauseEvent24(e);
      togglePause24();
    }, { passive: false });
  }
  pauseBtn24.addEventListener('click', stopPauseEvent24, { passive: false });
  pauseBtn24.addEventListener('touchend', stopPauseEvent24, { passive: false });

  addEventListener('keydown', e => {
    if ((e.code === 'KeyP' || e.code === 'Escape') && typeof G !== 'undefined' &&
        (G.state === 'playing' || G.state === 'clear' || G.state === 'paused')) {
      e.preventDefault();
      e.stopPropagation();
      togglePause24();
    }
  }, true);

  const stepBefore24 = step;
  step = function() {
    if (typeof G !== 'undefined' && G.state === 'paused') return;
    stepBefore24();
  };

  function drawPauseOverlay24() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(26,20,15,.55)';
    ctx.fillRect(0, 0, W, H);

    const boxW = 182, boxH = 118;
    const x = (W - boxW) / 2, y = (H - boxH) / 2 - 8;
    ctx.fillStyle = 'rgba(248,241,229,.96)';
    ctx.fillRect(x, y, boxW, boxH);
    ctx.strokeStyle = 'rgba(55,43,32,.82)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, boxW - 2, boxH - 2);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#2b2119';
    ctx.font = '24px "Yuji Boku", "Hiragino Mincho ProN", serif';
    ctx.fillText('一時停止', W / 2, y + 38);
    ctx.font = '12px "Yomogi", "Hiragino Sans", sans-serif';
    ctx.fillStyle = '#51463b';
    ctx.fillText('右上の ▶ で再開', W / 2, y + 76);
    ctx.font = '10px "Yomogi", "Hiragino Sans", sans-serif';
    ctx.fillStyle = '#776b5e';
    ctx.fillText('P / Esc でも再開できます', W / 2, y + 96);
    ctx.restore();
  }

  const drawBefore24 = draw;
  draw = function() {
    drawBefore24();
    const state = (typeof G !== 'undefined') ? G.state : '';
    pauseBtn24.style.display = (state === 'playing' || state === 'clear' || state === 'paused') ? 'block' : 'none';
    if (state === 'paused') drawPauseOverlay24();
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && typeof G !== 'undefined' && (G.state === 'playing' || G.state === 'clear')) setPaused24(true);
  });

  if (typeof newGame === 'function') {
    const newGameBefore24 = newGame;
    newGame = function(...args) {
      if (typeof G !== 'undefined' && G.state === 'paused') {
        G.state = 'playing';
        G.paused24 = false;
      }
      pauseBtn24.textContent = 'Ⅱ';
      audioResume24();
      return newGameBefore24.apply(this, args);
    };
  }

  if (typeof goTitle === 'function') {
    const goTitleBefore24 = goTitle;
    goTitle = function(...args) {
      if (typeof G !== 'undefined') G.paused24 = false;
      pauseBtn24.textContent = 'Ⅱ';
      audioResume24();
      return goTitleBefore24.apply(this, args);
    };
  }
})();
