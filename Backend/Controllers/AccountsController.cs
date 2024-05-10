using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using EmailService;
using Backend.Repository.Data;
using Backend.ViewModels;
using Backend.BaseController;
using Microsoft.AspNetCore.Authorization;
using Azure;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using Backend.Repository.Interface;
using System.IO;
using ClosedXML.Excel;
using Castle.Core.Smtp;
using IEmailSender = EmailService.IEmailSender;

namespace Backend.Controllers
{
    [Authorize(Roles = "Super Admin,Admin,Audit")]
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : BaseController<TblAccount, AccountRepository, int>
    {
        public readonly AccountRepository _repository;
        public readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor context;
        private readonly IEmailSender _emailSender;
        private readonly TokenRepository tokenRepository;
        private readonly ParticipantRepository participantRepository;


        public AccountsController(AccountRepository repository, IConfiguration configuration, IHttpContextAccessor httpContext, IEmailSender emailSender, TokenRepository tokenRepository, ParticipantRepository participant) : base(repository)
        {
            this.context = httpContext;
            _repository = repository;
            _configuration = configuration;
            _emailSender = emailSender;
            this.tokenRepository = tokenRepository;
            this.participantRepository = participant;
        }



        
        [Authorize(Roles = "Super Admin")]
        [HttpPost("RegisterAdmin")]
        public ActionResult RegisterAdmin(UserRoleVM userRoleVM)
        {
            var result = _repository.RegisterAdmin(userRoleVM);
            switch (result)
            {
                case 1:
                    return StatusCode(200,
                        new
                        {
                            status = HttpStatusCode.OK,
                            message = "Success Create",
                            Data = result
                        });
                case 2:
                    return StatusCode(400,
                        new
                        {
                            status = HttpStatusCode.BadRequest,
                            message = "Failed Create!, Email already Exist!",
                            Data = result
                        });
                default:
                    return StatusCode(500,
                        new
                        {
                            status = HttpStatusCode.InternalServerError,
                            message = "Failed Create!",
                            Data = result
                        });
            }
        }

        [Authorize(Roles = "Super Admin")]
        [HttpPost("DuplicateEmail")]
        public ActionResult DuplicateEmailCheck(string Email)
        {
            var result = _repository.DuplicateEmailCheck(Email);
            switch (result)
            {
                case 1:
                    return StatusCode(200,
                        new
                        {
                            status = HttpStatusCode.OK,
                            message = "Email is valid to use."
                        });
                case 2:
                    return StatusCode(400,
                        new
                        {
                            status = HttpStatusCode.BadRequest,
                            message = "Email is already registered."
                        });
                default:
                    return StatusCode(500,
                        new
                        {
                            status = HttpStatusCode.InternalServerError,
                            message = "An error has occured.",
                            Data = result
                        });
            }
        }

        [Authorize(Roles = "Super Admin")]
        [HttpPost("DuplicateEmailPar")]
        public ActionResult DuplicateEmailCheckPar(string Email)
        {
            var result = _repository.DuplicateEmailCheckPar(Email);
            switch (result)
            {
                case 1:
                    return StatusCode(200,
                        new
                        {
                            status = HttpStatusCode.OK,
                            message = "Email is valid to use."
                        });
                case 2:
                    return StatusCode(400,
                        new
                        {
                            status = HttpStatusCode.BadRequest,
                            message = "Email is already registered."
                        });
                default:
                    return StatusCode(500,
                        new
                        {
                            status = HttpStatusCode.InternalServerError,
                            message = "An error has occured.",
                            Data = result
                        });
            }
        }

        [Authorize(Roles = "Super Admin")]
        [HttpPut("SoftDelete")]
        public ActionResult SoftDelAdmin(int id)
        {
            var del = _repository.UsingSoftDel(id);


            if (del != 0)
            {
                return StatusCode(200,
                            new
                            {
                                status = HttpStatusCode.OK,
                                message = "Account Is Deleted",
                                Data = del
                            });
            }
            return StatusCode(400,
                        new
                        {
                            status = HttpStatusCode.BadRequest,
                            message = "Failed ! Try Again",
                            Data = 0
                        });
        }
        private string CreateToken(TblAccount tblAccount)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim("Id", tblAccount.AccountId.ToString()),
                new Claim(ClaimTypes.Name, tblAccount.Name),
                new Claim(ClaimTypes.Email, tblAccount.Email),
                new Claim("RoleId", tblAccount.RoleId.ToString()),
                new Claim(ClaimTypes.Role, tblAccount.Role.RoleName)
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration.GetSection("JWT:Key").Value));

            var cred = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: cred);

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);
            return jwt;
        }

        [HttpPost("Login"), AllowAnonymous]
        public ActionResult Login(LoginVM loginVM)
        {
            var login = _repository.Login();
            var get = login.SingleOrDefault(e => e.Email.ToLower() == loginVM.Email.ToLower() && BCrypt.Net.BCrypt.Verify(loginVM.Password, e.Password));
            if (get == null)
            {
                return StatusCode(404, new { status = HttpStatusCode.NotFound, message = $"Email atau Password Salah", Data = 0 });
            }
            var token = CreateToken(get);
            //context.HttpContext.Session.SetString("Id", get.AccountId.ToString());
            //context.HttpContext.Session.SetString("RoleName", get.Role.RoleName);

            return StatusCode(202, new { status = HttpStatusCode.OK, message = $"Anda Berhasil Login", Token = token });
        }

        [HttpPost("ForgotPassword"), AllowAnonymous]
        public ActionResult ForgotPassword(ForgotPasswordVM forgotPasswordVM)
        {
            var login = _repository.Get().ToList();
            var get = login.FirstOrDefault(e => e.Email == forgotPasswordVM.Email && e.IsDeleted == false);
            if (get == null)
            {
                return StatusCode(404, new { status = HttpStatusCode.NotFound, message = $"Email Tidak Ditemukan", Data = 0 });
            }

            var issuer = _configuration.GetValue<string>("Jwt:Issuer");
            var audience = _configuration.GetValue<string>("Jwt:Audience");
            var key = Encoding.UTF8.GetBytes(_configuration.GetValue<string>("Jwt:Key"));
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("Id", get.AccountId.ToString()),
                    new Claim(JwtRegisteredClaimNames.Email, forgotPasswordVM.Email),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                 }),
                Expires = DateTime.UtcNow.AddMinutes(15),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha512Signature)
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwtToken = tokenHandler.WriteToken(token);

            var newLink = RandomString();
            var tokenToInsert = new TblToken
            {
                Linked = newLink,
                Token = jwtToken
            };
            var tokenInsert = tokenRepository.Insert(tokenToInsert);
            if (tokenInsert == null)
            {
                return StatusCode(400, new { status = HttpStatusCode.NotFound, message = $"Cannot add token", Data = tokenToInsert });
            }

            var accessLink = _configuration["ApiSettings:ApiUrlFE"] + "/recoveryPassword/" + newLink;
            var message = new SendEmailDBMail
            {
                Name = forgotPasswordVM.Email,
                To = forgotPasswordVM.Email,
                Subject = " Forgot Password",
                Link = accessLink,
            };
            var sen = participantRepository != null ? participantRepository.SendEmailForgotPassword(message) : null;
            if (sen != null) { 
                return StatusCode(202, new { status = HttpStatusCode.OK, message = $"Kode Verifikasi Anda Telah DIkirimkan Melalui Email, Harap Cek Email Anda", Data = 1 });
            }
            else
            {
                return StatusCode(500, new { status = HttpStatusCode.InternalServerError, message = $"WebMail atau server Sedang Bermasalah, Harap hubungi Tim IT" });
            }
        }

        [HttpPut("RecoverPassword"), AllowAnonymous]
        public ActionResult RecoverPassword(RecoverPasswordVM recoverPasswordVM)
        {

            var get = _repository.Get(recoverPasswordVM.AccountId);



            if (get == null)
            {
                return StatusCode(404, new { status = HttpStatusCode.NotFound, message = $"Akun Tidak Ditemukan", Data = 0 });
            }
            if (recoverPasswordVM.Password != recoverPasswordVM.RePassword)
            {
                return StatusCode(404, new { status = HttpStatusCode.BadRequest, message = $"Password dan Repassword Harus Sama", Data = 0 });
            }

            var pass = new TblAccount
            {
                AccountId = recoverPasswordVM.AccountId,
                Password = recoverPasswordVM.Password
            };

            var updPass = _repository.RecoverPassword(pass);

            if (updPass == 0)
            {
                return StatusCode(404, new { status = HttpStatusCode.NotFound, message = $"Gagal Diupdate" });
            }
            return StatusCode(202, new { status = HttpStatusCode.OK, message = $" Password berhasil DIubah", Data = updPass });
        }

        [HttpPost("GetAdminByPaging"), AllowAnonymous]
        public ActionResult GetAdminByPaging()
        {
            try
            {
                int totalRecord = 0;
                int filterRecord = 0;
                var draw = Request.Form["draw"].FirstOrDefault();
                var sortColumn = Request.Form["columns[" + Request.Form["order[0][column]"].FirstOrDefault() + "][name]"].FirstOrDefault();
                var sortColumnDirection = Request.Form["order[0][dir]"].FirstOrDefault();
                var searchValue = Request.Form["search[value]"].FirstOrDefault();
                int pageSize = Convert.ToInt32(Request.Form["length"].FirstOrDefault() ?? "0");
                int skip = Convert.ToInt32(Request.Form["start"].FirstOrDefault() ?? "0");
                var data = _repository.GetAdmin().AsQueryable();
                //get total count of data in table
                totalRecord = data.Count();
                // search data when search value found
                if (!string.IsNullOrEmpty(searchValue))
                {
                    data = data.Where(x => x.Name.ToLower().Contains(searchValue.ToLower())
                                        || x.Email.ToLower().Contains(searchValue.ToLower())
                                        || x.Role.RoleName.ToLower().Contains(searchValue.ToLower()));

                }
                // get total count of records after search
                filterRecord = data.Count();
                //sort data
                if (!(string.IsNullOrEmpty(sortColumn) && string.IsNullOrEmpty(sortColumnDirection)))
                {
                    data = data.OrderBy(s => sortColumn + " " + sortColumnDirection);
                }
                //pagination
                var getData = data.Skip(skip).Take(pageSize).ToList();
                var jsonData = new
                {
                    draw = draw,
                    recordsTotal = totalRecord,
                    recordsFiltered = filterRecord,
                    data = getData
                };

                return Ok(jsonData);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet("GetAdmin"), AllowAnonymous]
        public virtual ActionResult GetAdmin()
        {
            var get = _repository.GetAdmin().ToList();

            if (get.Count() != 0)
            {
                return StatusCode(200,
                    new
                    {
                        status = HttpStatusCode.OK,
                        message = get.Count() + "Data Found!",
                        Data = get
                    });
            }
            else
            {
                return StatusCode(404,
                new
                {
                    status = HttpStatusCode.NotFound,
                    message = "Data Not Found!",
                    Data = get
                });
            }
        }

        public static string RandomString()
        {
            Random random = new Random();
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
            return new string(Enumerable.Repeat(chars, 15)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}