package com.learningframe.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "review_logs")
public class ReviewLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "card_id", nullable = false)
    private Card card;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReviewRating rating;

    @Column(nullable = false)
    private int previousIntervalDays;

    @Column(nullable = false)
    private int nextIntervalDays;

    @Column(nullable = false)
    private Instant reviewedAt;

    protected ReviewLog() {
    }

    public ReviewLog(AppUser user, Card card, ReviewRating rating, int previousIntervalDays, int nextIntervalDays, Instant reviewedAt) {
        this.user = user;
        this.card = card;
        this.rating = rating;
        this.previousIntervalDays = previousIntervalDays;
        this.nextIntervalDays = nextIntervalDays;
        this.reviewedAt = reviewedAt;
    }

    public Long getId() {
        return id;
    }

    public ReviewRating getRating() {
        return rating;
    }

    public Instant getReviewedAt() {
        return reviewedAt;
    }
}
