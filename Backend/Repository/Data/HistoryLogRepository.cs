using Backend.Context;
using Backend.Models;
using Backend.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository.Data
{
    public class HistoryLogRepository : GeneralRepository<RasPsychotestBercaContext, TblHistoryLog, int>
    {
        private readonly RasPsychotestBercaContext context;
        public HistoryLogRepository(RasPsychotestBercaContext context) : base(context)
        {
            this.context = context;
        }

        public const int Successful = 1;
        public const int IdAccountExist = 2;
        public const int Error = 500;

        public override IEnumerable<TblHistoryLog> Get()
        {
            return context.TblHistoryLogs.Include(h => h.Account).Include(r=>r.Account.Role).OrderByDescending(h=>h.Timestamp).ToList();
        }

        public int InsertHistory(HistoryLogVM historyLogVM)
        {
            TblHistoryLog his = new TblHistoryLog
            {
                Activity = historyLogVM.Activity,
                Timestamp = historyLogVM.Timestamp,
                Account = new TblAccount { AccountId = historyLogVM.AccountId }
            };

            context.Entry(his).State = EntityState.Added;
            context.SaveChanges();
            return Successful;
        }
    }
}