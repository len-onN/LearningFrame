package com.learningframe.api.security;

public record AuthenticatedUser(Long id, String email, String displayName) {
}
