﻿using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.ViewModels
{
    public class EditChoiceVM
    {
        public int multipleChoiceId { get; set; }
        public string multipleChoiceDesc { get; set; }
        public int questionId { get; set; }
        public string score { get; set; }

    }
}
