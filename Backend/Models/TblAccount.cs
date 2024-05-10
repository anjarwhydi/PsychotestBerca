using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class TblAccount
{
    public int AccountId { get; set; }

    public string Name { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public int RoleId { get; set; }

    public bool? IsDeleted { get; set; }

    public virtual TblRole Role { get; set; } = null!;

    public virtual ICollection<TblHistoryLog> TblHistoryLogs { get; } = new List<TblHistoryLog>();

    public virtual ICollection<TblParticipant> TblParticipants { get; } = new List<TblParticipant>();
}
