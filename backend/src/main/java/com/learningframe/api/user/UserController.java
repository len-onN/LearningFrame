package com.learningframe.api.user;

import com.learningframe.api.auth.AuthService;
import com.learningframe.api.model.AppUser;
import com.learningframe.api.repository.AppUserRepository;
import com.learningframe.api.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me")
public class UserController {
    private final AuthService authService;
    private final AppUserRepository users;

    public UserController(AuthService authService, AppUserRepository users) {
        this.authService = authService;
        this.users = users;
    }

    @GetMapping("/settings")
    public UserSettingsDto getSettings(@AuthenticationPrincipal AuthenticatedUser principal) {
        AppUser user = authService.requireUser(principal);
        return new UserSettingsDto(user.getDailyNewCardsLimit(), user.getDailyReviewCardsLimit());
    }

    @PutMapping("/settings")
    public UserSettingsDto updateSettings(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody UserSettingsDto request
    ) {
        AppUser user = authService.requireUser(principal);
        user.setDailyNewCardsLimit(request.dailyNewCardsLimit());
        user.setDailyReviewCardsLimit(request.dailyReviewCardsLimit());
        users.save(user);
        return request;
    }
}
