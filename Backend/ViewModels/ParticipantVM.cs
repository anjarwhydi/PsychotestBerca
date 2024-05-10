using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.ViewModels
{
    public class ParticipantVM
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public int RoleId { get; set; }
        public string Phone { get; set; }
        public int Applied_Position { get; set; }
        public DateTime ExpiredDatetime { get; set; }
        public int Account_Id { get; set; }
        public int Test_Category { get; set; }

    }
}
