cameraActive = false;

var countDownTimer = null;
var duration = 5;

$(document).ready(function () {
  const lastTestCompleted = sessionStorage.getItem("lastTestCompleted");
  if (lastTestCompleted === "true") {
    $("#redirectTest").show();
  } else {
    $("#redirectTest").hide();
    startTime(duration);
  }
});

function startTime(durations) {
  const mess = `<a href="#" class="h3" id="red"><b>Redirect Now ......</b></a>`;
  countDownTimer = setInterval(function () {
    if (durations !== 0) {
      $("#countdown").text(durations);
      durations--;
    } else {
      clearInterval(countDownTimer);
      $("#red").parent().html(mess);
      setTimeout(function () {
        window.location.href = "/user/page2";
      }, 1000); 
    }
  }, 1000);
}
