using Backend.BaseController;
using Backend.Models;
using Backend.Repository.Data;
using Backend.Repository.Interface;
using Backend.ViewModels;
using EmailService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using static Dapper.SqlMapper;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace Backend.Controllers
{
    [Authorize(Roles = "Super Admin,Admin,Audit")]
    [Route("api/[controller]")]
    [ApiController]
    public class ApplliedPositionController : BaseController<TblAppliedPosition, AppliedPositionRepository, int>
    {
        private readonly AppliedPositionRepository appliedPositionRepository;
        public ApplliedPositionController(AppliedPositionRepository appliedPositionRepository) : base(appliedPositionRepository)
        {
            this.appliedPositionRepository = appliedPositionRepository;
        }

        //Get beberapa row
        [HttpGet("JobTittleParticipant")]
        public ActionResult GetJobTittleParticipant()
        {

            var get = appliedPositionRepository.GetJobTittleParticipant();
            if (get != null) //bisa pake get.Count() != 0
            {
                return StatusCode(200, new { status = HttpStatusCode.OK, message = "Data Berhasil Diambil", Data = get });
            }
            else
            {
                return StatusCode(404, new { status = HttpStatusCode.NotFound, message = "Data Tidak Ditemukan", Data = get });
            }
        }

        //Get JobTitle By ServerSide
        [HttpPost("GetByPaging")]
        public ActionResult Get()
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
                var data = appliedPositionRepository.Get().AsQueryable();
                //get total count of data in table
                totalRecord = data.Count();
                // search data when search value found
                if (!string.IsNullOrEmpty(searchValue))
                {
                    data = data.Where(x => x.AppliedPosition.ToLower().Contains(searchValue.ToLower()));

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

        [Authorize(Roles = "Super Admin")]
        [HttpPost("Insert")]
        public ActionResult Insert(TblAppliedPosition appliedPosition)
        {
            var jobpositionchecker = appliedPositionRepository.checkjobposition(appliedPosition.AppliedPosition);
            if (jobpositionchecker == true)
            {
                return StatusCode(400, new { status = HttpStatusCode.NotFound, message = $"Job Position Sudah Terdaftar", Data = 0 });
            }
            var acc = new TblAppliedPosition
            {
                AppliedPosition = appliedPosition.AppliedPosition,
            };

            var insert = appliedPositionRepository.Insert(acc);

            if (insert > 0)
            {
                return StatusCode(202, new { status = HttpStatusCode.Accepted, message = $"Data Berhasil di Input", Data = insert });
            }
            else
            {
                return StatusCode(400, new { status = HttpStatusCode.BadRequest, message = $"Data Gagal di Input", Data = 0 });
            }

        }

        //tambahan update 15/08/2023
    [Authorize(Roles = "Super Admin")]

        [HttpPut("Update")]
        public ActionResult Updatejob(TblAppliedPosition appliedPosition)
        {
            var update = appliedPositionRepository.Updatejob(appliedPosition);
            if (update >= 1)
            {
                return StatusCode(201,
                   new
                   {
                       status = HttpStatusCode.Created,
                       message = "Success Update",
                       Data = update
                   });
            }
            else
            {
                return StatusCode(400,
                    new
                    {
                        status = HttpStatusCode.BadRequest,
                        message = "Failed Update!",
                        Data = update
                    });
            }

        }

    [Authorize(Roles = "Super Admin")]
        [HttpDelete("Delete/{PosId}")]
        public ActionResult DeletePos(int PosId)
        {
            var check = appliedPositionRepository.CheckParticipant(PosId);
            if (check == false)
            {
                appliedPositionRepository.Delete(PosId);
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
                       message = "Data sedang dilamar partisipan."
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