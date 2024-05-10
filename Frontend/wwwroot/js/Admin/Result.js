var numAge = 0;
var resultGraph1 = [];
var resultGraph2 = [];
var resultGraph3 = [];

let validIST = 0;

$(document).ready(function () {
    var objString = sessionStorage.getItem("lempardata");
    var obj = JSON.parse(objString);

    const printBtn = document.getElementById("downloadPage") ?? "";
    const elements =
        document.querySelectorAll(".table-striped tbody tr:nth-of-type(odd)") ?? "";
    const canvas = document.getElementById("myChart");
    const tesName = window.location.pathname.split("/").pop();

    printBtn.addEventListener("click", (event) => {
        setTimeout(() => {
            if (tesName == "ist") {
                ist_PDF();
            } else if (tesName == "disc") {
                disc_PDF();
            } else if (tesName == "rmib") {
                rmib_PDF();
            } else if (tesName == "papikostick") {
                papikostick_PDF();
            } else if (tesName == "msdt") {
                msdt_PDF();
            }


            setTimeout(() => {
                elements.forEach((element) => {
                    element.style.background = "rgba(0,0,0,.05)";
                });
                printBtn.style.display = "block";
                document.body.style.letterSpacing = "";
            }, 1000);
        }, 100);
    });



    function ist_PDF() {
        const participantName = $("#Nama").text();

        elements.forEach((element) => {
            element.style.background = "antiquewhite";
        });

        document.body.style.letterSpacing = "2px";
        printBtn.style.display = "none";

        const { jsPDF } = window.jspdf;


        let doc = new jsPDF("l", "mm", [1200, 1400]);
        let pdfjs = document.querySelector(".card");


        let x = 12;
        let y = 12;

        let contentWidth = pdfjs.offsetWidth;
        let contentHeight = pdfjs.offsetHeight;
        let cTes = obj.testid;

        if (cTes === 5) {
            contentHeight - 150;
            contentWidth - 250;
        }

        x = (doc.internal.pageSize.width - contentWidth) / 2;
        y = (doc.internal.pageSize.height - contentHeight) / 2;

        doc.setFont("times", "normal");
        doc.rect(x, y, contentWidth, contentHeight, "F");

        html2canvas(pdfjs).then((cardCanvas) => {
            doc.addImage(
                cardCanvas.toDataURL("image/jpeg"),
                "JPEG",
                x,
                y,
                contentWidth,
                contentHeight
            );

            doc.save(tesName + "-" + participantName + ".pdf");
        });
    }

    function disc_PDF() {
        const participantName = $("#Nama").text();

        elements.forEach((element) => {
            element.style.background = "antiquewhite";
        });

        document.body.style.letterSpacing = "2px";
        printBtn.style.display = "none";

        const { jsPDF } = window.jspdf;

        let doc = new jsPDF("p", "mm", [1500, 1500]);
        let pdfjs = document.querySelector(".card");

        let x = 12;
        let y = 12;

        let contentWidth = pdfjs.offsetWidth;
        let contentHeight = pdfjs.offsetHeight;
        let cTes = obj.testid;

        if (cTes === 5) {
            contentHeight - 150;
            contentWidth - 250;
        }

        x = (doc.internal.pageSize.width - contentWidth) / 2;
        y = (doc.internal.pageSize.height - contentHeight) / 2;

        doc.setFont("times", "normal");

        doc.rect(x, y, contentWidth, contentHeight, "F");

        html2canvas(pdfjs).then((cardCanvas) => {
            doc.addImage(
                cardCanvas.toDataURL("image/jpeg"),
                "JPEG",
                x,
                y,
                contentWidth,
                contentHeight
            );

            doc.save(tesName + "-" + participantName + ".pdf");
        });
    }

    function rmib_PDF() {
        const participantName = $("#Nama").text();

        elements.forEach((element) => {
            element.style.background = "antiquewhite";
        });

        document.body.style.letterSpacing = "2px";
        printBtn.style.display = "none";

        const { jsPDF } = window.jspdf;

        let doc = new jsPDF("p", "mm", [1400, 1500]);
        let pdfjs = document.querySelector(".card");

        let x = 12;
        let y = 12;

        let contentWidth = pdfjs.offsetWidth;
        let contentHeight = pdfjs.offsetHeight;
        let cTes = obj.testid;

        if (cTes === 5) {
            contentHeight - 150;
            contentWidth - 250;
        }

        x = (doc.internal.pageSize.width - contentWidth) / 2;
        y = (doc.internal.pageSize.height - contentHeight) / 2;

        doc.setFont("times", "normal");

        doc.rect(x, y, contentWidth, contentHeight, "F");

        html2canvas(pdfjs).then((cardCanvas) => {
            doc.addImage(
                cardCanvas.toDataURL("image/jpeg"),
                "JPEG",
                x,
                y,
                contentWidth,
                contentHeight
            );

            doc.save(tesName + "-" + participantName + ".pdf");
        });
    }

    function papikostick_PDF() {
        const participantName = $("#Nama").text();

        elements.forEach((element) => {
            element.style.background = "antiquewhite";
        });

        document.body.style.letterSpacing = "2px";
        printBtn.style.display = "none";

        const { jsPDF } = window.jspdf;

        let doc = new jsPDF("p", "mm", [2250, 1350]);


        let pdfjs = document.querySelector(".card");

        let x = 12;
        let y = 12;

        let contentWidth = pdfjs.offsetWidth;
        let contentHeight = pdfjs.offsetHeight;
        let cTes = obj.testid;

        if (cTes === 5) {
            contentHeight - 150;
            contentWidth - 250;
        }

        x = (doc.internal.pageSize.width - contentWidth) / 2;
        y = (doc.internal.pageSize.height - contentHeight) / 2;

        doc.setFont("times", "normal");
        doc.rect(x, y, contentWidth, contentHeight, "F"); // 'F' stands for 'fill'

        html2canvas(pdfjs).then((cardCanvas) => {
            doc.addImage(
                cardCanvas.toDataURL("image/jpeg"),
                "JPEG",
                x,
                y,
                contentWidth,
                contentHeight
            );

            doc.save(tesName + "-" + participantName + ".pdf");
        });
    }

    function msdt_PDF() {
        const participantName = $("#Nama").text();

        elements.forEach((element) => {
            element.style.background = "antiquewhite";
        });

        document.body.style.letterSpacing = "2px";
        printBtn.style.display = "none";

        const { jsPDF } = window.jspdf;

        let doc = new jsPDF("l", "mm", [1200, 1400]);
        let pdfjs = document.querySelector(".card");

        let x = 12;
        let y = 12;

        let contentWidth = pdfjs.offsetWidth;
        let contentHeight = pdfjs.offsetHeight;
        let cTes = obj.testid;

        if (cTes === 5) {
            contentHeight - 150;
            contentWidth - 250;
        }

        x = (doc.internal.pageSize.width - contentWidth) / 2;
        y = (doc.internal.pageSize.height - contentHeight) / 2;

        doc.setFont("times", "normal");

        doc.rect(x, y, contentWidth, contentHeight, "F");

        html2canvas(pdfjs).then((cardCanvas) => {
            doc.addImage(
                cardCanvas.toDataURL("image/jpeg"),
                "JPEG",
                x,
                y,
                contentWidth,
                contentHeight
            );

            doc.save(tesName + "-" + participantName + ".pdf");
        });
    }
    $("#resetBut").click(function () {
        const id = this.getAttribute("data-id");
        const email = this.getAttribute("data-email");
        resetTest(id, email);
    });
    debugger;
    $("#Nama").text(obj.nama);
    $("#Email").text(obj.email);
    $("#NIK").text(obj.nik);
    $("#Telp").text(obj.telp);
    $("#Screenshot").attr("src", "/image/facecapturing/" + obj.screenshot);
    $("#WaktuTest").text(obj.createDate);

    let nik = obj.nik;
    if (!nik) {
        $("#gender").text("INVALID NIK");
        $("#usia").text("INVALID NIK");
        $("#NIK").text("INVALID NIK");
    }
    if (tesName === "ist" && !nik) {
        $("#nikInvalid").show();
        $("#downloadPage").hide();
        return;
    }
    if (nik) {
        var substringnik = nik.substring(6, 12);
        var gender = determineGender(substringnik);
        document.getElementById("gender").innerHTML = gender;
        var age = extractDateAndAge(substringnik);
        document.getElementById("usia").innerHTML = age.age;

        var ageInYear = age.age.split(",");
        numAge = ageInYear[0].replace(/\D/g, "") ?? 0;
    }


    var participantAnswerId = obj.idparticipantAnswer;

    answerTest(participantAnswerId);


});

