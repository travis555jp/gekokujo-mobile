/* GEKOKUJO gameplay tuning v22
   - bridge width x2
   - stronger character differentiation + unique attacks
   - blank attack button
   - white/red upgrades to Lv6
   - clearer Daikan attacks
   Keeps v18 illustrated character art and v20 watercolor map. */
(() => {
  'use strict';

  const POWER_MAX = 6;
  const HAND_MAX = 6;

  const atkEl22 = document.getElementById('atk');
  if (atkEl22) {
    atkEl22.textContent = '';
    atkEl22.setAttribute('aria-label', '攻撃');
    atkEl22.style.background = 'rgba(96,55,45,.48)';
    atkEl22.style.boxShadow = 'inset 0 0 0 2px rgba(255,255,255,.12), 0 2px 8px rgba(0,0,0,.22)';
  }

  const charTuning = {
    farmer: { hp: 7, spd: 1.42, cd: 16, dmg: 1, attack22: 'fan', desc: ['広い扇状攻撃で安定', 'HP 7 / 範囲 広 / 連射 中'] },
    hunter: { hp: 4, spd: 1.80, cd: 10, dmg: 1, attack22: 'pierce', desc: ['高速の貫通射撃', 'HP 4 / 速さ 高 / 連射 最高'] },
    yamaotoko: { hp: 8, spd: 1.15, cd: 25, dmg: 3, attack22: 'smash', desc: ['近距離の重い衝撃波', 'HP 8 / 速さ 低 / 威力 最高'] },
    ronin: { hp: 5, spd: 1.55, cd: 18, dmg: 2, attack22: 'slash', desc: ['前方を薙ぐ連続斬撃', 'HP 5 / 貫通 / 威力 高'] }
  };
  for (const c of CHARS) Object.assign(c, charTuning[c.id] || {});

  ITEM_NAME.kama = '白強化！手数UP';
  ITEM_NAME.akakama = '赤強化！威力UP';

  const buildMapBefore22 = buildMap;
  function widenAndPaintBridges22() {
    const originals = [];
    for (let y = 0; y < MH; y++) {
      for (let x = 0; x < MW; x++) if (tiles[y][x] === 4) originals.push([x, y]);
    }
    if (!originals.length) return;

    const added = [];
    for (const [x, y] of originals) {
      let yy = y + 1;
      if (yy >= MH || tiles[yy][x] !== 3) yy = y - 1;
      if (yy >= 0 && yy < MH && tiles[yy][x] === 3) {
        tiles[yy][x] = 4;
        added.push([x, yy]);
      }
    }

    if (mapCanvas) {
      const g = mapCanvas.getContext('2d');
      g.save();
      g.imageSmoothingEnabled = true;
      const all = originals.concat(added);
      for (const [x, y] of all) {
        const px = x * TS, py = y * TS;
        g.fillStyle = 'rgba(151,113,76,.92)';
        g.fillRect(px, py, TS, TS);
        g.fillStyle = 'rgba(224,193,143,.18)';
        g.fillRect(px + 1, py + 1, TS - 2, 3);
        g.strokeStyle = 'rgba(79,54,35,.62)';
        g.lineWidth = 0.8;
        for (let yy = 3; yy < TS; yy += 4) {
          g.beginPath();
          g.moveTo(px + 1, py + yy);
          g.lineTo(px + TS - 1, py + yy - 0.5);
          g.stroke();
        }
        g.strokeStyle = 'rgba(57,41,29,.72)';
        g.strokeRect(px + 0.5, py + 0.5, TS - 1, TS - 1);
      }
      g.restore();
    }
  }
  buildMap = function(stage) {
    buildMapBefore22(stage);
    widenAndPaintBridges22();
  };

  const originalScythe22 = SPR.scythe;
  const originalScytheRed22 = SPR.scytheRed;

  function makeHunterBolt22(red) {
    const c = document.createElement('canvas');
    c.width = 14; c.height = 6;
    const g = c.getContext('2d');
    g.strokeStyle = 'rgba(255,255,255,.95)';
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(1, 3); g.lineTo(12, 3); g.stroke();
    g.fillStyle = red ? '#ff5b72' : '#74dfff';
    g.beginPath();
    g.moveTo(13, 3); g.lineTo(9, 0); g.lineTo(9, 6); g.closePath(); g.fill();
    g.fillStyle = red ? '#ffb0ba' : '#dffaff';
    g.fillRect(2, 2, 8, 2);
    return c;
  }
  const hunterBolt22 = makeHunterBolt22(false);
  const hunterBoltRed22 = makeHunterBolt22(true);

  function nearestAim22(p) {
    let tx = null, ty = null, best = Infinity;
    const cand = (x, y) => {
      const d = Math.hypot(x - p.x, y - p.y);
      if (d < best) { best = d; tx = x; ty = y; }
    };
    for (const e of G.enemies) if (!e.dead) cand(e.x, e.y);
    if (G.boss && G.boss.state !== 'enter' && G.boss.state !== 'dead') cand(G.boss.x, G.boss.y);
    if (G.tsuji && G.tsuji.phase === 'dash') cand(G.tsuji.x, G.tsuji.y);
    return tx === null ? (p.face > 0 ? 0 : Math.PI) : Math.atan2(ty - p.y, tx - p.x);
  }

  function spread22(count, step) {
    if (count <= 1) return [0];
    const out = [];
    const center = (count - 1) / 2;
    for (let i = 0; i < count; i++) out.push((i - center) * step);
    return out;
  }

  fire = function() {
    const p = G.p;
    const c = G.chr;
    p.cd = Math.round(c.cd * (G.mode ? 0.55 : 1));
    SFX.play('attack');

    const base = nearestAim22(p);
    const hand = Math.max(1, Math.min(HAND_MAX, p.scythes || 1));
    const dmg = Math.max(1, (p.power || 1) + c.dmg - 1);
    const red = (p.power || 1) > 1;

    if (c.attack22 === 'pierce') {
      const count = Math.min(3, 1 + Math.floor((hand - 1) / 2));
      for (const o of spread22(count, 0.09)) {
        const a = base + o;
        G.scythes.push({ x: p.x, y: p.y, vx: Math.cos(a) * 6.4, vy: Math.sin(a) * 6.4, life: 72, rot: a, pierce: true, dmg, hits: new Set(), red, r: 8, v22Kind: 'hunter' });
      }
      return;
    }

    if (c.attack22 === 'smash') {
      const count = Math.min(3, 1 + Math.floor((hand - 1) / 2));
      for (const o of spread22(count, 0.34)) {
        const a = base + o;
        G.scythes.push({ x: p.x, y: p.y, vx: Math.cos(a) * 2.25, vy: Math.sin(a) * 2.25, life: G.mode ? 24 : 18, rot: a, pierce: true, dmg: dmg + 1, hits: new Set(), red, kind: 'slash', r: 24, v22Kind: 'smash' });
      }
      G.shake = Math.max(G.shake, 2.5);
      return;
    }

    if (c.attack22 === 'slash') {
      const count = Math.min(5, 1 + Math.floor((hand - 1) * 0.8));
      for (const o of spread22(count, 0.16)) {
        const a = base + o;
        G.scythes.push({ x: p.x, y: p.y, vx: Math.cos(a) * 3.6, vy: Math.sin(a) * 3.6, life: G.mode ? 27 : 20, rot: a, pierce: true, dmg, hits: new Set(), red, kind: 'slash', r: 18, v22Kind: 'ronin' });
      }
      return;
    }

    const count = hand;
    for (const o of spread22(count, count > 4 ? 0.15 : 0.18)) {
      const a = base + o;
      G.scythes.push({ x: p.x, y: p.y, vx: Math.cos(a) * 4.15, vy: Math.sin(a) * 4.15, life: 54, rot: 0, pierce: G.mode, dmg, hits: new Set(), red, r: 10, v22Kind: 'farmer' });
    }
  };

  const updateGameBefore22 = updateGame;
  function handleHighLevelPickups22() {
    const p = G.p;
    if (!p || !Array.isArray(G.items)) return;
    for (const it of G.items) {
      if (it.life <= 0 || Math.hypot(it.x - p.x, it.y - p.y) >= 11) continue;

      if (it.type === 'kama' && p.scythes >= 3) {
        it.life = 0;
        SFX.play('item');
        if (p.scythes < HAND_MAX) {
          p.scythes++;
          popup(p.x, p.y - 16, '手数 Lv' + p.scythes + '！', '#bffaff', 10);
        } else {
          G.score += 750;
          popup(p.x, p.y - 16, '手数MAX +750', '#ffe080', 9);
        }
        burst(it.x, it.y, '#bffaff', 8, 2);
      } else if (it.type === 'akakama' && p.power >= 3) {
        it.life = 0;
        SFX.play('item');
        if (p.power < POWER_MAX) {
          p.power++;
          popup(p.x, p.y - 16, '威力 Lv' + p.power + '！', '#ff9a9a', 10);
        } else {
          G.score += 750;
          popup(p.x, p.y - 16, '威力MAX +750', '#ffe080', 9);
        }
        burst(it.x, it.y, '#ff9a9a', 8, 2);
      }
    }
  }
  updateGame = function() {
    handleHighLevelPickups22();
    updateGameBefore22();
  };

  function makeBossBullet22() {
    const c = document.createElement('canvas');
    c.width = 12; c.height = 12;
    const g = c.getContext('2d');
    g.fillStyle = 'rgba(255,255,255,.98)';
    g.beginPath(); g.arc(6, 6, 5.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#e400ff';
    g.beginPath(); g.arc(6, 6, 4, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffef55';
    g.beginPath(); g.arc(6, 6, 1.7, 0, Math.PI * 2); g.fill();
    return c;
  }
  SPR.bullet = makeBossBullet22();

  const drawBefore22 = draw;
  draw = function() {
    const oldS = SPR.scythe, oldR = SPR.scytheRed;
    if (G?.chr?.attack22 === 'pierce') {
      SPR.scythe = hunterBolt22;
      SPR.scytheRed = hunterBoltRed22;
    } else {
      SPR.scythe = originalScythe22;
      SPR.scytheRed = originalScytheRed22;
    }

    drawBefore22();

    SPR.scythe = oldS;
    SPR.scytheRed = oldR;

    if (G.state !== 'playing' && G.state !== 'clear') return;

    ctx.save();

    for (const q of G.ebullets || []) {
      if (q.kind !== 'bullet') continue;
      const sx = q.x - (G.camX || 0);
      const sy = q.y - (G.camY || 0);
      ctx.strokeStyle = 'rgba(255,255,255,.92)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(sx - q.vx * 3, sy - q.vy * 3);
      ctx.lineTo(sx, sy);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(228,0,255,.72)';
      ctx.lineWidth = 4.6;
      ctx.beginPath();
      ctx.arc(sx, sy, 6.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    const b = G.boss;
    if (b && b.state === 'charge') {
      const sx = b.x - (G.camX || 0);
      const sy = b.y - (G.camY || 0);
      const pulse = 24 + Math.sin(G.frame * 0.45) * 5;
      ctx.strokeStyle = 'rgba(255,255,255,.95)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(sx, sy, pulse + 3, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(235,0,255,.90)';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(sx, sy, pulse, 0, Math.PI * 2); ctx.stroke();

      const p = G.p;
      if (p) {
        const px = p.x - (G.camX || 0), py = p.y - (G.camY || 0);
        ctx.setLineDash([7, 5]);
        ctx.strokeStyle = 'rgba(255,60,90,.88)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(px, py); ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    if (G?.chr?.attack22 === 'smash') {
      for (const s of G.scythes || []) {
        if (s.v22Kind !== 'smash') continue;
        const sx = s.x - (G.camX || 0), sy = s.y - (G.camY || 0);
        ctx.strokeStyle = s.red ? 'rgba(255,80,70,.72)' : 'rgba(255,220,130,.70)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(8, s.r * 0.7), -0.9, 0.9);
        ctx.stroke();
      }
    }

    ctx.restore();
  };

  drawHowto = function() {
    drawPaperBg();
    txt('遊び方', W / 2, 14, 23, '#201810', 'center', false);
    const lines = [
      '移動: 矢印 / WASD / 左スティック',
      '攻撃: Space / 右ボタン長押し',
      '攻撃方法はキャラごとに違う',
      '農民=扇状 / 猟師=貫通射撃',
      '山男=衝撃波 / 浪人=連続斬撃',
      'COMBOでスコア倍率アップ',
      'ゲージMAXで下剋上モード',
      '一定数倒すと代官が出現',
      '白強化=手数UP（最大Lv6）',
      '赤強化=威力UP（最大Lv6）'
    ];
    lines.forEach((l, i) => txt(l, 14, 50 + i * 28, 11, '#2b241b', 'left', false));
    [['waraji', 30], ['onigiri', 82], ['kama', 134], ['akakama', 186], ['omamori', 238]].forEach(([k, x]) => drawSpr(SPR[k], x, 354, 1, 2));
    txt('草鞋   おにぎり   白強化   赤強化   御守り', W / 2, 382, 9, '#43392f', 'center', false);
    button('もどる', W / 2 - 50, 420, 100, 24, true);
  };

  setTimeout(() => {
    try { if (typeof G !== 'undefined') buildMap(G.stage || 1); } catch (e) {}
  }, 80);
})();
