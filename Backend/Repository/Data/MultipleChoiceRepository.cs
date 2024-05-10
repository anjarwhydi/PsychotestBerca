using Backend.Context;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository.Data
{
    public class MultipleChoiceRepository : GeneralRepository<RasPsychotestBercaContext, TblMultipleChoice, int>
    {
        public readonly RasPsychotestBercaContext context;
        public MultipleChoiceRepository(RasPsychotestBercaContext context) : base(context)
        {
            this.context = context;
        }

        public IEnumerable<TblMultipleChoice> GetChoiceByQuestion(int Id)
        {
            return context.TblMultipleChoices.Include(e => e.Question).Where(e => e.QuestionId == Id);
        }

        public int UpdateMul(TblMultipleChoice tblMultipleChoice)
        {
            context.Entry(tblMultipleChoice).State = EntityState.Modified;
            var save = context.SaveChanges();
            return save;
        }
    }
}
