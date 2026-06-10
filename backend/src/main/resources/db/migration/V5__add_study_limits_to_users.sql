ALTER TABLE app_users ADD COLUMN daily_new_cards_limit INT NOT NULL DEFAULT 20;
ALTER TABLE app_users ADD COLUMN daily_review_cards_limit INT NOT NULL DEFAULT 100;
