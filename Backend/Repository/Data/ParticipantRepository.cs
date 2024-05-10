using Backend.Context;
using Backend.Models;
using Backend.ViewModels;
using Castle.Core.Resource;
using Dapper;
using DocumentFormat.OpenXml.InkML;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Linq;
namespace Backend.Repository.Data
{
    public class ParticipantRepository : GeneralRepository<RasPsychotestBercaContext, TblParticipant, int>
    {
        private readonly RasPsychotestBercaContext context;
        private readonly IConfiguration configuration;
        private readonly string connectionString;

        public ParticipantRepository(RasPsychotestBercaContext context, IConfiguration configuration) : base(context)
        {
            this.context = context;
            this.configuration = configuration;
            this.connectionString = configuration.GetConnectionString("PsychotestContext");
        }

        public IEnumerable<TblParticipant> getAccount()
        {
            return context.TblParticipants.Include(e => e.Account);
        }

        //public IEnumerable<TblParticipant> getParticipant()
        //{
        //    return context.TblParticipants.Include(e => e.Account).Include(e => e.AppliedPosition).Include(e => e.TestCategory).Include(e => e.TblParticipantAnswers);
        //}

        public IEnumerable<TblParticipant> getParticipant()
        {
            return context.TblParticipants
                .Include(e => e.Account)
                .Include(e => e.AppliedPosition)
                .Include(e => e.TestCategory)
                .Include(e => e.TblParticipantAnswers)
                .OrderByDescending(e => e.ParticipantId);
        }
        public IEnumerable<object> GetParticipantsWithStatusAndTestCategory()
        {
            return context.TblParticipants
                .Select(p => new
                {
                    ExpiredDatetime = p.ExpiredDatetime,
                    StatusList = p.TblParticipantAnswers.Select(pa => new { pa.Status }),
                    TesKitList = p.TestCategory.TestKit
                })
                .ToList();
        }

        public IEnumerable<TblParticipant> getParAns()
        {
            return context.TblParticipants.Include(e => e.TestCategory).Include(e => e.TblParticipantAnswers);
        }

        public IEnumerable<TblParticipant> getPartOnly()
        {
            return context.TblParticipants;
        }

        public IEnumerable<TblParticipant> getParticipantById(int id)
        {
            return context.TblParticipants.Include(e => e.Account).Include(e => e.AppliedPosition).Include(e => e.TestCategory).Where(e => e.ParticipantId == id);
        }
        public IEnumerable<TblParticipant> getParticipantByAccountId(int id)
        {
            return context.TblParticipants.Include(e => e.Account).Include(e => e.AppliedPosition).Include(e => e.TestCategory).Where(e => e.AccountId == id);
        }

        public bool checkEmail(string email)
        {
            var checkEmail = context.TblAccounts.FirstOrDefault(e => e.Email == email);
            if (checkEmail == null)
            {
                return false;
            }
            return true;
        }

        public int UpdatePar(TblParticipant tblParticipant)
        {
            context.Entry(tblParticipant).State = EntityState.Modified;
            /*myContext.Employees.Update(employee);*/
            var save = context.SaveChanges();
            return save;
        }

        public int UpdateNIK(int id, string NIK)
        {
            var fieldUpdateNIK = context.TblParticipants.FirstOrDefault(p => p.ParticipantId == id && p.Nik == null);

            if (fieldUpdateNIK != null)
            {
                if (IsNIKAlreadyExists(NIK))
                {
                    return -2;
                }
                else
                {
                    fieldUpdateNIK.Nik = NIK;
                    var save = context.SaveChanges();
                    return save;
                }

            }

            return -1;
        }

        public TblParticipant GetNIKById(int id)
        {
            var get = context.TblParticipants.FirstOrDefault(p => p.ParticipantId == id && p.Nik != null);
            return get;
        }

        public bool IsNIKAlreadyExists(string NIK)
        {
            return context.TblParticipants.Any(p => p.Nik == NIK);
        }

        public int CountParticipant()
        {
            int count = context.TblParticipants.Count();
            return count;
        }

