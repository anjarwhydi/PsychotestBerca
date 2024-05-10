using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ScoringTestService
{
    public interface IScoringTest
    {
        string ScoringMSDT(string[] jawaban, string fileName);
        string ScoringPAPIKOSTICK(string[] jawaban, string fileName);
        string ScoringRMIB(string[] jawaban, string fileName);
        string ScoringIST(string[] jawaban, string fileName);
        string ScoringDISC(string[] jawaban, string fileName);
        string ConvertIST(int[] jawaban, int age, string fileName);

        /*string Mypy(string apikey, string myData);*/
    }
}
