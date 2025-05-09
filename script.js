// Adicione esta função auxiliar (novo)
function checkBannedUsers() {
    // Verifica se usuário logado está banido
    if (state.currentUser?.banned) {
        window.location.href = `banned.html?reason=${encodeURIComponent(state.currentUser.banReason)}`;
        return true;
    }
    return false;
}

// 🌌 Configurações Premium
const CONFIG = {
    MAX_USERS: 6,
    ADMIN_PASSWORD: "devfyultra",
    DEFAULT_NEWS: [
        "🌟 Novo rolê VIP marcado para sexta às 22h!",
        "💑 João e Maria foram vistos no shopping...",
        "📚 Vazou a lista de exercícios da prova!",
        "🏀 Campeonato interclasses começa amanhã", 
        "🎮 Torneio de FIFA na casa do Lucas sábado"
    ],
    PASSWORD_SALT: "devfy-secure-salt" // Adicionado para segurança
};

// 🏆 Dados Globais Premium
const state = {
    currentUser: null,
    posts: [],
    users: [],
    news: [],
    adminMode: false,
    bubbles: []
};

// 🚀 Inicialização Premium
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initBackgroundAnimation();
    
    if (document.getElementById('username')) {
        initSignupPage();
    } else if (document.getElementById('loginUsername')) {
        // Página de login não precisa de inicialização extra
    } else {
        initFeedPage();
    }
    
    // Atalho Admin: Ctrl+Enter
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            if (!state.adminMode) {
                authenticateAdmin();
            } else {
                toggleAdminPanel();
            }
        }
    });
});

// 🔒 Funções de Segurança (NOVO)
function hashPassword(pass) {
    return btoa(pass + CONFIG.PASSWORD_SALT);
}

function verifyPassword(inputPass, storedPass) {
    return hashPassword(inputPass) === storedPass;
}

