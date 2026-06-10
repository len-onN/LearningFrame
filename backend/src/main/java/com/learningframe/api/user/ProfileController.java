package com.learningframe.api.user;

import com.learningframe.api.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @PutMapping("/display-name")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateDisplayName(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody ProfileDtos.UpdateDisplayNameRequest request
    ) {
        profileService.updateDisplayName(principal, request);
    }

    @PutMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updatePassword(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody ProfileDtos.UpdatePasswordRequest request
    ) {
        profileService.updatePassword(principal, request);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAccount(@AuthenticationPrincipal AuthenticatedUser principal) {
        profileService.deleteAccount(principal);
    }
}