        public IEnumerable<ReminderData> DataReminder()
        {
            var result = from x in context.TblParticipants
                         join y in context.TblAccounts on x.AccountId equals y.AccountId into accountGroup
                         join z in context.TblParticipantAnswers on x.ParticipantId equals z.ParticipantId into answerGroup
                         from answer in answerGroup.DefaultIfEmpty()
                         where x.ExpiredDatetime.Date == DateTime.Today
                         group x by x.ParticipantId into grouping
                         where grouping.First().TblParticipantAnswers.Count() == 0 || grouping.First().TblParticipantAnswers.Count(stat => stat.Status == true) != grouping.First().TblParticipantAnswers.Count()
                         select new ReminderData
                         {
                             Name = grouping.First().Account.Name,
                             Email = grouping.First().Account.Email,
                             ExpiredDatetime = grouping.First().ExpiredDatetime,
                         };
            var resultList = result.ToList();
            return resultList;
        }


        public async Task<int?> SendEmailParticipant(SendEmailDBMail message)
        {
            var bodyEmail = @"
<html>
  <head>
                                    <meta http-equiv=""Content-Type"" content=""text/html; charset=utf-8"">
                                    <meta http-equiv=""x-ua-compatible"" content=""ie=edge"">
                                    <meta name=""x-apple-disable-message-reformatting"">
                                    <meta name=""viewport"" content=""width=device-width, initial-scale=1"">
                                    <meta name=""format-detection"" content=""telephone=no, date=no, address=no, email=no"">
                                    <style type=""text/css"">
                                      body,
                                      table,
                                      td {
                                        font-family: Helvetica, Arial, sans-serif !important
                                      }

                                      .ExternalClass {
                                        width: 100%
                                      }

                                      .ExternalClass,
                                      .ExternalClass p,
                                      .ExternalClass span,
                                      .ExternalClass font,
                                      .ExternalClass td,
                                      .ExternalClass div {
                                        line-height: 150%
                                      }
                                      .forbutton {
  padding: 1vh 0 1vh 0;
  text-align: center;
  font-size: 14px;
}
.forbutton a {
  text-decoration: none;
  color: white;
  text-transform: capitalize;
}
.forbutton a button {
  width: 45%;
  height: 7vh;
  background-color: blue;
  color: white;
  border-radius: 8px;
  border: none;
  text-transform: capitalize;
  font-size: small;
}
                                      a {
                                        text-decoration: none
                                      }

                                      * {
                                        color: inherit
                                      }

                                      a[x-apple-data-detectors],
                                      u+#body a,
                                      #MessageViewBody a {
                                        color: inherit;
                                        text-decoration: none;
                                        font-size: inherit;
                                        font-family: inherit;
                                        font-weight: inherit;
                                        line-height: inherit
                                      }