function answerTest(participantAnswerId) {
    $.ajax({
        url:
            ApiUrl +
            "/api/ParticipantAnswer/GetParticipantAnswerById/" +
            participantAnswerId,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        success: function (result) {
            var existingDataString = sessionStorage.getItem("lempardata");
            var existingData = JSON.parse(existingDataString);

            var obj = {
                nama: existingData.nama,
                email: existingData.email,
                nik: existingData.nik,
                screenshot: existingData.screenshot,
                telp: existingData.telp,
                testId: existingData.testId,
                idparticipantAnswer: existingData.idparticipantAnswer,
                finalScore: result.data.finalScore,
                id_participant: result.data.participantId,
                createDate: existingData.createDate
            };
            var forInvalid = {
                id: obj.idparticipantAnswer,
                email: obj.email,
            };
            const lempar = sessionStorage.setItem("lempardata", JSON.stringify(obj));

            var objString = sessionStorage.getItem("lempardata");
            var obj = JSON.parse(objString);
            var testid = obj.testId;
            var finalanswer = obj.finalScore;
            var checking = finalanswer.split(",");
            var lastdata = checking[checking.length - 1];
            var flag = "";
            if (lastdata.includes("/")) {
                var checkslash = lastdata.split("/");
                flag = checkslash;
            } else {
                flag = lastdata;
            }
            switch (testid) {
                case 4:
                    if (validIST > 0) {
                        $("#nikInvalid").show();
                        $("#downloadPage").hide();
                    } else {
                        if (finalanswer.toLowerCase() === "invalid") {
                            invalidVIew(forInvalid);
                        } else {
                            if (lastdata.includes("/")) {
                                $("#violation").show();
                                $("#totalviolation").html(
                                    "<b>" + flag[flag.length - 1] + "</b>"
                                );
                            } else {
                                $("#safe").show();
                            }
                            $("#valueIst").show();
                            var score = result.data.finalScore;
                            var splitScore = score.split(",");
                            splitScore.pop();
                            var jml = 0;
                            for (let i = 0; i < splitScore.length; i++) {
                                jml += parseInt(splitScore[i]);
                            }
                            splitScore.push(jml);
                            score = splitScore.toString();
                            writeScore(score, "Rw");
                            swConversion(splitScore, numAge);
                        }
                    }
                    break;
                case 5:
                    if (finalanswer.toLowerCase() === "invalid") {
                        invalidVIew(forInvalid);
                    } else {
                        if (lastdata.includes("/")) {
                            $("#violation").show();
                            $("#totalviolation").html("<b>" + flag[flag.length - 1] + "</b>");
                        } else {
                            $("#safe").show();
                        }
                        $("#valueDisc").show();
                        finalscoredisc(finalanswer);
                    }
                    break;
                case 6:
                    if (finalanswer.toLowerCase() === "invalid") {
                        invalidVIew(forInvalid);
                    } else {
                        if (lastdata.includes("/")) {
                            $("#violation").show();
                            $("#totalviolation").html("<b>" + flag[flag.length - 1] + "</b>");
                        } else {
                            $("#safe").show();
                        }
                        $("#valueRmib").show();
                        finalscorermib(finalanswer);
                    }
                    break;
                case 7:
                    if (finalanswer.toLowerCase() === "invalid") {
                        invalidVIew(forInvalid);
                    } else {
                        if (lastdata.includes("/")) {
                            $("#violation").show();
                            $("#totalviolation").html("<b>" + flag[flag.length - 1] + "</b>");
                        } else {
                            $("#safe").show();
                        }
                        $("#valuePapikostick").show();
                        finalscorepapikostick(finalanswer);
                    }
                    break;
                case 11:
                    if (finalanswer.toLowerCase() === "invalid") {
                        invalidVIew(forInvalid);
                    } else {
                        if (lastdata.includes("/")) {
                            $("#violation").show();
                            $("#totalviolation").html("<b>" + flag[flag.length - 1] + "</b>");
                        } else {
                            $("#safe").show();
                        }
                        $("#valueMsdt").show();

                        var status = finalanswer.split(",")[0];
                        finalscoreMsdt(status);
                    }
                    break;
                default:
                    return console.error("no test id");
            }
        },
        error: function (errorMessage) { },
    });
}

