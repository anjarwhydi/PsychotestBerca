using Microsoft.AspNetCore.Mvc;

namespace Frontend.Controllers
{
    public class TestCorsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
