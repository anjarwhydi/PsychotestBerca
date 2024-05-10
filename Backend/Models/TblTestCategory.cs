using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class TblTestCategory
{
    public int TestCategoryId { get; set; }

    public string? LevelCategory { get; set; }

    public string? TestKit { get; set; }

    public virtual ICollection<TblParticipant> TblParticipants { get; } = new List<TblParticipant>();
}
