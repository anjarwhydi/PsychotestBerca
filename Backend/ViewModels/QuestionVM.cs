using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.ViewModels
{
    public class QuestionVM
    {
        public string questionDesc { get; set; }
        public int testId { get; set; }
        public int Total_Question { get; set; }

    }
}
