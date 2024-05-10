function generatePsikogram(idParticipant) {
  $("#loading").show();
  var dataPsy = null;
    var nik = null;
    var nama = null;
  $.ajax({
    url:
      ApiUrl +
      "/api/ParticipantAnswer/GetAnswareByParticipantId?participantId=" +
      idParticipant,
    type: "GET",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    async: false,
    headers: {
      Authorization: "Bearer " + sessionStorage.getItem("token"),
    },
      success: function (result) {
          dataPsy = Sorting(result.data);
          nama = result.data[0].participant.account.name ?? " ";

      nik = result.data[0].participant.nik;
    },
      error: function (errorMessage) {
      dataPsy = "0";
    },
  });
  if (dataPsy === "0") {
    $("#loading").hide();
    return Swal.fire("Gagal", `Data Tidak Ditemukan`, "error");
    }

    let allInvalid = false;

    for (let i = 0; i < dataPsy.length; i++) {
        if (dataPsy[i].finalScore === "INVALID") {
            allInvalid = true;
            break;
        }
    }

    if (allInvalid) {
        $("#loading").hide();
        Swal.fire("Gagal", `Participant Terdapat Hasil Invalid!`, "error");
    }
    let stat = 0;
  dataPsy.forEach(function (val) {
    if (val.status === true) {
      stat += 1;
    }
  });
  if (stat !== dataPsy.length) {
    $("#loading").hide();
    return Swal.fire(
      "Gagal",
      `Participant Belum Selesai Mengerjakan Tes`,
      "error"
    );
  }
  if (!nik) {
    $("#loading").hide();
    return Swal.fire(
      "Gagal",
      `NIK Participant Kosong, Harap Edit Data`,
      "error"
    );
  }

    var arrData = Array(5).fill("0");
    
  // IST COnverting
  var substringnik = nik.substring(6, 12);
  var age = extractDateAndAge(substringnik);

  if (age.age.includes("NaN")) {
    $("#loading").hide();
    return Swal.fire(
      "Gagal",
      `NIK Participant Salah, Harap Edit Data`,
      "error"
    );
    }
    dataPsy.forEach((element, index) => {
        switch (element.testId) {
            case 4:
                var dataIst = element.finalScore.split(",");
                var conIst = convertDataIst(age, nama, dataIst);
                arrData[0] = conIst;
                break
            case 5:
                var dataDisc = element.finalScore.split(",");
                var conDisc = convertDataDisc(dataDisc);
                arrData[2] = conDisc;
                break

            case 6:
                var dataRmib = element.finalScore.split(",");
                var conRmib = convertDataRmib(dataRmib);
                arrData[3] = conRmib;
                break


            case 7:
                var dataPapi = element.finalScore.split(",");
                var conPapi = convertDataPapi(dataPapi);
                arrData[1] = conPapi;
                break


            case 11:
                var dataMsdt = element.finalScore.split(",");
                var conMsdt = convertDataMsdt(dataMsdt);
                arrData[4] = conMsdt;
                break


            default:
                break
        }
    });
    arrData[5] = nama
    arrData[6] = age.age.replace(",", " ")

  downloadFile(arrData, nama);
}
function Sorting(arr) {
  let len = arr.length;
  let swapped;
  do {
    swapped = false;
    for (let i = 0; i < len - 1; i++) {
      if (arr[i].testId > arr[i + 1].testId) {
        let temp = arr[i];
        arr[i] = arr[i + 1];
        arr[i + 1] = temp;
        swapped = true;
      }
    }
  } while (swapped);
  return arr;
}
function extractDateAndAge(substringnik) {
  var tanggal = parseInt(substringnik.substring(0, 2)); 
  var bulan = parseInt(substringnik.substring(2, 4));
  var tahun = substringnik.substring(4, 6);
  var today = new Date();

  if (parseInt(tahun) >= 49) {
    tahun = "19" + tahun;
  } else {
    tahun = "20" + tahun;
  }

  if (tanggal >= 40) {
    tanggal -= 40;
  }

  var ageInMilliseconds = today - new Date(`${tahun}-${bulan}-${tanggal}`);
  var ageInDays = ageInMilliseconds / (1000 * 60 * 60 * 24);
  var ageYears = Math.floor(ageInDays / 365);
  var ageMonths = Math.floor((ageInDays % 365) / 30); 

  return {
    age: `${ageYears} tahun, ${ageMonths} bulan`, 
  };
}
function getRankIndexes(arr, values) {
    const indexes = [];
    values.forEach(function (val, ind){
        arr.forEach(function (arrVal, arrInd) {
            if (arrVal === val) {
                indexes.push(arrInd);
            }
        })
    })
  return indexes;
}

