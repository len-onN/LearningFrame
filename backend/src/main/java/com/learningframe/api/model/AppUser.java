package com.learningframe.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "app_users")
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String displayName;

    @Column(nullable = false, unique = true, length = 180)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "daily_new_cards_limit", nullable = false)
    private Integer dailyNewCardsLimit = 20;

    @Column(name = "daily_review_cards_limit", nullable = false)
    private Integer dailyReviewCardsLimit = 100;

    protected AppUser() {
    }

    public AppUser(String displayName, String email, String passwordHash) {
        this.displayName = displayName;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    public Long getId() {
        return id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Integer getDailyNewCardsLimit() {
        return dailyNewCardsLimit;
    }

    public void setDailyNewCardsLimit(Integer dailyNewCardsLimit) {
        this.dailyNewCardsLimit = dailyNewCardsLimit;
    }

    public Integer getDailyReviewCardsLimit() {
        return dailyReviewCardsLimit;
    }

    public void setDailyReviewCardsLimit(Integer dailyReviewCardsLimit) {
        this.dailyReviewCardsLimit = dailyReviewCardsLimit;
    }
}
