using Microsoft.AspNetCore.Mvc;

namespace Frontend.Controllers
{
    public class ErrorController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public ActionResult NotFound()
        {
            return View("~/Views/Error/404.cshtml");
        }

        public ActionResult ServerError()
        {
            return View("~/Views/Error/500.cshtml");
        }

        public ActionResult PageNotFound(int statusCode) {
        if(statusCode == 404)
            {
                return View("~/Views/Error/404.cshtml");
            }
            return View("~/Views/Error/404.cshtml");

        }
    }
}
