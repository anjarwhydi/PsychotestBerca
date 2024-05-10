function parseJwt(token) {
  if (!token) {
    token = localStorage.getItem("token");
  }
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

const getValueByIndex = (obj, index) => obj[Object.keys(obj)[index]];

var objDataToken = parseJwt(sessionStorage.getItem("token"));

var getRole = getValueByIndex(objDataToken, 4);
var getEmail = getValueByIndex(objDataToken, 2);
var getName = getValueByIndex(objDataToken, 1);

if ($("#NameNav").length > 0 || $("#RoleNav").length > 0) {
  $("#NameNav").text(getName);
  $("#RoleNav").text(getRole);
}
