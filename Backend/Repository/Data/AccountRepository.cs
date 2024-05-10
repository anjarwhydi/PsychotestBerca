using Backend.Models;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using Backend.ViewModels;
using Backend.Context;

namespace Backend.Repository.Data
{
    public class AccountRepository : GeneralRepository<RasPsychotestBercaContext, TblAccount, int>
    {
        private readonly IConfiguration configuration;
        public readonly RasPsychotestBercaContext context;
        public AccountRepository(RasPsychotestBercaContext context, IConfiguration configuration) : base(context)
        {
            this.context = context;
            this.configuration = configuration;
        }

        public const int Successful = 1;
        public const int EmailExists = 2;
        public const int Error = 500;

        public IEnumerable<TblAccount> Login()
        {
            return context.TblAccounts.Include(e => e.Role).Where(e=> e.IsDeleted == false);
        }


        public override IEnumerable<TblAccount> Get()
        {
            return context.TblAccounts
                .Include(a => a.Role);
        }

        public IEnumerable<TblAccount> GetById(int id)
        {
            return context.TblAccounts
                .Where(e => e.AccountId == id)
                .ToList(); // Ubah menjadi ToList() untuk mengembalikan koleksi
        }
        public int UsingSoftDel(int id)
        {
            var del = context.TblAccounts.FirstOrDefault(a => a.AccountId == id);
            if (del != null)
            {
                del.IsDeleted = true;
                context.Entry(del).State = EntityState.Modified;
                return context.SaveChanges();
            }
            return 0;
        }

        public int RegisterAdmin(UserRoleVM userRoleVM)
        {
            var checkEmail = context.TblAccounts.SingleOrDefault(e => e.Email == userRoleVM.Email);
            if (checkEmail != null)
            {
                return EmailExists;
            }
            else if (checkEmail == null)
            {
                TblAccount acc = new TblAccount
                {
                    Name = userRoleVM.Name,
                    Email = userRoleVM.Email.ToLower(),
                    Password = BCrypt.Net.BCrypt.HashPassword(userRoleVM.Password),
                    Role = new TblRole { RoleId = userRoleVM.RoleId },
                    IsDeleted = false
                };

                context.Entry(acc).State = EntityState.Added;
                context.SaveChanges();
                return Successful;
            }
            else
            {
                return 500;
            }
        }

        public int DuplicateEmailCheck(string Email)
        {
            var checkEmail = context.TblAccounts.Include(a => a.Role).SingleOrDefault(a => a.Email == Email && a.Role.RoleName != "Participant");
            if (checkEmail != null)
            {
                return EmailExists;
            } else if (checkEmail == null)
            {
                return Successful;
            } else
            {
                return 500;
            }
        }


        public int RegisterParticipant(TblAccount account)
        {
            var emailChecker = new System.ComponentModel.DataAnnotations.EmailAddressAttribute();
            if (!emailChecker.IsValid(account.Email))
                return -1;
            if (context.TblAccounts.Select(a => a.Email).Contains(account.Email))
                return -2;
            if (account.Password.Length < 8)
                return -3;
            if (!context.TblRoles.Select(a => a.RoleId).Contains(account.RoleId))
                return -4;
            else
            {
                context.Entry(account).State = EntityState.Added;
                context.SaveChanges();
                return Successful;
            }
        }

        public int DuplicateEmailCheckPar(string Email)
        {
            var checkEmail = context.TblAccounts.Include(a => a.Role).SingleOrDefault(a => a.Email == Email && a.Role.RoleName == "Participant");
            if (checkEmail != null)
            {
                return EmailExists;
            }
            else if (checkEmail == null)
            {
                return Successful;
            }
            else
            {
                return 500;
            }
        }

        public int UpdateParAccount(TblAccount tblAccount)
        {
            var existingAccount = context.TblAccounts.FirstOrDefault(a => a.AccountId == tblAccount.AccountId);
            if (existingAccount != null)
            {
                existingAccount.Name = tblAccount.Name;
                existingAccount.Email = tblAccount.Email;
                context.Entry(existingAccount).State = EntityState.Modified;
                return context.SaveChanges();
            }
            return 0;
        }

        public int RecoverPassword(TblAccount tblAccount)
        {
            var existId = context.TblAccounts.FirstOrDefault(e => e.AccountId == tblAccount.AccountId);
            if (existId != null)
            {
                existId.Password = BCrypt.Net.BCrypt.HashPassword(tblAccount.Password);
                context.Entry(existId).State = EntityState.Modified;
                return context.SaveChanges();
            }
            return 0;
        }

        public IEnumerable<TblAccount> GetAdmin()
        {
            return context.TblAccounts
                .Include(a => a.Role)
                .Where(a => a.Role.RoleName != "Participant")
                .Where(a => a.Role.RoleName != "Super Admin")
                .Where(a=> a.IsDeleted == false);
        }
    }
}
