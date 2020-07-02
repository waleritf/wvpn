require('dotenv').config();

const path = require("path");
const sleep = require("../utils/sleep");
const VSCALE_HOST_USER = process.env.VSCALE_HOST_USER;
const node_ssh = require('node-ssh');
const request = require("../utils/request");
const secureRandom = require("secure-random");
const { waitForRequestValue } = require("../utils/waiter");
const ssh = new node_ssh();
const password = secureRandom(64, { type: "Buffer" }).toString("hex");
const defaultServerOptions = {
  make_from: "ubuntu_18.04_64_001_master",
  rplan: "small",
  do_start: true,
  name: "WVPN",
  password: password,
  location: "spb0"
};

function setupWireGuard(hostname) {
  return new Promise((resolve) => {
    console.log(`Hostname: ${hostname}`);

    const connectionParams = {
      host: hostname,
      username: VSCALE_HOST_USER,
      password: password,
      tryKeyboard: true,
      onKeyboardInteractive: (name, instructions, instructionsLang, prompts, finish) => {
        if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes('password')) {
          finish([password])
        }
      }
    };

    console.log(connectionParams);
    ssh.connect(connectionParams).then(() => {
      ssh.putFile(path.resolve(`${path.resolve()}/scripts/setup-wireguard.sh`), '/root/setup-wireguard.sh').then(() => {
        console.log('Script uploaded.');
        console.log('Executing script...');

        ssh.execCommand('chmod +x ./setup-wireguard.sh && ./setup-wireguard.sh', { cwd: '/root' }).then(async (result) => {
          console.log('STDOUT: ' + result.stdout)
          console.log('STDERR: ' + result.stderr)

          // NOTE wait for QR code generated
          // TODO add waiter for QR code generated
          console.log('Waiting for peer files...');
          await sleep(60000);

          ssh.getFile(`${path.resolve()}/peer1.png`, 'wg/config/peer1/peer1.png').then(() => {
            console.log('QR code ready');
          }, (err) => {
            console.log('Something goes wrong with QR');
            console.log(err);
          });

          ssh.getFile(`${path.resolve()}/peer1.conf`, 'wg/config/peer1/peer1.conf').then(() => {
            console.log('CONF file ready');
            resolve();
          }, (err) => {
            console.log('Something goes wrong with .conf file');
            console.log(err);
          });
        });
      }, (err) => {
        console.log('Something goes wrong.');
        console.log(err);
      });
    });
  });
}

async function setupVPNServer() {
  const servers = await request({ method: "GET", path: "/scalets" });
  if (servers.length > 0) {
    for (let server of servers) {
      await request({ method: "DELETE", path: `/scalets/${server.ctid}` });
    }
  }
  const { ctid } = await request({ method: "POST", path: "/scalets", data: defaultServerOptions });

  await waitForRequestValue({
    path: `/scalets/${ctid}`,
    json_path: ["status"],
    value: "started"
  });

  const { public_address } = await request({ method: 'GET', path: `/scalets/${ctid}` });

  // NOTE wait a bit while server SSH started
  // TODO add waiter for SSH ready
  await sleep(50000);

  await setupWireGuard(public_address.address);
}

setupVPNServer();
