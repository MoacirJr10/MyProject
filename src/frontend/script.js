let historico = [];

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

function salvarNoHistorico(metragemCubica, sache, pastilha, comprimido) {
    const entrada = `Cálculo: ${metragemCubica.toFixed(2)} m³, Sachê: ${sache.toFixed(2)}, Pastilha: ${pastilha.toFixed(2)}, Comprimido: ${comprimido.toFixed(2)}`;
    historico.push(entrada);
    atualizarHistorico();
}

function atualizarHistorico() {
    const historicoContainer = document.querySelector('.historico-container');
    historicoContainer.innerHTML = historico.map(item => `<div>${item}</div>`).join('');
}

function limparHistorico() {
    historico = [];
    atualizarHistorico();
}

function mostrarAba(aba) {
    const abas = document.querySelectorAll('.tab-content');
    abas.forEach(ab => ab.style.display = 'none');

    document.getElementById(aba).style.display = 'block';
    if (aba !== 'cubica') {
        document.getElementById('imagens').classList.remove('show');
    }
}

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

document.querySelector('nav ul li a').addEventListener('click', function(event){
    event.preventDefault();
    alert('Você clicou no link');
});

document.querySelector('.btn').addEventListener('click', function(){
    window.location.href = 'index.html';
});

document.getElementById('inicio').addEventListener('click', function(){
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
