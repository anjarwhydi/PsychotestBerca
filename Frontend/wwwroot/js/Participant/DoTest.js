let isTestStarted = false; 
let isTimeUp = false; 
let isTestFinished = false;
let myTimer; 
let c = 0;
let arr = [];
var myAnswer = JSON.parse(sessionStorage.getItem("myanswer"));
const currentTestId = sessionStorage.getItem("currentTestId");
var filePicture = sessionStorage.getItem("filePicture");
let valid = 0;
sessionStorage.setItem("tesActive", currentTestId);

$(document).ready(function () {
    parseInt(currentTestId) === 6
        ? $(".card-header").hide()
        : $(".card-header").show();
    parseInt(currentTestId) === 6
        ? $(".card-title").css("float", "none").css("text-align", "center")
        : $(".card-title").css("float", "left").css("text-align", "center");
    getTestTime(currentTestId);
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
    }
    $("#startDoTest").on("click", function () {
        switch (currentTestId) {
            case "6":
                storeInvalid(currentTestId);
                window.location.href = `/dotest/starttest/rmib`;
                break;
            case "7":
                $("input[name='answer']").change(function () {
                    var num = $("input[name='answer']:checked").val();

                    if (num) {
                        $("#warningMessage1").hide();
                    } else {
                        $("#warningMessage1").show();
                    }
                    return;
                });
                var inpVal1 = checkValue("answer", "a") || checkValue("answer", "b");
                if (!inpVal1) {
                    $("#warningMessage1").show();
                    return;
                }
                if (!inpVal1) {
                    $("#warningMessage1").show();
                    return;
                } else {
                    storeInvalid(currentTestId);
                    window.location.href = `/dotest/starttest/papikostick`;
                    break;
                }
            case "11":
                $("input[name='answer']").change(function () {
                    var num = $("input[name='answer']:checked").val();

                    if (num) {
                        $("#warningMessage1").hide();
                    } else {
                        $("#warningMessage1").show();
                    }
                    return;
                });
                var inpVal1 = checkValue("answer", "a") || checkValue("answer", "b");
                if (!inpVal1) {
                    $("#warningMessage1").show();
                    return;
                }
                if (!inpVal1) {
                    $("#warningMessage1").show();
                    return;
                } else {
                    storeInvalid(currentTestId);
                    window.location.href = `/dotest/starttest/msdt`;
                    break;
                }
            default:
                break;
        }
    });
    function checkValue(inputName, expectedValue) {
        var inputValue = $("input[name='" + inputName + "']:checked").val() || "";
        return inputValue.toLowerCase() === expectedValue;
    }
    $("#btnBackTest").on("click", function () {
        moveToPreviousQuestion();
    });

    $("#btnNextTest").on("click", function () {
        moveToNextQuestion();
    });

    $("#btnFinishTest").on("click", function () {
        isTestFinished = true; 
        finishTest();
    });

    $(document).on("change", ".boxed-check-input[type='radio']", function () {
        const selectedValue = $(this).val();
        const groupName = $(this).attr("name");
        const numbers = groupName.match(/\d+/g);
        myAnswer[numbers] = selectedValue;

        sessionStorage.setItem("myanswer", JSON.stringify(myAnswer));
        updateQuestionButtonColors();
    });
});

function storeInvalid(id) {
    const inva = {
        answer: null,
        final_score: "INVALID",
        test_id: parseInt(id),
        participant_id: parseInt(sessionStorage.getItem("participantId")),
        capture: sessionStorage.getItem("filePicture"),
        status: true,
    }
    $.ajax({
        method: "PUT",
        url: ApiUrl + "/api/ParticipantAnswer/StoredAnswer",
        data: JSON.stringify(inva),
        contentType: "application/json; charset=utf-8",
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
    });
}
function getTestTime(currentTestId) {
    $.ajax({
        url: ApiUrl + `/api/Test/dotest/${currentTestId}`,
        method: "GET",
        dataType: "json",
        success: function (result) {
            const testTime = result.data.testTime; 
            initializeTestTimer(testTime);
        },
        error: function () { },
    });
}

