using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.ViewModels
{
    public class CreateDateParticipantAnswerVM
    {
        public int Participant_ID { get; set; }
        public int Test_ID { get; set; }
        public string CreateDate { get; set; }

    }
}