function convertDataIst(age, nama, dataIst) {
  age = age.age.replace(/,/g, "");

  var finalDataIst = [];
  dataIst.pop();
  dataIst = dataIst.map(function (x) {
    return parseInt(x, 10);
  });

  var ageForIst = age.split("");
    ageForIst = parseInt(ageForIst[0] + ageForIst[1]);

  $.ajax({
    url: ApiUrl + "/api/Participant/convertIST?age=" + ageForIst,
    type: "POST",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    headers: {
      Authorization: "Bearer " + sessionStorage.getItem("token"),
    },
    async: false,
    data: JSON.stringify(dataIst),
    crossDomain: true,
      success: function (result) {
      var scoreData = result.data.split(",");
      scoreData.splice(9, 1);
      for (let i = 0; i < scoreData.length; i++) {
        if (i === scoreData.length - 1) {
          var lastDataIst = scoreData[i].split(" ");
          for (let j = 0; j < lastDataIst.length; j++) {
            var text = lastDataIst[j];
            if (j === 0) {
              text = "IQ = " + lastDataIst[j];
            }
            finalDataIst.push(text);
          }
        } else {
          finalDataIst.push(scoreData[i]);
        }
      }
      finalDataIst.push(nama);
      finalDataIst.push(age);
    },
    error: function (errorMessage) {
      finalDataIst.push(" ");
      return alert(errorMessage.responseText);
    },
  });
  return finalDataIst.toString();
}
function convertDataPapi(dataPapi) {
  var finalDataPapi = [];
  dataPapi.pop();
  dataPapi = dataPapi.map(function (x) {
    return parseInt(x, 10);
  });
  finalDataPapi.push(dataPapi[0]);
  finalDataPapi.push(dataPapi[1]);
  finalDataPapi.push(dataPapi[2]);
  finalDataPapi.push(dataPapi[3]);
  finalDataPapi.push(dataPapi[4]);
  finalDataPapi.push(dataPapi[5]);
  finalDataPapi.push(dataPapi[6]);
  finalDataPapi.push(dataPapi[9]);
  finalDataPapi.push(dataPapi[10]);
  finalDataPapi.push(dataPapi[12]);
  finalDataPapi.push(dataPapi[14]);
  finalDataPapi.push(dataPapi[16]);
  finalDataPapi.push(dataPapi[19]);
  finalDataPapi.push(dataPapi[8]);
  finalDataPapi.push(dataPapi[7]);
  finalDataPapi.push(dataPapi[15]);
  finalDataPapi.push(dataPapi[11]);
  finalDataPapi.push(dataPapi[13]);
  finalDataPapi.push(dataPapi[17]);
  finalDataPapi.push(dataPapi[18]);

  return finalDataPapi.toString();
}

function convertDataDisc(dataDisc) {
  var finalDataDisc = [];
  dataDisc.pop();
  for (let i = 0; i < 15; i++) {
    dataDisc.shift();
  }
  finalDataDisc.push(dataDisc[0] + " - " + dataDisc[1]);
  dataDisc.shift();
  dataDisc.shift();
  finalDataDisc.push(dataDisc.toString());
  return finalDataDisc.toString();
}

