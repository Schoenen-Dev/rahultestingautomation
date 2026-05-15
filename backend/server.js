// const express = require("express");
// const cors = require("cors");
// const { spawn } = require("child_process");

// const app = express();

// app.use(cors());
// app.use(express.json());

// const bots = {};

// const users = [
//   "ani",
//   "george",
//   "jessica",
//   "kevin",
//   "mansion",
//   "rigan",
//   "sam",
//   "susan",
//   "mathews",
//   "rodney1",
//   "rodney2",
//   "rodney3",
//   "Sergio"
// ];

// app.post("/start/:name", (req, res) => {

//   const name = req.params.name;

//   if(bots[name]){
//     return res.json({
//       message: `${name} already running`
//     });
//   }

//   bots[name] = spawn("node", [`${name}.js`], {
//     shell:true,
//     stdio:"inherit"
//   });

//   res.json({
//     message:`${name} started`
//   });
// });

// app.post("/stop/:name", (req, res) => {

//   const name = req.params.name;

//   if(bots[name]){
//     bots[name].kill();
//     delete bots[name];
//   }

//   res.json({
//     message:`${name} stopped`
//   });
// });

// app.post("/start-all", async (req, res) => {

//   users.forEach((user, index) => {

//     setTimeout(() => {

//       bots[user] = spawn("node", [`${user}.js`], {
//         shell:true,
//         stdio:"inherit"
//       });

//     }, index * 2000);

//   });

//   res.json({
//     message:"All started"
//   });
// });

// app.post("/stop-all", (req, res) => {

//   Object.keys(bots).forEach(user => {

//     bots[user].kill();

//     delete bots[user];
//   });

//   res.json({
//     message:"All stopped"
//   });
// });

// app.listen(5000, () => {
//   console.log("Server running on port 5000");
// });

// the latest updated the status updated code can be replace successfully

const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());

const bots = {};   // { name: childProcess }
const logs = {};   // { name: [ "line1", "line2", ... ] }

const users = [
  "ani",
  "george",
  "jessica",
  "kevin",
  "mansion",
  "rigan",
  "sam",
  "susan",
  "mathews",
  "rodney1",
  "rodney2",
  "rodney3",
  "Sergio"
];

// Helper: spawn a bot and capture its output into logs[]
function spawnBot(name) {
  if (!logs[name]) logs[name] = [];

  const proc = spawn("node", [`${name}.js`], {
    shell: true,
    stdio: ["inherit", "pipe", "pipe"]
  });

  proc.stdout.on("data", (data) => {
    logs[name].push(data.toString());
  });

  proc.stderr.on("data", (data) => {
    logs[name].push("[ERR] " + data.toString());
  });

  proc.on("exit", (code) => {
    logs[name].push(`[EXIT] Process exited with code ${code}`);
    delete bots[name];
  });

  return proc;
}

// ── GET /status ──────────────────────────────────
// Returns { ani: "running"|"stopped", george: "running"|"stopped", ... }
app.get("/status", (req, res) => {
  const status = {};
  users.forEach(name => {
    status[name] = bots[name] ? "running" : "stopped";
  });
  res.json(status);
});

// ── GET /logs/:name ──────────────────────────────
// Returns { logs: [...], total: N }
app.get("/logs/:name", (req, res) => {
  const name = req.params.name;
  const since = parseInt(req.query.since) || 0;
  const botLogs = logs[name] || [];
  const newLogs = botLogs.slice(since);
  res.json({ logs: newLogs, total: botLogs.length });
});

// ── POST /start/:name ────────────────────────────
app.post("/start/:name", (req, res) => {
  const name = req.params.name;

  if (bots[name]) {
    return res.json({ message: `${name} already running` });
  }

  bots[name] = spawnBot(name);
  res.json({ message: `${name} started` });
});

// ── POST /stop/:name ─────────────────────────────
app.post("/stop/:name", (req, res) => {
  const name = req.params.name;

  if (bots[name]) {
    bots[name].kill();
    delete bots[name];
  }

  res.json({ message: `${name} stopped` });
});

// ── POST /start-all ──────────────────────────────
app.post("/start-all", (req, res) => {
  users.forEach((user, index) => {
    setTimeout(() => {
      if (!bots[user]) {
        bots[user] = spawnBot(user);
      }
    }, index * 2000);
  });

  res.json({ message: "All started" });
});

// ── POST /stop-all ───────────────────────────────
app.post("/stop-all", (req, res) => {
  Object.keys(bots).forEach(user => {
    bots[user].kill();
    delete bots[user];
  });

  res.json({ message: "All stopped" });
});

// ── Start server ─────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});