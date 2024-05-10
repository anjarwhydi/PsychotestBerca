cameraActive = false;
var testKit = []; 
var participantId = sessionStorage.getItem("participantId");

document.addEventListener("DOMContentLoaded", function () {
  var date = new Date();
  var options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  var formattedDate = date.toLocaleDateString("id-ID", options);
  document.getElementById("dateNow").innerHTML = formattedDate;

  var user = sessionStorage.getItem("name"); 
  var hour = date.getHours();
  var greeting = "";
  if (hour >= 0 && hour < 12) {
    greeting = "selamat pagi!";
  } else if (hour >= 12 && hour < 15) {
    greeting = "selamat siang!";
  } else if (hour >= 15 && hour < 18) {
    greeting = "selamat sore!";
  } else {
    greeting = "selamat malam!";
  }
  document.getElementById("greeting").innerHTML =
    "Hai, " + user + " " + greeting;
});

function page2() {
  var dateNow = new Date();
  var dateExp = new Date(sessionStorage.getItem("expiredDatetime"));
  if (dateNow > dateExp) {
    return window.location.assign("/user/Notest");
  }
  window.location.assign("/user/page2");
}

function postStatusTest(testId) {
  $("#loading").show();
  var ParticipantAnswer = new Object();
  ParticipantAnswer.ParticipantId = sessionStorage.getItem("participantId");
  ParticipantAnswer.Status = false;
  ParticipantAnswer.TestId = testId;
  return $.ajax({
    type: "POST",
    url: ApiUrl + "/api/ParticipantAnswer/PostParticipantAnswer",
    data: JSON.stringify(ParticipantAnswer),
    contentType: "application/json; charset=utf-8",
    headers: {
      Authorization: "Bearer " + sessionStorage.getItem("token"),
    },
    success: function (result) {
      $("#loading").hide();
    },
    error: function (errorMessage) {
      $("#loading").hide();
    },
  });
}

var participantAnswersMap = {};
$.ajax({
  url:
    ApiUrl +
    `/api/ParticipantAnswer/GetListByParticipantId?participantId=${participantId}`,
  type: "GET",
  contentType: "application/json; charset=utf-8",
  dataType: "json",
  headers: {
    Authorization: "Bearer " + sessionStorage.getItem("token"),
  },
  success: function (result) {
    var participantAnswers = result.data;
    var testCategoryId = sessionStorage.getItem("testCategoryId");
    $.ajax({
      url: ApiUrl + "/api/TestCategory/Test/" + testCategoryId,
      type: "GET",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      headers: {
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
      success: function (testCategoryResult) {
        var testKit = testCategoryResult.data.testKit
          .split(",")
          .map((id) => id.trim());

        postStatusForMissingTests(participantAnswers, testKit);
      },
      error: function (error) {
        console.error("Error fetching testKit:", error);
      },
    });
  },
  statusCode: {
    404: function () {
      var testCategoryId = sessionStorage.getItem("testCategoryId");
      $.ajax({
        url: ApiUrl + "/api/TestCategory/Test/" + testCategoryId,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        success: function (testCategoryResult) {
          var testKit = testCategoryResult.data.testKit
            .split(",")
            .map((id) => id.trim());
          postStatusForAllTests(testKit);
        },
        error: function (error) {
          console.error("Error fetching testKit:", error);
        },
      });
    },
  },
  error: function (errorMessage) {
    if (errorMessage.status !== 404) {
      window.location.href = "/error/notfound";
      Swal.fire(errorMessage.responseJSON.message, "", "error");
    }
  },
});

function postStatusForAllTests(testKit) {
  const totalTests = testKit.length;
  let testsPosted = 0;

  testKit.forEach((testId) => {
    postStatusTest(testId)
      .done(function () {
        testsPosted++;
        if (testsPosted === totalTests) {
        }
      })
      .fail(function () {
        testsPosted++;
        if (testsPosted === totalTests) {
        }
      });
  });
}

function postStatusForMissingTests(participantAnswers, testKit) {
  const testIdsToPost = [];
  testKit.forEach((testId) => {
    const testIdString = testId.toString();
    let shouldPost = true;
    participantAnswers.forEach((participantAnswer) => {
      if (participantAnswer.testId.toString() === testIdString) {
        shouldPost = false;
      }
    });

    if (shouldPost) {
      postStatusTest(testId);
    }
  });
}
