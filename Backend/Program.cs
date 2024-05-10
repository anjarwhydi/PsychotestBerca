using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
using EmailService;
using Backend.Repository.Data;
using System.Security.Claims;
using Backend.Context;
using ScoringTestService;
using Python.Runtime;
using Microsoft.AspNetCore.ResponseCompression;

namespace Backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            //var MyAllowAnyCorsPolicy = "AllowAnyOriginHeaderMethod";
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddHttpClient();
            //ingore json loop 
            builder.Services.AddControllers().AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            });

            //run pythonDLL only once 
            /*string userDirectoryPath = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            string pythonDllPath = Path.Combine(userDirectoryPath, @"AppData\Local\Programs\Python\Python310\python310.dll");
            Runtime.PythonDLL = pythonDllPath;
            PythonEngine.Initialize();
            PythonEngine.BeginAllowThreads();*/
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddDbContext<RasPsychotestBercaContext>(options => options.UseSqlServer(
                builder.Configuration.GetConnectionString("PsychotestContext"))
            );

            builder.Services.AddScoped<ParticipantRepository>();
            builder.Services.AddScoped<ParticipantAnswerRepository>();
            builder.Services.AddScoped<TestCategoryRepository>();
            builder.Services.AddScoped<AccountRepository>();
            builder.Services.AddScoped<MultipleChoiceRepository>();
            builder.Services.AddScoped<HistoryLogRepository>();
            builder.Services.AddScoped<AppliedPositionRepository>();
            builder.Services.AddScoped<TestRepository>();
            builder.Services.AddScoped<QuestionRepository>();
            builder.Services.AddScoped<TokenRepository>();
            builder.Services.AddScoped<IEmailSender, EmailSender>();
            builder.Services.AddScoped<IScoringTest, ScoringTest>();

            var emailConfig = builder.Configuration.GetSection("EmailConfiguration").Get<EmailConfiguration>(); //added 27-6-2023
            builder.Services.AddSingleton(emailConfig); //added 27-6-2023

            builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            builder.Services.AddCors(c =>
            {
                c.AddPolicy("AllowAllorigins", options => options
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod());
            });



            // Add policy for rolesname claim in token jwt
            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminAccess", policy =>
                    policy.RequireRole(ClaimTypes.Role, "Admin"));
            });



            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
                .AddJwtBearer(jwt =>
                {
                    var key = Encoding.ASCII.GetBytes(builder.Configuration["JWT:Key"]);
                    jwt.SaveToken = true;
                    jwt.TokenValidationParameters = new TokenValidationParameters()
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ValidateIssuer = false, // for dev
                        ValidateAudience = false, // for dev
                        RequireExpirationTime = false, // for dev -- needs to be updated when refresh token is added
                        ValidateLifetime = true
                    };
                });
            builder.Services.AddResponseCompression(options =>
            {
                options.EnableForHttps = true; // Enable compression for HTTPS requests
                options.Providers.Add<GzipCompressionProvider>(); // Use Gzip compression
                options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(
                    new[] { "application/json", "text/html", "text/plain" }); // Add additional MIME types to compress
            });
            var app = builder.Build();

            //development mode
            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            //deploy server mode > active swagger
            app.UseSwagger();
            app.UseSwaggerUI(o =>
            {
                o.SwaggerEndpoint("/swagger/v1/swagger.json", "v1"); // options added on 17-4-2023
                o.RoutePrefix = string.Empty;
            });

            ////If Deploy use 
            //app.UseSwagger();
            //app.UseSwaggerUI();

            //Panggil Cors
            app.UseCors("AllowAllorigins");
            app.UseResponseCompression();
            //app.UseCors(MyAllowAnyCorsPolicy);
            app.UseHttpsRedirection();

            // auth jwt
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}