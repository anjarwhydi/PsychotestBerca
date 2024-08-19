using Backend.BaseController;
using Backend.Models;
using Backend.Repository.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Backend.ViewModels;
using System.Net;
using Backend.Repository.Interface;
using DocumentFormat.OpenXml.Drawing.Charts;

namespace Backend.Controllers
{
    [Authorize(Roles = "Super Admin,Admin,Audit,Participant")]
    [Route("api/[controller]")]
    [ApiController]
    public class ParticipantAnswerController : BaseController<TblParticipantAnswer, ParticipantAnswerRepository, int>
    {
        private readonly ParticipantAnswerRepository participantAnswerRepository;
        public ParticipantAnswerController(ParticipantAnswerRepository participantAnswerRepository) : base(participantAnswerRepository)
        {
            this.participantAnswerRepository = participantAnswerRepository;
        }

        //check duplikat
        [HttpPost("PostParticipantAnswer")]
        public ActionResult InsertParticipantAnswer(ParticipantAnswerVM participantanswerVM)
        {
            var result = participantAnswerRepository.InsertParticipantAnswer(participantanswerVM);

            if (result > 0)
            {
                return StatusCode(200, new
                {
                    status = HttpStatusCode.OK,
                    message = "Successful Added!",
                    Data = result
                });
            }
            else if (result == -1)
            {
                return StatusCode(400, new
                {
                    status = HttpStatusCode.BadRequest,
                    message = "Duplicate TestId for ParticipantId!",
                    Data = result
                });
            }
            else
            {
                return StatusCode(404, new
                {
                    status = HttpStatusCode.NotFound,
                    message = "Data Not Found!",
                    Data = result
                });
            }
        }

        [HttpGet("GetAnswareByTest"),AllowAnonymous]
        public ActionResult GetAnswareByTest(int participantId, int testId)
        {
            var get = participantAnswerRepository.GetAnswareByTest(participantId, testId);
            if (get.Count() > 0)
            {
                return StatusCode(200, new { status = HttpStatusCode.OK, message = get.Count() + " Data Ditemukan", Data = get });
            }
            else
            {
                return StatusCode(404, new { status = HttpStatusCode.NotFound, message = get.Count() + " Data Tidak Ditemukan", Data = get });
            }
        }

        //zahra 29-08-2023
        [Authorize(Roles = "Super Admin,Admin")]

        [HttpGet("GetAnswareByParticipantId")]
        public ActionResult GetAnswareByParticipantId(int participantId)
        {
            var get = participantAnswerRepository.GetAnswareByParticipantId(participantId);
            if (get.Count() > 0)
            {
                return StatusCode(200, new { status = HttpStatusCode.OK, message = get.Count() + " Data Ditemukan", Data = get });
            }
            else
            {
                return StatusCode(404, new { status = HttpStatusCode.NotFound, message = get.Count() + " Data Ditemukan", Data = get });
            }
        }

        [HttpGet("GetListByParticipantId"),AllowAnonymous]
        public ActionResult GetByParticipantId(int participantId)
        {
            try
            {
                var get = participantAnswerRepository.GetByParticipantId(participantId);
                if (get.Count() > 0)
                {
                    return StatusCode(200, new { status = HttpStatusCode.OK, message = get.Count() + " Data Ditemukan", Data = get });
                }
                else
                {
                    return StatusCode(404, new { status = HttpStatusCode.NotFound, message = get.Count() + " Data Tidak Ditemukan", Data = get });
                }
            }
            catch (Exception ex)
            {
                // Jika terjadi error, kembalikan status 500 Internal Server Error
                return StatusCode(500,
                    new
                    {
                        status = HttpStatusCode.InternalServerError,
                        message = "Internal Server Error",
                        error = ex.Message
                    });
            }
        }


        [HttpPut("StoredAnswer"),AllowAnonymous]
        public ActionResult SavedAnswer(SavedAnswerVM savedAnswerVM)
        {
            var result = participantAnswerRepository.StoredAnswer(savedAnswerVM);

            if (result > 0)
            {
                return StatusCode(200, new
                {
                    status = HttpStatusCode.OK,
                    message = "Successful!",
                    Data = result
                });
            }

           
                return StatusCode(404, new
                {
                    status = HttpStatusCode.NotFound,
                    message = "Data Not Found!",
                    Data = result
                });
        }

