var countDownTimer = null;
var duration = 5;

window.onload = function () {
    var url = window.location.href;
    var lastSegment = url.substring(url.lastIndexOf("/") + 1);
    var token = sessionStorage.getItem("token");
    if (lastSegment !== "") {
        $.ajax({
            type: "GET",
            url: ApiUrl + "/api/Token/GetToken/" + lastSegment,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function (result) {
                token = result.data.token;
            },
            error: function () {
                var getTokenLocal = localStorage.getItem("token");
                if (!getTokenLocal) {
                    Swal.fire({
                        title: "Token Salah",
                        text: "Harap Hubungi HR yang Bersangkutan",
                        icon: "question",
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Close",
                        allowOutsideClick: false,
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.close();
                        }
                    });
                    $(document).on("click", function (event) {
                        var isBoxClicked = $(event.target).closest("#box").length;
                        if (!isBoxClicked) {
                            window.close();
                        }
                    });
                }
            },
        });
    }
    token = parseJwt(token);
    const getValueByIndex = (obj, index) => obj[Object.keys(obj)[index]];
    const expired = token.exp;
    const getId = token.Id;
    const now = new Date();
    const expiredDateTime = new Date(expired * 1000);
    checkExpiredToken(now, expiredDateTime);
    startTime(duration, getId);
};

function startTime(durations, id) {
    const mess = `<a href="#" class="h3" id="red"><b>Redirect Now ......</b></a>`;
    countDownTimer = setInterval(function () {
        if (durations !== 0) {
            $("#countdown").text(durations);
            durations--;
        } else {
            clearInterval(countDownTimer);
            $("#red").parent().html(mess);
            sendData(id);
        }
    }, 1000);
}

function sendData(id) {
    $.ajax({
        type: "GET",
        url: ApiUrl + "/api/Participant/GetParByAccountId/" + id,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (result) {
            if (!result) {
                Swal.fire({
                    title: "Akun Tidak Ditemukan",
                    text: "Harap Hubungi HR yang Bersangkutan",
                    icon: "question",
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Close",
                    allowOutsideClick: false,
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.close();
                    }
                });
                $(document).on("click", function (event) {
                    var isBoxClicked = $(event.target).closest("#box").length;
                    if (!isBoxClicked) {
                        window.close();
                    }
                });

                return;
            }
            const resData = result.data[0];
            login(resData.account.email);
            var nik = resData.nik ?? 0;
            if (nik !== 0) {
                var spNik = nik.slice(6, 8) ?? 0;
                var gen = spNik > 31 ? "F" : "M";
                sessionStorage.setItem("gender", gen);
            }
            sessionStorage.setItem("participantId", resData.participantId);
            sessionStorage.setItem("accountId", resData.accountId);
            sessionStorage.setItem(
                "expiredDatetime",
                new Date(resData.expiredDatetime)
            );
            sessionStorage.setItem("appliedPositionId", resData.appliedPositionId);
            sessionStorage.setItem("testCategoryId", resData.testCategoryId);
            sessionStorage.setItem("name", resData.account.name);
            window.location = "/user";
            return;
        },
        error: function (err) {

            Swal.fire({
                title: "Token Salah",
                text: "Harap Hubungi HR yang Bersangkutan",
                icon: "question",
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Close",
                allowOutsideClick: false,
            }).then((result) => {
                if (result.isConfirmed) {
                    window.close();
                }
            });
            $(document).on("click", function (event) {
                var isBoxClicked = $(event.target).closest("#box").length;
                if (!isBoxClicked) {
                    window.close();
                }
            });

            return;
        },
    });
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

function getToken(token) { }

function checkExpiredToken(now, exp) {
    if (now > exp) {
        Swal.fire({
            title: "Token Expired",
            text: "Harap Hubungi HR yang Bersangkutan",
            icon: "question",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Close",
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                window.close();
            }
        });
        $(document).on("click", function (event) {
            var isBoxClicked = $(event.target).closest("#box").length;
            if (!isBoxClicked) {
                window.close();
            }
        });
        return;
    }
}

function login(email) {
    var Account = {
        Email: email,
        Password: "123456",
    };
    $.ajax({
        type: "POST",
        async: true,
        url: ApiUrl + "/api/Accounts/Login",
        data: JSON.stringify(Account), //convert json
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function (result) {
            var getToken = result.token;
            sessionStorage.setItem("token", getToken); 
        },
        error: function (err) {
        },
    });
}
