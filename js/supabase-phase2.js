/**
   * CONFIGURAÇÕES SUPABASE E USUÁRIO LOGADO
   */
  const SUPABASE_CONFIG = {
    url: 'https://vvgdvigeqgbsozncunyu.supabase.co',
    key: 'sb_publishable_ypPbYVlKrkSUoUU1g693ew_Tx2vUbzE',
    table: 'jogos'
  };

  const META_ANUAL = 12;
  let biblioteca = [];
  let connectionInfo = {
    mode: 'Iniciando',
    lastSync: null,
    latency: null,
    error: null
  };
  
  // NOVO: Armazena os dados do usuário atualmente logado
  let currentUser = null;

  let supabaseSdk = null;

  // Mantém o usuário no fluxo de autenticação correspondente à versão do preview.
  function getLoginRedirectPath() {
    const path = String(window.location.pathname || '').toLowerCase();
    return /(?:fase4|phase4)/.test(path) ? 'index-phase4.html' : 'index-phase3.html';
  }

  function initSupabaseClient() {
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      supabaseSdk = null;
      connectionInfo.mode = 'Falha crítica: SDK indisponível';
      console.error('A biblioteca oficial do Supabase não foi carregada.');
      return false;
    }

    try {
      supabaseSdk = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      connectionInfo.mode = 'SDK Oficial (supabase-js)';
      return true;
    } catch (error) {
      supabaseSdk = null;
      connectionInfo.mode = 'Falha ao inicializar o SDK';
      connectionInfo.error = error && error.message ? error.message : 'Erro desconhecido';
      console.error('Falha ao inicializar o SDK oficial do Supabase:', error);
      return false;
    }
  }

  async function verificarSessao() {
    if (!supabaseSdk) {
      showToast('O SDK do Supabase não está disponível. Verifique a conexão e tente novamente.', 'error');
      setTimeout(() => { window.location.href = getLoginRedirectPath(); }, 2000);
      return false;
    }

    try {
      const { data, error } = await supabaseSdk.auth.getSession();
      if (error) throw error;

      if (!data || !data.session || !data.session.user) {
        window.location.href = getLoginRedirectPath();
        return false;
      }

      currentUser = data.session.user;
      return true;
    } catch (error) {
      connectionInfo.error = error && error.message ? error.message : 'Não foi possível validar a sessão';
      console.error('Falha ao validar a sessão do Supabase:', error);
      showToast('Não foi possível validar a sessão. Recarregue a página e tente novamente.', 'error');
      return false;
    }
  }

  // NOVO: Função para deslogar
  async function fazerLogout() {
    try {
      if (supabaseSdk) await supabaseSdk.auth.signOut();
    } catch (error) {
      console.error('Falha ao encerrar a sessão:', error);
    } finally {
      window.location.href = getLoginRedirectPath();
    }
  }

  function exigirUsuarioAutenticado() {
    if (!supabaseSdk || !currentUser || !currentUser.id) {
      throw new Error('Sessão inválida. Entre novamente para continuar.');
    }
  }

  // Filtro no cliente é defesa adicional; as políticas RLS do Supabase são obrigatórias.
  const db = {
    async selectAll() {
      exigirUsuarioAutenticado();
      const { data, error } = await supabaseSdk
        .from(SUPABASE_CONFIG.table)
        .select('*')
        .eq('user_id', currentUser.id)
        .order('id', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async insert(game) {
      exigirUsuarioAutenticado();
      const payload = { ...game, user_id: currentUser.id };
      const { data, error } = await supabaseSdk
        .from(SUPABASE_CONFIG.table)
        .insert([payload])
        .select('id');
      if (error) throw error;
      return data;
    },

    async update(id, game) {
      exigirUsuarioAutenticado();
      const payload = { ...game };
      // Nunca aceitar alteração do proprietário enviada pelo formulário/cliente.
      delete payload.user_id;

      const { data, error } = await supabaseSdk
        .from(SUPABASE_CONFIG.table)
        .update(payload)
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select('id');
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Jogo não encontrado ou sem permissão para alteração.');
      }
      return data;
    },

    async delete(id) {
      exigirUsuarioAutenticado();
      const { data, error } = await supabaseSdk
        .from(SUPABASE_CONFIG.table)
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select('id');
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Jogo não encontrado ou sem permissão para exclusão.');
      }
      return true;
    }
  };
