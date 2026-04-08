export function generateCreatorPortalHTML(): string {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Creator Command Center</title>

<style>
:root {
  --bg: #0b0d10;
  --card: rgba(25, 28, 34, 0.85);
  --border: rgba(255, 255, 255, 0.06);
  --accent: #4da3ff;
  --text-primary: #ffffff;
  --text-secondary: rgba(255,255,255,0.55);
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: radial-gradient(circle at top left, #12151c 0%, var(--bg) 60%);
  color: var(--text-primary);
  letter-spacing: 0.4px;
}

.container {
  padding: 60px;
  max-width: 1150px;
  margin: 0 auto;
}

.title {
  font-size: 18px;
  font-weight: 500;
  text-transform: uppercase;
  opacity: 0.9;
}

.subtitle {
  margin-top: 10px;
  color: var(--text-secondary);
  max-width: 800px;
  line-height: 1.5;
  font-size: 13px;
}

.memberId {
  margin-top: 10px;
  color: var(--text-secondary);
  font-size: 12px;
}

.grid {
  margin-top: 45px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 22px;
}

.card {
  backdrop-filter: blur(12px);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 22px;
  position: relative;
}

.card::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
  background: var(--accent);
  opacity: 0.18;
}

.label {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.value {
  font-size: 16px;
  font-weight: 600;
}

.section {
  margin-top: 70px;
}

.sectionTitle {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.table {
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
}

.row {
  display: grid;
  grid-template-columns: 0.7fr 0.7fr 1fr;
  gap: 14px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  background: rgba(12, 14, 18, 0.15);
}

.row:last-child {
  border-bottom: none;
}

.badge {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.03);
  color: var(--text-primary);
  width: fit-content;
}

.small {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.4;
}
</style>
</head>

<body>
<div class="container">

  <div class="title">Creator Command Center</div>
  <div class="subtitle">
    Monetization intelligence across the last 60 days.
    This interface detects spikes, recommends CTA actions, and connects creator demand into bookings and membership routing.
  </div>
  <div class="memberId" id="memberId"></div>

  <div class="grid" id="cards"></div>

  <div class="section">
    <div class="sectionTitle">Spike Log</div>
    <div class="table" id="spikes"></div>
  </div>

</div>

<script>
function card(label, value) {
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML =
    '<div class="label">' + label + '</div>' +
    '<div class="value">' + value + '</div>';
  return div;
}

async function load() {
  const res = await fetch('/creator/metrics');
  if (!res.ok) {
    document.body.innerHTML = '<div class="container"><div class="title">Access Required</div><div class="subtitle">Inner Circle membership required.</div></div>';
    return;
  }

  const data = await res.json();
  const memberId = data.memberId || 'Admin';
  document.getElementById('memberId').innerText = 'Member ID: ' + memberId;

  const cards = document.getElementById('cards');
  cards.appendChild(card('Spike Events Detected', data.summary.spikesDetected));
  cards.appendChild(card('Top Recommended CTA', data.summary.topCTA));
  cards.appendChild(card('Engagement Efficiency', (data.summary.avgEngagementRate * 100).toFixed(1) + '%'));
  cards.appendChild(card('Window', data.summary.windowDays + ' Days'));

  const table = document.getElementById('spikes');

  if (!data.spikes.length) {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = '<div class="small">No spikes detected in this window.</div>';
    table.appendChild(row);
    return;
  }

  data.spikes.slice(0, 12).forEach(function (s) {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML =
      '<div><span class="badge">Spike x' + s.spikeMultiplier.toFixed(1) + '</span></div>' +
      '<div class="small">' + s.dateLabel + '</div>' +
      '<div class="small">' + s.recommendedCTA + '</div>';
    table.appendChild(row);
  });
}

load();
</script>

</body>
</html>
`;
}
