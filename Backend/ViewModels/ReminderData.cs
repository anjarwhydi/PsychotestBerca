using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.ViewModels
{
    public class ReminderData
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public DateTime ExpiredDatetime { get; set; }

    }
}
