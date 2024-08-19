using Backend.Context;
using Backend.Models;
using Backend.Repository.Interface;
using Backend.ViewModels;
using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Configuration;
using System.Data.SqlClient;
using System.Net;

namespace Backend.Repository.Data
{
    public class ParticipantAnswerRepository : GeneralRepository<RasPsychotestBercaContext, TblParticipantAnswer, int>
    {
        private readonly RasPsychotestBercaContext context;
        private readonly string connectionString;
        public ParticipantAnswerRepository(RasPsychotestBercaContext context, IConfiguration configuration) : base(context)
        {
            this.context = context;
            this.connectionString = configuration.GetConnectionString("PsychotestContext");
        }

        //kode check duplikat
        public int InsertParticipantAnswer(ParticipantAnswerVM participantanswerVM)
        {
            // Check duplikat
            bool hasDuplicate = context.TblParticipantAnswers
                .Any(pa => pa.ParticipantId == participantanswerVM.ParticipantId && pa.TestId == participantanswerVM.TestId);

            if (hasDuplicate)
            {
               
                return -1; //  duplicate case
            }

            TblParticipantAnswer acc = new TblParticipantAnswer
            {
                ParticipantId = participantanswerVM.ParticipantId,
                Answer = participantanswerVM.Answer,
                FinalScore = participantanswerVM.FinalScore,
                CapturePicture = participantanswerVM.CapturePicture,
                Status = participantanswerVM.Status,
                TestId = participantanswerVM.TestId,

                Participant = new TblParticipant { ParticipantId = participantanswerVM.ParticipantId },
                Test = new TblTest { TestId = participantanswerVM.TestId }
            };

            context.Entry(acc).State = EntityState.Added;
            return context.SaveChanges();
        }


        public IEnumerable<TblParticipantAnswer> GetAnswareByTest(int participantId,int tesId)
        {
            return context.TblParticipantAnswers.Where(e => e.ParticipantId == participantId && e.TestId == tesId);
        }

        public IEnumerable<TblParticipantAnswer> GetByParticipantId(int participantId)
        {
            return context.TblParticipantAnswers.Where(e => e.ParticipantId == participantId);
        }

        //zahra 29-08-2023
        public IEnumerable<TblParticipantAnswer> GetAnswareByParticipantId(int participantId)
        {
            return context.TblParticipantAnswers.Where(e => e.ParticipantId == participantId).Include(e=>e.Participant).Include(e=>e.Participant.Account);
        }

        public int UpdateAnswer(TblAppliedPosition tblAppliedPosition)
        {
            //mencari JobPosition di database
            var checkJob = context.TblAppliedPositions.Where(d => d.AppliedPosition == tblAppliedPosition.AppliedPosition).FirstOrDefault();
            if (checkJob != null)
            {
                return 0; // Jika nama department sudah ada, return 0
            }
            context.TblAppliedPositions.Update(tblAppliedPosition);
            //context.Entry(checkJob).State = EntityState.Modified;
            var saved = context.SaveChanges();
            return saved;
        }

        public int StoredAnswer(SavedAnswerVM savedAnswerVM)
        {
            var acc = context.TblParticipantAnswers.FirstOrDefault(a => a.ParticipantId == savedAnswerVM.participant_id && a.TestId == savedAnswerVM.test_id);
            if (acc != null)
            {
                acc.CapturePicture = savedAnswerVM.capture;
                acc.Answer = savedAnswerVM.answer;
                acc.Status = savedAnswerVM.status;
                acc.FinalScore = savedAnswerVM.final_score;

                context.Entry(acc).State = EntityState.Modified;
                return context.SaveChanges();
            }
            return 0;
        }

        public TblParticipantAnswer GetParticipantAnswerById(int id)
        {
            return context.TblParticipantAnswers
                .Include(p => p.Participant)
                .Include(a => a.Participant.Account)
                .FirstOrDefault(p => p.ParticipantAnswareId == id);
        }

        public int DeleteParticipantAns(int participantId)
        {
            var itemsToDelete = context.TblParticipantAnswers.Where(e => e.ParticipantId == participantId).ToList();

            if (itemsToDelete.Any())
            {
                context.TblParticipantAnswers.RemoveRange(itemsToDelete);
                int numberOfDeletedItems = itemsToDelete.Count;
                context.SaveChanges();
                return numberOfDeletedItems;
            }

            return 404;
        }

        public IEnumerable<object> GetCheckViolationResult(int participantId)
        {
            var selectedData = context.TblParticipantAnswers
                .Where(e => e.ParticipantId == participantId)
                .AsEnumerable() // Bawa data ke memori
                .Select(e => new
                {
                    e.ParticipantAnswareId,
                    e.ParticipantId,
                    FinalScore = e.FinalScore != null? e.FinalScore.Split(',').Last().Trim(): null})
                .ToList();
            //FinalScore = e.FinalScore != null ? e.FinalScore.Substring(e.FinalScore.Length - 1) : null}).ToList();

            if (selectedData.Any())
            {
                return selectedData;
            }
            else
            {
                // Tidak ada data yang sesuai, kembalikan status 404
                throw new Exception("Data not found");
            }
        }

        /*public IEnumerable<int> countStatusComplete()
        {
            return context.TblParticipantAnswers.Where(p => p.Status == false).Select(p=>(p.TestId, p.tblp)); ;
        }*/

        public IEnumerable<object> UpdateCreateDatePerTest(CreateDateParticipantAnswerVM objEntity)
        {
            List<object> updatedEntities = new List<object>();

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                string query = "UPDATE dbo.Tbl_Participant_Answer SET CreateDate = @CreateDate WHERE Participant_ID = @Participant_ID AND Test_ID = @Test_ID";

                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@CreateDate", DateTime.Now);
                    command.Parameters.AddWithValue("@Participant_ID", objEntity.Participant_ID);
                    command.Parameters.AddWithValue("@Test_ID", objEntity.Test_ID);

                    connection.Open();
                    int rowsAffected = command.ExecuteNonQuery();
                    connection.Close();

                    if (rowsAffected > 0)
                    {
                        updatedEntities.Add(new { Participant_ID = objEntity.Participant_ID, Test_ID = objEntity.Test_ID });
                    }
                }
            }

            return updatedEntities;
        }

        public async Task<CreateDateParticipantAnswerVM> GetCreateDateByParticipantAnswerIdAsync(int participantAnswerId)
        {
            CreateDateParticipantAnswerVM createDate = null;

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                string query = "SELECT CreateDate FROM dbo.Tbl_Participant_Answer WHERE Participant_Answare_ID = @ParticipantAnswerId";

                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@ParticipantAnswerId", participantAnswerId);

                    await connection.OpenAsync();

                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            var formattedDate = reader.GetDateTime(0).ToString("dd MMMM yyyy, HH:mm:ss");
                            createDate = new CreateDateParticipantAnswerVM
                            {
                                CreateDate = formattedDate
                            };
                        }
                    }
                }
            }

            return createDate;
        }

        public IEnumerable<TblParticipantAnswer> GetAnswareByParticipantNik(string participantNik)
        {
            return context.TblParticipantAnswers.Where(e => e.Participant.Nik == participantNik).Include(e => e.Participant).Include(e => e.Participant.Account);
        }
    }
}
