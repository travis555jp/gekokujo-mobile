function drawHUD() {
  const p = G.p;
  ctx.fillStyle = G.mode ? 'rgba(80,20,0,0.68)' : 'rgba(0,0,0,0.58)'; ctx.fillRect(0, 0, W, 36);
  for (let i = 0; i < p.maxHp; i++) ctx.drawImage(i < p.hp ? SPR.heart : SPR.heartOff, 6 + i * 9, 4);
  txt('SCORE ' + String(G.score).padStart(7, '0'), 6, 16, 9, '#fff');
  txt('ST' + G.stage + ' ' + fmtTime(G.time), W - 6, 4, 9, '#ddd', 'right');
  const gx = 92, gw = 88;
  ctx.fillStyle = '#222'; ctx.fillRect(gx, 8, gw, 6); ctx.strokeStyle = '#888'; ctx.lineWidth = 1; ctx.strokeRect(gx + 0.5, 8.5, gw - 1, 5);
  const gv = G.mode ? G.modeTimer / 480 : G.gauge / 100;
  ctx.fillStyle = G.mode ? (G.frame % 6 < 3 ? '#ffe040' : '#ff8020') : G.gauge > 70 ? '#ffb020' : '#e05030';
  ctx.fillRect(gx + 1, 9, Math.round((gw - 2) * gv), 4);
  txt('下剋上', gx + gw / 2, 16, 8, G.mode ? '#ffe040' : '#ddd', 'center');
  if (G.combo > 1) { const col = G.combo >= 50 ? '#ff60ff' : G.combo >= 10 ? '#ffe040' : '#fff'; txt(G.combo + 'C x' + comboMult().toFixed(1), W - 6, 16, 9, col, 'right'); }
  if (G.mode && G.modeBanner > 0) {
    const s = 26 + Math.sin(G.frame * 0.5) * 2;
    txt('下剋上！', W / 2 + (Math.random() - 0.5) * 3, H / 2 - 24, s, G.frame % 4 < 2 ? '#ffe040' : '#ff8020', 'center');
  }
  if (G.cmsg) txt(G.cmsg.text, W / 2, 42, G.cmsg.big ? 18 : 12, G.cmsg.big ? '#ff60ff' : '#ffe040', 'center');
  if (G.msg) { const a = Math.min(1, G.msg.t / 20); ctx.save(); ctx.globalAlpha = a; txt(G.msg.text, W / 2, 60, G.msg.size, G.msg.color, 'center'); ctx.restore(); }
  const b = G.boss;
  if (b && b.state !== 'dead' && b.state !== 'enter') {
    ctx.fillStyle = 'rgba(0,0,0,0.66)'; ctx.fillRect(24, H - 18, W - 48, 10);
    ctx.fillStyle = b.enraged ? '#ff3030' : '#c9a020'; ctx.fillRect(26, H - 16, Math.round((W - 52) * Math.max(0, b.hp) / b.maxHp), 6);
    txt('代官', 20, H - 21, 9, '#ffd040', 'left');
  }
  if (p.scythes > 1 || p.power > 1) txt('鎌x' + p.scythes + ' 威力' + p.power, W - 6, H - 32, 8, '#ccc', 'right');
}
function fmtTime(f) { const s = Math.floor(f / 60); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
function button(label, x, y, w, h, selected) {
  ctx.fillStyle = selected ? '#1f1a12' : '#f5f0e6'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  txt(label, x + w / 2, y + h / 2 - 6, 11, selected ? '#ffe040' : '#111', 'center', false);
}
const MENU = [['START', 344], ['HOW TO PLAY', 384], ['RANKING', 424]];
function drawPaperBg() {
  ctx.fillStyle = '#f6f4ef'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.strokeRect(7, 7, W - 14, H - 14);
  ctx.lineWidth = 1;
  for (let i = 0; i < 14; i++) {
    const x = 12 + i * 18 + ((i % 2) ? 2 : -2);
    ctx.beginPath(); ctx.moveTo(x, 6); ctx.lineTo(x + (i % 3 - 1) * 2, 18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, H - 6); ctx.lineTo(x + ((i + 1) % 3 - 1) * 2, H - 18); ctx.stroke();
  }
}
function drawTitle() {
  drawPaperBg();
  ctx.fillStyle = '#111';
  ctx.font = 'bold 18px serif'; ctx.textAlign = 'center'; ctx.fillText('成り上がれ 下剋上を…', W / 2, 74);
  ctx.font = 'bold 58px serif'; ctx.fillText('下剋上', W / 2, 150);
  ctx.font = 'bold 20px serif'; ctx.fillText('オンライン', W / 2, 184);
  ctx.font = '10px "Courier New", monospace'; ctx.fillText('GEKOKUJO', W / 2, 200);
  const bob = Math.floor(G.frame / 14) % 2;
  drawSpr(SPR.hunter, W / 2 - 54, 284 - bob, 1, 2.2);
  drawSpr(SPR.farmer, W / 2, 286 - (1 - bob), 1, 2.2);
  drawSpr(SPR.ronin, W / 2 + 54, 284 - bob, 1, 2.2);
  button('START', W / 2 - 52, 318, 104, 28, G.sel === 0);
  button('遊び方', 36, 386, 88, 24, G.sel === 1);
  button('ランキング', W - 124, 386, 88, 24, G.sel === 2);
  txt(isTouch ? 'タップで決定 / 縦持ち推奨' : 'Enter / Space で決定', W / 2, 442, 8, '#555', 'center');
}
function drawSelect() {
  drawPaperBg();
  txt('キャラクター選択', W / 2, 18, 18, '#111', 'center');
  CHARS.forEach((c, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 14 + col * 128, y = 60 + row * 148, w = 114, h = 132, sel = G.charSel === i;
    ctx.fillStyle = sel ? '#1f1a12' : '#fffdfa'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    const bob = sel ? Math.floor(G.frame / 10) % 2 : 0;
    drawSpr(SPR[c.id], x + w / 2, y + 28 - bob, 1, 2.2);
    txt(c.name, x + w / 2, y + 56, 12, sel ? '#ffe040' : '#111', 'center');
    c.desc.forEach((d, j) => txt(d, x + w / 2, y + 74 + j * 12, 6, sel ? '#ddd' : '#555', 'center'));
    const bar = (label, v, max, yy) => { txt(label, x + 8, yy, 6, sel ? '#ccc' : '#666'); ctx.fillStyle = sel ? '#333' : '#ddd'; ctx.fillRect(x + 30, yy + 1, 72, 4); ctx.fillStyle = sel ? '#ffe040' : '#111'; ctx.fillRect(x + 30, yy + 1, Math.round(72 * v / max), 4); };
    bar('HP', c.hp, 8, y + 108); bar('速', c.spd, 1.8, y + 118);
  });
  button('このキャラで行く', W / 2 - 74, 414, 148, 28, true);
  txt(isTouch ? 'カードをタップして選択' : '矢印キーで選択', W / 2, 450, 8, '#555', 'center');
}
function drawHowto() {
  drawPaperBg();
  txt('遊び方', W / 2, 16, 20, '#111', 'center');
  const lines = [
    '移動: WASD / 矢印キー / 左スティック',
    '攻撃: Space / 右ボタン（押しっぱなし可）',
    '鎌は近い敵に自動で飛ぶ',
    '連続撃破でCOMBO → スコア倍率アップ',
    '倒し続けてゲージMAXで下剋上モード',
    '「！！」が出たら辻斬りが来る',
    '一定数倒すと代官が出現',
    '白い鎌: 手数UP / 赤鎌: 威力UP',
    '草鞋: 速度UP / おにぎり: 回復',
    '御守り: 一時無敵'
  ];
  lines.forEach((l, i) => txt(l, 18, 56 + i * 28, 9, '#111'));
  [['waraji', 30], ['onigiri', 82], ['kama', 134], ['akakama', 186], ['omamori', 238]].forEach(([k, x]) => drawSpr(SPR[k], x, 360, 1, 2));
  button('BACK', W / 2 - 50, 420, 100, 24, true);
}
function drawRanking() {
  drawPaperBg();
  txt('ランキング TOP10', W / 2, 14, 18, '#111', 'center');
  if (G.ranking.length === 0) txt('まだ記録がありません', W / 2, 210, 12, '#111', 'center');
  G.ranking.forEach((r, i) => {
    const hl = G.result && r.date === G.result.date && r.score === G.result.score;
    ctx.fillStyle = hl ? '#1f1a12' : (i % 2 ? '#f0ece2' : '#fffdfa'); ctx.fillRect(12, 48 + i * 34, W - 24, 28);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.strokeRect(12.5, 48.5 + i * 34, W - 25, 27);
    txt((i + 1) + '位', 20, 56 + i * 34, 8, hl ? '#ffe040' : '#111');
    txt(String(r.score), 58, 56 + i * 34, 9, hl ? '#ffe040' : '#111');
    txt('C' + r.combo + ' / K' + r.kills, 126, 56 + i * 34, 8, hl ? '#ddd' : '#555');
    txt(rankOf(r.score), W - 18, 56 + i * 34, 8, hl ? '#ffe040' : '#111', 'right');
  });
  button('BACK', W / 2 - 50, 420, 100, 24, true);
}
function drawGameOver() {
  const r = G.result, t = G.overT;
  ctx.fillStyle = `rgba(0,0,0,${Math.min(0.78, t / 60)})`; ctx.fillRect(0, 0, W, H);
  if (t < 20) return;
  txt('GAME OVER', W / 2, 54, 26, '#ff4040', 'center');
  const rows = [['SCORE', String(r.score)], ['最高コンボ', r.combo + ' COMBO'], ['撃破数', r.kills + ' 人'], ['プレイ時間', fmtTime(r.time * 60)], ['到達', 'STAGE ' + r.stage]];
  rows.forEach((row, i) => { if (t > 30 + i * 8) { txt(row[0], W / 2 - 8, 120 + i * 18, 9, '#ccc', 'right'); txt(row[1], W / 2 + 6, 120 + i * 18, 9, '#fff', 'left'); } });
  if (t > 80) {
    txt('推定順位 ' + r.est.toLocaleString() + '位', W / 2, 226, 10, '#fff', 'center');
    txt('称号 ' + r.rank, W / 2, 244, 14, t % 20 < 10 ? '#ffe040' : '#fff', 'center');
    if (r.place >= 0) txt(r.place === 0 ? 'この端末で NEW RECORD!!' : 'この端末で ' + (r.place + 1) + '位', W / 2, 268, 9, '#80ff80', 'center');
  }
  if (t > 100) { button('RETRY', 30, 380, 90, 28, true); button('TITLE', 150, 380, 90, 28, false); }
}
