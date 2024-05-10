var jawabanPengguna =
    JSON.parse(sessionStorage.getItem("jawabanPengguna")) || [];
var totalQuestion;
const testId = sessionStorage.getItem("currentTestId");
let isTestStarted = false;
let isTimeUp = false; 
let isTestFinished = false; 
var currentTest;

function simpanJawaban(currentNomor, jawaban) {
    if (!sessionStorage.getItem("jawabanPengguna")) {
        const initialAnswer = Array.from({ length: totalQuestion }, () => ",");
        sessionStorage.setItem("jawabanPengguna", JSON.stringify(initialAnswer));
    }

    var jawabanPengguna = JSON.parse(sessionStorage.getItem("jawabanPengguna"));

    for (var key in jawaban) {
        var keyInt = parseInt(key, 10);
        var mostValue = jawaban[key].most || "";
        var leastValue = jawaban[key].least || "";

        if ((mostValue.length > 0 || leastValue.length > 0) && keyInt == currentNomor) {
            jawabanPengguna[currentNomor - 1] = mostValue + "," + leastValue;
        }
    }
    sessionStorage.setItem("jawabanPengguna", JSON.stringify(jawabanPengguna));
}

const dataUjian = {
    totalSoal: 24,
};

$(document).ready(function () {
    if (testId === "4") {
        currentTest = "ist";
    } else if (testId === "5") {
        currentTest = "disc";
    } else if (testId === "6") {
        currentTest = "rmib";
    } else if (testId === "7") {
        currentTest = "papikostick";
    } else if (testId === "11") {
        currentTest = "msdt";
    }
    if (testId !== "5") {
        window.location.href = `/dotest/instruction/${currentTest}`;
    }

    const currentUrl = window.location.pathname;
    if (currentUrl.startsWith("/dotest/starttest/disc/subtes")) {
        isTestStarted = true;
        const subtestMatch = currentUrl.match(
            /\/dotest\/starttest\/disc\/subtes(\d+)/
        );
        const isActiveSubtest = sessionStorage.getItem("indexSubtest");
        var indexSubtest = "0000";
        if (subtestMatch[1].toString() === isActiveSubtest.toString()) {
            indexSubtest = parseInt(subtestMatch[1]);
        }
        $("#numSubTest").text("Halaman " + indexSubtest + "");
        displaytest(testId, indexSubtest);
    }

    $("#startTest").click(function () {
        if (validateOptions()) {
            const inva = {
                answer: null,
                final_score: "INVALID",
                test_id: parseInt(testId),
                participant_id: parseInt(sessionStorage.getItem("participantId")),
                capture: sessionStorage.getItem("filePicture"),
                status: true,
            }
            $.ajax({
                type: "PUT",
                url: ApiUrl + "/api/ParticipantAnswer/StoredAnswer",
                data: JSON.stringify(inva),
                contentType: "application/json; charset=utf-8",
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("token"),
                },
            });

            const isActiveSubtest = sessionStorage.getItem("indexSubtest");
            var targetUrl = `/dotest/starttest/disc/subtes${isActiveSubtest}`;

            window.location.href = targetUrl;
        }
    });
    $("#endSubtest").click(function () {
        sessionStorage.removeItem("indexSubtest");
        sessionStorage.removeItem("filePicture");
        sessionStorage.removeItem("remainingTime");
        return (window.location.href = `/user/page2`);
    });
});

function getTestTimeAndTotalQuestion(testId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: ApiUrl + `/api/Test/dotest/${testId}`,
            method: "GET",
            dataType: "json",
            success: function (result) {
                const testTime = result.data.testTime; 
                const totalQuestions = result.data.totalQuestion; 
                totalQuestion = totalQuestions; 
                resolve({ testTime, totalQuestions });
            },
            error: function () {
                reject("Gagal mengambil waktu tes.");
            },
        });
    });
}