function checkValidNik(substringnik) {
    var tanggal = parseInt(substringnik.substring(0, 2));
    var bulan = parseInt(substringnik.substring(2, 4));
    const tesName = window.location.pathname.split("/").pop();
    var invalidDate = tanggal > 72 || tanggal < 0;
    var invalidMonth = bulan < 1 || bulan > 12;
    if (substringnik.toString() === "000000" || invalidDate || invalidMonth) {
        if (tesName === "ist") {
            validIST += 1;
            $("#downloadPage").hide();
            return false;
        }
    }
    return true;
}
function determineGender(substringnik) {
    var tanggal = parseInt(substringnik.substring(0, 2));

    if (!checkValidNik(substringnik)) {
        return "INVALID NIK";
    }

    var isWomen = tanggal - 40 > 0;
    if (isWomen) {
        return "Perempuan";
    } else {
        return "Laki-laki";
    }
}

function extractDateAndAge(substringnik) {
    var tanggal = parseInt(substringnik.substring(0, 2));
    var bulan = parseInt(substringnik.substring(2, 4));
    var tahun = substringnik.substring(4, 6);
    if (!checkValidNik(substringnik)) {
        return { age: "INVALID NIK" };
    }
    var today = new Date();
    var currentYear = today.getFullYear();
    var currentMonth = today.getMonth() + 1;
    var currentDay = today.getDate();

    if (parseInt(tahun) <= 49) {
        tahun = "20" + tahun;
    } else if (parseInt(tahun) <= 99) {
        tahun = "19" + tahun;
    } else {
    }

    if (tanggal >= 40) {
        tanggal -= 40;
    }

    var ageInMilliseconds = today - new Date(`${tahun}-${bulan}-${tanggal}`);
    var ageInDays = ageInMilliseconds / (1000 * 60 * 60 * 24);
    var ageYears = Math.floor(ageInDays / 365);
    var ageMonths = Math.floor((ageInDays % 365) / 30);

    return {
        age: `${ageYears} tahun, ${ageMonths} bulan`,
    };
}

function formatDate(substringnik) {
    var tahun = "19" + substringnik.substring(4, 6);

    var bulan = substringnik.substring(2, 4);
    var tanggalAngka = substringnik.substring(0, 2);

    var namaBulan;
    switch (bulan) {
        case "01":
            namaBulan = "Januari";
            break;
        case "02":
            namaBulan = "Februari";
            break;
        case "03":
            namaBulan = "Maret";
            break;
        case "04":
            namaBulan = "April";
            break;
        case "05":
            namaBulan = "Mei";
            break;
        case "06":
            namaBulan = "Juni";
            break;
        case "07":
            namaBulan = "Juli";
            break;
        case "08":
            namaBulan = "Agustus";
            break;
        case "09":
            namaBulan = "September";
            break;
        case "10":
            namaBulan = "Oktober";
            break;
        case "11":
            namaBulan = "November";
            break;
        case "12":
            namaBulan = "Desember";
            break;
        default:
            namaBulan = "Bulan tidak valid";
            break;
    }

    var tanggalLengkap = tanggalAngka + " " + namaBulan + " " + tahun;

    return tanggalLengkap;
}

