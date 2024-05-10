using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class TblToken
{
    public int Id { get; set; }

    public string? Linked { get; set; }

    public string? Token { get; set; }
}
