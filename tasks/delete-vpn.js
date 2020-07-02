const request = require("../utils/request");

async function deleteExistingVPNServer() {
  const servers = await request({ method: "GET", path: "/scalets" });
  if (servers.length > 0) {
    for (let server of servers) {
      if (server.hostname === process.env.SERVER_NAME) {
        await request({ method: "DELETE", path: `/scalets/${server.ctid}` });
        break;
      } else {
        continue;
      }
    }
  }
}

deleteExistingVPNServer();
