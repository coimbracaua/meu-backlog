function toggleAuthMode() {
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');
            const messageDiv = document.getElementById('auth-message');

            messageDiv.className = 'message hidden';
            messageDiv.innerText = '';

            if (loginForm.classList.contains('active')) {
                loginForm.classList.remove('active');
                registerForm.classList.add('active');
            } else {
                registerForm.classList.remove('active');
                loginForm.classList.add('active');
            }
        }

        function showMessage(text, type) {
            const messageDiv = document.getElementById('auth-message');
            messageDiv.innerText = text;
            messageDiv.className = `message ${type}`;
        }

        // ATENÇÃO CAUÃ: As chaves devem estar sempre entre aspas simples ('')
        const supabaseUrl = 'https://vvgdvigeqgbsozncunyu.supabase.co';
        const supabaseKey = 'sb_publishable_ypPbYVlKrkSUoUU1g693ew_Tx2vUbzE';
        
        // Inicializa o cliente do Supabase diretamente, sem o 'if'
        let supabaseClient = null;
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            try {
                supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey, {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true,
                        detectSessionInUrl: true
                    }
                });
            } catch (error) {
                console.error('Falha ao inicializar o SDK do Supabase:', error);
                showMessage('Não foi possível inicializar o serviço de autenticação.', 'error');
            }
        } else {
            showMessage('O SDK do Supabase não foi carregado. Verifique a ligação e recarregue a página.', 'error');
        }
        
        document.addEventListener('DOMContentLoaded', async () => {
            if (!supabaseClient) return;
            try {
                const { data, error } = await supabaseClient.auth.getSession();
                if (error) throw error;
                if (data && data.session) {
                    window.location.href = 'app-phase4.html';
                }
            } catch (error) {
                console.error('Falha ao verificar sessão:', error);
                showMessage('Não foi possível validar a sessão. Tente novamente.', 'error');
            }
        });

        // CADASTRO (Agora enviando o username)
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if(!supabaseClient) {
                showMessage("Configure as chaves do Supabase no código para testar.", "error");
                return;
            }

            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            const btn = e.target.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = "Carregando...";
            btn.disabled = true;

            // MÁGICA ACONTECE AQUI: Passamos o username dentro de "options.data"
            let signupResult;
            try {
                signupResult = await supabaseClient.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            username: username
                        }
                    }
                });
            } catch (error) {
                console.error('Falha de rede durante o cadastro:', error);
                showMessage('Não foi possível contactar o serviço de autenticação. Tente novamente.', 'error');
                return;
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
            const { data, error } = signupResult;

            if (error) {
                showMessage(error.message, 'error');
            } else {
                showMessage('Conta e perfil criados com sucesso! Faça login.', 'success');
                document.getElementById('register-form').reset();
                setTimeout(toggleAuthMode, 2500);
            }
        });

        // LOGIN
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if(!supabaseClient) {
                showMessage("Configure as chaves do Supabase no código para testar.", "error");
                return;
            }

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            const btn = e.target.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = "Entrando...";
            btn.disabled = true;

            let loginResult;
            try {
                loginResult = await supabaseClient.auth.signInWithPassword({ email, password });
            } catch (error) {
                console.error('Falha de rede durante o login:', error);
                showMessage('Não foi possível contactar o serviço de autenticação. Tente novamente.', 'error');
                return;
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
            const { data, error } = loginResult;

            if (error) {
                showMessage('Erro ao entrar: Verifique e-mail e senha.', 'error');
            } else {
                showMessage('Login efetuado! Carregando seu backlog...', 'success');
                setTimeout(() => {
                    window.location.href = 'app-phase4.html';
                }, 1000);
            }
        });

// OAuth Discord via Supabase Auth. O provider precisa ser ativado no painel Supabase.
async function loginWithDiscord() {
  if (!supabaseClient) { showMessage('O serviço de autenticação não está disponível.', 'error'); return; }
  const button = document.getElementById('discord-login');
  if (button) { button.disabled = true; button.textContent = 'Conectando ao Discord...'; }
  try {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: new URL('/app', window.location.origin).href }
    });
    if (error) throw error;
  } catch (error) {
    showMessage('Não foi possível iniciar o login Discord. Confira se o provider está ativo no Supabase.', 'error');
    if (button) { button.disabled = false; button.textContent = 'Continuar com Discord'; }
  }
}
