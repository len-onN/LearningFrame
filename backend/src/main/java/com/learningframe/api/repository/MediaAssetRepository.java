package com.learningframe.api.repository;

import com.learningframe.api.model.MediaAsset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MediaAssetRepository extends JpaRepository<MediaAsset, Long> {
    Optional<MediaAsset> findByDeckIdAndFileName(Long deckId, String fileName);

    List<MediaAsset> findByDeckId(Long deckId);
}
