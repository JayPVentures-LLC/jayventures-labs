export function generateInnerCircleHTML(): string {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Inner Circle Transparency Portal</title>

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
  max-width: 1100px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
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
  max-width: 700px;
  line-height: 1.5;
  font-size: 13px;
}

.month {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.memberId {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 6px;
}

.grid {
  margin-top: 50px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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
  font-size: 18px;
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
  grid-template-columns: 1.2fr 0.6fr 2fr;
  gap: 14px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  background: rgba(12, 14, 18, 0.15);
}

.row:last-child {
  border-bottom: none;
}

.name {
  font-weight: 500;
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

.signal {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.4;
}

.footer {
  margin-top: 70px;
  font-size: 11px;
  color: var(--text-secondary);
}

a {
  color: var(--text-primary);
}
</style>
</head>

<body>
<div class="container">

  <div class="header">
    <div>
      <div class="title">Inner Circle Transparency Portal</div>
      <div class="subtitle">
        Live division status across the JayPVentures ecosystem.
        This portal is intentionally brand-focused and does not display financial totals.
      </div>
    </div>
    <div>
      <div class="month" id="month"></div>
      <div class="memberId" id="memberId"></div>
    </div>
  </div>

  <div class="grid" id="systemCards"></div>

  <div class="section">
    <div class="sectionTitle">Divisions</div>
    <div class="table" id="divisions"></div>
  </div>

  <div class="footer">
    Secure access required. Inner Circle members only.
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
  const res = await fetch('/inner-circle/metrics');
  if (!res.ok) {
    document.body.innerHTML = '<div class="container"><div class="title">Access Required</div><div class="subtitle">Please sign in with an Inner Circle membership.</div></div>';
    return;
  }

  const data = await res.json();
  document.getElementById('month').innerText = data.month;
  document.getElementById('memberId').innerText = 'Member ID: ' + (data.memberId || 'Unavailable');

  const cards = document.getElementById('systemCards');
  cards.appendChild(card('Intake Engine', data.systemStatus.intakeEngine));
  cards.appendChild(card('Booking Pipeline', data.systemStatus.bookingPipeline));
  cards.appendChild(card('Membership Gate', data.systemStatus.membershipGate));
  cards.appendChild(card('Vault Delivery', data.systemStatus.vaultDelivery));

  const table = document.getElementById('divisions');

  data.divisions.forEach(function (d) {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML =
      '<div class="name">' + d.name + '</div>' +
      '<div><span class="badge">' + d.status + '</span></div>' +
      '<div class="signal">' + d.signal + '</div>';
    table.appendChild(row);
  });
}

load();
</script>

</body>
</html>
`;
}
