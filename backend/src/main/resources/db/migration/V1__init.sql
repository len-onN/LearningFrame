CREATE TABLE app_users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    display_name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
);

CREATE TABLE decks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    owner_id BIGINT NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT NULL,
    visibility VARCHAR(20) NOT NULL,
    source_format VARCHAR(20) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_decks_owner FOREIGN KEY (owner_id) REFERENCES app_users(id)
);

CREATE TABLE cards (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    deck_id BIGINT NOT NULL,
    front_html TEXT NOT NULL,
    back_html TEXT NOT NULL,
    source_note_id VARCHAR(80) NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_cards_deck FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);

CREATE TABLE tags (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE card_tags (
    card_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (card_id, tag_id),
    CONSTRAINT fk_card_tags_card FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    CONSTRAINT fk_card_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE media_assets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    deck_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(120) NOT NULL,
    content LONGBLOB NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_media_assets_deck FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);

CREATE TABLE review_states (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    card_id BIGINT NOT NULL,
    ease_factor DECIMAL(4,2) NOT NULL,
    interval_days INT NOT NULL,
    repetitions INT NOT NULL,
    due_at TIMESTAMP(6) NOT NULL,
    last_rating VARCHAR(20) NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE KEY uk_review_states_user_card (user_id, card_id),
    INDEX ix_review_states_user_due (user_id, due_at),
    CONSTRAINT fk_review_states_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_states_card FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

CREATE TABLE review_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    card_id BIGINT NOT NULL,
    rating VARCHAR(20) NOT NULL,
    previous_interval_days INT NOT NULL,
    next_interval_days INT NOT NULL,
    reviewed_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_review_logs_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_logs_card FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    INDEX ix_review_logs_user_reviewed_at (user_id, reviewed_at)
);

INSERT INTO decks (title, description, visibility, source_format)
VALUES
    ('Metodologia Cientifica', 'Baralho inicial com conceitos basicos para testar recordacao ativa, espacamento e modo caos.', 'PUBLIC', 'MANUAL'),
    ('Arquitetura Web', 'Conceitos introdutorios sobre aplicacoes web modernas.', 'PUBLIC', 'MANUAL');

INSERT INTO cards (deck_id, front_html, back_html, source_note_id)
VALUES
    (1, 'O que e recordacao ativa?', 'E a tentativa deliberada de recuperar uma resposta da memoria antes de consultar o material.', 'seed-1'),
    (1, 'Por que a repeticao espacada ajuda no estudo?', 'Porque distribui revisoes ao longo do tempo, reforcando memorias quando elas comecam a enfraquecer.', 'seed-2'),
    (1, 'O que e pratica intercalada?', 'E alternar tipos de problema, temas ou baralhos para melhorar discriminacao entre conceitos.', 'seed-3'),
    (2, 'Qual papel do backend neste MVP?', 'Expor APIs para autenticacao, baralhos, cards, revisoes, importacao e estatisticas essenciais.', 'seed-4'),
    (2, 'Qual papel do frontend Vue?', 'Oferecer uma interface limpa para biblioteca, importacao, estudo, modo caos e progresso.', 'seed-5'),
    (2, 'Por que usar Docker Compose?', 'Para subir banco, backend e frontend com um unico comando reproduzivel.', 'seed-6');