function countdownTImer(testTime) {
    const isActiveSubtest = sessionStorage.getItem("indexSubtest");
    var remainingTime = sessionStorage.getItem("remainingTime");

    if (remainingTime === null) {
        remainingTime = testTime * 60;
    }
    var x = setInterval(function () {
        remainingTime -= 1;
        sessionStorage.setItem("remainingTime", remainingTime); 
        const seconds = remainingTime % 60;
        const secondsInMinutes = (remainingTime - seconds) / 60;
        const minutes = secondsInMinutes % 60;

        document.getElementById("timeTest").innerHTML =
            minutes + "m:" + seconds + "s";

        if (remainingTime < 0) {
            isTimeUp = true;
            forceFinish(1, isActiveSubtest);

            clearInterval(x);
            $("#timeTest").text("done");
            parseInt(isActiveSubtest) === 4
                ? document.getElementById("finishButton").click()
                : document.getElementById("nextButton").click();
        }
    }, 1000);
}

function displaytest(testId, indexSubtest) {
    $("loading").show();
    if (indexSubtest === "0000") {
        return (window.location.href = `/dotest/starttest/disc/subtes${sessionStorage.getItem(
            "indexSubtest"
        )}`);
    }
    checkTabChange(indexSubtest);

    const itemsPerPage = 6;
    let currentNumber;

    if (indexSubtest >= 1 && indexSubtest <= 4) {
        currentNumber = 1 + (indexSubtest - 1) * itemsPerPage;
    } else {
        return;
    }

    var url =
        ApiUrl +
        `/api/Question/GetQuestionByTesto?idTest=5&currentNumber=${currentNumber}&pageSize=${itemsPerPage}`;

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        success: function (data) {
            $("loading").hide();
            var subtesContainer = document.getElementById("subtes-container");
            subtesContainer.innerHTML = "";
            var showNextButton = indexSubtest < 4; 
            var showFinishButton = indexSubtest === 4; 

            var nextButton = document.getElementById("nextButton");
            var finishButton = document.getElementById("finishButton");

            nextButton.style.display = showNextButton ? "inline-block" : "none";
            finishButton.style.display = showFinishButton ? "inline-block" : "none";

            nextButton.onclick = function () {
                if (!answerNext()) {
                    return;
                }
                if (indexSubtest < 4) {
                    if (isTimeUp) {
                        indexSubtest++;
                        isTestFinished = true;
                        sessionStorage.setItem("indexSubtest", indexSubtest);

                        window.location.href = `/dotest/starttest/disc/subtes${indexSubtest}`;
                    } else {
                        Swal.fire({
                            title: "Apakah Kamu Yakin?",
                            text: "Kamu Tidak Akan Bisa Kembali!",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#4CAF50",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Ya, Saya Yakin!",
                            cancelButtonText: "Batal",
                        }).then((result) => {
                            if (result.isConfirmed) {
                                indexSubtest++;
                                isTestFinished = true;
                                sessionStorage.setItem("indexSubtest", indexSubtest);
                                sessionStorage.setItem(
                                    "tabChange",
                                    sessionStorage.getItem("tabChange") - 1
                                );

                                window.location.href = `/dotest/starttest/disc/subtes${indexSubtest}`;
                            }
                        });
                    }
                }
            };
            loadSubtestQuestions(indexSubtest, data);

            finishButton.onclick = function (event) {
                event.preventDefault();
                if (!answerNext()) {
                    return;
                }
                var finisAnswer = JSON.parse(sessionStorage.getItem("jawabanPengguna"));
                var filePicture = sessionStorage.getItem("filePicture");
                var tesActive = parseInt(sessionStorage.getItem("currentTestId"));
                if (isTimeUp) {
                } else {
                    Swal.fire({
                        title: "Apakah Kamu Yakin?",
                        text: "Jawaban Akan Disimpan!",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#4CAF50",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Ya, Saya Yakin!",
                        cancelButtonText: "Batal",
                    }).then((result) => {
                        if (result.isConfirmed) {
                            $("#loading").show();

                            isTestFinished = true;

                            var arrayJawaban = []; 
                            const totalSoal = dataUjian.totalSoal;
                            if (!finisAnswer) {
                                finisAnswer = Array(totalSoal).fill("0");
                                sessionStorage.setItem(
                                    "jawabanPengguna",
                                    JSON.stringify(finisAnswer)
                                );
                            }

                            var kosong = "0";
                            for (var i = 0; i < totalSoal; i++) {
                                if (finisAnswer[i] !== undefined && finisAnswer[i] !== null) {
                                    arrayJawaban.push(finisAnswer[i]);
                                } else {
                                    arrayJawaban.push(kosong);
                                }
                            }
                            var res = null;
                            $.ajax({
                                method: "POST", 
                                url: ApiUrl + "/api/Participant/GetResultTestDISC",
                                contentType: "application/json", 
                                data: JSON.stringify(arrayJawaban), 
                                dataType: "json",
                                async: false,
                                success: function (result) {
                                    res = result.data;
                                },
                                error: function (err) {
                                    return;
                                },
                            });
                            var flag = ",SAFE";
                            var tabChange = sessionStorage.getItem("tabChange");
                            if (tabChange > 0 || !tabChange) {
                                flag = ",VIOLATION" + "/" + tabChange;
                            }
                            var newScore = (res += flag);

                            var stored = {
                                answer: arrayJawaban.toString(),
                                final_score: newScore.toString(), 
                                test_id: tesActive,
                                participant_id: parseInt(
                                    sessionStorage.getItem("participantId")
                                ),
                                capture: filePicture,
                                status: true,
                            };
                            storeAnswer(stored, "finish");

                        }
                    });
                }
            };
            getTestTimeAndTotalQuestion(testId)
                .then((result) => {
                    var remainingTime = sessionStorage.getItem("remainingTime");

                    if (remainingTime !== null) {
                        countdownTImer(remainingTime);
                    } else {
                        countdownTImer(result.testTime);
                    }
                })
                .catch((error) => {
                    console.error("Terjadi kesalahan:", error);
                });
        },
        error: function (error) {
            $("loading").hide();
            console.error("Terjadi kesalahan:", error);
        },
    });
}

