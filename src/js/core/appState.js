/**
 * AppState - Gerenciador de Estado Global
 * Centraliza todas as variáveis globais da aplicação
 * Evita poluição do escopo global e conflitos de variáveis
 */

const AppState = {
  // ========== MÓDULO FINANCEIRO ==========
  financeiro: {
    gastos: [],
    grafico: null,
    historico: [],
  },

  // ========== MÓDULO BLOG ==========
  blog: {
    todosPosts: [],
    tipoAtual: "noticia",
    termoBuscaAtual: "",
  },

  // ========== MÓDULO COMENTÁRIOS ==========
  comentarios: {
    replyingToId: null,
    replyingToName: null,
    userToken: null,
  },

  // ========== MÉTODOS FINANCEIRO ==========
  getFinanceiro() {
    return this.financeiro;
  },

  setGasto(novoGasto) {
    this.financeiro.gastos.push(novoGasto);
    this.salvarGastosLocalStorage();
    return novoGasto;
  },

  removerGasto(index) {
    if (index >= 0 && index < this.financeiro.gastos.length) {
      this.financeiro.gastos.splice(index, 1);
      this.salvarGastosLocalStorage();
      return true;
    }
    return false;
  },

  limparGastos() {
    this.financeiro.gastos = [];
    localStorage.removeItem("gastos");
    return true;
  },

  carregarGastosLocalStorage() {
    try {
      const gastos = JSON.parse(localStorage.getItem("gastos"));
      if (Array.isArray(gastos)) {
        this.financeiro.gastos = gastos;
        return true;
      }
    } catch (e) {
      console.error("❌ Erro ao carregar gastos:", e);
    }
    this.financeiro.gastos = [];
    return false;
  },

  salvarGastosLocalStorage() {
    try {
      const tamanho = JSON.stringify(this.financeiro.gastos).length;
      if (tamanho > 5242880) {
        // 5MB
        console.warn("⚠️ LocalStorage quase cheio (>5MB)");
      }
      localStorage.setItem("gastos", JSON.stringify(this.financeiro.gastos));
      return true;
    } catch (e) {
      console.error("❌ Erro ao salvar gastos:", e);
      return false;
    }
  },

  // ========== MÉTODOS BLOG ==========
  getBlog() {
    return this.blog;
  },

  setPosts(posts) {
    if (Array.isArray(posts)) {
      this.blog.todosPosts = posts;
      return true;
    }
    return false;
  },

  setTipoAtual(tipo) {
    this.blog.tipoAtual = tipo;
    return true;
  },

  setTermoBusca(termo) {
    this.blog.termoBuscaAtual = termo;
    return true;
  },

  // ========== MÉTODOS COMENTÁRIOS ==========
  getComentarios() {
    return this.comentarios;
  },

  setUserToken(token) {
    this.comentarios.userToken = token;
    return true;
  },

  setReplyingTo(commentId, commentName) {
    this.comentarios.replyingToId = commentId;
    this.comentarios.replyingToName = commentName;
    return true;
  },

  resetReplyingTo() {
    this.comentarios.replyingToId = null;
    this.comentarios.replyingToName = null;
    return true;
  },

  logout() {
    this.comentarios.userToken = null;
    this.comentarios.replyingToId = null;
    this.comentarios.replyingToName = null;
    return true;
  },

  // ========== LIMPEZA ==========
  cleanup() {
    // Limpar gráficos
    if (this.financeiro.grafico) {
      this.financeiro.grafico.destroy();
      this.financeiro.grafico = null;
    }
    console.log("✅ AppState limpo");
    return true;
  },
};

export default AppState;
