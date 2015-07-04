namespace TimeTraveller.Models
{
    public class UserUsage
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public int Quantity { get; set; }
        public string Product { get; set; }
        public decimal Emission { get; set; }
    }
}