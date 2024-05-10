using Backend.BaseController;
using Backend.Context;
using Backend.Models;
using Backend.Repository.Data;
using Backend.ViewModels;
using EmailService;
using ScoringTestService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting.Internal;
using ClosedXML.Excel;
using Irony.Parsing;
using System;
using Backend.Repository.Interface;


namespace Backend.Controllers
{
    [Authorize(Roles = "Super Admin,Admin,Audit")]
    [Route("api/[controller]")]
    [ApiController]
    //[EnableCors("AllowOrigin")]
    public class ParticipantController : BaseController<TblParticipant, ParticipantRepository, int>
    {
        private readonly ParticipantRepository participantRepository;
        private readonly AccountRepository accountRepository;
        public readonly RasPsychotestBercaContext context;
        private readonly EmailService.IEmailSender emailSender;
        private readonly IScoringTest scoringTest;
        private readonly IConfiguration configuration;
        private readonly TokenRepository tokenRepository;

        public ParticipantController(ParticipantRepository participantRepository, RasPsychotestBercaContext context, AccountRepository accountRepository, IConfiguration configuration, EmailService.IEmailSender emailSender, IScoringTest scoringTest, IHttpClientFactory httpClientFactory, TokenRepository tokenRepository) : base(participantRepository)
        {
            this.participantRepository = participantRepository;
            this.accountRepository = accountRepository;
            this.context = context;
            this.configuration = configuration;
            this.emailSender = emailSender;
            this.scoringTest = scoringTest;
            this.tokenRepository = tokenRepository;
        }

        [Authorize(Roles = "Super Admin,Admin")]
        [HttpPost("Insert")]
        public ActionResult Insert(ParticipantVM participantVM)
        {
            var emailchecker = participantRepository.checkEmail(participantVM.Email);
            if (emailchecker == true)
            {
                return StatusCode(400, new { status = HttpStatusCode.NotFound, message = $"Email Sudah Terdaftar", Data = 0 });
            }
            var acc = new TblAccount
            {
                Name = participantVM.Name,
                Email = participantVM.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(participantVM.Password),
                IsDeleted = false
            };
            var role = context.TblRoles.SingleOrDefault(r => r.RoleId == participantVM.RoleId);
            if (role == null)
            {
                return StatusCode(400, new { status = HttpStatusCode.NotFound, message = $"Role not found" });
            }
            acc.Role = role;
            try
            {

                    var insertAccount = accountRepository.Insert(acc);
                    if (insertAccount == 1)
                    {
                        var par = new TblParticipant
                        {
                            PhoneNumber = participantVM.Phone,
                            ExpiredDatetime = participantVM.ExpiredDatetime,
                            AccountId = acc.AccountId,
                            TestCategoryId = participantVM.Test_Category
                        };
                        var appliedPosition = context.TblAppliedPositions.SingleOrDefault(r => r.AppliedPositionId == participantVM.Applied_Position);
                        if (appliedPosition == null)
                        {
                            return StatusCode(400, new { status = HttpStatusCode.NotFound, message = $"Applied position not found" });
                        }
                        par.AppliedPosition = appliedPosition;

                        var insert = participantRepository.Insert(par);
                        if (insert == 1)
                        {

                            var issuer = configuration.GetValue<string>("Jwt:Issuer");
                            var audience = configuration.GetValue<string>("Jwt:Audience");
                            var key = Encoding.UTF8.GetBytes(configuration.GetValue<string>("Jwt:Key"));
                            var tokenDescriptor = new SecurityTokenDescriptor
                            {
                                Subject = new ClaimsIdentity(new[]
                                {
                                    new Claim("Id", acc.AccountId.ToString()),
                                    new Claim(JwtRegisteredClaimNames.Email, participantVM.Email),
                                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                                    new Claim(JwtRegisteredClaimNames.Name, acc.Name),
                                    new Claim("RoleId", role.RoleId.ToString())
                                }),
                                Expires = participantVM.ExpiredDatetime,
                                Issuer = issuer,
                                Audience = audience,
                                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha512Signature)
                            };
                            var tokenHandler = new JwtSecurityTokenHandler();
                            var token = tokenHandler.CreateToken(tokenDescriptor);
                            var jwtToken = tokenHandler.WriteToken(token);
                            //var stringToken = tokenHandler.WriteToken(token);

                            var newLink = Guid.NewGuid().ToString();
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

                            var accessLink = configuration["ApiSettings:ApiUrlFE"] + "/auth/autoLogin/" + newLink;


                        /*var message = new Message(new string[] { participantVM.Email }, "Undangan Psikotes", participantVM.Name + ',' + accessLink);
                        var sen = emailSender.SendEmail(message);
                        if (sen == "1")*/
                        var message = new SendEmailDBMail
                        {
                            Name = participantVM.Name,
                            To = participantVM.Email,
                            Subject = " Undangan Psikotes Online",
                            Link = accessLink,
                        };
                        var sen = participantRepository.SendEmailParticipant(message);
                        if(sen != null)
                        {
                                return StatusCode(202, new { status = HttpStatusCode.OK, message = $" Data berhasil DIubah", Data = "" });
                            }
                            else
                            {
                                return StatusCode(500, new { status = HttpStatusCode.InternalServerError, message = $"WebMail atau server Sedang Bermasalah, Harap hubungi Tim IT" });
                            }
                        }
                    }
                    return StatusCode(400, new { status = HttpStatusCode.NotFound, message = $"Data  Gagal di Input", Data = 0 });
                }
            catch (Exception ex)
            {
                return StatusCode(500, new { status = HttpStatusCode.InternalServerError, message = $"An error occurred: {ex.Message}" });
            }
        }

