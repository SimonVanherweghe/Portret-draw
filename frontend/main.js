require("mvp.css");
{
  const openWidget = (widget) => {
    widget.open();
  };

  const init = () => {
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
          //document.querySelector(".form").removeAttribute("hidden");
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
