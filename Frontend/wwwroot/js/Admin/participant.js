var table = null;

//$(document).ready(function () {

$(function () {

    table = $("#tblParticipant")
        .DataTable({
            paging: true,
            autoWidth: false,
            searching: true,
            ordering: false,
            processing: true,
            serverSide: true,
            pageLength: 10,
            lengthChange: false,

            drawCallback: function (settings) {
                // mengatur nomor urut berdasarkan halaman dan halaman terakhir
                var api = this.api();
                var startIndex = api.context[0]._iDisplayStart;
                var counter = startIndex + 1;
                api
                    .column(0, { page: "current" })
                    .nodes()
                    .each(function (cell, i) {
                        cell.innerHTML = counter;
                        counter++;
                    });
                // Untuk setiap baris dalam tabel
                api.rows().every(function (rowIdx, tableLoop, rowLoop) {
                    var data = this.data();
                    var participantId = data.participantId;
                    var violationResult = $(this.node()).find("#violationResult");

                    if (participantId) {
                        //HIT API untuk mendapatkan FInal Score yang telah displit kata terakhir VIOLATION atau bukan
                        $.ajax({
                            type: "GET",
                            url:
                                ApiUrl +
                                "/api/ParticipantAnswer/GetCheckViolationResult/" +
                                participantId,
                            headers: {
                                Authorization: "Bearer " + sessionStorage.getItem("token"),
                            },
                            success: function (result) {
                                if (result.status == "200") {
                                    //some cek di dalam array berapapun , item adalah didalamnya di matchkan / regex untuk kata VIOLATION = hasilnya true jika ada
                                    var hasViolation = result.data.some(
                                        (item) =>
                                            item.finalScore && item.finalScore.match(/VIOLATION/i)
                                    );
                                    if (hasViolation) {
                                        $(violationResult).show();
                                    } else {
                                        $(violationResult).hide();
                                    }
                                }
                            },
                        });
                    } else {
                        // Jika finalScore sudah ada, gunakan nilai yang ada
                        if (finalScore && finalScore.match(/VIOLATION/i)) {
                            // Jika finalScore berisi 'VIOLATION', tampilkan elemen 'violationResult'
                            $(violationResult).show();
                        } else {
                            // Jika tidak, sembunyikan elemen 'violationResult'
                            $(violationResult).hide();
                        }
                    }
                });
            },

            ajax: {
                url: ApiUrl + "/api/Participant/GetParByPaging",
                type: "POST",
                datatype: "json",
                dataSrc: "data",
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("token"),
                },
                statusCode: {
                    403: function () {
                        // Jika status respons adalah 403 (Forbidden), alihkan pengguna ke halaman "/dashboard"
                        window.location.href = "/error/notfound";
                    },
                },
                error: function (xhr, error, thrown) {
                    $("#tblParticipant").DataTable().clear().draw(); // Menghapus konten tabel
                },
            },
            columns: [
                {
                    data: null,
                    render: function (data, type, row, meta) {
                        return meta.row + 1;
                    },
                },
                {
                    //menampilkan data name
                    data: "account.name",
                },
                {
                    //menampilkan data nik
                    data: "nik",
                    render: function (data, type, row) {
                        // Validasi apakah NIK kosong
                        if (!data) {
                            return "Have not Input NIK";
                        } else {
                            return data;
                        }
                    },
                },

                {
                    //menampilkan data email
                    data: "account.email",
                },
                {
                    //menampilkan data telepon
                    data: "phoneNumber",
                },
                {
                    //menampilkan data access
                    data: "expiredDatetime",
                    render: function (data, type, row, meta) {
                        var currentDate = new Date();
                        var expiredDate = new Date(data);
                        var timeDiff = Math.abs(
                            currentDate.getTime() - expiredDate.getTime()
                        );
                        var diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                        var diffHours = Math.ceil(timeDiff / (1000 * 60 * 60));
                        var diffMinutes = Math.ceil(timeDiff / (1000 * 60));
                        diffDays -= 1;
                        diffHours -= 1;

                        var time = "";
                        if (diffDays !== 0) {
                            if (diffDays == 1) {
                                time = diffDays + " Day";
                            } else {
                                time = diffDays + " Days";
                            }
                        } else if (diffDays === 0 && diffHours !== 0) {
                            time = diffHours + " Hour";
                        } else {
                            time = diffMinutes + " Minute";
                        }

                        if (currentDate < expiredDate) {
                            return (
                                `<a href="#" class="badge bg-success access" style="width:100%" onclick="return grantAccess(` +
                                row.participantId +
                                `)"><i class="fas fa-clock" style="color: #f3f4f7;"></i> ${time}</a>`
                            );
                        } else {
                            return (
                                `<a href="#" class="badge bg-danger access" style="width:100%" onclick="return grantAccess(` +
                                row.participantId +
                                `)"><i class="fas fa-clock" style="color: #f3f4f7;" ></i> Access Denied </a>`
                            );
                        }
                    },
                },
                {
                    //menampilkan data status
                    data: "tblParticipantAnswers.participantId",
                    searchable: true,
                    render: function (data, type, row) {
                        let numTes = row.testCategory.testKit;
                        let lengthNumTes = numTes.split(",").length;
                        const testStatus = row.tblParticipantAnswers.map(
                            (dataObj) => dataObj.status
                        ); // ambil array status
                        let num = 0;
                        for (let i = 0; i < testStatus.length; i++) {
                            if (testStatus[i] === true) {
                                num++;
                            }
                        }

                        var currentDate = new Date();
                        var expiredDate = new Date(row.expiredDatetime);
                        if (num === lengthNumTes) {
                            return `<div class="row">
                            <div class="col">
                                <span class="badge bg-success w-100" style="color: #f3f4f7;">
                                    <i class="fas fa-pen" ></i> Complete
                                </span>
                            </div>
                            <div class="col" style="display: none" id="violationResult">
                                <span class="badge bg-danger w-100" style="color: #f3f4f7;">
                                    <i class="fas fa-exclamation-triangle"></i> VIOLATION Result
                                </span>
                            </div>
                        </div>`;
                        } else if (currentDate < expiredDate && num < lengthNumTes) {
                            return `<div class="row">
                            <div class="col">
                                <span class="badge bg-warning w-100" style="color: #f3f4f7;">
                                    <i class="fas fa-pen" style="color: #f3f4f7;"></i> On Progress
                                </span>
                            </div>
                            <div class="col" style="display: none" id="violationResult">
                                <span class="badge bg-danger w-100" style="color: #f3f4f7;">
                                    <i class="fas fa-exclamation-triangle" ></i> VIOLATION Result
                                </span>
                            </div>
                        </div>`;
                        } else {
                            return `<span class="badge bg-danger w-100" style="width:100%"><i class="fas fa-pen" style="color: #f3f4f7;"></i> Incomplete</span>`;
                        }
                    },
                },
                {
                    ////zahra 28-08-2023
                    //fix 31-08-2023 menampilkan dropdown result // update 27-09-2023
                    data: "tblParticipantAnswers.participantId",
                    render: function (data, type, row) {
                        const tblParticipantAnswers = row.tblParticipantAnswers.sort(
                            (a, b) => a.testId - b.testId
                        ); //07-09-2023

                        const testkit1 = tblParticipantAnswers.map(
                            (dataObj) => dataObj.testId
                        ); //
                        var testkit2 = row.testCategory.testKit;

                        var numTes;
                        var idtestcategory;
                        var testStatus = [];
                        var participantAnswerId = [];

                        const finalScoreStatus = tblParticipantAnswers.map(
                            (dataObj) =>
                                dataObj.finalScore && dataObj.finalScore.trim() !== ""
                                    ? dataObj.finalScore.split(",").pop()
                                    : null // Atau nilai default lainnya jika dibutuhkan
                        );

                        const testStatus1 = tblParticipantAnswers.map(
                            (dataObj) => dataObj.status
                        );
                        const participantAnswerId1 = tblParticipantAnswers.map(
                            (dataObj) => dataObj.participantAnswareId
                        );

                        if (testkit1.length > 0) {
                            const testkit = [];

                            for (let i = 0; i < testkit1.length; i++) {
                                // Cek apakah test ada di dalam teskategory
                                if (testkit2.includes(testkit1[i])) {
                                    testkit.push(testkit1[i]);
                                    testStatus.push(testStatus1[i]);
                                    participantAnswerId.push(participantAnswerId1[i]);
                                }
                            }

                            numTes = testkit.join(",").split(",").map(Number);
                            idtestcategory = row.testCategory.testCategoryId;
                        } else {
                            numTes = testkit2.split(",").map(Number);
                            idtestcategory = row.testCategory.testCategoryId;

                            testStatus = tblParticipantAnswers.map(
                                (dataObj) => dataObj.status
                            );
                            participantAnswerId = tblParticipantAnswers.map(
                                (dataObj) => dataObj.participantAnswareId
                            );
                        }

                        let resultHTML =
                            `
                        <div class="btn-group w-100" style="position: relative;">
                            <button type="button" class="btn-sm btn-secondary dropdown-toggle" data-toggle="dropdown" style="width:100%; text-align: center;" onclick="getTest(` +
                            idtestcategory + `)"> Result </button>
                            <div class="dropdown-menu" role="menu" style="width: auto; min-width: 605px; max-width: 800px; overflow-x: scroll; max-height: 850px; top: 100%; left: 0" onclick="event.stopPropagation();">
                                <div class="dropdown-item" style="width: 100%; min-height:fit-content; display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #ccc;">
                                    <div class="col-md-4" style="font-weight: bold; "><strong>Test Name</strong></div>
                                    <div class="col-md-4" style="font-weight: bold; "><strong>Status</strong></div>
                                    <div class="col-md-2" style="font-weight: bold; "><strong>Result</strong></div>
                                </div>
                                
                    `;

                        for (let i = 0; i < numTes.length; i++) {
                            const test = numTes[i];
                            let idparticipantAnswer = participantAnswerId[i];
                            let detailButtonHTML = "";
                            let testButtonText = "";
                            let testButtonColor = "";
                            if (
                                idparticipantAnswer !== null &&
                                idparticipantAnswer !== 0 &&
                                idparticipantAnswer !== undefined
                            ) {
                                if (testStatus[i]) {
                                    // Jika testStatus adalah true (selesai)
                                    if (finalScoreStatus[i]) {
                                        if (finalScoreStatus[i].match(/VIOLATION/i)) {
                                            // Jika participantAnswer adalah 'violation'
                                            detailButtonHTML = `<a href="#" onclick="showDetail(${numTes[i]}, ${idparticipantAnswer})">Detail</a>`;
                                            testButtonColor = "btn-info";
                                            testButtonText = "Violation";
                                        } else if (finalScoreStatus[i].match(/INVALID/i)) {
                                            // Jika participantAnswer adalah 'invalid'
                                            detailButtonHTML = `<a href="#" onclick="showDetail(${numTes[i]}, ${idparticipantAnswer})">Detail</a>`;
                                            testButtonColor = "btn-warning";
                                            testButtonText = "Invalid";
                                        } else {
                                            // jika safe
                                            detailButtonHTML = `<a href="#" onclick="showDetail(${numTes[i]}, ${idparticipantAnswer})">Detail</a>`;
                                            testButtonText = "Finish";
                                            testButtonColor = "btn-success";
                                        }
                                    } else {
                                        // Jika finalScoreStatus[i] adalah null, maka not complete
                                        detailButtonHTML = `<a>Not Available</a>`;
                                        testButtonText = "Not Complete";
                                        testButtonColor = "btn-danger";
                                    }
                                } else {
                                    // Jika testStatus adalah false (belum selesai)
                                    detailButtonHTML = `<a>Not Available</a>`;
                                    testButtonText = "Not Complete";
                                    testButtonColor = "btn-danger";
                                }
                            } else {
                                detailButtonHTML = `<a>Not Available</a>`;
                                testButtonText = "Not Complete"; // Default //07-09-2023
                                testButtonColor = "btn-danger"; // Default //07-09-2023
                            }

                            resultHTML += `
                            <div class="dropdown-item" style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #ccc;">
                                <div class="col-md-4 nametest${numTes[i]}" ><a>${numTes[i]}</a></div>
                                <div class="col-md-4 statustes${numTes[i]}"><a class="btn ${testButtonColor}" style="color: #f3f4f7;">${testButtonText}</a></div>
                                <div class="col-md-2">${detailButtonHTML}</div>
                            </div>
                        `;
                        }

                        var id = row.participantId;

                        // Menambahkan bagian Psikogram di bawah daftar nama test
                        resultHTML += `
                        <div class="dropdown-item" style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #ccc;">
                            <div class="col-md-4" ><a>Psikogram</a></div>
                            <div class="col-md-2"><a></a></div>
                            
                            <div class="col-md-2"><button class="btn btn-secondary" style=" background-color:#1ca2b4; align-items:left;"  id="psikogramView" onclick="generatePsikogram(${id})">Download</button></div>
                            
                        </div>
                    `;

                        resultHTML += `</div></div>`;
                        return resultHTML;
                    },
                },
                {
                    //menampilkan data kategori
                    data: "testCategory.levelCategory",
                },
                {
                    //menampilkan data applied position
                    data: "appliedPosition.appliedPosition",
                },
                {
                    //menampilkan data action
                    data: null,
                    orderable: false, // kolom Action tidak bisa di-sort
                    render: function (data, type, row, meta) {
                        return (
                            '<button class="btn btn-warning " data-placement="left" data-toggle="modal" data-animation="false" title="Edit"  onclick="return GetById(' +
                            row.participantId +
                            ')"><i class="fa fa-pen"></i></button >' +
                            "&nbsp;" +
                            '<button class="btn btn-danger" data-placement="right" data-toggle="modal" data-animation="false" title="Delete" data-index="' +
                            meta.row +
                            '" onclick="return Delete(' +
                            row.participantId +
                            ", " +
                            row.accountId +
                            ')"><i class="fa fa-trash"></i></button >'
                        );
                    },
                },
            ],
        })
        .buttons()
        .container()
        .appendTo("#example1_wrapper .col-md-6:eq(0)");


    //$.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
    //    debugger;
    //    var selectedItem = document.getElementById("testStatus").value;
    //    var status = data[6]; // Sesuaikan dengan indeks kolom status di tabel Anda
    //    console.log("testesteststatus : " + status);
    //    if (selectedItem === "showAll") {
    //        return true;
    //    }

    //    if (status.includes(selectedItem)) {
    //        return true;
    //    }

    //    return false;
    //});

    $("#refresh").click(function () {
        $(this).find("i").addClass("fa-spin");
        $('#tblParticipant').DataTable().ajax.reload();
        $(this).find("i").removeClass("fa-spin");
    })

    $("#reservationdate").datetimepicker({
        format: "DD/MM/YYYY",
        minDate: moment(), //DISABLE HARI SEBELUM HARI INI, AGAR TIDAK BISA DIPILIH

    });

    $("#reservation").daterangepicker({
        minDate: moment(),
    });



    /*AJAX for option value Applied Position*/
    function getAppliedPosition() {
        $.ajax({
            type: "GET",
            url: ApiUrl + "/api/ApplliedPosition",
            headers: {
                Authorization: "Bearer " + sessionStorage.getItem("token"),
            },
            success: function (result) {
                var $jobApplied = $("#jobApplied").select2({

                });
                $(".select2-selection__rendered").css("font-size", "16px");

                result.data.sort(function (a, b) {
                    return a.appliedPosition.localeCompare(b.appliedPosition);
                });

                $jobApplied.empty();

                var defaultOption = $("<option>")
                    .attr("value", "")  // Set the value to an empty string or any default value
                    .text("Select Applied Position");  // Set the default text
                $jobApplied.append(defaultOption);

                result.data.forEach(function (option) {
                    var optionElement = $("<option>")
                        .attr("appliedPositionId", option.appliedPositionId)
                        .attr("value", option.appliedPositionId)
                        .text(option.appliedPosition);

                    /*.text(lowercasePosition);*/
                    //optionElement.style.fontSize = "25px";
                    //optionElement.innerHTML = "String";
                    $jobApplied.append(optionElement);

                });



                // Select2
                $jobApplied
            },
            error: function (xhr, status, error) { },
        });
    }

    /*AJAX for option value Test Category*/
    function getTestCategory() {
        $.ajax({
            type: "GET",
            url: ApiUrl + "/api/TestCategory",
            headers: {
                Authorization: "Bearer " + sessionStorage.getItem("token"),
            },
            success: function (result) {

                var testCategory = $("#testCategory").select2({

                });

                $(".select2-selection__rendered").css("font-size", "16px");;

                result.data.sort(function (x, y) {
                    return x.levelCategory.localeCompare(y.levelCategory);
                });
                testCategory.empty();

                var defaultOption = $("<option>")
                    .attr("value", "")  // Set the value to an empty string or any default value
                    .text("Select Level Category");  // Set the default text
                testCategory.append(defaultOption);

                result.data.forEach(function (option) {
                    var optionElement = $("<option>")
                        .attr("testCategoryId", option.testCategoryId)
                        .attr("value", option.testCategoryId)
                        .text(option.levelCategory);
                    testCategory.append(optionElement);
                });
            },
            error: function (xhr, status, error) { },
        });
    }

    getAppliedPosition();
    getTestCategory();

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            table.ajax.reload();
        }
    });

    // fungsi untuk tampilkan dan download view dari pskogram
    const printBtn = $("#psikogramView");

    printBtn.on("click", function (event) {
        setTimeout(function () {
            generatePDF();
            setTimeout(function () {
                elements.forEach(function (element) {
                    element.style.background = "rgba(0,0,0,.05)";
                });
                printBtn.css("display", "block");
                $("body").css("letter-spacing", "");
            }, 1000);
        }, 100);
    });

});

