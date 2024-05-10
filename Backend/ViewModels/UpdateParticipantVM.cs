using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.ViewModels
{
    public class UpdateParticipantVM
    {
        public int ParticipantId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public int Applied_Position { get; set; }
        public DateTime ExpiredDatetime { get; set; }
        public int Account_Id { get; set; }
        public int Test_Category { get; set; }
        public string? Nik { get; set; }


    }
}
