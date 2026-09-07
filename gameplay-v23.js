/* GEKOKUJO gameplay patch v23
   Fixes white/red power-up progression when the player moves into an item on the same frame.
   v22's pre-update pickup hook can miss that case because the core update moves the player first. */
(() => {
  'use strict';

  const MAX_HAND = 6;
  const MAX_POWER = 6;
  const prevUpdateGame23 = updateGame;

  updateGame = function() {
    const p = G.p;
    if (!p || !Array.isArray(G.items)) return prevUpdateGame23();

    const beforeHand = p.scythes || 1;
    const beforePower = p.power || 1;
    const beforeItems = G.items.map(it => ({
      ref: it,
      type: it.type,
      x: it.x,
      y: it.y,
      life: it.life
    }));

    prevUpdateGame23();

    // If v22 already consumed the item, it has handled the high-level upgrade correctly.
    // Otherwise, detect items consumed by the core after movement and compensate for the old Lv3 cap.
    for (const snap of beforeItems) {
      const it = snap.ref;
      if (it.v22Consumed) continue;
      if (snap.life <= 0) continue;
      if (it.type !== 'kama' && it.type !== 'akakama') continue;

      const stillExists = G.items.includes(it) && it.life > 0;
      if (stillExists) continue;

      // The core awards +500 once its old Lv3 cap is reached.
      // Only compensate when this consumed item was actually within pickup range after movement.
      if (Math.hypot(snap.x - p.x, snap.y - p.y) >= 13) continue;

      if (snap.type === 'kama' && beforeHand >= 3) {
        if (beforeHand < MAX_HAND) {
          G.score = Math.max(0, G.score - 500);
          p.scythes = Math.min(MAX_HAND, beforeHand + 1);
          popup(p.x, p.y - 24, '手数 Lv' + p.scythes + '！', '#bffaff', 10);
        } else {
          // Normalize MAX bonus to v22's +750.
          G.score += 250;
          p.scythes = MAX_HAND;
          popup(p.x, p.y - 24, '手数MAX', '#ffe080', 9);
        }
      } else if (snap.type === 'akakama' && beforePower >= 3) {
        if (beforePower < MAX_POWER) {
          G.score = Math.max(0, G.score - 500);
          p.power = Math.min(MAX_POWER, beforePower + 1);
          popup(p.x, p.y - 24, '威力 Lv' + p.power + '！', '#ff9a9a', 10);
        } else {
          G.score += 250;
          p.power = MAX_POWER;
          popup(p.x, p.y - 24, '威力MAX', '#ffe080', 9);
        }
      }
    }
  };
})();