        [Authorize(Roles = "Super Admin,Admin")]
        [HttpPut("Update")]
        public ActionResult Update(UpdateParticipantVM participantVM)
        {
            var checkEmail = accountRepository.Get(participantVM.Account_Id);
            if (checkEmail.Email != participantVM.Email)
            {

                var emailchecker = participantRepository.checkEmail(participantVM.Email);
                if (emailchecker == true)
                {
                    return StatusCode(400, new { status = HttpStatusCode.NotFound, message = $"Email Sudah Terdaftar", Data = 0 });
                }

            }
            var acc = new TblAccount
            {
                AccountId = participantVM.Account_Id,
                Name = participantVM.Name,
                Email = participantVM.Email,
            };

            var par = new TblParticipant
            {
                ParticipantId = participantVM.ParticipantId,
                PhoneNumber = participantVM.Phone,
                ExpiredDatetime = participantVM.ExpiredDatetime,
                TestCategoryId = participantVM.Test_Category,
                AccountId = acc.AccountId,
                Nik = participantVM.Nik
            };
            var appliedPosition = context.TblAppliedPositions.SingleOrDefault(r => r.AppliedPositionId == participantVM.Applied_Position);
            if (appliedPosition == null)
            {
                return StatusCode(400, new { status = HttpStatusCode.NotFound, message = $"Applied position not found" });
            }
            par.AppliedPosition = appliedPosition;

            var updAcc = accountRepository.UpdateParAccount(acc);
            var updPar = participantRepository.UpdatePar(par);
            var response = new
            {
                updAcc,
                updPar
            };

            if (updAcc == 0 || updPar == 0)
            {
                return StatusCode(404, new { status = HttpStatusCode.NotFound, message = $"Gagal Diupdate" });
            }
            return StatusCode(202, new { status = HttpStatusCode.OK, message = $" Data berhasil DIubah", Data = response });
        }


        [HttpGet("GetPar"), AllowAnonymous]
        public ActionResult GetParticipant()
        {
            var get = participantRepository.getParticipant();

            var responseData = get.Select(participant => new
            {
                participantId = participant.ParticipantId,
                phoneNumber = participant.PhoneNumber,
                expiredDateTime = participant.ExpiredDatetime,
                account = new
                {
                    accountId = participant.Account.AccountId,
                    name = participant.Account.Name,
                    email = participant.Account.Email
                },
                appliedPosition = new
                {
                    appliedPosition = participant.AppliedPosition.AppliedPosition,
                    appliedPositionId = participant.AppliedPosition.AppliedPositionId
                },
                testCategory = new
                {
                    testCategoryId = participant.TestCategory.TestCategoryId,
                    levelCategory = participant.TestCategory.LevelCategory,
                    testKit = participant.TestCategory.TestKit
                },
                tblParticipantAnswers = participant.TblParticipantAnswers.Select(answer => new
                {
                    participantAnswerId = answer.ParticipantAnswareId,
                    participantId = answer.ParticipantId,
                    finalScore = answer.FinalScore,
                    status = answer.Status,
                    testId = answer.TestId
                }).ToList()
            }).ToList();

            if (get.Count() < 0)
            {
                return StatusCode(400, new { status = HttpStatusCode.NotFound, message = $"Data  Gagal di ambil", Data = 0 });

            }
            return StatusCode(202, new { status = HttpStatusCode.OK, message = $"Data  Berhasil di ambil", Data = responseData });

        }

