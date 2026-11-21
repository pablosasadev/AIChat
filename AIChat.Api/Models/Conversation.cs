namespace AIChat.Api.Models;

public class Conversation
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public string Title { get; set; } = "New Chat";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<Message> Messages { get; set; } = new();
}