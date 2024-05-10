var cameraActive = true;
$(document).ready(function () {
    startVideoStream();
});

function startVideoStream() {
    var video = $("#videoElement")[0];
    if (
        cameraActive &&
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia
    ) {
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
                video.play();
            })
            .catch(function (error) {
            });
    }
}

function faceCapture() {
  $("#inputnik").hide();
  $("#facecapture").show();
  var video = $("#videoElement")[0];
  const canvas = $("#canvasElement")[0];
  const captureButton = $("#DoTest");

  let cameraAccessGranted = false;
  let cameraDenied = false;

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(function (stream) {
        video.srcObject = stream;
          var playPromise = video.play();

          if (playPromise !== undefined) {
              playPromise.then(_ => {
                  cameraAccessGranted = true;

              })
                  .catch(error => {
                      // Auto-play was prevented
                      // Show paused UI.
                  });
          }
      })
      .catch(function (error) {
        console.error("Kesalahan saat mengakses kamera: ", error);
        cameraAccessGranted = true;
        handleCameraAccessDenied();
      });
  }

  captureButton.on("click", function () {
    $("loading").show();

    if (!cameraAccessGranted) {
      $("loading").hide();
      Swal.fire({
        icon: "warning",
        title: "Kamera gagal mengambil gambar.",
        text: "Ulangi Kembali dengan menekan tombol Ikuti Test!, Jika terus berlanjut harap refresh halaman",
        showCancelButton: false,
        confirmButtonText: "OK",
        allowOutsideClick: false, 
      });
      return;
    }

    if (!cameraDenied) {
      canvas
        .getContext("2d")
        .drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataURI = canvas.toDataURL("image/jpeg");
      const blobData = dataURItoBlob(dataURI);
      const username = sessionStorage.getItem("name");
      const fileName = `${username}-${Date.now()}.jpg`;
      uploadImageToServer(blobData, fileName);
    } else {
      const blackCanvas = document.createElement("canvas");
      blackCanvas.width = canvas.width;
      blackCanvas.height = canvas.height;
      const blackContext = blackCanvas.getContext("2d");
      blackContext.fillStyle = "#000000";
      blackContext.fillRect(0, 0, canvas.width, canvas.height);

      const blackDataURI = blackCanvas.toDataURL("image/jpeg");
      const blackBlobData = dataURItoBlob(blackDataURI);

      const username = sessionStorage.getItem("name");
      const fileName = `${username}-${Date.now()}-denied.jpg`;

      uploadImageToServer(blackBlobData, fileName);
    }
  });

  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  function uploadImageToServer(imageData, fileName) {
    const url = "/user/UploadImage"; 
    const formData = new FormData();
    formData.append("fileData", imageData, fileName);
    $.ajax({
      type: "POST",
      url: url,
      data: formData,
      processData: false,
      contentType: false,
      success: function (result) {
        $("loading").hide();
          sessionStorage.setItem("filePicture", fileName);
        moveToTest();
      },
      error: function (error) {
        $("loading").hide();
        console.error("Terjadi kesalahan saat mengunggah file: ", error);
      },
    });
  }

  function handleCameraAccessDenied() {
    cameraDenied = true;
  }
}
function stopCamera() {
  isCameraActive = true; 
}

document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
        startVideoStream();
    }
});