//zahra 29-08-2023
//fix 31/08/2023
function getTest(idTestCat) {
    $.ajax({
        type: "GET",
        url: ApiUrl + "/api/TestCategory/Test/" + idTestCat,
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        success: function (result) {
            var dataTes = result.data.testKit;
            var numTes = dataTes.split(",").map(Number);

            numTes.forEach(function (option) {
                fetch(ApiUrl + "/api/Test/" + option, {
                    headers: {
                        Authorization: "Bearer " + sessionStorage.getItem("token"),
                    },
                    async: false,
                })
                    .then((response) => response.json())
                    .then((data) => {
                        var tesnem = data.data.testName;
                        $(".nametest" + option).text(tesnem);
                    })
                    .catch((error) => { });
            });
        },
        error: function (xhr, status, error) { },
    });
}

//zahra 04-09-2023
function showDetail(testId, idparticipantAnswer) {
    var detailUrl;
    $("#loading").show();

    $.ajax({
        url:
            ApiUrl +
            "/api/ParticipantAnswer/GetParticipantAnswerById/" +
            idparticipantAnswer,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        //token jwt
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        success: function (result) {
            GetCreateDateByParticipantAnswerId(idparticipantAnswer)
                .then(function (createDateTest) {
                    var obj = {
                        participantId: result.data.participantId,
                        nama: result.data.participant.account.name,
                        email: result.data.participant.account.email,
                        nik: result.data.participant.nik,
                        screenshot: result.data.capturePicture,
                        telp: result.data.participant.phoneNumber,
                        testId: result.data.testId,
                        idparticipantAnswer: idparticipantAnswer,
                        createDate: createDateTest
                    }; //data yang didapat dari API

                    var objString = JSON.stringify(obj);

                    sessionStorage.setItem("lempardata", objString);
                    $("#loading").hide();

                    // Tambahkan pernyataan kondisional untuk menentukan URL detail berdasarkan testId
                    if (testId === 4) {
                        detailUrl = "/participant/ist";
                    } else if (testId === 5) {
                        // Contoh lain
                        detailUrl = "/participant/disc";
                    } else if (testId === 6) {
                        // Contoh lain
                        detailUrl = "/participant/rmib";
                    } else if (testId === 7) {
                        // Contoh lain
                        detailUrl = "/participant/papikostick";
                    } else if (testId === 11) {
                        // Contoh lain
                        detailUrl = "/participant/msdt";
                    }

                    // Membuka halaman detail dalam tab atau jendela baru
                    window.open(detailUrl, "_blank");

                })
                .catch(function (error) {
                    console.error("Terjadi kesalahan saat mengirim permintaan PUT:", error);
                });
        },
        error: function (errorMessage) {
            $("#loading").hide();

            alert(errorMessage.responseText);
        },
    });
}

