using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AIChat.Api.Data;
using AIChat.Api.DTOs;
using AIChat.Api.Models;
using AIChat.Api.Services;
using OllamaSharp.Models.Chat;

namespace AIChat.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly OllamaService _ollama;

    public ChatController(AppDbContext context, OllamaService ollama)
    {
        _context = context;
        _ollama = ollama;
    }

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("conversations")]
    public async Task<ActionResult<IEnumerable<ConversationDto>>> GetConversations()
    {
        var conversations = await _context.Conversations
            .Where(c => c.UserId == CurrentUserId)
            .OrderByDescending(c => c.UpdatedAt)
            .Select(c => new ConversationDto
            {
                Id = c.Id,
                Title = c.Title,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToListAsync();

        return Ok(conversations);
    }

    [HttpGet("conversations/{id}")]
    public async Task<ActionResult<ConversationDto>> GetConversation(int id)
    {
        var conversation = await _context.Conversations
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == CurrentUserId);

        if (conversation == null) return NotFound();

        return Ok(new ConversationDto
        {
            Id = conversation.Id,
            Title = conversation.Title,
            CreatedAt = conversation.CreatedAt,
            UpdatedAt = conversation.UpdatedAt,
            Messages = conversation.Messages
                .OrderBy(m => m.CreatedAt)
                .Select(m => new MessageDto
                {
                    Id = m.Id,
                    Role = m.Role,
                    Content = m.Content,
                    CreatedAt = m.CreatedAt
                })
                .ToList()
        });
    }

    [HttpPost("conversations")]
    public async Task<ActionResult<ConversationDto>> CreateConversation()
    {
        var conversation = new Conversation
        {
            UserId = CurrentUserId,
            Title = "New Chat"
        };

        _context.Conversations.Add(conversation);
        await _context.SaveChangesAsync();

        return Ok(new ConversationDto
        {
            Id = conversation.Id,
            Title = conversation.Title,
            CreatedAt = conversation.CreatedAt,
            UpdatedAt = conversation.UpdatedAt
        });
    }

    [HttpPost("conversations/{id}/messages")]
    public async Task<ActionResult<MessageDto>> SendMessage(int id, SendMessageDto dto)
    {
        var conversation = await _context.Conversations
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == CurrentUserId);

        if (conversation == null) return NotFound();

        // Save user message (uses our domain entity AIChat.Api.Models.Message)
        var userMessage = new AIChat.Api.Models.Message
        {
            ConversationId = conversation.Id,
            Role = "user",
            Content = dto.Content
        };
        _context.Messages.Add(userMessage);

        if (conversation.Title == "New Chat")
        {
            conversation.Title = dto.Content.Length > 50
                ? dto.Content.Substring(0, 50) + "..."
                : dto.Content;
        }
        conversation.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Build history for Ollama using the fully qualified type
        var history = conversation.Messages
            .OrderBy(m => m.CreatedAt)
            .Select(m => new OllamaSharp.Models.Chat.Message
            {
                Role = m.Role == "user"
                    ? OllamaSharp.Models.Chat.ChatRole.User
                    : OllamaSharp.Models.Chat.ChatRole.Assistant,
                Content = m.Content
            })
            .ToList();

        history.Add(new OllamaSharp.Models.Chat.Message
        {
            Role = OllamaSharp.Models.Chat.ChatRole.User,
            Content = dto.Content
        });

        var aiContent = await _ollama.GetResponseAsync(history);

        // Save assistant message (our domain entity)
        var assistantMessage = new AIChat.Api.Models.Message
        {
            ConversationId = conversation.Id,
            Role = "assistant",
            Content = aiContent
        };
        _context.Messages.Add(assistantMessage);
        await _context.SaveChangesAsync();

        return Ok(new MessageDto
        {
            Id = assistantMessage.Id,
            Role = assistantMessage.Role,
            Content = assistantMessage.Content,
            CreatedAt = assistantMessage.CreatedAt
        });
    }
    /// <summary>
    /// Deletes a conversation and all its messages. Only the owner can delete it.
    /// </summary>
    [HttpDelete("conversations/{id}")]
    public async Task<IActionResult> DeleteConversation(int id)
    {
        var conversation = await _context.Conversations
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == CurrentUserId);

        if (conversation == null) return NotFound();

        _context.Conversations.Remove(conversation);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}