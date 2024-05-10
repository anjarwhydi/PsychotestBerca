$("#logoutClick").on("click", function () {
    location.replace("/");
    sessionStorage.clear();
    localStorage.clear();
    setTimeout(function () {
        window.location.reload(true);
    }, 2000);
});
