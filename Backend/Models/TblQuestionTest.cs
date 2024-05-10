using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class TblQuestionTest
{
    public int QuestionId { get; set; }

    public string? QuestionDesc { get; set; }

    public int TestId { get; set; }

    public virtual ICollection<TblMultipleChoice> TblMultipleChoices { get; } = new List<TblMultipleChoice>();

    public virtual TblTest Test { get; set; } = null!;
}
