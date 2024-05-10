function checkTimeSession() {
    localStorage.setItem("isTimeSessionOver", false);

    var currentTime = new Date().getTime();

    if (currentTime > localStorage.getItem("batasWaktuSession") && localStorage.getItem("token") !== null) {
        Swal.fire({
            title: "Waktu Session Sudah Berakhir!",
            text: "Harap Login Kembali.",
            icon: "question",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Close",
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                sessionStorage.clear();
                var getCurrentPathUrl = window.location.pathname;
                if (getCurrentPathUrl != "/") {
                    window.location.href = "/";
                }
                return;
            }
        });

        return;
    } else if (sessionStorage.getItem("token") !== null && sessionStorage.getItem("token") !== 0) {
        BacktoLoginPage();
        localStorage.setItem("isTimeSessionOver", true);
    }
    else {
        localStorage.setItem("isTimeSessionOver", true);
    }
}

function BacktoLoginPage() {
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {

            if (sessionStorage.getItem("token") == null || sessionStorage.getItem("token") == 0) {
                /*showViolationAlert("Anda Terdeteksi Membuka Tab lain !");*/
                window.location.href = "/";
            }
            window.addEventListener("beforeunload", function (e) {

            });
        }
    });
}

function showViolationAlert(message, foot) {
    Swal.fire({
        title: "Harap login kembali!",
        text: message,
        icon: "warning",
        footer: foot,
        confirmButtonText: "OK",
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "/";
        } return;
    });
}