function convertDataRmib(dataRmib) {
  const label = [
    "Outdoor",
    "Mechanical",
    "Computational",
    "Scientific",
    "Personal Contact",
    "Aesthetic",
    "Literary",
    "Musical",
    "Social Service",
    "Clerical",
    "Practical",
    "Medical",
  ];
  const deskripsi = [
    "Outdoor merupakan jenis pekerjaan yang berhubungan dengan aktivitas di luar ruangan, atau aktivitas lapangan ataupun aktivitas yang memungkinkan untuk melakukan kegiatan di luar ruangan, yang membutuhkan mobilitas dan bergerak dari satu tempat ke tempat lainnya.",
    "Mengidentifikasi jenis pekerjaan yang menggunakan mesin, peralatan mesin, alat gerak mekanik. Menyukai kegiatan yang mempelajari prinsip mekanik dan pengoperasiannya dan juga memanipulasi, memanfaatkan dan memodifikasi, memperbaiki ataupun memfungsikan berbagai peralatan. Tes ini juga berusaha untuk bisa melihat seberapa besar keinginan dan kemauan individu untuk terlibat dan mengembangkan kontribusinya untuk menggunakan alat guna mengasilkan produk tertentu.",
    "Berupaya untuk mendeteksi rasa suka atau tidak suka seseorang berhubungan dengan angka, operasi hitungan, analisa berhubungan dengan angka, melakukan manipulasi, forecasting yang berhubungan dengan angka. Individu menikmati bekerja dengan angka.",
    "Scientific merupakan pekerjaan yang berhubungan dengan analisa, penyelidikan, penelitian, eksperiman dan berbagai hal yang berhubungan dengan ilmu pengetahuan. Individu menunjukkan kemauan, kontribusi, komitmen untuk mengembangkan dan bekerja dengan angka. Ia tidak segan berkreasi dan memaknakan data numerik.",
    "Personal Contact mengidentifikasi minat pada pekerjaan yagn berhubungan dengan manusia, hubungan interpersonal, melakukan pendektan personal, menjalin diskusi, dan juga hubungan dengan relasi personal, minat di bidang ini melibatkan dorongan untuk menjalin hubungan dan melakukan pendekatan pada orang.",
    "Aesthetic mengidentifikasi rasa suka akan pekerjaan yang berhubungan dengan seni, baik sebagai penikmat seni atau orang yang memproduksi seni atau berhubungan dengan kreasi seni, memanipulasi, menggunakan alat maupun melakukan aktivitas yang bersifat memproduksi musik, seni ataupun menjadi ahli atau penikmat seni yang menghayati aspek estetika.",
    "Literary merupakan upaya untuk identifikasi pekerjaan yang berkaitan dengan membaca buku, membaca, mengarang, aktivitas yang berhubungan dengan kata, kalimat, dan segala bentuk kegiatan literature, seperti menulis, mengarang, dan sebagainya. Baik sebagai penikmat yang cerdas, menunjukkan kemauan untuk bisa terlibat.",
    "Musical mengidentifikasi aktivitas yang berhubungan dengan pekerjaan yang berkaitan dengan music, baik dalam bentuk menyeleksi music, hingga melakukan aktivitas seperti memainkan alat music, menciptakan lagu, instrumentalia. Bisa juga digunakan untuk identifikasi seberapa besar komitmen dan kesungguhannya dalam menunjukkan kontribusi dalam menjalankan aktivitas berhubungan dengan musik.",
    "Social Service menyangkut minat yang berhubungan dengan aktivitas yang berkaitan dengan kehidupan sosial, pelayanan masyarakat, berbagai bentuk layanan pada penduduk dengan keinginan untuk menolong dan membimbing atau memberikan jalan keluar mengenai masalah sosial. Menunjukkan kepedulian dan kontribusi dan kemauan untuk memperhatikan, memikirkan membantu dan juga mendukung kehidupan sesama manusia yang lebih baik.",
    "Clerical berhubungan dengan minat untuk pekerjaan yang berhubungan dengan tugas – tugas rutin,tugas yang membutuhkan kecekatan dan ketrampilan tanga, memanipulasi dan merekayasa objek dengan mengandalkan kecermatan, konsistensi dan kerapihan pada objek yang memutuhkan perhatian pada unsur detil.",
    "Practical menyangkut rasa suka atau tidak suka akan pekerjaan yang sifatnya praktis, membutuhkan keahlian, dan keterampilan untuk membuat suatu objek tertentu. Menyangkut kemampuan memproduksi, memanipulasi ataupun memodifikasi objek atau benda.",
    "Medical mengidentifikasi pekerjaan yang berkaitan dengan pengobatan, penyembuhan, dan juga perawatan secara medis ataupun yang berhubungan dengan Kesehatan. Menunjukkan perhatian, keterlibatan, kontribusi dan waktu untuk melakukan kegiatan yang berhubungan dengan.",
  ];
  var finalDataRmib = [];
  dataRmib.pop();
    var rank = dataRmib.slice(12, 24).map(Number);
  const valuesToFind = [1, 2, 3];
    const indexes = getRankIndexes(rank, valuesToFind);
    const sortedLabels = indexes.map((index) => label[index]);
  sortedLabels.forEach(function (dat) {
    finalDataRmib.push(dat);
  });
  indexes.sort((a, b) => rank[a] - rank[b]);
  indexes.forEach(function (ind) {
    finalDataRmib.push(deskripsi[ind].replace(/,/g, ";"));
  });
  return finalDataRmib.toString();
}

