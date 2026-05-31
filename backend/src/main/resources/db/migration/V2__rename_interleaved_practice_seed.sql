UPDATE decks
SET description = 'Baralho inicial com conceitos basicos para testar recordacao ativa, espacamento e pratica intercalada.'
WHERE title = 'Metodologia Cientifica'
  AND description = 'Baralho inicial com conceitos basicos para testar recordacao ativa, espacamento e modo caos.';

UPDATE cards
SET back_html = 'Oferecer uma interface limpa para biblioteca, importacao, estudo, pratica intercalada e progresso.'
WHERE source_note_id = 'seed-5'
  AND back_html = 'Oferecer uma interface limpa para biblioteca, importacao, estudo, modo caos e progresso.';
