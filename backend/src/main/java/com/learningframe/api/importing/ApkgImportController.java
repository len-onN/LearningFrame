package com.learningframe.api.importing;

import com.learningframe.api.importing.ApkgDtos.ApkgImportResponse;
import com.learningframe.api.importing.ApkgDtos.ApkgPreviewResponse;
import com.learningframe.api.model.DeckVisibility;
import com.learningframe.api.security.AuthenticatedUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class ApkgImportController {
    private final ApkgImportService apkgImportService;

    public ApkgImportController(ApkgImportService apkgImportService) {
        this.apkgImportService = apkgImportService;
    }

    @PostMapping("/api/import/apkg/preview")
    ApkgPreviewResponse preview(@RequestParam("file") MultipartFile file) {
        return apkgImportService.preview(file);
    }

    @PostMapping("/api/decks/import/apkg")
    @ResponseStatus(HttpStatus.CREATED)
    ApkgImportResponse importDeck(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String title,
            @RequestParam(defaultValue = "PRIVATE") DeckVisibility visibility,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return apkgImportService.importDeck(file, title, visibility, user);
    }
}
