/**
 * Event Manager - Gerenciador Centralizado de Event Listeners
 * Previne memory leaks ao rastrear e remover listeners
 */

const EventManager = {
  listeners: [],

  /**
   * Registrar um event listener
   * @param {Element} element - Element to attach listener
   * @param {string} event - Event type (e.g., 'click', 'input')
   * @param {Function} handler - Event handler function
   */
  on(element, event, handler) {
    if (!element) {
      console.warn(`⚠️ Elemento não encontrado para evento "${event}"`);
      return false;
    }

    try {
      element.addEventListener(event, handler);
      this.listeners.push({ element, event, handler });
      return true;
    } catch (error) {
      console.error(`❌ Erro ao adicionar listener:`, error);
      return false;
    }
  },

  /**
   * Remover um event listener específico
   */
  off(element, event, handler) {
    if (!element) return false;

    try {
      element.removeEventListener(event, handler);
      this.listeners = this.listeners.filter(
        (l) =>
          !(
            l.element === element &&
            l.event === event &&
            l.handler === handler
          ),
      );
      return true;
    } catch (error) {
      console.error(`❌ Erro ao remover listener:`, error);
      return false;
    }
  },

  /**
   * Remover TODOS os event listeners registrados
   * Ideal para chamar ao sair de uma página
   */
  removeAll() {
    let count = 0;
    this.listeners.forEach(({ element, event, handler }) => {
      try {
        element?.removeEventListener(event, handler);
        count++;
      } catch (error) {
        console.error(`❌ Erro ao remover listener:`, error);
      }
    });

    this.listeners = [];
    console.log(`✅ ${count} event listeners removidos`);
    return count;
  },

  /**
   * Remover listeners de um elemento específico
   */
  removeElement(element) {
    if (!element) return false;

    const beforeCount = this.listeners.length;
    this.listeners = this.listeners.filter((l) => {
      if (l.element === element) {
        try {
          element.removeEventListener(l.event, l.handler);
        } catch (error) {
          console.error(`❌ Erro ao remover listener do elemento:`, error);
        }
        return false;
      }
      return true;
    });

    const removed = beforeCount - this.listeners.length;
    console.log(`✅ ${removed} listeners removidos do elemento`);
    return true;
  },

  /**
   * Obter número total de listeners registrados
   */
  getCount() {
    return this.listeners.length;
  },

  /**
   * Exibir todos os listeners registrados (debug)
   */
  debug() {
    console.table(
      this.listeners.map((l) => ({
        event: l.event,
        element: l.element.tagName || "Object",
        handler: l.handler.name || "anonymous",
      })),
    );
  },
};

// Remover todos os listeners ao sair da página
window.addEventListener("beforeunload", () => {
  EventManager.removeAll();
});

export default EventManager;
