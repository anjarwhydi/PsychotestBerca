using Backend.Context;
using Backend.Models;

using Backend.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository.Data
{
    public class TestCategoryRepository : GeneralRepository<RasPsychotestBercaContext, TblTestCategory, int>
    {
        private readonly RasPsychotestBercaContext context;
        public TestCategoryRepository(RasPsychotestBercaContext context) : base(context)
        {
            this.context = context;
        }

        public const int Successful = 1;
        public const int LevelExists = 2;
        public const int Error = 500;

        public int InsertTestCategory(TestCategoryVM testCategoryVM)
        {
            var checkLevel = context.TblTestCategories.SingleOrDefault(e => e.LevelCategory == testCategoryVM.LevelCategory);
            if (checkLevel != null)
            {
                return LevelExists;
            }
            else if (checkLevel == null)
            {
                TblTestCategory acc = new TblTestCategory
                {
                    LevelCategory = testCategoryVM.LevelCategory,
                    TestKit = testCategoryVM.TestKit
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

        public bool CheckParticipant(int CatId)
        {
            var par = context.TblParticipants.FirstOrDefault(p => p.TestCategoryId == CatId);
            if (par == null)
            {
                return false;
            }
            return true;
        }

        //get Level, Test Name
        //public IEnumerable<Object>? GetRows()
        //{
        //    var myobject = (from e in context.TblTests
        //                    join d in context.TblTestCategories
        //                    on e.TestCategoryId equals d.TestCategoryId
        //                    select new
        //                    {
        //                        Level = d.LevelCategory,
        //                        TestName = e.TestName
        //                    });
        //    if (myobject.Count() != 0)
        //    {
        //        return myobject.ToList();
        //    }
        //    return null;
        //}
    }
}
