 <!-- Evento button Inicio -->

document.addEventListener('DOMContentLoaded', function(){
document.querySelectorAll('nav ul li a').forEach('click', function(event){
    event.preventDefault();
    alert('Você clicou no link');
});

document.querySelectorAll('.btn').forEach('click', function(){
    window.location.href = 'index.html';
});

document.getElementById('inicio').addEventListener('click',
    function(){
    window.location.href = 'index.html';
});

function mostrarAba(aba) {
    const abas = document.querySelectorAll('.tab-content');
    abas.forEach(ab => ab.style.display = 'none');

    if (aba === 'inicio') {
        document.getElementById('inicio-content').style.display = 'block';
    } else {
        document.getElementById(aba).style.display = 'block';
    }
}
});

                         <!-- Fumigação em Bloco -->
function calcular() {
    const altura = parseFloat(document.getElementById('altura').value);
    const largura = parseFloat(document.getElementById('largura').value);
    const comprimento = parseFloat(document.getElementById('comprimento').value);

    if (isNaN(altura) || isNaN(largura) || isNaN(comprimento)) {
        alert("Por favor, insira todos os valores corretamente.");
        return;
    }

    const metragemCubica = altura * largura * comprimento;
    const sache = metragemCubica / 56;
    const pastilha = metragemCubica * 2;
    const comprimido = metragemCubica * 10;

    document.getElementById('resultado').innerHTML = `
        A metragem cúbica é: ${metragemCubica.toFixed(2)} m³<br>
        O Sachê é: ${sache.toFixed(2)}<br>
        A Pastilha é: ${pastilha.toFixed(2)}<br>
        O Comprimido é: ${comprimido.toFixed(2)}
    `;

    const imagensContainer = document.getElementById('imagens');
    imagensContainer.classList.add('show');

    salvarNoHistorico(metragemCubica, sache, pastilha, comprimido);
}

function calcularArea() {
    const largura = parseFloat(document.getElementById('larguraArea').value);
    const comprimento = parseFloat(document.getElementById('comprimentoArea').value);

    if (isNaN(largura) || isNaN(comprimento) || largura <= 0 || comprimento <= 0) {
        alert("Por favor, insira valores positivos para largura e comprimento.");
        return;
    }

    const area = largura * comprimento;
    document.getElementById('resultadoArea').innerHTML = `Área: ${area.toFixed(2)} m²`;
}


function mostrarAba(aba) {
    const abas = document.querySelectorAll('.tab-content');
    abas.forEach(ab => ab.style.display = 'none');

    document.getElementById(aba).style.display = 'block';
    if (aba !== 'cubica') {
        document.getElementById('imagens').classList.remove('show');
    }
}

                               <!-- Fumigação  em Silo -->
function calcularFumigacaoSilo() {
    const diametro = parseFloat(document.getElementById('diametroSilo').value);
    const altura = parseFloat(document.getElementById('alturaSilo').value);
    const tipoMaterial = document.getElementById('tipoMaterial').value;

    if (isNaN(diametro) || isNaN(altura)) {
        alert("Por favor, insira todos os valores corretamente.");
        return;
    }


    const raio = diametro / 2;
    const volume = Math.PI * Math.pow(raio, 2) * altura;

    let dosagemPorM3;
    let tempoExposicao;


    switch (tipoMaterial) {
        case 'milho':
            dosagemPorM3 = 4;
            tempoExposicao = " 10 dias";
            break;
        case 'soja':
            dosagemPorM3 = 5;
            tempoExposicao = " 10 dias";
            break;
        case 'arroz':
            dosagemPorM3 = 3;
            tempoExposicao = " 10 dias";
            break;
        case 'amendoim':
            dosagemPorM3 = 5;
            tempoExposicao = " 10 dias";
            break;
        case 'sorgo':
            dosagemPorM3 = 4.5;
            tempoExposicao = " 10 dias";
            break;
        default:
            alert("Tipo de material não reconhecido.");
            return;
    }

    const quantidadeFumigante = volume * dosagemPorM3;

    document.getElementById('resultadoFumigacaoSilo').innerHTML = `
        <p>Volume do Silo: ${volume.toFixed(2)} m³</p>
        <p>Tipo de Material: ${tipoMaterial.charAt(0).toUpperCase() + tipoMaterial.slice(1)}</p>
        <p>Dosagem Necessária: ${quantidadeFumigante.toFixed(2)} g de fosfeto de alumínio</p>
        <p>Tempo de Exposição: ${tempoExposicao}</p>
    `;
}
function calcularDiametro() {
    const raio = document.getElementById('raio').value;
    if (raio && !isNaN(raio)) {
        const diametro = raio * 2;
        document.getElementById('diametro-result').innerText = `O diâmetro do silo é: ${diametro} metros`;
    } else {
        document.getElementById('diametro-result').innerText = 'Por favor, insira um valor válido para o raio.';
    }
}
function calcularDiametro() {
    const circunferencia = parseFloat(document.getElementById('circunferenciaSilo').value);
    if (!isNaN(circunferencia) && circunferencia > 0) {
        const diametro = circunferencia / Math.PI;
        document.getElementById('diametroSilo').value = diametro.toFixed(2);
        document.getElementById('diametro-result').innerText = `O diâmetro do silo é: ${diametro.toFixed(2)} m`;
        alert(`Diâmetro calculado: ${diametro.toFixed(2)} m`);
    } else {
        alert('Por favor, insira a circunferência para calcular o diâmetro.');
    }
}