function convertDataMsdt(dataMsdt) {
  const type = [
    "deserter",
    "missionary",
    "autocratic",
    "compromiser",
    "bureaucratic",
    "developer",
    "benevolent-autocratic",
    "executive",
  ];
  const desc = [
    "Model gaya kepemimpinan MSDT yang satu ini adalah tipe gaya dalam manajemen yang suka mengabaikan sebuah permasalahan, tak mau bertanggung jawab atau yang dapat di istilahkan dengan laisser-faire, dan mencucui tangan (tak mau di salahkan). Tipe dalam gaya kepemimpinan seperti ini lebih cenderung untuk mengabaikan keterlibatan ataupun intervensi yang dapat menjadikan sebuah situasi yang di anggapnya rumit.\nSikapnya pun akan selalu berubah untuk mencoba netral pada apa yang terjadi di dalam keseharian, mencoba untuk mencari jalan agar dapat menghindari aturan yang ia anggap sedikit menyulitkan.\nPola yang ia coba adalah tetap menyelaraskan apa yang ada, antara atasan dan juga bawahan, dan mengindari dari perubahan rencana. Pola ini pun akan nampak secara sistem manajerial yang defensive. Misalkan saja ada sebuah kebijakan yang di anggap menyulitkan bawahan, maka ia pun akan mengatakan bahwa saya hanya menjalankan suatu perintah, dari kebijakan daripada atasan.\nTipe gaya kepemimpinan manajerial ini tak selalu buruk dalam di aplikasikan, hanya saja tipe gaya kepemimpinan manajerial ini berupaya dalam menjaga status-quo dan juga menghindari dari perubahan yang drastic atau berupa guncangan di dalam tubuh manajemen.",
    "Pendekatan tipe gaya ini adalah menggunakan unsur afektif yang cenderung kental. Missionary berupaya mendorong sebuah situasi positif dalam sistem manajemen dengan memberikan kandungan yang sensitive, kepedulian pada sesame, dan hal hal lain yang seringkali dianggap penting untuk meningkatkan produktifitas dan kinerja lewat sentuhan emosi atau perasaan.\nModel Gaya kepemimpinan manajerial ini berupaya untuk selalu menjaga orang lain, termasuk bawahannya sendiri dalam situasi yang berbahagia di kondisi apapun. Perilaku untuk mengajak menunjukkan bagian paling penting dari gaya yang ia tunjukkan.\nTipe gaya kepemimpinan ini kurang efektif dalam manajemen yang minim ketersediaan peluang konflik, yang mana ia akan berupaya untuk halus dalam mengajak yang padaha banyak pekerjaan di dalamnya membutuhkan ketegasan para manajemen.",
    "Model gaya kepemimpinan ini memiliki pendekatan yang memiliki pengarahan kurang efektif. Gaya seperti ini cenderung lebih perhatian kepada mereka yang memiliki produktivitas dan hasil. Skor yang tinggi seringkali dianggap sebagai manajer yang formil, dimana mereka memberikan tugas pada bawahan hanya berdasarkan instruksi dan juga mengawasi secara ketat untuk prosesnya.\nKesalahan sedikit, cenderung sulit untuk ditolelir mereka (para manajer) yang memiliki pola kepemimpinan seperti ini. Bagi anda para bawahan yang memiliki manajer seperti ini maka sebaiknya untuk menghindari kesalahan dalam mengerjakan segala sesuatu. Kebijakan dalam hal apapunn adalah urusan atasan sementara itu, bawahan cukup untuk melaksanakan apa yang telah diperintahkan tanpa alasan untuk membuang-buang waktu.\nDi dalam tipe ini, para bawahan akan dianggap dingin atasan, terutama mereka (bawahan) yang membutuhkan lebih daripada hanya sekedar tugas untuk dikerjakan seperti dorongan dan juga pengakuan hingga dukungan atasan.",
    "Gaya ini memiliki ciri mengandalkan tugas dan juga relasi yang seimbang, namun gaya ini seringkali dianggap kurang memiliki keefektifan, karena sulit untuk mengintegrasikan suatu tuntutan pekerjaan dan hubungan keseharian. Gaya ini pun akan semakin membingungkan antara pengaturan tugas dan juga kebutuhan dalam berinteraksi.\nDalam menghadapi sebuah tekanan, maka mereka (manajer) akan cenderung untuk kompromi sehingga beragam tujuan seringkali menyimpang atau tidak sesuai dengan waktu maupun target yang telah di tetapkan. Sensitifitas pada hubungan lebih sering mengubah alasan terhadap tujuan awal.",
    "Tipe gaya manajemen ini adalah tipe procedural, dan berdasr pada aturan atau tata laksana dengan tulus untuk menerima hirarki kewenangan. Gaya ini merupakan simbol dari hubungan manajemen yang formal dalam bersikap. Skor tinggi memiliki arti sistematik. Fungsi dan juga peran para pemimpin tipe birokrat akan sangat optimal dalam situasi ang terstruktur dengan sebuah pola procedural yang jelas, walaupun prosedur tersebut memiliki tingkat kerumitan tinggi.",
    "Model gaya kepemimpinan manajerial sisi efektif dari tipe gaya kepemimpinan manajerial missionary. Tujuan dari gaya ini adalah untuk bertindak secara professional tanpa sedikitpun mengesampingkan suatu aspek emosi dari bawahan. Bawahan akan diberikan kesempaan dalam memberikan ide, pandangan maupun peran lebih daripada kebijakan yang ada untuk mengembangkan sebuah potensi.\nKontribusi dari bawahan yang diberikan padanya pun sangat diperhatikan. Skor tinggi memiliki keyakinan yang optimis tentang para individu untuk bekerja dan menghasilkan. Sifat pendekatannya berupa kolegial, yang mana bawahan sebagai patner bukan cuma sebagai pembantu dalam mengerjakan segala sesuatu.\nTipe gaya ini merupakan orang-orang manajer yang senang untuk berbagi pengetahuan dan juga keahlian dan potensi bawahan pun akan dioptimalkannya.",
    "Tipe gaya benevolent autocratic memiliki sisi pengendalian dan juga pengarahan yang komunikatif dalam melakukan gaya otokratik. Tipe ini efektif karena memberi unsur komunikatif tadi. Namun gaya ini masih mengandalakan suatu instruksi dan intervensi.\nSkor tinggi yang dimiliki dilihat sebagai seorang guru dalam memberikan tugas pada bawahan, dimana ia dapat memberikan suatu instruksi dengan baik tanpa mengesampingkan komunikasi pada bawahan secara lebih fleksibel.\nPola ini dilakukan dengan tidak meninggalkan bawahan dengan memberikan kesediaan bertanya, membantu ia apabila ada yang ia anggap kurang atau menyimpang. Mereka tidak ragu untuk memberikan perintah, dan tak ragu pula dalam memberikan hukuman namun tetap adil dalam bersikap. Gaya ini mungkin baik dalam sisi kerjasama namun mereka yang memiliki kecendrungan gaya ini menghindari hubungan yang bersifat personal.",
    "Gaya ini dianggap efektif dikarenakan dapat mengolah dengan baik dalam bertugas dan juga berhubungan. Model ini memiliki sisi efektif daripada gaya kompromis. Polanya pun dilakukan dengan mengintegrasikan antara tugas dan juga hubungan dengan baik, memanfaatkan kedua aspek dengan sinergi yang sangat optimal dalam mengelola manajemen.\nPendekatan ini merupakan pendekatan dan gaya kepemimpinan paling baik di antara gaya kepemimpinan lain. Karena sifat dari gaya kepemimpinan executive adalah melibatkan semua unsur keunggulan daripada semua pendekatan gaya yang ada. Ia pun seringkali dianggap sebagai motivator dalam manajemen. Anda juga dapat memahami tipe gaya kepemimpinan dalam psikologi dahulu, agar lebih menambah wawasan keilmuan.",
  ];
  var finalDataMsdt = [];
  dataMsdt.pop();
  type.forEach(function (val, ind) {
    if (val === dataMsdt.toString().toLowerCase()) {
      finalDataMsdt.push(val);
      finalDataMsdt.push(desc[ind]);
    }
  });
  return finalDataMsdt.toString();
}

function downloadFile(data, nama) {
  $.ajax({
    type: "POST",
    url: ApiUrl + "/api/Participant/downloadPsikogram",
    data: JSON.stringify(data),
    headers: {
      Authorization: "Bearer " + sessionStorage.getItem("token"),
    },
    contentType: "application/json; charset=utf-8",
    crossDomain: true,
    xhrFields: {
      responseType: "blob",
    },
      success: function (data) {
      var a = document.createElement("a");
      var url = window.URL.createObjectURL(data);
      a.href = url;
      a.download = nama + ".xlsm";
      a.click();
      window.URL.revokeObjectURL(url);
      $("#loading").hide();
    },
      error: function (error) {
      $("#loading").hide();
    },
  });
}
