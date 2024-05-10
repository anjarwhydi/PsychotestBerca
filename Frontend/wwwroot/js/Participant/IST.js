var jawabanPengguna = [];
var currentTest;
let myAnswer = JSON.parse(sessionStorage.getItem("jawabanPengguna")) ?? [];
let myAnswerSplit = {};
const dataUjian = {
    totalSoal: 176,
    totalDurasi: 4140,
    subtest: [
        { soalPerSubtes: [20], subtesDurations: [360], jenis: "pilihan_ganda" }, //subtest 1
        { soalPerSubtes: [20], subtesDurations: [360], jenis: "pilihan_ganda" }, //subtest 2
        { soalPerSubtes: [20], subtesDurations: [420], jenis: "pilihan_ganda" }, //subtest 3
        { soalPerSubtes: [16], subtesDurations: [480], jenis: "essay" }, //subtest 4
        { soalPerSubtes: [20], subtesDurations: [600], jenis: "essay" }, //subtest 5
        { soalPerSubtes: [20], subtesDurations: [600], jenis: "essay" }, //subtest 6
        {
            soalPerSubtes: [20],
            subtesDurations: [420],
            jenis: "pilihan_ganda_gambar",
        }, //subtest 7
        {
            soalPerSubtes: [20],
            subtesDurations: [540],
            jenis: "pilihan_ganda_gambar",
        }, //subtest 8
        { soalPerSubtes: [20], subtesDurations: [360], jenis: "pilihan_ganda" }, //subtest 9
    ],
};

function simpanJawaban(nomorSoal, jawaban) {
    jawaban = jawaban.toUpperCase();
    var jawabanPengguna =
        JSON.parse(sessionStorage.getItem("jawabanPengguna")) ||
        Array(dataUjian.totalSoal).fill("0");

    jawabanPengguna[parseInt(nomorSoal) - 1] = jawaban;
    sessionStorage.setItem("jawabanPengguna", JSON.stringify(jawabanPengguna));
}

$(document).ready(function () {
    const testId = sessionStorage.getItem("currentTestId");
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
    if (testId !== "4") {
        window.location.href = `/dotest/instruction/${currentTest}`;
    }

    const currentUrl = window.location.pathname;
    if (currentUrl.startsWith("/dotest/Instruction/ist/subtes")) {
        const matchAngka = currentUrl.match(/\d+/);
        if (matchAngka) {
            const angkaDiAkhir = parseInt(matchAngka[0], 10);
            const activeSub = JSON.parse(sessionStorage.getItem("indexSubtest"));
            if (angkaDiAkhir !== activeSub) {
                if (activeSub || activeSub === 0) {
                    window.location.href = `/dotest/instruction/ist/subtes${activeSub}`;
                }
                return Swal.fire({
                    title: "Tes Tidak Ditemukan",
                    text: "Anda Akan Diarahkan ke halaman redirect",
                    icon: "question",
                }).then((result) => {
                    window.location.href = "/";
                });
            }
        }
    }

    if (currentUrl.startsWith("/dotest/StartTest/ist/subtes")) {
        const subtestMatch = currentUrl.match(
            /\/dotest\/StartTest\/ist\/subtes(\d+)/
        );
        //
        const isActiveSubtest = sessionStorage.getItem("indexSubtest");
        var indexSubtest = "0000";
        if (subtestMatch[1].toString() === isActiveSubtest.toString()) {
            indexSubtest = parseInt(subtestMatch[1]);
        }
        $("#numSubTest").text("Subtes " + indexSubtest + "");
        displaytest(testId, indexSubtest);
    }
    let panjangKey = dataUjian.subtest.map(item => item.soalPerSubtes[0]);

    let objBaru = {};
    let start = 0;
    panjangKey.forEach((panjang, index) => {
        let end = start + panjang;
        objBaru[index] = myAnswer.slice(start, end);
        start = end;
    });
    myAnswerSplit = objBaru;

    $("#instruction").click(function () {
        var indexSubtest = $("#subTest").text();

        window.location.href = `/dotest/Instruction/ist/subtes${indexSubtest}`;
    });
    $("#endSubtest").click(function () {
        sessionStorage.removeItem("indexSubtest");
        sessionStorage.removeItem("filePicture");
        return (window.location.href = `/user/page2`);
    });
});

