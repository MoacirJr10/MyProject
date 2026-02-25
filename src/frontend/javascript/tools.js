/* Lógica das Ferramentas (tools.html) */

// Função para alternar entre as abas
function mostrarAba(abaId) {
  // 1. Esconde todas as abas
  const abas = document.querySelectorAll(".tab-content");
  abas.forEach((aba) => {
    aba.style.display = "none";
  });

  // 2. Mostra a aba selecionada
  const abaSelecionada = document.getElementById(abaId);
  if (abaSelecionada) {
    abaSelecionada.style.display = "block";
  }

  // 3. Atualiza o menu lateral (Visual)
  const menuItens = document.querySelectorAll('.menu-lateral li');
  menuItens.forEach(item => {
    item.classList.remove('active');
    // Verifica se o onclick do item contém o ID da aba atual
    if (item.getAttribute('onclick').includes(abaId)) {
        item.classList.add('active');
    }
  });

  // 4. Ações específicas por aba
  if (abaId === "financeiro") {
    atualizarGrafico();
  } else if (abaId === "historico") {
    atualizarHistorico();
  }
}

// --- CALCULADORA DE BLOCOS ---
function calcular(event) {
  if (event) event.preventDefault();

  const altura = parseFloat(document.getElementById("altura")?.value);
  const largura = parseFloat(document.getElementById("largura")?.value);
  const comprimento = parseFloat(document.getElementById("comprimento")?.value);

  if ([altura, largura, comprimento].some((val) => isNaN(val))) {
    alert("Por favor, insira todos os valores corretamente.");
    return;
  }

  const metragemCubica = altura * largura * comprimento;
  const sache = metragemCubica / 56;
  const pastilha = metragemCubica * 2;
  const comprimido = metragemCubica * 10;

  document.getElementById("resultado").innerHTML = `
        <p><strong>Volume:</strong> ${metragemCubica.toFixed(2)} m³</p>
        <p><strong>Sachê:</strong> ${sache.toFixed(2)} un</p>
        <p><strong>Pastilha:</strong> ${pastilha.toFixed(2)} g</p>
        <p><strong>Comprimido:</strong> ${comprimido.toFixed(2)} un</p>
    `;

  salvarNoHistorico(metragemCubica, sache, pastilha, comprimido);
}

// --- CALCULADORA DE ÁREA ---
function calcularArea(event) {
  if (event) event.preventDefault();

  const largura = parseFloat(document.getElementById("larguraArea")?.value);
  const comprimento = parseFloat(document.getElementById("comprimentoArea")?.value);

  if (isNaN(largura) || isNaN(comprimento) || largura <= 0 || comprimento <= 0) {
    alert("Por favor, insira valores positivos.");
    return;
  }

  const area = largura * comprimento;
  document.getElementById("resultadoArea").innerHTML = `<p><strong>Área:</strong> ${area.toFixed(2)} m²</p>`;
}

// --- CALCULADORA DE SILO ---
function calcularFumigacaoSilo(event) {
  if (event) event.preventDefault();

  const diametro = parseFloat(document.getElementById("diametroSilo")?.value);
  const altura = parseFloat(document.getElementById("alturaSilo")?.value);
  const tipoMaterial = document.getElementById("tipoMaterial")?.value;

  if (isNaN(diametro) || isNaN(altura)) {
    alert("Por favor, insira diâmetro e altura.");
    return;
  }

  const raio = diametro / 2;
  const volume = Math.PI * Math.pow(raio, 2) * altura;

  let dosagemPorM3 = 0;
  switch (tipoMaterial) {
    case "milho": dosagemPorM3 = 4; break;
    case "soja": dosagemPorM3 = 5; break;
    case "arroz": dosagemPorM3 = 3; break;
    case "amendoim": dosagemPorM3 = 5; break;
    case "sorgo": dosagemPorM3 = 4.5; break;
    default: dosagemPorM3 = 4;
  }

  const quantidadeFumigante = volume * dosagemPorM3;

  document.getElementById("resultadoFumigacaoSilo").innerHTML = `
        <p><strong>Volume:</strong> ${volume.toFixed(2)} m³</p>
        <p><strong>Material:</strong> ${tipoMaterial.toUpperCase()}</p>
        <p><strong>Dosagem:</strong> ${quantidadeFumigante.toFixed(2)} g (Fosfeto)</p>
        <p><strong>Tempo:</strong> 10 dias</p>
    `;
}

function mostrarCampoCircunferencia() {
  const container = document.getElementById("circunferencia-container");
  if (container) {
      container.style.display = container.style.display === "none" ? "block" : "none";
  }
}

function calcularDiametro(event) {
  if (event) event.preventDefault();
  const circunferencia = parseFloat(document.getElementById("circunferenciaSilo")?.value);

  if (!isNaN(circunferencia) && circunferencia > 0) {
    const diametro = circunferencia / Math.PI;
    document.getElementById("diametroSilo").value = diametro.toFixed(2);
    document.getElementById("diametro-result").innerText = `Diâmetro calculado: ${diametro.toFixed(2)} m`;
  } else {
    alert("Insira a circunferência.");
  }
}

// --- CONVERSÕES ---
function converterParaCentimetros(event) {
  if (event) event.preventDefault();
  const metros = parseFloat(document.getElementById("metros")?.value);
  if (isNaN(metros)) return;
  document.getElementById("resultadoConversao").innerHTML = `<p>${metros} m = <strong>${metros * 100} cm</strong></p>`;
}

