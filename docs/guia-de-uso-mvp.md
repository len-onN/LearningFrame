# Guia de Uso do MVP

Este guia explica como usar o LearningFrame para estudar no escopo atual do
MVP.

O LearningFrame foi desenhado para apoiar estudo com:
- recordacao ativa;
- repeticao espacada;
- pratica intercalada.

A conta e opcional para experimentar. Ela passa a ser necessaria quando o
usuario quer persistir baralhos, cartas, midias, revisoes e progresso.

## 1. Entrar na aplicacao

Com a aplicacao rodando, abra:

```txt
http://localhost:8080
```

A tela inicial leva para a Biblioteca publica.

## 2. Estudar sem conta

Visitantes podem estudar baralhos publicos sem cadastro.

Fluxo:
1. Abra `Biblioteca`.
2. Entre em `Baralhos publicos`.
3. Escolha um baralho.
4. Clique em `Estudar`.
5. Leia a frente da carta.
6. Clique para revelar a resposta.
7. Avalie sua lembranca com:
   - `De novo`;
   - `Dificil`;
   - `Bom`;
   - `Facil`.

No estudo anonimo, o progresso da revisao e local ao navegador. Para persistir
historico e progresso de forma vinculada a uma conta, e necessario entrar.

## 3. Criar conta e entrar

Use `Entrar` ou uma acao privada, como `Meus baralhos`, `Criar` ou `Salvar para
mim`.

Regras principais:
- cadastro exige nome, email e senha;
- a senha precisa atender a regra forte exibida no formulario;
- rotas privadas redirecionam para login;
- depois do login, a aplicacao volta ao destino original quando houver
  redirect.

## 4. Salvar um baralho publico

Um usuario autenticado pode copiar um baralho publico para sua biblioteca.

Fluxo:
1. Entre na conta.
2. Abra `Biblioteca > Baralhos publicos`.
3. Clique em `Salvar para mim`.
4. A aplicacao cria uma copia privada.
5. A copia aparece em `Meus baralhos` com destaque temporario.

A copia passa a pertencer ao usuario e pode ser gerenciada sem alterar o
baralho publico original.

## 5. Criar um baralho proprio

Fluxo:
1. Entre na conta.
2. Abra `Criar`.
3. Informe titulo, descricao e visibilidade.
4. Salve.
5. A aplicacao abre o gerenciamento do baralho criado.

Visibilidade:
- `Privado`: aparece apenas para o usuario dono.
- `Publico`: pode aparecer na biblioteca publica.

## 6. Gerenciar cartas

Em `Biblioteca > Meus baralhos`, abra `Gerenciar` em um baralho proprio.

Nessa tela e possivel:
- editar titulo, descricao e visibilidade;
- buscar cartas;
- carregar mais cartas;
- criar carta;
- editar carta;
- excluir carta;
- selecionar cartas visiveis;
- excluir cartas em lote;
- excluir o baralho.

O gerenciamento de cartas e paginado para evitar carregar baralhos grandes de
uma vez.

## 7. Criar e editar cartas

Ao criar ou editar uma carta, o editor abre em uma superficie dedicada com:
- campo de frente;
- campo de verso;
- campo de tags;
- preview seguro do conteudo.

As cartas aceitam HTML basico. O conteudo passa por sanitizacao antes de ser
renderizado no estudo.

## 8. Usar imagem e audio

Em baralhos persistidos, o usuario pode enviar midias pelo editor de carta.

Fluxo:
1. Abra o editor de carta.
2. Escolha inserir imagem ou audio.
3. Selecione o arquivo.
4. O upload cria a midia no baralho.
5. O editor insere um marcador no campo ativo.

Marcadores usados:
- imagens entram como `<img src="arquivo">`;
- audios entram como `[sound:arquivo]`.

No estudo, imagens e audios persistidos sao renderizados no card.

## 9. Estudar um baralho proprio

Fluxo:
1. Entre na conta.
2. Abra `Meus baralhos`.
3. Escolha um baralho.
4. Clique em `Estudar`.
5. Revele a resposta.
6. Avalie a carta.

Para usuarios autenticados, cada revisao e enviada ao backend e atualiza o
estado de repeticao espacada do LearningFrame.

O estudo mostra:
- progresso da sessao;
- quantidade revisada;
- feedback local apos rating;
- resumo ao concluir;
- controles de tamanho de fonte;
- controle para ajustar midias grandes ao card.

## 10. Usar pratica intercalada

A pratica intercalada mistura cartas elegiveis em uma sessao.

Objetivo:
- evitar estudar sempre um unico assunto em bloco;
- aproximar a pratica de recuperacao de contextos variados;
- reforcar o uso da recordacao ativa.

Fluxo:
1. Entre na conta.
2. Clique em `Pratica intercalada`.
3. Revele e avalie as cartas.
4. Acompanhe progresso e resumo final.

No MVP, a pratica intercalada e simples. Ela nao possui configurador avancado
de decks, limites ou tipos de carta.

## 11. Acompanhar progresso

Usuarios autenticados podem abrir `Progresso`.

A pagina mostra metricas essenciais, como:
- total de baralhos;
- total de cartas;
- revisoes recentes;
- cards revisados hoje.

O MVP nao inclui dashboard analitico avancado, graficos historicos complexos ou
metas diarias.

## 12. Entender os ratings

Os ratings indicam a qualidade da lembranca:

- `De novo`: a resposta nao foi lembrada adequadamente.
- `Dificil`: a resposta foi lembrada com muito esforco.
- `Bom`: a resposta foi lembrada de forma aceitavel.
- `Facil`: a resposta foi lembrada com facilidade.

O LearningFrame usa esses ratings para calcular a proxima revisao em uma agenda
propria simplificada.

## 13. Fluxo recomendado de demonstracao

Para demonstrar o MVP de ponta a ponta:
1. Abrir a Biblioteca publica sem login.
2. Estudar um baralho publico anonimamente.
3. Abrir Importar e fazer preview de um `.apkg`.
4. Criar conta.
5. Salvar o APKG ou um baralho publico.
6. Criar um baralho manual.
7. Criar uma carta com texto e midia.
8. Estudar o baralho autenticado.
9. Abrir Progresso.
10. Usar Pratica intercalada.

Esse roteiro mostra a diferenca entre experimentar sem conta e persistir estudo
com usuario autenticado.
