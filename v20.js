/* GEKOKUJO OFFLINE v20
   Fixes gameplay background: no full-scene stretching. Keeps v18 illustrated characters.
   The generated background art is no longer stretched across the whole scrollable map.
   Instead the procedural world is repainted into a watercolor/storybook style per stage. */
(() => {
  const A20 = { ready: false, imgs: {} };
  const files = {
    hunter: 'assets/player-hunter.webp?v=20',
    ronin: 'assets/player-ronin.webp?v=20',
    farmer: 'assets/player-farmer.webp?v=20',
    yamaotoko: 'assets/player-yamaotoko.webp?v=20',
    ashigaru: 'assets/enemy-ashigaru.webp?v=20',
    samurai: 'assets/enemy-samurai.webp?v=20',
    ninja: 'assets/enemy-ninja.webp?v=20',
    tsuji: 'assets/enemy-tsuji.webp?v=20',
    daikan: 'assets/enemy-daikan.webp?v=20'
  };

  const load = (key, src) => new Promise(resolve => {
    const img = new Image();
    img.onload = () => { A20.imgs[key] = img; resolve(); };
    img.onerror = () => { console.warn('[v20] asset failed:', src); resolve(); };
    img.src = src;
  });

  const art = (key, baseH, yOff = 3) => ({ art20: true, key, frames: 3, baseH, yOff });

  const oldDrawSpr = drawSpr;
  drawSpr = function(spr, x, y, face, scale, rot, alpha) {
    if (!spr || !spr.art20) return oldDrawSpr(spr, x, y, face, scale, rot, alpha);
    const img = A20.imgs[spr.key];
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
    if (!spr || !spr.art20) return oldDrawHuman(spr, x, y, face, anim, moving, flash, scale);
    const img = A20.imgs[spr.key];
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
    if (!A20.ready) return;
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

  function ensureCharacters() {
    if (!A20.ready) return;
    if (!SPR.hunter?.art20 || !SPR.ronin?.art20 || !SPR.farmer?.art20 || !SPR.yamaotoko?.art20) applyCharacters();
  }

  const palettes = [
    null,
    { grass:'#aab486', path:'#d8bd8d', field:'#9cad76', water:'#86afbb', bridge:'#9b7551', wash:'rgba(245,235,210,.12)' },
    { grass:'#758c70', path:'#c6ad83', field:'#7f9877', water:'#759ca5', bridge:'#85694f', wash:'rgba(214,227,204,.10)' },
    { grass:'#9a9b7d', path:'#cbb48f', field:'#a7a27f', water:'#849ba8', bridge:'#856b55', wash:'rgba(231,219,196,.12)' },
    { grass:'#d8e0de', path:'#d7d1c6', field:'#c9d2cb', water:'#94b4c8', bridge:'#8e8175', wash:'rgba(232,243,249,.16)' },
    { grass:'#777668', path:'#9b8a72', field:'#848274', water:'#6f8491', bridge:'#67594d', wash:'rgba(107,91,74,.10)' }
  ];

  function seededNoise(stage) {
    let s = (stage * 2654435761) >>> 0;
    return () => {
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
      return ((s >>> 0) / 4294967296);
    };
  }

  function repaintWatercolorMap(stage) {
    if (!mapCanvas) return;
    const p = palettes[((stage - 1) % 5) + 1];
    const rnd = seededNoise(stage);
    const g = mapCanvas.getContext('2d');

    g.save();
    g.clearRect(0, 0, WORLD_W, WORLD_H);
    g.imageSmoothingEnabled = true;

    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      const t = tiles[y][x], px = x * TS, py = y * TS;
      let base = p.grass;
      if (t === 1) base = p.path;
      else if (t === 2) base = p.field;
      else if (t === 3) base = p.water;
      else if (t === 4) base = p.bridge;
      g.fillStyle = base;
      g.fillRect(px, py, TS, TS);

      for (let i = 0; i < 3; i++) {
        const a = 0.025 + rnd() * 0.05;
        g.fillStyle = `rgba(${rnd() > .5 ? 255 : 70},${rnd() > .5 ? 255 : 70},${rnd() > .5 ? 255 : 70},${a})`;
        g.beginPath();
        g.ellipse(px + rnd() * TS, py + rnd() * TS, 3 + rnd() * 6, 2 + rnd() * 5, rnd() * 2, 0, Math.PI * 2);
        g.fill();
      }

      if (t === 3) {
        g.strokeStyle = 'rgba(240,248,250,.28)';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(px + 2, py + 5 + rnd() * 5);
        g.quadraticCurveTo(px + 8, py + 3 + rnd() * 7, px + 14, py + 6 + rnd() * 5);
        g.stroke();
      }
      if (t === 2) {
        g.strokeStyle = 'rgba(72,82,54,.22)';
        g.lineWidth = .7;
        for (let k = 3; k < TS; k += 5) {
          g.beginPath(); g.moveTo(px + 1, py + k); g.lineTo(px + 15, py + k - 1); g.stroke();
        }
      }
    }

    g.globalCompositeOperation = 'multiply';
    for (let i = 0; i < 90; i++) {
      g.fillStyle = `rgba(78,72,53,${0.006 + rnd() * 0.014})`;
      g.beginPath();
      g.ellipse(rnd() * WORLD_W, rnd() * WORLD_H, 14 + rnd() * 34, 8 + rnd() * 26, rnd() * Math.PI, 0, Math.PI * 2);
      g.fill();
    }
    g.globalCompositeOperation = 'source-over';

    for (const o of obstacles) {
      const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
      if (o.w >= 28) {
        g.fillStyle = 'rgba(226,211,181,.88)'; g.fillRect(o.x + 2, o.y + 4, o.w - 4, o.h - 5);
        g.fillStyle = 'rgba(102,76,52,.88)';
        g.beginPath(); g.moveTo(o.x, o.y + 7); g.lineTo(cx, o.y - 4); g.lineTo(o.x + o.w, o.y + 7); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(57,45,34,.55)'; g.stroke();
      } else if (o.w >= 12) {
        g.fillStyle = 'rgba(111,111,105,.72)';
        g.beginPath(); g.ellipse(cx, cy, Math.max(4,o.w/2), Math.max(3,o.h/2), -.15, 0, Math.PI*2); g.fill();
      } else {
        g.fillStyle = 'rgba(91,70,45,.78)'; g.fillRect(cx - 2, o.y + o.h * .45, 4, o.h * .55);
        g.fillStyle = stage === 4 ? 'rgba(186,199,197,.82)' : 'rgba(88,116,79,.82)';
        g.beginPath(); g.arc(cx, o.y + o.h * .35, Math.max(5,o.w*.55), 0, Math.PI*2); g.fill();
      }
    }

    g.fillStyle = p.wash;
    g.fillRect(0, 0, WORLD_W, WORLD_H);
    for (let i = 0; i < 1400; i++) {
      const a = 0.018 + rnd() * 0.025;
      g.fillStyle = `rgba(60,48,35,${a})`;
      g.fillRect((rnd()*WORLD_W)|0, (rnd()*WORLD_H)|0, 1, 1);
    }

    g.restore();
  }

  const oldBuildMap = buildMap;
  buildMap = function(stage) {
    oldBuildMap(stage);
    ensureCharacters();
    repaintWatercolorMap(stage);
  };

  const oldDraw = draw;
  draw = function() {
    ensureCharacters();
    oldDraw();
  };

  Promise.all(Object.entries(files).map(([key, src]) => load(key, src))).then(() => {
    A20.ready = true;
    applyCharacters();
    if (typeof ctx !== 'undefined') ctx.imageSmoothingEnabled = true;
    setTimeout(applyCharacters, 0);
    setTimeout(applyCharacters, 300);
    setTimeout(applyCharacters, 1200);
    if (document.fonts?.ready) document.fonts.ready.then(() => setTimeout(applyCharacters, 0));
    if (typeof G !== 'undefined') buildMap(G.stage || 1);
  });
})();
