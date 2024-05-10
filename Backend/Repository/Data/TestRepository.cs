using Backend.Context;
using Backend.Models;
using Backend.ViewModel;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository.Data
{
    public class TestRepository : GeneralRepository<RasPsychotestBercaContext, TblTest, int>
    {
        private readonly RasPsychotestBercaContext context;
        public TestRepository(RasPsychotestBercaContext context) : base(context)
        {
            this.context = context;
        }

        public const int Successful = 1;
        public const int LevelExists = 2;
        public const int Error = 500;

        //public int InsertTest(TestVM testVM)
        //{
        //    var checkName = context.TblTests.SingleOrDefault(e => e.TestName == testVM.TestName);
        //    if (checkName != null)
        //    {
        //        return LevelExists;
        //    }
        //    else if (checkName == null)
        //    {
        //        TblTest acc = new TblTest
        //        {
        //            TestName = testVM.TestName,
        //            TestTime = testVM.TestTime,
        //            TotalQuestion = testVM.TotalQuestion,
        //            TestCategory = new TblTestCategory { TestCategoryId = testVM.TestCategoryId }
        //        };
        //        context.Entry(acc).State = EntityState.Added;
        //        context.SaveChanges();
        //        return Successful;
        //    }
        //    else
        //    {
        //        return 500;
        //    }

        //}


    }
}
