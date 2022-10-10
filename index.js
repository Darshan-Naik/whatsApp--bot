var qrGen = require("qr-image");
const { Client } = require("whatsapp-web.js");
const Express = require("express");
const app = Express();

const client = new Client();

const PORT = process.env.PORT || 3000;
let READY = false;
client.on("ready", () => {
  console.log("Client is ready!");
  READY = true;
});

// on disconnect
client.on("disconnected", (reason) => {
  console.log("Client was logged out", reason);
  READY = false;
  client.destroy();
});

// on message
client.on("message", (message) => {
  if (message.body.toLowerCase() === "check") {
    client.sendMessage(message.from, "Bot is running");
  }
});

app.get("/connect", async (req, res) => {
  client.initialize();
  client.on("qr", (qr) => {
    try {
      const code = qrGen.image(qr, { type: "png" });
      res.type("png");
      code.pipe(res);
    } catch (e) {
      res.status(500).send(e);
    }
  });
});

app.get("/status", (req, res) => {
  res.send(READY ? "READY" : "NOT READY");
});
app.get("/disconnect", (req, res) => {
  client.destroy();
  res.send("DISCONNECTED");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