function startTest(indexSubtest) {
    var targetUrl = `/dotest/instruction/ist/subtes${indexSubtest}`;
    window.location.href = targetUrl;
}
function countdownTImer() {
    const isActiveSubtest = parseInt(sessionStorage.getItem("indexSubtest"));
    let time = sessionStorage.getItem("timeSubtest" + isActiveSubtest);

    if (!time) {
        time = dataUjian.subtest[isActiveSubtest - 1].subtesDurations[0];
        sessionStorage.setItem("timeSubtest" + isActiveSubtest, time);
    }

    var x = setInterval(function () {
        time -= 1;
        sessionStorage.setItem("timeSubtest" + isActiveSubtest, time);
        const seconds = time % 60;
        const secondsInMinutes = (time - seconds) / 60;
        const minutes = secondsInMinutes % 60;

        document.getElementById("timeTest").innerHTML =
            minutes + "m:" + seconds + "s";

        if (time <= 0) {
            sessionStorage.removeItem("timeSubtest" + isActiveSubtest);
            forceFinish(1, isActiveSubtest);
            clearInterval(x);
        }
    }, 1000);
}
function displaytest(testId, indexSubtest) {
    if (indexSubtest === "0000") {
        return (window.location.href = `/dotest/instruction/ist`);
    }
    checkTabChange(indexSubtest);
    let currentNumber, itemsPerPage;

    if (indexSubtest == 1) {
        currentNumber = 1;
        itemsPerPage = 20;
    } else if (indexSubtest == 2) {
        currentNumber = 21;
        itemsPerPage = 20;
    } else if (indexSubtest == 3) {
        currentNumber = 41;
        itemsPerPage = 20;
    } else if (indexSubtest == 4) {
        currentNumber = 61;
        itemsPerPage = 16;
    } else if (indexSubtest == 5) {
        currentNumber = 77;
        itemsPerPage = 20;
    } else if (indexSubtest == 6) {
        currentNumber = 97;
        itemsPerPage = 20;
    } else if (indexSubtest == 7) {
        currentNumber = 117;
        itemsPerPage = 20;
    } else if (indexSubtest == 8) {
        currentNumber = 137;
        itemsPerPage = 20;
    } else if (indexSubtest == 9) {
        currentNumber = 157;
        itemsPerPage = 20;
    } else {
        console.error("Invalid indexSubtest:", indexSubtest);
        return;
    }
    var url =
        ApiUrl +
        `/api/Question/GetQuestionByTesto?idTest=4&currentNumber=${currentNumber}&pageSize=${itemsPerPage}`;


    $("#loading").show();
    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        success: function (data) {

            $("#loading").hide();
            var subtesContainer = document.getElementById("subtes-container");
            countdownTImer();
            subtesContainer.innerHTML = "";
            var showNextButton = indexSubtest < dataUjian.subtest.length; 
            var showFinishButton = indexSubtest === dataUjian.subtest.length;
            var nextButton = $("#nextButton");
            var finishButton = $("#finishButton");
            nextButton.css("display", showNextButton ? "inline-block" : "none");
            finishButton.css("display", showFinishButton ? "inline-block" : "none");

            nextButton.click(function () {

                ScoringTestIst("nextTest");
            });
            loadSubtestQuestions(indexSubtest, data);

            finishButton.click(function (e) {
                e.preventDefault();
                ScoringTestIst("finish");
            });
        },
        error: function (error) {
            $("#loading").hide();
            console.error("Terjadi kesalahan:", error);
        },
    });
}