//msdt
function finalscoreMsdt(finalanswer) {
    $("#Finalscore").text(finalanswer);

    $(
        "#deserter, #missionary, #autocratic, #compromiser, #bureaucratic, #developer, #benevolent-autocratic, #executive"
    ).hide();

    finalanswer = finalanswer.toLowerCase();
    if (finalanswer === "deserter") {
        $("#deserter").show();
    } else if (finalanswer === "missionary") {
        $("#missionary").show();
    } else if (finalanswer === "autocratic") {
        $("#autocratic").show();
    } else if (finalanswer === "compromiser") {
        $("#compromiser").show();
    } else if (finalanswer === "bureaucratic") {
        $("#bureaucratic").show();
    } else if (finalanswer === "developer") {
        $("#developer").show();
    } else if (finalanswer === "benevolent autocrat") {
        $("#benevolent-autocratic").show();
    } else if (finalanswer === "executive") {
        $("#executive").show();
    }
}

//ist
function writeScore(score, scoreContext) {
    var splitScore = score.split(",");
    $("#se" + scoreContext).text(splitScore[0]);
    $("#wa" + scoreContext).text(splitScore[1]);
    $("#an" + scoreContext).text(splitScore[2]);
    $("#ge" + scoreContext).text(splitScore[3]);
    $("#ra" + scoreContext).text(splitScore[4]);
    $("#zr" + scoreContext).text(splitScore[5]);
    $("#fa" + scoreContext).text(splitScore[6]);
    $("#wu" + scoreContext).text(splitScore[7]);
    $("#me" + scoreContext).text(splitScore[8]);
    $("#jml" + scoreContext).text(splitScore[9]);
    if (splitScore.length > 10) {
        splitScore[10] =
            splitScore[10] !== "#N/A (#N/A)"
                ? splitScore[10]
                : "0 (Mental Defective)";
        $("#iqScore").text("IQ = " + splitScore[10]);
    }
}
function swConversion(score, age) {
    score.lenth != 9 ? score.pop() : null;
    $.ajax({
        url: ApiUrl + "/api/Participant/convertIST?age=" + age,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        data: JSON.stringify(score),
        success: function (result) {
            var scoreData = result.data;
            writeScore(scoreData, "Sw");
        },
        error: function (errorMessage) {
            alert(errorMessage.responseText);
        },
    });
}

//papi kostick
function finalscorepapikostick(finalanswer) {
    var checkValue = finalanswer.split(",");
    checkValue.pop();
    for (let i = 0; i < checkValue.length; i++) {
        const rowId = `skor${i + 1}`;
        const score = checkValue[i];
        document.getElementById(rowId).textContent = score;
    }

    const canvasElement = document.getElementById("chart");
    canvasElement.width = 800;

    Chart.defaults.global.legend.display = false;
    Chart.helpers.merge(Chart.defaults.global.plugins.datalabels, {
        opacity: 1,
        textAlign: "left",
        color: "white",
        borderColor: "#11469e",
        borderWidth: 2,
        borderRadius: 100,
        font: {
            weight: "bold",
            size: 12,
            lineHeight: 1,
        },
        padding: {
            top: 5,
        },
        display: false,
        backgroundColor: function (context) {
            return context.hovered ? context.dataset.borderColor : "white";
        },
        color: function (context) {
            return context.hovered ? "white" : context.dataset.borderColor;
        },
        listeners: {
            enter: function (context) {
                context.hovered = true;
                return true;
            },
            leave: function (context) {
                context.hovered = false;
                return true;
            },
        },
    });

    const data = {
        labels: [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
        ],
        datasets: [
            {
                label: "",
                backgroundColor: "rgba(38,120,255,0.2)",
                borderColor: "rgba(38,120,255, 1)",
                data: [
                    checkValue[0],
                    checkValue[1],
                    checkValue[2],
                    checkValue[3],
                    checkValue[4],
                    checkValue[5],
                    checkValue[6],
                    checkValue[19],
                    checkValue[9],
                    checkValue[8],
                    checkValue[7],
                    checkValue[10],
                    checkValue[11],
                    checkValue[12],
                    checkValue[13],
                    9 - checkValue[14],
                    checkValue[15],
                    9 - checkValue[16],
                    checkValue[17],
                    checkValue[18],
                ]
            },
        ],
    };

    const options = {
        title: {
            display: true,
            position: `bottom`,
        },
        plugins: {
            display: false,
            datalabels: {
                formatter: function (value, context) {
                    return context.chart.data.labels[context.value];
                },
            },
        },
        scale: {
            angleLines: {
                display: true,
            },
            pointLabels: {
                fontSize: 20,
                fontColor: "black",
                fontStyle: "bold",
                callback: function (value, index, values) {
                    return value;
                },
            },
            ticks: {
                min: 0,
                max: 9,
                stepSize: 1,
                beginAtZero: true,
            },
        },
        legend: {
            labels: {
                padding: 10,
                fontSize: 14,
                lineHeight: 30,
            },
        },
    };

    const myChart = new Chart(canvasElement, {
        type: "radar",
        data: data,
        options: options,
    });
}

