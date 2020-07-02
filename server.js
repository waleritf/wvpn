const express = require("express");
const secureRandom = require("secure-random");

const request = require("./utils/request");

const PORT = 8081

const app = express();

app.get("/", async (req, res) => {
  let serverOptions = {
    make_from: "ubuntu_18.04_64_001_master",
    rplan: "small",
    do_start: true,
    name: 'tst',
    password: secureRandom(64, { type: "Buffer" }).toString("hex"),
    location: "spb0"
  }
  let result = JSON.parse(await request({ method: "POST", path: "/v1/scalets", data: serverOptions }));
  // result = JSON.parse(await request({ method: "GET", path: "/v1/scalets/1556457" }));

  console.log(result);
  res.send(result);
});

app.listen(PORT, () => { console.log(`Listening port: ${PORT}`) });
