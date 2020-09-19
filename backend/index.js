const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const http = require("http");
const fs = require("fs");
const { resolve } = require("path");
const spawn = require("child_process").spawn;
const { PythonShell } = require("python-shell");

const svgpath = "./parsed/test.svg";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const getImageUrl = async (id) => {
  const url = await cloudinary.url(id, {
    transformation: [
      { gravity: "faces", width: 500, height: 500, crop: "fill" },
    ],
  });
  return url;
};

const downloadUrl = async (source, dest) => {
  return new Promise((resolve, reject) => {
    const request = http.get(source, async (response) => {
      if (response.statusCode === 200) {
        var file = fs.createWriteStream(dest);
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
      const gcode = svgcode().loadFile(svg).generateGcode().getGcode();
      resolve(gcode);
    } catch (e) {
      reject(e);
    }
  });
};

const getLatest = () => {
  return new Promise((resolve, reject) => {
    try {
      cloudinary.api.resources((err, result) => {
        if (err) {
          reject(err);
        }
        const { public_id: id, asset_id: name } = result.resources[0];
        resolve({ id, name });
      });
    } catch (e) {
      reject(e);
    }
  });
};

const createLines = async (source) => {
  return new Promise((resolve, reject) => {
    PythonShell.run(
      "./linedraw/convert.py",
      { args: [source] },
      (err, results) => {
        if (err) {
          reject(err);
        }
        // results is an array consisting of messages collected during execution
        const lines = JSON.parse(
          results[results.length - 1].replace(/\(/g, "[").replace(/\)/g, "]")
        );

        resolve(lines);
      }
    );
  });
};

const run = async () => {
  const photo = await getLatest();
  const url = await getImageUrl(photo.id);
  console.log("url", url);
  await downloadUrl(url, `./out/${photo.name}.jpg`);
  const lines = await createLines(`./out/${photo.name}.jpg`);
  console.log(lines);
};

run();