//RMIB
function finalscorermib(finalanswer) {
    const label = [
        "Outdoor",
        "Mechanical",
        "Computational",
        "Scientific",
        "Personal Contact",
        "Aesthetic",
        "Literary",
        "Musical",
        "Social Service",
        "Clerical",
        "Practical",
        "Medical",
    ];
    var skor = finalanswer.split(",").slice(0, 12).map(Number);
    var rank = finalanswer.split(",").slice(12, 24).map(Number);

    const valuesToFind = [1, 2, 3];
    const indexes = getRankIndexes(rank, valuesToFind);
    indexes.sort((a, b) => rank[a] - rank[b]);

    const sortedLabels = indexes.map((index) => label[index]);

    Chart.defaults.global.legend.display = false;
    var ctx = document.getElementById("myChart").getContext("2d");
    var ctx = document.getElementById("myChart");
    Chart.defaults.global.defaultFontSize = 15;
    ctx.height = 350;
    var myChart = new Chart(ctx, {
        type: "horizontalBar",
        data: {
            labels: label,
            datasets: [
                {
                    label: "",
                    data: skor,
                    backgroundColor: [
                        "#c5d2db",
                        "#2096ba",
                        "#e7b183",
                        "#c5919d",
                        "#df6e21",
                        "#fad5a6",
                        "#fbb79e",
                        "#866768",
                        "#e25f70",
                        "#4c384a",
                        "#6c4f70",
                        "#39324b",
                    ],
                    borderColor: [],
                    borderWidth: 1,
                    pointBorderColor: "#0d6e86",
                    pointStyle: "rectRounded",
                    pointRadius: 5,
                    lineTension: 0,

                    borderWidth: 4,
                },
            ],
        },
        options: {
            scales: {
                xAxes: [
                    {
                        ticks: {
                            min: 0,
                            max: 100,
                            stepSize: 10,
                            beginAtZero: true,
                        },
                    },
                ],
            },
        },
    });

    for (let i = 0; i < sortedLabels.length; i++) {
        const minatBakat = document.getElementById(`minat-bakat${i + 1}`);
        minatBakat.querySelector("b").textContent = sortedLabels[i];

        if (sortedLabels[i] === "Outdoor") {
            minatBakat.querySelector(
                "p"
            ).innerHTML += `Outdoor merupakan jenis pekerjaan yang berhubungan dengan aktivitas di luar ruangan, atau
aktivitas lapangan ataupun aktivitas yang memungkinkan untuk melakukan kegiatan di luar
ruangan, yang membutuhkan mobilitas dan bergerak dari satu tempat ke tempat lainnya.
`;
        } else if (sortedLabels[i] === "Mechanical") {
            minatBakat.querySelector(
                "p"
            ).innerHTML += `Mengidentifikasi jenis pekerjaan yang menggunakan mesin, peralatan mesin, alat gerak
mekanik. Menyukai kegiatan yang mempelajari prinsip mekanik dan pengoperasiannya dan
juga memanipulasi, memanfaatkan dan memodifikasi, memperbaiki ataupun memfungsikan
berbagai peralatan. Tes ini juga berusaha untuk bisa melihat seberapa besar keinginan dan
kemauan individu untuk terlibat dan mengembangkan kontribusinya untuk menggunakan alat
guna mengasilkan produk tertentu.
`;
        } else if (sortedLabels[i] === "Computational") {
            minatBakat.querySelector(
                "p"
            ).innerHTML += `Berupaya untuk mendeteksi rasa suka atau tidak suka seseorang berhubungan dengan angka,
operasi hitungan, analisa berhubungan dengan angka, melakukan manipulasi, forecasting
yang berhubungan dengan angka. Individu menikmati bekerja dengan angka.`;
        } else if (sortedLabels[i] === "Scientific") {
            minatBakat.querySelector(
                "p"
            ).innerHTML += `Scientific merupakan pekerjaan yang berhubungan dengan analisa, penyelidikan, penelitian,
eksperiman dan berbagai hal yang berhubungan dengan ilmu pengetahuan. Individu
menunjukkan kemauan, kontribusi, komitmen untuk mengembangkan dan bekerja dengan
angka. Ia tidak segan berkreasi dan memaknakan data numerik.`;
        } else if (sortedLabels[i] === "Personal Contact") {
            minatBakat.querySelector(
                "p"
            ).innerHTML += `Personal Contact mengidentifikasi minat pada pekerjaan yagn berhubungan dengan manusia, hubungan
interpersonal, melakukan pendektan personal, menjalin diskusi, dan juga hubungan dengan
relasi personal, minat di bidang ini melibatkan dorongan untuk menjalin hubungan dan
melakukan pendekatan pada orang.`;
        } else if (sortedLabels[i] === "Aesthetic") {
            minatBakat.querySelector(
                "p"
            ).innerHTML += `Aesthetic mengidentifikasi rasa suka akan pekerjaan yang berhubungan dengan seni, baik sebagai
penikmat seni atau orang yang memproduksi seni atau berhubungan dengan kreasi seni,
memanipulasi, menggunakan alat maupun melakukan aktivitas yang bersifat memproduksi
musik, seni ataupun menjadi ahli atau penikmat seni yang menghayati aspek estetika.`;
        } else if (sortedLabels[i] === "Literary") {
            minatBakat.querySelector(
                "p"
            ).innerHTML += `Literary merupakan upaya untuk identifikasi pekerjaan yang berkaitan dengan membaca buku,
membaca, mengarang, aktivitas yang berhubungan dengan kata, kalimat, dan segala bentuk
kegiatan literature, seperti menulis, mengarang, dan sebagainya. Baik sebagai penikmat yang
cerdas, menunjukkan kemauan untuk bisa terlibat.
`;
        } else if (sortedLabels[i] === "Musical") {
            minatBakat.querySelector(
                "p"
            ).innerHTML += `Musical mengidentifikasi aktivitas yang berhubungan dengan pekerjaan yang berkaitan dengan music,
beik dalam bentuk menyeleksi music, hingga melakukan aktivitas seperti memainkan alat
music, menciptakan lagu, instrumentalia. Bisa juga digunakan untuk identifikasi seberapa
besar komitmen dan kesungguhannya dalam menunjukkan kontribusi dalam menjalankan
aktivitas berhubungan dengan musik.`;
        } else if (sortedLabels[i] === "Social Service") {
            minatBakat.querySelector(
                "p"
            ).innerHTML += `Social Service menyangkut minat yang berhubungan dengan aktivitas yang berkaitan dengan kehidupan
sosial, pelayanan masyarakat, berbagai bentuk layanan pada penduduk dengan keinginan
untuk menolong dan membimbing atau memberikan jalan keluar mengenai masalah sosial.
Menunjukkan kepedulian dan kontribusi dan kemauan untuk memperhatikan, memikirkan
membantu dan juga mendukung kehidupan sesama manusia yang lebih baik.`;
        } else if (sortedLabels[i] === "Clerical") {
            minatBakat.querySelector(
                "p"
            ).innerHTML += `Clerical berhubungan dengan minat untuk pekerjaan yang berhubungan dengan tugas – tugas
rutin,tugas yang membutuhkan kecekatan dan ketrampilan tanga, memanipulasi dan
merekayasa objek dengan mengandalkan kecermatan, konsistensi dan kerapihan pada objek
yang memutuhkan perhatian pada unsur detil
`;
        } else if (sortedLabels[i] === "Practical") {
            minatBakat.querySelector(
                "p"
            ).innerHTML += `Practical menyangkut rasa suka atau tidak suka akan pekerjaan yang sifatnya praktis, membutuhkan
keahlian, dan keterampilan untuk membuat suatu objek tertentu. Menyangkut kemampuan
memproduksi, memanipulasi ataupun memodifikasi objek atau benda.`;
        } else if (sortedLabels[i] === "Medical") {
            minatBakat.querySelector(
                "p"
            ).innerHTML += `Medical mengidentifikasi pekerjaan yang berkaitan dengan pengobatan, penyembuhan, dan juga
perawatan secara medis ataupun yang berhubungan dengan Kesehatan. Menunjukkan
perhatian, keterlibatan, kontribusi dan waktu untuk melakukan kegiatan yang berhubungan
dengan`;
        }
    }
}

