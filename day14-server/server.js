const express = require('express');
const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  const uptimeSec = Math.floor(process.uptime());
  const uptimeMin = Math.floor(uptimeSec / 60);
  const ram = (process.memoryUsage().heapUsed / 1024).toFixed(2);
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Manoj's Dev Server</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        :root {
          --bg: #0f172a;
          --card: #1e293b;
          --accent: #38bdf8;
          --green: #22c55e;
          --text: #e2e8f0;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: var(--bg);
          font-family: 'Inter', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          color: var(--text);
        }
        .dashboard {
          background: var(--card);
          border: 1px solid #334155;
          padding: 40px;
          border-radius: 20px;
          width: 450px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
        }
        .logo {
          width: 55px;
          height: 55px;
          background: linear-gradient(135deg, var(--accent), #818cf8);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 800;
        }
        h1 { font-size: 2rem; font-weight: 800; }
        .tag { font-size: 0.9rem; color: #94a3b8; }
        .status {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid var(--green);
          color: var(--green);
          padding: 12px 20px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          margin-bottom: 30px;
        }
        .dot {
          width: 10px;
          height: 10px;
          background: var(--green);
          border-radius: 50%;
          animation: blink 1.5s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .stat-box {
          background: #0f172a;
          padding: 22px;
          border-radius: 12px;
          border: 1px solid #334155;
        }
        .stat-label {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .stat-value {
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--accent);
        }
      </style>
    </head>
    <body>
      <div class="dashboard">
        <div class="header">
          <div class="logo">M</div>
          <div>
            <h1>Dev Server</h1>
            <div class="tag">Day-14 Express Instance</div>
          </div>
        </div>
        
        <div class="status">
          <span class="dot"></span>
          SERVER ACTIVE
        </div>

        <div class="stats">
          <div class="stat-box">
            <div class="stat-label">Port</div>
            <div class="stat-value">${PORT}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Uptime</div>
            <div class="stat-value">${uptimeMin}m ${uptimeSec % 60}s</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Memory</div>
            <div class="stat-value">${ram} MB</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Node.js</div>
            <div class="stat-value">${process.version}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`⚡ New server running at http://localhost:${PORT}`);
});