// 💾 Sistema de Dados
function loadData() {
    state.currentUser = JSON.parse(localStorage.getItem('devfy-currentUser')) || null;
    state.posts = JSON.parse(localStorage.getItem('devfy-posts')) || [];
    state.users = JSON.parse(localStorage.getItem('devfy-users')) || [];
    state.news = JSON.parse(localStorage.getItem('devfy-news')) || [...CONFIG.DEFAULT_NEWS];
    
    // Adicione esta verificação (novo)
    if (state.currentUser && checkBannedUsers()) return;
    
    if (!localStorage.getItem('devfy-news')) {
        saveToStorage('devfy-news', state.news);
    }
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function saveAllData() {
    saveToStorage('devfy-currentUser', state.currentUser);
    saveToStorage('devfy-posts', state.posts);
    saveToStorage('devfy-users', state.users);
    saveToStorage('devfy-news', state.news);
}

// ✨ Efeitos Visuais
function initBackgroundAnimation() {
    const bgAnimation = document.createElement('div');
    bgAnimation.className = 'bg-animation';
    document.body.appendChild(bgAnimation);
    
    for (let i = 0; i < 5; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        const size = Math.random() * 200 + 100;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = Math.random() * 10 + 10;
        
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${posX}%`;
        bubble.style.top = `${posY}%`;
        bubble.style.animationDelay = `${delay}s`;
        bubble.style.animationDuration = `${duration}s`;
        
        bgAnimation.appendChild(bubble);
        state.bubbles.push(bubble);
    }
}

// 🔐 Autenticação Admin
function authenticateAdmin() {
    const password = prompt("🔒 Digite a senha de administrador:");
    if (password === CONFIG.ADMIN_PASSWORD) {
        state.adminMode = true;
        showToast("Modo Admin Ativado!", "success");
        toggleAdminPanel();
    } else {
        showToast("Senha incorreta!", "error");
    }
}

// 💬 Sistema de Toast Notifications
function showToast(message, type = "info") {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}

// 📝 Página de Cadastro (ATUALIZADA)
function initSignupPage() {
    const DOM = {
        fileInput: document.getElementById('fileInput'),
        avatarPreview: document.getElementById('avatarPreview'),
        usernameInput: document.getElementById('username'),
        passwordInput: document.getElementById('password'),
        confirmPasswordInput: document.getElementById('confirmPassword'),
        authBtn: document.querySelector('.auth-btn'),
        errorMsg: document.getElementById('errorMessage'),
        registeredUsers: document.getElementById('registeredUsers')
    };

    DOM.registeredUsers.textContent = state.users.length;

    DOM.fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                DOM.avatarPreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });

    window.criarConta = function() {
        const username = DOM.usernameInput.value.trim();
        const password = DOM.passwordInput.value;
        const confirmPassword = DOM.confirmPasswordInput.value;
        
        // Validações
        if (!username || !password || !confirmPassword) {
            return showError("Preencha todos os campos!");
        }
        
        if (password !== confirmPassword) {
            return showError("As senhas não coincidem!");
        }
        
        if (state.users.length >= CONFIG.MAX_USERS) {
            return showError(`Limite de ${CONFIG.MAX_USERS} usuários atingido!`);
        }
        
        if (state.users.some(u => u.username === (username.startsWith('@') ? username : `@${username}`))) {
            return showError("Username já existe!");
        }
        
        const avatar = DOM.avatarPreview.querySelector('img')?.src || '';
        
        state.currentUser = {
            username: username.startsWith('@') ? username : `@${username}`,
            avatar: avatar,
            password: hashPassword(password) // Armazena a senha hasheada
        };
        
        state.users.push(state.currentUser);
        saveAllData();
        showToast("Conta criada com sucesso!", "success");
        setTimeout(() => window.location.href = 'splash.html', 1000);
    };

    function showError(msg) {
        DOM.errorMsg.textContent = msg;
        DOM.errorMsg.style.display = 'block';
        setTimeout(() => DOM.errorMsg.style.display = 'none', 3000);
        DOM.errorMsg.classList.add('error-animate');
        setTimeout(() => DOM.errorMsg.classList.remove('error-animate'), 300);
    }
}

// 🔑 Sistema de Login (NOVO)
window.fazerLogin = function() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showError("Preencha todos os campos!");
        return;
    }

    const fullUsername = username.startsWith('@') ? username : `@${username}`;
    const user = state.users.find(u => u.username === fullUsername);

    // Verificação de banimento (NOVO - deve vir ANTES da senha)
    if (user?.banned) {
        window.location.href = `banned.html?reason=${encodeURIComponent(user.banReason || "Banido por violação")}`;
        return;
    }

    if (!user || !verifyPassword(password, user.password)) {
        showError("Credenciais inválidas!");
        return;
    }

    // Resto do seu código de login...
    state.currentUser = user;
    saveToStorage('devfy-currentUser', user);
    showToast("Login bem-sucedido!", "success");
    setTimeout(() => window.location.href = 'index.html', 1000);
};

// 🚪 Sistema de Logout (NOVO)
window.logout = function() {
    if (confirm("Deseja realmente sair da conta?")) {
        localStorage.removeItem('devfy-currentUser');
        state.currentUser = null;
        
        // Atualiza o contador na interface
        document.getElementById('currentUsers').textContent = state.users.length - 1;
        
        showToast("Você saiu da conta", "info");
        setTimeout(() => window.location.href = 'login.html', 1000);
    }
};

// 🏡 Página do Feed (ATUALIZADA)
function initFeedPage() {
    if (!state.currentUser) {
        window.location.href = 'login.html'; // Redireciona para login se não estiver autenticado
        return;
    }

    const DOM = {
        postText: document.getElementById('postText'),
        postsContainer: document.getElementById('postsContainer'),
        sidebarUsername: document.getElementById('sidebarUsername'),
        userAvatarImg: document.getElementById('userAvatarImg'),
        currentUsers: document.getElementById('currentUsers'),
        newsContainer: document.getElementById('newsContainer')
    };

    // Atualizar UI
    updateUI();

    // Postar mensagem
    window.postar = function() {
        const text = DOM.postText.value.trim();
        if (!text) return showToast("Digite algo para postar!", "error");

        const newPost = {
            id: Date.now(),
            user: state.currentUser.username,
            avatar: state.currentUser.avatar,
            text: text,
            likes: 0,
            likedBy: [],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString()
        };

        state.posts.unshift(newPost);
        saveAllData();
        renderPosts();
        DOM.postText.value = '';
        showToast("Post criado com sucesso!", "success");
    };

    // Renderizar posts
    function renderPosts() {
        DOM.postsContainer.innerHTML = '';
        state.posts.forEach(post => {
            const postEl = document.createElement('div');
            postEl.className = 'post glass';
            postEl.innerHTML = `
                <div class="post-header">
                    <div class="post-avatar">
                        ${post.avatar 
                            ? `<img src="${post.avatar}" alt="${post.user}">` 
                            : `<i class="fas fa-user"></i>`
                        }
                    </div>
                    <div class="post-user">
                        <h4>${post.user}</h4>
                        <div class="post-time">${post.time} • ${post.date}</div>
                    </div>
                </div>
                <div class="post-content">
                    <p>${post.text}</p>
                </div>
                <div class="post-actions">
                    <button class="like-btn ${post.likedBy.includes(state.currentUser.username) ? 'liked' : ''}" 
                        data-id="${post.id}">
                        <i class="far fa-heart"></i>
                        <span class="like-count">${post.likes}</span>
                    </button>
                    ${post.user === state.currentUser.username ? 
                        `<button class="delete-btn" data-id="${post.id}">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                </div>
            `;
            DOM.postsContainer.appendChild(postEl);
        });
    }

    // Renderizar notícias
    function renderNews() {
        DOM.newsContainer.innerHTML = '';
        state.news.forEach((item, index) => {
            const newsEl = document.createElement('div');
            newsEl.className = 'news-item';
            newsEl.innerHTML = `
                <span class="news-bullet">${index + 1}.</span>
                <span class="news-text">${item}</span>
            `;
            DOM.newsContainer.appendChild(newsEl);
        });
    }

    // Atualizar UI
    function updateUI() {
        DOM.sidebarUsername.textContent = state.currentUser.username;
        if (state.currentUser.avatar) {
            DOM.userAvatarImg.src = state.currentUser.avatar;
        } else {
            document.querySelector('.avatar').innerHTML = '<i class="fas fa-user"></i>';
        }
        DOM.currentUsers.textContent = state.users.length;
        renderNews();
        renderPosts();
    }

    // Eventos de Interação
    DOM.postsContainer.addEventListener('click', function(e) {
        const target = e.target.closest('.like-btn') || e.target.closest('.delete-btn');
        
        if (target?.classList.contains('like-btn')) {
            handleLike(parseInt(target.getAttribute('data-id')));
        }
        
        if (target?.classList.contains('delete-btn')) {
            handleDelete(parseInt(target.getAttribute('data-id')));
        }
    });

    function handleLike(postId) {
        const post = state.posts.find(p => p.id === postId);
        if (!post) return;
        
        const alreadyLiked = post.likedBy.includes(state.currentUser.username);
        
        if (alreadyLiked) {
            post.likes--;
            post.likedBy = post.likedBy.filter(u => u !== state.currentUser.username);
            showToast("Curtida removida", "info");
        } else {
            post.likes++;
            post.likedBy.push(state.currentUser.username);
            showToast("Post curtido!", "success");
        }
        
        saveAllData();
        renderPosts();
    }

    function handleDelete(postId) {
        if (confirm("Tem certeza que deseja excluir este post?")) {
            state.posts = state.posts.filter(p => p.id !== postId);
            saveAllData();
            renderPosts();
            showToast("Post excluído", "error");
        }
    }
}

