using DocumentFormat.OpenXml.EMMA;
using Frontend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace Frontend.Controllers
{
    public class AccountsController : Controller
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public AccountsController(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public IActionResult Index()
        {
            ViewBag.ApiUrl = _configuration["ApiSettings:ApiUrlBE"];
            
            /*var role = HttpContext.Session.GetString("roleName");
            if (role != "Super Admin")
            {
                TempData["noAuth"] = "Anda Harus Login Sebagai Super Admin";
                return RedirectToAction("index", "Home");
            }*/

            return View("~/Views/Admin/Accounts/Index.cshtml");
        }

        [HttpPost]
        public IActionResult AuthCheck([FromBody]LoginViewModel model)
        {
           
                var apiUrl = _configuration["ApiSettings:ApiUrlBE"] + "/api/Accounts/Login";
                var jsonModel = JsonSerializer.Serialize(model);
                var content = new StringContent(jsonModel, Encoding.UTF8, "application/json");

                var response = _httpClient.PostAsync(apiUrl, content).Result;
                var responseContent = response.Content.ReadAsStringAsync().Result;

            if (response.IsSuccessStatusCode)
            {
                var responseData = JsonSerializer.Deserialize<JsonElement>(responseContent);

                var token = responseData.GetProperty("token").GetString();

                var claims = decodeJWT(token);

                var roleName = claims[4].Value;

                HttpContext.Session.SetString("roleName", roleName ?? "");
            }

            return Content(responseContent, "application/json");

        }

        public List<Claim> decodeJWT(string jwt)
        {
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(jwt) as JwtSecurityToken;

            // Return the claims
            return jsonToken?.Claims.ToList();
        }

    }
}
