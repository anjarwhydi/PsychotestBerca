$(document).ready(function () {
    if (getRole === undefined) {
        window.location.href = "/";
    } else if (getRole === "Participant") {
        window.location.href = "/error/notfound";
    }
    getTotalParticipantCount();
    jobposition();
    getStatus();
    statusChart();
    scrollToTop();
});

function jobposition() {
    $.ajax({
        url: ApiUrl + "/api/ApplliedPosition/JobTittleParticipant",
        type: "GET",
        dataType: "json",
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        statusCode: {
            403: function () {
                window.location.href = "/error/notfound";
            },
        },
        success: function (result) {
            var objDept = result.data;
            positionCounts = {}; 
            var totalData = result.data.length;
            $.ajax({
                url: ApiUrl + "/api/ApplliedPosition/JobTittleParticipant",
                type: "GET",
                dataType: "json",
                headers: {
                    Authorization: "Bearer " + sessionStorage.getItem("token"),
                },
                success: function (result) {
                    var appliedPositions = result.data;
                    for (var i = 0; i < appliedPositions.length; i++) {
                        var position = appliedPositions[i];
                        positionCounts[position.appliedPosition] = 0;
                    }
                    for (var i = 0; i < result.data.length; i++) {
                        var participant = result.data[i];
                        var nameposition = participant.appliedPosition;

                        if (positionCounts.hasOwnProperty(nameposition)) {
                            positionCounts[nameposition]++; 
                        }
                    }

                    var table = $("#TB_Participant").DataTable({
                        autoWidth: true,
                        responsive: false,
                        scrollX: true,
                        order: [],
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
                            url: ApiUrl + "/api/ApplliedPosition",
                            type: "GET",
                            datatype: "json",
                            dataSrc: "data",
                            headers: {
                                Authorization: "Bearer " + sessionStorage.getItem("token"),
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
                            },
                            {
                                data: function (data, type, row) {
                                    return positionCounts[data.appliedPosition] || 0;
                                },
                                orderable: false,
                            },
                            {
                                data: function (data, type, row) {
                                    var count = positionCounts[data.appliedPosition] || 0;
                                    return ((count / totalData) * 100).toFixed(2) + "%";
                                },
                                orderable: false,
                            },
                        ],
                    });
                    table;
                },
                error: function (error) { },
            });
        },
        error: function (error) { },
    });
}

function updateParticipantCount(count) {
    var box = document.querySelector("#participantCountBox h3"); 
    box.textContent = count;
}

function getTotalParticipantCount() {
  $.ajax({
      url: ApiUrl + "/api/Participant/countParticipant",
    type: "GET",
    dataType: "json",
    headers: {
      Authorization: "Bearer " + sessionStorage.getItem("token"),
    },
    success: function (result) {
        var box = document.querySelector("#participantCountBox h3"); 
        box.textContent = result;
    },
    error: function (error) {},
  });
}