function grantAccess(id) {
    if (getRole !== "Super Admin" && getRole !== "Admin") {
        return CheckAuthRole();
    }
    $.ajax({
        url: ApiUrl + "/api/Participant/GetParById/" + id,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        success: function (result) {
            var obj = result.data;
            $("#id").val(obj[0].participantId);
            $("#idAccount").val(obj[0].accountId);
            $("#fullName").val(obj[0].account.name);
            $("#exampleInputEmail1").val(obj[0].account.email);
            $.ajax({
                type: "GET",
                url: ApiUrl + "/api/ApplliedPosition",
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("token"),
                },
                success: function (result) {
                    var $jobApplied = $("#jobApplied");
                    $jobApplied.empty();
                    result.data.forEach(function (option) {
                        var optionElement = $("<option>")
                            .attr("appliedPositionId", option.appliedPositionId)
                            .attr("value", option.appliedPositionId)
                            .text(option.appliedPosition);
                        $jobApplied.append(optionElement);
                        if (option.appliedPositionId === obj[0].appliedPositionId) {
                            optionElement.attr("selected", "selected");
                        }
                    });
                },
                error: function (xhr, status, error) { },
            });
            $("#phone").val((obj[0].phoneNumber));
            $.ajax({
                type: "GET",
                url: ApiUrl + "/api/TestCategory",
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("token"),
                },
                success: function (result) {
                    var testCategory = $("#testCategory");
                    testCategory.empty();
                    result.data.forEach(function (option) {
                        var optionElement = $("<option>")
                            .attr("testCategoryId", option.testCategoryId)
                            .attr("value", option.testCategoryId)
                            .text(option.levelCategory);
                        if (option.testCategoryId === obj[0].testCategoryId) {
                            optionElement.attr("selected", "selected");
                        }
                        testCategory.append(optionElement);
                    });
                },
                error: function (xhr, status, error) { },
            });

            const now = new Date();
            const expiredDateTime = new Date(obj[0].expiredDatetime);
            if (now < expiredDateTime) {
                Swal.fire({
                    title: "Granted new Access",
                    text: "You Only Can Added Access When Participant Access is Denied",
                    icon: "question",
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Close",
                    allowOutsideClick: false,
                });
                return;
            }

            $("#fortitle").text("Edit Access");

            $("#myModal").modal("show");
            $(".acc").css("display", "none"); //hide form
            $("#UpdateBtn").hide();
            $("#AddButton").hide();
            $("#granted").show();
            $("#accessTime").val("");
            $("#accTime").show();
            $("#colsNik").hide();
        },
        error: function (errorMessage) {
            alert(errorMessage.responseText);
        },
    });
}