//DISC
function finalscoredisc(finalanswer) {
    var datatable = finalanswer.split(",").slice(0, 15).map(Number);
    var string = finalanswer.split(",").slice(15, 17).map(String);
    var desc = finalanswer.split(",").slice(17);
    desc.pop();

    const lemparData = JSON.parse(sessionStorage.getItem("lempardata"));

    var most = finalanswer.split(",").slice(0, 4).map(Number);
    var least = finalanswer.split(",").slice(5, 9).map(Number);
    var change = finalanswer.split(",").slice(10, 14).map(Number);

    if (datatable.length === 15) {
        for (let i = 0; i < datatable.length; i++) {
            const rowId = `data${i + 1}`;
            const finalScore = datatable[i];
            document.getElementById(rowId).textContent = finalScore;
        }

        let totalmost = 0;
        let totalleast = 0;
        let totalchange = 0;

        for (let i = 0; i < datatable.length; i++) {
            if (i >= 0 && i < 5) {
                totalmost += datatable[i];
            } else if (i >= 5 && i < 10) {
                totalleast += datatable[i];
            } else if (i >= 10 && i < 15) {
                totalchange += datatable[i];
            }
        }

        document.getElementById("totalmost").textContent = totalmost;
        document.getElementById("totalleast").textContent = totalleast;
        document.getElementById("totalchange").textContent = totalchange;
    }
    $("#Finalscore").text(string[0] + " - " + string[1]);
    $("#desdisc").text(desc);

    linechartdisc(most, least, change);
}

