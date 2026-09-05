/* GEKOKUJO OFFLINE v18 — illustrated watercolor skin.
   Character designs are the v18 generated art and gameplay logic stays unchanged. */
(() => {
  const A18 = { ready: false, imgs: {} };
  const files = {
    bg: 'assets/bg-stage.webp?v=18',
    hunter: 'assets/player-hunter.webp?v=18',
    ronin: 'assets/player-ronin.webp?v=18',
    farmer: 'assets/player-farmer.webp?v=18',
    yamaotoko: 'assets/player-yamaotoko.webp?v=18',
    ashigaru: 'assets/enemy-ashigaru.webp?v=18',
    samurai: 'assets/enemy-samurai.webp?v=18',
    ninja: 'assets/enemy-ninja.webp?v=18',
    tsuji: 'assets/enemy-tsuji.webp?v=18',
    daikan: 'assets/enemy-daikan.webp?v=18'
  };

  const load = (key, src) => new Promise(resolve => {
    const img = new Image();
    img.onload = () => { A18.imgs[key] = img; resolve(); };
    img.onerror = () => { console.warn('[v18] asset failed:', src); resolve(); };
    img.src = src;
  });

  const art = (key, baseH, yOff = 3) => ({ art18: true, key, frames: 3, baseH, yOff });

  const oldDrawSpr = drawSpr;
  drawSpr = function(spr, x, y, face, scale, rot, alpha) {
    if (!spr || !spr.art18) return oldDrawSpr(spr, x, y, face, scale, rot, alpha);
    const img = A18.imgs[spr.key];
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
    if (!spr || !spr.art18) return oldDrawHuman(spr, x, y, face, anim, moving, flash, scale);
    const img = A18.imgs[spr.key];
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

  function paintWatercolorMap() {
    if (!mapCanvas || !A18.imgs.bg) return;
    const g = mapCanvas.getContext('2d');
    const old = document.createElement('canvas');
    old.width = mapCanvas.width; old.height = mapCanvas.height;
    old.getContext('2d').drawImage(mapCanvas, 0, 0);

    g.save();
    g.clearRect(0, 0, WORLD_W, WORLD_H);
    g.imageSmoothingEnabled = true;
    g.drawImage(A18.imgs.bg, 0, 0, WORLD_W, WORLD_H);
    g.globalAlpha = 0.20;
    g.drawImage(old, 0, 0);
    g.globalAlpha = 1;
    g.fillStyle = 'rgba(248,239,219,0.05)';
    g.fillRect(0, 0, WORLD_W, WORLD_H);
    g.restore();
  }

  const oldBuildMap = buildMap;
  buildMap = function(stage) {
    oldBuildMap(stage);
    if (A18.ready) paintWatercolorMap();
  };

  Promise.all(Object.entries(files).map(([key, src]) => load(key, src))).then(() => {
    A18.ready = true;
    applyCharacters();
    if (typeof ctx !== 'undefined') ctx.imageSmoothingEnabled = true;
    if (typeof G !== 'undefined') buildMap(G.stage || 1);
  });
})();