function GrantedAccess() {
    if (getRole !== "Super Admin" && getRole !== "Admin") {
        return CheckAuthRole();
    }
    dayjs.extend(window.dayjs_plugin_customParseFormat);
    const date = $("#accessTime").val();
    const currentTime = dayjs();
    const currentHour = currentTime.hour();

    if (new Date(dayjs(date, "DD/MM/YYYY")) < new Date(currentTime)) {
        Swal.fire("Gagal", `Expired Time Can't Before Today's Date!`, "error");
        return;
    }

    let day = 3;
    if (currentHour >= 12) {
        day = 4;
    }
    let expired = "";
    if (date === "" || date === "Invalid Date") {
        expired = dayjs()
            .add(day, "day")
            .set("hour", 12)
            .set("minute", 00)
            .set("second", 00)
            .format("YYYY-MM-DDTHH:mm:ss");
    } else {
        expired = dayjs(date, "DD/MM/YYYY")
            .set("hour", 12)
            .set("minute", 00)
            .set("second", 00)
            .format("YYYY-MM-DDTHH:mm:ss");
    }

    if (
        $("#id").val() === "" ||
        $("#idAccount").val() === "" ||
        $("#fullName").val() === "" ||
        $("#exampleInputEmail1").val() === "" ||
        $("#jobApplied").val() === "" ||
        $("#phone").val() === "" ||
        $("#testCategory").val() === ""
    ) {
        Swal.fire("Error", "Semua field harus diisi.", "error");
        return; // Menghentikan pengiriman data jika ada field yang kosong
    }

    var Account = {
        ParticipantId: $("#id").val(),
        Account_Id: $("#idAccount").val(),
        Name: $("#fullName").val(),
        Email: $("#exampleInputEmail1").val(),
        Applied_position: $("#jobApplied").val(),
        Phone: $("#phone").val(),
        ExpiredDatetime: expired,
        Test_Category: $("#testCategory").val(),
    };

    Swal.fire({
        title: "Do you want to give added time for this participant?",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Yes",
        denyButtonText: `No`,
    }).then((result) => {
        if (result.isConfirmed) {
            $("#loading").show();

            $.ajax({
                url: ApiUrl + "/api/Participant/ResendEmail",
                type: "PUT",
                data: JSON.stringify(Account),
                contentType: "application/json; charset=utf-8",
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("token"),
                },
                success: function (result) {
                    $("#loading").hide();

                    if (
                        result.status == 201 ||
                        result.status == 204 ||
                        result.status == 200
                    ) {
                        Swal.fire("Successfull Send Email!", "", "success");
                        $("#tblParticipant").DataTable().ajax.reload();
                        //aksi history Log
                        CreateActivityUser(
                            "Has Add Time Access To participant " + Account.Email + "!"
                        );
                    }
                },
                error: function (errorMessage) {
                    $("#loading").hide();

                    Swal.fire(errorMessage.responseJSON.message, "", "error");
                },
            });
        } else if (result.isDenied) {
            Swal.fire("Changes are not saved", "", "info");
        }
    });
}

