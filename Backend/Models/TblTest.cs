using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class TblTest
{
    public int TestId { get; set; }

    public string? TestName { get; set; }

    public int TestTime { get; set; }

    public int TotalQuestion { get; set; }

    public virtual ICollection<TblParticipantAnswer> TblParticipantAnswers { get; } = new List<TblParticipantAnswer>();

    public virtual ICollection<TblQuestionTest> TblQuestionTests { get; } = new List<TblQuestionTest>();
}
