using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AIChat.Api.Data;
using AIChat.Api.DTOs;
using AIChat.Api.Models;
using AIChat.Api.Services;

namespace AIChat.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;

    public AuthController(AppDbContext context, TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    /// <summary>
    /// Registers a new user. Returns 409 if the email is already taken.
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return Conflict(new { message = "Email already registered." });

        var user = new User
        {
            Email = dto.Email,
            FullName = dto.FullName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _tokenService.GenerateToken(user, out var expiresAt);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            FullName = user.FullName,
            ExpiresAt = expiresAt
        });
    }

    /// <summary>
    /// Authenticates a user and returns a JWT on success.
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid credentials." });

        var token = _tokenService.GenerateToken(user, out var expiresAt);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            FullName = user.FullName,
            ExpiresAt = expiresAt
        });
    }
}