function ScoringTestIst(isTestFinished) {
    var finisAnswer = JSON.parse(sessionStorage.getItem("jawabanPengguna"));
    var filePicture = sessionStorage.getItem("filePicture");
    var tesActive = parseInt(sessionStorage.getItem("currentTestId"));
    var indexSubtest = parseInt(sessionStorage.getItem("indexSubtest"));

    Swal.fire({
        title: "Apakah Kamu Yakin?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#4CAF50",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, Saya Yakin!",
        cancelButtonText: "Batal",
    }).then((result) => {
        $("#loading").show();
        if (result.isConfirmed) {
            $("#loading").show();
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
            var res = "";
            $.ajax({
                url: ApiUrl + "/api/Participant/GetResultTestIST",
                method: "POST", 
                contentType: "application/json",
                data: JSON.stringify(arrayJawaban),
                dataType: "json",
                async: false,
                success: function (result) {
                    res = result.data;

                    var flag = ",SAFE";
                    var tabChange = sessionStorage.getItem("tabChange");
                    if (tabChange > 0 || !tabChange) {
                        flag = ",VIOLATION" + "/" + tabChange;
                    }
                    var newScore = (res += flag);

                    //Jika indexsubtes tidak ke 9 maka invalid
                    if (indexSubtest < dataUjian.subtest.length) {
                        newScore = "INVALID"
                    } 

                    var stored = {
                        answer: arrayJawaban.toString(),
                        final_score: newScore.toString(), 
                        test_id: tesActive,
                        participant_id: parseInt(sessionStorage.getItem("participantId")),
                        capture: filePicture,
                        status: true,
                    };
                    storeAnswer(stored, isTestFinished);
                },
                error: function (err) {
                    $("#loading").hide();

                    return;
                },
            });
        }
        $("#loading").hide();

    });
}

function loadSubtestQuestions(indexSubtest, data) {

    var img_1 = document.createElement("img");
    img_1.className = "img-fluid";
    img_1.style.width = "100%";
    img_1.src = "/image/test_assets/IST/subtes7/soal 117-128.jpg";
    img_1.alt = "Gambar Soal 117-128.png";

    var img_2 = document.createElement("img");
    img_2.className = "img-fluid";
    img_2.style.width = "100%";
    img_2.src = "/image/test_assets/IST/subtes7/soal 129-136.jpg";
    img_2.alt = "Gambar Soal 129-136.png";

    var img_3 = document.createElement("img");
    img_3.className = "img-fluid";
    img_3.style.width = "100%";
    img_3.src = "/image/test_assets/IST/subtes8/soal 137-156.jpg";
    img_3.alt = "Gambar Soal 137-156.png";

    var jenisSoal = dataUjian.subtest[indexSubtest - 1].jenis || "";
    var startIndex = 0;
    var endIndex = 0;
    for (var i = 0; i < indexSubtest; i++) {
        startIndex = endIndex;
        endIndex += dataUjian.subtest[i].soalPerSubtes[0];
    }
    var subtestQuestions = data.data;
    var subtesContainer = document.getElementById("subtes-container");
    if (jenisSoal === "pilihan_ganda_gambar") {
        subtesContainer.className = "row justify-content-center"; 
    }
    subtesContainer.innerHTML = "";
    var gambarAdded_1 = false;
    var gambarAdded_2 = false;
    var gambarAdded_3 = false;
    var gambarSubtes7_1 = document.createElement("div");
    gambarSubtes7_1.id = "gambarSubtes7-1";
    subtesContainer.appendChild(gambarSubtes7_1);
    var gambarSubtes7_2 = document.createElement("div");
    gambarSubtes7_2.id = "gambarSubtes7-2";
    subtesContainer.appendChild(gambarSubtes7_2);
    var gambarSubtes8_1 = document.createElement("div");
    gambarSubtes8_1.id = "gambarSubtes8-1";
    subtesContainer.appendChild(gambarSubtes8_1);
    for (var i = 0; i < subtestQuestions.length; i++) {
        var currentSoalNumber = startIndex + i + 1; 
        var soalData = subtestQuestions[i];
        var isGambar1 = currentSoalNumber >= 117 && currentSoalNumber <= 128;
        var isGambar2 = currentSoalNumber >= 129 && currentSoalNumber <= 136;
        var isGambar3 = indexSubtest === 8;
        if (!gambarAdded_1 && isGambar1) {
            var pElement = document.createElement("p");
            pElement.className = "w-100 text-center  ins-gambar";
            pElement.innerHTML = "<strong>Gambar Soal Nomor 117 - 128</strong>";
            subtesContainer.appendChild(pElement);

            var gambarSubtes7_1 = createGambarSubtes(currentSoalNumber, img_1);
            subtesContainer.appendChild(gambarSubtes7_1);
            gambarAdded_1 = true;
        }
        if (!gambarAdded_2 && isGambar2) {
            var pElement = document.createElement("p");
            pElement.className = "w-100 text-center ins-gambar";
            pElement.innerHTML = "<strong>Gambar Soal Nomor 129 - 136</strong>";
            subtesContainer.appendChild(pElement);

            var gambarSubtes7_2 = createGambarSubtes(currentSoalNumber, img_2);
            subtesContainer.appendChild(gambarSubtes7_2);
            gambarAdded_2 = true;
        }
        if (!gambarAdded_3 && isGambar3) {
            var pElement3 = document.createElement("p");
            pElement3.className = "w-100 text-center mt-3 ins-gambar";
            pElement3.innerHTML = "<strong>Gambar Soal Nomor 137 - 156</strong>";
            subtesContainer.appendChild(pElement3);
            var gambarSubtes8_1 = createGambarSubtes(currentSoalNumber, img_3);
            subtesContainer.appendChild(gambarSubtes8_1);
            gambarAdded_3 = true;
        }
        var soalDiv;
        var indexSubtest = sessionStorage.getItem("indexSubtest");
        const selectedValues = myAnswerSplit[indexSubtest - 1];
        const valAnswer = selectedValues[i];
        if (jenisSoal === "pilihan_ganda") {
            soalDiv = createPilihanGandaSoalDiv(
                currentSoalNumber,
                jenisSoal,
                soalData,
                valAnswer
            );
        } else if (jenisSoal === "essay") {
            soalDiv = createEssaySoalDiv(
                currentSoalNumber,
                jenisSoal,
                soalData,
                valAnswer
            );
        } else if (jenisSoal === "pilihan_ganda_gambar") {
            soalDiv = createPilihanGandaGambarSoalDiv(
                currentSoalNumber,
                jenisSoal,
                soalData,
                valAnswer
            );
        }

        if (isGambar1) {
            var gambarSubtes7_1 = document.getElementById("gambarSubtes7-1");
            gambarSubtes7_1.appendChild(soalDiv);
        } else if (isGambar2) {
            var gambarSubtes7_2 = document.getElementById("gambarSubtes7-2");
            gambarSubtes7_2.appendChild(soalDiv);
        } else if (isGambar3) {
            var gambarSubtes8_1 = document.getElementById("gambarSubtes8-1");
            gambarSubtes8_1.appendChild(soalDiv);
        }

        subtesContainer.appendChild(soalDiv);
    }

    var lastQuestionNumber = startIndex + subtestQuestions.length;
    var lastQuestionRadioButton = $(
        `input[type='radio'][name='soal_${lastQuestionNumber}']`
    );

    lastQuestionRadioButton.on("change", function () {
        var currentSoalNumber = $(this).attr("name").replace("soal_", "");
        var jawaban = $(this).val();
        simpanJawaban(currentSoalNumber, jawaban);
    });
}

