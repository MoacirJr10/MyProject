/*
   TOOLS.JS - Central de Ferramentas
   Organizado por Módulos
*/

console.log("Tools.js carregado com sucesso!");

// ==========================================================================
// MÓDULO 1: NAVEGAÇÃO (ABAS)
// ==========================================================================
const Navigation = {
    init: function() {
        // Garante que a primeira aba (Blocos) esteja visível ao carregar
        this.mostrarAba("cubica");
    },

    mostrarAba: function(abaId) {
        console.log("Navegando para:", abaId);

        // Esconde tudo
        document.querySelectorAll(".tab-content").forEach(aba => aba.style.display = "none");

        // Mostra selecionada
        const aba = document.getElementById(abaId);
        if (aba) aba.style.display = "block";

        // Atualiza Menu
        document.querySelectorAll('.menu-lateral li').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('onclick').includes(abaId)) item.classList.add('active');
        });

        // Hooks para módulos específicos
        if (abaId === "financeiro") Financeiro.render();
        if (abaId === "historico") Historico.render();
    }
};

// Torna global para o HTML acessar
window.mostrarAba = (id) => Navigation.mostrarAba(id);


// ==========================================================================
// MÓDULO 2: CALCULADORAS (Engenharia)
// ==========================================================================
const Calculadoras = {
    blocos: function(e) {
        if(e) e.preventDefault();
        const h = this.getVal("altura");
        const l = this.getVal("largura");
        const c = this.getVal("comprimento");

        if (!h || !l || !c) return alert("Preencha todos os campos.");

        const vol = h * l * c;
        const res = {
            vol: vol.toFixed(2),
            sache: (vol / 56).toFixed(2),
            pastilha: (vol * 2).toFixed(2),
            comp: (vol * 10).toFixed(2)
        };

        this.showRes("resultado", `
            <p><strong>Volume:</strong> ${res.vol} m³</p>
            <p><strong>Sachê:</strong> ${res.sache} un</p>
            <p><strong>Pastilha:</strong> ${res.pastilha} g</p>
            <p><strong>Comprimido:</strong> ${res.comp} un</p>
        `);

        Historico.add(vol, res.sache, res.pastilha, res.comp);
    },

    area: function(e) {
        if(e) e.preventDefault();
        const l = this.getVal("larguraArea");
        const c = this.getVal("comprimentoArea");
        if (!l || !c) return alert("Preencha corretamente.");
        this.showRes("resultadoArea", `<p><strong>Área:</strong> ${(l * c).toFixed(2)} m²</p>`);
    },

    silo: function(e) {
        if(e) e.preventDefault();
        const d = this.getVal("diametroSilo");
        const h = this.getVal("alturaSilo");
        const mat = document.getElementById("tipoMaterial")?.value || "milho";

        if (!d || !h) return alert("Preencha diâmetro e altura.");

        const raio = d / 2;
        const vol = Math.PI * Math.pow(raio, 2) * h;

        const taxas = { milho: 4, soja: 5, arroz: 3, amendoim: 5, sorgo: 4.5 };
        const dose = vol * (taxas[mat] || 4);

        this.showRes("resultadoFumigacaoSilo", `
            <p><strong>Volume:</strong> ${vol.toFixed(2)} m³</p>
            <p><strong>Material:</strong> ${mat.toUpperCase()}</p>
            <p><strong>Dosagem:</strong> ${dose.toFixed(2)} g</p>
        `);
    },

    diametro: function(e) {
        if(e) e.preventDefault();
        const circ = this.getVal("circunferenciaSilo");
        if (!circ) return alert("Insira a circunferência.");

        const d = circ / Math.PI;
        document.getElementById("diametroSilo").value = d.toFixed(2);
        document.getElementById("diametro-result").innerText = `Diâmetro: ${d.toFixed(2)} m`;
    },

    // Helpers
    getVal: (id) => parseFloat(document.getElementById(id)?.value) || 0,
    showRes: (id, html) => {
        const el = document.getElementById(id);
        if(el) el.innerHTML = html;
    }
};

// Expondo funções
window.calcular = (e) => Calculadoras.blocos(e);
window.calcularArea = (e) => Calculadoras.area(e);
window.calcularFumigacaoSilo = (e) => Calculadoras.silo(e);
window.calcularDiametro = (e) => Calculadoras.diametro(e);
window.mostrarCampoCircunferencia = () => {
    const el = document.getElementById("circunferencia-container");
    if(el) el.style.display = el.style.display === "none" ? "block" : "none";
};


// ==========================================================================
// MÓDULO 3: CONVERSÕES
// ==========================================================================
const Conversoes = {
    exec: function(e, fator, unidade) {
        if(e) e.preventDefault();
        const m = parseFloat(document.getElementById("metros")?.value);
        if (isNaN(m)) return;

        const res = m * fator;
        document.getElementById("resultadoConversao").innerHTML =
            `<p>${m} m = <strong>${res.toFixed(4).replace(/\.?0+$/, '')} ${unidade}</strong></p>`;
    }
};

