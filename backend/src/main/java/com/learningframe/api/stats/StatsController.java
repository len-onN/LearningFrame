package com.learningframe.api.stats;

import com.learningframe.api.security.AuthenticatedUser;
import com.learningframe.api.stats.StatsDtos.StatsSummary;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {
    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/summary")
    StatsSummary summary(@AuthenticationPrincipal AuthenticatedUser user) {
        return statsService.summary(user);
    }
}