function initializeTestTimer(testTime) {
    const idTes = sessionStorage.getItem("currentTestId");
    c = sessionStorage.getItem("waktuTes" + idTes);
    if (!c) {
        c = testTime * 60;
        sessionStorage.setItem("waktuTes" + idTes, c);
    }
    const seconds = c % 60;
    const secondsInMinutes = (c - seconds) / 60;
    const minutes = secondsInMinutes % 60;
    const hours = (secondsInMinutes - minutes) / 60;
    document.getElementById("timeTest").innerHTML =
        (hours !== 0 ? hours + "h:" : "") + minutes + "m:" + seconds + "s";
}

function countDownTimer(setId) {
    function myClock() {
        if (isTimeUp) {
            sessionStorage.removeItem("waktuTes" + setId);
            clearInterval(myTimer); 
            valid += 1;
            forceFinish(1);
            return;
        }

        if (isTestStarted) {
            --c;
            sessionStorage.setItem("waktuTes" + setId, c);

            var seconds = c % 60;
            var secondsInMinutes = (c - seconds) / 60; 
            var minutes = secondsInMinutes % 60;
            var hours = (secondsInMinutes - minutes) / 60;
            document.getElementById("timeTest").innerHTML =
                (hours !== 0 ? hours + "h:" : "") + minutes + "m:" + seconds + "s ";

            if (c == 0) {
                isTimeUp = true;
            }
        }
    }
    myTimer = setInterval(myClock, 1000);
}

function displayTest() {
    switch (currentTestId) {
        case "4":
            displayTestIST(testData);
            break;
        case "5":
            displayTestDISC(testData);
            break;
        case "6":
            displayTestRMIB(testData);
            break;
        case "7":
            displayTestPapiKostick(testData);
            break;
        case "11":
            displayTestMSDT(testData);
            break;
        default:
            break;
    }
}

function startTest(testId) {
    if (!isTestStarted) {
        isTestStarted = true; 
        $("#loading").show();
        $.ajax({
            url: ApiUrl + `/api/Question/GetQuestionByTest?id=${testId}`,
            method: "GET",
            dataType: "json",
            success: function (data) {
                testData = data;
                totalQuestions = testData.data.length;
                currentQuestionIndex = 0;
                if (!sessionStorage.getItem("myanswer")) {
                    arr = Array(totalQuestions).fill("0");
                    sessionStorage.setItem("myanswer", JSON.stringify(arr));
                }
                displayTest();
                buildQuestionButtons();
                $("#loading").hide();
                if (!sessionStorage.getItem("tabChange")) {
                    sessionStorage.setItem("tabChange", 0);
                }
                countDownTimer(testId);
            },
            error: function () {
                alert("Gagal mengambil data tes.");
                $("#loading").hide();
            },
        });
    }
}

function moveToPreviousQuestion() {
    currentQuestionIndex--;
    displayTest();
    updateQuestionButtonColors();
}

function moveToNextQuestion() {
    currentQuestionIndex++;
    displayTest();
    updateQuestionButtonColors();
}