                                      img {
                                        -ms-interpolation-mode: bicubicimg{
                                        padding-top: 0;
                                        width: 30%; 
                                        padding-bottom: 0; 
                                        font-weight: 700 !important;
                                        vertical-align: baseline;
                                        font-size: 28px;
                                        line-height: 33.6px;
                                        margin: 0 auto;
                                        }

                                      table:not([class^=s-]) {
                                        font-family: Helvetica, Arial, sans-serif;
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        border-spacing: 0px;
                                        border-collapse: collapse
                                      }

                                      table:not([class^=s-]) td {
                                        border-spacing: 0px;
                                        border-collapse: collapse
                                      }
                                        button{
                                           background-color: blue;
                                           height: 2rem;
                                           width: 15%;
                                           border-radius: 5px;
                                           border: none;
                                           font-size: 14px;
                                           color: blanchedalmond;
                                        }

                                      @media screen and (max-width: 600px) {

                                        .w-full,
                                        .w-full>tbody>tr>td {
                                          width: 100% !important
                                        }

                                        .w-24,
                                        .w-24>tbody>tr>td {
                                          width: 96px !important
                                        }

                                        .w-40,
                                        .w-40>tbody>tr>td {
                                          width: 160px !important
                                        }

                                        .p-lg-10:not(table),
                                        .p-lg-10:not(.btn)>tbody>tr>td,
                                        .p-lg-10.btn td a {
                                          padding: 0 !important
                                        }

                                        .p-3:not(table),
                                        .p-3:not(.btn)>tbody>tr>td,
                                        .p-3.btn td a {
                                          padding: 12px !important
                                        }

                                        .p-6:not(table),
                                        .p-6:not(.btn)>tbody>tr>td,
                                        .p-6.btn td a {
                                          padding: 24px !important
                                        }

                                        [class=s-lg-]>tbody>tr>td {
                                          font-size: 0 !important;
                                          line-height: 0 !important;
                                          height: 0 !important
                                        }

                                        .s-4>tbody>tr>td {
                                          font-size: 16px !important;
                                          line-height: 16px !important;
                                          height: 16px !important
                                        }

                                        .s-6>tbody>tr>td {
                                          font-size: 24px !important;
                                          line-height: 24px !important;
                                          height: 24px !important
                                        }

                                        .s-10>tbody>tr>td {
                                          font-size: 40px !important;
                                          line-height: 40px !important;
                                          height: 40px !important
                                        }

                                      }
                                        @media screen and (max-width: 480px) {
                                            img{
                                                width: 50vw;
                                                height:70px;
                                            }
                                            button{
                                            width:40%;
                                            font-size:12px;
                                            }
                                        }
                                    </style>
                                  </head>

                                  <body class=""bg-light""
                                    style=""outline: 0; width: 100%; min-width: 100%; height: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Helvetica, Arial, sans-serif; line-height: 24px; font-weight: normal; font-size: 16px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #000000; margin: 0; padding: 0; border-width: 0;""
                                    bgcolor=""#f7fafc"">
                                    <table class=""bg-light body"" valign=""top"" role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0""
                                      style=""outline: 0; width: 100%; min-width: 100%; height: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Helvetica, Arial, sans-serif; line-height: 24px; font-weight: normal; font-size: 16px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #000000; margin: 0; padding: 0; border-width: 0;""
                                      bgcolor=""#f7fafc"">
                                      <tbody >
                                        <tr>
                                          <td valign=""top"" style=""line-height: 24px; font-size: 16px; margin: 0;"" align=""left"" bgcolor=""#f7fafc"">
                                            <table class=""container"" role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0"" style=""width: 100%;"">
                                              <tbody>
                                                <tr>
                                                  <td align=""center"" style=""line-height: 24px; font-size: 16px; margin: 0; padding: 0 16px;"">
                                                    <table align=""center"" role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0""
                                                      style=""width: 100%; max-width: 80vw; margin: 0 auto;"">
                                                      <tbody>
                                                        <tr>
                                                          <td style=""line-height: 24px; font-size: 16px; margin: 0;"" align=""left"">
                                                            <table class=""s-10 w-full"" role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0""
                                                              style=""width: 100%;"" width=""100%"">
                                                              <tbody>
                                                                <tr>
                                                                  <td style=""line-height: 40px; font-size: 40px; width: 100%; height: 40px; margin: 0;""
                                                                    align=""left"" width=""100%"" height=""40"">
                                                                    &#160;
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            <table class=""s-10 w-full"" role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0""
                                                              style=""width: 100%;"" width=""100%"">
                                                              <tbody>
                                                                <tr>
                                                                  <td style=""line-height: 40px; font-size: 40px; width: 100%; height: 40px; margin: 0;""
                                                                    align=""left"" width=""100%"" height=""40"">
                                                                    &#160;
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                            <div style=""text-align: center; margin-bottom: 10px;"">
                                                            
                                                              <img
        src=""https://www.berca.co.id/wp-content/uploads/2019/09/logo_berca1.png""
        alt=""PT.Berca Hardayaperkasa"" class=""h3 fw-700"" align=""center""
                                                                    />
                                                            </div>

                                                            <table class=""card p-6 p-lg-10 space-y-4"" role=""presentation"" border=""0"" cellpadding=""0""
                                                              cellspacing=""0""
                                                              style=""border-radius: 6px; border-collapse: separate !important; width: 100%; overflow: hidden; border: 1px solid #e2e8f0;""
                                                              bgcolor=""#ffffff"">
                                                              <tbody>
                                                                <tr>
                                                                  <td style=""line-height: 24px; font-size: 16px; width: 100%; margin: 0; padding: 20px;text-align: center;""
                                                                    align=""left"" bgcolor=""#ffffff"">
                                                                    
                                                                        <h1 class=""h2 fw-700""
                                                                        style=""padding-top: 0; padding-bottom: 0; font-weight: 700 !important; vertical-align: baseline; font-size: 24px; line-height: 33.6px; margin: 0;""
                                                                        align=""center"">
                                                                        Undangan Tes Psikologi (Online)
                                                                      </h1>
                                                                    
                                                                      <table class=""s-4 w-full"" role=""presentation"" border=""0"" cellpadding=""0""
                                                                      cellspacing=""0"" style=""width: 100%;"" width=""100%"">
                                                                      <tbody>
                                                                        <tr>
                                                                          <td
                                                                            style=""line-height: 16px; font-size: 16px; width: 100%; height: 16px; margin: 0;""
                                                                            align=""left"" width=""100%"" height=""16"">
                                                                            &#160;
                                                                          </td>
                                                                        </tr>
                                                                      </tbody>
                                                                    </table>
                                                                    <table class=""s-4 w-full"" role=""presentation"" border=""0"" cellpadding=""0""
                                                                      cellspacing=""0"" style=""width: 100%;"" width=""100%"">
                                                                      <tbody>
                                                                        <tr>
                                                                          <td
                                                                            style=""line-height: 16px; font-size: 16px; width: 100%; height: 16px; margin: 0;""
                                                                            align=""left"" width=""100%"" height=""16"">
                                                                            &#160;
                                                                          </td>
                                                                        </tr>
                                                                      </tbody>
                                                                    </table>
                                                                    <p class="""" style=""line-height: 30px; font-size: 16px; width: 100%; margin: 0; font-weight: bold;""
                                                                      align=""left"">

                                                                      Dear Candidates,</p>
                                                                      <table class=""s-4 w-full"" role=""presentation"" border=""0"" cellpadding=""0""
                                                                      cellspacing=""0"" style=""width: 100%;"" width=""100%"">
                                                                      <tbody>
                                                                        <tr>
                                                                          <td
                                                                            style=""line-height: 16px; font-size: 16px; width: 100%; height: 16px; margin: 0;""
                                                                            align=""left"" width=""100%"" height=""16"">
                                                                            &#160;
                                                                          </td>
                                                                        </tr>
                                                                      </tbody>
                                                                    </table>
                                                                    <p class="""" style=""line-height: 24px; font-size: 16px; width: 100%; margin: 0;text-align:justify;""
                                                                      align=""left"">

                                                                      Terima kasih telah bersedia mengikuti rangkaian proses rekrutmen PT Berca Hardayaperkasa. Pada tahap ini, anda diminta untuk mengikuti proses psikotes secara online. Psikotes online dapat anda ikuti dengan klik tombol di bawah ini:
             
                                                                    </p>
                                                                    <table class=""s-4 w-full"" role=""presentation"" border=""0"" cellpadding=""0""
                                                                    cellspacing=""0"" style=""width: 100%;"" width=""100%"">
                                                                    <tbody>
                                                                      <tr>
                                                                        <td
                                                                          style=""line-height: 16px; font-size: 16px; width: 100%; height: 16px; margin: 0;""
                                                                          align=""left"" width=""100%"" height=""16"">
                                                                          &#160;
                                                                        </td>
                                                                      </tr>
                                                                    </tbody>
                                                                  </table><table class=""s-4 w-full"" role=""presentation"" border=""0"" cellpadding=""0""
                                                                  cellspacing=""0"" style=""width: 100%;"" width=""100%"">
                                                                  <tbody>
                                                                    <tr>
                                                                      <td
                                                                        style=""line-height: 16px; font-size: 16px; width: 100%; height: 16px; margin: 0;""
                                                                        align=""left"" width=""100%"" height=""16"">
                                                                        &#160;
                                                                      </td>
                                                                    </tr>
                                                                  </tbody>
                                                                </table>
                                                                    <p class="""" style=""line-height: 24px; font-size: 16px; width: 100%; margin: 0;""
                                                                      align=""center"">
                                                                      <a href='" + message.Link + @"'>
                                                                        <button>Masuk</button>
                                                                      </a>
                                                                    </p>
                                                                    <table class=""s-4 w-full"" role=""presentation"" border=""0"" cellpadding=""0""
                                                                    cellspacing=""0"" style=""width: 100%;"" width=""100%"">
                                                                    <tbody>
                                                                      <tr>
                                                                        <td
                                                                          style=""line-height: 16px; font-size: 16px; width: 100%; height: 16px; margin: 0;""
                                                                          align=""left"" width=""100%"" height=""16"">
                                                                          &#160;
                                                                        </td>
                                                                      </tr>
                                                                    </tbody>
                                                                  </table><table class=""s-4 w-full"" role=""presentation"" border=""0"" cellpadding=""0""
                                                                  cellspacing=""0"" style=""width: 100%;"" width=""100%"">
                                                                  <tbody>
                                                                    <tr>
                                                                      <td
                                                                        style=""line-height: 16px; font-size: 16px; width: 100%; height: 16px; margin: 0;""
                                                                        align=""left"" width=""100%"" height=""16"">
                                                                        &#160;
                                                                      </td>
                                                                    </tr>
                                                                  </tbody>
                                                                </table>
                                                                    <p class="""" style=""line-height: 16px; font-size: 16px; width: 100%; margin: 0;""
                                                                    align=""left"">
                                                                    Jika tombol diatas tidak berfungsi, copy and paste link dibawah ini ke browser anda :
                                                                    </p>
                                                                    <table class=""s-4 w-full"" role=""presentation"" border=""0"" cellpadding=""0""
                                                                  cellspacing=""0"" style=""width: 100%;"" width=""100%"">
                                                                  <tbody>
                                                                    <tr>
                                                                      <td
                                                                        style=""line-height: 16px; font-size: 16px; width: 100%; height: 16px; margin: 0;""
                                                                        align=""left"" width=""100%"" height=""16"">
                                                                        &#160;
                                                                      </td>
                                                                    </tr>
                                                                  </tbody>
                                                                </table>
                                                                    <p class="""" style=""line-height: 24px; font-size: 16px; width: 100%; margin: 0; color: blue;""
                                                                    align=""left"">

                                                                    <a href='" + message.Link + @"'>'" + message.Link + @"'</a>
                                                                  </p>
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                            <table class=""s-10 w-full"" role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0""
                                                              style=""width: 100%;"" width=""100%"">
                                                              <tbody>
                                                                <tr>
                                                                  <td style=""line-height: 40px; font-size: 40px; width: 100%; height: 40px; margin: 0;""
                                                                    align=""left"" width=""100%"" height=""40"">
                                                                    &#160;
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>

                                                            <div class=""text-muted text-center"" style=""color: #000000; font-weight: bold; font-size: 12px;"" align=""center"" >
                                                              PSIKOTES ONLINE INI SIFATNYA CONFIDENTIAL, MOHON UNTUK TIDAK DISEBAR LUASKAN!!!<br>
                                                              <p style=""color: red;margin: 0;"">HATI-HATI PENIPUAN!!</p>
                                                              
                                                            </div>
                                                            <table class=""s-6 w-full"" role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0""
                                                              style=""width: 100%;"" width=""100%"">
                                                              <tbody>
                                                                <tr>
                                                                  <td style=""line-height: 24px; font-size: 24px; width: 100%; height: 24px; margin: 0;""
                                                                    align=""left"" width=""100%"" height=""24"">
                                                                    &#160;
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </body>

                                  </html>";

            var profile = configuration["EmailConfiguration:Profil"];
            int? result = null;
            try
            {
                using (var connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    using (var command = connection.CreateCommand())
                    {
                        command.CommandText = "EXEC [dbo].[SendEmail] @Recepient, @Subject, @Body, @Profil";
                        command.Parameters.AddWithValue("@Recepient", message.To);
                        command.Parameters.AddWithValue("@Subject", message.Subject);
                        command.Parameters.AddWithValue("@Body", bodyEmail);
                        command.Parameters.AddWithValue("@Profil", profile);

                        await command.ExecuteNonQueryAsync();

                        result = 1;
                    }

                    if (connection != null && connection.State == ConnectionState.Open)
                    {
                        connection.Close();
                    }
                }
            }
            catch (Exception ex)
            {
                // Tangkap dan tangani pengecualian
                Console.WriteLine($"Exception: {ex.Message}");
                throw; 
            }
            
            return result;

        }

        public async Task<int?> SendEmailForgotPassword(SendEmailDBMail message)
        {
            var bodyEmail = @"<html>

                                        <head>
                                          <meta http-equiv=""Content-Type"" content=""text/html; charset=utf-8"">
                                          <meta http-equiv=""x-ua-compatible"" content=""ie=edge"">
                                          <meta name=""x-apple-disable-message-reformatting"">
                                          <meta name=""viewport"" content=""width=device-width, initial-scale=1"">
                                          <meta name=""format-detection"" content=""telephone=no, date=no, address=no, email=no"">
                                          <style type=""text/css"">
                                            body,
                                            table,
                                            td {
                                              font-family: Helvetica, Arial, sans-serif !important
                                            }

                                            .ExternalClass {
                                              width: 100%
                                            }

                                            .ExternalClass,
                                            .ExternalClass p,
                                            .ExternalClass span,
                                            .ExternalClass font,
                                            .ExternalClass td,
                                            .ExternalClass div {
                                              line-height: 150%
                                            }
                                            .forbutton {
        padding: 1vh 0 1vh 0;
        text-align: center;
        font-size: 14px;
      }
      .forbutton a {
        text-decoration: none;
        color: white;
        text-transform: capitalize;
      }
      .forbutton a button {
        width: 45%;
        height: 7vh;
        background-color: blue;
        color: white;
        border-radius: 8px;
        border: none;
        text-transform: capitalize;
        font-size: small;
      }
                                            a {
                                              text-decoration: none
                                            }

                                            * {
                                              color: inherit
                                            }

                                            a[x-apple-data-detectors],
                                            u+#body a,
                                            #MessageViewBody a {
                                              color: inherit;
                                              text-decoration: none;
                                              font-size: inherit;
                                              font-family: inherit;
                                              font-weight: inherit;
                                              line-height: inherit
                                            }

                                            img {
                                              -ms-interpolation-mode: bicubic
                                            }

                                            table:not([class^=s-]) {
                                              font-family: Helvetica, Arial, sans-serif;
                                              mso-table-lspace: 0pt;
                                              mso-table-rspace: 0pt;
                                              border-spacing: 0px;
                                              border-collapse: collapse
                                            }

                                            table:not([class^=s-]) td {
                                              border-spacing: 0px;
                                              border-collapse: collapse
                                            }

                                            @media screen and (max-width: 600px) {

                                              .w-full,
                                              .w-full>tbody>tr>td {
                                                width: 100% !important
                                              }

                                              .w-24,
                                              .w-24>tbody>tr>td {
                                                width: 96px !important
                                              }

                                              .w-40,
                                              .w-40>tbody>tr>td {
                                                width: 160px !important
                                              }

                                              .p-lg-10:not(table),
                                              .p-lg-10:not(.btn)>tbody>tr>td,
                                              .p-lg-10.btn td a {
                                                padding: 0 !important
                                              }

                                              .p-3:not(table),
                                              .p-3:not(.btn)>tbody>tr>td,
                                              .p-3.btn td a {
                                                padding: 12px !important
                                              }

                                              .p-6:not(table),
                                              .p-6:not(.btn)>tbody>tr>td,
                                              .p-6.btn td a {
                                                padding: 24px !important
                                              }

                                              [class=s-lg-]>tbody>tr>td {
                                                font-size: 0 !important;
                                                line-height: 0 !important;
                                                height: 0 !important
                                              }

                                              .s-4>tbody>tr>td {
                                                font-size: 16px !important;
                                                line-height: 16px !important;
                                                height: 16px !important
                                              }

                                              .s-6>tbody>tr>td {
                                                font-size: 24px !important;
                                                line-height: 24px !important;
                                                height: 24px !important
                                              }

                                              .s-10>tbody>tr>td {
                                                font-size: 40px !important;
                                                line-height: 40px !important;
                                                height: 40px !important
                                              }
                                            }
                                          </style>
                                        </head>

                                        <body class=""bg-light""
                                          style=""outline: 0; width: 100%; min-width: 100%; height: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Helvetica, Arial, sans-serif; line-height: 24px; font-weight: normal; font-size: 16px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #000000; margin: 0; padding: 0; border-width: 0;""
                                          bgcolor=""#f7fafc"">
                                          <table class=""bg-light body"" valign=""top"" role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0""
                                            style=""outline: 0; width: 100%; min-width: 100%; height: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Helvetica, Arial, sans-serif; line-height: 24px; font-weight: normal; font-size: 16px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #000000; margin: 0; padding: 0; border-width: 0;""
                                            bgcolor=""#f7fafc"">
                                            <tbody>
                                              <tr>
                                                <td valign=""top"" style=""line-height: 24px; font-size: 16px; margin: 0;"" align=""left"" bgcolor=""#f7fafc"">
                                                  <table class=""container"" role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0"" style=""width: 100%;"">
                                                    <tbody>
                                                      <tr>
                                                        <td align=""center"" style=""line-height: 24px; font-size: 16px; margin: 0; padding: 0 16px;"">
                                                          <table align=""center"" role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0""
                                                            style=""width: 100%; max-width: 600px; margin: 0 auto;"">
                                                            <tbody>
                                                              <tr>
                                                                <td style=""line-height: 24px; font-size: 16px; margin: 0;"" align=""left"">
                                                                  <table class=""s-10 w-full"" role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0""
                                                                    style=""width: 100%;"" width=""100%"">
                                                                    <tbody>
                                                                      <tr>
                                                                        <td style=""line-height: 40px; font-size: 40px; width: 100%; height: 40px; margin: 0;""
                                                                          align=""left"" width=""100%"" height=""40"">
                                                                          &#160;
                                                                        </td>
                                                                      </tr>
                                                                    </tbody>
                                                                  <div style=""text-align: center; margin-bottom: 10px;"">
                                                                  <img
              src=""https://www.berca.co.id/wp-content/uploads/2019/09/logo_berca1.png""
              alt=""PT.Berca Hardayaperkasa"" class=""h3 fw-700""
                                                                            style=""padding-top: 0; padding-bottom: 0; font-weight: 700 !important; vertical-align: baseline; font-size: 28px; line-height: 33.6px; margin: 0 auto;""
                                                                            align=""center""
                                                                          />
                                                                  </div>

                                                                  <table class=""card p-6 p-lg-10 space-y-4"" role=""presentation"" border=""0"" cellpadding=""0""
                                                                    cellspacing=""0""
                                                                    style=""border-radius: 6px; border-collapse: separate !important; width: 100%; overflow: hidden; border: 1px solid #e2e8f0;""
                                                                    bgcolor=""#ffffff"">
                                                                    <tbody>
                                                                      <tr>
                                                                        <td style=""line-height: 24px; font-size: 16px; width: 100%; margin: 0; padding: 40px;text-align: center;""
                                                                          align=""left"" bgcolor=""#ffffff"">
                                                                          
                                                                          <h1 class=""h2 fw-700""
                                                                            style=""padding-top: 0; padding-bottom: 0; font-weight: 700 !important; vertical-align: baseline; font-size: 28px; line-height: 33.6px; margin: 0;""
                                                                            align=""center"">
                                                                            RESET PASSWORD
                                                                          </h1>
                                                                          <table class=""s-4 w-full"" role=""presentation"" border=""0"" cellpadding=""0""
                                                                            cellspacing=""0"" style=""width: 100%;"" width=""100%"">
                                                                            <tbody>
                                                                              <tr>
                                                                                <td
                                                                                  style=""line-height: 16px; font-size: 16px; width: 100%; height: 16px; margin: 0;""
                                                                                  align=""left"" width=""100%"" height=""16"">
                                                                                  &#160;
                                                                                </td>
                                                                              </tr>
                                                                            </tbody>
                                                                          </table>
                                                                          <p class="""" style=""line-height: 30px; font-size: 16px; width: 100%; margin: 0; font-weight: bold;""
                                                                            align=""center"">

                                                                            someone request that the password be reset for the following Account:</p>
                                                                            <table class=""s-4 w-full"" role=""presentation"" border=""0"" cellpadding=""0""
                                                                            cellspacing=""0"" style=""width: 100%;"" width=""100%"">
                                                                            <tbody>
                                                                              <tr>
                                                                                <td
                                                                                  style=""line-height: 16px; font-size: 16px; width: 100%; height: 16px; margin: 0;""
                                                                                  align=""left"" width=""100%"" height=""16"">
                                                                                  &#160;
                                                                                </td>
                                                                              </tr>
                                                                            </tbody>
                                                                          </table>
                                                                          <p class="""" style=""line-height: 24px; font-size: 16px; width: 100%; margin: 0;""
                                                                            align=""center"">

                                                                            To Reset Your Password, Click Link Below:
                   
                                                                          </p>

                                                                          <p class="""" style=""line-height: 24px; font-size: 16px; width: 100%; margin: 0;""
                                                                            align=""left"">
                                                                            <a href='" + message.Link + @"'>
                                                                              '" + message.Link + @"'
                                                                            </a>
                                                                          </p>
                                                                          <table class=""s-4 w-full"" role=""presentation"" border=""0"" cellpadding=""0""
                                                                          cellspacing=""0"" style=""width: 100%;"" width=""100%"">
                                                                          <tbody>
                                                                            <tr>
                                                                              <td
                                                                                style=""line-height: 16px; font-size: 16px; width: 100%; height: 16px; margin: 0;""
                                                                                align=""left"" width=""100%"" height=""16"">
                                                                                &#160;
                                                                              </td>
                                                                            </tr>
                                                                          </tbody>
                                                                        </table><table class=""s-4 w-full"" role=""presentation"" border=""0"" cellpadding=""0""
                                                                        cellspacing=""0"" style=""width: 100%;"" width=""100%"">
                                                                        <tbody>
                                                                          <tr>
                                                                            <td
                                                                              style=""line-height: 16px; font-size: 16px; width: 100%; height: 16px; margin: 0;""
                                                                              align=""left"" width=""100%"" height=""16"">
                                                                              &#160;
                                                                            </td>
                                                                          </tr>
                                                                        </tbody>
                                                                      </table>
                                                                          <p class="""" style=""line-height: 16px; font-size: 12px; width: 100%; margin: 0;""
                                                                          align=""center"">
                                                                          If You Didn't Request A Password Reset, Just Ignore This Email. Your Password Will Not Be Changed
                             
                                                                          </p>

                                                                        </td>
                                                                      </tr>
                                                                    </tbody>
                                                                  </table>
                                                                  <table class=""s-10 w-full"" role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0""
                                                                    style=""width: 100%;"" width=""100%"">
                                                                    <tbody>
                                                                      <tr>
                                                                        <td style=""line-height: 40px; font-size: 40px; width: 100%; height: 40px; margin: 0;""
                                                                          align=""left"" width=""100%"" height=""40"">
                                                                          &#160;
                                                                        </td>
                                                                      </tr>
                                                                    </tbody>
                                                                  </table>

                                                                  <table class=""s-6 w-full"" role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0""
                                                                    style=""width: 100%;"" width=""100%"">
                                                                    <tbody>
                                                                      <tr>
                                                                        <td style=""line-height: 24px; font-size: 24px; width: 100%; height: 24px; margin: 0;""
                                                                          align=""left"" width=""100%"" height=""24"">
                                                                          &#160;
                                                                        </td>
                                                                      </tr>
                                                                    </tbody>
                                                                  </table>
                                                                  <table class=""s-6 w-full"" role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0""
                                                                    style=""width: 100%;"" width=""100%"">
                                                                    <tbody>
                                                                      <tr>
                                                                        <td style=""line-height: 24px; font-size: 24px; width: 100%; height: 24px; margin: 0;""
                                                                          align=""left"" width=""100%"" height=""24"">
                                                                          &#160;
                                                                        </td>
                                                                      </tr>
                                                                    </tbody>
                                                                  </table>
                                                                </td>
                                                              </tr>
                                                            </tbody>
                                                          </table>
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </body>

                                        </html>";

            var profile = configuration["EmailConfiguration:Profil"];

            int? result = null;
            try
            {
                using (var connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    using (var command = connection.CreateCommand())
                    {
                        command.CommandText = "EXEC [dbo].[SendEmail] @Recepient, @Subject, @Body, @Profil";
                        command.Parameters.AddWithValue("@Recepient", message.To);
                        command.Parameters.AddWithValue("@Subject", message.Subject);
                        command.Parameters.AddWithValue("@Body", bodyEmail);
                        command.Parameters.AddWithValue("@Profil", profile);

                        await command.ExecuteNonQueryAsync();

                        result = 1;
                    }

                    if (connection != null && connection.State == ConnectionState.Open)
                    {
                        connection.Close();
                    }
                }
            }
            catch (Exception ex)
            {
                // Tangkap dan tangani pengecualian
                Console.WriteLine($"Exception: {ex.Message}");
                throw;
            }

            return result;

        }

    }
}
