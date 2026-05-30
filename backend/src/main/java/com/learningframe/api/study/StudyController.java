package com.learningframe.api.study;

import com.learningframe.api.model.StudyMode;
import com.learningframe.api.security.AuthenticatedUser;
import com.learningframe.api.study.StudyDtos.AnonymousReviewRequest;
import com.learningframe.api.study.StudyDtos.DueResponse;
import com.learningframe.api.study.StudyDtos.ReviewRequest;
import com.learningframe.api.study.StudyDtos.ReviewResult;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/study")
public class StudyController {
    private final StudyService studyService;

    public StudyController(StudyService studyService) {
        this.studyService = studyService;
    }

    @GetMapping("/due")
    DueResponse due(
            @RequestParam(defaultValue = "SINGLE_DECK") StudyMode mode,
            @RequestParam(required = false) Long deckId,
            @RequestParam(required = false) List<Long> deckIds,
            @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return studyService.due(mode, deckId, deckIds, limit, user);
    }

    @PostMapping("/reviews")
    ReviewResult review(@Valid @RequestBody ReviewRequest request, @AuthenticationPrincipal AuthenticatedUser user) {
        return studyService.review(request, user);
    }

    @PostMapping("/anonymous/review")
    ReviewResult anonymousReview(@Valid @RequestBody AnonymousReviewRequest request) {
        return studyService.anonymousReview(request);
    }
}
