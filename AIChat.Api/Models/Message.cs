namespace AIChat.Api.Models;

public class Message
{
    public int Id { get; set; }
    public int ConversationId { get; set; }
    public Conversation? Conversation { get; set; }
    public string Role { get; set; } = string.Empty; // "user" or "assistant"
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}