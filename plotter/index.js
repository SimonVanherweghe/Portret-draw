const fs = require("fs");
const { plot } = require("./src/lib/plot");
const { addCropMarks } = require("./src/lib/cropmarks");
const { linesToGcode } = require("./src/lib/lines-to-gcode");
const { getQueue, scale } = require("./src/lib/utils");
const { getBounds2d } = require("./src/lib/get-bounds-2d");

const queue = getQueue("./queue/", "json");
if (queue.length > 0) {
  const file = queue[0];
  const json = fs.readFileSync(file.path);
  let lines = JSON.parse(json);

  const scaleFactor = 75 / 1024; // polaroid=75, json resolution=1024

  lines = scale(lines, scaleFactor, scaleFactor);
  console.log(getBounds2d(lines));
  lines = addCropMarks(lines, { paddingBottom: 20, width: 75, height: 75 });
  console.log(getBounds2d(lines));
  const commands = linesToGcode(lines, 2000);
  try {
    plot("/dev/ttyUSB1", commands);
    fs.unlinkSync(file.path);
  } catch (err) {
    console.error(err);
  }
  return true;
} else {
  console.log("no files");
}
