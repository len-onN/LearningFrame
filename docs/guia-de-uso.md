# Guia de Uso do MVP

Este guia explica como usar o LearningFrame para estudar no escopo atual do
MVP.

O LearningFrame foi desenhado para apoiar estudo com:
- recordação ativa;
- repetição espaçada;
- prática intercalada.

A conta é opcional para experimentar. Ela passa a ser necessária quando o
usuário quer persistir baralhos, cartas, mídias, revisões e progresso.

## 1. Entrar na aplicação

Com a aplicação rodando, abra:

```txt
http://localhost:8080
```

A tela inicial leva para a Biblioteca pública.

## 2. Estudar sem conta

Visitantes podem estudar baralhos públicos sem cadastro.

Fluxo:
1. Abra `Biblioteca`.
2. Entre em `Baralhos públicos`.
3. Escolha um baralho.
4. Clique em `Estudar`.
5. Leia a frente da carta.
6. Clique para revelar a resposta.
7. Avalie sua lembranca com:
   - `De novo`;
   - `Difícil`;
   - `Bom`;
   - `Fácil`.

No estudo anônimo, o progresso da revisão e local ao navegador. Para persistir
histórico e progresso de forma vinculada a uma conta, e necessário entrar.

## 3. Criar conta e entrar

Use `Entrar` ou uma ação privada, como `Meus baralhos`, `Criar` ou `Salvar para
mim`.

Regras principais:
- cadastro exige nome, email e senha;
- a senha precisa atender a regra forte exibida no formulario;
- rotas privadas redirecionam para login;
- depois do login, a aplicação volta ao destino original quando houver
  redirect.

## 4. Salvar um baralho público

Um usuário autenticado pode copiar um baralho público para sua biblioteca.

Fluxo:
1. Entre na conta.
2. Abra `Biblioteca > Baralhos públicos`.
3. Clique em `Salvar para mim`.
4. A aplicação cria uma cópia privada.
5. A cópia aparece em `Meus baralhos` com destaque temporário.

A cópia passa a pertencer ao usuário e pode ser gerenciada sem alterar o
baralho público original.

## 5. Criar um baralho próprio

Fluxo:
1. Entre na conta.
2. Abra `Criar`.
3. Informe título, descrição e visibilidade.
4. Salve.
5. A aplicação abre o gerenciamento do baralho criado.

Visibilidade:
- `Privado`: aparece apenas para o usuário dono.
- `Público`: pode aparecer na biblioteca pública.

## 6. Gerenciar cartas

Em `Biblioteca > Meus baralhos`, abra `Gerenciar` em um baralho próprio.

Nessa tela é possível:
- editar título, descrição e visibilidade;
- buscar cartas;
- carregar mais cartas;
- criar carta;
- editar carta;
- excluir carta;
- selecionar cartas visíveis;
- excluir cartas em lote;
- excluir o baralho.

O gerenciamento de cartas e paginado para evitar carregar baralhos grandes de
uma vez.

## 7. Criar e editar cartas

Ao criar ou editar uma carta, o editor abre em uma superfície dedicada com:
- campo de frente;
- campo de verso;
- campo de tags;
- preview seguro do conteúdo.

As cartas aceitam HTML básico. O conteúdo passa por sanitização antes de ser
renderizado no estudo.

## 8. Usar imagem e audio

Em baralhos persistidos, o usuário pode enviar mídias pelo editor de carta.

Fluxo:
1. Abra o editor de carta.
2. Escolha inserir imagem ou audio.
3. Selecione o arquivo.
4. O upload cria a mídia no baralho.
5. O editor insere um marcador no campo ativo.

Marcadores usados:
- imagens entram como `<img src="arquivo">`;
- audios entram como `[sound:arquivo]`.

No estudo, imagens e audios persistidos são renderizados no card.

## 9. Estudar um baralho próprio

Fluxo:
1. Entre na conta.
2. Abra `Meus baralhos`.
3. Escolha um baralho.
4. Clique em `Estudar`.
5. Revele a resposta.
6. Avalie a carta.

Para usuários autenticados, cada revisão e enviada ao backend e atualiza o
estado de repetição espaçada do LearningFrame.

O estudo mostra:
- progresso da sessão;
- quantidade revisada;
- feedback local após rating;
- resumo ao concluir;
- controles de tamanho de fonte;
- controle para ajustar mídias grandes ao card.

## 10. Usar prática intercalada

A prática intercalada mistura cartas elegíveis em uma sessão.

Objetivo:
- evitar estudar sempre um único assunto em bloco;
- aproximar a prática de recuperacao de contextos variados;
- reforçar o uso da recordação ativa.

Fluxo:
1. Entre na conta.
2. Clique em `Prática intercalada`.
3. Revele e avalie as cartas.
4. Acompanhe progresso e resumo final.

No MVP, a prática intercalada é simples. Ela não possui configurador avançado
de decks, limites ou tipos de carta.

## 11. Configurar limites de estudo

Usuários autenticados podem definir sua carga diária no menu `Configurações`.
É possível definir:
- Limite de novas cartas por dia.
- Limite de revisões por dia.

O sistema de estudo sob demanda respeitará essas escolhas e mostrará uma mensagem na tela quando o limite do dia for alcançado.

## 12. Acompanhar progresso

Usuários autenticados podem abrir `Progresso`.

A página mostra métricas essenciais, como:
- total de baralhos;
- total de cartas;
- revisões recentes;
- cards revisados hoje.

O MVP não inclui dashboard analitico avançado, graficos históricos complexos ou
metas diarias.

## 13. Entender os ratings

Os ratings indicam a qualidade da lembranca:

- `De novo`: a resposta não foi lembrada adequadamente.
- `Difícil`: a resposta foi lembrada com muito esforço.
- `Bom`: a resposta foi lembrada de forma aceitável.
- `Fácil`: a resposta foi lembrada com facilidade.

O LearningFrame usa esses ratings para calcular a próxima revisão em uma agenda
própria simplificada.

## 14. Fluxo recomendado de demonstração

Para demonstrar o MVP de ponta a ponta:
1. Abrir a Biblioteca pública sem login.
2. Estudar um baralho público anonimamente.
3. Abrir Importar e fazer preview de um `.apkg`.
4. Criar conta.
5. Salvar o APKG ou um baralho público.
6. Criar um baralho manual.
7. Criar uma carta com texto e mídia.
8. Estudar o baralho autenticado.
9. Abrir Progresso.
10. Usar Prática intercalada.

Esse roteiro mostra a diferenca entre experimentar sem conta e persistir estudo
com usuário autenticado.
