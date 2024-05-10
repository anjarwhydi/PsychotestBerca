var table = null;

$(document).ready(function () {
    $('#NameJobPosition').on('input', function () {
        var NameJobPosition = $(this).val();
        var cleanedNameJobPosition = NameJobPosition.replace(/[^a-zA-Z\s]/g, '');
        $(this).val(cleanedNameJobPosition);

        var EditButton = $('#UpdateBtn');
        var SubmitButton = $('#SaveBtn');

        if (cleanedNameJobPosition === ("")) {
            this.setCustomValidity('Nama tidak boleh kosong');
            $(this).removeClass('is-valid').addClass('is-invalid');
            EditButton.prop('disabled', true);
            SubmitButton.prop('disabled', true);

        } else {
            this.setCustomValidity('');
            $(this).removeClass('is-invalid').addClass('is-valid');
            EditButton.prop('disabled', false);
            SubmitButton.prop('disabled', false);
        }
    })
    if (getRole === undefined) {
        window.location.href = "/";
    } else if (getRole === "Participant") {
        window.location.href = "/error/notfound";
    }
    
    table = $("#TblJobPosition").DataTable({
        autoWidth: false,
        responsive: false,
        scrollX: true,
        order: [], 
        processing: true,
        serverSide: true,
        filter: true,
        searching: true,
        drawCallback: function (settings) {
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
        },

        ajax: {
            url: ApiUrl + "/api/ApplliedPosition/GetByPaging",
            type: "POST",
            datatype: "json",
            dataSrc: "data",
            headers: {
                Authorization: "Bearer " + sessionStorage.getItem("token"),
            },
            statusCode: {
                403: function () {
                    window.location.href = "/error/notfound";
                },
            },
            error: function (xhr, error, thrown) {
                $("#TblJobPosition").DataTable().clear().draw();
            },
        },
        columns: [
            {
                data: null,
                orderable: false, 
                render: function (data, type, row, meta) {
                    return meta.row + 1 + ".";
                },
            },
            {
                data: "appliedPosition",
                orderable: false,
                orderData: [1],
                render: function (data) {
                    return htmlspecialchars(data);
                },
            },
            {
                data: null,
                orderable: false,
                render: function (data, type, row, meta) {
                    return (
                        '<button class="btn btn-warning " data-placement="left" data-toggle="modal" data-animation="false" title="Edit" onclick="return GetById(' +
                        row.appliedPositionId +
                        ')"><i class="fa fa-pen"></i></button >' +
                        "&nbsp;" +
                        '<button class="btn btn-danger" data-placement="right" data-toggle="modal" data-animation="false" title="Delete" data-del="' +
                        meta.row +
                        '" onclick="return Delete(' +
                        row.appliedPositionId +
                        ',this)"><i class="fa fa-trash"></i></button >'
                    );
                },
            },
        ],
    });

    function htmlspecialchars(str) {
        var map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
        };

        var outp = str.replace(/[&<>"']/g, function (m) {
            return map[m];
        });
        return outp;
    }
});

function ClearScreen() {
    if (getRole !== "Super Admin") {
        return CheckAuthRole();
    }

    $("#Id").val("");
    $("#NameJobPosition").val("");
    $("#myModal").modal("show");
    $("#UpdateBtn").hide();
    $("#SaveBtn").show();
    $("#loading").hide();
    var submitButton = $('#SaveBtn');
    submitButton.prop('disabled', true);
    $("#NameJobPosition").removeClass('is-invalid');
    $("#NameJobPosition").removeClass('is-valid');
}

function GetById(appliedPositionId) {
    if (getRole !== "Super Admin") {
        return CheckAuthRole();
    }

    $.ajax({
        url: ApiUrl + "/api/ApplliedPosition/" + appliedPositionId,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        success: function (result) {
            var obj = result.data; 

            $("#before").val(obj.appliedPosition);
            $("#Id").val(obj.appliedPositionId);
            $("#NameJobPosition").val(obj.appliedPosition);
            $("#myModal").modal("show");
            $("#SaveBtn").hide();
            $("#UpdateBtn").show();
        },
        error: function (errorMessage) {
            alert(errorMessage.responseText);
        },
    });
}