// 🛠️ Painel Admin (MESMO CÓDIGO ORIGINAL)
function toggleAdminPanel() {
    const panel = document.getElementById('adminPanel');
    const overlay = document.getElementById('adminOverlay');
    
    if (panel && panel.style.display === 'block') {
        hideAdminPanel();
    } else {
        showAdminPanel();
    }
}

function showAdminPanel() {
    const panel = document.getElementById('adminPanel');
    const overlay = document.getElementById('adminOverlay');
    const newsEditor = document.getElementById('newsEditor');
    
    if (!panel || !overlay || !newsEditor) return;
    
    newsEditor.value = state.news.join('\n');
    panel.style.display = 'block';
    overlay.style.display = 'block';
    
    setTimeout(() => {
        panel.style.opacity = '1';
        panel.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
}

function hideAdminPanel() {
    const panel = document.getElementById('adminPanel');
    const overlay = document.getElementById('adminOverlay');
    
    if (!panel || !overlay) return;
    
    panel.style.opacity = '0';
    panel.style.transform = 'translate(-50%, -50%) scale(0.95)';
    
    setTimeout(() => {
        panel.style.display = 'none';
        overlay.style.display = 'none';
    }, 300);
}

// Funções Admin (MESMO CÓDIGO ORIGINAL)
// 🚨 FUNÇÃO DE BANIMENTO DEFINITIVA (substitua a sua por esta)
window.banUser = function() {
    // 1. Validação do username
    const usernameInput = document.getElementById('banUsername');
    if (!usernameInput) return showToast("Elemento banUsername não encontrado", "error");
    
    const username = usernameInput.value.trim();
    if (!username) return showToast("Digite um @username válido", "error");
    
    // 2. Formata o username
    const fullUsername = username.startsWith('@') ? username : `@${username}`;
    
    // 3. Encontra o usuário
    const userIndex = state.users.findIndex(u => u.username === fullUsername);
    if (userIndex === -1) return showToast("Usuário não encontrado", "error");
    
    // 4. Pede motivo e confirmação
    const reason = prompt(`Motivo do banimento para ${fullUsername}:`) || "Violação dos termos de uso";
    if (!confirm(`⚠️ CONFIRMAR BANIMENTO PERMANENTE?\n\nUsuário: ${fullUsername}\nMotivo: "${reason}"`)) {
        return showToast("Banimento cancelado", "info");
    }

    // 5. Marca como banido (ATUALIZAÇÃO CRUCIAL)
    state.users[userIndex] = {
        ...state.users[userIndex],
        banned: true,
        banReason: reason,
        banDate: new Date().toISOString(),
        password: "" // Remove a senha para impossibilitar login
    };

    // 6. Atualiza localStorage
    saveAllData();
    
    // 7. Se estiver logado, faz logout forçado
    if (state.currentUser?.username === fullUsername) {
        localStorage.removeItem('devfy-currentUser');
        state.currentUser = null;
        window.location.href = `banned.html?reason=${encodeURIComponent(reason)}&t=${Date.now()}`;
        return;
    }

    // 8. Atualiza a interface
    showToast(`⛔ ${fullUsername} foi banido permanentemente`, "error");
    document.getElementById('currentUsers').textContent = state.users.filter(u => !u.banned).length;
    
    // 9. Fecha o painel admin após 1s
    setTimeout(() => {
        hideAdminPanel();
        if (typeof renderUserList === 'function') renderUserList();
        location.reload(); // Força atualização
    }, 1000);
};
window.resetAllUsers = function() {
    if (confirm("⚠️ Isso resetará TODOS os usuários. Continuar?")) {
        state.users = [];
        saveAllData();
        hideAdminPanel();
        showToast("Todos usuários foram resetados", "error");
        setTimeout(() => location.reload(), 1000);
    }
};

window.updateNews = function() {
    const editor = document.getElementById('newsEditor');
    const newNews = editor.value.split('\n')
        .map(line => line.trim())
        .filter(line => line !== '');
    
    if (newNews.length === 0) {
        return showToast("Adicione pelo menos uma notícia", "error");
    }
    
    state.news = newNews;
    saveAllData();
    hideAdminPanel();
    showToast("Notícias atualizadas!", "success");
    setTimeout(() => location.reload(), 800);

    // Adicione esta função (novo)
window.checkBanStatus = function() {
    if (checkBannedUsers()) {
        // Opcional: Limpa dados se estiver banido
        localStorage.removeItem('devfy-currentUser');
    }
};
};