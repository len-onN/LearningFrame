package com.learningframe.api.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank @Size(max = 120) String displayName,
            @NotBlank @Email @Size(max = 180) String email,
            @NotBlank @Size(min = 8, max = 120) String password
    ) {
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {
    }

    public record UserResponse(Long id, String displayName, String email) {
    }

    public record AuthResponse(String token, UserResponse user) {
    }
}
