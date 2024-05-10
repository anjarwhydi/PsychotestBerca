using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class TblAppliedPosition
{
    public int AppliedPositionId { get; set; }

    public string? AppliedPosition { get; set; }

    public virtual ICollection<TblParticipant> TblParticipants { get; } = new List<TblParticipant>();
}
