const {getBounds2d} = require('./get-bounds-2d');
const {textToLines} = require('./text');

const addCropMarks = (lines, includeDate = false) => {
  const length = 5;
  const gap = 2;
  const padding = 3;
  const {minX, maxX, minY, maxY} = getBounds2d(lines);

  //if (minX < length || minY < length) {
  lines = lines.map(line =>
    line.map(([x, y]) => [
      x + (length - minX) + padding,
      y + (length - minY) + padding
    ])
  );
  //}

  const marks = [
    [
      // top left H
      [minX, minY + length],
      [minX + length - gap, minY + length]
    ],
    [
      // top left V
      [minX + length, minY],
      [minX + length, minY + length - gap]
    ],
    [
      // bottom  right H
      [maxX + length + gap + padding * 2, maxY + length + padding * 2],
      [maxX + length * 2 + padding * 2, maxY + length + padding * 2]
    ],
    [
      // bottom  right V
      [maxX + length + padding * 2, maxY + gap + length + padding * 2],
      [maxX + length + padding * 2, maxY + length * 2 + padding * 2]
    ],
    [
      // top  right H
      [maxX + length + gap + padding * 2, minY + length],
      [maxX + length * 2 + padding * 2, minY + length]
    ],
    [
      // top  right V
      [maxX + length + padding * 2, minY],
      [maxX + length + padding * 2, minY + length - gap]
    ],
    [
      // bottom left H
      [minX, maxY + length + padding * 2],
      [minX + length - gap, maxY + length + padding * 2]
    ],
    [
      // bottom left V
      [minX + length, maxY + length + gap + padding * 2],
      [minX + length, maxY + length * 2 + padding * 2]
    ]
  ];

  lines.unshift(...marks);

  if (includeDate) {
    const date = textToLines(
      new Date().toLocaleDateString(),
      0.12,
      maxX + length + gap,
      maxY + length * 2,
      true
    );
    lines.push(...date);
  }

  return lines;
};

module.exports = {addCropMarks};
