var table = null;

$(document).ready(function () {
    if (getRole === undefined) {
        window.location.href = "/";
    } else if (getRole !== "Super Admin") {
        window.location.href = "/error/notfound";
    }

    table = $("#TblAccount").DataTable({
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
            url: ApiUrl + "/api/Accounts/GetAdminByPaging",
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
                $("#TblAccount").DataTable().clear().draw(); 
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
                data: "name",
                orderable: false,
                orderData: [1],
            },
            {
                data: "email",
                orderable: false,
            },
            {
                data: "role.roleName",
                orderable: false,
                orderData: [1],
            },
            {
                data: null,
                orderable: false, 
                render: function (data, type, row, meta) {
                    return (
                        '<button class="btn btn-danger" data-placement="right" data-toggle="modal" data-animation="false" title="Delete" data-index="' +
                        meta.row +
                        '" onclick="return Delete(' +
                        row.accountId +
                        ')"><i class="fa fa-trash"></i></button >'
                    );
                },
            },
        ],
    });

    $("#ShowPassword").click(function () {
        var passwordInput = $("#Password");
        var showPasswordCheckbox = $(this);

        if (showPasswordCheckbox.is(":checked")) {
            passwordInput.attr("type", "text");
        } else {
            passwordInput.attr("type", "password");
        }
    });
});

function ClearScreen() {
    if (getRole !== "Super Admin") {
        return CheckAuthRole();
    }

    $("#myModal").modal("show");

    $("#Id").val("");
    $("#Name").val("");
    $("#Email").val("");
    $("#Password").val("");
    $("#UpdateBtn").hide();
    $("#SaveBtn").show();

    $("#Name").removeClass("is-valid");
    $("#Name").removeClass("is-invalid");
    $("#Email").removeClass("is-valid");
    $("#Email").removeClass("is-invalid");
    $("#Password").removeClass("is-valid");
    $("#Password").removeClass("is-invalid");

    $("#ShowPassword").prop("checked", false);
    $("#option_admin").prop("checked", true);
    $("#option_audit").prop("checked", false);
    $("#loading").hide();

    var saveBtn = $('#SaveBtn');
    saveBtn.prop('disabled', true);
}

function GetById(accountId) {
    if (getRole !== "Super Admin") {
        return CheckAuthRole();
    }

    $.ajax({
        url: ApiUrl + "/api/Accounts/" + accountId,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        success: function (result) {
            var obj = result.data; 
            $("#Id").val(obj.accountId);
            $("#Name").val(obj.name);
            $("#Email").val(obj.email);
            $("#Password").val(obj.password);
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

    if (
        $("#Name").val() === "" ||
        $("#Email").val() === "" ||
        $("#Password").val().trim() === ""
    ) {
        $("#loading").hide();
        Swal.fire("Error", "All fields must be filled.", "error");
        return;
    }
    var checkName = $("#Name").val();
    var checkemail = $("#Email").val();
    var checkpassword = $("#Password").val();

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
    if (/\s/.test(checkemail) || /^\s|\s$|\s\s+/.test(checkemail)) {
        $("#loading").hide();
        Swal.fire("Error", "Emails cannot contain spaces.", "error");
        return;
    }
    if (/\s/.test(checkpassword)) {
        $("#loading").hide();
        Swal.fire("Error", "Passwords cannot contain spaces.", "error");
        return;
    }
    if (checkpassword.length < 6) {
        $("#loading").hide();
        Swal.fire(
            "Error",
            "A password must have at least six characters.",
            "error"
        );
        return;
    }

    var role;
    var Account = new Object();
    Account.Name = $("#Name").val();
    Account.Email = $("#Email").val();
    Account.Password = $("#Password").val();
    if ($("#option_admin").prop("checked")) {
        role = 2;
    } else {
        role = 3;
    }
    Account.RoleId = role;

    $.ajax({
        type: "POST",
        url: ApiUrl + "/api/Accounts/RegisterAdmin",
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
                Swal.fire({
                    icon: "success",
                    title: "Your work has been saved",
                    showConfirmButton: false,
                    timer: 1500,
                });
                CreateActivityUser("Has Register Admin " + Account.Name + "!");
                table.ajax.reload(null, false);
            } else if (result.status == 401 || result.status == 403) {
                Swal.fire(
                    "Error",
                    "Only Super Admin have access to this Action!",
                    "error"
                );
            }
        },
        error: function (errorMessage) {
            if (getRole !== "Super Admin") {
                Swal.fire(
                    "Error",
                    "Only Super Admin have access to this Action!",
                    "error"
                );
                return;
            }
            Swal.fire(errorMessage.responseJSON.message, "", "error");
            $("#loading").hide();
        },
    });
}

function Delete(accountId) {
    if (getRole !== "Super Admin") {
        return CheckAuthRole();
    }

    var index = $(this).data("index");
    var table = $("#TblAccount").DataTable();
    var row = table.row(index);

    if (!row || !row.data()) {
        return;
    }
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
            $.ajax({
                url: ApiUrl + "/api/Accounts/SoftDelete?id=" + accountId,
                type: "PUT",
                dataType: "json",
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("token"),
                },
            }).then((result) => {
                if (
                    result.status == 201 ||
                    result.status == 204 ||
                    result.status == 200
                ) {
                    Swal.fire("Deleted!", "Your file has been deleted.", "success");
                    CreateActivityUser("Has Deleted Admin " + row.data().name + "!");
                    table.ajax.reload(null, false);
                } else {
                    if (getRole !== "Super Admin") {
                        Swal.fire(
                            "Error",
                            "Only Super Admin have access to this Action!",
                            "error"
                        );
                        return;
                    }
                    Swal.fire(result.responseJson.message, "", "error");
                }
            });
        }
    });
}

