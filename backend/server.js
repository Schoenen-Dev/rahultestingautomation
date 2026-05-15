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

// updated code

const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());

const bots = {};
const logs = {}; // store logs per bot name

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

// Helper: capture output from a spawned bot process
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

  return proc;
}

app.post("/start/:name", (req, res) => {
  const name = req.params.name;

  if (bots[name]) {
    return res.json({ message: `${name} already running` });
  }

  bots[name] = spawnBot(name);

  res.json({ message: `${name} started` });
});

app.post("/stop/:name", (req, res) => {
  const name = req.params.name;

  if (bots[name]) {
    bots[name].kill();
    delete bots[name];
  }

  res.json({ message: `${name} stopped` });
});

app.post("/start-all", async (req, res) => {
  users.forEach((user, index) => {
    setTimeout(() => {
      if (!bots[user]) {
        bots[user] = spawnBot(user);
      }
    }, index * 2000);
  });

  res.json({ message: "All started" });
});

app.post("/stop-all", (req, res) => {
  Object.keys(bots).forEach(user => {
    bots[user].kill();
    delete bots[user];
  });

  res.json({ message: "All stopped" });
});

// FIX: Added /logs/:name route — required by the frontend
app.get("/logs/:name", (req, res) => {
  const name = req.params.name;
  const since = parseInt(req.query.since) || 0;
  const botLogs = logs[name] || [];
  const newLogs = botLogs.slice(since);
  res.json({ logs: newLogs, total: botLogs.length });
});

// FIX: Use process.env.PORT for Render (not hardcoded 5000)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});