function gerarOrcamento() {
    const clienteInput = document.getElementById('cliente');
    const descricaoInput = document.getElementById('descricao');
    const valorInput = document.getElementById('valor');

    const cliente = clienteInput?.value.trim() || '';
    const descricao = descricaoInput?.value.trim() || '';
    const valorStr = valorInput?.value.replace(',', '.') || '';
    const valor = parseFloat(valorStr);

    const erros = [];

    if (!cliente) erros.push('• Nome do cliente é obrigatório');
    if (!descricao) erros.push('• Descrição do projeto é obrigatória');
    if (valorStr === '' || isNaN(valor)) {
        erros.push('• Valor deve ser um número válido');
    } else if (valor <= 0) {
        erros.push('• Valor deve ser maior que zero');
    }

    if (erros.length > 0) {
        alert('Por favor, corrija os seguintes erros:\n\n' + erros.join('\n'));
        return;
    }

    const valorFormatado = valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const dataAtual = new Date().toLocaleDateString('pt-BR');

    const resultadoHTML = `
        <div class="result-content">
            <h3>Orçamento de Móveis Planejados</h3>
            <div class="result-details">
                <p><strong>Cliente:</strong> ${escapeHTML(cliente)}</p>
                <p><strong>Data:</strong> ${dataAtual}</p>
                <div class="description-box">
                    <p><strong>Descrição:</strong></p>
                    <p>${formatarDescricao(descricao)}</p>
                </div>
                <p class="total-value"><strong>Valor Total:</strong> ${valorFormatado}</p>
            </div>
        </div>
    `;

    const resultadoDiv = document.getElementById('orcamentoResultado');
    if (resultadoDiv) {
        resultadoDiv.innerHTML = resultadoHTML;
        resultadoDiv.style.display = 'block';
    }

    const pdfBtn = document.querySelector('.btn.secondary');
    if (pdfBtn) pdfBtn.disabled = false;
}

function gerarPDF() {
    const resultadoDiv = document.getElementById('orcamentoResultado');

    if (!resultadoDiv || !resultadoDiv.innerHTML.trim()) {
        alert('Por favor, gere o orçamento antes de exportar para PDF.');
        return;
    }

    if (typeof html2pdf === 'undefined') {
        alert('A biblioteca de geração de PDF não foi carregada corretamente.');
        return;
    }

    const options = {
        margin: [15, 15],
        filename: 'orcamento_moveis_planejados.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: false, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const originalContent = resultadoDiv.innerHTML;
    resultadoDiv.innerHTML = '<div class="pdf-loading"><p>Gerando PDF, aguarde...</p></div>';

    html2pdf()
        .set(options)
        .from(resultadoDiv)
        .save()
        .then(() => {
            resultadoDiv.innerHTML = originalContent;
        })
        .catch(err => {
            console.error('Erro ao gerar PDF:', err);
            resultadoDiv.innerHTML = originalContent;
            alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
        });
}

function formatarDescricao(texto) {
    return escapeHTML(texto).replace(/\n/g, '<br>');
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', function () {
    const campos = ['cliente', 'descricao', 'valor'];
    campos.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    gerarOrcamento();
                }
            });
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const cliente = urlParams.get('cliente');
    const descricao = urlParams.get('descricao');
    const valor = urlParams.get('valor');

    if (cliente) document.getElementById('cliente').value = cliente;
    if (descricao) document.getElementById('descricao').value = descricao;
    if (valor) document.getElementById('valor').value = valor;
});
