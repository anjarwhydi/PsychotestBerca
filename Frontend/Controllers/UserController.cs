using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Configuration;
using System.IO;

namespace Frontend.Controllers
{
    public class UserController : Controller
    {
        private readonly IConfiguration _configuration;

        // GET: ParticipantPage1Controller
        private readonly IWebHostEnvironment _webHostEnvironment;
        public UserController(IWebHostEnvironment webHostEnvironment, IConfiguration configuration)
        {
            _configuration = configuration;
            _webHostEnvironment = webHostEnvironment;
        }

        public ActionResult Index()
        {

            /*var role = HttpContext.Session.GetString("roleName");
            if (role != "Participant")
            {
                TempData["noAuth"] = "Anda Harus Login Sebagai Participant";
                return RedirectToAction("index", "Home");
            }*/


            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];

            return View("~/Views/Participant/User/Index.cshtml");
        }

        public ActionResult Page2()
        {
            /*var role = HttpContext.Session.GetString("roleName");
            if (role != "Participant")
            {
                TempData["noAuth"] = "Anda Harus Login Sebagai Participant";
                return RedirectToAction("index", "Home");
            }
*/

            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];

            return View("~/Views/Participant/User/Page2.cshtml");
        }

        public ActionResult Notest()
        {
            /*var role = HttpContext.Session.GetString("roleName");
            if (role != "Participant")
            {
                TempData["noAuth"] = "Anda Harus Login Sebagai Participant";
                return RedirectToAction("index", "Home");
            }*/

            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];

            return View("~/Views/DoTest/Notest.cshtml");
        }

        [HttpPost]
        public IActionResult UploadImage()
        {
            var files = HttpContext.Request.Form.Files;
            if (files.Count > 0)
            {
                var file = files[0];
                if (file.Length > 0)
                {
                    var fileName = Path.GetFileName(file.FileName);

                    // Ubah path penyimpanan menjadi '~/image/FaceCapturing/'
                    var path = Path.Combine(_webHostEnvironment.WebRootPath, "image", "FaceCapturing", fileName);

                    using (var stream = new FileStream(path, FileMode.Create))
                    {
                        file.CopyTo(stream);
                    }

                    return Content("File berhasil diunggah");
                }
            }

            return Content("Terjadi kesalahan saat mengunggah file");
        }
    }
}
