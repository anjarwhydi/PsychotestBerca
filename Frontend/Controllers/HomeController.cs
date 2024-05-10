using Frontend.Models;
using Microsoft.AspNetCore.Mvc;
using System.Configuration;
using System.Diagnostics;

namespace Frontend.Controllers
{
    public class HomeController : Controller
    {

        private readonly IConfiguration _configuration;
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public IActionResult Index()
        {
            /*var role = HttpContext.Session.GetString("roleName");
            if (role == "Admin" || role == "Audit" || role == "Super Admin")
            {
                return RedirectToAction("index", "Dashboard");
            }*/
            
            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];
            return View("~/Views/Login/Login.cshtml");
        }

        /*Forgot Password*/
        public IActionResult ForgotPassword()
        {
            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];
            return View("~/Views/Login/ForgotPassword.cshtml");
        }
        /*Recover Password*/
        public IActionResult RecoverPassword()
        {
            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];
            return View("~/Views/Login/RecoverPassword.cshtml");
        }

        public IActionResult tes()
        {
            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];
            return View("~/Views/DoTest/login.cshtml");
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}