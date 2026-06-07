package com.learningframe.api.e2e;

import com.learningframe.api.common.ApiException;
import com.learningframe.api.e2e.E2eDtos.E2eSeedResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Profile("e2e")
@RestController
@RequestMapping("/api/e2e")
public class E2eResetController {
    private final E2eResetService resetService;
    private final String resetToken;

    public E2eResetController(
            E2eResetService resetService,
            @Value("${learningframe.e2e.reset-token}") String resetToken
    ) {
        this.resetService = resetService;
        this.resetToken = resetToken;
    }

    @PostMapping("/reset")
    public E2eSeedResponse reset(@RequestHeader(name = "X-E2E-Token", required = false) String token) {
        if (resetToken == null || resetToken.isBlank() || !resetToken.equals(token)) {
            throw ApiException.forbidden("Reset e2e nao autorizado.");
        }
        return resetService.resetAndSeed();
    }
}
