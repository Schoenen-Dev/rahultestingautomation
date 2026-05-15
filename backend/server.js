const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());

const bots = {};

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

app.post("/start/:name", (req, res) => {

  const name = req.params.name;

  if(bots[name]){
    return res.json({
      message: `${name} already running`
    });
  }

  bots[name] = spawn("node", [`${name}.js`], {
    shell:true,
    stdio:"inherit"
  });

  res.json({
    message:`${name} started`
  });
});

app.post("/stop/:name", (req, res) => {

  const name = req.params.name;

  if(bots[name]){
    bots[name].kill();
    delete bots[name];
  }

  res.json({
    message:`${name} stopped`
  });
});

app.post("/start-all", async (req, res) => {

  users.forEach((user, index) => {

    setTimeout(() => {

      bots[user] = spawn("node", [`${user}.js`], {
        shell:true,
        stdio:"inherit"
      });

    }, index * 2000);

  });

  res.json({
    message:"All started"
  });
});

app.post("/stop-all", (req, res) => {

  Object.keys(bots).forEach(user => {

    bots[user].kill();

    delete bots[user];
  });

  res.json({
    message:"All stopped"
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});