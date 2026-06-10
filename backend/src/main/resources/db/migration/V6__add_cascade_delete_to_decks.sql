-- V6__add_cascade_delete_to_decks.sql
ALTER TABLE decks DROP FOREIGN KEY fk_decks_owner;
ALTER TABLE decks ADD CONSTRAINT fk_decks_owner FOREIGN KEY (owner_id) REFERENCES app_users(id) ON DELETE CASCADE;