function createGambarSubtes(currentSoalNumber, img) {
    var gambarDiv = document.createElement("div");
    gambarDiv.id = `gambarSubtes-${currentSoalNumber}`;
    gambarDiv.classList.add("card", "col-10", "text-center");

    var cardBody = document.createElement("div");
    cardBody.classList.add("card-body", "align-items-center", "justify-content");


    var gambarimg = img;
    gambarDiv.classList.add("img-fluid", "mx-auto");
    gambarDiv.appendChild(gambarimg);


    gambarDiv.appendChild(cardBody);
    gambarDiv.style.padding = "10px";
    gambarDiv.style.height = "80px";
    gambarDiv.style.marginBottom = "20px";
    gambarDiv.style.position = "sticky"; 
    gambarDiv.style.top = "0"; 
    gambarDiv.style.zIndex = "100";

    $("#ujian-form").scroll(function () {
        var ujianForm = $(this);
        var data2 = $("#gambarSubtes-" + currentSoalNumber);
        var instruk = $(".ins-gambar");

        var ujianFormScrollTop = ujianForm.scrollTop();
        var data2OffsetTop = data2.position().top;

        if (ujianFormScrollTop >= data2OffsetTop) {
            cardBody.style.position = "-webkit-sticky";
            cardBody.style.position = "sticky";
            cardBody.style.top = "20px";
            cardBody.style.zIndex = "1000";
            cardBody.style.padding = "0 50px";
            cardBody.style.background = "white";


            instruk.style.position = "-webkit-sticky";
            instruk.style.position = "sticky";
            instruk.style.top = "0";
            instruk.style.zIndex = "999";
            instruk.style.padding = "0 50px";
            instruk.style.background = "white";
        } else {
            cardBody.style.position = "static";
            cardBody.style.zIndex = "auto";
            cardBody.style.padding = "0";
            cardBody.style.background = "none";
        }
    });
    return gambarDiv;
}