function ClearScreen() {
    if (getRole !== "Super Admin" && getRole !== "Admin") {
        return CheckAuthRole();
    }
    $("#myModal").modal("show");
    $("#fullName").val("");
    $("#exampleInputEmail1").val("");
    $("#phone").val("");
    $("#testCategory").val("").trigger("change");
    $("#jobApplied").val("").trigger("change");
    $("#accessTime").val("");
    $("#UpdateBtn").hide();
    $("#AddButton").show();
    $(".acc").show();
    $("#groupnik").hide();
    $("#accTime").show();
    $("#granted").hide();
    $("#fortitle").text("Add Participant");
    $("#exampleInputEmail1").prop("disabled", false);
    $("#jobApplied").prop("disabled", false);
    $("#testCategory").prop("disabled", false);


    //$("#loading").hide();
    //$("#colsNik").hide(); 
    //$("#testCategory").val(null).trigger("change"); //BACK TO DEFAULT VALUE IF U PRESS BACK OR CANCELING
    //$("#jobApplied").val(null).trigger("change"); //BACK TO DEFAULT VALUE IF U PRESS BACK OR CANCELING

    //REMOVE VALIDATION KETIKA BUKA FORM

    $("#fullName").removeClass("is-valid");
    $("#exampleInputEmail1").removeClass("is-valid");
    $("#phone").removeClass("is-valid");
    $("#testCategory").removeClass("is-valid");
    $("#jobApplied").removeClass("is-valid");

    $("#fullName").removeClass("is-invalid");
    $("#exampleInputEmail1").removeClass("is-invalid");
    $("#phone").removeClass("is-invalid");
    $("#testCategory").removeClass("is-invalid");
    $("#jobApplied").removeClass("is-invalid");

    /*var submitButton = $('#AddButton');
    submitButton.prop('disabled', true);*/


}

function formValidation() {
    let arrFormInput = $("#formAdd").find('.form-control, .form-control-sm');
    arrFormInput.each(function () {
        let id = $(this).attr('id');
        if (id !== "nik" && id !== "accessTime") {
            const conValid = "is-valid";
            const conInvalid = "is-invalid";
            const idValidated = $("#" + id + "");
            const value = idValidated.val();
            value === "" || /^\s*$/.test(value) ? idValidated.addClass(conInvalid) : idValidated.addClass(conValid);

            //conditional validation
            if (value !== "" && id === "exampleInputEmail1" && $(this).val().indexOf("@") === -1 && $(this).val().indexOf(".") === -1) {
                idValidated.removeClass(conValid)
                    .addClass(conInvalid);
            } else if (value !== "" && id === "phone" && value.length < 10) {
                idValidated.removeClass(conValid)
                    .addClass(conInvalid)
            } else if (value !== "" && id === "exampleInputEmail1" && $(this).val().indexOf("@") === -1 && $(this).val().indexOf(".") === -1) {
                idValidated.removeClass(conValid).addClass(conInvalid)
            }

            idValidated.change(function (e) {
                e.preventDefault();
                $(this).val() === "" || /^\s*$/.test($(this).val()) ?
                    idValidated.addClass(conInvalid).removeClass(conValid) :
                    idValidated.addClass(conValid).removeClass(conInvalid);

                $(this).val() !== "" && !/^\s*$/.test($(this).val())
                    ? idValidated.removeClass(conInvalid).addClass(conValid)
                    : "";
                switch (id) {
                    case "exampleInputEmail1":
                        $(this).val() === "" || $(this).val().indexOf("@") === -1 && $(this).val().indexOf(".") === -1
                            ? idValidated.removeClass(conValid).addClass(conInvalid)
                            : idValidated.removeClass(conInvalid).addClass(conValid);

                    case "phone":
                        $(this).val() === "" || $(this).val().length < 10
                            ? idValidated.removeClass(conValid)
                                .addClass(conInvalid)
                            : idValidated.removeClass(conInvalid).addClass(conValid);
                    default:
                        ""
                }
            })
        }

    });
    const firstInvalidElement = arrFormInput.filter('.is-invalid').first();
    if (firstInvalidElement.length > 0) {
        firstInvalidElement.focus();
    }
    return firstInvalidElement.length > 0 ? false : true;
}
function Save() {
    $("#loading").show();

    const valid = formValidation();
    if (valid === false) {
        $("#loading").hide();

        return;
    }
    if (getRole !== "Super Admin" && getRole !== "Admin") {
        return CheckAuthRole();
    }
    dayjs.extend(window.dayjs_plugin_customParseFormat);
    var defaultPassword = "123456";
    var defaultRole = 4;
    const date = $("#accessTime").val();
    const currentTime = dayjs();

    if (new Date(dayjs(date, "DD/MM/YYYY")) < new Date(currentTime)) {
        expiredTimeBeforeNow = true;
        Swal.fire("Gagal", `Expired Time Can't Before Today's Date!`, "error");
        $("#loading").hide();

        return;
    }
    const currentHour = currentTime.hour();
    let day = 3;
    if (currentHour >= 12) {
        day = 4;
    }
    let expired = "";
    if (date === "" || date === "Invalid Date") {
        expired = dayjs()
            .add(day, "day")
            .set("hour", 12)
            .set("minute", 00)
            .set("second", 00)
            .format("YYYY-MM-DDTHH:mm:ss");
    } else {
        expired = dayjs(date, "DD/MM/YYYY")
            .set("hour", 12)
            .set("minute", 00)
            .set("second", 00)
            .format("YYYY-MM-DDTHH:mm:ss");
    }


    //validasi by role
    if (getRole !== "Super Admin" && getRole !== "Admin") {
        $("#myModal").modal("hide");
        $("#loading").hide();

        Swal.fire(
            "Failed!",
            "Only Super Admin Or Admins have access to this Action!",
            "error"
        );
        return;
    }


    var Account = {
        Name: $("#fullName").val(),
        Email: $("#exampleInputEmail1").val(),
        Password: defaultPassword,
        RoleId: defaultRole,
        Applied_position: $("#jobApplied").val(),
        Phone: $("#phone").val(),
        ExpiredDatetime: expired,
        Test_Category: $("#testCategory").val(),
    };

    $.ajax({
        type: "POST",
        url: ApiUrl + "/api/Participant/Insert",
        data: JSON.stringify(Account),
        contentType: "application/json; charset=utf-8",
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        success: function (result) {
            $("#loading").hide();
            $("#myModal").modal("hide");

            Swal.fire({
                icon: "success",
                title: "Input Participant Success",
                showConfirmButton: false,
                timer: 1500,
            });

            //hide validation after success create
            let arrFormInput = $("#formAdd").find('.form-control, .form-control-sm');
            arrFormInput.each(function () {
                let id = $(this).attr('id');
                const idValidated = $("#" + id + "");
                const conValid = "is-valid";
                const conInvalid = "is-invalid";
                idValidated.removeClass(conValid).removeClass(conInvalid).val("");
            });

            $("#tblParticipant").DataTable().ajax.reload();

            //aksi history Log
            CreateActivityUser("Has registered participant " + Account.Email + "!");
        },
        error: function (errorMessage) {

            $("#loading").hide();
            if (errorMessage.responseJSON.message === "Email Sudah Terdaftar") {
                $("#exampleInputEmail1")
                    .removeClass("is-valid")
                    .addClass("is-invalid");

                $("#emailNo").hide();
                $("#emailExist").show();
            }
            Swal.fire("Failed!", errorMessage.responseJSON.message, "error");
        },
    });
}


