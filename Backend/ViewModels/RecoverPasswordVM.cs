﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.ViewModels
{
    public class RecoverPasswordVM
    {
        public int AccountId { get; set; }
        public string Password { get; set; }
        public string RePassword { get; set; }
    }
}