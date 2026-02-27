/**
 * Financeiro Module - Gerenciador de Gastos e Gráficos
 * Consolidação do controle financeiro de script.js
 */

import AppState from "../core/appState.js";
import EventManager from "../core/eventManager.js";

class Financeiro {
  constructor() {
    this.carregarGastos();
    this.setupEventListeners();
  }

  /**
   * Carregar gastos do localStorage
   */
  carregarGastos() {
    try {
      const gastos = JSON.parse(localStorage.getItem("gastos"));
      if (Array.isArray(gastos)) {
        AppState.financeiro.gastos = gastos;
        console.log(`✅ ${gastos.length} gastos carregados`);
        return true;
      }
    } catch (e) {
      console.error("❌ Erro ao carregar gastos:", e);
    }
    AppState.financeiro.gastos = [];
    return false;
  }

  /**
   * Setup de event listeners
   */
  setupEventListeners() {
    const formGasto = document.getElementById("form-gasto");
    if (formGasto) {
      EventManager.on(formGasto, "submit", (e) => {
        e.preventDefault();
        this.adicionarGasto();
      });
      console.log("✅ Form de gastos inicializado");
    }
  }

  /**
   * Adicionar novo gasto
   */
  adicionarGasto() {
    const descricao = document.getElementById("descricao")?.value.trim();
    const valor = parseFloat(document.getElementById("valor")?.value);
    const data = document.getElementById("data")?.value;
    const tipoPagamento = document.getElementById("tipo-pagamento")?.value;

    // Validações
    if (!descricao || descricao.length < 3) {
      alert("❌ Descrição deve ter ao menos 3 caracteres");
      return false;
    }

    if (isNaN(valor) || valor <= 0 || valor > 1000000) {
      alert("❌ Valor deve estar entre 0.01 e 1.000.000");
      return false;
    }

    if (!data) {
      alert("❌ Selecione uma data");
      return false;
    }

    if (!tipoPagamento) {
      alert("❌ Selecione um tipo de pagamento");
      return false;
    }

    const gasto = { descricao, valor, data, tipoPagamento };
    AppState.setGasto(gasto);

    // Limpar form
    document.getElementById("form-gasto").reset();

    // Atualizar UI
    this.atualizarUI();
    console.log("✅ Gasto adicionado:", gasto);
    return true;
  }

  /**
   * Remover gasto por índice
   */
  removerGasto(index) {
    if (confirm("Tem certeza que deseja remover este gasto?")) {
      const gasto = AppState.financeiro.gastos[index];
      if (AppState.removerGasto(index)) {
        this.atualizarUI();
        console.log("✅ Gasto removido:", gasto);
        return true;
      }
    }
    return false;
  }

  /**
   * Limpar todo o histórico
   */
  limparHistorico() {
    if (confirm("Tem certeza que deseja limpar TODO o histórico?")) {
      if (AppState.limparGastos()) {
        this.atualizarUI();
        console.log("✅ Histórico de gastos limpo");
        return true;
      }
    }
    return false;
  }

  /**
   * Atualizar toda a UI (lista, resumo, gráfico)
   */
  atualizarUI() {
    this.atualizarLista();
    this.atualizarResumo();
    this.atualizarGrafico();
  }

  /**
   * Atualizar lista de gastos na tabela
   */
  atualizarLista() {
    const tbody = document.querySelector("#gastos tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const gastos = AppState.financeiro.gastos;
    if (gastos.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="4" style="text-align:center">Nenhum gasto registrado</td></tr>';
      return;
    }

    const fragment = document.createDocumentFragment();
    gastos.forEach((gasto, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${gasto.descricao}</td>
        <td>R$ ${gasto.valor.toFixed(2)}</td>
        <td>${gasto.tipoPagamento}</td>
        <td><button onclick="window.FinanceiroModule?.removerGasto(${index})" style="color:#ef4444">Remover</button></td>
      `;
      fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
  }

  /**
   * Atualizar resumo financeiro
   */
  atualizarResumo() {
    const gastos = AppState.financeiro.gastos;
    const totalGasto = gastos.reduce((total, g) => total + g.valor, 0);

    const totalElement = document.getElementById("total-gasto");
    if (totalElement) {
      totalElement.textContent = totalGasto.toFixed(2);
    }

    // Gastos por tipo
    const gastosPorTipo = {};
    gastos.forEach((gasto) => {
      gastosPorTipo[gasto.tipoPagamento] =
        (gastosPorTipo[gasto.tipoPagamento] || 0) + gasto.valor;
    });

    const lista = document.getElementById("gastos-por-tipo");
    if (lista) {
      lista.innerHTML = "";
      const fragment = document.createDocumentFragment();
      Object.entries(gastosPorTipo).forEach(([tipo, valor]) => {
        const li = document.createElement("li");
        li.textContent = `${tipo}: R$ ${valor.toFixed(2)}`;
        fragment.appendChild(li);
      });
      lista.appendChild(fragment);
    }
  }

  /**
   * Atualizar gráfico de gastos
   */
  atualizarGrafico() {
    const canvas = document.getElementById("graficoGastos");
    if (!canvas) return;

    // Destruir gráfico anterior
    if (AppState.financeiro.grafico) {
      AppState.financeiro.grafico.destroy();
    }

    const gastos = AppState.financeiro.gastos;
    const tipos = {};
    gastos.forEach((gasto) => {
      tipos[gasto.tipoPagamento] =
        (tipos[gasto.tipoPagamento] || 0) + gasto.valor;
    });

    const labels = Object.keys(tipos);
    const data = Object.values(tipos);

    const ctx = canvas.getContext("2d");

    if (typeof Chart === "undefined") {
      console.error("❌ Chart.js não está carregado");
      return;
    }

    AppState.financeiro.grafico = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          title: {
            display: true,
            text: "Distribuição de Gastos por Tipo",
          },
          legend: {
            position: "bottom",
          },
        },
      },
    });

    console.log("✅ Gráfico atualizado");
  }

  /**
   * Exportar gastos como CSV
   */
  exportarCSV() {
    const gastos = AppState.financeiro.gastos;
    if (gastos.length === 0) {
      alert("Nenhum gasto para exportar");
      return;
    }

    let csv = "Descrição,Valor,Data,Tipo Pagamento\n";
    gastos.forEach((g) => {
      csv += `"${g.descricao}",${g.valor},"${g.data}","${g.tipoPagamento}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gastos_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    console.log("✅ Gastos exportados como CSV");
  }
}

export default Financeiro;
