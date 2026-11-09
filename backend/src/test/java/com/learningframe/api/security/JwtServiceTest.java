package com.learningframe.api.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learningframe.api.common.ApiException;
import com.learningframe.api.model.AppUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("JWT service")
class JwtServiceTest {
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(new ObjectMapper(), "super-secret-jwt-key-for-testing-purposes-12345", 3600);
    }

    @Test
    @DisplayName("issues and verifies a valid token successfully")
    void issueAndVerifySuccess() {
        AppUser user = new AppUser("Ada Lovelace", "ada@example.com", "hash");
        ReflectionTestUtils.setField(user, "id", 42L);

        String token = jwtService.issue(user);
        assertThat(token).isNotBlank();

        AuthenticatedUser verified = jwtService.verify(token);
        assertThat(verified.id()).isEqualTo(42L);
        assertThat(verified.email()).isEqualTo("ada@example.com");
        assertThat(verified.displayName()).isEqualTo("Ada Lovelace");
    }

    @Test
    @DisplayName("throws ApiException with English message when token is invalid or malformed")
    void verifyInvalidToken() {
        assertThatThrownBy(() -> jwtService.verify("invalid.token.payload"))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> {
                    ApiException apiEx = (ApiException) ex;
                    assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                    assertThat(apiEx.getMessage()).isEqualTo("Invalid or expired token.");
                });
    }

    @Test
    @DisplayName("throws ApiException with English message when token is expired")
    void verifyExpiredToken() {
        JwtService shortLivedService = new JwtService(new ObjectMapper(), "super-secret-jwt-key-for-testing-purposes-12345", -10);
        AppUser user = new AppUser("Ada Lovelace", "ada@example.com", "hash");
        ReflectionTestUtils.setField(user, "id", 42L);

        String expiredToken = shortLivedService.issue(user);

        assertThatThrownBy(() -> jwtService.verify(expiredToken))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> {
                    ApiException apiEx = (ApiException) ex;
                    assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                    assertThat(apiEx.getMessage()).isEqualTo("Invalid or expired token.");
                });
    }
}

