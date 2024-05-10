
$(document).ready(function () {
    var tAuth = $("#authHidden").data("aut");
    var istimes = localStorage.getItem("isTimeSessionOver");
    if (istimes == "true" && localStorage.getItem("token") !== null) {
        var getToken = localStorage.getItem("token");
        sessionStorage.setItem("token", getToken);
        const getValueByIndex = (obj, index) =>
            obj[Object.keys(obj)[index]];
        var objDataToken = parseJwt(localStorage.getItem("token"));
        var getRole = getValueByIndex(objDataToken, 4);
        if (getRole !== "Participant") {
            window.location.href = "/dashboard";
        } else {
            window.location.href = "/auth/test";
        }
    }
    $(".toggle-password").click(function () {
        $(this).toggleClass("fa-eye fa-eye-slash");
        var input = $($(this).attr("toggle"));
        if (input.attr("type") === "password") {
            input.attr("type", "text");
        } else {
            input.attr("type", "password");
        }
    });
    $("#form-login").submit(function (e) {
        e.preventDefault();

        $("#loading").show();

        var Account = {
            Email: $("#email").val(),
            Password: $("#password").val(),
        };

        $.ajax({
            type: "POST",
            async: true,
            url: ApiUrl + "/api/Accounts/Login",
            data: JSON.stringify(Account),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (result) {
                debugger;
                $("#loading").hide();
                if (result.status === 200) {
                    var getToken = result.token;
                    sessionStorage.setItem("token", getToken);
                    localStorage.setItem("token", getToken);
                    var batasWaktu = new Date().getTime() + (480 * 60 * 1000);

                    localStorage.setItem("batasWaktuSession", batasWaktu);

                    var Toast = Swal.mixin({
                        toast: true,
                        position: "top-right",
                        showConfirmButton: false,
                        timer: 3000,
                        customClass: {
                            popup: 'colored-toast',
                        }
                    });

                    Toast.fire({
                        icon: "success",
                        title: result.message,

                    }).then((successAllert) => {
                        const getValueByIndex = (obj, index) =>
                            obj[Object.keys(obj)[index]];
                        var objDataToken = parseJwt(sessionStorage.getItem("token"));
                        var getRole = getValueByIndex(objDataToken, 4);
                        if (getRole !== "Participant") {
                            if (getRole === "Audit") {
                                CreateActivityUser("Has been logged in!");
                            }
                            window.location.href = "/dashboard";
                        } else {
                            window.location.href = "/auth/test/";
                        }
                    });
                }
                if (result.status === 404) {
                    var Toast = Swal.mixin({
                        toast: true,
                        position: "top-end",
                        showConfirmButton: false,
                        timer: 3000,
                    });
                    Toast.fire({
                        icon: "error",
                        title: result.message,
                    });
                }
            },
            error: function (result) {
                $("#loading").hide();
                var Toast = Swal.mixin({
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 3000,
                });
                Toast.fire({
                    icon: "error",
                    title: result.responseJSON.message,
                });
            },
        });
    });

    function checkAuth(key) {
        sessionStorage.setItem("token", key);
        const getValueByIndex = (obj, index) => obj[Object.keys(obj)[index]];
        var objDataToken = parseJwt(key);
        var getRole = getValueByIndex(objDataToken, 4);
        if (getRole !== "Participant") {
            if (getRole === "Audit") {
                CreateActivityUser("Has been logged in!");
            }
            $("#loading").hide();

            window.location.href = "/dashboard";
        } else {
            $("#loading").hide();

            window.location.href = "/auth/test/" + sessionStorage.getItem("token");
        }
    }
});

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
        success: function (result) {
            if (
                result.status == 201 ||
                result.status == 204 ||
                result.status == 200
            ) {
                Swal.fire({
                    icon: "success",
                    title: "Your work has been saved",
                    showConfirmButton: false,
                    timer: 1500,
                });
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
