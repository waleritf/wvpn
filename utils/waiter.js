// TODO refactor for more universal waiter/waiters

const request = require("./request")
const sleep = require("./sleep");
const send = require("./send");

const WAIT_INTERVAL = 1000;
const DEFAULT_REQUESTS_LIMIT = 60

async function getValue(path, json_path) {
  return new Promise(async (resolve) => {
    const res = await request({ method: "GET", path: path });
    resolve(send(res, json_path));
  });
}

function waitForRequestValue({ path, json_path, value }) {
  console.log("Waiting for:");
  console.log(`path: ${path}`);
  console.log(`json_path: ${json_path.join(".")}`);
  console.log(`value: ${value}`);

  return new Promise(async (resolve) => {
    let times = 0;
    let fetchedValue;

    while (true) {
      times++
      console.log(times);

      if (times === DEFAULT_REQUESTS_LIMIT) {
        console.log("Timeout");
        resolve();
        break;
      }

      fetchedValue = await getValue(path, json_path);

      if (value === fetchedValue) {
        console.log(`Value: ${value}`);
        resolve();
        break;
      } else {
        console.log("Waiting for value...");
        await sleep(WAIT_INTERVAL);
      }
    }
  });
}

module.exports = {
  waitForRequestValue
}
