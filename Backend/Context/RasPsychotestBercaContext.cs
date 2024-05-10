using System;
using System.Collections.Generic;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Context;

public partial class RasPsychotestBercaContext : DbContext
{
    public RasPsychotestBercaContext()
    {
    }

    public RasPsychotestBercaContext(DbContextOptions<RasPsychotestBercaContext> options)
        : base(options)
    {
    }

    public virtual DbSet<TblAccount> TblAccounts { get; set; }

    public virtual DbSet<TblAppliedPosition> TblAppliedPositions { get; set; }

    public virtual DbSet<TblHistoryLog> TblHistoryLogs { get; set; }

    public virtual DbSet<TblMultipleChoice> TblMultipleChoices { get; set; }

    public virtual DbSet<TblParticipant> TblParticipants { get; set; }

    public virtual DbSet<TblParticipantAnswer> TblParticipantAnswers { get; set; }

    public virtual DbSet<TblQuestionTest> TblQuestionTests { get; set; }

    public virtual DbSet<TblRole> TblRoles { get; set; }

    public virtual DbSet<TblTest> TblTests { get; set; }

    public virtual DbSet<TblTestCategory> TblTestCategories { get; set; }

    public virtual DbSet<TblToken> TblTokens { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=ConnectionStrings:PsychotestContext");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TblAccount>(entity =>
        {
            entity.HasKey(e => e.AccountId);

            entity.ToTable("Tbl_Account");

            entity.Property(e => e.AccountId).HasColumnName("Account_ID");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.IsDeleted).HasColumnName("is_Deleted");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.RoleId).HasColumnName("Role_ID");

