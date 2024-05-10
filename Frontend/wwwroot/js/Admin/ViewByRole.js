var getRoleName = getRole;


if (getRoleName === "Audit" || getRoleName === "Admin") {
    $("#manageUserNav").hide();
    $("#manageUserLabel").hide();

    
}



function CheckAuthRole() {
    let mess = getRoleName === "Audit" ? "Only Super Admin Or Admin have access to this Action!" : getRoleName !== "Super Admin" ? "Only Super Admin have access to this Action!": "You're Not Allowed To Do This Action";

    Swal.fire({
        title: 'Access Denied',
        text: mess,
        icon: 'error',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Close',
        allowOutsideClick: false,
    }).then((result) => {
        if (result.isConfirmed) {
            $('#myModal').modal('hide');
        }
    });
    $(document).on('click', function (event) {
        var isBoxClicked = $(event.target).closest('#box').length;
        if (!isBoxClicked) {
            $('#myModal').modal('hide');
        }
    });
    return;
}
