/* GEKOKUJO boss patterns v26
   Stage-specific Daikan behavior:
   ST1 basic / ST2 bullet storm / ST3 summoner / ST4 charge / ST5 mixed combo.
   Patterns repeat every five stages while the core difficulty continues scaling.
*/
(() => {
  'use strict';

  const patternNames26 = {
    1: '基本型',
    2: '弾幕型',
    3: '召喚型',
    4: '突進型',
    5: '総合型'
  };

  const pattern26 = () => (((G.stage || 1) - 1) % 5) + 1;

  function addBossBullet26(b, angle, speed = 2.2, life = 170, tag = '') {
    G.ebullets.push({
      x: b.x,
      y: b.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      kind: 'bullet',
      v26Kind: tag
    });
  }

  function aimAngle26(b) {
    if (!G.p) return 0;
    return Math.atan2(G.p.y - b.y, G.p.x - b.x);
  }

  function fireRing26(b, n, speed, offset = 0, tag = 'ring') {
    for (let i = 0; i < n; i++) {
      const a = offset + (Math.PI * 2 * i / n);
      addBossBullet26(b, a, speed, 180, tag);
    }
    SFX.play('attack');
  }

  function fireWave26(b, n, spread, speed, bias = 0, tag = 'wave') {
    const base = aimAngle26(b) + bias;
    for (let i = 0; i < n; i++) {
      const o = (i - (n - 1) / 2) * spread;
      addBossBullet26(b, base + o, speed, 180, tag);
    }
    SFX.play('attack');
  }

  function extraSummon26(b, count, enraged) {
    const types = enraged ? ['ninja', 'samurai', 'ashigaru'] : ['ashigaru', 'ninja'];
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i / count) + 0.35;
      const type = types[i % types.length];
      spawnEnemy(type, b.x + Math.cos(a) * 34, b.y + Math.sin(a) * 34);
    }
    popup(b.x, b.y - 27, enraged ? '精鋭、出あえ！' : '囲め！', '#ffcf62', 9);
  }

  const spawnBossBefore26 = spawnBoss;
  spawnBoss = function() {
    spawnBossBefore26();
    const b = G.boss;
    if (!b) return;
    b.v26Pattern = pattern26();
    b.v26LastState = b.state;
    b.v26DashLeft = 0;
    b.v26Stage2Phase = 0;
    b.v26Stage3Wave = 0;
    b.v26Combo = 0;
    b.v26Trail = [];
    const label = patternNames26[b.v26Pattern] || '基本型';
    G.msg = { text: '代官・' + label + '！', t: 120, size: 18, color: '#ffd86a' };
  };

  const updateGameBefore26 = updateGame;
  updateGame = function() {
    const beforeBoss = G.boss;
    const beforeState = beforeBoss ? beforeBoss.state : null;

    updateGameBefore26();

    const b = G.boss;
    if (!b || b.state === 'dead' || b.state === 'enter') return;

    const pat = b.v26Pattern || pattern26();
    b.v26Pattern = pat;
    if (!Array.isArray(b.v26Trail)) b.v26Trail = [];

    if (pat === 1) {
      b.v26LastState = b.state;
      return;
    }

    if (pat === 2) {
      if (beforeState !== 'fan' && b.state === 'fan') {
        b.v26Stage2Phase = 0;
        popup(b.x, b.y - 28, '弾幕！', '#f3a6ff', 10);
        fireRing26(b, b.enraged ? 12 : 10, b.enraged ? 2.25 : 1.9, G.frame * 0.035, 'stage2-ring');
      }
      if (b.state === 'fan' && b.t === 11 && b.v26Stage2Phase < 1) {
        b.v26Stage2Phase = 1;
        fireWave26(b, b.enraged ? 9 : 7, 0.16, b.enraged ? 2.75 : 2.45, 0.08, 'stage2-wave');
      }
    }

    if (pat === 3) {
      if (beforeState !== 'summon' && b.state === 'summon') {
        b.v26Stage3Wave = 0;
        popup(b.x, b.y - 28, '兵を集めよ！', '#ffd86a', 9);
      }
      if (b.state === 'summon' && b.t === 9 && b.v26Stage3Wave < 1) {
        b.v26Stage3Wave = 1;
        extraSummon26(b, b.enraged ? 3 : 2, b.enraged);
        fireWave26(b, b.enraged ? 5 : 3, 0.22, 2.1, 0, 'stage3-cover');
      }
    }

    if (pat === 4) {
      if (beforeState !== 'charge' && b.state === 'charge') {
        b.t = Math.max(b.t, 50);
        b.v26DashLeft = b.enraged ? 2 : 1;
        popup(b.x, b.y - 28, '突進！', '#ff6b6b', 10);
      }
      if (beforeState === 'charge' && b.state === 'dash') {
        const mult = b.enraged ? 1.28 : 1.18;
        b.vx *= mult;
        b.vy *= mult;
        b.t = Math.max(b.t, 44);
      }
      if (b.state === 'dash') {
        if (G.frame % 3 === 0) {
          b.v26Trail.push({ x: b.x, y: b.y, life: 22 });
          if (b.v26Trail.length > 18) b.v26Trail.shift();
        }
      }
      for (const tr of b.v26Trail) tr.life--;
      b.v26Trail = b.v26Trail.filter(tr => tr.life > 0);

      if (beforeState === 'dash' && b.state === 'move' && b.v26DashLeft > 0) {
        b.v26DashLeft--;
        const a = aimAngle26(b);
        const sp = b.enraged ? 6.15 : 5.2;
        b.state = 'dash';
        b.vx = Math.cos(a) * sp;
        b.vy = Math.sin(a) * sp;
        b.t = 34;
        b.face = Math.cos(a) >= 0 ? 1 : -1;
        popup(b.x, b.y - 26, b.v26DashLeft > 0 ? 'まだだ！' : 'もう一撃！', '#ff7a7a', 9);
      }
    }

    if (pat === 5) {
      if (beforeState !== b.state && b.state === 'summon') {
        b.v26Combo = 1;
        popup(b.x, b.y - 28, '総攻撃！', '#ffdf69', 10);
      }
      if (beforeState === 'summon' && b.state === 'move' && b.v26Combo === 1) {
        b.state = 'fan';
        b.t = 34;
        b.v26Combo = 2;
        fireRing26(b, b.enraged ? 10 : 8, 1.75, G.frame * 0.025, 'stage5-ring');
      } else if (beforeState !== 'fan' && b.state === 'fan' && b.v26Combo === 0) {
        b.v26Combo = 2;
      }
      if (beforeState === 'fan' && b.state === 'move' && b.v26Combo === 2) {
        b.state = 'charge';
        b.t = 46;
        b.v26Combo = 3;
        popup(b.x, b.y - 28, '続けて突進！', '#ff7777', 9);
      }
      if (beforeState === 'dash' && b.state === 'move' && b.v26Combo === 3) {
        b.v26Combo = 0;
        b.cd = b.enraged ? 72 : 105;
      }
    }

    b.v26LastState = b.state;
    b.v26LastT = b.t;
  };

  const drawBefore26 = draw;
  draw = function() {
    drawBefore26();
    if (G.state !== 'playing' && G.state !== 'clear') return;

    const b = G.boss;
    if (!b || b.state === 'dead' || b.state === 'enter') return;
    const pat = b.v26Pattern || pattern26();

    ctx.save();
    const bx = b.x - (G.camX || 0);
    const by = b.y - (G.camY || 0);

    if (pat === 2 && b.state === 'fan') {
      const pulse = 23 + Math.sin(G.frame * 0.35) * 3;
      ctx.strokeStyle = 'rgba(236,87,255,.70)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(bx, by, pulse, 0, Math.PI * 2); ctx.stroke();
    }

    if (pat === 3 && b.state === 'summon') {
      ctx.strokeStyle = 'rgba(255,210,92,.72)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.arc(bx, by, 27 + Math.sin(G.frame * .25) * 4, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    }

    if (pat === 4 && Array.isArray(b.v26Trail)) {
      for (const tr of b.v26Trail) {
        const a = Math.max(0, tr.life / 22) * 0.45;
        ctx.fillStyle = `rgba(255,70,70,${a})`;
        ctx.beginPath();
        ctx.arc(tr.x - (G.camX || 0), tr.y - (G.camY || 0), 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (pat === 5 && b.v26Combo > 0) {
      ctx.strokeStyle = 'rgba(255,221,100,.82)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(bx, by, 24 + Math.sin(G.frame * .3) * 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.font = '9px "Yomogi", "Hiragino Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(255,244,218,.92)';
    ctx.fillText(patternNames26[pat] || '基本型', W - 18, H - 31);

    ctx.restore();
  };
})();
