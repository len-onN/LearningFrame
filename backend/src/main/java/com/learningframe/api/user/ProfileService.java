package com.learningframe.api.user;

import com.learningframe.api.auth.AuthService;
import com.learningframe.api.common.ApiException;
import com.learningframe.api.model.AppUser;
import com.learningframe.api.repository.AppUserRepository;
import com.learningframe.api.security.AuthenticatedUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {
    private final AppUserRepository users;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    public ProfileService(AppUserRepository users, AuthService authService, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void updateDisplayName(AuthenticatedUser principal, ProfileDtos.UpdateDisplayNameRequest request) {
        AppUser user = authService.requireUser(principal);
        user.setDisplayName(request.displayName().trim());
        users.save(user);
    }

    @Transactional
    public void updatePassword(AuthenticatedUser principal, ProfileDtos.UpdatePasswordRequest request) {
        AppUser user = authService.requireUser(principal);
        if (!passwordEncoder.matches(request.oldPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Senha atual incorreta.");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        users.save(user);
    }

    @Transactional
    public void deleteAccount(AuthenticatedUser principal) {
        AppUser user = authService.requireUser(principal);
        users.delete(user);
    }
}