function finishTest() {
    updateQuestionButtonColors();
    let tesActive = parseInt(sessionStorage.getItem("tesActive"));
    let finisAnswer = JSON.parse(sessionStorage.getItem("myanswer"));
    if (tesActive !== 6) {
        for (let i = 0; i < finisAnswer.length; i++) {
            if (finisAnswer[i] === "0" || finisAnswer[i] === 0) {
                Swal.fire("Jawaban Nomor " + (parseInt(i) + 1) + " Kosong");
                return;
            }
        }
        Swal.fire({
            title: "Apakah Kamu Yakin?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#4CAF50",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ya, Saya Yakin!",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                $("#loading").show();
                if (tesActive === 7) {
                    $.ajax({
                        url: ApiUrl + "/api/Participant/GetResultTestPAPI",
                        method: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(finisAnswer), 
                        dataType: "json",
                        success: function (result) {
                            let ans = finisAnswer.toString();
                            var flag = ",SAFE";
                            var tabChange = sessionStorage.getItem("tabChange");
                            if (tabChange > 0 || !tabChange) {
                                flag = ",VIOLATION" + "/" + tabChange;
                            }
                            var newScore = (result.data += flag);
                            var stored = {
                                answer: ans,
                                final_score: newScore.toString(),
                                test_id: tesActive,
                                participant_id: parseInt(
                                    sessionStorage.getItem("participantId")
                                ),
                                capture: filePicture,
                                status: true,
                            };
                            storeAnswer(stored, "finish");
                            return;
                        },
                        error: function () {
                            $("#loading").hide();
                        },
                    });
                } else if (tesActive === 11) {
                    $.ajax({
                        url: ApiUrl + "/api/Participant/GetResultTestMSDT",
                        method: "POST",
                        contentType: "application/json", 
                        data: JSON.stringify(finisAnswer), 
                        dataType: "json",
                        success: function (result) {
                            $("#loading").hide();

                            let ans = finisAnswer.toString();
                            var flag = ",SAFE";
                            var tabChange = sessionStorage.getItem("tabChange");
                            if (tabChange > 0 || !tabChange) {
                                flag = ",VIOLATION" + "/" + tabChange;
                            }
                            var newScore = (result.data += flag);
                            var stored = {
                                answer: ans,
                                final_score: newScore.toString(),
                                test_id: tesActive,
                                participant_id: parseInt(
                                    sessionStorage.getItem("participantId")
                                ),
                                capture: filePicture,
                                status: true,
                            };
                            storeAnswer(stored, "finish");
                            return;
                        },
                        error: function (err) {
                            $("#loading").hide();
                        },
                    });
                }
                return;
            }
        });
    }
}
function forceFinish(status) {
    let finisAnswer = JSON.parse(sessionStorage.getItem("myanswer"));
    let tesActive = parseInt(sessionStorage.getItem("tesActive"));
    let ans = "";
    switch (status) {
        case 1:
            if (tesActive === 11) {
                $("#loading").show();

                $.ajax({
                    url: ApiUrl + "/api/Participant/GetResultTestMSDT",
                    method: "POST", 
                    contentType: "application/json",
                    data: JSON.stringify(finisAnswer), 
                    dataType: "json",
                    async: false,
                    success: function (result) {
                        ans = finisAnswer.toString();

                        var flag = ",SAFE";
                        var tabChange = sessionStorage.getItem("tabChange");
                        if (tabChange > 0 || !tabChange) {
                            flag = ",VIOLATION" + "/" + tabChange;
                        }
                        ans = (result.data += flag);
                    },
                    error: function (err) {
                        if (err.responseJSON.data === "0") {
                            ans = "INVALID";
                        } else {
                            ans = "ERROR";
                        }
                    },
                });
            } else if (tesActive === 7) {
                $("#loading").show();
                $.ajax({
                    url: ApiUrl + "/api/Participant/GetResultTestPAPI",
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(finisAnswer), 
                    dataType: "json",
                    async: false,
                    success: function (result) {
                        ans = finisAnswer.toString();
                        var flag = ",SAFE";
                        var tabChange = sessionStorage.getItem("tabChange");
                        if (tabChange > 0 || !tabChange) {
                            flag = ",VIOLATION" + "/" + tabChange;
                        }
                        ans = (result.data += flag);
                    },
                    error: function (err) {
                        if (err.responseJSON.data === "0") {
                            ans = "INVALID";
                        } else {
                            ans = "ERROR";
                        }
                    },
                });
            } else if (tesActive === 6) {
                $("#loading").show();

                var arrayJawaban = [];
                var kosong = "0";
                for (var i = 0; i < 9; i++) {
                    var ind = [];

                    for (var j = 0; j < 12; j++) {
                        ind.push(0);
                    }
                    arrayJawaban.push(ind.toString());
                }
                $.ajax({
                    url: ApiUrl + "/api/Participant/GetResultTestRMIB",
                    method: "POST", 
                    contentType: "application/json", 
                    data: JSON.stringify(arrayJawaban),
                    dataType: "json",
                    async: false,
                    success: function (result) {
                        ans = result.data;
                    },
                    error: function (err) {
                        if (err.responseJSON.data === "0") {
                            ans = "INVALID";
                            let ansNew = JSON.parse(sessionStorage.getItem("myanswer"));
                            const containsZero = ansNew.some(value => value.split(',').includes('0'));
                            if (!containsZero) {
                                var arrayJawaban = [];

                                var kosong = "0";
                                for (var i = 0; i < 9; i++) {
                                    if (ansNew[i] !== undefined && ansNew[i] !== null) {
                                        arrayJawaban.push(finisAnswer[i]);
                                    } else {
                                        arrayJawaban.push(kosong);
                                    }
                                }
                                
                                var res = null;
                                $.ajax({
                                    url: ApiUrl + "/api/Participant/GetResultTestRMIB",
                                    method: "POST", 
                                    contentType: "application/json", 
                                    data: JSON.stringify(arrayJawaban), 
                                    dataType: "json",
                                    async: false,
                                    success: function (result) {
                                        res = result.data;
                                    },
                                    error: function (err) {
                                        $("#loading").hide();

                                        return;
                                    },
                                });
                                $("#loading").hide();

                                var flag = ",SAFE";
                                var tabChange = sessionStorage.getItem("tabChange");
                                if (tabChange > 0 || !tabChange) {
                                    flag = ",VIOLATION" + "/" + tabChange;
                                }
                                ans = (res += flag);
                            }
                        } else {
                            ans = "ERROR";
                        }
                    },
                });
            }
            break;
        default:
            ans = "";
    }
    $("#loading").hide();
    var stored = {
        answer: finisAnswer.toString(),
        final_score: ans,
        test_id: tesActive,
        participant_id: parseInt(sessionStorage.getItem("participantId")),
        capture: filePicture,
        status: true,
    };

    storeAnswer(stored, "forceFinish");
    return;
}
function buildQuestionButtons() {
    const questionList = $(".question-list");

    for (let i = 0; i < totalQuestions; i++) {
        const buttonClass =
            myAnswer[i] !== "0"
                ? "question-button answered-button"
                : "question-button unanswered-button";
        const button = $("<button>", {
            class: buttonClass,
            text: i + 1,
            click: function () {
                currentQuestionIndex = i;
                displayTest();
                updateQuestionButtonColors(); 
            },
        });

        questionList.append(button);
    }
}

