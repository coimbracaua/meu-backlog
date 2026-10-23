/**
   * INICIALIZAÇÃO E PROTEÇÃO
   */
  document.addEventListener('DOMContentLoaded', async () => {
    initSupabaseClient();
    
    // NOVO: Verifica se o usuário tem permissão de estar aqui antes de carregar o banco
    const logado = await verificarSessao();
    if (!logado) return; // Interrompe o carregamento se não houver usuário logado

    carregarDoBanco();

    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        fecharModal();
        fecharModalDiagnostico();
      }
    });
  });

  /**
   * BUSCAR DADOS DA NUVEM
   */
  async function carregarDoBanco(forceFeedback = false) {
    const statusBadge = document.getElementById('sync-status');
    const syncText = document.getElementById('sync-text');
    
    statusBadge.className = 'sync-badge loading';
    syncText.textContent = 'Sincronizando...';
    
    const startTime = performance.now();

    try {
      const data = await db.selectAll();
      const endTime = performance.now();
      
      connectionInfo.latency = Math.round(endTime - startTime);
      connectionInfo.lastSync = new Date();
      connectionInfo.error = null;

      // Mapeamento dos registros
      biblioteca = (data || []).map(row => ({
        id: row.id,
        titulo: row.titulo || 'Sem título',
        plataforma: (row.plataforma || '').trim().toUpperCase(),
        genero: row.genero || '',
        status: row.status || 'Na Fila',
        nota: Number(row.nota) || 0,
        horas: Number(row.horas_jogadas) || 0,
        dataInicio: row.data_inicio || '',
        obs: row.obs || ''
      }));

      popularDropdowns();
      aplicarFiltros();

      statusBadge.className = 'sync-badge success';
      syncText.textContent = `Nuvem OK (${connectionInfo.latency}ms)`;

      if (forceFeedback) {
        showToast('Biblioteca sincronizada com sucesso!', 'success');
      }
    } catch (err) {
      console.error("Erro ao conectar ou buscar dados do Supabase:", err);
      connectionInfo.error = err.message;
      
      statusBadge.className = 'sync-badge error';
      syncText.textContent = 'Erro de Conexão';
      
      showToast(`Falha de conexão: ${err.message}`, 'error');
      
      const tbody = document.getElementById('table-body');
      tbody.replaceChildren();

      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 8;
      td.style.cssText = 'text-align:center; padding:30px; color:#f87171;';

      const title = document.createElement('strong');
      title.textContent = '⚠️ Não foi possível carregar os jogos do Supabase.';
      const detail = document.createElement('div');
      detail.style.cssText = 'font-size:12px; color:var(--text-muted); margin:8px 0;';
      detail.textContent = connectionInfo.error || 'Erro de conexão desconhecido.';

      const retryButton = document.createElement('button');
      retryButton.type = 'button';
      retryButton.className = 'btn btn-outline';
      retryButton.textContent = 'Tentar Novamente';
      retryButton.addEventListener('click', () => carregarDoBanco(true));

      td.append(title, document.createElement('br'), detail, document.createElement('br'), retryButton);
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
  }

  /**
   * SALVAR JOGO (INSERT OU UPDATE)
   */
  async function salvarJogo(e) {
    e.preventDefault();
    
    const id = document.getElementById('form-id').value;
    const btnSalvar = document.getElementById('btn-salvar');
    const btnText = document.getElementById('btn-salvar-text');
    
    // Validação básica
    const titulo = document.getElementById('form-titulo').value.trim();
    const plataforma = document.getElementById('form-plat').value.trim().toUpperCase();
    
    if (!titulo || !plataforma) {
      showToast('Preencha o título e a plataforma do jogo!', 'error');
      return;
    }

    // Feedback visual de carregamento
    btnSalvar.disabled = true;
    btnText.textContent = 'Salvando na Nuvem...';

    const dataInicioVal = document.getElementById('form-inicio').value;

    const dbObj = {
      titulo: titulo,
      plataforma: plataforma,
      genero: document.getElementById('form-genero').value.trim(),
      status: document.getElementById('form-status').value,
      nota: parseFloat(document.getElementById('form-nota').value) || 0,
      horas_jogadas: parseFloat(document.getElementById('form-horas').value) || 0,
      data_inicio: dataInicioVal ? dataInicioVal : null,
      obs: document.getElementById('form-obs').value.trim(),
      // NOVO: Adiciona obrigatoriamente a assinatura do dono do jogo para a regra RLS
      user_id: currentUser.id
    };

    try {
      if (id) {
        await db.update(id, dbObj);
        showToast(`"${titulo}" atualizado com sucesso!`, 'success');
      } else {
        await db.insert(dbObj);
        showToast(`"${titulo}" adicionado à sua biblioteca!`, 'success');
      }

      fecharModal();
      await carregarDoBanco(); // Atualiza a tabela
    } catch (err) {
      console.error("Erro ao salvar jogo no Supabase:", err);
      showToast(`Erro ao salvar no banco: ${err.message}`, 'error');
    } finally {
      btnSalvar.disabled = false;
      btnText.textContent = 'Salvar na Nuvem';
    }
  }

  /**
   * EXCLUIR JOGO
   */
  async function excluir(id, nomeJogo) {
    const confirmMsg = `Tem certeza que deseja remover permanentemente "${nomeJogo}" da sua biblioteca?`;
    if (!confirm(confirmMsg)) return;

    try {
      await db.delete(id);
      showToast(`"${nomeJogo}" removido com sucesso.`, 'info');
      await carregarDoBanco();
    } catch (err) {
      console.error("Erro ao excluir jogo:", err);
      showToast(`Erro ao excluir: ${err.message}`, 'error');
    }
  }

  /**
   * CONTROLE DE MODAL
   */
  function getLocalDateString() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function abrirModal(id = null) {
    const form = document.getElementById('form-jogo');
    form.reset();
    document.getElementById('form-id').value = '';
    document.getElementById('modal-title').textContent = id ? 'Editar Jogo' : 'Registrar Jogo';

    if (id) {
      const j = biblioteca.find(x => String(x.id) === String(id));
      if (j) {
        document.getElementById('form-id').value = j.id;
        document.getElementById('form-titulo').value = j.titulo;
        document.getElementById('form-plat').value = j.plataforma;
        document.getElementById('form-genero').value = j.genero;
        document.getElementById('form-status').value = j.status;
        document.getElementById('form-nota').value = j.nota || 0;
        document.getElementById('form-horas').value = j.horas > 0 ? j.horas : '';
        document.getElementById('form-inicio').value = j.dataInicio ? j.dataInicio.split('T')[0] : '';
        document.getElementById('form-obs').value = j.obs || '';
      }
    } else {
      document.getElementById('form-inicio').value = getLocalDateString();
    }
    
    document.getElementById('modal-jogo').classList.add('active');
    setTimeout(() => document.getElementById('form-titulo').focus(), 100);
  }

  function fecharModal() {
    document.getElementById('modal-jogo').classList.remove('active');
  }

  function handleOverlayClick(e, modalId) {
    if (e.target.id === modalId) {
      if (modalId === 'modal-jogo') fecharModal();
      else if (modalId === 'modal-diag') fecharModalDiagnostico();
    }
  }

  function abrirModalDiagnostico() {
    atualizarTextoDiagnostico();
    document.getElementById('modal-diag').classList.add('active');
  }

  function fecharModalDiagnostico() {
    document.getElementById('modal-diag').classList.remove('active');
  }

  function atualizarTextoDiagnostico() {
    const box = document.getElementById('diag-details');
    const lines = [
      'Supabase URL: ' + SUPABASE_CONFIG.url,
      'Tabela: ' + SUPABASE_CONFIG.table,
      'Motor: ' + connectionInfo.mode,
      'Latência: ' + (connectionInfo.latency !== null ? connectionInfo.latency + ' ms' : 'N/D'),
      'Último Sync: ' + (connectionInfo.lastSync ? connectionInfo.lastSync.toLocaleTimeString() : 'N/D'),
      'Status SDK: ' + (supabaseSdk ? 'Carregado com sucesso' : 'Indisponível'),
      'ID Utilizador: ' + (currentUser ? currentUser.id : 'Nenhum'),
      'Erro: ' + (connectionInfo.error || 'Nenhum')
    ];

    const pre = document.createElement('pre');
    pre.style.cssText = 'font-family:inherit; margin:0; white-space:pre-wrap;';
    pre.textContent = lines.join('\n');
    box.replaceChildren(pre);
  }

  async function testarConexaoManual() {
    if (!supabaseSdk || !currentUser) {
      showToast('Não há uma sessão autenticada para testar a ligação.', 'error');
      atualizarTextoDiagnostico();
      return;
    }
    await carregarDoBanco(true);
    atualizarTextoDiagnostico();
  }

  /**
   * RENDERIZAÇÃO E FILTROS
   */
  function popularDropdowns() {
    const pSel = document.getElementById('plat-select');
    const plAtual = pSel.value;
    const plats = [...new Set(biblioteca.map(j => j.plataforma))].filter(Boolean).sort();
    
    pSel.replaceChildren();
    const todasOption = document.createElement('option');
    todasOption.value = '';
    todasOption.textContent = 'Todas as Plataformas';
    pSel.appendChild(todasOption);
    plats.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      pSel.appendChild(opt);
    });
    
    if (plats.includes(plAtual)) pSel.value = plAtual;
  }

  function aplicarFiltros() {
    const text = document.getElementById('search-input').value.toLowerCase().trim();
    const st = document.getElementById('status-select').value;
    const pl = document.getElementById('plat-select').value;
    const sort = document.getElementById('sort-select').value;

    let list = biblioteca.filter(j => {
      const matchText = !text || 
        j.titulo.toLowerCase().includes(text) || 
        j.genero.toLowerCase().includes(text) || 
        j.plataforma.toLowerCase().includes(text) ||
        j.obs.toLowerCase().includes(text);
      
      const matchSt = !st || j.status === st;
      const matchPl = !pl || j.plataforma === pl;
      return matchText && matchSt && matchPl;
    });

    // Ordenação
    list.sort((a, b) => {
      if (sort === 'nome_asc') return a.titulo.localeCompare(b.titulo);
      if (sort === 'nome_desc') return b.titulo.localeCompare(a.titulo);
      if (sort === 'nota_desc') return (b.nota || 0) - (a.nota || 0);
      if (sort === 'horas_desc') return (b.horas || 0) - (a.horas || 0);
      if (sort === 'antigos') return (a.id || 0) - (b.id || 0);
      return (b.id || 0) - (a.id || 0); // recentes por padrão
    });

    renderTabela(list);
    renderKPIs(list);
  }

  function renderKPIs(list) {
    document.getElementById('kpi-total').textContent = String(list.length);

    const totalHoras = list.reduce((acc, game) => acc + (parseFloat(game.horas) || 0), 0);
    document.getElementById('kpi-horas').textContent = totalHoras.toFixed(1) + 'h';

    const zerados = list.filter(game => game.status === 'Zerado').length;
    const zeradosBox = document.getElementById('kpi-zerados');
    zeradosBox.replaceChildren();
    zeradosBox.appendChild(document.createTextNode(String(zerados) + ' '));

    const meta = document.createElement('span');
    meta.style.cssText = 'font-size:14px; color:#94a3b8; font-weight:600;';
    meta.textContent = '/ ' + META_ANUAL + ' zerados';
    zeradosBox.appendChild(meta);

    const pct = Math.min(100, (zerados / META_ANUAL) * 100);
    document.getElementById('kpi-progress').style.width = pct + '%';

    const avaliados = list.filter(game => Number(game.nota) > 0 && game.status === 'Zerado');
    const media = avaliados.length
      ? avaliados.reduce((acc, game) => acc + Number(game.nota), 0) / avaliados.length
      : 0;
    document.getElementById('kpi-nota').textContent = media.toFixed(1);
  }

  function renderTabela(list) {
    const tbody = document.getElementById('table-body');
    tbody.replaceChildren();

    if (!Array.isArray(list) || list.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 8;
      td.style.cssText = 'text-align:center; color:var(--text-muted); padding:36px;';
      td.appendChild(document.createTextNode('Nenhum jogo encontrado para os filtros selecionados.'));
      td.appendChild(document.createElement('br'));

      const hint = document.createElement('span');
      hint.style.cssText = 'font-size:12px; margin-top:8px; display:inline-block;';
      hint.textContent = 'Clique no botão "Adicionar Jogo" acima para registar um novo título.';
      td.appendChild(hint);
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    list.forEach(game => {
      const tr = document.createElement('tr');

      const titleCell = document.createElement('td');
      const titleSpan = document.createElement('span');
      titleSpan.className = 'game-title';
      titleSpan.title = String(game.obs || '');
      titleSpan.textContent = String(game.titulo || 'Sem título');
      const genreSpan = document.createElement('span');
      genreSpan.className = 'game-genre';
      genreSpan.textContent = String(game.genero || 'Género não informado');
      titleCell.append(titleSpan, genreSpan);
      tr.appendChild(titleCell);

      let platformClass = 'plat-badge';
      const platformUpper = String(game.plataforma || '').toUpperCase();
      if (platformUpper === 'PC') platformClass += ' plat-PC';
      else if (platformUpper === 'SWITCH') platformClass += ' plat-SWITCH';
      else if (platformUpper.includes('PS')) platformClass += ' plat-PS';
      else if (platformUpper.includes('XBOX')) platformClass += ' plat-XBOX';
      else if (platformUpper.includes('MOBILE') || platformUpper.includes('ANDROID') || platformUpper.includes('IOS')) platformClass += ' plat-MOBILE';
      else if (platformUpper.includes('DECK')) platformClass += ' plat-DECK';

      const platformCell = document.createElement('td');
      const platformBadge = document.createElement('span');
      platformBadge.className = platformClass;
      platformBadge.textContent = String(game.plataforma || '');
      platformCell.appendChild(platformBadge);
      tr.appendChild(platformCell);

      const statusCell = document.createElement('td');
      const statusBadge = document.createElement('span');
      statusBadge.className = 'badge ' + getClassStatus(game.status);
      statusBadge.textContent = String(game.status || '');
      statusCell.appendChild(statusBadge);
      tr.appendChild(statusCell);

      const ratingCell = document.createElement('td');
      ratingCell.appendChild(criarEstrelasNode(game.nota));
      tr.appendChild(ratingCell);

      const hoursCell = document.createElement('td');
      hoursCell.style.cssText = 'color:var(--text-muted); font-weight:600;';
      hoursCell.textContent = Number(game.horas) > 0 ? String(Number(game.horas)) + 'h' : '-';
      tr.appendChild(hoursCell);

      const slaCell = document.createElement('td');
      slaCell.appendChild(criarSLANode(game.dataInicio, game.status));
      tr.appendChild(slaCell);

      const dateCell = document.createElement('td');
      dateCell.style.cssText = 'color:var(--text-muted); font-size:12px;';
      dateCell.textContent = formatDate(game.dataInicio);
      tr.appendChild(dateCell);

      const actionsCell = document.createElement('td');
      actionsCell.style.textAlign = 'right';
      const actions = document.createElement('div');
      actions.className = 'action-btns';
      actions.style.justifyContent = 'flex-end';

      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'btn-icon';
      editButton.title = 'Editar';
      editButton.setAttribute('aria-label', 'Editar ' + String(game.titulo || 'jogo'));
      editButton.textContent = '✏️';
      editButton.addEventListener('click', () => abrirModal(game.id));

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'btn-icon btn-del';
      deleteButton.title = 'Excluir';
      deleteButton.setAttribute('aria-label', 'Excluir ' + String(game.titulo || 'jogo'));
      deleteButton.textContent = '🗑️';
      deleteButton.addEventListener('click', () => excluir(game.id, String(game.titulo || 'jogo')));

      actions.append(editButton, deleteButton);
      actionsCell.appendChild(actions);
      tr.appendChild(actionsCell);
      tbody.appendChild(tr);
    });
  }

  function criarEstrelasNode(nota) {
    const n = Math.max(0, Math.min(5, Math.round(Number(nota) || 0)));
    if (n === 0) {
      const stars = document.createElement('span');
      stars.className = 'stars';
      stars.title = 'Sem avaliação';
      stars.textContent = '★★★★★';
      return stars;
    }

    const rated = document.createElement('span');
    rated.className = 'stars rated';
    rated.title = n + ' estrela(s)';
    rated.textContent = '★'.repeat(n);

    const unrated = document.createElement('span');
    unrated.className = 'stars';
    unrated.textContent = '★'.repeat(5 - n);

    const wrapper = document.createElement('span');
    wrapper.append(rated, unrated);
    return wrapper;
  }

  /**
   * UTILITÁRIOS VISUAIS
   */
  function gerarEstrelas(nota) {
    const n = Math.round(Number(nota)) || 0;
    if (n <= 0) return `<span class="stars" title="Sem avaliação">★★★★★</span>`;
    let html = `<span class="stars rated" title="${n} estrela(s)">`;
    for (let i = 0; i < n && i < 5; i++) html += '★';
    html += `</span><span class="stars">`;
    for (let i = n; i < 5; i++) html += '★';
    html += `</span>`;
    return html;
  }

  function criarSLANode(dataInicio, status) {
    const badge = document.createElement('span');
    badge.className = 'sla-tempo sla-ok';

    if (status !== 'Na Fila') {
      badge.textContent = '-';
      return badge;
    }
    if (!dataInicio) {
      badge.textContent = 'Data não def.';
      return badge;
    }

    const datePart = String(dataInicio).split('T')[0];
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
    if (!match) {
      badge.textContent = '-';
      return badge;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const parsed = new Date(year, month - 1, day);
    if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
      badge.textContent = '-';
      return badge;
    }

    const today = new Date();
    const startUtc = Date.UTC(year, month - 1, day);
    const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const days = Math.floor((todayUtc - startUtc) / 86400000);

    if (days < 0) {
      badge.textContent = '0 dias';
      return badge;
    }

    if (days > 60) badge.className = 'sla-tempo sla-alert';
    else if (days > 30) badge.className = 'sla-tempo sla-warn';
    badge.textContent = '⏳ ' + days + 'd na fila';
    return badge;
  }

  function formatDate(dStr) {
    if (!dStr) return '-';
    const datePart = dStr.split('T')[0];
    const parts = datePart.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dStr;
  }

  function getClassStatus(st) {
    if (st === 'Zerado') return 'bg-zerado';
    if (st === 'Jogando') return 'bg-jogando';
    if (st === 'Na Fila') return 'bg-fila';
    if (st === 'Pausado') return 'bg-pausado';
    return 'bg-dropado';
  }

  function escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast ' + (['success', 'error', 'info'].includes(type) ? type : 'info');

    const icon = document.createElement('span');
    icon.className = 't-icon';
    icon.textContent = type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';

    const messageSpan = document.createElement('span');
    messageSpan.className = 'toast-msg';
    messageSpan.textContent = String(message == null ? '' : message);

    toast.append(icon, document.createTextNode(' '), messageSpan);
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