function Save() {
    $("#loading").show();
    if (getRole !== "Super Admin") {
        return CheckAuthRole();
    }

    if ($("#NameJobPosition").val() === "") {
        Swal.fire("Error", "All fields must be filled.", "error");
        $("#loading").hide();
        return; 
    }
    var checkName = $("#NameJobPosition").val();

    if (/^\s*$/.test(checkName)) {
        Swal.fire("Error", "The name cannot contain only spaces.", "error");
        $("#loading").hide();
        return;
    }
    if (/^\s/.test(checkName)) {
        Swal.fire(
            "Error",
            "Remove the space in front of the word in the Name column.",
            "error"
        );
        $("#loading").hide();
        return;
    }

    var Jobposition = new Object();
    Jobposition.appliedPosition = $("#NameJobPosition").val();

    $.ajax({
        type: "POST",
        url: ApiUrl + "/api/ApplliedPosition/Insert",
        data: JSON.stringify(Jobposition),
        contentType: "application/json; charset=utf-8",
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        success: function (result) {
            $("#loading").hide();
            if (
                result.status == 201 ||
                result.status == 204 ||
                result.status == 200 ||
                result.status == 202
            ) {
                Swal.fire({
                    icon: "success",
                    title: "Your work has been saved",
                    showConfirmButton: false,
                    timer: 1500,
                });
                CreateActivityUser("Has Created Job Position " + checkName + " !");
                $("#TblJobPosition").DataTable().ajax.reload();
            } else if (result.status == 401 || result.status == 403) {
                Swal.fire(
                    "Error",
                    "Only Super Admin have access to this Action!",
                    "error"
                );
            }
        },
        error: function (errorMessage) {
            $("#loading").hide();
            if (getRole !== "Super Admin") {
                Swal.fire(
                    "Error",
                    "Only Super Admin have access to this Action!",
                    "error"
                );
                return;
            }
            Swal.fire("Error", "Job Position Has Been Registered", "error");
        },
    });
}

function Delete(appliedPositionId, button) {
    if (getRole !== "Super Admin") {
        return CheckAuthRole();
    }

    var index = $(button).data("del");
    var table = $("#TblJobPosition").DataTable();
    var row = table.row(index);

    if (!row || !row.data()) {
        return;
    }

    if (!row || !row.data()) {
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
            $.ajax({
                url: ApiUrl + "/api/ApplliedPosition/Delete/" + appliedPositionId,
                type: "DELETE",
                dataType: "json",
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("token"),
                },
                success: function (result) {
                    Swal.fire("Deleted!", "Posisi berhasil dihapus.", "success");
                    table.ajax.reload(null, false);

                    CreateActivityUser(
                        "Has deleted job position " + row.data().appliedPosition + "!"
                    );
                },
                error: function (err) {
                    if (err.status == 400) {
                        Swal.fire("Error!", "Posisi sedang dilamar partisipan.", "error");
                        return;
                    } else {
                        if (getRole !== "Super Admin") {
                            Swal.fire(
                                "Error",
                                "Only Super Admin have access to this Action!",
                                "error"
                            );
                            return;
                        }
                        Swal.fire(result.responseText, "", "error");
                    }
                },
            });
        }
    });
}

function closeModal() {
    $("#myModal").modal("hide");
}

function Update() {
    $("#loading").show();
    if (getRole !== "Super Admin") {
        return CheckAuthRole();
    }

    if ($("#NameJobPosition").val() === "") {
        $("#loading").hide();
        Swal.fire("Error", "All fields must be filled.", "error");
        return; 
    }
    var checkName = $("#NameJobPosition").val();

    if (/^\s*$/.test(checkName)) {
        $("#loading").hide();
        Swal.fire("Error", "The name cannot contain only spaces.", "error");
        return;
    }
    if (/^\s/.test(checkName)) {
        $("#loading").hide();
        Swal.fire(
            "Error",
            "Remove the space in front of the word in the Name column.",
            "error"
        );
        return;
    }

    var Jobposition = {
        appliedPositionId: $("#Id").val(),
        appliedPosition: checkName,
    };

    Swal.fire({
        title: "Do you want to save the changes?",
        showCancelButton: true,
        confirmButtonText: "Save",
        denyButtonText: `Don't save`,
    }).then((result) => {
        $("#loading").hide();
        if (result.isConfirmed) {
            $.ajax({
                url: ApiUrl + "/api/ApplliedPosition/Update",
                type: "PUT",
                data: JSON.stringify(Jobposition),
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
                        Swal.fire("Saved!", "", "success");
                        $("#TblJobPosition").DataTable().ajax.reload();
                        CreateActivityUser(
                            "Has updated Job Position " +
                            $("#before").val() +
                            " To " +
                            $("#NameJobPosition").val() +
                            "!"
                        );
                        $("#loading").hide();
                    }
                },
                error: function (errorMessage) {
                    $("#loading").hide();
                    Swal.fire("Error", "Job Position Has Been Registered", "error");
                },
            });
        } else if (result.isDenied) {
            $("#loading").hide();
            Swal.fire("Changes are not saved", "", "info");
        }
    });
}
