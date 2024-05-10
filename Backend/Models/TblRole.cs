using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class TblRole
{
    public int RoleId { get; set; }

    public string RoleName { get; set; } = null!;

    public virtual ICollection<TblAccount> TblAccounts { get; } = new List<TblAccount>();
}
