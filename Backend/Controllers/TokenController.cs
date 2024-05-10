using Backend.BaseController;
using Backend.Models;
using Backend.Repository.Data;
using Backend.ViewModel;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using Microsoft.AspNetCore.Authorization;
using Backend.Repository.Interface;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace Backend.Controllers
{
    [Authorize(Roles = "Super Admin,Admin,Audit")]
    [Route("api/[controller]")]
    [ApiController]
    public class TokenController : BaseController<TblToken, TokenRepository, int>
    {
        private readonly TokenRepository tokenRepository;
        private static Random random = new Random();

        public TokenController(TokenRepository tokenRepository) : base(tokenRepository)
        {
            this.tokenRepository = tokenRepository;
        }


        [HttpGet("GetToken/{token}"),AllowAnonymous]
        public ActionResult GetToken(string token)
        {
            var get = tokenRepository.checkToken(token);
            if (get == null)
            {
                return StatusCode(400, new { status = HttpStatusCode.NotFound, message = $"Data Not Found", Data = 0 });

            }
            return StatusCode(202, new { status = HttpStatusCode.OK, message = $"Data Found", Data = get });

        }

    }
}
