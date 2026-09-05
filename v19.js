/* GEKOKUJO OFFLINE v19 — fix player illustrated sprites + better background fitting.
   Keeps v18 character designs, prevents displayfix from restoring old player pixel sprites. */
(() => {
  const A19 = { ready: false, imgs: {} };
  const files = {
    bg: 'assets/bg-stage.webp?v=19',
    hunter: 'assets/player-hunter.webp?v=19',
    ronin: 'assets/player-ronin.webp?v=19',
    farmer: 'assets/player-farmer.webp?v=19',
    yamaotoko: 'assets/player-yamaotoko.webp?v=19',
    ashigaru: 'assets/enemy-ashigaru.webp?v=19',
    samurai: 'assets/enemy-samurai.webp?v=19',
    ninja: 'assets/enemy-ninja.webp?v=19',
    tsuji: 'assets/enemy-tsuji.webp?v=19',
    daikan: 'assets/enemy-daikan.webp?v=19'
  };

  const load = (key, src) => new Promise(resolve => {
    const img = new Image();
    img.onload = () => { A19.imgs[key] = img; resolve(); };
    img.onerror = () => { console.warn('[v19] asset failed:', src); resolve(); };
    img.src = src;
  });

  const art = (key, baseH, yOff = 3) => ({ art19: true, key, frames: 3, baseH, yOff });

  const oldDrawSpr = drawSpr;
  drawSpr = function(spr, x, y, face, scale, rot, alpha) {
    if (!spr || !spr.art19) return oldDrawSpr(spr, x, y, face, scale, rot, alpha);
    const img = A19.imgs[spr.key];
    if (!img) return;
    const fw = img.width / (spr.frames || 1), fh = img.height;
    const mult = scale || 1;
    const dh = spr.baseH * mult, dw = (fw / fh) * dh;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y + (spr.yOff || 0) * mult));
    if (alpha !== undefined) ctx.globalAlpha = alpha;
    if (rot) ctx.rotate(rot);
    if (face < 0) ctx.scale(-1, 1);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, fw, fh, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  };

  const oldDrawHuman = drawHuman;
  drawHuman = function(spr, x, y, face, anim, moving, flash, scale) {
    if (!spr || !spr.art19) return oldDrawHuman(spr, x, y, face, anim, moving, flash, scale);
    const img = A19.imgs[spr.key];
    if (!img) return;
    const frames = spr.frames || 1;
    const frame = moving && frames >= 3 ? 1 + (Math.floor(anim / 8) % 2) : 0;
    const fw = img.width / frames, fh = img.height;
    const mult = scale || 1;
    const dh = spr.baseH * mult, dw = (fw / fh) * dh;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y + (spr.yOff || 0) * mult));
    if (face < 0) ctx.scale(-1, 1);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, fw * frame, 0, fw, fh, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
    if (flash > 0) {
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(x, y, dw * 0.42, dh * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  function applyCharacters() {
    if (!A19.ready) return;
    SPR.hunter = art('hunter', 27, 4);
    SPR.ronin = art('ronin', 28, 4);
    SPR.farmer = art('farmer', 27, 4);
    SPR.yamaotoko = art('yamaotoko', 29, 4);
    SPR.ashigaru = art('ashigaru', 26, 4);
    SPR.samurai = art('samurai', 27, 4);
    SPR.ninja = art('ninja', 26, 4);
    SPR.tsuji = art('tsuji', 27, 4);
    SPR.daikan = art('daikan', 29, 5);
  }

  function ensurePlayerCharacters() {
    if (!A19.ready) return;
    if (!SPR.hunter || !SPR.hunter.art19 || !SPR.ronin || !SPR.ronin.art19 || !SPR.farmer || !SPR.farmer.art19 || !SPR.yamaotoko || !SPR.yamaotoko.art19) {
      applyCharacters();
    }
  }

  function drawCover(g, img, w, h) {
    const scale = Math.max(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    g.drawImage(img, dx, dy, dw, dh);
  }

  function paintWatercolorMap() {
    if (!mapCanvas || !A19.imgs.bg) return;
    const g = mapCanvas.getContext('2d');
    const old = document.createElement('canvas');
    old.width = mapCanvas.width;
    old.height = mapCanvas.height;
    old.getContext('2d').drawImage(mapCanvas, 0, 0);

    g.save();
    g.clearRect(0, 0, WORLD_W, WORLD_H);
    g.imageSmoothingEnabled = true;
    drawCover(g, A19.imgs.bg, WORLD_W, WORLD_H);
    g.fillStyle = 'rgba(250,244,232,0.08)';
    g.fillRect(0, 0, WORLD_W, WORLD_H);
    g.globalAlpha = 0.26;
    g.drawImage(old, 0, 0);
    g.globalAlpha = 1;
    const grd = g.createLinearGradient(0, 0, 0, WORLD_H);
    grd.addColorStop(0, 'rgba(255,255,255,0.06)');
    grd.addColorStop(0.5, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(0,0,0,0.08)');
    g.fillStyle = grd;
    g.fillRect(0, 0, WORLD_W, WORLD_H);
    g.restore();
  }

  const oldBuildMap = buildMap;
  buildMap = function(stage) {
    oldBuildMap(stage);
    ensurePlayerCharacters();
    if (A19.ready) paintWatercolorMap();
  };

  const oldDraw = draw;
  draw = function() {
    ensurePlayerCharacters();
    oldDraw();
  };

  Promise.all(Object.entries(files).map(([key, src]) => load(key, src))).then(() => {
    A19.ready = true;
    applyCharacters();
    if (typeof ctx !== 'undefined') ctx.imageSmoothingEnabled = true;
    setTimeout(applyCharacters, 0);
    setTimeout(applyCharacters, 300);
    setTimeout(applyCharacters, 1200);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => setTimeout(applyCharacters, 0));
    }
    if (typeof G !== 'undefined') buildMap(G.stage || 1);
  });
})();