function closeModal() {
    $("#myModal").modal("hide");
}

$(document).ready(function () {

    var validName = false;
    var validEmail = false;
    var validPassword = false;

    function updateSaveButtonState() {
        var SaveBtn = $('#SaveBtn');

        if (validName && validEmail && validPassword) {
            SaveBtn.prop('disabled', false);
        } else {
            SaveBtn.prop('disabled', true);
        }
    }
    $('#Name').on('input', function () {
        var inputName = $(this).val();
        var cleanedInputName = inputName.replace(/[^a-zA-Z\s]/g, '');

        $(this).val(cleanedInputName);

        if (cleanedInputName === "") {
            $(this).removeClass('is-valid').addClass('is-invalid');
            validName = false;
        } else {
            $(this).removeClass('is-invalid').addClass('is-valid');
            validName = true;
        }

        updateSaveButtonState();
    });

    $('#Email').on('input', function () {
        var inputEmail = $(this).val();

        if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(inputEmail)) {
            $(this).removeClass('is-valid').addClass('is-invalid');
            validEmail = false;
        } else {
            $(this).removeClass('is-invalid').addClass('is-valid');
            validEmail = true;
        }

        updateSaveButtonState();
    });

    $('#Email').on('blur', function () {
        var inputEmail = $('#Email').val();
        var emailInput = $(this);

        $.ajax({
            method: "POST",
            url: ApiUrl + "/api/Accounts/DuplicateEmail?Email=" + encodeURIComponent(inputEmail),
            data: { Email: inputEmail },
            contentType: "application/json; charset=utf-8",
            headers: {
                Authorization: "Bearer " + sessionStorage.getItem("token")
            },
            success: function (result) {
                if (result.status == 200) {
                    emailInput.removeClass('is-invalid').addClass('is-valid');
                    validEmail = true;
                }
            },
            statusCode: {
                400: function () {
                    emailInput.removeClass('is-valid').addClass('is-invalid');
                    validEmail = false;
                }
            }
        });
    });

    $('#Password').on('input', function () {
        var password = $(this).val();

        if (password === "") {
            $(this).removeClass('is-valid').addClass('is-invalid');
            validPassword = false;
        } else if (password.length < 6) {
            $(this).removeClass('is-valid').addClass('is-invalid');
            validPassword = false;
        } else {
            $(this).removeClass('is-invalid').addClass('is-valid');
            validPassword = true;
        }

        updateSaveButtonState();
    });
}); 

