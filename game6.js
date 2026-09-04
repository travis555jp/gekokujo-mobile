/* ================= Menu control ================= */
function goTitle() { G.state = 'title'; G.sel = 0; }
function menuKey(code) {
  if (G.state === 'title') {
    if (code === 'ArrowUp' || code === 'KeyW') G.sel = (G.sel + 2) % 3;
    else if (code === 'ArrowDown' || code === 'KeyS') G.sel = (G.sel + 1) % 3;
    else if (code === 'Enter' || code === 'Space') menuSelect(G.sel);
  } else if (G.state === 'select') {
    if (code === 'ArrowLeft' || code === 'KeyA') G.charSel = (G.charSel + CHARS.length - 1) % CHARS.length;
    else if (code === 'ArrowRight' || code === 'KeyD') G.charSel = (G.charSel + 1) % CHARS.length;
    else if (code === 'ArrowUp' || code === 'KeyW') G.charSel = (G.charSel + CHARS.length - 2) % CHARS.length;
    else if (code === 'ArrowDown' || code === 'KeyS') G.charSel = (G.charSel + 2) % CHARS.length;
    else if (code === 'Enter' || code === 'Space') newGame(G.charSel);
    else if (code === 'Escape') goTitle();
  } else if (G.state === 'howto' || G.state === 'ranking') {
    if (code === 'Enter' || code === 'Space' || code === 'Escape') goTitle();
  } else if (G.state === 'gameover' && G.overT > 100) {
    if (code === 'Enter' || code === 'Space') newGame();
    else if (code === 'Escape') goTitle();
  }
}
function menuSelect(i) {
  if (i === 0) { G.state = 'select'; G.charSel = G.charSel || 0; } else if (i === 1) G.state = 'howto'; else { G.ranking = RankingStore.load(); G.state = 'ranking'; }
}
function menuClick(x, y) {
  if (G.state === 'title') {
    if (x > W / 2 - 52 && x < W / 2 + 52 && y > 318 && y < 346) { G.sel = 0; menuSelect(0); }
    else if (x > 36 && x < 124 && y > 386 && y < 410) { G.sel = 1; menuSelect(1); }
    else if (x > W - 124 && x < W - 36 && y > 386 && y < 410) { G.sel = 2; menuSelect(2); }
  } else if (G.state === 'select') {
    if (y > 414 && y < 442 && x > W / 2 - 74 && x < W / 2 + 74) newGame(G.charSel);
    else CHARS.forEach((c, i) => { const col = i % 2, row = Math.floor(i / 2); const cx = 14 + col * 128, cy = 60 + row * 148; if (x > cx && x < cx + 114 && y > cy && y < cy + 132) G.charSel = i; });
  } else if (G.state === 'howto' || G.state === 'ranking') {
    if (y > 414 && y < 444) goTitle();
  } else if (G.state === 'gameover' && G.overT > 100) {
    if (y > 380 && y < 408) { if (x < W / 2) newGame(); else goTitle(); }
  }
}

/* ================= Loop ================= */
let last = performance.now(), acc = 0;
function loop(now) {
  const dt = now - last; last = now; acc += Math.min(dt, 100);
  while (acc >= 16.667) { step(); acc -= 16.667; }
  draw();
  touchEl.style.display = (isTouch && G.state === 'playing') ? 'block' : 'none';
  requestAnimationFrame(loop);
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) { last = performance.now(); acc = 0; } });
buildMap(1);
requestAnimationFrame(loop);
