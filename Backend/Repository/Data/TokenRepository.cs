using Backend.Context;
using Backend.Models;
using Backend.ViewModel;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository.Data
{
    public class TokenRepository : GeneralRepository<RasPsychotestBercaContext, TblToken, int>
    {
        private readonly RasPsychotestBercaContext context;
        public TokenRepository(RasPsychotestBercaContext context) : base(context)
        {
            this.context = context;
        }

        public TblToken checkToken(string token)
        {
            return context.TblTokens.FirstOrDefault(e=> e.Linked == token);
        }
    }
}
