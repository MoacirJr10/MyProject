/**
 * API Manager - Gerenciador de Requisições HTTP
 * Implementa retry automático, timeout, e tratamento de erros
 */

const API = {
  BASE_TIMEOUT: 10000, // 10 segundos

  /**
   * Fazer requisição com retry automático
   * @param {string} url - URL da requisição
   * @param {object} options - Opções do fetch
   * @param {number} retries - Número de tentativas
   * @returns {Promise} Resposta em JSON
   */
  async fetch(url, options = {}, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          this.BASE_TIMEOUT,
        );

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        clearTimeout(timeoutId);

        if (attempt === retries) {
          console.error(`❌ Erro após ${retries} tentativas:`, error.message);
          throw error;
        }

        const delay = 2000 * attempt; // Backoff exponencial
        console.warn(
          `⚠️ Tentativa ${attempt}/${retries} falhou. Aguardando ${delay}ms...`,
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  },

  /**
   * GET request
   */
  async get(url) {
    return this.fetch(url, { method: "GET" });
  },

  /**
   * POST request
   */
  async post(url, data) {
    return this.fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE request
   */
  async delete(url, token = null) {
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return this.fetch(url, {
      method: "DELETE",
      headers,
    });
  },

  /**
   * Carregar arquivo JSON (usado para posts.json)
   */
  async loadJSON(filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Falha ao carregar ${filePath}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`❌ Erro ao carregar ${filePath}:`, error);
      throw error;
    }
  },
};

export default API;
