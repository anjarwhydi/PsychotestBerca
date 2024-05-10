using Microsoft.AspNetCore.Mvc;

namespace Frontend.Controllers
{
    public class ParticipantController : Controller
    {
        private readonly IConfiguration _configuration;

        public ParticipantController(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public IActionResult Index()
        {
            /*var role = HttpContext.Session.GetString("roleName");
            if (role != "Admin" && role != "Audit" && role != "Super Admin")
            {
                TempData["noAuth"] = "Anda Harus Login Sebagai Admin";
                return RedirectToAction("index", "Home");
            }*/

            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];

            return View("~/Views/Admin/Participant/Index.cshtml");
        }

        public IActionResult disc()
        {
            /*var role = HttpContext.Session.GetString("roleName");
            if (role != "Admin" && role != "Super Admin")
            {
                TempData["noAuth"] = "Anda Harus Login Sebagai Admin";
                return RedirectToAction("index", "Home");
            }*/


            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];

            return View("~/Views/Admin/Participant/Result/Disc.cshtml");
        }
        public IActionResult msdt()
        {
            /*var role = HttpContext.Session.GetString("roleName");
            if (role != "Admin"  && role != "Super Admin")
            {
                TempData["noAuth"] = "Anda Harus Login Sebagai Admin";
                return RedirectToAction("index", "Home");
            }*/

            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];

            return View("~/Views/Admin/Participant/Result/Msdt.cshtml");
        }
        public IActionResult ist()
        {
            /*var role = HttpContext.Session.GetString("roleName");
            if (role != "Admin"  && role != "Super Admin")
            {
                TempData["noAuth"] = "Anda Harus Login Sebagai Admin";
                return RedirectToAction("index", "Home");
            }*/

            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];

            return View("~/Views/Admin/Participant/Result/Ist.cshtml");
        }

        public IActionResult rmib()
        {
            /*var role = HttpContext.Session.GetString("roleName");
            if (role != "Admin" && role != "Super Admin")
            {
                TempData["noAuth"] = "Anda Harus Login Sebagai Admin";
                return RedirectToAction("index", "Home");
            }*/

            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];

            return View("~/Views/Admin/Participant/Result/Rmib.cshtml");
        }

        public IActionResult papikostick()
        {
           /* var role = HttpContext.Session.GetString("roleName");
            if (role != "Admin" && role != "Super Admin")
            {
                TempData["noAuth"] = "Anda Harus Login Sebagai Admin";
                return RedirectToAction("index", "Home");
            }*/

            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];

            return View("~/Views/Admin/Participant/Result/Papikostick.cshtml");
        }
    }
}
