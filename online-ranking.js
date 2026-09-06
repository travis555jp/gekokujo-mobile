'use strict';

(function () {
  const config = window.GEKOKUJO_RANKING_CONFIG || {};
  const baseUrl = String(config.supabaseUrl || '').replace(/\/+$/, '');
  const apiKey = String(config.supabaseKey || '');
  const tableUrl = baseUrl + '/rest/v1/gekokujo_scores';
  const configured = /^https:\/\//.test(baseUrl) && apiKey.length > 20;

  function headers(extra) {
    return Object.assign({
      apikey: apiKey,
      'Content-Type': 'application/json'
    }, extra || {});
  }

  async function request(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, Object.assign({}, options, { signal: controller.signal }));
      if (!response.ok) throw new Error('ranking api: ' + response.status);
      return response;
    } finally {
      clearTimeout(timer);
    }
  }

  function number(value, min, max) {
    return Math.max(min, Math.min(max, Math.floor(Number(value) || 0)));
  }

  window.OnlineRanking = {
    configured,

    async top(limit) {
      if (!configured) throw new Error('ranking is not configured');
      const count = number(limit || 10, 1, 10);
      const columns = 'id,name,score,combo,kills,play_time,stage,character,created_at';
      const url = tableUrl + '?select=' + columns + '&order=score.desc,created_at.asc&limit=' + count;
      const response = await request(url, { headers: headers() });
      const rows = await response.json();
      return rows.map(row => ({
        id: row.id,
        name: row.name,
        score: row.score,
        combo: row.combo,
        kills: row.kills,
        time: row.play_time,
        stage: row.stage,
        chr: row.character,
        date: Date.parse(row.created_at) || 0
      }));
    },

    async submit(entry) {
      if (!configured) throw new Error('ranking is not configured');
      const payload = {
        name: String(entry.name || '名無し').slice(0, 12),
        score: number(entry.score, 0, 99999999),
        combo: number(entry.combo, 0, 999999),
        kills: number(entry.kills, 0, 999999),
        play_time: number(entry.time, 0, 86400),
        stage: number(entry.stage, 1, 9999),
        character: String(entry.chr || '').slice(0, 12)
      };
      const response = await request(tableUrl, {
        method: 'POST',
        headers: headers({ Prefer: 'return=representation' }),
        body: JSON.stringify(payload)
      });
      const rows = await response.json();
      return rows[0] || null;
    },

    async place(score) {
      if (!configured) throw new Error('ranking is not configured');
      const url = tableUrl + '?select=id&score=gt.' + number(score, 0, 99999999);
      const response = await request(url, {
        headers: headers({ Prefer: 'count=exact', Range: '0-0' })
      });
      const range = response.headers.get('content-range') || '';
      const match = range.match(/\/(\d+)$/);
      return match ? Number(match[1]) + 1 : null;
    }
  };
})();
