const { getBounds2d } = require("./get-bounds-2d");
const { textToLines } = require("./text");

const addCropMarks = (
  lines,
  {
    includeDate = false,
    marksLength = 5,
    marksGap = 2,
    paddingTop = 3,
    paddingRight = 3,
    paddingBottom = 3,
    paddingLeft = 3,
    width = 0,
    height = 0,
  }
) => {
  const padding = 3;
  let minX, minY, maxX, maxY;
  if (width === 0 || height === 0) {
    let { minX, maxX, minY, maxY } = getBounds2d(lines);
  } else {
    minX = 0;
    minY = 0;
    maxX = width;
    maxY = height;
  }

  console.log("cropmarks", { minX, maxX, minY, maxY });


  //if (minX < marksLength || minY < marksLength) {
  lines = lines.map((line) =>
    line.map(([x, y]) => [
      x + (marksLength - minX) + paddingLeft,
      y + (marksLength - minY) + paddingTop,
    ])
  );
  //}

  const marks = [
    [
      // top left H
      [minX, minY + marksLength],
      [minX + marksLength - marksGap, minY + marksLength],
    ],
    [
      // top left V
      [minX + marksLength, minY],
      [minX + marksLength, minY + marksLength - marksGap],
    ],
    [
      // bottom  right H
      [
        maxX + marksLength + marksGap + paddingLeft + paddingRight,
        maxY + marksLength + paddingTop + paddingBottom,
      ],
      [
        maxX + marksLength * 2 + paddingLeft + paddingRight,
        maxY + marksLength + paddingTop + paddingBottom,
      ],
    ],
    [
      // bottom  right V
      [
        maxX + marksLength + paddingLeft + paddingRight,
        maxY + marksGap + marksLength + paddingTop + paddingBottom,
      ],
      [
        maxX + marksLength + paddingLeft + paddingRight,
        maxY + marksLength * 2 + paddingTop + paddingBottom,
      ],
    ],
    [
      // top  right H
      [
        maxX + marksLength + marksGap + paddingLeft + paddingRight,
        minY + marksLength,
      ],
      [maxX + marksLength * 2 + paddingLeft + paddingRight, minY + marksLength],
    ],
    [
      // top  right V
      [maxX + marksLength + paddingLeft + paddingRight, minY],
      [
        maxX + marksLength + paddingLeft + paddingRight,
        minY + marksLength - marksGap,
      ],
    ],
    [
      // bottom left H
      [minX, maxY + marksLength + paddingTop + paddingBottom],
      [
        minX + marksLength - marksGap,
        maxY + marksLength + paddingTop + paddingBottom,
      ],
    ],
    [
      // bottom left V
      [
        minX + marksLength,
        maxY + marksLength + marksGap + paddingTop + paddingBottom,
      ],
      [minX + marksLength, maxY + marksLength * 2 + paddingTop + paddingBottom],
    ],
  ];

  lines.unshift(...marks);

  if (includeDate) {
    const date = textToLines(
      new Date().toLocaleDateString(),
      0.12,
      maxX + marksLength + marksGap,
      maxY + marksLength * 2,
      true
    );
    lines.push(...date);
  }

  return lines;
};

module.exports = { addCropMarks };
