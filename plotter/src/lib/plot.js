const SerialPort = require("serialport");

function sendCommand(command) {
  if (!command) {
    return;
  }

  console.log("[Plotter] Sending message:", command);
  port.write(command + "\r");
}

const plot = async (device, gcodeCommands) => {
  return new Promise((resolve, reject) => {
    const commands = [...gcodeCommands];
    let plot = null;

    port = new SerialPort(device, { baudRate: 115200 }, (err) => {
      if (err) {
        return console.log("Error: ", err.message);
      }

      console.log("[Plotter] Let's go! Starting in 2 sec...");
      setTimeout(() => sendCommand(commands.shift()), 2000);
    });

    port.on("data", (data) => {
      console.log("[Plotter] Message received:", data.toString());

      if (data.toString().startsWith("ok")) {
        console.log("commands length:", commands.length);
        if (commands.length === 0) {
          console.log("No more commands...");
          setTimeout(() => {
            port.close();
            console.log("Port closed");
            resolve();
          }, 5000);
        }
        sendCommand(commands.shift());
      }
    });

    port.on("error", (err) => {
      console.log("[Plotter] Error:", err);
      reject(err);
    });
  });
};

module.exports = { plot };
