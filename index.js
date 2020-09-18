const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const http = require("http");
const fs = require("fs");

const svgcode = require("svgcode");

const getImageUrl = async () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });

  const url = await cloudinary.url("sample.svg", {
    transformation: [
      { effect: "grayscale" },
      { effect: "vectorize:detail:1.0:corners:40:colors:2" },
    ],
  });
  return url;
};

const downloadUrl = async (path) => {
  return new Promise((resolve, reject) => {
    const request = http.get(url, async (response) => {
      if (response.statusCode === 200) {
        var file = fs.createWriteStream(path);
        response.pipe(file);
        resolve();
      }
      request.setTimeout(60000, function () {
        // if after 60s file not downlaoded, we abort a request
        request.abort();
        reject();
      });
    });
  });
};

const svgToGcode = (svg) => {
  return new Promise((resolve, reject) => {
    try {
      const gcode = svgcode().loadFile(path).generateGcode().getGcode();
      resolve(gcode);
    } catch (e) {
      reject(e);
    }
  });
};