function loadSubtestQuestions(indexSubtest, data) {
    var jawaban = {};

    var startIndex = 0;
    var endIndex = 0;
    for (var i = 0; i < indexSubtest; i++) {
        startIndex = endIndex;
        endIndex += 6;
    }

    var subtestQuestions = data.data;
    var subtesContainer = document.getElementById("subtes-container");
    subtesContainer.className = "row justify-content-center"; 
    subtesContainer.innerHTML = "";
    for (var i = 0; i < subtestQuestions.length; i++) {
        var currentSoalNumber = startIndex + i + 1; 
        jawaban[currentSoalNumber] = {
            most: [],
            least: [],
        };
        var soalData = subtestQuestions[i];
        var indexSubtest = sessionStorage.getItem("indexSubtest");
        var soalDiv = document.createElement("div");
        soalDiv.className = `col-sm-6 soal p-3`;
        soalDiv.innerHTML = `
            <div class="">
                <table class="table table-hover table-sm" style=" text-align:center">
                    <thead>
                        <tr>
                            <th style="background-color:#bbd0f3">Most (M)</th>
                            <th style="background-color:#d9d7d7; width: 28rem;vertical-align:middle">Nomor ${currentSoalNumber}</th>
                            <th style="background-color:#bbd0f3">Least (L)</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        soalData.tblMultipleChoices.forEach(function (pilihan, index) {
            var mostRadioChecked = "";
            var leastRadioChecked = "";
            if (jawabanPengguna[currentSoalNumber - 1]) {
                var jawabanArray = jawabanPengguna[currentSoalNumber - 1].split(","); 
                var mostValue = jawabanArray[0];
                var leastValue = jawabanArray[1];

                if (mostValue == index + 1) {
                    mostRadioChecked = "checked"; 
                }
                if (leastValue == index + 1) {
                    leastRadioChecked = "checked"; 
                }
            }

            soalDiv.querySelector("tbody").innerHTML += `
                <tr>
                    <td style="text-align:center">
                        <div class="form-check">
                            <input class="form-check-input" style="cursor: pointer" type="radio" name="most_${currentSoalNumber}" value='${index + 1
                }' data-soal="${currentSoalNumber}" data-jawaban="most" required="" ${mostRadioChecked}>
                        </div>
                    </td>
                    <td>${pilihan.multiple_Choice_Desc}</td>
                    <td style="text-align:center">
                        <div class="form-check">
                            <input class="form-check-input" style="cursor: pointer" type="radio" name="least_${currentSoalNumber}" value='${index + 1
                }' data-soal="${currentSoalNumber}" data-jawaban="least" required="" ${leastRadioChecked}>
                        </div>
                    </td>
                </tr>
            `;
        });

        soalDiv.innerHTML += `
        </tbody>
        </table>
        </div>
        </div>
    `;

        subtesContainer.appendChild(soalDiv);
    }

    $('input[type="radio"]').change(function () {
        var currentSoalNumber = $(this).data("soal");
        var jenisJawaban = $(this).data("jawaban");
        var jawabanValue = $(this).val();

        var jawabanArray = [];
        if (jawabanPengguna[currentSoalNumber - 1]) {
            jawabanArray = jawabanPengguna[currentSoalNumber - 1].split(",");
        }

        if (jenisJawaban === "most") {
            var leastValue = $(
                `input[type="radio"][data-soal="${currentSoalNumber}"][data-jawaban="least"]:checked`
            ).val();
            if (jawabanValue === leastValue) {
                $(
                    `input[type="radio"][data-soal="${currentSoalNumber}"][data-jawaban="least"]:checked`
                ).prop("checked", false); 
                jawaban[currentSoalNumber].least = null;
            } else {
                jawaban[currentSoalNumber].least = leastValue;
            }
            jawaban[currentSoalNumber].most = jawabanValue;
        } else if (jenisJawaban === "least") {
            var mostValue = $(
                `input[type="radio"][data-soal="${currentSoalNumber}"][data-jawaban="most"]:checked`
            ).val();
            if (jawabanValue === mostValue) {
                $(
                    `input[type="radio"][data-soal="${currentSoalNumber}"][data-jawaban="most"]:checked`
                ).prop("checked", false);
                jawaban[currentSoalNumber].most = null;
            } else {
                jawaban[currentSoalNumber].most = mostValue;
            }
            jawaban[currentSoalNumber].least = jawabanValue;
        }

        simpanJawaban(currentSoalNumber, jawaban);
    });
}

function storeAnswer(data, isTestFinish) {
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
            if (isTestFinish == "finish") {
                sessionStorage.removeItem("tabChange");
                sessionStorage.removeItem("jawabanPengguna");
                sessionStorage.removeItem("indexSubtest");
                sessionStorage.removeItem("remainingTime");
                window.location.href = "/user/page2/";
            } else if (isTestFinish == "forceFinish") {
                sessionStorage.removeItem("indexSubtest");
                sessionStorage.removeItem("jawabanPengguna");
                sessionStorage.removeItem("remainingTime");
                window.location.href = "/user/page2/";
                window.sessionStorage.removeItem("tabChange");
            }
        },
        error: function (errorMessage) {
            $("#loading").hide();
            Swal.fire(errorMessage.responseText, "", "error");
        },
    });
}

function validateOptions() {
    var selectedOption111 = document.querySelector('input[name="111"]:checked');
    var selectedOption222 = document.querySelector('input[name="222"]:checked');

    if (!selectedOption111 || !selectedOption222) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: `Tidak boleh kosong!\nPerhatikan kolom Most dan Least`,
        });
        return false;
    }
    return true; 
}

function answerNext() {
    var subtesNum = sessionStorage.getItem("indexSubtest");
    var userAns = JSON.parse(sessionStorage.getItem("jawabanPengguna")) || [];
    if (userAns.length === 0) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: `Jawaban tidak boleh kosong!`,
        });
        return false;
    }

    for (let i = 0; i < parseInt(subtesNum) * 6; i++) {
        var splAns = userAns[i].split(",");
        let checked = 0;
        for (let j = 0; j < 2; j++) {
            if (!splAns[j] || splAns[j] === "") {
                checked++;
            }
        }
        if (checked > 0) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: `Nomor ` + (i + 1) + ` tidak boleh kosong!`,
                footer: "Perhatikan Kolom Most dan Least",
            });
            return false;
        }
    }
    return true;
}

function checkTabChange(indexSubtest) {
    document.addEventListener("visibilitychange", function () {
        var violationCount = sessionStorage.getItem("tabChange");

        if (document.hidden) {
            violationCount++;
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

function forceFinish(status, indexSubtest) {
    var finisAnswer = JSON.parse(sessionStorage.getItem("jawabanPengguna"));
    var filePicture = sessionStorage.getItem("filePicture");
    var tesActive = parseInt(sessionStorage.getItem("currentTestId"));
    let answe = "";
    var arrayJawaban = [];
    isTestFinished = true;

    var arrayJawaban = []; 
    const totalSoal = dataUjian.totalSoal;
    if (!finisAnswer) {
        finisAnswer = Array(totalSoal).fill("0");
        sessionStorage.setItem("jawabanPengguna", JSON.stringify(finisAnswer));
    }

    var kosong = "0";
    for (var i = 0; i < totalSoal; i++) {
        var answerr = finisAnswer[i].split(",");
        if (answerr.length !== 2) {
            answerr.push("0");
        }
        for (let a = 0; a < 2; a++) {
            if (!answerr[a]) {
                answerr[a] = "0";
            }
        }
        arrayJawaban.push(answerr);
    }
    switch (status) {
        case 1:
            var remainingTime = sessionStorage.getItem("remainingTime");
            if (indexSubtest >= 4 || remainingTime <= 0) {
                answe = "INVALID";
                const containsZero = arrayJawaban.some(value => value.includes('0'));
                if (!containsZero) {
                    arrayJawaban = [];
                    for (var i = 0; i < totalSoal; i++) {
                        if (finisAnswer[i] !== undefined && finisAnswer[i] !== null) {
                            arrayJawaban.push(finisAnswer[i]);
                        } else {
                            arrayJawaban.push(kosong);
                        }
                    }
                    
                    var res = null;
                    $.ajax({
                        method: "POST", 
                        url: ApiUrl + "/api/Participant/GetResultTestDISC",
                        contentType: "application/json", 
                        data: JSON.stringify(arrayJawaban), 
                        dataType: "json",
                        async: false,
                        success: function (result) {
                            res = result.data;
                        },
                        error: function (err) {
                            return;
                        },
                    });
                    var flag = ",SAFE";
                    var tabChange = sessionStorage.getItem("tabChange");
                    if (tabChange > 0 || !tabChange) {
                        flag = ",VIOLATION" + "/" + tabChange;
                    }
                    answe = (res += flag);
                }
            } else {
                indexSubtest++;
                isTestFinished = true;
                sessionStorage.setItem("indexSubtest", indexSubtest);
                sessionStorage.setItem(
                    "tabChange",
                    sessionStorage.getItem("tabChange") - 1
                );
                answe = 0;
                window.location.href = `/dotest/starttest/disc/subtes${indexSubtest}`;
            }

            break;
        default:
            answe = "";
    }
    if (answe !== 0) {
        var stored = {
            answer: arrayJawaban.toString(),
            final_score: answe,
            test_id: tesActive,
            participant_id: parseInt(sessionStorage.getItem("participantId")),
            capture: filePicture,
            status: true,
        };

        storeAnswer(stored, "forceFinish");
        return;
    }
}
