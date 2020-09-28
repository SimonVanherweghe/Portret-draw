# Portrait plotter

Makes a plotter drawing from a picture uploaded to a website.

## Flow

- Frontend site on [Netlify](netlify.com)
- Selfie is uploaded to [Cloudinary](cloudinary.com)
- Extra form data is saved to [FaundaDB](fauna.com) using a Netlify function.
- A backend node script checks for new pictures on cloudinary.
- Picture is transformed to a linedrawing through a Python script.
- Result is saved as a JSON file. Lines are represented as arrays with coordinates.
- JSON file gets copied to a Rasberry Pi who's connected with the plotter
- A node script on the Pi gets a JSON file in the queue or waits until there is one available.
- When 3 drawings are made, the script ends.

## Standing on the shoulders of giants

- Converting photos to linedrawings <https://github.com/LingDong-/linedraw>
- Pen plotter utils / workflow <https://github.com/pwambach/pen-plotter>

## Other refs:

- Node on Raspberry Pi: <https://gist.github.com/davps/6c6e0ba59d023a9e3963cea4ad0fb516>
