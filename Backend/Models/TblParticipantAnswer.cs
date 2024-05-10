using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class TblParticipantAnswer
{
    public int ParticipantAnswareId { get; set; }

    public int ParticipantId { get; set; }

    public string? Answer { get; set; }

    public string? FinalScore { get; set; }

    public string? CapturePicture { get; set; }

    public bool? Status { get; set; }

    public int TestId { get; set; }

    public virtual TblParticipant Participant { get; set; } = null!;

    public virtual TblTest Test { get; set; } = null!;
}