function updateQuestionButtonColors() {
    $(".question-button").each(function (index) {
        const answer = myAnswer[index];

        if (answer !== "0") {
            $(this).removeClass("unanswered-button").addClass("answered-button");
        } else if (answer === "0") {
            $(this).removeClass("answered-button").addClass("unanswered-button");
        }
    });
}

function storeAnswer(data, isTestFinish) {
    let tesActive = parseInt(sessionStorage.getItem("tesActive"));
    $("#loading").show();
    $.ajax({
        type: "PUT",
        url: ApiUrl + "/api/ParticipantAnswer/StoredAnswer",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        success: function (result) {
            $("#loading").hide();
            window.location = "/user/page2";
            if (isTestFinish == "finish") {
                if (tesActive === 7) {
                    currentQuestionIndex = 0;
                }
                sessionStorage.removeItem("myanswer");
                sessionStorage.removeItem("tabChange");
                sessionStorage.removeItem("waktuTes" + tesActive);

            } else if (isTestFinish == "forceFinish") {
                valid = 0;
                sessionStorage.removeItem("myanswer");
                window.sessionStorage.removeItem("tabChange");
                sessionStorage.removeItem("waktuTes" + tesActive);
            }
            window.location.href = "/user/page2";
        },
        error: function (errorMessage) {
            $("#loading").hide();
            Swal.fire(errorMessage.responseText, "", "error");
        },
    });
}
function checkTabChange() {
    document.addEventListener("visibilitychange", function () {
        var violationCount = parseInt(sessionStorage.getItem("tabChange"));
        if (document.hidden) {
            violationCount += 1;
            window.addEventListener("beforeunload", function (e) {
                if (sessionStorage.getItem("tabChange") !== 0) {
                    violationCount--;
                    sessionStorage.setItem("tabChange", violationCount);
                }
            });
            sessionStorage.setItem("tabChange", violationCount);
            showViolationAlert(
                "Anda Terdeteksi Membuka Tab lain " + violationCount + "x !",
                "<b>Harap Untuk Fokus Mengerjakan Tes</b>"
            );
        }
    });
}

function showViolationAlert(message, foot) {
    Swal.fire({
        title: "Peringatan!",
        text: message,
        icon: "warning",
        footer: foot,
        confirmButtonText: "OK",
    });
}
