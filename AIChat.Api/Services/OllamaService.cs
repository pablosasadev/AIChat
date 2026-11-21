using OllamaSharp;
using OllamaSharp.Models.Chat;

namespace AIChat.Api.Services;

public class OllamaService
{
    private readonly OllamaApiClient _client;
    private readonly string _model;

    public OllamaService(IConfiguration config)
    {
        var section = config.GetSection("Ollama");
        var baseUrl = section["BaseUrl"] ?? "http://localhost:11434";
        _model = section["Model"] ?? "llama3.2:1b";

        _client = new OllamaApiClient(new Uri(baseUrl));
        _client.SelectedModel = _model;
    }

    /// <summary>
    /// Sends a conversation history to Ollama and returns the assistant's reply.
    /// The full history is sent so the model keeps context across messages.
    /// </summary>
    public async Task<string> GetResponseAsync(
        IEnumerable<Message> history,
        CancellationToken cancellationToken = default)
    {
        var request = new ChatRequest
        {
            Model = _model,
            Messages = history.ToList(),
            Stream = false
        };

        // ChatAsync returns a stream, but with Stream = false it will contain a single response
        var responses = await _client.ChatAsync(request, cancellationToken).ToListAsync(cancellationToken);
        var finalResponse = responses.LastOrDefault();

        return finalResponse?.Message?.Content ?? string.Empty;
    }
}