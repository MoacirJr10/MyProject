/**
 * Carousel Module - Gerenciador de Carrosséis/Sliders
 * Consolidação de sliders de script.js e portfolio.js
 */

import EventManager from "../core/eventManager.js";

class Carousel {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      console.error(`❌ Container "${containerSelector}" não encontrado`);
      return;
    }

    this.slider = this.container.querySelector(".slider");
    this.images = this.container.querySelectorAll(".slider img");
    this.prevBtn = this.container.querySelector(".prev");
    this.nextBtn = this.container.querySelector(".next");
    this.currentIndex = 0;
    this.autoplayInterval = null;

    if (this.images.length === 0) {
      console.warn("⚠️ Nenhuma imagem encontrada no carousel");
      return;
    }

    this.init();
  }

  /**
   * Inicializar carousel
   */
  init() {
    this.setupEventListeners();
    console.log(`✅ Carousel inicializado com ${this.images.length} imagens`);
  }

  /**
   * Setup de event listeners
   */
  setupEventListeners() {
    // Botões de navegação
    if (this.prevBtn) {
      EventManager.on(this.prevBtn, "click", (e) => {
        e.preventDefault();
        this.prev();
      });
    }

    if (this.nextBtn) {
      EventManager.on(this.nextBtn, "click", (e) => {
        e.preventDefault();
        this.next();
      });
    }

    // Click em imagem abre modal
    this.images.forEach((img) => {
      EventManager.on(img, "click", () => this.openModal(img));
    });

    // Keyboard navigation
    EventManager.on(document, "keydown", (e) => {
      if (e.key === "ArrowLeft") this.prev();
      if (e.key === "ArrowRight") this.next();
      if (e.key === "Escape") this.closeModal();
    });
  }

  /**
   * Mostrar imagem no índice
   */
  show(i) {
    this.currentIndex = (i + this.images.length) % this.images.length;
    if (this.slider) {
      this.slider.style.transform = `translateX(${-this.currentIndex * 100}%)`;
    }
  }

  /**
   * Próxima imagem
   */
  next() {
    this.show(this.currentIndex + 1);
  }

  /**
   * Imagem anterior
   */
  prev() {
    this.show(this.currentIndex - 1);
  }

  /**
   * Abrir modal com imagem grande
   */
  openModal(img) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    const captionText = document.getElementById("caption");

    if (!modal || !modalImg) {
      console.error(
        "❌ Modal não encontrado. Verifique IDs: imageModal, modalImg, caption",
      );
      return;
    }

    modal.style.display = "block";
    modalImg.src = img.src;
    captionText.textContent = img.alt || "";

    // Fechar modal
    const closeBtn = modal.querySelector(".close");
    if (closeBtn) {
      EventManager.on(closeBtn, "click", () => this.closeModal());
    }

    // Fechar ao clicar fora
    EventManager.on(modal, "click", (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });
  }

  /**
   * Fechar modal
   */
  closeModal() {
    const modal = document.getElementById("imageModal");
    if (modal) {
      modal.style.display = "none";
    }
  }

  /**
   * Iniciar autoplay (opcional)
   */
  startAutoplay(interval = 5000) {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }

    this.autoplayInterval = setInterval(() => {
      this.next();
    }, interval);

    console.log(`✅ Autoplay iniciado (${interval}ms)`);
  }

  /**
   * Parar autoplay
   */
  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
      console.log("✅ Autoplay parado");
    }
  }

  /**
   * Destruir carousel e remover listeners
   */
  destroy() {
    this.stopAutoplay();
    EventManager.removeElement(this.prevBtn);
    EventManager.removeElement(this.nextBtn);
    this.images.forEach((img) => EventManager.removeElement(img));
    console.log("✅ Carousel destruído");
  }

  /**
   * Ir para imagem específica
   */
  goToImage(index) {
    if (index >= 0 && index < this.images.length) {
      this.show(index);
      return true;
    }
    console.warn(`⚠️ Índice ${index} inválido`);
    return false;
  }

  /**
   * Obter índice atual
   */
  getCurrentIndex() {
    return this.currentIndex;
  }

  /**
   * Obter número total de imagens
   */
  getTotalImages() {
    return this.images.length;
  }
}

export default Carousel;
