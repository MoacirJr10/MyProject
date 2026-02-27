/**
 * Main.js - Arquivo de Inicialização Principal
 * Carrega todos os módulos e inicializa a aplicação
 */

import Navigation from "./modules/navigation.js";
import Calculator from "./modules/calculator.js";
import Carousel from "./modules/carousel.js";
import Financeiro from "./modules/financeiro.js";
import BlogModule from "./modules/blog.js";
import "../css/variables.css";

// Aguardar DOM estar pronto
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Aplicação iniciando...");

  try {
    // ===== NAVEGAÇÃO =====
    Navigation.init();

    // ===== CARROSSÉIS =====
    const carousels = document.querySelectorAll(
      ".carousel-container, .projeto-card",
    );
    carousels.forEach((container) => {
      const carouselInstance = new Carousel(container);
      // Desabilitar autoplay por padrão
      // carouselInstance.startAutoplay(5000);
    });

    // ===== BLOG =====
    const blogModule = new BlogModule();
    blogModule.init();

    // ===== CONTROLE FINANCEIRO =====
    const financeiro = new Financeiro();
    window.FinanceiroModule = financeiro; // Expor globalmente para onclick em HTML

    // ===== CALCULADORA =====
    window.Calculator = Calculator; // Expor globalmente para onclick em HTML

    console.log("✅ Aplicação inicializada com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inicializar aplicação:", error);
  }
});

// Limpeza ao sair
window.addEventListener("beforeunload", () => {
  console.log("🛑 Encerrando aplicação...");
  // EventManager já limpa automaticamente via addEventListener('beforeunload')
});

export { Navigation, Calculator, Carousel, Financeiro, BlogModule };
