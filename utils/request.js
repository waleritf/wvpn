const https = require("https");

const VSCALE_HOST = process.env.VSCALE_HOST;
const VSCALE_TOKEN = process.env.VSCALE_TOKEN;
const VSCALE_REQUEST_OPTIONS = {
  host: VSCALE_HOST,
  headers: {
    "X-Token": VSCALE_TOKEN,
    "Content-Type": "application/json;charset=UTF-8"
  }
};

function request({ method, path, data }) {
  return new Promise((resolve) => {
    let postData = "";
    let options = Object.assign(VSCALE_REQUEST_OPTIONS, {
      method: method,
      path: `/v1${path}`
    });

    // NOTE reset Content-Length header between requests.
    // TODO find how and why it stores and remove this hack.
    if (options.headers["Content-Length"]) {
      delete options.headers["Content-Length"];
    }

    if (data) {
      postData = JSON.stringify(data);
      options.headers["Content-Length"] = postData.length;
    }

    console.log("Requesting with options:");
    console.log(options);

    https.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      // console.log(`${res.method.toUpperCase()} ${res.statusCode}`);
      // console.log("Response:");
      // console.log(res);

      let body = [];
      let response;

      res.on("data", (chunk) => {
        body.push(chunk);
      }).on("error", (err) => {
        // console.log(`Response error: ${err}`);
        // reject(err);
      }).on("end", () => {
        response = JSON.parse(Buffer.concat(body).toString());
        // console.log("Request response:");
        // console.log(response);
        resolve(response);
      });
    }).on("error", (err) => {
      console.log(`Request error: ${err}`);
    }).end(postData);
  });
};

module.exports = request;