function createPilihanGandaSoalDiv(currentSoalNumber, jenisSoal, soalData, valAnswer) {
    var indexSubtest = sessionStorage.getItem("indexSubtest");
    var soalDiv = document.createElement("div");
    var descSoal = soalData.question_Desc;
    if (indexSubtest == 2) {
        descSoal = "";
    }
    soalDiv.className = `soal ${jenisSoal} card`;
    soalDiv.innerHTML = `
        <div class="row">
                <div class="col-2 bg-primary rounded text-white text-center m-3 d-flex align-items-center justify-content-around">
                    <p class="soal ${jenisSoal}" style="margin-bottom:0;">Soal ${currentSoalNumber}</p>
                </div>
                <div class="col pl-3">
                    <div class="row">
                        <p class="soal ${jenisSoal}"><strong>${descSoal}</strong></p>
                    </div>
                    <div class="row">
                          <div class="col form-check form-check-inline align-items-start text-left">
                            <!-- Isi untuk pilihan ganda di sini -->
            `;

    soalData.tblMultipleChoices.forEach(function (pilihan, index) {
        var isChecked = (String.fromCharCode(65 + index)) === valAnswer ? 'checked' : '';
        soalDiv.querySelector(".form-check").innerHTML += `
        <div class="col">
            <label class="form-check-label" style="cursor: pointer">
                <input class="form-check-input" style="cursor: pointer" type='radio'
                name='soal_${currentSoalNumber}' value='${String.fromCharCode(65 + index)}' id='soalId_${soalData.question_ID}' ${isChecked}>

                ${pilihan.multiple_Choice_Desc}
            </label>
        </div>
        `;

        var inputRadio = soalDiv.querySelector(
            `input[type='radio'][name='soal_${currentSoalNumber}'][value='${String.fromCharCode(
                65 + index
            )}']`
        );

        $(".form-check").on("change", 'input[type="radio"]', function () {
            var currentSoalNumber = $(this).attr("name").replace("soal_", ""); 
            var jawaban = $(this).val();

            simpanJawaban(currentSoalNumber, jawaban);
        });
    });

    soalDiv.innerHTML += `
        </div>
        <hr/>
    `;

    return soalDiv;
}

function createEssaySoalDiv(currentSoalNumber, jenisSoal, soalData, valAnswer) {
    const finalAnswer = (valAnswer === "0" || valAnswer === undefined) ? '' : valAnswer;
    var indexSubtest = sessionStorage.getItem("indexSubtest");

    let ind = "text";
    let soal = ``;
    if (parseInt(indexSubtest) === 6) {
        var num6Soal = soalData.question_Desc.split(",");
        soal += `<div class="text-left" style="justify-content: space-around;
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            height: 100%;
            font-size: 16px;
            margin-top: 1.5rem;">`;
        for (let a = 0; a < num6Soal.length; a++) {
            soal += `<p>${num6Soal[a]}</p>`;
        }
        soal += `</div>`;
    } else {
        soal += `<p class="soal ${jenisSoal}"><strong>${soalData.question_Desc}</strong></p>`;
    }

    var soalDiv = document.createElement("div");
    soalDiv.className = `soal ${jenisSoal} card`;
    soalDiv.innerHTML =
        `
        <style>

        /* Hide the default number input arrows */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        input[type="number"] {
            -moz-appearance: textfield;
        }
        </style>
        <div class="card-body p-0 mx-2">
        <div class="row">
                    <div class="col-md bg-primary rounded text-white m-3 d-flex justify-content-around align-items-center">
                        <p class="soal ${jenisSoal} text-center">Soal ${currentSoalNumber}</p>
                    </div>
                    <div class="col-md-6 align-self-center text-center">` +
        soal +
        `
                    </div>
                    <div class="col-md-3">
                        <input type='${ind}' class="form-control" name='soal_${currentSoalNumber}' id='soalId_${soalData.question_ID}' style="margin-top:1.5rem;border-color: black;" autocomplete="off" value="${finalAnswer}">
                    </div>
                </div>
                <hr/>
                `;


    var inputEssay = soalDiv.querySelector(
        `input[type='${ind}'][name='soal_${currentSoalNumber}']`
    );
    if (parseInt(indexSubtest) === 5 || parseInt(indexSubtest) === 6) {
        inputEssay.addEventListener('keypress', function (evt) {
            validate(evt);
        });
    } else if (parseInt(indexSubtest) === 4) {
        inputEssay.addEventListener('keypress', function (evt) {
            validate4(evt);
        });
    }
    inputEssay.addEventListener("input", function () {
        var currentSoalNumber = this.getAttribute("name").replace("soal_", ""); 
        var jawaban = this.value; 
        simpanJawaban(currentSoalNumber, jawaban);
    });

    return soalDiv;
}

