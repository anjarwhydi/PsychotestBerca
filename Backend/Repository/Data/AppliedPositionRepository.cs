using Backend.Context;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;

namespace Backend.Repository.Data
{
    public class AppliedPositionRepository : GeneralRepository<RasPsychotestBercaContext, TblAppliedPosition, int>
    {
        private readonly RasPsychotestBercaContext context;
        public AppliedPositionRepository(RasPsychotestBercaContext context) : base(context)
        {
            this.context = context;
        }

        //get Job Tittle, Participant
        public IEnumerable<Object> GetJobTittleParticipant()
        {
            var myobject = (from e in context.TblParticipants
                            join d in context.TblAppliedPositions
                            on e.AppliedPositionId equals d.AppliedPositionId
                            select new
                            {
                                AppliedPosition = d.AppliedPosition,
                                ParticipantName = e.Account.Name
                            });
            if (myobject.Count() != 0)
            {
                return myobject.ToList();
            }
            return null;
        }

        //cek duplikat job position 15/08/2023
        public bool checkjobposition(string AppliedPosition)
        {
            var checkjobposition = context.TblAppliedPositions.FirstOrDefault(e => e.AppliedPosition == AppliedPosition);
            if (checkjobposition == null)
            {
                return false;
            }
            return true;
        }

        public int Updatejob(TblAppliedPosition tblAppliedPosition)
        {
            //mencari JobPosition di database
            var checkJob = context.TblAppliedPositions.Where(d => d.AppliedPosition == tblAppliedPosition.AppliedPosition).FirstOrDefault();
            if (checkJob != null)
            {
                return 0; // Jika nama department sudah ada, return 0
            }
            context.TblAppliedPositions.Update(tblAppliedPosition);
            //context.Entry(checkJob).State = EntityState.Modified;
            var saved = context.SaveChanges();
            return saved;
        }

        public bool CheckParticipant(int PosID)
        {
            var par = context.TblParticipants.FirstOrDefault(p => p.AppliedPositionId == PosID);
            if (par == null)
            {
                return false;
            }
            return true;
        }
    }
}