function converterParaQuilometros(event) {
  if (event) event.preventDefault();
  const metros = parseFloat(document.getElementById("metros")?.value);
  if (isNaN(metros)) return;
  document.getElementById("resultadoConversao").innerHTML = `<p>${metros} m = <strong>${metros / 1000} km</strong></p>`;
}

function converterParaMilhas(event) {
  if (event) event.preventDefault();
  const metros = parseFloat(document.getElementById("metros")?.value);
  if (isNaN(metros)) return;
  document.getElementById("resultadoConversao").innerHTML = `<p>${metros} m = <strong>${(metros / 1609.34).toFixed(4)} milhas</strong></p>`;
}

// --- FINANCEIRO ---
let gastos = [];
let graficoGastos = null;

function inicializarControleFinanceiro() {
  try {
    gastos = JSON.parse(localStorage.getItem("gastos")) || [];
  } catch (e) {
    gastos = [];
  }

  const formGasto = document.getElementById("form-gasto");
  if (formGasto) {
    // Remove listeners antigos para evitar duplicação
    const novoForm = formGasto.cloneNode(true);
    formGasto.parentNode.replaceChild(novoForm, formGasto);

    novoForm.addEventListener("submit", function (event) {
      event.preventDefault();
      adicionarGasto();
    });
  }

  atualizarListaGastos();
  atualizarResumoFinanceiro();
  atualizarGrafico();
}

function adicionarGasto() {
  const descricao = document.getElementById("descricao")?.value.trim();
  const valor = parseFloat(document.getElementById("valor")?.value);
  const data = document.getElementById("data")?.value;
  const tipoPagamento = document.getElementById("tipo-pagamento")?.value;

  if (!descricao || isNaN(valor) || valor <= 0 || !data) {
    alert("Preencha todos os campos.");
    return;
  }

  gastos.push({ descricao, valor, data, tipoPagamento });
  localStorage.setItem("gastos", JSON.stringify(gastos));

  document.getElementById("form-gasto").reset();
  atualizarListaGastos();
  atualizarResumoFinanceiro();
  atualizarGrafico();
}

function atualizarListaGastos() {
  const tbody = document.querySelector("#gastos tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  gastos.forEach((gasto, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${gasto.descricao}</td>
            <td>R$ ${gasto.valor.toFixed(2)}</td>
            <td>${gasto.tipoPagamento}</td>
            <td><button onclick="removerGasto(${index})" style="color:red; border:none; background:none; cursor:pointer;">X</button></td>
        `;
    tbody.appendChild(tr);
  });
}

function removerGasto(index) {
  if (confirm("Remover gasto?")) {
    gastos.splice(index, 1);
    localStorage.setItem("gastos", JSON.stringify(gastos));
    atualizarListaGastos();
    atualizarResumoFinanceiro();
    atualizarGrafico();
  }
}

function atualizarResumoFinanceiro() {
  const total = gastos.reduce((acc, g) => acc + g.valor, 0);
  const elTotal = document.getElementById("total-gasto");
  if(elTotal) elTotal.textContent = total.toFixed(2);

  const porTipo = {};
  gastos.forEach(g => porTipo[g.tipoPagamento] = (porTipo[g.tipoPagamento] || 0) + g.valor);

  const lista = document.getElementById("gastos-por-tipo");
  if(lista) {
      lista.innerHTML = "";
      for (const [tipo, valor] of Object.entries(porTipo)) {
        const li = document.createElement("li");
        li.textContent = `${tipo}: R$ ${valor.toFixed(2)}`;
        lista.appendChild(li);
      }
  }
}

function atualizarGrafico() {
  const canvas = document.getElementById("graficoGastos");
  if (!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext("2d");
  const porTipo = {};
  gastos.forEach(g => porTipo[g.tipoPagamento] = (porTipo[g.tipoPagamento] || 0) + g.valor);

  if (graficoGastos) graficoGastos.destroy();

  graficoGastos = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(porTipo),
      datasets: [{
        data: Object.values(porTipo),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      }],
    },
    options: { responsive: true }
  });
}

// --- HISTÓRICO ---
let historico = [];

function salvarNoHistorico(metragem, sache, pastilha, comprimido) {
  const item = {
    data: new Date().toLocaleString(),
    metragem, sache, pastilha, comprimido
  };

  try {
      historico = JSON.parse(localStorage.getItem("historicoCalculos")) || [];
  } catch(e) { historico = []; }

  historico.push(item);
  localStorage.setItem("historicoCalculos", JSON.stringify(historico));
}

function atualizarHistorico() {
  try {
      historico = JSON.parse(localStorage.getItem("historicoCalculos")) || [];
  } catch(e) { historico = []; }

  const container = document.querySelector(".historico-container");
  if (!container) return;

  container.innerHTML = historico.length ? historico.map(item => `
    <div style="border-bottom:1px solid #ccc; padding:10px; margin-bottom:10px;">
        <small>${item.data}</small>
        <div><strong>${item.metragem.toFixed(2)} m³</strong></div>
    </div>
  `).join("") : "<p>Sem histórico.</p>";
}

function limparHistorico() {
  if (confirm("Limpar tudo?")) {
    localStorage.removeItem("historicoCalculos");
    historico = [];
    atualizarHistorico();
  }
}

// --- INICIALIZAÇÃO ---
document.addEventListener("DOMContentLoaded", function () {
  // Garante que a primeira aba (Blocos) esteja visível ao carregar
  mostrarAba("cubica");

  // Inicializa módulos
  inicializarControleFinanceiro();
});
