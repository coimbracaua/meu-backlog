# Auditoria Fase 1 — ficheiros candidatos

Esta branch contém cópias de teste e um modelo de políticas RLS. Os ficheiros originais app.html e index.html foram preservados.

## Ficheiros novos

- app-audit.html — cópia candidata da aplicação com SDK oficial obrigatório, filtro explícito por utilizador em leituras/alterações/exclusões, proteção do user_id na escrita, cálculo local de datas, tabela/diagnóstico/toasts construídos sem inserir conteúdo do servidor como HTML.
- index-audit.html — página de login/cadastro que direciona apenas para app-audit.html, com verificação segura da disponibilidade do SDK e recuperação dos botões após erros de rede.
- policies_rls_audit.sql — modelo de políticas RLS; revisar e aplicar manualmente no projeto Supabase.
- FASE1-AUDITORIA.md — este documento.

## Como testar sem substituir os originais

1. Abra a branch audit/fase-1-hardening no GitHub e reveja os quatro ficheiros novos.
2. Para testar no site publicado, use /index-audit.html se os ficheiros desta branch forem servidos por um deploy de preview da branch.
3. Não copie app-audit.html por cima de app.html nem index-audit.html por cima de index.html durante a avaliação.
4. Antes de avaliar isolamento, inspecione as políticas atuais da tabela public.jogos no Supabase e revise policies_rls_audit.sql. Não execute às cegas se a tabela tiver outras políticas permissivas ou se user_id não for UUID.
5. Teste com duas contas autenticadas: cada conta deve ver apenas os seus jogos; tente também atualizar e excluir um registo que pertença à outra conta. Faça esses testes apenas com dados de teste.

## Limites desta entrega

- O filtro do frontend é defesa adicional e não substitui RLS no servidor.
- A existência e eficácia das políticas RLS reais não foi verificada, porque estes ficheiros não dão acesso à configuração SQL do projeto Supabase.
- Os ficheiros novos foram preparados para revisão e ainda precisam de um teste funcional no ambiente de preview com autenticação/Supabase.
- O Vercel atualmente possui rotas principais para os ficheiros originais. Confirme que a branch gera um deployment de preview e que as novas rotas HTML são servidas antes de testar.