        [HttpGet("statusDashboard"), AllowAnonymous]
        public IActionResult statusDashboard()
        {
            var get = participantRepository.GetParticipantsWithStatusAndTestCategory();
            if (get.Count() < 0)
            {
                return StatusCode(400, new { status = HttpStatusCode.NotFound, message = $"Data  Gagal di ambil", Data = 0 });

            }
            return StatusCode(202, new { status = HttpStatusCode.OK, message = $"Data  Berhasil di ambil", Data = get });

        }

        [Authorize(Roles = "Super Admin,Admin")]
        [HttpGet("GetParById/{id}")]
        public ActionResult GetParticipantById(int id)
        {
            var get = participantRepository.getParticipantById(id);
            if (get.Count() < 0)
            {
                return StatusCode(400, new { status = HttpStatusCode.NotFound, message = $"Data  Gagal di ambil", Data = 0 });

            }
            return StatusCode(202, new { status = HttpStatusCode.OK, message = $"Data  Berhasil di ambil", Data = get });

        }

        [HttpGet("GetParByAccountId/{id}"), AllowAnonymous]
        public ActionResult GetParticipantByAccountId(int id)
        {
            var get = participantRepository.getParticipantByAccountId(id);
            if (get.Count() < 0)
            {
                return StatusCode(400, new { status = HttpStatusCode.NotFound, message = $"Data  Gagal di ambil", Data = 0 });

            }
            return StatusCode(202, new { status = HttpStatusCode.OK, message = $"Data  Berhasil di ambil", Data = get });

        }

