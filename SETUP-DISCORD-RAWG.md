# Configuração manual — Discord OAuth e capas RAWG

Esta branch mantém as mudanças isoladas; nada foi integrado à `main`.

## 1. RAWG (busca e capas)
1. Crie uma conta e obtenha a API key em https://rawg.io/apidocs.
2. Na Vercel, abra o projeto de produção e também o preview do projeto, se necessário, em **Settings → Environment Variables**.
3. Crie `RAWG_API_KEY` com a chave RAWG nos ambientes desejados e faça redeploy do preview.
4. No Supabase SQL Editor, execute `supabase/migrations/20261024090000_profiles_and_cover.sql` para adicionar `jogos.capa_url` e a tabela de perfis.
5. Teste a busca de um jogo, selecione uma sugestão e salve. A chave RAWG fica no servidor Vercel, não no JavaScript público.

O endpoint retorna somente os campos necessários e limita a busca a sete resultados. A capa e os metadados vêm do catálogo RAWG e podem não estar disponíveis para todos os jogos.

## 2. Discord OAuth
1. Em https://discord.com/developers/applications, crie/abra uma aplicação, configure OAuth2 e copie o **Client ID** e **Client Secret**.
2. No Supabase Dashboard → **Authentication → Providers → Discord**, ative Discord e informe essas credenciais.
3. Em Supabase → **Authentication → URL Configuration**, inclua a URL de produção e a URL de preview na lista de **Redirect URLs**. O callback OAuth mostrado no painel Supabase deve ser cadastrado nos Redirects da aplicação Discord.
4. Execute a migration SQL acima; ela cria/atualiza `public.profiles` a partir dos metadados do Supabase Auth (username e avatar), inclusive para contas existentes.
5. Teste login e logout com uma conta Discord.

O botão OAuth já usa `signInWithOAuth({ provider: 'discord' })`, mas o login só funcionará após o provider ser ativado no painel. A tabela `profiles` é separada de `jogos`; o gatilho não concede acesso de escrita público e a RLS limita leitura/atualização ao próprio usuário.

## 3. Fluxo visual
- Sidebar: Visão Geral, Minha Biblioteca e Configurações.
- Perfil: nome/e-mail e avatar retornados pelo Supabase Auth, com menu de saída.
- Biblioteca: cartões com capa real quando há URL salva; sugestões de autocomplete preenchem título, gênero, plataforma e capa.
- Se uma chave/provedor ainda não estiver configurado, a funcionalidade informa a configuração necessária; não há credenciais secretas no repositório.
