$("body").find("*").css({"padding":"5px", "margin":"5px", "font-size":"12px"});

$("body").append(
  $("<script>", {
    src: "https://cdn.jsdelivr.net/npm/exif-js",
    type: "text/javascript",
  })
);

$("body").append(
  $("<script>", {
    src: "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js",
    type: "text/javascript",
  })
);

const imageNamePrefix = "i_";

const matchingImage = $('img[name^="i_"]:first');

EXIF.getData(matchingImage[0], function () {
  const time = EXIF.getTag(this, "DateTimeOriginal");
});
