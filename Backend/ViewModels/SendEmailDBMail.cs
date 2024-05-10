using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.ViewModels
{
    public class SendEmailDBMail
    {

        public string Name { get; set; }
        public string To { get; set; }
        public string Subject { get; set; }
        public string Link { get; set; }


    }
}
