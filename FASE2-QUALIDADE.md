# Fase 2 — Qualidade técnica e manutenção

## Objetivo

Evoluir a cópia candidata da Fase 1 para uma estrutura mais fácil de manter e testar, preservando os ficheiros originais e os ficheiros da Fase 1.

## Estrutura nova

- `app-phase2.html` e `index-phase2.html`: páginas candidatas da Fase 2.
- `css/app-phase2.css` e `css/auth-phase2.css`: estilos extraídos dos HTML.
- `js/supabase-phase2.js`: configuração do SDK, sessão e acesso aos dados.
- `js/app-phase2.js`: renderização, filtros, datas, eventos e interface.
- `js/auth-phase2.js`: login, cadastro e redirecionamento.
- `tests/phase2-quality.test.cjs`: testes usando o test runner nativo do Node.
- `package.json`: comandos para validar sintaxe e executar testes.
- `policies_rls_audit.sql`: modelo SQL iniciado na Fase 1.
- `vercel.json`: lista explicitamente HTML, CSS e JS estáticos nesta branch para não omitir os assets extraídos.

## Executar testes localmente

Requer Node.js 20 ou superior. Não são necessárias dependências npm externas.

```sh
npm run check
npm test
npm run validate
```

Os testes cobrem referências aos assets, sintaxe, filtragem por utilizador, ausência do fallback REST, renderização segura e utilitários de data.

## Como testar sem tocar nos originais

1. Gere um deployment de preview desta branch no Vercel (se a integração Git estiver ativa).
2. Abra `/index-phase2.html` no URL do preview e confirme que os assets CSS/JS respondem com sucesso.
3. Teste login/cadastro/logout, criar/editar/apagar, filtros e diagnóstico.
4. Com duas contas de teste, confirme o isolamento de dados em SELECT/INSERT/UPDATE/DELETE.
5. Verifique os logs da consola e as respostas de rede.

## Limites

- Os ficheiros continuam a ser candidatos de revisão, não substituem `app.html`, `index.html`, `app-audit.html` nem `index-audit.html`.
- A validação de sintaxe e os testes estáticos não substituem um teste E2E no navegador.
- A eficácia das políticas RLS existentes não foi confirmada a partir do frontend. Reveja as políticas atuais antes de aplicar `policies_rls_audit.sql`.
- Esta branch inclui a configuração de assets estáticos para CSS/JS, mas a publicação de preview e as rotas têm de ser verificadas no projeto Vercel real.

## Manutenção

Ao acrescentar um ficheiro JavaScript, adicione-o a `npm run check` e à suite de testes. Evite inserir valores de jogos em `innerHTML` ou concatená-los em handlers inline; use `textContent`, construção por DOM e `addEventListener`.
