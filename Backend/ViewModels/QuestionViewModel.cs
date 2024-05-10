namespace Backend.ViewModels
{
    public class QuestionViewModel
    {
        public int Question_ID { get; set; }
        public string Question_Desc { get; set; }
        public int Test_ID { get; set; }
        public List<TblMultipleChoiceViewModel> TblMultipleChoices { get; set; }
    }
}
