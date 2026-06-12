package com.learningframe.api.user;

import com.learningframe.api.auth.AuthService;
import com.learningframe.api.common.ApiException;
import com.learningframe.api.model.AppUser;
import com.learningframe.api.repository.AppUserRepository;
import com.learningframe.api.security.AuthenticatedUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProfileServiceTest {

    @Mock
    private AppUserRepository users;

    @Mock
    private AuthService authService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ProfileService profileService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void updateDisplayName_success() {
        AuthenticatedUser principal = new AuthenticatedUser(1L, "Test", "test@test.com");
        AppUser mockUser = new AppUser("Old Name", "test@test.com", "hash");
        when(authService.requireUser(principal)).thenReturn(mockUser);

        ProfileDtos.UpdateDisplayNameRequest req = new ProfileDtos.UpdateDisplayNameRequest("New Name");
        profileService.updateDisplayName(principal, req);

        assertEquals("New Name", mockUser.getDisplayName());
        verify(users).save(mockUser);
    }

    @Test
    void updatePassword_success() {
        AuthenticatedUser principal = new AuthenticatedUser(1L, "Test", "test@test.com");
        AppUser mockUser = new AppUser("Test", "test@test.com", "oldHash");
        when(authService.requireUser(principal)).thenReturn(mockUser);
        when(passwordEncoder.matches("oldPass", "oldHash")).thenReturn(true);
        when(passwordEncoder.encode("newPass")).thenReturn("newHash");

        ProfileDtos.UpdatePasswordRequest req = new ProfileDtos.UpdatePasswordRequest("oldPass", "newPass");
        profileService.updatePassword(principal, req);

        assertEquals("newHash", mockUser.getPasswordHash());
        verify(users).save(mockUser);
    }

    @Test
    void updatePassword_failsIfOldPasswordIncorrect() {
        AuthenticatedUser principal = new AuthenticatedUser(1L, "Test", "test@test.com");
        AppUser mockUser = new AppUser("Test", "test@test.com", "oldHash");
        when(authService.requireUser(principal)).thenReturn(mockUser);
        when(passwordEncoder.matches("wrongPass", "oldHash")).thenReturn(false);

        ProfileDtos.UpdatePasswordRequest req = new ProfileDtos.UpdatePasswordRequest("wrongPass", "newPass");
        
        assertThrows(ApiException.class, () -> profileService.updatePassword(principal, req));
        verify(users, never()).save(any());
    }

    @Test
    void deleteAccount_success() {
        AuthenticatedUser principal = new AuthenticatedUser(1L, "Test", "test@test.com");
        AppUser mockUser = new AppUser("Test", "test@test.com", "hash");
        when(authService.requireUser(principal)).thenReturn(mockUser);

        profileService.deleteAccount(principal);

        verify(users).delete(mockUser);
    }
}
