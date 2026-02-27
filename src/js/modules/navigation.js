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
    const tabButtons = document.querySelectorAll("[data-tab]");
    if (tabButtons.length === 0) {
      console.warn("⚠️ Nenhum botão com data-tab encontrado");
      return;
    }

    tabButtons.forEach((btn) => {
      EventManager.on(btn, "click", (e) => {
        e.preventDefault();
        this.mostrarAba(btn.dataset.tab);
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
