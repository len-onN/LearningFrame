# Objetivo: Atualizar o Editor de Cartas para WYSIWYG

## Contexto
O nosso editor de cartas atual (`CardEditorOverlay.vue`) funciona muito bem debaixo dos panos: o upload de imagens e áudio já tem integração com o backend via multipart/form-data. Quando uma imagem é enviada, inserimos um marcador textual puro no `<textarea>`. No entanto, para formatar texto (como negrito ou listas), o usuário ainda precisa escrever tags HTML manualmente. 

## O que precisamos implementar
Apenas mudanças no Frontend:
1. **Substituir o `<textarea>`**: Instalar e configurar uma biblioteca de edição rica (WYSIWYG) leve, como **Quill.js** ou **Tiptap**, substituindo os campos de Frente e Verso.
2. **Formatação Básica**: A barra de ferramentas do editor deve incluir Negrito, Itálico, Sublinhado e Listas (ordenadas/não-ordenadas).
3. **Integração de Mídias (Imagens)**: O upload de imagens já funciona no nosso `CardEditorOverlay`. Devemos conectar nosso método de upload existente ao novo editor para que, ao fazer upload da imagem, ela seja exibida de forma renderizada e elegante dentro do próprio corpo do texto (e não como um código bruto).

Por favor, analise as dependências atuais no `package.json` do frontend e o arquivo `CardEditorOverlay.vue`. Me proponha qual biblioteca WYSIWYG é a melhor escolha para o nosso ecossistema Vue 3 e faça um Plano de Implementação para a substituição!
