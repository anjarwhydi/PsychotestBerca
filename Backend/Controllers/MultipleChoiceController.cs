using Backend.BaseController;
using Backend.Models;
using Backend.Repository.Data;
using Backend.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Net;

namespace Backend.Controllers
{
    [Authorize(Roles = "Super Admin,Admin,Audit")]
    [Route("api/[controller]")]
    [ApiController]
    public class MultipleChoiceController : BaseController<TblMultipleChoice, MultipleChoiceRepository, int>
    {
        private readonly MultipleChoiceRepository multipleChoiceRepository;
        public MultipleChoiceController(MultipleChoiceRepository multipleChoiceRepository) : base(multipleChoiceRepository)
        {
            this.multipleChoiceRepository = multipleChoiceRepository;
        }

        [HttpGet("GetChoiceByQuestion")]
        public ActionResult GetChoiceByQuestion(int id)
        {
            var get = multipleChoiceRepository.GetChoiceByQuestion(id);
            if (get.Count() > 0)
            {
                return StatusCode(200, new { status = HttpStatusCode.OK, message = get.Count() + " Data Ditemukan", Data = get });
            }
            else
            {
                return StatusCode(404, new { status = HttpStatusCode.NotFound, message = get.Count() + " Data Ditemukan", Data = get });
            }
        }

        [HttpPost("PostChoice"),AllowAnonymous]
        public ActionResult PostChoice(ChoiceVM choiceVM)
        {
                var ques = new TblMultipleChoice
                {
                    MultipleChoiceDesc = choiceVM.multipleChoiceDesc,
                    QuestionId = choiceVM.questionId,
                    Score= choiceVM.score,
                };
                var insertChoice = multipleChoiceRepository.Insert(ques);
            if (insertChoice == null)
            {
                return StatusCode(400, new { status = HttpStatusCode.NotFound, message = $"Data  Gagal di Input", Data = 0 });
            }
            return StatusCode(202, new { status = HttpStatusCode.OK, message = $"Data  Berhasil di Input", Data = insertChoice });

        }

        [HttpPut("PutChoice")]
        public ActionResult PutChoice(EditChoiceVM choiceVM)
        {
            var mul = new TblMultipleChoice
            {
                MultipleChoiceId= choiceVM.multipleChoiceId,
                MultipleChoiceDesc = choiceVM.multipleChoiceDesc,
                QuestionId = choiceVM.questionId,
                Score = choiceVM.score,
            };
            var insertChoice = multipleChoiceRepository.UpdateMul(mul);
            if (insertChoice == null)
            {
                return StatusCode(400, new { status = HttpStatusCode.NotFound, message = $"Data  Gagal di Update", Data = 0 });
            }
            return StatusCode(202, new { status = HttpStatusCode.OK, message = $"Data  Berhasil di Update", Data = insertChoice });

        }


    }
}
