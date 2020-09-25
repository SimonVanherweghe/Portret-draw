require("mvp.css");
{
  let fotoData;

  const openWidget = (widget) => {
    widget.open();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const form = e.target;

    fetch("/.netlify/functions/portrets-create", {
      method: "post",
      body: JSON.stringify({
        name: form.name.value,
        email: form.email.value,
        foto: fotoData.public_id,
        etag: fotoData.etag,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        document.querySelector(".merci").removeAttribute("hidden");
        document.querySelector(".form").setAttribute("hidden", "true");
      });
  };

  const init = () => {
    document.querySelector("form").addEventListener("submit", handleFormSubmit);
    const myCropWidget = cloudinary.createUploadWidget(
      {
        cloudName: "ddntbml8w",
        uploadPreset: "xcg479rr",
        folder: "widgetUpload",
        cropping: false,
        sources: ["camera", "local"],
        defaultSource: "camera",
        multiple: "false",
        language: "nl",
        theme: "minimal",
      },
      (error, result) => {
        console.log(error, result);
        if (result.event === "success") {
          fotoData = {
            public_id: result.info.public_id,
            etag: result.info.etag,
          };
        }
        if (result.event === "close" && fotoData) {
          document.querySelector(".form").removeAttribute("hidden");
          document.querySelector(".upload").setAttribute("hidden", "true");
        }
      }
    );
    document
      .querySelector("button")
      .addEventListener("click", () => openWidget(myCropWidget));
  };

  init();
}