function getStatus() {
  $.ajax({
      url: ApiUrl + "/api/Participant/statusDashboard",
      type: "GET",
      dataType: "json",
      headers: {
          Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
      success: function (result) {
          var currentDate = new Date();
          let tot = 0;
          let complete = 0;
          let onProcess = 0;
          let incomplete = 0;
            $.each(result.data, function (index, value) {
                let numtest = value.tesKitList;
                let newte = numtest.split(",").length;
                let comp = 0;
                let ongoing = 0;
                let incomp = 0;
                tot++;
                let numtestCom = value.statusList;
                let exp = new Date(value.expiredDatetime);
                if (numtestCom.length !== 0) {
                    $.each(numtestCom, function (index, data) {
                        if (data.status === true) {
                          comp++;
                        }
                        if (exp > currentDate && data.status === false) {
                          ongoing++;
                        }
                        if (exp < currentDate && data.status === false) {
                          incomp++;
                        }
                    });
                } else {
                    if (exp > currentDate) {
                        ongoing++;
                    }
                    if (exp < currentDate) {
                        incomp++;
                    }
                }

                if (parseInt(newte) === parseInt(comp)) {
                    complete++;
                }
                if (parseInt(ongoing) > 0) {
                    onProcess++;
                }
                if (parseInt(incomp) > 0) {
                    incomplete++;
                }
            });
            var percentComplete = (complete / tot) * 100;
            var percentOnProgress = (onProcess / tot) * 100;
            var percentIncomplete = (incomplete / tot) * 100;

            var boxcomplete = document.querySelector("#completeCountBox h3"); 
            boxcomplete.textContent = percentComplete.toFixed(0) + "%";
            $("#forOverlayCom").hide();
            var boxonProgress = document.querySelector("#onProgressCountBox h3");
            boxonProgress.textContent = percentOnProgress.toFixed(0) + "%";
            $("#forOverlayOnP").hide();
            var boxinComplete = document.querySelector("#inCompleteCountBox h3");
            boxinComplete.textContent = percentIncomplete.toFixed(0) + "%";
            $("#forOverlayInc").hide();
        },
        error: function (error) { },
    });
}

function statusChart() {
    $.ajax({
        url: ApiUrl + "/api/Participant/GetPar",
        type: "GET",
        dataType: "json",
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
        },

        success: function (result) {
            var currentDate = new Date();
            let finish = 4;
            let total = 5;
            var statusCounts = {}; // Definisikan Objek
            var labels = [];
            var datasetsDataComplete = [];
            var datasetsDataIncomplete = [];
            var datasetsDataOnProgress = [];
            var months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];
            for (var i = 0; i < result.data.length; i++) {
                var expiredDate = new Date(result.data[i].expiredDateTime);
                var month = months[expiredDate.getMonth()];
                //coba nambah month + 1
                //var nextMonth = months[(expiredDate.getMonth() + 1) % 12]; // Bulan+1 (diambil dengan modulus 12)

                if (!statusCounts[month]) {
                    statusCounts[month] = { complete: 0, incomplete: 0, onprogress: 0 };
                }

                if (currentDate < expiredDate && finish === total) {
                    statusCounts[month].complete++;
                } else if (currentDate < expiredDate && finish < total) {
                    statusCounts[month].onprogress++;
                } else {
                    statusCounts[month].incomplete++;
                }
            }

            for (var month in statusCounts) {
                labels.push(month);
                //coba
                //labels.push(nextMonth);
                datasetsDataComplete.push(statusCounts[month].complete);
                datasetsDataIncomplete.push(statusCounts[month].incomplete);
                datasetsDataOnProgress.push(statusCounts[month].onprogress);
            }

            // Data untuk grafik garis
            var areaChartCanvas = $("#areaChart").get(0).getContext("2d");
            var areaChartData = {
                labels: labels,
                datasets: [
                    {
                        label: "Complete",
                        backgroundColor: "rgba(60,141,188,0.9)",
                        borderColor: "rgba(60,141,188,0.8)",
                        pointRadius: false,
                        pointColor: "#3b8bba",
                        pointStrokeColor: "rgba(60,141,188,1)",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(60,141,188,1)",
                        data: datasetsDataComplete,
                    },
                    {
                        label: "Incomplete",
                        backgroundColor: "rgba(210, 214, 222, 1)",
                        borderColor: "rgba(210, 214, 222, 1)",
                        pointRadius: false,
                        pointColor: "rgba(210, 214, 222, 1)",
                        pointStrokeColor: "#c1c7d1",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,220,220,1)",
                        data: datasetsDataIncomplete,
                    },
                    {
                        label: "On Progress",
                        backgroundColor: "rgba(161, 194, 241)",
                        borderColor: "rgba(161, 194, 241)",
                        pointRadius: false,
                        pointColor: "rgba(161, 194, 241)",
                        pointStrokeColor: "#A1C2F1",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(161, 194, 241)",
                        data: datasetsDataOnProgress,
                    },
                ],
            };

            var areaChartOptions = {
                maintainAspectRatio: false,
                responsive: true,
                legend: {
                    display: true,
                },
                scales: {
                    xAxes: [
                        {
                            gridLines: {
                                display: false,
                            },
                        },
                    ],
                    yAxes: [
                        {
                            gridLines: {
                                display: false,
                            },
                        },
                    ],
                },
            };

            // Membuat grafik garis menggunakan Chart.js
            $("#barOverlay").hide();
            new Chart(areaChartCanvas, {
                type: "line",
                data: areaChartData,
                options: areaChartOptions,
            });
        },
        error: function (error) { },
    });
}


function scrollToTop() {
    window.addEventListener("scroll", function () {
        var scrollPosition =
            window.pageYOffset || document.documentElement.scrollTop;
        var scrollToTopButton = document.querySelector(".scroll-to-top");

        if (scrollPosition > 300) {
            scrollToTopButton.style.display = "block";
        } else {
            scrollToTopButton.style.display = "none";
        }
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
}
