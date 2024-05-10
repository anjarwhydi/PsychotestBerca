using Backend.BaseController;
using Backend.Models;
using Backend.Repository.Data;
using Backend.ViewModels;
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
    //[EnableCors("AllowOrigin")]
    public class TestCategoryController : BaseController<TblTestCategory, TestCategoryRepository, int>
    {
        private readonly TestCategoryRepository testCategoryRepository;
        public TestCategoryController(TestCategoryRepository testCategoryRepository) : base(testCategoryRepository)
        {
            this.testCategoryRepository = testCategoryRepository;
        }


        [Authorize(Roles = "Super Admin")]
        [HttpPost("PostTestCategory")]
        public ActionResult InsertTestCategory(TestCategoryVM testCategoryVM)
        {
            var result = testCategoryRepository.InsertTestCategory(testCategoryVM);
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
                            message = "Failed Create!, Level already Exist!",
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

        [HttpGet("Test/{Id}"),AllowAnonymous]
        public ActionResult Get(int Id)
        {
            var getId = testCategoryRepository.Get(Id);

            if (getId != null)
            {
                return StatusCode(200,
                    new
                    {
                        status = HttpStatusCode.OK,
                        message = "Data Found!",
                        Data = getId
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

        [Authorize(Roles = "Super Admin")]
        [HttpDelete("Delete/{CatId}")]
        public ActionResult DeleteTestCategory(int CatId)
        {
            var check = testCategoryRepository.CheckParticipant(CatId);
            if (check == false)
            {
                testCategoryRepository.Delete(CatId);
                return StatusCode(201,
                   new
                   {
                       status = HttpStatusCode.OK,
                       message = "Data berhasil dihapus."
                   });
            }
            else if (check == true)
            {
                return StatusCode(400,
                   new
                   {
                       status = HttpStatusCode.BadRequest,
                       message = "Tes sedang dilamar diikuti partisipan."
                   });
            }
            else
            {
                return StatusCode(500,
                    new
                    {
                        status = HttpStatusCode.InternalServerError,
                        message = "Terjadi sebuah error."
                    });
            }
        }
    }
}
