package com.learningframe.api.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "cards")
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "deck_id", nullable = false)
    private Deck deck;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String frontHtml;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String backHtml;

    @Column(length = 80)
    private String sourceNoteId;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @BatchSize(size = 50)
    @JoinTable(
            name = "card_tags",
            joinColumns = @JoinColumn(name = "card_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new LinkedHashSet<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected Card() {
    }

    public Card(Deck deck, String frontHtml, String backHtml, String sourceNoteId) {
        this.deck = deck;
        this.frontHtml = frontHtml;
        this.backHtml = backHtml;
        this.sourceNoteId = sourceNoteId;
    }

    public Long getId() {
        return id;
    }

    public Deck getDeck() {
        return deck;
    }

    public void setDeck(Deck deck) {
        this.deck = deck;
    }

    public String getFrontHtml() {
        return frontHtml;
    }

    public void setFrontHtml(String frontHtml) {
        this.frontHtml = frontHtml;
    }

    public String getBackHtml() {
        return backHtml;
    }

    public void setBackHtml(String backHtml) {
        this.backHtml = backHtml;
    }

    public String getSourceNoteId() {
        return sourceNoteId;
    }

    public void setSourceNoteId(String sourceNoteId) {
        this.sourceNoteId = sourceNoteId;
    }

    public Set<Tag> getTags() {
        return tags;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
