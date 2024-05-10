using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using ClosedXML.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.DataProtection.KeyManagement;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting;
using DocumentFormat.OpenXml.EMMA;
using DocumentFormat.OpenXml.Wordprocessing;

namespace ScoringTestService
{
    public class ScoringTest : IScoringTest
    {
        /*public string Mypy(string apikey,string myData)
        {
            try
            {
                PyObject get = null;
                using (Py.GIL())
                {
                    var pythonScript = Py.Import("gptAI");
                    var key = new PyString(apikey);
                    var pyData = new PyString(myData);
                    
                    get = pythonScript.InvokeMethod("AIResponse", new PyObject[] { key, pyData });
                }

                // Pemeriksaan respons dari API
                if (get != null && !string.IsNullOrEmpty(get.ToString()))
                {
                    return get.ToString();
                }
                else
                {
                    return "0";
                }
            }
            catch (Exception ex)
            {
                // Penanganan kesalahan umum
                return "error";
            }
        }*/
        public string ScoringMSDT(string[] jawaban, string fileName)
        {
            
            string dir = Directory.GetCurrentDirectory();
            string filePath = Path.GetFullPath(Path.Combine(dir, @"..\", @"ScoringTestService", @"scoreformula", fileName));

            string tempFilePath = Path.GetTempFileName();

            using (var workbook = new XLWorkbook(filePath))
            {
                var worksheet = workbook.Worksheet(1); // Ganti dengan nomor atau nama worksheet yang sesuai


                var cellStart = 4; //kolom (A,B, dst)
                var dataPerRow = 8;
                var rowStart = 4; //row (1,2, dst)

                var list = jawaban.ToList();

                for (int i = 0; i < list.Count; i++)
                {
                    /*worksheet.Cell(rowStart, cellStart).Value = list[i];*/
                    worksheet.Cell(rowStart, cellStart).SetValue(list[i].ToString());

                    if ((i + 1) % dataPerRow == 0)
                    {
                        cellStart = 4;
                        rowStart++;
                    }
                    else
                    {
                        cellStart++;
                    }
                }

                var valueTO = worksheet.Cell(36, 5).Value.ToString();
                var valueRO = worksheet.Cell(36, 7).Value.ToString();
                var valueE = worksheet.Cell(36, 9).Value.ToString();
                var valueO = worksheet.Cell(36, 11).Value.ToString();

                var validate = worksheet.Cell(12, 15).Value.ToString();
                if (Convert.ToInt32(validate) == 0)
                {
                    File.Delete(tempFilePath);
                    return "0";
                }
                /*File.Delete(tempFilePath);
                return $"{valueTO},{valueRO},{valueE},{valueO}";*/
                /*Random rnd = new Random();
                int month = rnd.Next(1, 100);
                string newfilePath = @"C:\\Users\\bayu.pratama.ROOT\\source\\repos\\RAS-Psychotest-Berca\\Backend\\" + month + ".xlsx"; // Ganti dengan path file Excel yang Anda miliki

                workbook.SaveAs(newfilePath);
*/
                double convertTO = Convert.ToInt32(valueTO) >= 0 && Convert.ToInt32(valueTO) <= 29 ? 0 : Convert.ToInt32(valueTO) >= 30 && Convert.ToInt32(valueTO) <= 31 ? 0.6 : Convert.ToInt32(valueTO) == 32 ? 1.2 : Convert.ToInt32(valueTO) == 33 ? 1.8 : Convert.ToInt32(valueTO) == 34 ? 2.4 : Convert.ToInt32(valueTO) == 35 ? 3 : Convert.ToInt32(valueTO) >= 36 && Convert.ToInt32(valueTO) <= 37 ? 3.6 : Convert.ToInt32(valueTO) >= 38 ? 4 : 99999;
                double convertRO = Convert.ToInt32(valueRO) >= 0 && Convert.ToInt32(valueRO) <= 29 ? 0 : Convert.ToInt32(valueRO) >= 30 && Convert.ToInt32(valueRO) <= 31 ? 0.6 : Convert.ToInt32(valueRO) == 32 ? 1.2 : Convert.ToInt32(valueRO) == 33 ? 1.8 : Convert.ToInt32(valueRO) == 34 ? 2.4 : Convert.ToInt32(valueRO) == 35 ? 3 : Convert.ToInt32(valueRO) >= 36 && Convert.ToInt32(valueRO) <= 37 ? 3.6 : Convert.ToInt32(valueRO) >= 38 ? 4 : 99999;
                double convertE = Convert.ToInt32(valueE) >= 0 && Convert.ToInt32(valueE) <= 29 ? 0 : Convert.ToInt32(valueE) >= 30 && Convert.ToInt32(valueE) <= 31 ? 0.6 : Convert.ToInt32(valueE) == 32 ? 1.2 : Convert.ToInt32(valueE) == 33 ? 1.8 : Convert.ToInt32(valueE) == 34 ? 2.4 : Convert.ToInt32(valueE) == 35 ? 3 : Convert.ToInt32(valueE) >= 36 && Convert.ToInt32(valueE) <= 37 ? 3.6 : Convert.ToInt32(valueE) >= 38 ? 4 : 99999;


                //output
                var type = "";
                File.Delete(tempFilePath);

                //TO diatas 2
                if (convertTO > 2)
                {
                    if (convertRO > 2)
                    {
                        if (convertE > 2)
                        {
                            type = "Executive";
                            return $"{type}";
                        }
                        type = "Compromiser";
                        return $"{type}";
                    }
                    if (convertE > 2)
                    {
                        type = "Benevolent Autocrat";
                        return $"{type}";
                    }
                    type = "Autocrat";
                    return $"{type}";
                }

                //TO dibawah 2
                if (convertRO > 2)
                {
                    if (convertE > 2)
                    {
                        type = "Developer";
                        return $"{type}";
                    }
                    type = "Missionary";
                    return $"{type}";
                }
                if (convertE > 2)
                {
                    type = "bureaucratic";
                    return $"{type}";
                }
                type = "Deserter";
                return $"{type}";

            }
        }

        public string ScoringPAPIKOSTICK(string[] jawaban, string fileName)
        {
            string dir = Directory.GetCurrentDirectory();
            string filePath = Path.GetFullPath(Path.Combine(dir, @"..\", @"ScoringTestService", @"scoreformula", fileName));

            string tempFilePath = Path.GetTempFileName();

            using (var workbook = new XLWorkbook(filePath))
            {
                var worksheet = workbook.Worksheet(2);


                var cellStart = 11; //kolom (A,B, dst)
                var dataPerRow = 10;
                var rowStart = 7; //row (1,2, dst)

                var list = jawaban.ToList();

                for (int i = 0; i < list.Count; i++)
                {
                    worksheet.Cell(rowStart, cellStart).Value = list[i];
                    if ((i + 1) % dataPerRow == 0)
                    {
                        rowStart = 7;
                        cellStart--;
                    }
                    else
                    {
                        rowStart++;
                    }
                }
                //batas atas
                var valueG = worksheet.Cell(5, 3).Value.ToString();
                var valueL = worksheet.Cell(5, 4).Value.ToString();
                var valueI = worksheet.Cell(5, 5).Value.ToString();
                var valueT = worksheet.Cell(5, 6).Value.ToString();
                var valueV = worksheet.Cell(5, 7).Value.ToString();
                var valueS = worksheet.Cell(5, 8).Value.ToString();
                var valueR = worksheet.Cell(5, 9).Value.ToString();
                var valueD = worksheet.Cell(5, 10).Value.ToString();
                var valueC = worksheet.Cell(5, 11).Value.ToString();
                var valueE = worksheet.Cell(5, 12).Value.ToString();

                //batas bawah
                var valueN = worksheet.Cell(19, 2).Value.ToString();
                var valueA = worksheet.Cell(19, 3).Value.ToString();
                var valueP = worksheet.Cell(19, 4).Value.ToString();
                var valueX = worksheet.Cell(19, 5).Value.ToString();
                var valueB = worksheet.Cell(19, 6).Value.ToString();
                var valueO = worksheet.Cell(19, 7).Value.ToString();
                var valueZ = worksheet.Cell(19, 8).Value.ToString();
                var valueK = worksheet.Cell(19, 9).Value.ToString();
                var valueF = worksheet.Cell(19, 10).Value.ToString();
                var valueW = worksheet.Cell(19, 11).Value.ToString();

                var validate = worksheet.Cell(8, 16).Value.ToString();
                if (Convert.ToInt32(validate) == 0)
                {
                    File.Delete(tempFilePath);
                    return "0"; //validasi jika jumlah jawaban tidak samadengan 64 akan dihentikan
                }
                /*string saveFilePath = Path.GetFullPath(Path.Combine(dir, @"..\", @"ScoringTestService", @"scoreformula", "cek.xlsx")); // Gantilah dengan path yang sesuai
                workbook.SaveAs(saveFilePath);*/
                File.Delete(tempFilePath);
                //output
                return $"{valueG},{valueL},{valueI},{valueT},{valueV},{valueS},{valueR},{valueD},{valueC},{valueE},{valueN},{valueA},{valueP},{valueX},{valueB},{valueO},{valueZ},{valueK},{valueF},{valueW}";

            }
        }

        public string ScoringRMIB(string[] jawaban, string fileName)
        {
            string dir = Directory.GetCurrentDirectory();
            string filePath = Path.GetFullPath(Path.Combine(dir, @"..\", @"ScoringTestService", @"scoreformula", fileName));

            string tempFilePath = Path.GetTempFileName();

            using (var workbook = new XLWorkbook(filePath))
            {

                var worksheet = workbook.Worksheet(3);


                var cellStart = 4; //kolom (A,B, dst)
                var rowStart = 4; //row (1,2, dst)

                var list = jawaban.ToList();

                for (int i = 0; i < list.Count; i++)
                {
                    var newList = list[i].Split(',');
                    var newRow = newList.Length;
                    int check = 0;
                    for (int j = 0; j < newRow; j++)
                    {
                        if(check != 0)
                        {
                            rowStart = 4;
                        }
                        worksheet.Cell(rowStart, cellStart).Value = Convert.ToInt32(newList[j]);
                        rowStart++;
                        check = 0;
                        if(rowStart > 15)
                        {
                            check++;
                        }
                    }
                    cellStart++;
                    rowStart = 4+i+1;
                }
                var ScoreA = worksheet.Cell(4, 13).Value.ToString();
                var ScoreB = worksheet.Cell(5, 13).Value.ToString();
                var ScoreC = worksheet.Cell(6, 13).Value.ToString();
                var ScoreD = worksheet.Cell(7, 13).Value.ToString();
                var ScoreE = worksheet.Cell(8, 13).Value.ToString();
                var ScoreF = worksheet.Cell(9, 13).Value.ToString();
                var ScoreG = worksheet.Cell(10, 13).Value.ToString();
                var ScoreH = worksheet.Cell(11, 13).Value.ToString();
                var ScoreI = worksheet.Cell(12, 13).Value.ToString();
                var ScoreJ = worksheet.Cell(13, 13).Value.ToString();
                var ScoreK = worksheet.Cell(14, 13).Value.ToString();
                var ScoreL = worksheet.Cell(15, 13).Value.ToString();

                /*worksheet.Cell(4, 14).FormulaA1 = ("=RANK(M4,M4:M15,1)");
                worksheet.Workbook.CalculateMode = XLCalculateMode.Auto;
                worksheet.Workbook.RecalculateAllFormulas();*/
                var rankA = worksheet.Cell(4, 14).Value.ToString();
                var rankB = worksheet.Cell(5, 14).Value.ToString();
                var rankC = worksheet.Cell(6, 14).Value.ToString();
                var rankD = worksheet.Cell(7, 14).Value.ToString();
                var rankE = worksheet.Cell(8, 14).Value.ToString();
                var rankF = worksheet.Cell(9, 14).Value.ToString();
                var rankG = worksheet.Cell(10, 14).Value.ToString();
                var rankH = worksheet.Cell(11, 14).Value.ToString();
                var rankI = worksheet.Cell(12, 14).Value.ToString();
                var rankJ = worksheet.Cell(13, 14).Value.ToString();
                var rankK = worksheet.Cell(14, 14).Value.ToString();
                var rankL = worksheet.Cell(15, 14).Value.ToString();


                var validate = worksheet.Cell(16, 13).Value.ToString();
                
                
                if (validate == "0")
                {
                    File.Delete(tempFilePath);
                    return $"{validate}"; //validasi jika jumlah jawaban tidak samadengan 702 akan dihentikan
                }


                File.Delete(tempFilePath);
                /*string saveFilePath = Path.GetFullPath(Path.Combine(dir, @"..\", @"ScoringTestService", @"scoreformula", "cek.xlsx")); // Gantilah dengan path yang sesuai
                workbook.SaveAs(saveFilePath);*/
                return $"{ScoreA},{ScoreB},{ScoreC},{ScoreD},{ScoreE},{ScoreF},{ScoreG},{ScoreH},{ScoreI},{ScoreJ},{ScoreK},{ScoreL},{rankA},{rankB},{rankC},{rankD},{rankE},{rankF},{rankG},{rankH},{rankI},{rankJ},{rankK},{rankL}";



            }
        }

        public string ScoringIST(string[] jawaban, string fileName)
        {
            string dir = Directory.GetCurrentDirectory();
            string filePath = Path.GetFullPath(Path.Combine(dir, @"..\", @"ScoringTestService", @"scoreformula", fileName));

            string tempFilePath = Path.GetTempFileName();
            if (jawaban.Length != 176)
            {
                return "0"; //validasi jika jumlah jawaban tidak samadengan 176 akan dihentikan
            }
            using (var workbook = new XLWorkbook(filePath))
            {
                var worksheet = workbook.Worksheet(4);


                var cellStart = 3; //kolom (A,B, dst)
                var dataPerRow = 20;
                var rowStart = 6; //row (1,2, dst)

                var list = jawaban.ToList();

                for (int i = 0; i < list.Count; i++)
                {
                    worksheet.Cell(rowStart, cellStart).Value = list[i];
                    if (((i+1) < 76 && (i + 1) % dataPerRow == 0)||(i+1) == 76||((i+1)>76 && (i+5)%dataPerRow==0))
                    {
                        rowStart = 6;
                        cellStart++;
                    }
                    else
                    {
                        rowStart++;
                    }
                }
                /*string saveFilePath = Path.GetFullPath(Path.Combine(dir, @"..\", @"ScoringTestService", @"scoreformula", "cek.xlsx")); // Gantilah dengan path yang sesuai
                workbook.SaveAs(saveFilePath);*/

                var subtes1 = worksheet.Cell(27, 3).Value.ToString();
                var subtes2 = worksheet.Cell(27, 4).Value.ToString();
                var subtes3 = worksheet.Cell(27, 5).Value.ToString();
                var subtes4 = worksheet.Cell(27, 6).Value.ToString();
                var subtes5 = worksheet.Cell(27, 7).Value.ToString();
                var subtes6 = worksheet.Cell(27, 8).Value.ToString();
                var subtes7 = worksheet.Cell(27, 9).Value.ToString();
                var subtes8 = worksheet.Cell(27, 10).Value.ToString();
                var subtes9 = worksheet.Cell(27, 11).Value.ToString();



                File.Delete(tempFilePath);
                //output
                return $"{subtes1},{subtes2},{subtes3},{subtes4},{subtes5},{subtes6},{subtes7},{subtes8},{subtes9}";
            }
        }

        public string ScoringDISC(string[] jawaban, string fileName)
        {
            string dir = Directory.GetCurrentDirectory();
            string filePath = Path.GetFullPath(Path.Combine(dir, @"..\", @"ScoringTestService", @"scoreformula", fileName));

            string tempFilePath = Path.GetTempFileName();
            
            using (var workbook = new XLWorkbook(filePath))
            {
                var worksheet = workbook.Worksheet(1);
                var worksheetTwo = workbook.Worksheet(2);
                var cellStart = 3; //kolom (A,B, dst)
                var rowStart = 3; //row (1,2, dst)

                var list = jawaban.ToList();
                int start = 1;
                int numSoal = 1;
                int nTwo = 0;
                for (int i = 0; i < list.Count; i++)
                {
                    var perNum = list[i].Split(',');
                    for (int j = 0; j < 2; j++)
                    {
                        rowStart = start + Int32.Parse(perNum[j]);
                        worksheet.Cell(rowStart, cellStart).Value = 1;
                        cellStart++;
                    }
                    if (i < 11 || nTwo == 1)
                    {
                        cellStart = nTwo == 0 ? 3 : 9;
                        start = numSoal * 5 + 1;
                        numSoal++;
                    }
                    else
                    {
                        cellStart = 9;
                        start = 1;
                        nTwo = 1;
                        numSoal = 1;
                    }
                }
                var totalM = worksheetTwo.Cell("S6").Value.ToString();
                var totalL = worksheetTwo.Cell("S8").Value.ToString();
                if (totalM != "24" || totalL != "24")
                {
                    File.Delete(tempFilePath);
                    return "0";
                }

                var mostD = worksheetTwo.Cell("H6").Value.ToString();
                var mostI = worksheetTwo.Cell("J6").Value.ToString();
                var mostS = worksheetTwo.Cell("L6").Value.ToString();
                var mostC = worksheetTwo.Cell("N6").Value.ToString();
                var mostStar = worksheetTwo.Cell("P6").Value.ToString();

                var leastD = worksheetTwo.Cell("H8").Value.ToString();
                var leastI = worksheetTwo.Cell("J8").Value.ToString();
                var leastS = worksheetTwo.Cell("L8").Value.ToString();
                var leastC = worksheetTwo.Cell("N8").Value.ToString();
                var leastStar = worksheetTwo.Cell("P8").Value.ToString();

                worksheetTwo.Cell("H10").Value = Int32.Parse(mostD) - Int32.Parse(leastD);
                worksheetTwo.Cell("J10").Value = Int32.Parse(mostI) - Int32.Parse(leastI);
                worksheetTwo.Cell("L10").Value = Int32.Parse(mostS) - Int32.Parse(leastS);
                worksheetTwo.Cell("N10").Value = Int32.Parse(mostC) - Int32.Parse(leastC);
                worksheetTwo.Cell("P10").Value = Int32.Parse(mostStar) - Int32.Parse(leastStar);
                var changeD = worksheetTwo.Cell("H10").Value.ToString();
                var changeI = worksheetTwo.Cell("J10").Value.ToString();
                var changeS = worksheetTwo.Cell("L10").Value.ToString();
                var changeC = worksheetTwo.Cell("N10").Value.ToString();
                var changeStar = worksheetTwo.Cell("P10").Value.ToString();


                string[] param = { "D", "I", "S", "C" };


                //GRAPH 1
                var graphOneD = worksheetTwo.Cell("X35").Value.ToString();
                var graphOneI = worksheetTwo.Cell("Y35").Value.ToString();
                var graphOneS = worksheetTwo.Cell("Z35").Value.ToString();
                var graphOneC = worksheetTwo.Cell("AA35").Value.ToString();
                int[] rankedOne = { Int32.Parse(graphOneD), Int32.Parse(graphOneI), Int32.Parse(graphOneS), Int32.Parse(graphOneC) };

                //GRAPH 2
                var graphTwoD = worksheetTwo.Cell("X38").Value.ToString();
                var graphTwoI = worksheetTwo.Cell("Y38").Value.ToString();
                var graphTwoS = worksheetTwo.Cell("Z38").Value.ToString();
                var graphTwoC = worksheetTwo.Cell("AA38").Value.ToString();
                int[] rankedTwo = { Int32.Parse(graphTwoD), Int32.Parse(graphTwoI), Int32.Parse(graphTwoS), Int32.Parse(graphTwoC) };

                //GRAPH 3
                var graphThreeD = worksheetTwo.Cell("X41").Value.ToString();
                var graphThreeI = worksheetTwo.Cell("Y41").Value.ToString();
                var graphThreeS = worksheetTwo.Cell("Z41").Value.ToString();
                var graphThreeC = worksheetTwo.Cell("AA41").Value.ToString();
                int[] rankedThree = { Int32.Parse(graphThreeD), Int32.Parse(graphThreeI), Int32.Parse(graphThreeS), Int32.Parse(graphThreeC) };

                int[] rankedD = { Int32.Parse(graphOneD), Int32.Parse(graphTwoD), Int32.Parse(graphThreeD) };
                int[] rankedI = { Int32.Parse(graphOneI), Int32.Parse(graphTwoI), Int32.Parse(graphThreeI) };
                int[] rankedS = { Int32.Parse(graphOneS), Int32.Parse(graphTwoS), Int32.Parse(graphThreeS) };
                int[] rankedC = { Int32.Parse(graphOneC), Int32.Parse(graphTwoC), Int32.Parse(graphThreeC) };

                //count 0
                var zeroInD = worksheetTwo.Cell("AD38").Value.ToString();
                var zeroInI = worksheetTwo.Cell("AE38").Value.ToString();
                var zeroInS = worksheetTwo.Cell("AF38").Value.ToString();
                var zeroInC = worksheetTwo.Cell("AG38").Value.ToString();
                int[] rankedZero = { Int32.Parse(zeroInD), Int32.Parse(zeroInI), Int32.Parse(zeroInS), Int32.Parse(zeroInC) };
                int[] indicesZero = Enumerable.Range(0, rankedZero.Length).ToArray();
                var combinedArrayZero = rankedZero.Zip(indicesZero, (value, index) => new { Value = value, Index = index })
                                          .Where(item => item.Value <= 1)
                                          .ToArray();
                var threeSmallestIndicesZero = combinedArrayZero.Select(item => item.Index).ToArray();
                var threeSmallestValueZero = combinedArrayZero.Select(item => item.Value).ToArray();
                string sortedCode = "D";

                switch (threeSmallestIndicesZero.Length)
                {
                    case 0:
                        break;
                    case 1:
                        sortedCode = param[threeSmallestIndicesZero[0]];
                        break;
                    default:
                        List<string> oThree = new List<string>();
                        for (int a = 0; a < threeSmallestIndicesZero.Length; a++)
                        {
                            oThree.Add(threeSmallestIndicesZero[a].ToString());  
                        }
                        List<int> highest = new List<int>(); 
                        for (int a = 0; a < oThree.Count; a++)
                        {
                            switch (Int32.Parse(oThree[a]))
                            {
                                case 0:
                                    var highestD = rankedD.Where(x=>x != 0).OrderBy(x => x).FirstOrDefault();
                                    highest.Add(highestD);
                                    break;
                                case 1:
                                    var highestI = rankedI.Where(x => x != 0).OrderBy(x => x).FirstOrDefault();
                                    highest.Add(highestI);
                                    break;
                                case 2:
                                    var highestS = rankedS.Where(x => x != 0).OrderBy(x => x).FirstOrDefault();
                                    highest.Add(highestS);
                                    break;
                                case 3:
                                    var highestC = rankedC.Where(x => x != 0).OrderBy(x => x).FirstOrDefault();
                                    highest.Add(highestC);
                                    break;
                                default:
                                    break;
                            }
                        }

                        var indexedHighest = highest.Select((value, index) => new { Value = value, Index = index });
                        var sortedIndices = indexedHighest.OrderBy(x => x.Value).Select(e => e.Index).Take(3).ToList(); 
                        List<string> thePossibility = new List<string>();
                        for(int i = 0; i < sortedIndices.Count; i++)
                        {
                            int indexNum = int.Parse(oThree[sortedIndices[i]]);
                            var theRes = param[indexNum];
                            thePossibility.Add(theRes.ToString());
                        }

                        sortedCode = string.Join("", thePossibility);
                        break;
                }

                worksheetTwo.Cell("X48").Value = sortedCode;



                var code = worksheetTwo.Cell("X48").Value.ToString();
                var nama = worksheetTwo.Cell("K58").Value.ToString();
                var deskripsi = worksheetTwo.Cell("A59").Value.ToString();

                /*Random rnd = new Random();
                int month = rnd.Next(1, 1000);
                string saveFilePath = Path.GetFullPath(Path.Combine(dir, @"..\", @"ScoringTestService", @"scoreformula", "cek" + month.ToString() + ".xlsx")); // Gantilah dengan path yang sesuai
                workbook.SaveAs(saveFilePath);*/
                File.Delete(tempFilePath);
                return $"{mostD},{mostI},{mostS},{mostC},{mostStar},{leastD},{leastI},{leastS},{leastC},{leastStar},{changeD},{changeI},{changeS},{changeC},{changeStar},{code},{nama},{deskripsi}";
            }
        }

        
        public string ConvertIST(int[] jawaban, int age, string fileName)
        {
            string dir = Directory.GetCurrentDirectory();
            string filePath = Path.GetFullPath(Path.Combine(dir, @"..\", @"ScoringTestService", @"scoreformula", fileName));

            string tempFilePath = Path.GetTempFileName();
            if (jawaban.Length != 9)
            {
                return "0"; //validasi jika jumlah jawaban tidak samadengan 176 akan dihentikan
            }
            using (var workbook = new XLWorkbook(filePath))
            {
                var worksheet = workbook.Worksheet(1);
                var worksheetTwo = workbook.Worksheet(2);


                var cellStart = 2; //kolom (A,B, dst)
                var rowStart = 3; //row (1,2, dst)
                var rowByAge = 1;

                if(age >= 21 && age <= 25) {
                    rowByAge = 3;
                }
                else if(age >=26 && age <= 30) {
                    rowByAge = 5;
                }
                else if(age >= 31 && age <= 35) {
                    rowByAge = 7;
                }
                else if(age >= 36 && age <= 40) {
                    rowByAge = 9;
                }
                else if(age >= 41 && age <= 45) {
                    rowByAge = 11;
                }
                rowStart *= rowByAge;

                var list = jawaban.ToList();

                for (int i = 0; i < list.Count; i++)
                {
                    worksheet.Cell(rowStart, cellStart).Value = list[i];
                    cellStart++;
                }
                

                var SE = worksheet.Cell(rowStart+2, 2).Value.ToString();
                var WA = worksheet.Cell(rowStart+2, 3).Value.ToString();
                var AN = worksheet.Cell(rowStart+2, 4).Value.ToString();
                var GE = worksheet.Cell(rowStart+2, 5).Value.ToString();
                var RA = worksheet.Cell(rowStart+2, 6).Value.ToString();
                var ZR = worksheet.Cell(rowStart+2, 7).Value.ToString();
                var FA = worksheet.Cell(rowStart+2, 8).Value.ToString();
                var WU = worksheet.Cell(rowStart+2, 9).Value.ToString();
                var ME = worksheet.Cell(rowStart+2, 10).Value.ToString();
                var Total = worksheet.Cell(rowStart+2, 11).Value.ToString();

                worksheetTwo.Cell(7, 6).Value = Int32.Parse( Total);
                /*string saveFilePath = Path.GetFullPath(Path.Combine(dir, @"..\", @"ScoringTestService", @"scoreformula", "cek.xlsx")); // Gantilah dengan path yang sesuai
                workbook.SaveAs(saveFilePath);*/
                var IqScore = worksheetTwo.Cell(7,7).Value.ToString();
                var Kategori = worksheetTwo.Cell(7,8).Value.ToString();
                File.Delete(tempFilePath);
                //output
                return $"{SE},{WA},{AN},{GE},{RA},{ZR},{FA},{WU},{ME},{Total},{IqScore} ({Kategori})";
            }
        }


    }
}