function createPilihanGandaGambarSoalDiv(
    currentSoalNumber,
    jenisSoal,
    soalData,
    valAnswer
) {
    var baseUrl = "/image/test_assets/IST/";
    var indexSubtest = sessionStorage.getItem("indexSubtest");
    var imageUrl = "";
    if (parseInt(indexSubtest) === 7) {
        imageUrl = baseUrl + "subtes7/" + soalData.question_Desc;
    } else if (parseInt(indexSubtest) === 8) {
        imageUrl = baseUrl + "subtes8/" + soalData.question_Desc;
    } else {
        imageUrl = baseUrl + "default_image.png";
    }
    var soalDiv = document.createElement("div");
    soalDiv.className = `soal ${jenisSoal} card col-md-3 m-2`;
    soalDiv.innerHTML = `
    <br>
    <br>
    <div class="card">
            <div class="soal ${jenisSoal} card-header bg-primary rounded text-white text-center">
                Soal ${currentSoalNumber}
            </div>
        <div class="card-body shadow bg-white rounded">
                <div class="col text-center img">
                    <img src='${imageUrl}' class="img-fluid" alt='Gambar Soal ${currentSoalNumber}'>
                </div>
                    <div class="text-center form-check justify-content-between">
                        <!-- Isi untuk pilihan ganda di sini -->
                   
    `;

    soalData.tblMultipleChoices.forEach(function (pilihan, index) {
        var isChecked = (String.fromCharCode(65 + index)) === valAnswer ? 'checked' : '';
        soalDiv.querySelector(".form-check").innerHTML += `
        <label class="form-check-label" style="cursor: pointer">
            <input class="form-check-input" style="cursor: pointer" type='radio' name='soal_${currentSoalNumber}' value='${String.fromCharCode(
            65 + index
        )}' id='soalId_${soalData.question_ID}' ${isChecked}>
            ${pilihan.multiple_Choice_Desc}
        </label>
    `;

        var inputRadio = soalDiv.querySelector(
            `input[type='radio'][name='soal_${currentSoalNumber}'][value='${String.fromCharCode(
                65 + index
            )}']`
        );

        $(".form-check").on("change", 'input[type="radio"]', function () {
            var currentSoalNumber = $(this).attr("name").replace("soal_", ""); // Mendapatkan nomor soal dari atribut 'name'
            var jawaban = $(this).val(); // Mendapatkan nilai radio button yang dipilih
            simpanJawaban(currentSoalNumber, jawaban);
        });
    });
    soalDiv.innerHTML += `
        </div>
        <hr/>
    `;
    return soalDiv;
}

