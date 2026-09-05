(() => {
  const bodyFont = (size) => `400 ${size}px "Yomogi", "Kiwi Maru", "Hiragino Sans", "Yu Gothic", sans-serif`;
  const titleFont = (size) => `400 ${size}px "Yomogi", "Yuji Syuku", "Hiragino Mincho ProN", serif`;

  txt = function(s, x, y, size, color, align, outline) {
    ctx.save();
    ctx.font = bodyFont(size);
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'top';
    if (outline !== false) {
      ctx.lineWidth = Math.max(1, size / 10);
      ctx.strokeStyle = 'rgba(0,0,0,0.30)';
      ctx.lineJoin = 'round';
      ctx.strokeText(s, x, y);
    }
    ctx.fillStyle = color || '#fff';
    ctx.fillText(s, x, y);
    ctx.restore();
  };

  button = function(label, x, y, w, h, selected) {
    ctx.fillStyle = selected ? '#2f281d' : '#f7f1e6';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#2b241a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5);
    ctx.save();
    ctx.font = bodyFont(12);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = selected ? '#f5df7a' : '#2b241a';
    ctx.fillText(label, x + w / 2, y + h / 2 + 0.5);
    ctx.restore();
  };

  drawTitle = function() {
    drawPaperBg();
    ctx.save();
    ctx.fillStyle = '#16120d';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = titleFont(15);
    ctx.fillText('成り上がれ　下剋上を…', W / 2, 60);
    ctx.font = titleFont(56);
    ctx.fillText('下剋上', W / 2, 145);
    ctx.font = titleFont(26);
    ctx.fillText('オンライン', W / 2, 202);
    ctx.font = '400 10px "Kiwi Maru", "Hiragino Sans", sans-serif';
    ctx.fillText('GEKOKUJO ONLINE', W / 2, 222);
    ctx.restore();

    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 76); ctx.lineTo(W - 40, 76);
    ctx.moveTo(30, 234); ctx.lineTo(W - 30, 234);
    ctx.stroke();

    const bob = Math.floor(G.frame / 14) % 2;
    drawSpr(SPR.hunter, W / 2 - 54, 286 - bob, 1, 2.15);
    drawSpr(SPR.farmer, W / 2, 288 - (1 - bob), 1, 2.15);
    drawSpr(SPR.ronin, W / 2 + 54, 286 - bob, 1, 2.15);

    button('はじめる', W / 2 - 54, 320, 108, 30, G.sel === 0);
    button('遊び方', 36, 388, 88, 24, G.sel === 1);
    button('ランキング', W - 124, 388, 88, 24, G.sel === 2);
    txt(isTouch ? 'タップで決定 / 縦持ち推奨' : 'Enter / Space で決定', W / 2, 442, 9, '#5d564d', 'center', false);
  };

  drawHowto = function() {
    drawPaperBg();
    txt('遊び方', W / 2, 14, 22, '#111', 'center', false);
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
    lines.forEach((l, i) => txt(l, 14, 50 + i * 28, 12, '#1f1a15', 'left', false));
    [['waraji', 30], ['onigiri', 82], ['kama', 134], ['akakama', 186], ['omamori', 238]].forEach(([k, x]) => drawSpr(SPR[k], x, 354, 1, 2));
    txt('草鞋   おにぎり   白鎌   赤鎌   御守り', W / 2, 382, 10, '#3d372f', 'center', false);
    button('もどる', W / 2 - 50, 420, 100, 24, true);
  };

  drawRanking = function() {
    drawPaperBg();
    txt('ランキング TOP10', W / 2, 14, 21, '#111', 'center', false);
    if (G.ranking.length === 0) {
      txt('まだ記録がありません', W / 2, 210, 14, '#111', 'center', false);
    }
    G.ranking.forEach((r, i) => {
      const hl = G.result && r.date === G.result.date && r.score === G.result.score;
      const y = 46 + i * 34;
      ctx.fillStyle = hl ? '#2f281d' : (i % 2 ? '#f2ebdf' : '#fffdfa');
      ctx.fillRect(10, y, W - 20, 30);
      ctx.strokeStyle = '#2b241a';
      ctx.lineWidth = 1;
      ctx.strokeRect(10.5, y + 0.5, W - 21, 29);
      txt((i + 1) + '位', 18, y + 8, 11, hl ? '#f5df7a' : '#111', 'left', false);
      txt(String(r.score), 56, y + 8, 11, hl ? '#f5df7a' : '#111', 'left', false);
      txt('C' + r.combo, 132, y + 8, 10, hl ? '#ddd8cf' : '#555', 'left', false);
      txt(rankOf(r.score), W - 16, y + 8, 10, hl ? '#f5df7a' : '#111', 'right', false);
    });
    button('もどる', W / 2 - 50, 420, 100, 24, true);
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (typeof draw === 'function') draw();
    });
  }
})();