function mostrarCampoCircunferencia() {
    document.getElementById('circunferenciaSilo').style.display = 'block';
}

                     <!-- Conversor de Medidas -->

function converterParaCentimetros() {
    const metros = parseFloat(document.getElementById('metros').value);

    if (isNaN(metros)) {
        alert("Por favor, insira um valor em metros.");
        return;
    }

    const centimetros = metros * 100;
    document.getElementById('resultadoConversao').innerHTML = `${metros} metros = ${centimetros} cm`;
}

function converterParaQuilometros() {
    const metros = parseFloat(document.getElementById('metros').value);

    if (isNaN(metros)) {
        alert("Por favor, insira um valor em metros.");
        return;
    }

    const quilometros = metros / 1000;
    document.getElementById('resultadoConversao').innerHTML = `${metros} metros = ${quilometros} km`;
}

function converterParaMilhas() {
    const metros = parseFloat(document.getElementById('metros').value);

    if (isNaN(metros)) {
        alert("Por favor, insira um valor em metros.");
        return;
    }

    const milhas = metros / 1609.34;
    document.getElementById('resultadoConversao').innerHTML = `${metros} metros = ${milhas} milhas`;
}

                                  <!-- Financeiro -->
let gastos = [];
let graficoGastos = null;

function inicializarControleFinanceiro() {

    gastos = JSON.parse(localStorage.getItem('gastos')) || [];

    const formGasto = document.getElementById('form-gasto');
    if (formGasto) {
        formGasto.addEventListener('submit', adicionarGasto);
    }

    atualizarListaGastos();
    atualizarResumoFinanceiro();
    atualizarGrafico();
}

function adicionarGasto(event) {
    event.preventDefault();

    const descricao = document.getElementById('descricao').value.trim();
    const valor = parseFloat(document.getElementById('valor').value);
    const data = document.getElementById('data').value;
    const tipoPagamento = document.getElementById('tipo-pagamento').value;

    if (!descricao || isNaN(valor) || valor <= 0 || !data || !tipoPagamento) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

    const gasto = { descricao, valor, data, tipoPagamento };
    gastos.push(gasto);
    localStorage.setItem('gastos', JSON.stringify(gastos));

    atualizarListaGastos();
    atualizarResumoFinanceiro();
    atualizarGrafico();

     event.target.reset();
}

