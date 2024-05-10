using Backend.BaseController;
using Backend.Models;
using Backend.Repository.Data;
using Backend.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Net;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [Authorize(Roles = "Super Admin,Admin,Audit")]
    [Route("api/[controller]")]
    [ApiController]
    public class QuestionController : BaseController<TblQuestionTest, QuestionRepository, int>
    {
        private readonly QuestionRepository questionRepository;
        private readonly MultipleChoiceRepository multipleChoiceRepository;
        public QuestionController(QuestionRepository questionRepository, MultipleChoiceRepository multipleChoiceRepository) : base(questionRepository)
        {
            this.questionRepository = questionRepository;
            this.multipleChoiceRepository = multipleChoiceRepository;
        }

        [HttpGet]
        public override ActionResult Get()
        {
            var get = questionRepository.Get();
            if(get.Count() > 0)
            {
                return StatusCode(200, new { status = HttpStatusCode.OK, message = get.Count() + " Data Ditemukan", Data = get });
            }
            else
            {
                return StatusCode(404, new { status = HttpStatusCode.NotFound, message = get.Count() + " Data Ditemukan", Data = get });
            }
        }

        [HttpGet("GetQuestionByTest"), AllowAnonymous]
        public ActionResult GetQuestionByTest(int id)
        {
            var get = questionRepository.GetQuestionByTest(id);
            if (get.Count() > 0)
            {
                return StatusCode(200, new { status = HttpStatusCode.OK, message = get.Count() + " Data Ditemukan", Data = get });
            }
            else
            {
                return StatusCode(404, new { status = HttpStatusCode.NotFound, message = get.Count() + " Data Ditemukan", Data = get });
            }
        }

        [HttpGet("GetQuestionByTesto"), AllowAnonymous]
        public async Task<ActionResult> GetQuestionByTesto([FromQuery]int idTest, [FromQuery] int currentNumber, [FromQuery] int pageSize)
        {
            try
            {   
                // Panggil metode repositori dengan parameter subtest dan page number/page size
                var pagedQuestions = await questionRepository.GetQuestionByTesto(idTest, currentNumber, pageSize);

                if (pagedQuestions.Any())
                {
                    return StatusCode(200, new
                    {
                        status = HttpStatusCode.OK,
                        message = $"Data Ditemukan ({pagedQuestions.Count()} data)",
                        Data = pagedQuestions
                    });
                }
                else
                {
                    return StatusCode(404, new
                    {
                        status = HttpStatusCode.NotFound,
                        message = $"Data tidak ditemukan ({pagedQuestions.Count()} data)",
                        Data = pagedQuestions
                    });
                }
            }
            catch (Exception ex)
            {
                // Tangani kesalahan dengan mengembalikan pesan kesalahan dalam objek ActionResult
                return StatusCode(500, new
                {
                    status = HttpStatusCode.InternalServerError,
                    message = "Terjadi kesalahan dalam permintaan",
                    error = ex.Message
                });
            }
        }

        [HttpPost("PostQuestion"),AllowAnonymous]
        public ActionResult PostQuestion(QuestionVM questionVM)
        {
            var insertQuestion = 0;
            for (int i = 1; i <= questionVM.Total_Question; i++)
            {
                var ques = new TblQuestionTest
                {
                    QuestionDesc = questionVM.questionDesc,
                    TestId = questionVM.testId,
                };
                questionRepository.Insert(ques);
               /* for(int x = 1; x<=5; x++)
                {
                    var score = "0";

                    var mult = new TblMultipleChoice
                    {
                        MultipleChoiceDesc = "",
                        Score = score,
                        QuestionId = ques.QuestionId
                    };
                    multipleChoiceRepository.Insert(mult);
                }*/
                insertQuestion++;
            }
            if (insertQuestion == null)
            {
                return StatusCode(400, new { status = HttpStatusCode.NotFound, message = $"Data  Gagal di Input", Data = 0 });
            }
            return StatusCode(202, new { status = HttpStatusCode.OK, message = $"Data  Berhasil di Input", Data = insertQuestion });
            
        }
    }
}
