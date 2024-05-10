
$(document).ready(function () {
    $('#forgotPass-form').submit(function (e) {
        $('#loading').show();

        e.preventDefault();
        var Account = {
            Email: $('#email').val()
        };
        $.ajax({
            type: 'POST',
            url: ApiUrl + '/api/Accounts/ForgotPassword',
            data: JSON.stringify(Account), 
            contentType: "application/json; charset=utf-8",
            dataType: 'json',

            success: function (result) {
                $('#loading').hide();

                    Swal.fire({
                        icon: 'success',
                        title: result.message,
                        showConfirmButton: false,
                        timer: 1500
                    }).then((successAllert) => {
                        window.location.href = "/Home";
                    });
            },
            error: function (result) {
                $('#loading').hide();

                Swal.fire('Gagal', result.responseJSON.message, 'error');
            }
        });

    })
});
