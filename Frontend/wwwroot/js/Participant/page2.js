$(document).ready(function () {
    checkNIK();
    if (!sessionStorage.getItem("indexSubtest")) {
        sessionStorage.setItem("indexSubtest", 1);
    }
});

function checkNIK() {
    $("#loading").show();
    var participantId = sessionStorage.getItem("participantId");
    $.ajax({
        url: ApiUrl + `/api/Participant/GetNIK?id=${participantId}`,
        type: "GET",
        dataType: "json",
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        success: function (response) {
            $("#loading").hide();
            if (response.status === 200) {
                faceCapture();
            } else {
                $("#facecapture").hide();
                $("#inputnik").show();
                $("#nikForm").submit(function (event) {
                    $("#loading").show();
                    event.preventDefault();

                    var nikValue = $("#InputNik").val();

                    if (nikValue !== "") {
                        if (nikValue.length === 16) {
                            postNIK(nikValue);
                        } else {
                            alert("NIK harus memiliki 16 karakter.");
                        }
                    } else {
                        alert("Silakan masukkan NIK Anda.");
                    }
                });
            }
        },
        error: function (xhr, status, error) {
            $("#loading").hide();
            if (xhr.status === 404) {
                $("#facecapture").hide();
                $("#inputnik").show();
                $("#nikForm").submit(function (event) {
                    $("#loading").show();
                    event.preventDefault();

                    var nikValue = $("#InputNik").val();
                    const invalidCharacters = /[.,\/#!$%\^&\*)_+=''"":;\/?><|\\@\-\?\!]/;
                    if (nikValue !== "") {
                        if (nikValue.length === 16) {
                            if (invalidCharacters.test(nikValue)) {
                                Swal.fire({
                                    icon: "warning",
                                    title: "Peringatan",
                                    text: "NIK tidak boleh mengandung tanda baca atau karakter khusus.",
                                });
                            } else {
                                postNIK(nikValue);
                            }
                        } else {
                            Swal.fire({
                                icon: "warning",
                                title: "Peringatan",
                                text: "NIK harus memiliki 16 karakter.",
                            });
                        }
                    } else {
                        Swal.fire("Silakan masukkan NIK Anda.");
                    }
                    $("#loading").hide();
                });
            } else {
                var errorMessage =
                    xhr.responseJSON && xhr.responseJSON.message
                        ? xhr.responseJSON.message
                        : "An error occurred.";
                console.error("Error:", errorMessage);
            }
        },
    });
}

function postNIK(nikValue) {
    var participantId = sessionStorage.getItem("participantId");
    var NIK = nikValue;

    $.ajax({
        type: "POST",
        url: ApiUrl + `/api/Participant/UpdateNIK?id=${participantId}&NIK=${NIK}`,
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            $("#loading").hide();
            if (
                response.status == 201 ||
                response.status == 204 ||
                response.status == 200
            ) {
                Swal.fire({
                    icon: "success",
                    title: "Data Disimpan",
                    showConfirmButton: false,
                    timer: 1500,
                });
                if (!sessionStorage.getItem("gender")) {
                    var spNik = NIK.slice(6, 8);
                    var gen = spNik > 31 ? "F" : "M";
                    sessionStorage.setItem("gender", gen);
                }
                faceCapture();
            }
        },
        error: function (xhr, status, error) {
            $("#loading").hide();
            var errorMessage =
                xhr.responseJSON && xhr.responseJSON.message
                    ? xhr.responseJSON.message
                    : "An error occurred.";
            Swal.fire("Error", errorMessage, "error");
        },
    });
}

function moveToTest() {
    var participantId = sessionStorage.getItem("participantId");
    sessionStorage.setItem("currentTestId", currentTestId);
    UpdateCreateDate(participantId, currentTestId)
        .then(function (createDateTest) {
            sessionStorage.setItem("currentTestId", currentTestId);
            switch (currentTestId) {
                case 4:
                    if (createDateTest) {
                        window.location.href = `/dotest/instruction/ist`;
                    } else {
                        AllertFailedUpdateCreateDate();
                    }
                    break;
                case 5:
                    if (createDateTest) {
                        window.location.href = `/dotest/instruction/disc`;
                    } else {
                        AllertFailedUpdateCreateDate();
                    }
                    break;
                case 6:
                    if (createDateTest) {
                        window.location.href = `/dotest/instruction/rmib`;
                    } else {
                        AllertFailedUpdateCreateDate();
                    }
                    break;
                case 7:
                    if (createDateTest) {
                        window.location.href = `/dotest/instruction/papikostick`;
                    } else {
                        AllertFailedUpdateCreateDate();
                    }
                    break;
                case 11:
                    if (createDateTest) {
                        window.location.href = `/dotest/instruction/msdt`;
                    } else {
                        AllertFailedUpdateCreateDate();
                    }
                    break;
                default:
                    break;
            }
        })
        .catch(function (error) {
            console.error("Terjadi kesalahan saat mengirim permintaan PUT:", error);
        });
}

function AllertFailedUpdateCreateDate() {
    Swal.fire({
        icon: "warning",
        title: "Kamera gagal mengambil gambar.",
        text: "Ulangi Kembali dengan menekan tombol Ikuti Test!, Jika terus berlanjut harap refresh halaman",
        showCancelButton: false,
        confirmButtonText: "OK",
        allowOutsideClick: false,
    });
}
