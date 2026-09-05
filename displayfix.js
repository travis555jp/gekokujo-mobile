/* Handwritten UI + sumi-ink title + HiDPI fix */
(() => {
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  const nativeSetTransform = ctx.setTransform.bind(ctx);

  ctx.setTransform = function(a, b, c, d, e, f) {
    if (arguments.length === 6) {
      return nativeSetTransform(a * dpr, b * dpr, c * dpr, d * dpr, e * dpr, f * dpr);
    }
    return nativeSetTransform.apply(ctx, arguments);
  };

  function applyHiDPI() {
    const cssW = cv.style.width;
    const cssH = cv.style.height;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    if (cssW) cv.style.width = cssW;
    if (cssH) cv.style.height = cssH;
    ctx.imageSmoothingEnabled = false;
    nativeSetTransform(dpr, 0, 0, dpr, 0, 0);
  }
  applyHiDPI();
  addEventListener('orientationchange', () => setTimeout(applyHiDPI, 300));

  const uiFont = (size) => `${size}px "Yomogi", "Hiragino Sans", "Yu Gothic", sans-serif`;
  const titleFont = (size) => `${size}px "Yuji Boku", "Hiragino Mincho ProN", "Yu Mincho", serif`;

  function sumiText(s, x, y, size, angle = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = titleFont(size);

    const offsets = [
      [-1.2, 0.6, 'rgba(0,0,0,0.16)'],
      [0.8, -0.5, 'rgba(0,0,0,0.10)'],
      [0, 0, '#16110d'],
    ];
    for (const [dx, dy, color] of offsets) {
      ctx.fillStyle = color;
      ctx.fillText(s, dx, dy);
    }

    ctx.globalAlpha = 0.18;
    ctx.lineWidth = Math.max(1, size / 26);
    ctx.strokeStyle = '#221a14';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(-size * 1.25, i * 0.8);
      ctx.lineTo(size * 1.25, i * 0.5);
      ctx.stroke();
    }
    ctx.restore();
  }

  txt = function(s, x, y, size, color, align, outline) {
    ctx.save();
    ctx.font = uiFont(size);
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'top';
    if (outline !== false) {
      ctx.lineWidth = Math.max(1, size / 10);
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineJoin = 'round';
      ctx.strokeText(s, x, y);
    }
    ctx.fillStyle = color || '#2a221a';
    ctx.fillText(s, x, y);
    ctx.restore();
  };

  button = function(label, x, y, w, h, selected) {
    ctx.fillStyle = selected ? '#2c2419' : '#f8f1e5';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#3a2f24';
    ctx.lineWidth = 1.25;
    ctx.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5);
    ctx.save();
    ctx.font = uiFont(12);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = selected ? '#f8e090' : '#2b2319';
    ctx.fillText(label, x + w / 2, y + h / 2 + 0.5);
    ctx.restore();
  };

  drawTitle = function() {
    drawPaperBg();

    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0.10)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(34, 68); ctx.lineTo(W - 34, 68);
    ctx.moveTo(28, 242); ctx.lineTo(W - 28, 242);
    ctx.stroke();
    ctx.restore();

    txt('成り上がれ　下剋上を…', W / 2, 48, 12, '#4d443a', 'center', false);

    sumiText('下剋上', W / 2, 132, 62, -0.05);
    sumiText('オフライン', W / 2, 196, 30, 0.015);

    ctx.save();
    ctx.font = '10px "Yomogi", "Hiragino Sans", sans-serif';
    ctx.fillStyle = '#4d443a';
    ctx.textAlign = 'center';
    ctx.fillText('GEKOKUJO OFFLINE', W / 2, 218);
    ctx.restore();

    const bob = Math.floor(G.frame / 14) % 2;
    drawSpr(SPR.hunter, W / 2 - 54, 294 - bob, 1, 2.1);
    drawSpr(SPR.farmer, W / 2, 296 - (1 - bob), 1, 2.1);
    drawSpr(SPR.ronin, W / 2 + 54, 294 - bob, 1, 2.1);

    button('はじめる', W / 2 - 54, 326, 108, 30, G.sel === 0);
    button('遊び方', 36, 392, 88, 24, G.sel === 1);
    button('ランキング', W - 124, 392, 88, 24, G.sel === 2);
    txt(isTouch ? 'タップで決定 / 縦持ち推奨' : 'Enter / Space で決定', W / 2, 444, 9, '#5b5147', 'center', false);
  };

  drawHowto = function() {
    drawPaperBg();
    txt('遊び方', W / 2, 14, 23, '#201810', 'center', false);
    const lines = [
      '移動: 矢印 / WASD / 左スティック',
      '攻撃: Space / 右ボタン長押し',
      '鎌は近い敵を自動で狙う',
      'COMBOでスコア倍率アップ',
      'ゲージMAXで下剋上モード',
      '「！！」で辻斬り警告',
      '一定数倒すと代官が出現',
      '白鎌=手数UP / 赤鎌=威力UP',
      '草鞋=速度UP / おにぎり=回復',
      '御守り=一時無敵'
    ];
    lines.forEach((l, i) => txt(l, 14, 50 + i * 28, 12, '#2b241b', 'left', false));
    [['waraji', 30], ['onigiri', 82], ['kama', 134], ['akakama', 186], ['omamori', 238]].forEach(([k, x]) => drawSpr(SPR[k], x, 354, 1, 2));
    txt('草鞋   おにぎり   白鎌   赤鎌   御守り', W / 2, 382, 10, '#43392f', 'center', false);
    button('もどる', W / 2 - 50, 420, 100, 24, true);
  };

  drawRanking = function() {
    drawPaperBg();
    txt('ランキング TOP10', W / 2, 14, 22, '#201810', 'center', false);
    if (G.ranking.length === 0) txt('まだ記録がありません', W / 2, 210, 14, '#2b241b', 'center', false);
    G.ranking.forEach((r, i) => {
      const hl = G.result && r.date === G.result.date && r.score === G.result.score;
      const y = 46 + i * 34;
      ctx.fillStyle = hl ? '#2f281d' : (i % 2 ? '#f2ebdf' : '#fffdfa');
      ctx.fillRect(10, y, W - 20, 30);
      ctx.strokeStyle = '#3a2f24';
      ctx.lineWidth = 1;
      ctx.strokeRect(10.5, y + 0.5, W - 21, 29);
      txt((i + 1) + '位', 18, y + 8, 11, hl ? '#f7e29c' : '#201810', 'left', false);
      txt(String(r.score), 56, y + 8, 11, hl ? '#f7e29c' : '#201810', 'left', false);
      txt('C' + r.combo, 132, y + 8, 10, hl ? '#e8dcc6' : '#5c5145', 'left', false);
      txt(rankOf(r.score), W - 16, y + 8, 10, hl ? '#f7e29c' : '#201810', 'right', false);
    });
    button('もどる', W / 2 - 50, 420, 100, 24, true);
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      applyHiDPI();
      if (typeof draw === 'function') draw();
    });
  }
})();
