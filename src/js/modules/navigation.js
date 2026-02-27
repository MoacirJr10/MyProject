/**
 * Navigation Module - Gerenciador de Abas
 * Consolidação de todas as funções de navegação
 */

import EventManager from "../core/eventManager.js";

const Navigation = {
  currentTab: null,

  /**
   * Inicializar navegação
   */
  init() {
    // Procura por elementos que declaram a aba via `data-tab`
    let tabButtons = Array.from(document.querySelectorAll("[data-tab]"));

    // Fallback: detecta elementos com `onclick="mostrarAba('id')"` (ex.: menu-lateral)
    if (tabButtons.length === 0) {
      const candidates = Array.from(
        document.querySelectorAll(
          ".menu-lateral li, .tab-controls li, .btn-filtro, [onclick]",
        ),
      );

      candidates.forEach((el) => {
        const onclick = el.getAttribute("onclick") || "";
        const m = onclick.match(/mostrarAba\(['\"]([^'\"]+)['\"]\)/);
        if (m) {
          el.dataset.tab = m[1];
          tabButtons.push(el);
        }
      });
    }

    if (tabButtons.length === 0) {
      console.warn("⚠️ Nenhum botão de aba encontrado");
      return;
    }

    tabButtons.forEach((btn) => {
      EventManager.on(btn, "click", (e) => {
        e.preventDefault();
        const target = btn.dataset.tab || btn.getAttribute("data-tab");
        if (target) this.mostrarAba(target);
      });
    });

    console.log("✅ Navegação inicializada");
  },

  /**
   * Mostrar uma aba específica
   * @param {string} abaId - ID da aba a exibir
   */
  mostrarAba(abaId) {
    if (!abaId) {
      console.error("❌ Erro: ID da aba não fornecido");
      return false;
    }

    const abas = document.querySelectorAll(".tab-content");
    if (abas.length === 0) {
      console.warn('⚠️ Nenhuma aba encontrada com classe "tab-content"');
      return false;
    }

    // Ocultar todas as abas
    abas.forEach((aba) => {
      aba.style.display = "none";
    });

    // Mostrar aba selecionada
    const abaSelecionada = document.getElementById(abaId);
    if (abaSelecionada) {
      abaSelecionada.style.display = "block";
      this.currentTab = abaId;

      // Atualizar botões ativos
      document.querySelectorAll("[data-tab]").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.tab === abaId);
      });

      console.log(`✅ Aba "${abaId}" exibida`);
      return true;
    } else {
      console.error(`❌ Aba com ID "${abaId}" não encontrada`);
      return false;
    }
  },

  /**
   * Obter aba atual
   */
  getCurrentTab() {
    return this.currentTab;
  },
};

export default Navigation;
