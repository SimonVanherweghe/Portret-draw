const fs = require("fs");
const path = require("path");

const filterExtension = (file, extension) => {
  const extName = path.extname(file);
  return extName === "." + extension;
};

const getQueue = (queuePath, extension) => {
  let files = fs
    .readdirSync(queuePath)
    .filter((file) => filterExtension(file, extension));
  let filesWithStats = [];
  if (files.length > 1) {
    let sorted = files.sort((a, b) => {
      let s1 = fs.statSync(queuePath + a);
      let s2 = fs.statSync(queuePath + b);
      return s1.ctime > s2.ctime;
    });
    sorted.forEach((file) => {
      filesWithStats.push({
        filename: file,
        date: new Date(fs.statSync(queuePath + file).ctime),
        path: queuePath + file,
      });
    });
  } else {
    files.forEach((file) => {
      filesWithStats.push({
        filename: file,
        date: new Date(fs.statSync(queuePath + file).ctime),
        path: queuePath + file,
      });
    });
  }
  return filesWithStats;
};

const move = (lines, moveX, moveY) =>
  lines.map((line) =>
    line.map((pair) => {
      return [Math.round(pair[0] + moveX), Math.round(pair[1] + moveY)];
    })
  );

const scale = (lines, scaleX = 1, scaleY = 1) =>
  lines.map((line) =>
    line.map((pair) => {
      return [Math.round(pair[0] * scaleX), Math.round(pair[1] * scaleY)];
    })
  );

module.exports = { getQueue, move, scale };