    [Authorize(Roles = "Super Admin,Admin")]
        [HttpGet("GetParticipantAnswerById/{id}")]
        public ActionResult GetParticipantAnswerById(int id)
        {
            var getId = participantAnswerRepository.GetParticipantAnswerById(id);

            if (getId != null)
            {
                //responseData untuk apa saja yang dikeluarkan pada response json-nya
                var responseData = new
                {
                    participantAnswareId = getId.ParticipantAnswareId,
                    participantId = getId.ParticipantId,
                    answer = getId.Answer,
                    finalScore = getId.FinalScore,
                    capturePicture = getId.CapturePicture,
                    testId = getId.TestId,
                    participant = new
                    {
                        phoneNumber = getId.Participant.PhoneNumber,
                        nik = getId.Participant.Nik,
                        account = new
                        {
                            name = getId.Participant.Account.Name,
                            email = getId.Participant.Account.Email
                        }
                    }
                };

                return StatusCode(200,
                    new
                    {
                        status = HttpStatusCode.OK,
                        message = "Data Found!",
                        Data = responseData
                    });
            }
            else
            {
                return StatusCode(404,
                new
                {
                    status = HttpStatusCode.NotFound,
                    message = "Data Not Found!",
                    Data = getId
                });
            }
        }

    [Authorize(Roles = "Super Admin,Admin")]
        [HttpDelete("Del/{participantId}")]
        public ActionResult DeleteParticipantAns(int participantId)
        {
            var delete = participantAnswerRepository.DeleteParticipantAns(participantId);
            if (delete >= 1)
            {
                return StatusCode(200,
                    new
                    {
                        status = HttpStatusCode.OK,
                        message = "Success Remove",
                        Data = delete
                    });
            }
            else if (delete == 0)
            {
                return StatusCode(404,
                    new
                    {
                        status = HttpStatusCode.NotFound,
                        message = "Id " + participantId + "Not Found!",
                        Data = delete
                    });
            }
            else
            {
                return StatusCode(400,
                    new
                    {
                        status = HttpStatusCode.BadRequest,
                        message = "Bad Request!",
                        Data = delete
                    });
            }
        }

    [Authorize(Roles = "Super Admin,Admin,Audit")]
        [HttpGet("GetCheckViolationResult/{participantId}")]
        public IActionResult GetCheckViolationResult(int participantId)
        {
            try
            {
                var selectedData = participantAnswerRepository.GetCheckViolationResult(participantId);
                return StatusCode(200,
                    new
                    {
                        status = HttpStatusCode.OK,
                        message = selectedData.Count() + " Data found!",
                        Data = selectedData
                    });
            }
            catch (Exception ex)
            {
                if (ex.Message == "Data not found")
                {
                   return StatusCode(201,
                   new
                   {
                       status = HttpStatusCode.Created,
                       message = "Id " + participantId + " Not Found!"
                   });
                }

                return StatusCode(500,
                   new
                   {
                       status = HttpStatusCode.InternalServerError,
                       message = "Internal server error"
                   });
            }
        }

        [HttpPut("UpdateCreateDatePerTest"), AllowAnonymous]
        public IActionResult UpdateCreateDatePerTest(CreateDateParticipantAnswerVM objEntity)
        {
            var updatedEntities = participantAnswerRepository.UpdateCreateDatePerTest(objEntity);
            if (updatedEntities != null && updatedEntities.Any())
            {
                return Ok("Success update CreateDate!");
            }
            else
            {
                return NotFound("No entities were updated.");
            }
        }

        [HttpGet("GetCreateDateByParticipantAnswerId"), AllowAnonymous]
        public async Task<IActionResult> GetCreateDateByParticipantAnswerId(int participantAnswerId)
        {
            var createDate = await participantAnswerRepository.GetCreateDateByParticipantAnswerIdAsync(participantAnswerId);

            if (createDate != null)
            {
                return Ok(createDate);
            }
            else
            {
                return NotFound();
            }
        }

        [HttpGet("GetAnswareByParticipantNik")]
        public ActionResult GetAnswareByParticipantNik(string participantNik)
        {
            var get = participantAnswerRepository.GetAnswareByParticipantNik(participantNik);
            if (get.Count() > 0)
            {
                return StatusCode(200, new { status = HttpStatusCode.OK, message = get.Count() + " Data Ditemukan", Data = get });
            }
            else
            {
                return StatusCode(404, new { status = HttpStatusCode.NotFound, message = get.Count() + " Data Ditemukan", Data = get });
            }
        }
    }

}