function EditValidation() {
    let arrFormInput = $("#formAdd").find('.fullName, .phone, .nik');
    arrFormInput.each(function () {
        let id = $(this).attr('id');
        if (id !== "nik" && id !== "accessTime") {
            const conValid = "is-valid";
            const conInvalid = "is-invalid";
            const idValidated = $("#" + id + "");
            const value = idValidated.val();
            value === "" || /^\s*$/.test(value) ? idValidated.addClass(conInvalid) : idValidated.addClass(conValid);

            //conditional validation
            if (value !== "" && id === "fullName" && /^[a-zA-Z\s]*$/.test($(this).val())) {
                idValidated.removeClass(conValid)
                    .addClass(conInvalid);
            } else if (value !== "" && id === "phone" && value.length < 10) {
                idValidated.removeClass(conValid)
                    .addClass(conInvalid)
            } else if (value !== "" && id === "nik" && value.length < 16) {
                idValidated.removeClass(conValid).addClass(conInvalid)
            }

            idValidated.change(function (e) {
                e.preventDefault();
                $(this).val() === "" || /^\s*$/.test($(this).val()) ?
                    idValidated.addClass(conInvalid).removeClass(conValid) :
                    idValidated.addClass(conValid).removeClass(conInvalid);

                $(this).val() !== "" && !/^\s*$/.test($(this).val())
                    ? idValidated.removeClass(conInvalid).addClass(conValid)
                    : "";
                switch (id) {
                    case "fullName":
                        $(this).val() === "" || /^[a-zA-Z\s]*$/.test($(this).val())
                            ? idValidated.removeClass(conValid).addClass(conInvalid)
                            : idValidated.removeClass(conInvalid).addClass(conValid);

                    case "nik":
                        $(this).val() === "" || $(this).val().length < 16
                            ? idValidated.removeClass(conValid)
                                .addClass(conInvalid)
                            : idValidated.removeClass(conInvalid).addClass(conValid);
                    default:
                        ""
                }
            })
        }

    });
    const firstInvalidElement = arrFormInput.filter('.is-invalid').first();
    if (firstInvalidElement.length > 0) {
        firstInvalidElement.focus();
    }
    return firstInvalidElement.length > 0 ? false : true;
}

function GetById(participantId) {
    var EditButton = $('#UpdateBtn');


    if (getRole !== "Super Admin" && getRole !== "Admin") {
        return CheckAuthRole();
    }

    /*EditValidation();*/


    $('#fullName').on('input', function () {
        var inputFullname = $(this).val();

        // Menghapus karakter selain angka dari input
        var cleanedInputFullName = inputFullname.replace(/[^a-zA-Z\s]/g, '');

        // Menyesuaikan nilai input dengan yang sudah dibersihkan
        $(this).val(cleanedInputFullName);

        // Memeriksa panjang input dan apakah hanya mengandung angka
        if (cleanedInputFullName === "") {
            $(this).removeClass('is-valid').addClass('is-invalid');
            EditButton.prop('disabled', true);
        } else {
            this.setCustomValidity('');
            $(this).removeClass('is-invalid').addClass('is-valid');
            EditButton.prop('disabled', false);
        }
    });
    $('#nik').on('input', function () {

        var inputNik = $(this).val();

        // Menghapus karakter selain angka dari input
        var cleanedInputNIK = inputNik.replace(/\D/g, '');

        // Menyesuaikan nilai input dengan yang sudah dibersihkan
        $(this).val(cleanedInputNIK);


        // Memeriksa panjang input dan apakah hanya mengandung angka
        if (!/^\d+$/.test(cleanedInputNIK) || cleanedInputNIK.length < 16) {
            $(this).removeClass('is-valid').addClass('is-invalid');
            EditButton.prop('disabled', true);
        } else {
            this.setCustomValidity('');
            $(this).removeClass('is-invalid').addClass('is-valid');
            EditButton.prop('disabled', false);
        }
    });

    $('#phone').on('input', function () {

        var inputPhone = $(this).val();

        // Menghapus karakter selain angka dari input
        var cleanedInput = inputPhone.replace(/\D/g, '');

        // Menyesuaikan nilai input dengan yang sudah dibersihkan
        $(this).val(cleanedInput);

        // Memeriksa panjang input dan apakah hanya mengandung angka
        if (!/^\d+$/.test(cleanedInput) || cleanedInput.length < 10 || cleanedInput.length > 13) {
            $(this).removeClass('is-valid').addClass('is-invalid');
            EditButton.prop('disabled', true);
        } else {
            $(this).removeClass('is-invalid').addClass('is-valid');
            EditButton.prop('disabled', false);
        }
    });




    $("#phone").removeClass("is-valid");
    $("#nik").removeClass("is-valid");
    $("#fullName").removeClass("is-valid");
    $("#myModal").modal("show");
    $("#AddButton").hide();
    $("#ema").hide();
    $("#UpdateBtn").show();
    $("#granted").hide();
    $(".acc").show(); //hide form
    $("#groupnik").show();
    $("#fortitle").text("Edit Participant");

    $.ajax({
        url: ApiUrl + "/api/Participant/GetParById/" + participantId,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        success: function (result) {
            var obj = result.data;
            var accesDate = obj[0].expiredDatetime;
            const tanggal = new Date(accesDate);
            const tahun = tanggal.getFullYear();
            const bulan = String(tanggal.getMonth() + 1).padStart(2, "0");
            const hari = String(tanggal.getDate()).padStart(2, "0");
            const tanggalDalamFormatBaru = `${hari}/${bulan}/${tahun}`;

            $("#id").val(obj[0].participantId);
            $("#idAccount").val(obj[0].accountId);
            $("#fullName").val(obj[0].account.name);
            $("#exampleInputEmail1").val(obj[0].account.email);
            $("#nik").val(obj[0].nik);
            $.ajax({
                type: "GET",
                url: ApiUrl + "/api/ApplliedPosition",
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("token"),
                },
                success: function (result) {
                    var $jobApplied = $("#jobApplied");
                    //hapuskan list yang ada di option selain index 0
                    $jobApplied.find('option:not(:first-child)').remove();
                    result.data.forEach(function (option) {
                        var optionElement = $("<option>")
                            .attr("appliedPositionId", option.appliedPositionId)
                            .attr("value", option.appliedPositionId)
                            .text(option.appliedPosition);
                        $jobApplied.append(optionElement);
                        if (option.appliedPositionId === obj[0].appliedPositionId) {
                            optionElement.attr("selected", "selected");
                        }
                    });
                },
                error: function (xhr, status, error) { },
            });
            /*$("#phone").val(obj[0].phoneNumber);*/
            $("#phone").val(obj[0].phoneNumber.replace(/\s/g, ''));


            $.ajax({
                type: "GET",
                url: ApiUrl + "/api/TestCategory",
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("token"),
                },
                success: function (result) {
                    var testCategory = $("#testCategory");
                    //hapuskan list yang ada di option selain index 0
                    testCategory.find('option:not(:first-child)').remove();
                    result.data.forEach(function (option) {
                        var optionElement = $("<option>")
                            .attr("testCategoryId", option.testCategoryId)
                            .attr("value", option.testCategoryId)
                            .text(option.levelCategory);
                        if (option.testCategoryId === obj[0].testCategoryId) {
                            optionElement.attr("selected", "selected");
                        }
                        testCategory.append(optionElement);
                    });
                },
                error: function (xhr, status, error) { },
            });
            $("#accessTime").val(tanggalDalamFormatBaru);
            $("#accTime").hide();
            $("#exampleInputEmail1").prop("disabled", true);
            $("#jobApplied").prop("disabled", true);
            $("#testCategory").prop("disabled", true);
        },
        error: function (errorMessage) {
            alert(errorMessage.responseText);
        },
    });
}

