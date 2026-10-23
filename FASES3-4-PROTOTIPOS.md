# Fases 3 e 4 — protótipos aditivos

Branch criada a partir de `audit/fase-2-quality`. Nenhum ficheiro original, da Fase 1 ou da Fase 2 foi editado; esta branch apenas acrescenta ficheiros novos.

## Fase 3 — UX e descoberta
- Dashboard com métricas e distribuição por status, respeitando os filtros.
- Vista visual em cartões com capas gráficas geradas por CSS (não são capas oficiais).
- Seletor aleatório de jogos na fila ou pausados.
- Páginas: `index-phase3.html`, `app-phase3.html`.

## Fase 4 — ferramentas avançadas
- Exportar biblioteca em JSON e importar com validação e confirmação explícita. Importação só acrescenta registos; pode criar duplicados.
- Lista de desejos e diário de sessões guardados localmente, com chave por ID de conta no navegador.
- Os dados locais não sincronizam entre dispositivos e não alteram automaticamente horas na base de dados.
- Páginas: `index-phase4.html`, `app-phase4.html`.

## Validação
O workflow faz verificações de sintaxe e testes estáticos. Isso não substitui testes em browser nem confirma as políticas RLS. Antes de produção, validar login, CRUD, isolamento entre duas contas e importação/exportação em deployment de preview. Não integrar antes de verificar as Fases 1 e 2.
