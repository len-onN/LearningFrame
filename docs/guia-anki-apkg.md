# Guia de Integração com Anki/APKG

O LearningFrame usa arquivos `.apkg` como interoperabilidade básica com Anki.
Essa integração existe para permitir preview e importação de baralhos, mas o
MVP não tenta replicar o Anki por completo.

## 1. O que e suportado

No MVP, a importação APKG cobre:
- leitura de deck package `.apkg`;
- preview antes de salvar;
- navegação carta a carta no preview;
- alternancia entre frente e verso;
- busca no seletor de cartas do preview;
- deteccao e exibicao de mídias simples no preview;
- persistência do baralho para usuário autenticado;
- persistência de mídias no backend para baralhos salvos;
- estudo posterior com imagens e audios renderizados.

O LearningFrame usa os campos básicos das notas para formar frente e verso das
cartas.

## 2. Fazer preview sem conta

Fluxo:
1. Abra `Importar`.
2. Selecione um arquivo `.apkg`.
3. Aguarde a geracao do preview.
4. Navegue entre cartas.
5. Alterne frente e verso.
6. Confira se imagens e audios essenciais aparecem.

O preview anônimo é temporário. Ao sair da rota de importação, a aplicação limpa
arquivo, preview, índice de mídia e object URLs.

## 3. Entrar para salvar

Se o visitante decide salvar o APKG:
1. Clique na ação de salvar.
2. A aplicação direciona para login ou cadastro.
3. Depois da autenticação, o preview e preservado somente para concluir esse
   fluxo.
4. Salve o baralho.
5. O baralho aparece em `Meus baralhos`.

Essa preservacao e intencional: evita que o usuário precise escolher o arquivo
novamente apenas porque entrou na conta.

## 4. O que acontece ao salvar

Ao salvar, o APKG e enviado ao backend. O backend:
- extrai os dados do pacote;
- cria o baralho;
- cria as cartas;
- extrai tags simples;
- persiste mídias associadas;
- inicia uma agenda própria de revisão.

Depois de salvar, o estado temporário da importação e limpo.

## 5. Mídias

Durante o preview:
- a mídia e lida localmente a partir do arquivo selecionado;
- imagens e audios são carregados sob demanda;
- object URLs temporárias são revogadas ao sair da importação.

Depois de salvar:
- mídias ficam persistidas como BLOB no MySQL;
- o backend serve as mídias por endpoint de baralho;
- mídias privadas podem usar token em query string para renderização por
  `<img>` e `<audio>`.

Essa solução é aceitável para o MVP acadêmico, mas storage externo seria mais
adequado para escala.

## 6. O que não é preservado

Fora do MVP:
- `.colpkg`;
- cloze avançado;
- templates complexos do Anki;
- agenda original do Anki;
- histórico de revisões;
- configurações originais de scheduler;
- estatísticas históricas do Anki;
- add-ons;
- modelos avançados com renderização específica do Anki.

Ao importar, o LearningFrame inicia uma agenda própria de repetição espaçada.

## 7. Arquivos grandes

APKGs grandes podem demorar mais para preview e salvamento, principalmente
quando contem muitas imagens ou audios.

Motivos:
- o arquivo precisa ser lido no cliente para preview de mídia;
- o backend precisa extrair o pacote;
- mídias são persistidas no banco;
- o MVP não usa job assíncrono, polling, SSE ou WebSocket para progresso real.

O limite configuravel de upload no backend usa:
- `MAX_APKG_UPLOAD_SIZE`;
- `MAX_APKG_BYTES`.

Os defaults atuais permitem até cerca de 200 MB, mas isso não significa que
arquivos muito grandes sejam ideais para uso continuo no MVP.

## 8. Direitos de conteúdo

Importar um `.apkg` não garante que o usuário tenha direito de redistribuir seu
conteúdo.

Cuidados:
- use baralhos próprios ou com permissao adequada;
- revise licencas de decks obtidos de terceiros;
- evite publicar conteúdo protegido sem autorização.

## 9. Como validar uma importação

Checklist recomendado:
1. O preview abriu sem erro.
2. A quantidade de cartas parece coerente.
3. Frente e verso estão legíveis.
4. Imagens essenciais aparecem.
5. Audios essenciais tocam.
6. Tags importantes foram preservadas quando aplicavel.
7. O baralho salvo aparece em `Meus baralhos`.
8. O estudo renderiza as mídias após salvar.

Se um baralho depender de recursos avançados do Anki, ele pode precisar de
ajuste manual após a importação.
