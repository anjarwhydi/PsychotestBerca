using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class TblParticipant
{
    public int ParticipantId { get; set; }

    public string PhoneNumber { get; set; } = null!;

    public int AppliedPositionId { get; set; }

    public DateTime ExpiredDatetime { get; set; }

    public int AccountId { get; set; }

    public int TestCategoryId { get; set; }

    public string? Nik { get; set; }

    public virtual TblAccount Account { get; set; } = null!;

    public virtual TblAppliedPosition AppliedPosition { get; set; } = null!;

    public virtual ICollection<TblParticipantAnswer> TblParticipantAnswers { get; } = new List<TblParticipantAnswer>();

    public virtual TblTestCategory TestCategory { get; set; } = null!;
}


