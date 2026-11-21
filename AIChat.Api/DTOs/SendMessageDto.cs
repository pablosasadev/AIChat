using System.ComponentModel.DataAnnotations;

namespace AIChat.Api.DTOs;

public class SendMessageDto
{
    [Required]
    public string Content { get; set; } = string.Empty;
}