            entity.HasOne(d => d.Role).WithMany(p => p.TblAccounts)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tbl_Account_Tbl_Role");
        });

        modelBuilder.Entity<TblAppliedPosition>(entity =>
        {
            entity.HasKey(e => e.AppliedPositionId);

            entity.ToTable("Tbl_Applied_Position");

            entity.Property(e => e.AppliedPositionId).HasColumnName("Applied_Position_ID");
            entity.Property(e => e.AppliedPosition)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("Applied_Position");
        });

        modelBuilder.Entity<TblHistoryLog>(entity =>
        {
            entity.HasKey(e => e.HistoryLogId);

            entity.ToTable("Tbl_History_Log");

            entity.Property(e => e.HistoryLogId).HasColumnName("History_Log_ID");
            entity.Property(e => e.AccountId).HasColumnName("Account_ID");
            entity.Property(e => e.Activity)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Timestamp).HasColumnType("datetime");

            entity.HasOne(d => d.Account).WithMany(p => p.TblHistoryLogs)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tbl_History_Log_Tbl_Account");
        });

        modelBuilder.Entity<TblMultipleChoice>(entity =>
        {
            entity.HasKey(e => e.MultipleChoiceId);

            entity.ToTable("Tbl_Multiple_Choice");

            entity.Property(e => e.MultipleChoiceId).HasColumnName("Multiple_Choice_ID");
            entity.Property(e => e.MultipleChoiceDesc).HasColumnName("Multiple_Choice_Desc");
            entity.Property(e => e.QuestionId).HasColumnName("Question_ID");
            entity.Property(e => e.Score).HasMaxLength(50);

            entity.HasOne(d => d.Question).WithMany(p => p.TblMultipleChoices)
                .HasForeignKey(d => d.QuestionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tbl_Multiple_Choice_Tbl_Question_Test");
        });

        modelBuilder.Entity<TblParticipant>(entity =>
        {
            entity.HasKey(e => e.ParticipantId);

            entity.ToTable("Tbl_Participant");

            entity.Property(e => e.ParticipantId).HasColumnName("Participant_ID");
            entity.Property(e => e.AccountId).HasColumnName("Account_ID");
            entity.Property(e => e.AppliedPositionId).HasColumnName("Applied_Position_ID");
            entity.Property(e => e.ExpiredDatetime)
                .HasColumnType("datetime")
                .HasColumnName("Expired_Datetime");
            entity.Property(e => e.Nik)
                .HasMaxLength(16)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("NIK");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(15)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("Phone_Number");
            entity.Property(e => e.TestCategoryId).HasColumnName("Test_Category_ID");

            entity.HasOne(d => d.Account).WithMany(p => p.TblParticipants)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tbl_Participant_Tbl_Account");

            entity.HasOne(d => d.AppliedPosition).WithMany(p => p.TblParticipants)
                .HasForeignKey(d => d.AppliedPositionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tbl_Participant_Tbl_Applied_Position");

            entity.HasOne(d => d.TestCategory).WithMany(p => p.TblParticipants)
                .HasForeignKey(d => d.TestCategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tbl_Participant_Tbl_Test_Category");
        });

        modelBuilder.Entity<TblParticipantAnswer>(entity =>
        {
            entity.HasKey(e => e.ParticipantAnswareId);

            entity.ToTable("Tbl_Participant_Answer");

            entity.Property(e => e.ParticipantAnswareId).HasColumnName("Participant_Answare_ID");
            entity.Property(e => e.Answer).IsUnicode(false);
            entity.Property(e => e.CapturePicture)
                .HasColumnType("text")
                .HasColumnName("Capture_Picture");
            entity.Property(e => e.FinalScore).HasColumnName("Final_Score");
            entity.Property(e => e.ParticipantId).HasColumnName("Participant_ID");
            entity.Property(e => e.TestId).HasColumnName("Test_ID");

            entity.HasOne(d => d.Participant).WithMany(p => p.TblParticipantAnswers)
                .HasForeignKey(d => d.ParticipantId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tbl_Participant_Answer_Tbl_Participant");

            entity.HasOne(d => d.Test).WithMany(p => p.TblParticipantAnswers)
                .HasForeignKey(d => d.TestId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tbl_Participant_Answer_Tbl_Test");
        });

        modelBuilder.Entity<TblQuestionTest>(entity =>
        {
            entity.HasKey(e => e.QuestionId);

            entity.ToTable("Tbl_Question_Test");

            entity.Property(e => e.QuestionId).HasColumnName("Question_ID");
            entity.Property(e => e.QuestionDesc)
                .HasColumnType("text")
                .HasColumnName("Question_Desc");
            entity.Property(e => e.TestId).HasColumnName("Test_ID");

            entity.HasOne(d => d.Test).WithMany(p => p.TblQuestionTests)
                .HasForeignKey(d => d.TestId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tbl_Question_Test_Tbl_Test");
        });

        modelBuilder.Entity<TblRole>(entity =>
        {
            entity.HasKey(e => e.RoleId);

            entity.ToTable("Tbl_Role");

            entity.Property(e => e.RoleId).HasColumnName("Role_ID");
            entity.Property(e => e.RoleName)
                .HasMaxLength(63)
                .IsUnicode(false)
                .HasColumnName("Role_name");
        });

        modelBuilder.Entity<TblTest>(entity =>
        {
            entity.HasKey(e => e.TestId);

            entity.ToTable("Tbl_Test");

            entity.Property(e => e.TestId).HasColumnName("Test_ID");
            entity.Property(e => e.TestName)
                .HasMaxLength(63)
                .IsUnicode(false)
                .HasColumnName("Test_Name");
            entity.Property(e => e.TestTime).HasColumnName("Test_Time");
            entity.Property(e => e.TotalQuestion).HasColumnName("Total_Question");
        });

        modelBuilder.Entity<TblTestCategory>(entity =>
        {
            entity.HasKey(e => e.TestCategoryId);

            entity.ToTable("Tbl_Test_Category");

            entity.Property(e => e.TestCategoryId).HasColumnName("Test_Category_ID");
            entity.Property(e => e.LevelCategory)
                .HasMaxLength(63)
                .IsUnicode(false)
                .HasColumnName("Level_Category");
            entity.Property(e => e.TestKit)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("Test_Kit");
        });

        modelBuilder.Entity<TblToken>(entity =>
        {
            entity.ToTable("Tbl_Token");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Linked)
                .HasMaxLength(50)
                .HasColumnName("linked");
            entity.Property(e => e.Token)
                .HasColumnType("ntext")
                .HasColumnName("token");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
