using Backend.Models;

namespace Backend.ViewModels
{
    public class ParticipantAnswerVM
    {
        public int ParticipantAnswareId { get; set; }

        public int ParticipantId { get; set; }

        public string? Answer { get; set; }

        public string? FinalScore { get; set; }

        public string? CapturePicture { get; set; }

        public bool? Status { get; set; }

        public int TestId { get; set; }
    }
}
