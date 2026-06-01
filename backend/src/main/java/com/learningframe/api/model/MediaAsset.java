package com.learningframe.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "media_assets")
public class MediaAsset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "deck_id", nullable = false)
    private Deck deck;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false, length = 120)
    private String contentType;

    @Lob
    @Column(nullable = false)
    private byte[] content;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected MediaAsset() {
    }

    public MediaAsset(Deck deck, String fileName, String contentType, byte[] content) {
        this.deck = deck;
        this.fileName = fileName;
        this.contentType = contentType;
        this.content = content;
    }

    public Long getId() {
        return id;
    }

    public Deck getDeck() {
        return deck;
    }

    public String getFileName() {
        return fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public byte[] getContent() {
        return content;
    }

    public void updateContent(String newContentType, byte[] newContent) {
        this.contentType = newContentType;
        this.content = newContent;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
