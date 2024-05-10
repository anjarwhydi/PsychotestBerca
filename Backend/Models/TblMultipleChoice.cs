using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class TblMultipleChoice
{
    public int MultipleChoiceId { get; set; }

    public string? MultipleChoiceDesc { get; set; }

    public int QuestionId { get; set; }

    public string Score { get; set; } = null!;

    public virtual TblQuestionTest Question { get; set; } = null!;
}
