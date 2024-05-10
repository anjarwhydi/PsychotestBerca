function CreateActivityUser(activityUser) {
  var objDataToken = parseJwt(sessionStorage.getItem("token"));
  var getAccountId = objDataToken.Id;
  var HistoryLog = new Object();
  HistoryLog.Activity = activityUser;
  HistoryLog.Timestamp = formatDate(new Date());
  HistoryLog.AccountId = getAccountId;
  $.ajax({
    type: "POST",
    url: ApiUrl + "/api/HistoryLog/HistoryLog",
    data: JSON.stringify(HistoryLog),
    contentType: "application/json; charset=utf-8",
    headers: {
      Authorization: "Bearer " + sessionStorage.getItem("token"),
    },
    success: function (result) {
      if (
        result.status == 201 ||
        result.status == 204 ||
        result.status == 200
      ) {
      }
    },
    error: function (errorMessage) {
      Swal.fire(errorMessage.responseText, "", "error");
    },
  });
}

function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

function formatDate(date) {
  return (
    [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join("-") +
    "T" +
    [
      padTo2Digits(date.getHours()),
      padTo2Digits(date.getMinutes()),
      padTo2Digits(date.getSeconds()),
    ].join(":")
  );
}

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}
