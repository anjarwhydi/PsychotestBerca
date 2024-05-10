using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.ViewModels
{
    public class SavedAnswerVM
    {
        public int participant_id { get; set; }
        public string? answer { get; set; }
        public string? final_score { get; set; }
        public string? capture { get; set; }
        public bool? status { get; set; }
        public int test_id { get; set; }

    }
}
