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
    public class TestController : BaseController<TblTest, TestRepository, int>
    {
        private readonly TestRepository testRepository;
        public TestController(TestRepository testRepository) : base(testRepository)
        {
            this.testRepository = testRepository;
        }

       
        [HttpGet("dotest/{Id}"), AllowAnonymous]
        public ActionResult Get(int Id)
        {
            var getId = testRepository.Get(Id);

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
    }
}
