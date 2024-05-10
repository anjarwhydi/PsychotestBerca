using Backend.BaseController;
using Backend.Models;
using Backend.Repository.Data;
using Backend.Repository.Interface;
using Backend.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Backend.Controllers
{
    [Authorize(Roles = "Super Admin,Admin,Audit")]
    [Route("api/[controller]")]
    [ApiController]
    public class HistoryLogController : BaseController<TblHistoryLog, HistoryLogRepository, int>
    {
        private readonly HistoryLogRepository historyLogRepository;
        public HistoryLogController(HistoryLogRepository historyLogRepository) : base(historyLogRepository)
        {
            this.historyLogRepository = historyLogRepository;
        }

        [HttpPost("HistoryLog")]
        public ActionResult InsertHistory(HistoryLogVM historyLogVM)
        {
            var insert = historyLogRepository.InsertHistory(historyLogVM);
            switch (insert)
            {
                case 1:
                    return StatusCode(201,
                    new
                    {
                        status = HttpStatusCode.Created,
                        message = "Success Create",
                        Data = insert
                    });

                case 2:
                return StatusCode(400,
                    new
                    {
                        status = HttpStatusCode.BadRequest,
                        message = "Bad Request!",
                        Data = insert
                    });

                default:
                    return StatusCode(500,
                        new
                        {
                            status = HttpStatusCode.InternalServerError,
                            message = "Failed Create!",
                            Data = insert
                        });
            }
        }

        [HttpPost("GetByPaging")]
        public ActionResult GetHistory()
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
                var data = historyLogRepository.Get().AsQueryable();
                //get total count of data in table
                totalRecord = data.Count();
                // search data when search value found
                if (!string.IsNullOrEmpty(searchValue))
                {
                        data = data.Where(x => x.Activity.ToLower().Contains(searchValue.ToLower())
                                            || x.Account.Name.ToLower().Contains(searchValue.ToLower())
                                            || x.Timestamp.ToString().Contains(searchValue.ToLower())
                                            || x.Account.Role.RoleName.ToLower().Contains(searchValue.ToLower()));
                    
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
    
    }
}
