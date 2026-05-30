package com.learningframe.api.auth;

import com.learningframe.api.auth.AuthDtos.AuthResponse;
import com.learningframe.api.auth.AuthDtos.LoginRequest;
import com.learningframe.api.auth.AuthDtos.RegisterRequest;
import com.learningframe.api.auth.AuthDtos.UserResponse;
import com.learningframe.api.common.ApiException;
import com.learningframe.api.model.AppUser;
import com.learningframe.api.repository.AppUserRepository;
import com.learningframe.api.security.AuthenticatedUser;
import com.learningframe.api.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {
    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AppUserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (users.existsByEmailIgnoreCase(email)) {
            throw ApiException.badRequest("Este e-mail ja esta cadastrado.");
        }

        AppUser user = users.save(new AppUser(
                request.displayName().trim(),
                email,
                passwordEncoder.encode(request.password())
        ));
        return response(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        AppUser user = users.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Credenciais invalidas."));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Credenciais invalidas.");
        }
        return response(user);
    }

    @Transactional(readOnly = true)
    public AppUser requireUser(AuthenticatedUser principal) {
        if (principal == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Login necessario.");
        }
        return users.findById(principal.id())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Usuario nao encontrado."));
    }

    private AuthResponse response(AppUser user) {
        return new AuthResponse(
                jwtService.issue(user),
                new UserResponse(user.getId(), user.getDisplayName(), user.getEmail())
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
