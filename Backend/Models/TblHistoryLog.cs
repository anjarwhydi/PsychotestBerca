using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class TblHistoryLog
{
    public int HistoryLogId { get; set; }

    public string? Activity { get; set; }

    public DateTime? Timestamp { get; set; }

    public int AccountId { get; set; }

    public virtual TblAccount Account { get; set; } = null!;
}
