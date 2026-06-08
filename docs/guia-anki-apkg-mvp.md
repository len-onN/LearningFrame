# Guia de Integracao com Anki/APKG

O LearningFrame usa arquivos `.apkg` como interoperabilidade basica com Anki.
Essa integracao existe para permitir preview e importacao de baralhos, mas o
MVP nao tenta replicar o Anki por completo.

## 1. O que e suportado

No MVP, a importacao APKG cobre:
- leitura de deck package `.apkg`;
- preview antes de salvar;
- navegacao carta a carta no preview;
- alternancia entre frente e verso;
- busca no seletor de cartas do preview;
- deteccao e exibicao de midias simples no preview;
- persistencia do baralho para usuario autenticado;
- persistencia de midias no backend para baralhos salvos;
- estudo posterior com imagens e audios renderizados.

O LearningFrame usa os campos basicos das notas para formar frente e verso das
cartas.

## 2. Fazer preview sem conta

Fluxo:
1. Abra `Importar`.
2. Selecione um arquivo `.apkg`.
3. Aguarde a geracao do preview.
4. Navegue entre cartas.
5. Alterne frente e verso.
6. Confira se imagens e audios essenciais aparecem.

O preview anonimo e temporario. Ao sair da rota de importacao, a aplicacao limpa
arquivo, preview, indice de midia e object URLs.

## 3. Entrar para salvar

Se o visitante decide salvar o APKG:
1. Clique na acao de salvar.
2. A aplicacao direciona para login ou cadastro.
3. Depois da autenticacao, o preview e preservado somente para concluir esse
   fluxo.
4. Salve o baralho.
5. O baralho aparece em `Meus baralhos`.

Essa preservacao e intencional: evita que o usuario precise escolher o arquivo
novamente apenas porque entrou na conta.

## 4. O que acontece ao salvar

Ao salvar, o APKG e enviado ao backend. O backend:
- extrai os dados do pacote;
- cria o baralho;
- cria as cartas;
- extrai tags simples;
- persiste midias associadas;
- inicia uma agenda propria de revisao.

Depois de salvar, o estado temporario da importacao e limpo.

## 5. Midias

Durante o preview:
- a midia e lida localmente a partir do arquivo selecionado;
- imagens e audios sao carregados sob demanda;
- object URLs temporarias sao revogadas ao sair da importacao.

Depois de salvar:
- midias ficam persistidas como BLOB no MySQL;
- o backend serve as midias por endpoint de baralho;
- midias privadas podem usar token em query string para renderizacao por
  `<img>` e `<audio>`.

Essa solucao e aceitavel para o MVP academico, mas storage externo seria mais
adequado para escala.

## 6. O que nao e preservado

Fora do MVP:
- `.colpkg`;
- cloze avancado;
- templates complexos do Anki;
- agenda original do Anki;
- historico de revisoes;
- configuracoes originais de scheduler;
- estatisticas historicas do Anki;
- add-ons;
- modelos avancados com renderizacao especifica do Anki.

Ao importar, o LearningFrame inicia uma agenda propria de repeticao espacada.

## 7. Arquivos grandes

APKGs grandes podem demorar mais para preview e salvamento, principalmente
quando contem muitas imagens ou audios.

Motivos:
- o arquivo precisa ser lido no cliente para preview de midia;
- o backend precisa extrair o pacote;
- midias sao persistidas no banco;
- o MVP nao usa job assincrono, polling, SSE ou WebSocket para progresso real.

O limite configuravel de upload no backend usa:
- `MAX_APKG_UPLOAD_SIZE`;
- `MAX_APKG_BYTES`.

Os defaults atuais permitem ate cerca de 200 MB, mas isso nao significa que
arquivos muito grandes sejam ideais para uso continuo no MVP.

## 8. Direitos de conteudo

Importar um `.apkg` nao garante que o usuario tenha direito de redistribuir seu
conteudo.

Cuidados:
- use baralhos proprios ou com permissao adequada;
- revise licencas de decks obtidos de terceiros;
- evite publicar conteudo protegido sem autorizacao.

## 9. Como validar uma importacao

Checklist recomendado:
1. O preview abriu sem erro.
2. A quantidade de cartas parece coerente.
3. Frente e verso estao legiveis.
4. Imagens essenciais aparecem.
5. Audios essenciais tocam.
6. Tags importantes foram preservadas quando aplicavel.
7. O baralho salvo aparece em `Meus baralhos`.
8. O estudo renderiza as midias apos salvar.

Se um baralho depender de recursos avancados do Anki, ele pode precisar de
ajuste manual apos a importacao.
