/* GEKOKUJO ranking character portraits v25
   Shows the selected v18 illustrated character in each ranking row. */
(() => {
  'use strict';

  function rankingCharId25(value) {
    const v = String(value || '').trim();
    const byName = {
      '農民': 'farmer',
      '猟師': 'hunter',
      '山男': 'yamaotoko',
      '浪人': 'ronin',
      farmer: 'farmer',
      hunter: 'hunter',
      yamaotoko: 'yamaotoko',
      ronin: 'ronin'
    };
    return byName[v] || null;
  }

  function drawRankingPortrait25(r, x, y, highlighted) {
    const id = rankingCharId25(r && r.chr);
    if (!id || !SPR[id]) return;

    ctx.save();
    ctx.fillStyle = highlighted ? 'rgba(255,235,164,.13)' : 'rgba(111,88,62,.08)';
    ctx.beginPath();
    ctx.arc(x, y, 12.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = highlighted ? 'rgba(247,226,156,.52)' : 'rgba(58,47,36,.20)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();

    // v20's drawSpr uses the same v18 illustrated sprite sheet here.
    drawSpr(SPR[id], x, y - 1, 1, 0.78);
  }

  drawRanking = function() {
    drawPaperBg();
    txt('ランキング TOP10', W / 2, 18, 22, '#201810', 'center', false);
    const status = G.rankingStatus === 'online' ? 'オンライン' : G.rankingStatus === 'loading' ? '読込中…' : G.rankingStatus === 'setup' ? '端末記録（オンライン未設定）' : '端末記録（通信できません）';
    txt(status, W / 2, 42, 9, G.rankingStatus === 'online' ? '#287040' : '#805020', 'center', false);

    if (G.ranking.length === 0) {
      txt(G.rankingStatus === 'loading' ? '読み込んでいます…' : 'まだ記録がありません', W / 2, 210, 14, '#2b241b', 'center', false);
    }

    G.ranking.forEach((r, i) => {
      const hl = G.result && ((G.result.onlineId && r.id === G.result.onlineId) || (r.date === G.result.date && r.score === G.result.score));
      const y = 60 + i * 34;

      ctx.fillStyle = hl ? '#2f281d' : (i % 2 ? '#f2ebdf' : '#fffdfa');
      ctx.fillRect(10, y, W - 20, 30);
      ctx.strokeStyle = '#3a2f24';
      ctx.lineWidth = 1;
      ctx.strokeRect(10.5, y + 0.5, W - 21, 29);

      txt((i + 1) + '位', 17, y + 8, 10, hl ? '#f7e29c' : '#201810', 'left', false);
      drawRankingPortrait25(r, 58, y + 15, hl);
      txt(rankingName(r.name), 76, y + 8, 9.5, hl ? '#f7e29c' : '#201810', 'left', false);
      txt(String(r.score), W - 16, y + 8, 10.5, hl ? '#f7e29c' : '#201810', 'right', false);
    });

    button('もどる', W / 2 - 50, 420, 100, 24, true);
  };
})();
