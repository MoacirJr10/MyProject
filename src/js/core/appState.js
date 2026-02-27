/**
 * AppState - Gerenciador de Estado Global
 * Centraliza todas as variáveis globais da aplicação
 * Evita poluição do escopo global e conflitos de variáveis
 */

const AppState = {
  // módulos de estado mantidos

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
    // nenhuma limpeza especial necessária além de comentários e blog
    console.log("✅ AppState limpo");
    return true;
  },
};

export default AppState;
