/**
 * Blog Module - Gerenciador de Posts do Blog
 * Recursos: carregamento, filtro, busca com debounce
 */

import AppState from "../core/appState.js";
import EventManager from "../core/eventManager.js";
import API from "../core/api.js";

class BlogModule {
  constructor() {
    this.debounceTimer = null;
    this.DEBOUNCE_DELAY = 300; // 300ms
  }

  /**
   * Inicializar módulo blog
   */
  async init() {
    try {
      await this.carregarPosts();
      this.setupEventListeners();
      console.log("✅ Blog inicializado");
    } catch (error) {
      console.error("❌ Erro ao inicializar blog:", error);
      this.mostrarErro("Erro ao carregar o blog");
    }
  }

  /**
   * Carregar posts do JSON
   */
  async carregarPosts() {
    try {
      const posts = await API.loadJSON("src/data/posts.json");
      AppState.setPosts(posts);
      console.log(`✅ ${posts.length} posts carregados`);
      return true;
    } catch (error) {
      console.error("❌ Erro ao carregar posts:", error);
      throw error;
    }
  }

  /**
   * Setup de event listeners
   */
  setupEventListeners() {
    // Botões de filtro
    document.querySelectorAll(".btn-filtro").forEach((btn) => {
      EventManager.on(btn, "click", (e) => {
        e.preventDefault();
        const tipo = btn.dataset.tipo || btn.getAttribute("data-tipo");
        if (tipo) {
          this.filtrar(tipo);
        }
      });
    });

    // Busca com debounce
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      EventManager.on(searchInput, "input", (e) => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.filtrarPorTexto(e.target.value);
        }, this.DEBOUNCE_DELAY);
      });
    }
  }

  /**
   * Filtrar por tipo (noticia ou projeto)
   */
  filtrar(tipo) {
    AppState.setTipoAtual(tipo);

    // Atualizar botões
    document.querySelectorAll(".btn-filtro").forEach((btn) => {
      const btnTipo = btn.dataset.tipo || btn.getAttribute("data-tipo");
      btn.classList.toggle("ativo", btnTipo === tipo);
    });

    // Limpar busca ao trocar tipo
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.value = "";
    }

    const filtrados = AppState.blog.todosPosts.filter((p) => p.tipo === tipo);
    this.renderizarPosts(filtrados);
    console.log(`✅ Filtro alterado para: ${tipo}`);
  }

  /**
   * Filtrar por texto (com debounce)
   */
  filtrarPorTexto(termo) {
    AppState.setTermoBusca(termo);

    if (!termo) {
      // Se vazio, voltar para filtro de tipo
      const filtrados = AppState.blog.todosPosts.filter(
        (p) => p.tipo === AppState.blog.tipoAtual,
      );
      this.renderizarPosts(filtrados);
      return;
    }

    const termoBuscaLower = termo.toLowerCase();

    // Filtrar por tipo primeiro
    const postsPorTipo = AppState.blog.todosPosts.filter(
      (p) => p.tipo === AppState.blog.tipoAtual,
    );

    // Depois por texto
    const resultados = postsPorTipo.filter((post) => {
      const titulo = post.titulo.toLowerCase();
      const resumo = post.resumo.toLowerCase();
      const categoria = post.categoria.toLowerCase();

      return (
        titulo.includes(termoBuscaLower) ||
        resumo.includes(termoBuscaLower) ||
        categoria.includes(termoBuscaLower)
      );
    });

    this.renderizarPosts(resultados);
  }

  /**
   * Renderizar posts (usa DocumentFragment para performance)
   */
  renderizarPosts(posts) {
    const container = document.getElementById("feed");
    if (!container) {
      console.error("❌ Container #feed não encontrado");
      return;
    }

    if (posts.length === 0) {
      container.innerHTML =
        "<p style='text-align:center; color:var(--text-secondary); padding: 2rem;'>Nenhum conteúdo encontrado.</p>";
      return;
    }

    // Usar fragment para melhor performance
    const fragment = document.createDocumentFragment();

    posts.forEach((post) => {
      const article = document.createElement("article");
      article.className = "card-post";

      const linkDestino = `./post.html?id=${post.id}`;

      // Sanitizar strings (XSS prevention)
      const titulo = this.sanitize(post.titulo);
      const resumo = this.sanitize(post.resumo);
      const categoria = this.sanitize(post.categoria);

      article.innerHTML = `
        <a href="${linkDestino}" style="display:block; overflow:hidden;">
          <img src="${post.imagem}" alt="${titulo}" class="card-img" loading="lazy">
        </a>
        <div class="card-content">
          <div class="card-meta">${categoria}</div>
          <h3 class="card-title">
            <a href="${linkDestino}">${titulo}</a>
          </h3>
          <p class="card-resumo">${resumo}</p>
          <div class="card-footer">
            <span>${post.data}</span>
            <a href="${linkDestino}" class="btn-ler">Ler</a>
          </div>
        </div>
      `;

      fragment.appendChild(article);
    });

    container.innerHTML = "";
    container.appendChild(fragment);
  }

  /**
   * Sanitizar HTML para evitar XSS
   */
  sanitize(text) {
    const div = document.createElement("div");
    div.textContent = text; // textContent é seguro
    return div.innerHTML;
  }

  /**
   * Mostrar mensagem de erro
   */
  mostrarErro(mensagem) {
    const container = document.getElementById("feed");
    if (container) {
      container.innerHTML = `<p style='text-align:center; color:var(--error-color); padding: 2rem;'>${mensagem}</p>`;
    }
  }

  /**
   * Obter posts atuais
   */
  getPosts() {
    return AppState.blog.todosPosts;
  }

  /**
   * Obter tipo atual
   */
  getTipoAtual() {
    return AppState.blog.tipoAtual;
  }
}

export default BlogModule;
