
using Backend.Context;
using Backend.Controllers;
using Backend.Models;
using Backend.Repository.Data;
using Backend.ViewModels;
using EmailService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using System.Net;

namespace backend_unit_test
{
    public class AccountsControllerTests
    {
       
        [Fact]
        public void GetAdmin_ReturnsData_WhenDataExists()
        {
            // Arrange
            var contextMock = new Mock<RasPsychotestBercaContext>();
            var configurationMock = new Mock<IConfiguration>();
            var accountRepository = new AccountRepository(contextMock.Object, configurationMock.Object);

            var httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            var controller = new AccountsController(accountRepository, configurationMock.Object, httpContextAccessorMock.Object, It.IsAny<IEmailSender>());


            var adminData = GetAccountData();

            contextMock.Setup(repo => repo.TblAccounts).Returns(MockDbSet(adminData));


            // Act
            var result = controller.GetAdmin() as ObjectResult;

            // Assert
            Assert.IsType<ObjectResult>(result);
            var okResult = result as ObjectResult;
                Assert.NotNull(okResult);
                Assert.Equal(200, okResult.StatusCode);
        }

        [Fact]
        public void RecoverPassword_ReturnsSuccess_WhenValidData()
        {
            // Arrange
            var accountId = 1;
            var recoverPasswordVM = new RecoverPasswordVM
            {
                AccountId = accountId,
                Password = "newPassword",
                RePassword = BCrypt.Net.BCrypt.HashPassword("123456")
            };

            var accountRepositoryMock = new Mock<AccountRepository>();
            var configurationMock = new Mock<IConfiguration>();
            var httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            var emailSenderMock = new Mock<IEmailSender>();

            var controller = new AccountsController(accountRepositoryMock.Object, configurationMock.Object, httpContextAccessorMock.Object, emailSenderMock.Object);

            accountRepositoryMock.Setup(repo => repo.Get(accountId)).Returns(new TblAccount { AccountId = accountId });
            accountRepositoryMock.Setup(repo => repo.RecoverPassword(It.IsAny<TblAccount>())).Returns(1);

            // Act
            var result = controller.RecoverPassword(recoverPasswordVM) as ObjectResult;

            // Assert
            Assert.IsType<ObjectResult>(result);

            var okResult = result as ObjectResult;
            Assert.NotNull(okResult);
            Assert.Equal(202, okResult.StatusCode);
            Assert.Equal(HttpStatusCode.OK, ((dynamic)okResult.Value).status);
            Assert.Equal("Password berhasil DIubah", ((dynamic)okResult.Value).message);
        }

        private List<TblAccount> GetAccountData()
        {
            List<TblAccount> accountData = new List<TblAccount>
    {
        new TblAccount
        {
            AccountId = 1,
            Name = "admin1",
            Email = "admin1@gmail.com",
            Password = BCrypt.Net.BCrypt.HashPassword("123456"),
            Role = new TblRole { RoleId = 2 },
            IsDeleted = false
        },
        new TblAccount
        {
            AccountId = 2,
            Name = "admin2",
            Email = "admin2@gmail.com",
            Password = BCrypt.Net.BCrypt.HashPassword("123456"),
            Role = new TblRole { RoleId = 2 },
            IsDeleted = false
        },
        new TblAccount
        {
            AccountId = 3,
            Name = "admin3",
            Email = "admin3@gmail.com",
            Password = BCrypt.Net.BCrypt.HashPassword("123456"),
            Role = new TblRole { RoleId = 2 },
            IsDeleted = false
        },
    };

            return accountData;
        }


        private DbSet<T> MockDbSet<T>(List<T> list) where T : class
        {
            var mockDbSet = new Mock<DbSet<T>>();
            var queryable = list.AsQueryable();

            mockDbSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(queryable.Provider);
            mockDbSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryable.Expression);
            mockDbSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
            mockDbSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(() => queryable.GetEnumerator());

            return mockDbSet.Object;
        }
    }

}