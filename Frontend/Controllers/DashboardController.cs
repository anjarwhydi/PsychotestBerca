using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Frontend.Controllers
{
    public class DashboardController : Controller
    {
        private readonly IConfiguration _configuration;

        public DashboardController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public IActionResult Index()
        {   
            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];

            /*var role = HttpContext.Session.GetString("roleName");
            if (role != "Admin" && role != "Audit" && role != "Super Admin")
            {
                TempData["noAuth"] = "Anda Harus Login Sebagai Admin";
                return RedirectToAction("index", "Home");
            }*/

            return View("~/Views/Admin/Dashboard/Index.cshtml");
        }
    }

}
