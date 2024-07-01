$("body").append(
  $("<script>", {
    src: "https://cdn.jsdelivr.net/npm/exif-js",
    type: "text/javascript",
  })
);

var datePickerValue = $('.hasDatepicker').attr('placeholder');
var enterHour = $('select[name^="hour2"]').val();
var enterMinute = $('select[name^="minute2"]').val();
var enterTime = enterHour + ':' + enterMinute;
var enterDateTime = new Date(datePickerValue + ' ' + enterTime);
var exitHour = $('select[name^="hour3"]').val();
var exitMinute = $('select[name^="minute3"]').val();
var exitTime = exitHour + ':' + exitMinute;
var exitDateTime = new Date(datePickerValue + ' ' + exitTime);

const matchingImage = $('img[name^="i_"]:first');
EXIF.getData(matchingImage[0], function () {
  const captureTime = EXIF.getTag(this, "DateTimeOriginal");

  // Convert capture time to Date object
  var captureDateTime = new Date(captureTime);

  // Check if the capture time is between entry and exit times
  if (captureDateTime >= enterDateTime && captureDateTime <= exitDateTime) {
    console.log("Picture captured between entry and exit times.");
  } else {
    console.log("Picture not captured between entry and exit times.");
  }
});
