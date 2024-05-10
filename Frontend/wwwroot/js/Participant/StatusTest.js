var dataTest = {};
var isFirstLockedTest = true;
var currentTestId = null;

$(document).ready(function () {
  var testCategoryId = sessionStorage.getItem("testCategoryId");
  if (
    sessionStorage.getItem("tabChange") !== 0 ||
    !sessionStorage.getItem("tabChange")
  ) {
    sessionStorage.setItem("tabChange", 0);
  }

  $.ajax({
    url: ApiUrl + "/api/TestCategory/Test/" + testCategoryId,
    type: "GET",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    headers: {
      Authorization: "Bearer " + sessionStorage.getItem("token"),
    },
    success: async function (result) {
      var obj = result.data;
      const testList = obj.testKit.split(",");
      const fetchTestPromises = testList.map(async (idTest) => {
        try {
          const testResult = await $.ajax({
            url: ApiUrl + "/api/Test/dotest/" + idTest,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: {
              Authorization: "Bearer " + sessionStorage.getItem("token"),
            },
          });
          return testResult.data;
        } catch (error) {
          console.error(error);
          return null;
        }
      });

      const fetchedTestData = await Promise.all(fetchTestPromises);
      fetchedTestData.forEach((testObj) => {
        if (testObj) {
          dataTest[testObj.testName] = {
            idTest: testObj.testId,
            namaTest: testObj.testName,
            waktuTest: testObj.testTime,
          };
        }
      });
      updateLinks();
    },
    error: function (errorMessage) {
      Swal.fire({
        title: "Tes Tidak Ditemukan",
        text: "Anda Akan Diarahkan ke halaman redirect",
        icon: "question",
      }).then((result) => {
        window.location.href = "/";
      });
    },
  });
});
async function updateLinks() {
  const testContainer = document.getElementById("testContainer");
  const getParticipantId = sessionStorage.getItem("participantId");
  testContainer.innerHTML = ""; 

  for (const key in dataTest) {
    if (dataTest.hasOwnProperty(key)) {
      const test = dataTest[key];
      const link = document.createElement("a");

      link.className = "btn btn-app m-2";
      link.id = "test" + test.namaTest;

      const badge = document.createElement("span");
      badge.className = "badge rounded-circle p-2";

      const icon = document.createElement("i");

      await fetchAnswer(getParticipantId, test.idTest, icon, badge);

      badge.appendChild(icon);
      const badgeContainer = document.createElement("div");
      badgeContainer.style.textAlign = "center";
      badgeContainer.appendChild(badge); 

      link.appendChild(badgeContainer); 

      const text = document.createTextNode(" " + test.namaTest);
      link.appendChild(text);

      testContainer.appendChild(link);
    }
  }
  if (isFirstLockedTest) {
    sessionStorage.setItem("lastTestCompleted", "true");
    if (sessionStorage.getItem("lastTestCompleted") === "true") {
      window.location.href = "/dotest/finished";
    }
  } else {
    sessionStorage.setItem("lastTestCompleted", "false");
  }
}

function fetchAnswer(participantId, testId, icon, badge) {
  return new Promise((resolve, reject) => {
    $("loading").show();
    $.ajax({
      url: ApiUrl + "/api/ParticipantAnswer/GetAnswareByTest",
      type: "GET",
      data: {
        participantId: participantId,
        testId: testId,
      },
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      headers: {
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
      success: function (result) {
        $("loading").hide();
        const status = result.data[0].status;
        if (status === true) {
          icon.className = "fas fa-check text-white";
          badge.className = "badge bg-success rounded-circle p-2";
        } else {
          if (isFirstLockedTest) {
            icon.className = "fas fa-circle text-success";
            badge.className =
              "badge bg-light rounded-circle p-2 border border-secondary";

            currentTestId = result.data[0].testId; 
            isFirstLockedTest = false;
          } else {
            icon.className = "fas fa-lock text-white";
            badge.className += " bg-secondary";
          }
        }

        resolve(currentTestId); 
      },
      error: function (error) {
        $("loading").hide();
        console.error("Error fetching answer:", error);
        reject(error); 
      },
    });
  });
}