function linechartdisc(graph1, graph2, graph3) {
    $(document).ready(function () {
        Chart.defaults.global.legend.display = false;
        Chart.defaults.global.defaultFontFamily = "arial";
        Chart.defaults.global.defaultFontSize = 8;

        function createChart(canvasId, label, data) {
            var canvas = document.getElementById(canvasId + "Chart");
            var ctx = canvas.getContext("2d");

            new Chart(ctx, {
                type: "line",
                plugins: [
                    {
                        beforeDraw: function (chartInstance) {
                            let ctx = chartInstance.chart.ctx;
                            ctx.fillStyle = "white";
                            ctx.fillRect(
                                0,
                                0,
                                chartInstance.chart.width,
                                chartInstance.chart.height
                            );
                        },
                    },
                ],
                data: {
                    labels: ["D", "I", "S", "C"],
                    datasets: [
                        {
                            label: label,
                            data: data,
                            pointBorderColor: "blue",
                            fill: false,
                            pointStyle: "rectRounded",
                            borderColor: [
                                "rgba(255,99,132,1)",
                                "rgba(54, 162, 235, 1)",
                                "rgba(255, 206, 86, 1)",
                                "rgba(75, 192, 192, 1)",
                                "rgba(153, 102, 255, 1)",
                                "rgba(255, 159, 64, 1)",
                            ],
                            borderWidth: 4,
                        },
                    ],
                },
                options: {
                    scales: {
                        yAxes: [
                            {
                                ticks: {
                                    min: -19,
                                    max: 19,
                                    stepSize: 5,
                                    beginAtZero: false,
                                    display: false,
                                },
                            },
                        ],
                    },
                    animation: {
                        onComplete: async function () {
                            this.options.animation.onComplete = null;
                            const image = canvas.toDataURL("image/jpeg");
                            document.getElementById(canvasId).value = image + "_image";
                        },
                    },
                },
            });
        }

        getDataGraphDISC(graph1, graph2, graph3);
        createChart("Graph1", "Mask - Public Self", resultGraph1);
        createChart("Graph2", "Core - Private Self", resultGraph2);
        createChart("Graph3", "Mirror - Perceived Self", resultGraph3);
    });
}

function getDataGraphDISC(graph1, graph2, graph3) {
    var dataGraph1 = graph1;
    var dataGraph2 = graph2;
    var dataGraph3 = graph3;

    const graphDisc = {
        graph1: [
            [
                20,
                16,
                15,
                null,
                null,
                14,
                13,
                null,
                null,
                12,
                11,
                10,
                null,
                null,
                9,
                null,
                8,
                7,
                null,
                6,
                null,
                5,
                4,
                null,
                3,
                null,
                null,
                null,
                2,
                null,
                null,
                1,
                null,
                0,
                null,
                null,
                null,
                null,
            ],
            [
                17,
                10,
                null,
                9,
                null,
                7,
                null,
                null,
                null,
                null,
                6,
                5,
                null,
                null,
                null,
                null,
                4,
                null,
                null,
                null,
                null,
                3,
                null,
                null,
                2,
                null,
                null,
                null,
                null,
                null,
                1,
                null,
                0,
                null,
                null,
                null,
                null,
                null,
            ],
            [
                19,
                null,
                13,
                null,
                11,
                null,
                10,
                null,
                null,
                9,
                null,
                8,
                7,
                null,
                null,
                null,
                6,
                5,
                null,
                null,
                4,
                null,
                3,
                null,
                null,
                null,
                2,
                null,
                null,
                1,
                0,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
            ],
            [
                14,
                null,
                10,
                9,
                8,
                7,
                null,
                null,
                null,
                null,
                null,
                6,
                null,
                null,
                5,
                null,
                null,
                4,
                null,
                null,
                3,
                null,
                null,
                null,
                2,
                null,
                null,
                null,
                null,
                null,
                1,
                null,
                0,
                null,
                null,
                null,
                null,
                null,
            ],
        ],
        graph2: [
            [
                0,
                null,
                null,
                null,
                1,
                null,
                null,
                2,
                null,
                null,
                null,
                null,
                3,
                null,
                null,
                null,
                4,
                null,
                5,
                6,
                null,
                7,
                8,
                null,
                9,
                10,
                11,
                null,
                null,
                12,
                null,
                13,
                14,
                15,
                16,
                null,
                18,
                21,
            ],
            [
                null,
                0,
                null,
                1,
                null,
                null,
                null,
                null,
                null,
                2,
                null,
                null,
                3,
                null,
                null,
                null,
                4,
                null,
                null,
                5,
                null,
                null,
                null,
                6,
                null,
                null,
                7,
                null,
                null,
                8,
                null,
                9,
                null,
                10,
                null,
                15,
                null,
                19,
            ],
            [
                0,
                null,
                1,
                2,
                null,
                null,
                null,
                null,
                null,
                3,
                null,
                null,
                4,
                null,
                null,
                5,
                null,
                6,
                null,
                null,
                7,
                null,
                8,
                null,
                null,
                9,
                null,
                null,
                null,
                10,
                11,
                12,
                null,
                13,
                null,
                18,
                null,
                19,
            ],
            [
                0,
                null,
                1,
                null,
                2,
                null,
                null,
                null,
                null,
                3,
                null,
                null,
                4,
                null,
                null,
                5,
                null,
                null,
                6,
                7,
                null,
                null,
                null,
                null,
                9,
                null,
                10,
                null,
                null,
                11,
                null,
                null,
                12,
                null,
                null,
                null,
                13,
                15,
            ],
        ],
        graph3: [
            [
                20,
                16,
                15,
                14,
                13,
                12,
                10,
                null,
                null,
                9,
                8,
                7,
                null,
                null,
                null,
                5,
                3,
                null,
                1,
                0,
                -2,
                -3,
                -4,
                null,
                -6,
                -7,
                -9,
                null,
                null,
                -10,
                null,
                -11,
                -12,
                -15,
                null,
                null,
                -20,
                -21,
            ],
            [
                17,
                15,
                null,
                8,
                7,
                6,
                5,
                4,
                null,
                null,
                null,
                3,
                null,
                2,
                null,
                1,
                null,
                0,
                null,
                -1,
                null,
                null,
                -2,
                -3,
                null,
                -4,
                -5,
                null,
                null,
                -6,
                -7,
                null,
                -8,
                -9,
                -10,
                null,
                null,
                -19,
            ],
            [
                19,
                15,
                null,
                10,
                9,
                8,
                7,
                null,
                null,
                5,
                4,
                3,
                null,
                2,
                null,
                1,
                0,
                null,
                null,
                -1,
                -2,
                -3,
                -4,
                -5,
                null,
                -6,
                -7,
                null,
                null,
                -8,
                null,
                -10,
                null,
                null,
                -12,
                null,
                null,
                -19,
            ],
            [
                14,
                null,
                7,
                5,
                4,
                null,
                3,
                2,
                null,
                null,
                1,
                null,
                null,
                0,
                null,
                null,
                -1,
                -2,
                null,
                -3,
                -4,
                null,
                null,
                null,
                -5,
                -6,
                -7,
                null,
                null,
                -8,
                -9,
                null,
                -10,
                -13,
                null,
                null,
                null,
                -15,
            ],
        ],
    };

    resultGraph1 = getIndexInGraph(dataGraph1, graphDisc.graph1);
    resultGraph2 = getIndexInGraph(dataGraph2, graphDisc.graph2);
    resultGraph3 = getIndexInGraph(dataGraph3, graphDisc.graph3);
}

