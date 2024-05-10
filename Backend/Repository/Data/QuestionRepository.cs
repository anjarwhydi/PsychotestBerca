using Backend.Context;
using Backend.Models;
using Backend.ViewModels;
using DocumentFormat.OpenXml.InkML;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using System.Net;

namespace Backend.Repository.Data
{
    public class QuestionRepository : GeneralRepository<RasPsychotestBercaContext, TblQuestionTest, int>
    {
        public readonly RasPsychotestBercaContext context;
        public QuestionRepository(RasPsychotestBercaContext context) : base(context)
        {
            this.context = context;
        }

        public IEnumerable<TblQuestionTest> GetQuestionByTest(int tesId)
        {
            return context.TblQuestionTests.Include(e => e.Test).Include(e => e.TblMultipleChoices).Where(e => e.TestId == tesId);
        }

        public async Task<List<QuestionViewModel>> GetQuestionByTesto(int idTest, int currentNumber, int pageSize)
        {
            try
            {
                // Hitung jumlah total data
                int totalData = await context.TblQuestionTests
                    .Where(q => q.TestId == idTest)
                    .CountAsync();

                // Hitung skip (berdasarkan nomor indeks)
                int skip = (currentNumber - 1);

                // Pertama, kita akan mengambil Question_ID yang sesuai berdasarkan test_id == 4
                string questionIdQuery = @"
                    SELECT Question_ID
                    FROM Tbl_Question_Test
                    WHERE Test_ID = @idTest
                    ORDER BY Question_ID
                    OFFSET @skip ROWS FETCH NEXT @pageSize ROWS ONLY";

                var idTestParam = new SqlParameter("@idTest", idTest);
                var skipParam = new SqlParameter("@skip", skip);
                var pageSizeParam = new SqlParameter("@pageSize", pageSize);

                var questionIds = await context.TblQuestionTests
                    .FromSqlRaw(questionIdQuery, idTestParam, skipParam, pageSizeParam)
                    .Select(q => q.QuestionId)
                    .ToListAsync();

                string result = string.Join(", ", questionIds);

                // Mengonversi questionIds ke dalam format yang sesuai untuk klausa IN
                var questionIdsParam = new SqlParameter("@questionIds", string.Join(",", questionIds));

                Console.WriteLine($"@questionIds: {string.Join(",", questionIds)}");

                // Kemudian, kita akan menggunakan Question_ID yang diambil sebelumnya untuk mengambil data yang sesuai
                string sqlQuery = @"
                    SELECT qt.Question_ID, qt.Question_Desc, qt.Test_ID, mc.Multiple_Choice_Desc
                    FROM Tbl_Question_Test qt
                    INNER JOIN Tbl_Multiple_Choice mc ON qt.Question_ID = mc.Question_ID
                    WHERE 
                        qt.Test_ID = @idTest 
                        AND 
                        qt.Question_ID IN (" + result+")";


                var questions = await context.TblQuestionTests
                .Where(q => q.TestId == idTest && questionIds.Contains(q.QuestionId))
                .Include(q => q.TblMultipleChoices)
                .Select(q => new QuestionViewModel
                {
                    Question_ID = q.QuestionId,
                    Question_Desc = q.QuestionDesc,
                    Test_ID = q.TestId,
                    TblMultipleChoices = q.TblMultipleChoices.Select(mc => new TblMultipleChoiceViewModel
                    {
                        Multiple_Choice_Desc = mc.MultipleChoiceDesc
                    }).ToList()
                })
                .ToListAsync();


                return questions;
            }
            catch (Exception ex)
            {
                // Tangani kesalahan jika terjadi
                throw new Exception("Terjadi kesalahan saat mengambil data dari database.", ex);
            }
        }
        
    }
}
