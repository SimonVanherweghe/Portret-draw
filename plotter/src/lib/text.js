const hershey = require('hershey');
const textToLines = (
  text,
  scale = 0.15,
  startX = 0,
  startY = 0,
  alignRight = false
) => {
  const {bounds, paths} = hershey.stringToPaths(text);
  const {minX, maxX, minY, maxY} = bounds;
  const flip = maxY - minY;

  lines = paths.map(line =>
    line.map(([x, y]) => [
      (x + Math.abs(minX)) * scale +
        startX -
        (alignRight ? (maxX - minX) * scale : 0),
      (flip - y) * scale + startY
    ])
  );

  return lines.filter(paths => paths.length > 0);
};

module.exports = {textToLines};
