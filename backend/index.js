const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const http = require("http");
const fs = require("fs");
const { resolve } = require("path");
const spawn = require("child_process").spawn;
const { PythonShell } = require("python-shell");
const store = require("data-store")({
  path: process.cwd() + "/datastore.json",
});

const { NodeSSH } = require("node-ssh");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const getImageUrl = async (id) => {
  const url = await cloudinary.url(id, {
    transformation: [
      { gravity: "faces:center", width: 500, height: 500, crop: "fill" },
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

const getLatest = async (since) => {
  try {
    const result = await cloudinary.search
      .expression("created_at>" + since)
      .sort_by("public_id", "desc")
      .execute();

    return result.resources.map((img) => ({
      id: img.public_id,
      name: img.filename,
      created_at: img.created_at,
      public_id: img.public_id,
    }));
  } catch (e) {
    console.log(e);
  }
};

const createLines = async (source) => {
  return new Promise((resolve, reject) => {
    PythonShell.run(
      "./linedraw/convert.py",
      { args: [source], pythonPath: "/usr/local/bin/python3" },
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

const writeFile = (path, content) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, (err) => {
      if (err) {
        reject(err);
      }
      console.log("The file was saved!");
      resolve();
    });
  });
};

const run = async () => {
  try {
    const ssh = new NodeSSH();
    await ssh.connect({
      host: "192.168.0.109",
      username: "pi",
      password: process.env.RASPBERRY_PASS, //no success with key...
    });

    console.log("Get latest...");
    const photos = await getLatest(store.get("lastCreated"));
    console.log(photos.length + " new photos");
    for (const photo of photos) {
      console.log("Get image url...");
      const url = await getImageUrl(photo.id);
      console.log("url", url);
      console.log("Download url...");
      await downloadUrl(url, `./downloads/${photo.name}.jpg`);

      console.log("create lines...");
      const lines = await createLines(`./downloads/${photo.name}.jpg`);

      console.log(`write file ${photo.name}...`);
      await writeFile(`./output/${photo.name}.json`, JSON.stringify(lines));

      await ssh.putFile(
        `./output/${photo.name}.json`,
        `/home/pi/plotter/queue/${photo.name}.json`
      );
      console.log(`${photo.name} is copied`);

      store.set("lastCreated", Date.parse(photo.created_at) / 1000);
      console.log("Last created:", store.get("lastCreated"));
    }
    ssh.dispose();
    console.log("--DONE--");
    setTimeout(run, 300000);
  } catch (e) {
    console.log(e);
  }
};

run();