window.converterParaCentimetros = (e) => Conversoes.exec(e, 100, "cm");
window.converterParaQuilometros = (e) => Conversoes.exec(e, 0.001, "km");
window.converterParaMilhas = (e) => Conversoes.exec(e, 0.000621371, "milhas");


// ==========================================================================
// MÓDULO 4: FINANCEIRO
// ==========================================================================
const Financeiro = {
    dados: [],
    chart: null,

    init: function() {
        try { this.dados = JSON.parse(localStorage.getItem("gastos")) || []; } catch(e) { this.dados = []; }

        const form = document.getElementById("form-gasto");
        if (form) {
            const novoForm = form.cloneNode(true);
            form.parentNode.replaceChild(novoForm, form);
            novoForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this.adicionar();
            });
        }
        this.render();
    },

    adicionar: function() {
        const desc = document.getElementById("descricao")?.value.trim();
        const val = parseFloat(document.getElementById("valor")?.value);
        const data = document.getElementById("data")?.value;
        const tipo = document.getElementById("tipo-pagamento")?.value;

        if (!desc || !val || !data) return alert("Preencha tudo.");

        this.dados.push({ descricao: desc, valor: val, data, tipoPagamento: tipo });
        this.salvar();
        document.getElementById("form-gasto").reset();
        this.render();
    },

    remover: function(index) {
        if(confirm("Remover?")) {
            this.dados.splice(index, 1);
            this.salvar();
            this.render();
        }
    },

    salvar: function() {
        localStorage.setItem("gastos", JSON.stringify(this.dados));
    },

    render: function() {
        this.renderTabela();
        this.renderResumo();
        this.renderGrafico();
    },

    renderTabela: function() {
        const tbody = document.querySelector("#gastos tbody");
        if(!tbody) return;
        tbody.innerHTML = this.dados.map((g, i) => `
            <tr>
                <td>${g.descricao}</td>
                <td>R$ ${g.valor.toFixed(2)}</td>
                <td>${g.tipoPagamento}</td>
                <td><button onclick="removerGasto(${i})" style="color:red; border:none; cursor:pointer;">X</button></td>
            </tr>
        `).join("");
    },

    renderResumo: function() {
        const total = this.dados.reduce((acc, g) => acc + g.valor, 0);
        const elTotal = document.getElementById("total-gasto");
        if(elTotal) elTotal.textContent = total.toFixed(2);

        const porTipo = {};
        this.dados.forEach(g => porTipo[g.tipoPagamento] = (porTipo[g.tipoPagamento] || 0) + g.valor);

        const lista = document.getElementById("gastos-por-tipo");
        if(lista) {
            lista.innerHTML = Object.entries(porTipo).map(([k, v]) => `<li>${k}: R$ ${v.toFixed(2)}</li>`).join("");
        }
    },

    renderGrafico: function() {
        const canvas = document.getElementById("graficoGastos");
        if (!canvas || typeof Chart === 'undefined') return;

        const porTipo = {};
        this.dados.forEach(g => porTipo[g.tipoPagamento] = (porTipo[g.tipoPagamento] || 0) + g.valor);

        if (this.chart) this.chart.destroy();

        this.chart = new Chart(canvas.getContext("2d"), {
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
};

window.removerGasto = (i) => Financeiro.remover(i);


// ==========================================================================
// MÓDULO 5: HISTÓRICO
// ==========================================================================
const Historico = {
    dados: [],

    add: function(metragem, sache, pastilha, comprimido) {
        try { this.dados = JSON.parse(localStorage.getItem("historicoCalculos")) || []; } catch(e) { this.dados = []; }

        this.dados.push({
            data: new Date().toLocaleString(),
            metragem, sache, pastilha, comprimido
        });

        localStorage.setItem("historicoCalculos", JSON.stringify(this.dados));
    },

    render: function() {
        try { this.dados = JSON.parse(localStorage.getItem("historicoCalculos")) || []; } catch(e) { this.dados = []; }

        const container = document.querySelector(".historico-container");
        if (!container) return;

        container.innerHTML = this.dados.length ? this.dados.map(item => `
            <div style="border-bottom:1px solid #ccc; padding:10px; margin-bottom:10px;">
                <small>${item.data}</small>
                <div><strong>${item.metragem.toFixed(2)} m³</strong></div>
            </div>
        `).join("") : "<p>Sem histórico.</p>";
    },

    limpar: function() {
        if(confirm("Limpar tudo?")) {
            localStorage.removeItem("historicoCalculos");
            this.dados = [];
            this.render();
        }
    }
};

window.limparHistorico = () => Historico.limpar();


// ==========================================================================
// INICIALIZAÇÃO GERAL
// ==========================================================================
document.addEventListener("DOMContentLoaded", function () {
    Navigation.init();
    Financeiro.init();
});
