/* High-DPI rendering + readable Japanese UI/title fix */
(() => {
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  const nativeSetTransform = ctx.setTransform.bind(ctx);

  // Keep the game's logical 270x480 coordinate system while rendering at
  // the phone's physical pixel density. This makes canvas text much sharper.
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

  // Replace the tiny pixel-style font with iPhone/Japanese system fonts.
  txt = function(s, x, y, size, color, align, outline) {
    ctx.font = `700 ${size}px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'top';
    if (outline !== false) {
      ctx.lineWidth = Math.max(1.2, size / 7);
      ctx.strokeStyle = '#000';
      ctx.lineJoin = 'round';
      ctx.strokeText(s, x, y);
    }
    ctx.fillStyle = color || '#fff';
    ctx.fillText(s, x, y);
  };

  // Re-layout the title so 下剋上 and オンライン never overlap.
  drawTitle = function() {
    drawPaperBg();
    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    ctx.font = '700 14px "Hiragino Mincho ProN", "Yu Mincho", serif';
    ctx.fillText('成り上がれ 下剋上を…', W / 2, 62);

    ctx.font = '700 52px "Hiragino Mincho ProN", "Yu Mincho", serif';
    ctx.fillText('下剋上', W / 2, 142);

    ctx.font = '700 22px "Hiragino Mincho ProN", "Yu Mincho", serif';
    ctx.fillText('オンライン', W / 2, 188);

    ctx.font = '700 10px "Hiragino Sans", "Yu Gothic", sans-serif';
    ctx.fillText('GEKOKUJO ONLINE', W / 2, 207);

    const bob = Math.floor(G.frame / 14) % 2;
    drawSpr(SPR.hunter, W / 2 - 54, 282 - bob, 1, 2.2);
    drawSpr(SPR.farmer, W / 2, 284 - (1 - bob), 1, 2.2);
    drawSpr(SPR.ronin, W / 2 + 54, 282 - bob, 1, 2.2);

    button('START', W / 2 - 52, 318, 104, 28, G.sel === 0);
    button('遊び方', 36, 386, 88, 24, G.sel === 1);
    button('ランキング', W - 124, 386, 88, 24, G.sel === 2);
    txt(isTouch ? 'タップで決定 / 縦持ち推奨' : 'Enter / Space で決定', W / 2, 442, 8, '#555', 'center', false);
  };
})();