        [HttpPut("ResendEmail")]
        public ActionResult ResendEmail(UpdateParticipantVM participantVM)
        {
            var acc = new TblAccount
            {
                AccountId = participantVM.Account_Id,
                Name = participantVM.Name,
                Email = participantVM.Email,
            };

            var par = new TblParticipant
            {
                ParticipantId = participantVM.ParticipantId,
                PhoneNumber = participantVM.Phone,
                ExpiredDatetime = participantVM.ExpiredDatetime,
                TestCategoryId = participantVM.Test_Category,
                AccountId = acc.AccountId
            };
            var appliedPosition = context.TblAppliedPositions.SingleOrDefault(r => r.AppliedPositionId == participantVM.Applied_Position);
            if (appliedPosition == null)
            {
                return StatusCode(400, new { status = HttpStatusCode.NotFound, message = $"Applied position not found" });
            }
            par.AppliedPosition = appliedPosition;
            try
            {
               
                    var updAcc = accountRepository.UpdateParAccount(acc);
                    var updPar = participantRepository.UpdatePar(par);
                    var response = new
                    {
                        updAcc,
                        updPar
                    };

                    if (updAcc == 0 || updPar == 0)
                    {
                        return StatusCode(404, new { status = HttpStatusCode.NotFound, message = $"Gagal Diupdate" });
                    }


                    var issuer = configuration.GetValue<string>("Jwt:Issuer");
                    var audience = configuration.GetValue<string>("Jwt:Audience");
                    var key = Encoding.UTF8.GetBytes(configuration.GetValue<string>("Jwt:Key"));
                    var tokenDescriptor = new SecurityTokenDescriptor
                    {
                        Subject = new ClaimsIdentity(new[]
                        {

                    new Claim("Id", acc.AccountId.ToString()),
                    new Claim(JwtRegisteredClaimNames.Email, acc.Email),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                 }),

                        Expires = participantVM.ExpiredDatetime,
                        Issuer = issuer,
                        Audience = audience,
                        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha512Signature)
                    };
                    var tokenHandler = new JwtSecurityTokenHandler();
                    var token = tokenHandler.CreateToken(tokenDescriptor);
                    var jwtToken = tokenHandler.WriteToken(token);
                    //var stringToken = tokenHandler.WriteToken(token);
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
                    var accessLink = configuration["ApiSettings:ApiUrlFE"] + "/auth/autoLogin/" + newLink;


                var message = new SendEmailDBMail
                {
                    Name = participantVM.Name,
                    To = participantVM.Email,
                    Subject = " Undangan Psikotes Online",
                    Link = accessLink,
                };
                var sen = participantRepository.SendEmailParticipant(message);
                if (sen != null)
                    {

                        return StatusCode(202, new { status = HttpStatusCode.OK, message = $" Data has been added", Data = "" });

                    }
                    else
                    {
                        // Handle the case where email sending failed
                        return StatusCode(500, new { status = HttpStatusCode.InternalServerError, message = $" {sen}" });
                    }
                
                }
            catch (Exception ex)
            {
                return StatusCode(500, new { status = HttpStatusCode.InternalServerError, message = $"An error occurred: {ex.Message}" });
            }
        }

        [HttpPost("GetResultTestMSDT"), AllowAnonymous]
        public virtual ActionResult GetTestResultMSDT(string[] jawaban)
        {
            string fileName = configuration["FileLocationForScoringTest:formula"];
            if (string.IsNullOrEmpty(fileName))
            {
                return StatusCode(404, new
                {
                    status = HttpStatusCode.NotFound,
                    message = "File Not Found!",
                    Data = 0
                });
            }

            var get = scoringTest.ScoringMSDT(jawaban, fileName);
            if (get == "0")
            {
                return StatusCode(404,
                    new
                    {
                        status = HttpStatusCode.NotFound,
                        message = "Result Not Found!",
                        Data = get
                    });
            }
            if (get.Length > 0)
            {
                return StatusCode(200,
                    new
                    {
                        status = HttpStatusCode.OK,
                        message = "Result Found!",
                        Data = get
                    });

            }
            return StatusCode(500,
                    new
                    {
                        status = HttpStatusCode.InternalServerError,
                        message = "Result Found!",
                        Data = ""
                    });
        }

        [HttpPost("GetResultTestPAPI"), AllowAnonymous]
        public virtual ActionResult GetTestResultPAPI(string[] jawaban)
        {
            string fileName = configuration["FileLocationForScoringTest:formula"];
            if (string.IsNullOrEmpty(fileName))
            {
                return StatusCode(404, new
                {
                    status = HttpStatusCode.NotFound,
                    message = "File Not Found!",
                    Data = 0
                });
            }

            var get = scoringTest.ScoringPAPIKOSTICK(jawaban, fileName);
            if (get == "0")
            {
                return StatusCode(404,
                    new
                    {
                        status = HttpStatusCode.NotFound,
                        message = "Result Not Found!",
                        Data = get
                    });
            }
            if (get.Length > 0)
            {
                return StatusCode(200,
                    new
                    {
                        status = HttpStatusCode.OK,
                        message = "Result Found!",
                        Data = get
                    });

            }
            return StatusCode(500,
                    new
                    {
                        status = HttpStatusCode.InternalServerError,
                        message = "Result Found!",
                        Data = ""
                    });
        }

        [HttpPost("GetResultTestRMIB"), AllowAnonymous]
        public virtual ActionResult GetTestResultRMIB(string[] jawaban)
        {
            string fileName = configuration["FileLocationForScoringTest:formula"];
            if (string.IsNullOrEmpty(fileName))
            {
                return StatusCode(404, new
                {
                    status = HttpStatusCode.NotFound,
                    message = "File Not Found!",
                    Data = 0
                });
            }

            var get = scoringTest.ScoringRMIB(jawaban, fileName);
            if (get == "0")
            {
                return StatusCode(404,
                    new
                    {
                        status = HttpStatusCode.NotFound,
                        message = "Result Not Found!",
                        Data = get
                    });
            }
            if (get.Length > 0)
            {
                return StatusCode(200,
                    new
                    {
                        status = HttpStatusCode.OK,
                        message = "Result Found!",
                        Data = get
                    });

            }
            return StatusCode(500,
                    new
                    {
                        status = HttpStatusCode.InternalServerError,
                        message = "Result Found!",
                        Data = ""
                    });
        }

        [HttpPost("GetResultTestIST"), AllowAnonymous]
        public virtual ActionResult GetTestResultIST(string[] jawaban)
        {
            string fileName = configuration["FileLocationForScoringTest:formula"];
            if (string.IsNullOrEmpty(fileName))
            {
                return StatusCode(404, new
                {
                    status = HttpStatusCode.NotFound,
                    message = "File Not Found!",
                    Data = 0
                });
            }

            var get = scoringTest.ScoringIST(jawaban, fileName);
            if (get == "0")
            {
                return StatusCode(404,
                    new
                    {
                        status = HttpStatusCode.NotFound,
                        message = "Result Not Found!",
                        Data = 0
                    });
            }
            return StatusCode(200,
                    new
                    {
                        status = HttpStatusCode.OK,
                        message = "Result Found!",
                        Data = get
                    });
        }

        [HttpPost("GetResultTestDISC"), AllowAnonymous]
        public virtual ActionResult GetTestResultDISC(string[] jawaban)
        {
            int val = 0;
            for (int a = 0; a < jawaban.Length; a++)
            {
                var ans = jawaban[a].Split(',');
                for (int b = 0; b < ans.Length; b++)
                {
                    if (ans[b] == "0" || ans[b] == "")
                    {
                        val++;
                    }
                }
            }
            string fileName = configuration["FileLocationForScoringTest:DISC"];
            if (string.IsNullOrEmpty(fileName))
            {
                return StatusCode(404, new
                {
                    status = HttpStatusCode.NotFound,
                    message = "File Not Found!",
                    Data = 0
                });
            }

            var get = scoringTest.ScoringDISC(jawaban, fileName);
            if (get == "0")
            {
                return StatusCode(404,
                    new
                    {
                        status = HttpStatusCode.NotFound,
                        message = "Result Not Found!",
                        Data = get
                    });
            }
            return StatusCode(200,
                    new
                    {
                        status = HttpStatusCode.OK,
                        message = "Result Found!",
                        Data = get
                    });

        }

        [HttpPost("UpdateNIK"), AllowAnonymous]
        public ActionResult UpdateNIK(int id, string NIK)
        {
            int result = participantRepository.UpdateNIK(id, NIK);

            if (result == -2)
            {
                return StatusCode(400,
                    new
                    {
                        status = HttpStatusCode.BadRequest,
                        message = "NIK Anda Sudah Terdaftar"
                    });
            }
            else if (result != -1)
            {
                return StatusCode(200,
                    new
                    {
                        status = HttpStatusCode.OK,
                        message = "Success POST NIK!",
                        Data = result
                    });
            }
            else
            {
                return StatusCode(404,
                    new
                    {
                        status = HttpStatusCode.NotFound,
                        message = "Failed!, NIK & Participant Not Match! OR Participant Already Have a NIK!",
                        Data = 0
                    });
            }
        }

        [HttpGet("GetNIK"), AllowAnonymous]
        public IActionResult GetNIKById(int id)
        {
            var result = participantRepository.GetNIKById(id);

            if (result != null)
            {
                return StatusCode(200,
                     new
                     {
                         status = HttpStatusCode.OK,
                         message = "Data Found!",
                         Data = 1
                     });
            }
            else
            {
                return StatusCode(404,
                   new
                   {
                       status = HttpStatusCode.NotFound,
                       message = $"NIK for Id {id} not found or has NULL value.",
                       Data = 0
                   });
            }
        }

        [Authorize(Roles = "Super Admin,Admin")]
        [HttpPost("convertIST")]
        public IActionResult convertIST(int[] score, int age)
        {
            if (score.Length != 9)
            {
                return StatusCode(404,
                    new
                    {
                        status = HttpStatusCode.NotFound,
                        message = $"score not equal 9",
                        Data = 0
                    });
            }
            string fileName = configuration["FileLocationForScoringTest:convertIST"];
            if (string.IsNullOrEmpty(fileName))
            {
                return StatusCode(404, new
                {
                    status = HttpStatusCode.NotFound,
                    message = "File Not Found!",
                    Data = 0
                });
            }
            var get = scoringTest.ConvertIST(score, age, fileName);
            if (get == "0" || get.Count() < 0)
            {
                return StatusCode(404,
                    new
                    {
                        status = HttpStatusCode.NotFound,
                        message = "Result Not Found!",
                        Data = 0
                    });
            }
            return StatusCode(200,
                    new
                    {
                        status = HttpStatusCode.OK,
                        message = "Result Found!",
                        Data = get
                    });
        }

        [Authorize(Roles = "Super Admin,Admin")]
        [HttpPost("downloadPsikogram")]
        [Consumes("application/json")]
        public IActionResult downloadPsikogram(string[] data)
        {

            string fileName = configuration["Psikogram:mapping"];
            /*
              
             
            string fileName = configuration["FileLocationForScoringTest:Psikogram"];
             */
            if (string.IsNullOrEmpty(fileName))
            {
                return StatusCode(404, new
                {
                    status = HttpStatusCode.NotFound,
                    message = "File Not Found!",
                    Data = 0
                });
            }

            string dir = Directory.GetCurrentDirectory();
            string filePath = Path.GetFullPath(Path.Combine(dir, "..", "ScoringTestService", "psikogram", fileName));

            using (var workbook = new XLWorkbook(filePath))
            {
                var worksheetIST = workbook.Worksheet("IST");
                var worksheetPAPI = workbook.Worksheet("PAPI");
                var worksheetDISC = workbook.Worksheet("DISC");
                var worksheetRMIB = workbook.Worksheet("RMIB");
                var worksheetMSDT = workbook.Worksheet("MSDT");

                worksheetIST.Cell("L2").Value = data[5].ToString();
                worksheetIST.Cell("M2").Value = data[6].ToString();
                int cellStart = 1;
                int rowStart = 2;
                if (data[0] != "0")
                {
                    var istData = data[0].Split(',');
                    var istList = istData.ToList();

                    for (int a = 0; a < istList.Count; a++)
                    {
                        if (a < 9)
                        {
                            worksheetIST.Cell(rowStart, cellStart).Value = Convert.ToInt32(istList[a]);
                        }
                        else
                        {
                            worksheetIST.Cell(rowStart, cellStart).Value = istList[a];
                        }
                        cellStart++;
                    }

                }

                cellStart = 1;
                rowStart = 2;

                if (data[1] != "0")
                {
                    var papiData = data[1].Split(',');
                    var papiList = papiData.ToList();
                    for (int a = 0; a < papiList.Count; a++)
                    {
                        worksheetPAPI.Cell(rowStart, cellStart).Value = Convert.ToInt32(papiList[a]);
                        cellStart++;
                    }

                }

                cellStart = 1;
                rowStart = 2;

                if (data[2] != "0")
                {
                    var discData = data[2].Split(',');
                    var discList = discData.ToList();
                    for (int a = 0; a < discList.Count; a++)
                    {
                        var val = discList[a];
                        if (a > 0)
                        {
                            var tx = "";
                            for (int i = a; i < discList.Count; i++)
                            {
                                tx += discList[i];
                            }
                            val = tx;
                            a += 100;
                        }
                        worksheetDISC.Cell(rowStart, cellStart).Value = val;
                        cellStart++;
                    }

                }

                cellStart = 1;
                rowStart = 2;

                if (data[3] != "0")
                {
                    var rmibData = data[3].Split(',');
                    var rmibList = rmibData.ToList();
                    for (int a = 0; a < rmibList.Count; a++)
                    {
                        if (a > 2)
                        {
                            rmibList[a] = rmibList[a].Replace(";", ",");
                        }
                        var val = rmibList[a];
                        worksheetRMIB.Cell(rowStart, cellStart).Value = val;
                        cellStart++;
                    }

                }

                cellStart = 1;
                rowStart = 2;
                if (data[4] != "0")
                {
                    var msdtData = data[4].Split(',');
                    var msdtList = msdtData.ToList();
                    for (int a = 0; a < msdtList.Count; a++)
                    {
                        var val = msdtList[a].ToUpper();

                        if (a > 0)
                        {
                            var tx = "";
                            for (int i = a; i < msdtList.Count; i++)
                            {
                                tx += msdtList[i];
                            }
                            val = tx;
                            a += 100;
                        }
                        worksheetMSDT.Cell(rowStart, cellStart).Value = val.Replace("\n", Environment.NewLine);

                        cellStart++;
                    }
                }

                
                using (MemoryStream memoryStream = new MemoryStream())
                {
                    workbook.SaveAs(memoryStream);
                    return File(memoryStream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "result.xlsm");
                }
            }

        }

        


        public static string RandomString()
        {
            Random random = new Random();
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
            return new string(Enumerable.Repeat(chars, 15)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        [HttpGet("countParticipant"),AllowAnonymous]
        public string countParticipant()
        {
            var get = participantRepository.CountParticipant();
            return get.ToString();
        }

        //Get Par dengan menggunaka server-side
        [HttpPost("GetParByPaging")]
        public ActionResult GetParticipantList()
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

                // Materialize data sebelum operasi pencarian
                var data = participantRepository.getParticipant().AsQueryable(); // Materialize data dari database ke dalam memori

                // Filter data di dalam memori
                if (!string.IsNullOrEmpty(searchValue))
                {
                    if(searchValue.ToLower() == "complete")
                    {
                        data = data.Where(x => (x.TblParticipantAnswers.All(answer => answer.Status == true) && !x.TblParticipantAnswers.All(answer => answer.Status == null)));
                    }
                    else if (searchValue.ToLower() == "on progress")
                    {
                        data = data.Where(x => (x.ExpiredDatetime > DateTime.Now &&
                                               (x.TblParticipantAnswers.All(answer => answer.Status == true) == false)));
                    }
                    else if(searchValue.ToLower() == "incomplete")
                    {
                        data = data.Where(x => (x.ExpiredDatetime < DateTime.Now &&
                                               (x.TblParticipantAnswers.All(answer => answer.Status == true) == false)));
                    }
                    else
                    {
                        data = data.Where(x =>
                        x.Account.Name.ToLower().Contains(searchValue.ToLower()) ||
                        x.Account.Email.ToLower().Contains(searchValue.ToLower()) ||
                        x.PhoneNumber.ToLower().Contains(searchValue.ToLower()) ||
                        x.Nik.ToLower().Contains(searchValue.ToLower()) ||
                        x.AppliedPosition.AppliedPosition.ToLower().Contains(searchValue.ToLower()) ||
                        x.TestCategory.LevelCategory.ToLower().Contains(searchValue.ToLower()));
                    }
                }

                // Hitung total jumlah data sebelum dan setelah filter
                totalRecord = data.Count();
                filterRecord = totalRecord;

                // Sort data
                if (!string.IsNullOrEmpty(sortColumn) && !string.IsNullOrEmpty(sortColumnDirection))
                {
                    data = data.OrderBy(s => sortColumn + " " + sortColumnDirection);
                }

                // Pagination
                var empList = data.Skip(skip).Take(pageSize).ToList();
                var returnObj = new
                {
                    draw = draw,
                    recordsTotal = totalRecord,
                    recordsFiltered = filterRecord,
                    data = empList
                };

                return Ok(returnObj);
            }
            catch (Exception ex)
            {
                return Ok(ex.Message);
            }
        }


        [HttpGet("expiredTimeToday"),AllowAnonymous]
        public IActionResult expiredTimeToday()
        {
            try
            {
                var data = participantRepository.DataReminder();

                if (data.Count() > 0)
                {
                    return StatusCode(200,
                        new
                        {
                            status = HttpStatusCode.OK,
                            message = $"Result Found!",
                            Data = data
                        });
                }
                return StatusCode(400,
                        new
                        {
                            status = HttpStatusCode.NotFound,
                            message = $"Data Not Found!",
                            Data = data.Count()
                        });
            }
            catch (Exception ex)
            {
                return StatusCode(500,
                        new
                        {
                            status = HttpStatusCode.InternalServerError,
                            message = $"Server Error!: {ex.Message}",
                            Data = 0
                        });
            }

        }

    }
}

