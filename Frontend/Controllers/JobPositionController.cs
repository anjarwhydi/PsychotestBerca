using Microsoft.AspNetCore.Mvc;

namespace Frontend.Controllers
{
    public class JobPositionController : Controller
    {
        private readonly IConfiguration _configuration;

        public JobPositionController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public IActionResult Index()
        {
           /* var role = HttpContext.Session.GetString("roleName");
            if (role != "Admin" && role != "Audit" && role != "Super Admin")
            {
                TempData["noAuth"] = "Anda Harus Login Sebagai Admin";
                return RedirectToAction("index", "Home");
            }
*/

            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];

            return View("~/Views/Admin/JobPosition/Index.cshtml");
        }
    }
}
