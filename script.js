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

    // Exibe as imagens após o cálculo
    const imagensContainer = document.getElementById('imagens');
    imagensContainer.classList.add('show');

    salvarNoHistorico(metragemCubica, sache, pastilha, comprimido);
}

function calcularArea() {
    const base = parseFloat(document.getElementById('base').value);
    const altura = parseFloat(document.getElementById('alturaArea').value);

    if (isNaN(base) || isNaN(altura)) {
        alert("Por favor, insira todos os valores corretamente.");
        return;
    }

    const area = base * altura;
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
    abas.forEach(ab => ab.style.display = 'none'); // Oculta todas as abas

    document.getElementById(aba).style.display = 'block'; // Mostra apenas a aba selecionada
    // Oculta as imagens ao mudar de aba
    if (aba !== 'cubica') {
        document.getElementById('imagens').classList.remove('show');
    }
}