function getIndexInGraph(data, graph) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
        const value = data[i];
        let found = false;

        for (let j = 0; j < graph[i].length; j++) {
            const subArray = graph[i];
            const index = subArray.indexOf(value);
            if (index !== -1) {
                if (index > 18) {
                    result.push(18 - index);
                } else {
                    result.push(19 - index);
                }
                found = true;
                break;
            }
        }

        if (!found) {
            result.push(null);
        }
    }

    return result;
}

function getRankIndexes(arr, values) {
    const indexes = [];
    for (let i = 0; i < arr.length; i++) {
        if (values.includes(arr[i])) {
            indexes.push(i);
        }
    }
    return indexes;
}

function invalidVIew(data) {
    $("#downloadPage").hide();
    $("#invalid").html(`
        <div class="col-md-12">
            <div class="card" style="box-shadow:none;">
                <div class="card-header text-center" style="background: #FFB818; margin: 0; color: white; height: 30px; padding: 5px;  width: 100%;  display: flex; align-items: center; justify-content: center;">
                    <div class="card-body text-center" style="display: flex; flex-direction: column; justify-content: center;">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <h2 id="headerfinalscore" class="card-title" style="font-size: 18px;"><strong><i class="fas fa-exclamation-triangle"></i> INVALID</strong></h2>
                    </div>
                </div>
                <div style="text-align: center;">
                    <img src="/image/Result_assets/TidakValid.png" alt="invalid" style="max-width: 50%; height: auto;">
                </div>
            </div>
        </div>
    `);

    $("#forButton").html(`
    <div class="col-12">
        <button class="bg-danger" id="resetBut" onclick="resetTest('${encodeURIComponent(
        JSON.stringify(data)
    )}')">Reset hasil tes</button>
    </div>
    `);
}

function resetTest(data) {
    var val = JSON.parse(sessionStorage.getItem("lempardata"));

    var newObj = {
        participant_id: val.id_participant,
        answer: null,
        final_score: null,
        capture: null,
        status: false,
        test_id: val.testId
    };

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "PUT",
                url: ApiUrl + "/api/ParticipantAnswer/StoredAnswer",
                data: JSON.stringify(newObj),
                contentType: "application/json; charset=utf-8",
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("token"),
                },
            }).then((result) => {
                var durations = 5;
                if (
                    result.status == 201 ||
                    result.status == 204 ||
                    result.status == 200
                ) {
                    Swal.fire({
                        title: "Deleted!",
                        text: "Reset Test Success. The page will reload in:",
                        icon: "success",
                        showConfirmButton: true,
                        timer: durations * 1000,
                        didOpen: () => {
                            const timerInterval = setInterval(() => {
                                const content = Swal.getHtmlContainer();
                                if (durations > 0) {
                                    content.innerHTML = `Reset Test Success. The page will Close in: <strong>${durations}</strong>`;
                                    durations--;
                                } else {
                                    CreateActivityUser(
                                        "Has Reset Test Participant " + val.email + " !"
                                    );
                                    clearInterval(timerInterval);
                                    window.close();
                                }
                            }, 1000);
                        },
                    }).then((res) => {
                        if (res.isConfirmed) {
                            window.close();
                        }
                    });
                }
            });
        }
    });
}
