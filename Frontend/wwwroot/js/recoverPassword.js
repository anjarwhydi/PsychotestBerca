$(document).ready(function () {
    $(".toggle-password").click(function () {
        $(this).toggleClass("fa-eye fa-eye-slash");
        var input = $($(this).attr("toggle"));
        if (input.attr("type") === "password") {
            input.attr("type", "text");
        } else {
            input.attr("type", "password");
        }
    });
    var url = window.location.href;
    var lastSegment = url.substring(url.lastIndexOf("/") + 1);
    var tokenn = "";
    if (lastSegment !== "") {
        $.ajax({
            type: 'GET',
            url: ApiUrl + '/api/Token/GetToken/' + lastSegment,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            async: false,
            success: function (result) {
                tokenn = result.data.token;

            },
            error: function () {
                Swal.fire({
                    title: 'Token Salah',
                    text: "Harap Hubungi HR yang Bersangkutan",
                    icon: 'question',
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Close',
                    allowOutsideClick: false,
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.close();
                    }
                });
                $(document).on('click', function (event) {
                    var isBoxClicked = $(event.target).closest('#box').length;
                    if (!isBoxClicked) {
                        window.close();
                    }
                });
            }
        });

    } else {
        return;
    }
    const token = parseJwtRecovery(tokenn);
    var getID = token.Id;
    const now = new Date();
    const exp = new Date(token.exp * 1000);
 

    checkExpiredToken(now, exp);

    

    $('#recoverPassword-form').submit(function (e) {
        $('#loading').show();

        e.preventDefault();
        var Account = {
            AccountId: getID,
            Password: $('#pass').val(),
            RePassword: $('#re-pass').val()
        };
        if (Account.Password === "") {
            $('#loading').hide();

            return Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Password dan Repassword Harus Diisi'
            })
            
        }
        $.ajax({
            type: 'PUT',
            url: ApiUrl + '/api/Accounts/RecoverPassword',
            data: JSON.stringify(Account), 
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            success: function (result) {
                $('#loading').hide();

                Swal.fire({
                    icon: 'success',
                    title: result.message,
                    showConfirmButton: true
                }).then((result) => {
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

function parseJwtRecovery(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function checkExpiredToken(now, exp) {
    if (now > exp) {
        $("#box").hide();
        Swal.fire({
            title: 'Token Expired',
            text: "Harap Kirim Ulang Kode verifikasi",
            icon: 'question',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Reload',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "/";
                return;
            }
        });
        $(document).on('click', function (event) {
            var isBoxClicked = $(event.target).closest('#box').length;
            if (!isBoxClicked) {
                window.location.href = "/";
            }
        });
        return;
    }
}