function Delete(participantId, accountId) {
    if (getRole !== "Super Admin" && getRole !== "Admin") {
        return CheckAuthRole();
    }
    //ambil data email perbaris setiap klik button del > untuk dapat ditampilkan ke historylog
    var index = $(this).data("index");
    var table = $("#tblParticipant").DataTable();
    var row = table.row(index);
    if (!row || !row.data()) {
        return;
    }
    // Ambil data "Email" dari baris terkait
    var emailPar = row.data().account.email;

    if (getRole !== "Super Admin" && getRole !== "Admin") {
        Swal.fire(
            "Failed!",
            "Only Super Admin Or Admins have access to this Action!",
            "error"
        );
        return;
    }

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
            $("#loading").hide();
            $.ajax({
                //hapus API ParticipantAnswer dengan parameter participantId
                url: ApiUrl + "/api/ParticipantAnswer/Del/" + participantId,
                type: "DELETE",
                dataType: "json",
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("token"),
                },
            }).then((result) => {
                //hapus participant disini
                $.ajax({
                    url: ApiUrl + "/api/Participant/" + participantId,
                    type: "DELETE",
                    dataType: "json",
                    headers: {
                        Authorization: "Bearer " + sessionStorage.getItem("token"),
                    },
                }).then((result) => {
                    //hapus account disini
                    $.ajax({
                        url: ApiUrl + "/api/Accounts/" + accountId,
                        type: "DELETE",
                        dataType: "json",
                        headers: {
                            Authorization: "Bearer " + sessionStorage.getItem("token"),
                        },
                    }).then((result) => {
                        $.ajax({
                            url: ApiUrl + "/api/ParticipantAnswer/Del/" + participantId,
                            type: "DELETE",
                            dataType: "json",
                            headers: {
                                Authorization: "Bearer " + sessionStorage.getItem("token"),
                            },
                        }).then((result) => {
                            if (
                                result.status == 201 ||
                                result.status == 204 ||
                                result.status == 200 ||
                                result.data === 404
                            ) {
                                Swal.fire("Deleted!", "Data has been deleted.", "success");
                                // Reload tabel secara otomatis setelah menghapus data
                                $("#tblParticipant").DataTable().ajax.reload();

                                //aksi history Log
                                CreateActivityUser("Has deleted participant " + emailPar + "!");
                            } else {
                                Swal.fire("Failed!", result.responseJSON, "error");
                            }
                        });
                    });
                });
            });
        }
    });
}



