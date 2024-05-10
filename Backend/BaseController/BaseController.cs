using Backend.Repository.Interface;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Backend.BaseController
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaseController<Entity, Repository, Key> : ControllerBase
        where Entity : class
        where Repository : IRepository<Entity, Key>
    {
        private readonly Repository repository;
        public BaseController(Repository repository)
        {
            this.repository = repository;
        }

        [HttpGet]
        public virtual ActionResult Get()
        {
            var get = repository.Get();

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

        [HttpGet("{key}")]
        public ActionResult Get(Key key)
        {
            var getId = repository.Get(key);

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

        [HttpPost]
        public virtual ActionResult Insert(Entity entity)
        {
            var insert = repository.Insert(entity);
            if (insert >= 1)
            {
                return StatusCode(201,
                    new
                    {
                        status = HttpStatusCode.Created,
                        message = "Success Create",
                        Data = insert
                    });
            }
            else
            {
                return StatusCode(400,
                    new
                    {
                        status = HttpStatusCode.BadRequest,
                        message = "Bad Request!",
                        Data = insert
                    });
            }
        }

        [HttpPut]
        public ActionResult Update(Entity entity)
        {
            var update = repository.Update(entity);
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

        [HttpDelete("{key}")]
        public ActionResult Delete(Key key)
        {
            var delete = repository.Delete(key);
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
                        message = "Id " + key + "Not Found!", 
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
    }
}


