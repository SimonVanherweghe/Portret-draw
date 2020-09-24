const fs = require("fs");
const { plot } = require("./src/lib/plot");
const { addCropMarks } = require("./src/lib/cropmarks");
const { linesToGcode } = require("./src/lib/lines-to-gcode");
const { getQueue, scale, move } = require("./src/lib/utils");
const { getBounds2d } = require("./src/lib/get-bounds-2d");


const drawFile = async (file, moveX = 0, moveY = 0) => {
  console.log("Start drawing ", file.filename, moveX, moveY);
  const json = fs.readFileSync(file.path);
  let lines = JSON.parse(json);

  const scaleFactor = 75 / 1024; // polaroid=75, json resolution=1024

  lines = scale(lines, scaleFactor, scaleFactor);
  lines = addCropMarks(lines, { paddingBottom: 19, width: 75, height: 75 });
  console.log(getBounds2d(lines));
  lines = move(lines, moveX, moveY);

  const commands = linesToGcode(lines, 2000);

  try {
    await plot("/dev/ttyUSB0", commands);
    console.log("Drawing finished", file.filename);
    fs.unlinkSync(file.path);
    console.log("Source removed", file.filename);
    return Promise.resolve();
  } catch (err) {
    console.error(err);
  }
};

const waitForSource = () => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const queue = getQueue("./queue/", "json");
      if (queue.length > 0) {
        console.log("file found");
        const file = queue[0];
        resolve(file);
      } else {
        console.log("no files");
        const result = waitForSource();
        result ? resolve(result) : reject();
      }
    }, 60000);
  });
};

const init = async () => {
  const amount = 3;
  const cols = 3;
  const colSize = 81;
  const rowSize = 97;
  for (let i = 0; i < amount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const source = await waitForSource();
    await drawFile(source, colSize * col, rowSize * row);
  }
};

init();