function Update() {
    if (getRole !== "Super Admin" && getRole !== "Admin") {
        return CheckAuthRole();
    }

    dayjs.extend(window.dayjs_plugin_customParseFormat);
    const date = $("#accessTime").val();
    let expired = "";
    if (date === "" || date === "Invalid Date") {
        expired = dayjs()
            .add(3, "day")
            .set("hour", 12)
            .set("minute", 00)
            .set("second", 00)
            .format("YYYY-MM-DDTHH:mm:ss");
    } else {
        expired = dayjs(date, "DD/MM/YYYY")
            .set("hour", 12)
            .set("minute", 00)
            .set("second", 00)
            .format("YYYY-MM-DDTHH:mm:ss");
    }

    //allert jika field isi kosong
    if (
        $("#id").val() === "" ||
        $("#idAccount").val() === "" ||
        $("#fullName").val() === "" ||
        $("#exampleInputEmail1").val() === "" ||
        $("#jobApplied").val() === "" ||
        $("#phone").val() === "" ||
        $("#nik").val() === "" ||
        $("#testCategory").val() === ""
    ) {
        $("#loading").hide();
        Swal.fire("Failed!", "All fields must be filled.", "error");
        return; // Menghentikan pengiriman data jika ada field yang kosong
    }
    //alert nik
    var nikValue = $("#nik").val();
    if (nikValue.length !== 16 || isNaN(nikValue)) {
        $("#loading").hide();
        Swal.fire(
            "Failed!",
            "NIK must be exactly 16 digits and contain only numbers.",
            "error"
        );
        return; // Menghentikan pengiriman data jika NIK tidak sesuai
    }
    //validasi by role
    if (getRole !== "Super Admin" && getRole !== "Admin") {
        $("#loading").hide();
        Swal.fire(
            "Failed!",
            "Only Super Admin Or Admins have access to this Action!",
            "error"
        );
        return;
    }

    var checkfullName = $("#fullName").val();
    var checkemail = $("#exampleInputEmail1").val();

    // Check if the full name contains only spaces
    if (/^\s*$/.test(checkfullName)) {
        $("#loading").hide();
        Swal.fire("Error", "Nama tidak boleh berisi spasi saja.", "error");
        return; // Stop data submission
    }

    // Check if there are spaces at the beginning of the full name
    if (/^\s/.test(checkfullName)) {
        $("#loading").hide();
        Swal.fire(
            "Error",
            "Hilangkan spasi di depan kata pada kolom Nama.",
            "error"
        );
        return; // Stop data submission
    }



    // Check if there are spaces in the email at the beginning, in the middle, or at the end
    if (/\s/.test(checkemail) || /^\s|\s$|\s\s+/.test(checkemail)) {
        $("#loading").hide();
        Swal.fire("Error", "Email tidak boleh mengandung spasi.", "error");
        return; // Stop data submission
    }

    var Account = {
        ParticipantId: $("#id").val(),
        Account_Id: $("#idAccount").val(),
        Name: $("#fullName").val(),
        Email: $("#exampleInputEmail1").val(),
        Applied_position: $("#jobApplied").val(),
        Phone: $("#phone").val(),
        ExpiredDatetime: expired,
        Test_Category: $("#testCategory").val(),
        Nik: $("#nik").val(),
    };

    Swal.fire({
        title: "Do you want to save the changes?",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Save",
        denyButtonText: `Don't save`,
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {

            $("#loading").show();
            $.ajax({
                url: ApiUrl + "/api/Participant/Update",
                type: "PUT",
                data: JSON.stringify(Account),
                contentType: "application/json; charset=utf-8",
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("token"),
                },
                success: function (result) {
                    $("#loading").hide();
                    if (
                        result.status == 201 ||
                        result.status == 204 ||
                        result.status == 200
                    ) {
                        Swal.fire("Saved!", "", "success");
                        $("#tblParticipant").DataTable().ajax.reload();
                        //aksi history Log
                        CreateActivityUser(
                            "Has updated participant " + Account.Email + "!"
                        );
                    }
                },
                error: function (errorMessage) {
                    $("#loading").hide();
                    Swal.fire("Failed!", errorMessage.responseJSON.message, "error");
                },
            });
        } else if (result.isDenied) {
            $("#loading").hide();
            Swal.fire("Changes are not saved", "", "info");
        }
    });
}

//document.addEventListener("DOMContentLoaded", function () {
//    const urlParams = new URLSearchParams(window.location.search);
//    const selectedStatus = urlParams.get("status");

//    // Set the selected status in the dropdown
//    if (selectedStatus) {
//        const testStatusDropdown = document.getElementById("testStatus");
//        testStatusDropdown.value = selectedStatus;
//        // Trigger the 'change' event manually
//        const event = new Event("change");
//        testStatusDropdown.dispatchEvent(event);
//    }
//});

//// Event listener for 'change' event on testStatus dropdown
//document.getElementById("testStatus").addEventListener("change", function () {
//    const table = $('#tblParticipant').DataTable(); // Ganti #example dengan ID tabel datamu
//    const statusText = this.value.toLowerCase(); // Ambil nilai dropdown dan ubah menjadi lowercase

//    // Lakukan pencarian pada kolom dengan teks status yang sesuai
//    table.search(statusText).draw();
//});

$('#testStatus').change(function () {
    if ($(this).val() !== "showAll") {
        $('#tblParticipant').DataTable().search($(this).val()).draw();
    } else {
        $('#tblParticipant').DataTable().search("").draw();
    }
})




$(document).ready(function () {



    let invalid_Fname = false, invalid_Email = false, invalid_NIK = false, invalid_Phone = false;
    let valid_Fname = false, valid_Email = false, valid_NIK = false, valid_Phone = false;

    const urlParams = new URLSearchParams(window.location.search);
    const selectedStatus = urlParams.get("status");

    // Set the selected status in the dropdown
    //if (selectedStatus) {
    //    $(`#testStatus option[value='${selectedStatus}']`).prop("selected", true);
    //    $('#tblParticipant').DataTable().search(selectedStatus).draw()
    //}
    if (selectedStatus) {
        $(`#testStatus`).text(selectedStatus);
        $('#tblParticipant').DataTable().search(selectedStatus).draw();
    }
    $('.dropdown-item').on('click', function () {
        const selectedValue = $(this).data('value');
        if (selectedValue === 'Status Tes') {
            $('#tblParticipant').DataTable().search('').draw();
        } else {
            $('#tblParticipant').DataTable().search(selectedValue).draw();
        }
        $('#testStatus').text(selectedValue);
        $('.dropdown-item').removeClass('text-primary');

        // Tambahkan kelas 'text-primary' pada dropdown-item yang dipilih
        $(this).addClass('text-primary');
    });

    if (invalid_Fname == true || invalid_Email == true || invalid_NIK == true || invalid_Phone == true) {
        var submitButton = $('#AddButton');
        var EditButton = $('#UpdateBtn');
        submitButton.prop('disabled', true);
        EditButton.prop('disabled', true);

    } else if (valid_Fname == true && valid_Email == true && valid_NIK == true && valid_Phone == true) {
        var submitButton = $('#AddButton');
        var EditButton = $('#UpdateBtn');
        submitButton.prop('disabled', false);
        EditButton.prop('disabled', false);
    }

    $("#tblParticipant").css("min-height", "300px");
    // Mengecek apakah ada data yang disimpan di Local Storage
    var savedPage = localStorage.getItem('tblParticipantPage');

    // Jika ada data yang disimpan, atur halaman DataTable
    if (savedPage) {
        $("#tblParticipant").DataTable().page(parseInt(savedPage)).draw(false);
    }

    // Menyimpan halaman setiap kali pengguna berpindah halaman
    $("#tblParticipant").on('page.dt', function () {
        var currentPage = $(this).DataTable().page.info().page;
        localStorage.setItem('tblParticipantPage', currentPage);
    });

});

function GetCreateDateByParticipantAnswerId(participantAnswerId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url:
                ApiUrl +
                "/api/ParticipantAnswer/GetCreateDateByParticipantAnswerId?participantAnswerId=" +
                participantAnswerId,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: {
                Authorization: "Bearer " + sessionStorage.getItem("token"),
            },
            success: function (result) {
                resolve(result.createDate);
            },
            error: function (result) {
                reject("error get data CreateDate!");
            }
        });
    });
}