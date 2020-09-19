const fs = require("fs");
const { plot } = require("./src/lib/plot");
const { addCropMarks } = require("./src/lib/cropmarks");
const { linesToGcode } = require("./src/lib/lines-to-gcode");
const { getQueue } = require("./utils");

const queue = getQueue("./queue/", "json");
if (queue.length > 0) {
  const file = queue[0];
  const json = fs.readFileSync(file.path);
  let lines = JSON.parse(json);
  lines = addCropMarks(lines, true);
  const commands = linesToGcode(lines, 1500);

  plot("/dev/ttyUSB0", commands);
  return true;
} else {
  console.log("no files");
}
