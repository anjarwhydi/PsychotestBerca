using Microsoft.AspNetCore.Mvc;

namespace Frontend.Controllers
{
    public class DoTestController : Controller
    {
        private readonly IConfiguration _configuration;

        public DoTestController(IConfiguration configuration)
        {
            _configuration = configuration;
        }


        [Route("dotest/Instruction/{testName}")]
        public IActionResult Instruction(string testName)
        {
            /*var role = HttpContext.Session.GetString("roleName");
            if (role != "Participant")
            {
                TempData["noAuth"] = "Anda Harus Login Sebagai Participant";
                return RedirectToAction("index", "Home");
            }*/
            string viewName = GetViewName(testName, "instruksi");
            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];

            if (viewName != null)
            {
                return View(viewName);
            }

            // Jika tidak ada tes
            return NotFound();
        }

        [Route("dotest/Instruction/{testName}/subtes{indexSubtest}")]
        public IActionResult ISTSubtest(string testName, int indexSubtest)
        {
            /*var role = HttpContext.Session.GetString("roleName");
            if (role != "Participant")
            {
                TempData["noAuth"] = "Anda Harus Login Sebagai Participant";
                return RedirectToAction("index", "Home");
            }*/
            string viewName = GetViewName(testName, $"instruksi-subtest{indexSubtest}");
            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];

            if (viewName != null)
            {
                return View(viewName);
            }

            // Jika tidak ada tes
            return NotFound();
        }

        [Route("dotest/StartTest/{testName}/subtes{indexSubtest}")]
        public IActionResult StartTest(string testName, int indexSubtest)
        {
            /*var role = HttpContext.Session.GetString("roleName");
            if (role != "Participant")
            {
                TempData["noAuth"] = "Anda Harus Login Sebagai Participant";
                return RedirectToAction("index", "Home");
            }*/
            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];
            string viewName = GetViewName(testName, $"test-subtest{indexSubtest}");

            if (viewName != null)
            {
                return View(viewName);
            }

            // Jika tidak ada tes
            return NotFound();
        }

        [Route("dotest/StartTest/{testName}")]
        public IActionResult StartTest(string testName)
        {
            /*var role = HttpContext.Session.GetString("roleName");
            if (role != "Participant")
            {
                TempData["noAuth"] = "Anda Harus Login Sebagai Participant";
                return RedirectToAction("index", "Home");
            }*/

            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];

            string viewName = GetViewName(testName, $"test");

            if (viewName != null)
            {
                return View(viewName);
            }

            // Jika tidak ada tes
            return NotFound();
        }

        private string GetViewName(string testName, string viewSuffix)
        {
            switch (testName)
            {
                case "ist":
                    return $"IST/{viewSuffix}";
                case "disc":
                    return $"DISC/{viewSuffix}";
                case "papikostick":
                    return $"PapiKostick/{viewSuffix}";
                case "msdt":
                    return $"MSDT/{viewSuffix}";
                case "rmib":
                    return $"RMIB/{viewSuffix}";
                default:
                    return null; // Mengembalikan null jika tes tidak ditemukan.
            }
        }
        [Route("{testname}/Instruction-Subtest{subtest}")]
        public IActionResult IstSubtest(int subtest,string testname)
        {
            /*var role = HttpContext.Session.GetString("roleName");
            if (role != "Participant")
            {
                TempData["noAuth"] = "Anda Harus Login Sebagai Participant";
                return RedirectToAction("index", "Home");
            }*/
            string viewName = GetViewName(testname,$"Instruksi-subtest{subtest}");
            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];

            if (viewName != null)
            {
                return View(viewName);
            }

            // Jika tidak ada tes
            return NotFound();
        }
        public ActionResult Finished()
        {
            /*var role = HttpContext.Session.GetString("roleName");
            if (role != "Participant")
            {
                TempData["noAuth"] = "Anda Harus Login Sebagai Participant";
                return RedirectToAction("index", "Home");
            }*/
            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];

            return View("~/Views/DoTest/Finished.cshtml");
        }
    }
}
