var table = null;
var moment = window.moment;
$(document).ready(function () {
    if (getRole === undefined) {
        window.location.href = "/";
    } else if (getRole === "Participant") {
        window.location.href = "/error/notfound";
    }
    
    table = $("#TblHistoryLog").DataTable({
        autoWidth: false,
        responsive: false,
        scrollX: true,
        order: false, 
        processing: true,
        serverSide: true,
        filter: true,
        searching: true,
        ajax: {
            url: ApiUrl + "/api/HistoryLog/GetByPaging",
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
            error: function (xhr, error, thrown) { },
        },
        columns: [
            {
                data: "account.name",
                orderable: false,
            },
            {
                data: "account.role.roleName",
                orderable: false,
                render: function (data) {
                    return data;
                },
            },
            {
                data: "activity",
                orderable: false,
                render: function (data) {
                    return htmlspecialchars(data);
                },
            },
            {
                data: "timestamp",
                orderable: false,
                render: function (data) {
                    moment.locale("id");
                    return moment(data).format("D MMMM YYYY [,] HH.mm");
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
