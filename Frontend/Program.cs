using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;

namespace Frontend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddHttpClient();
            // Add services to the container.
            builder.Services.AddControllersWithViews();
            builder.Services.AddDistributedMemoryCache();
            builder.Services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromMinutes(30);
                options.Cookie.HttpOnly = true;
                options.Cookie.IsEssential = true;
            }
            );

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseStatusCodePagesWithReExecute("/Home/Error/{0}"); // NOTE: ADD THIS LINE OF CODE TO THE PROGRAM.CS FILE

                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseStatusCodePagesWithRedirects("/error/notfound");

            


            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();
            app.UseSession();
            app.UseAuthorization();
            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");
            app.MapControllerRoute(
                name: "recoveryPassword",
                pattern: "/recoveryPassword/{token}",
                defaults: new { controller = "Home", action = "RecoverPassword" });

            app.MapControllerRoute(
                name: "loginByLink",
                pattern: "/auth/autoLogin/{token}",
                defaults: new { controller = "Home", action = "tes" });

            app.MapControllerRoute(
                name: "loginTest",
                pattern: "/auth/test/",
                defaults: new { controller = "Home", action = "tes" });

            

            app.MapControllerRoute(
                name: "handleError",
                pattern: "/page-not-found",
                defaults: new { Controller = "Error", acttion = "NotFound" });
            app.Run();
        }
    }
}