function storeAnswer(data, isTestFinish) {
    var indexSubtest = sessionStorage.getItem("indexSubtest");
    $("#loading").show();
    $.ajax({
        type: "PUT",
        url: ApiUrl + "/api/ParticipantAnswer/StoredAnswer",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        async: false,
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        success: function (result) {
            $("#loading").hide();
            if (isTestFinish == "finish") {
                sessionStorage.removeItem("timeSubtest" + indexSubtest);
                sessionStorage.setItem("indexSubtest", parseInt(indexSubtest) + 1);
                sessionStorage.removeItem("tabChange");
                sessionStorage.removeItem("jawabanPengguna");
                window.location.href = "/dotest/instruction/ist";
            } else if (isTestFinish == "forceFinish") {
                if (indexSubtest < dataUjian.subtest.length) {
                    indexSubtest++;
                    sessionStorage.setItem("indexSubtest", indexSubtest);
                    sessionStorage.setItem(
                        "tabChange",
                        sessionStorage.getItem("tabChange") - 1
                    );
                    window.location.href = "/dotest/instruction/ist";
                } else {
                    sessionStorage.removeItem("timeSubtest" + indexSubtest);
                    sessionStorage.removeItem("indexSubtest");
                    sessionStorage.removeItem("jawabanPengguna");
                    window.sessionStorage.removeItem("tabChange");
                    window.location.href = "/user/page2";
                }
            } else if (isTestFinish == "nextTest") {
                var jawabanPengguna =
                    JSON.parse(sessionStorage.getItem("jawabanPengguna")) ||
                    Array(dataUjian.totalSoal).fill("0");

                sessionStorage.setItem(
                    "jawabanPengguna",
                    JSON.stringify(jawabanPengguna)
                );
                if (indexSubtest < dataUjian.subtest.length) {
                    sessionStorage.removeItem("timeSubtest" + indexSubtest);
                    indexSubtest++;
                    sessionStorage.setItem("indexSubtest", indexSubtest);
                    sessionStorage.setItem(
                        "tabChange",
                        sessionStorage.getItem("tabChange") - 1
                    );
                    window.location.href = "/dotest/instruction/ist";
                }
            }
        },
        error: function (errorMessage) {
            $("#loading").hide();
            Swal.fire(errorMessage.responseText, "", "error");
        },
    });
}

function validation() {
    Swal.fire({
        title: "Apakah kamu yakin?",
        text: "Kamu tidak akan bisa kembali!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#4CAF50",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, Kirim!",
        cancelButtonText: "Kembali",
    }).then((result) => {
        if (result.isConfirmed) {
            return true;
        }
        return false;
    });
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
    var flag = ",SAFE";
    const totalSoal = dataUjian.totalSoal;
    if (!finisAnswer) {
        finisAnswer = Array(totalSoal).fill("0");
        sessionStorage.setItem("jawabanPengguna", JSON.stringify(finisAnswer));
    }

    var kosong = "0";
    for (var i = 0; i < totalSoal; i++) {
        if (finisAnswer[i] !== undefined && finisAnswer[i] !== null) {
            arrayJawaban.push(finisAnswer[i]);
        } else {
            arrayJawaban.push(kosong);
        }
    }
    switch (status) {
        case 1:
                $.ajax({
                    url: ApiUrl + "/api/Participant/GetResultTestIST",
                    method: "POST", 
                    contentType: "application/json", 
                    data: JSON.stringify(arrayJawaban), 
                    dataType: "json",
                    async: false,
                    success: function (result) {
                        answe = result.data;
                        if (sessionStorage.getItem("tabChange") > 0) {
                            flag = ",VIOLATION/" + sessionStorage.getItem("tabChange");
                        }
                    },
                    error: function (err) {
                        if (err.responseJSON.data === "0") {
                            answe = "invalid";
                        } else {
                            answe = "error";
                        }
                    },
                });
            break;
        default:
            answe = "";
    }
    if (answe !== 0) {
        answe += flag;
        //Jika indexsubtes tidak ke 9 maka invalid
        if (indexSubtest < dataUjian.subtest.length) {
            answe = "INVALID"
        } 

        var stored = {
            answer: arrayJawaban.toString(),
            final_score: answe.toUpperCase(),
            test_id: tesActive,
            participant_id: parseInt(sessionStorage.getItem("participantId")),
            capture: filePicture,
            status: true,
        };
        storeAnswer(stored, "forceFinish");

        return;
    }
}

function validate(evt) {
    var theEvent = evt || window.event;

    if (theEvent.type === 'paste') {
        key = theEvent.clipboardData.getData('text/plain');
    } else {
        var key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
    }
    var regex = /[0-9]|\./;
    if (!regex.test(key)) {
        if (theEvent.preventDefault) {
            theEvent.preventDefault();
        } else {
            theEvent.returnValue = false;
        }
    }
}

function validate4(evt) {
    var theEvent = evt || window.event;
    if (theEvent.type === 'paste') {
        key = theEvent.clipboardData.getData('text/plain');
    } else {
        var key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
    }
    var regex = /^[a-zA-Z\s]+$/;
    if (!regex.test(key)) {
        if (theEvent.preventDefault) {
            theEvent.preventDefault();
        } else {
            theEvent.returnValue = false;
        }
    }
}