function atualizarListaGastos() {
    const listaGastos = document.getElementById('gastos');
    if (!listaGastos) return;

    listaGastos.innerHTML = '';

    gastos.forEach((gasto, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="gasto-item">
                <span>${gasto.descricao} - R$ ${gasto.valor.toFixed(2)}</span>
                <span>${gasto.tipoPagamento} - ${formatarData(gasto.data)}</span>
                <button onclick="removerGasto(${index})" class="btn-remover">Remover</button>
            </div>
        `;
        const btnRemover = li.querySelector('.btn-remover');
        btnRemover.addEventListener('click', () => removerGasto(index));

        listaGastos.appendChild(li);
    });
}

function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

function removerGasto(index) {
    if (confirm("Tem certeza que deseja remover este gasto?")) {
        gastos.splice(index, 1);
        localStorage.setItem('gastos', JSON.stringify(gastos));
        atualizarListaGastos();
        atualizarResumoFinanceiro();
        atualizarGrafico();
    }
}

function atualizarResumoFinanceiro() {

    const totalGasto = gastos.reduce((total, gasto) => total + gasto.valor, 0);
    const totalGastoElement = document.getElementById('total-gasto');
    if (totalGastoElement) {
        totalGastoElement.textContent = totalGasto.toFixed(2);
    }

    const gastosPorTipo = gastos.reduce((acc, gasto) => {
        acc[gasto.tipoPagamento] = (acc[gasto.tipoPagamento] || 0) + gasto.valor;
        return acc;
    }, {});

    const listaGastosPorTipo = document.getElementById('gastos-por-tipo');
    if (listaGastosPorTipo) {
        listaGastosPorTipo.innerHTML = '';
        Object.entries(gastosPorTipo).forEach(([tipo, valor]) => {
            const li = document.createElement('li');
            li.textContent = `${tipo}: R$ ${valor.toFixed(2)}`;
            listaGastosPorTipo.appendChild(li);
        });
    }
}

function atualizarGrafico() {
    const ctx = document.getElementById('graficoGastos').getContext('2d');

    const gastosPorTipo = gastos.reduce((acc, gasto) => {
        acc[gasto.tipoPagamento] = (acc[gasto.tipoPagamento] || 0) + gasto.valor;
        return acc;
    }, {});

    const dados = {
        labels: Object.keys(gastosPorTipo),
        datasets: [{
            data: Object.values(gastosPorTipo),
            backgroundColor: ['#B22222', '#36A2EB', '#FFCE56', '#4BC0C0']
        }]
    };

    if (graficoGastos) {
        graficoGastos.destroy();
    }

    graficoGastos = new Chart(ctx, {
        type: 'doughnut',
        data: dados,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',},
                title: {
                    display: true,
                    text: 'Distribuição de Gastos por Tipo de Pagamento'}
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', inicializarControleFinanceiro);
window.removerGasto = removerGasto;

                                  <!-- Histórico -->

let historico = [];

function salvarNoHistorico(metragemCubica, sache, pastilha, comprimido) {
    const timestamp = new Date().toLocaleString();
    const entrada = {
    id: Date.now(),
    timestamp: timestamp,
    dados:`Cálculo: ${metragemCubica.toFixed(2)} m³, Sachê: ${sache.toFixed(2)},
           Pastilha: ${pastilha.toFixed(2)}, Comprimido: ${comprimido.toFixed(2)}`
};

    historico.push(entrada);
    atualizarHistorico();
}

function atualizarHistorico() {
    const historicoContainer = document.querySelector('.historico-container');
    if (!historicoContainer) return;

    historicoContainer.innerHTML = `
        <ol>
            ${historico.map(item => `
                <li>
                    <strong>${item.timestamp}</strong>: ${item.dados}
                    <button onclick="removerDoHistorico(${item.id})" class="btn-remover">Remover</button>
                </li>
            `).join('')}
        </ol>
    `;
}

function removerDoHistorico(id) {
    if (confirm("Tem certeza que deseja remover este item do histórico?")) {
        historico = historico.filter(item => item.id !== id);
        atualizarHistorico();
    }
}

function limparHistorico() {
    if (confirm("Tem certeza que deseja limpar todo o histórico?")) {
        historico = [];
        atualizarHistorico();
    }
}

           <---Evento Visitas--->

document.addEventListener("DOMContentLoaded", function () {
    fetch("http://localhost:3000/visitas")
        .then(response => response.json())
        .then(data => {
            document.getElementById("contador").innerText = `Visitas: ${data.visitas}`;
        })
        .catch(error => console.error("Erro ao obter visitas:", error));
});