function mostrarAba(abaId) {
  const abas = document.querySelectorAll(".tab-content");
  abas.forEach((aba) => {
    aba.style.display = "none";
  });

  const abaSelecionada = document.getElementById(abaId);
  if (abaSelecionada) {
    abaSelecionada.style.display = "block";
  }

  if (abaId === "historico") {
    atualizarHistorico();
  }
}

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
        <p>A metragem cúbica é: ${metragemCubica.toFixed(2)} m³</p>
        <p>O Sachê é: ${sache.toFixed(2)}</p>
        <p>A Pastilha é: ${pastilha.toFixed(2)}</p>
        <p>O Comprimido é: ${comprimido.toFixed(2)}</p>
    `;

  salvarNoHistorico(metragemCubica, sache, pastilha, comprimido);
}

function calcularArea(event) {
  if (event) event.preventDefault();

  const largura = parseFloat(document.getElementById("larguraArea")?.value);
  const comprimento = parseFloat(
    document.getElementById("comprimentoArea")?.value,
  );

  if (
    isNaN(largura) ||
    isNaN(comprimento) ||
    largura <= 0 ||
    comprimento <= 0
  ) {
    alert("Por favor, insira valores positivos para largura e comprimento.");
    return;
  }

  const area = largura * comprimento;
  document.getElementById("resultadoArea").innerHTML = `Área: ${area.toFixed(
    2,
  )} m²`;
}

function calcularFumigacaoSilo(event) {
  if (event) event.preventDefault();

  const diametro = parseFloat(document.getElementById("diametroSilo")?.value);
  const altura = parseFloat(document.getElementById("alturaSilo")?.value);
  const tipoMaterial = document.getElementById("tipoMaterial")?.value;

  if (isNaN(diametro) || isNaN(altura)) {
    alert("Por favor, insira todos os valores corretamente.");
    return;
  }

  const raio = diametro / 2;
  const volume = Math.PI * Math.pow(raio, 2) * altura;

  let dosagemPorM3;
  let tempoExposicao = "10 dias";

  switch (tipoMaterial) {
    case "milho":
      dosagemPorM3 = 4;
      break;
    case "soja":
      dosagemPorM3 = 5;
      break;
    case "arroz":
      dosagemPorM3 = 3;
      break;
    case "amendoim":
      dosagemPorM3 = 5;
      break;
    case "sorgo":
      dosagemPorM3 = 4.5;
      break;
    default:
      alert("Tipo de material não reconhecido.");
      return;
  }

  const quantidadeFumigante = volume * dosagemPorM3;

  document.getElementById("resultadoFumigacaoSilo").innerHTML = `
        <p>Volume do Silo: ${volume.toFixed(2)} m³</p>
        <p>Tipo de Material: ${
          tipoMaterial.charAt(0).toUpperCase() + tipoMaterial.slice(1)
        }</p>
        <p>Dosagem Necessária: ${quantidadeFumigante.toFixed(
          2,
        )} g de fosfeto de alumínio</p>
        <p>Tempo de Exposição: ${tempoExposicao}</p>
    `;
}

function mostrarCampoCircunferencia() {
  const container = document.getElementById("circunferencia-container");
  if (container) container.style.display = "block";
}

function calcularDiametro(event) {
  if (event) event.preventDefault();

  const circunferencia = parseFloat(
    document.getElementById("circunferenciaSilo")?.value,
  );
  if (!isNaN(circunferencia) && circunferencia > 0) {
    const diametro = circunferencia / Math.PI;
    document.getElementById("diametroSilo").value = diametro.toFixed(2);
    document.getElementById("diametro-result").innerText =
      `O diâmetro do silo é: ${diametro.toFixed(2)} m`;
  } else {
    alert("Por favor, insira a circunferência para calcular o diâmetro.");
  }
}

function converterParaCentimetros(event) {
  if (event) event.preventDefault();

  const metros = parseFloat(document.getElementById("metros")?.value);

  if (isNaN(metros)) {
    alert("Por favor, insira um valor em metros.");
    return;
  }

  const centimetros = metros * 100;
  document.getElementById("resultadoConversao").innerHTML =
    `${metros} metros = ${centimetros} cm`;
}

function converterParaQuilometros(event) {
  if (event) event.preventDefault();

  const metros = parseFloat(document.getElementById("metros")?.value);

  if (isNaN(metros)) {
    alert("Por favor, insira um valor em metros.");
    return;
  }

  const quilometros = metros / 1000;
  document.getElementById("resultadoConversao").innerHTML =
    `${metros} metros = ${quilometros} km`;
}

function converterParaMilhas(event) {
  if (event) event.preventDefault();

  const metros = parseFloat(document.getElementById("metros")?.value);

  if (isNaN(metros)) {
    alert("Por favor, insira um valor em metros.");
    return;
  }

  const milhas = metros / 1609.34;
  document.getElementById("resultadoConversao").innerHTML =
    `${metros} metros = ${milhas.toFixed(4)} milhas`;
}

let historico = [];

function salvarNoHistorico(metragemCubica, sache, pastilha, comprimido) {
  const calculo = {
    data: new Date().toLocaleString(),
    metragem: metragemCubica,
    sache: sache,
    pastilha: pastilha,
    comprimido: comprimido,
  };

  try {
    historico = JSON.parse(localStorage.getItem("historicoCalculos")) || [];
  } catch (e) {
    console.error("Erro ao carregar histórico:", e);
    historico = [];
  }

  historico.push(calculo);

  try {
    localStorage.setItem("historicoCalculos", JSON.stringify(historico));
  } catch (e) {
    console.error("Erro ao salvar histórico:", e);
  }
}

function atualizarHistorico() {
  try {
    historico = JSON.parse(localStorage.getItem("historicoCalculos")) || [];
  } catch (e) {
    console.error("Erro ao carregar histórico:", e);
    historico = [];
  }

  const container = document.querySelector(".historico-container");
  if (!container) return;

  container.innerHTML =
    historico.length > 0
      ? historico
          .map(
            (item) => `
            <div class="historico-item">
                <p><strong>${item.data}</strong></p>
                <p>Metragem: ${item.metragem.toFixed(2)} m³</p>
                <p>Sachê: ${item.sache.toFixed(2)}</p>
                <p>Pastilha: ${item.pastilha.toFixed(2)}</p>
                <p>Comprimido: ${item.comprimido.toFixed(2)}</p>
            </div>
        `,
          )
          .join("")
      : "<p>Nenhum cálculo no histórico.</p>";
}

function limparHistorico() {
  if (confirm("Tem certeza que deseja limpar todo o histórico?")) {
    localStorage.removeItem("historicoCalculos");
    historico = [];
    atualizarHistorico();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  mostrarAba("cubica");
  atualizarHistorico();
});

/* Setas Slids cards */
document.querySelectorAll(".projeto-card").forEach((card) => {
  const slider = card.querySelector(".slider");
  const images = card.querySelectorAll(".slider img");
  const prevBtn = card.querySelector(".prev");
  const nextBtn = card.querySelector(".next");

  let index = 0;

  function showImage(i) {
    index = (i + images.length) % images.length;
    slider.style.transform = `translateX(${-index * 100}%)`;
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => showImage(index - 1));
    nextBtn.addEventListener("click", () => showImage(index + 1));
  }
});
// Modal
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImg");
const captionText = document.getElementById("caption");
const closeBtn = document.querySelector(".modal .close");

// Ao clicar em qualquer imagem do slider, abre o modal
document.querySelectorAll(".slider img").forEach((img) => {
  img.addEventListener("click", () => {
    modal.style.display = "block";
    modalImg.src = img.src;
    captionText.textContent = img.alt;
  });
});

// Fechar modal
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Fechar clicando fora da imagem
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});
