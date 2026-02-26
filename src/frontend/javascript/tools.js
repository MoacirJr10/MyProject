/*
   TOOLS.JS - Central de Ferramentas
*/

console.log("Tools.js carregado com sucesso!");

// ==========================================================================
// MÓDULO 1: NAVEGAÇÃO (ABAS)
// ==========================================================================
const Navigation = {
    init: function() {
        this.mostrarAba("cubica");
    },

    mostrarAba: function(abaId) {
        console.log("Navegando para:", abaId);

        document.querySelectorAll(".tab-content").forEach(aba => aba.style.display = "none");

        const aba = document.getElementById(abaId);
        if (aba) aba.style.display = "block";

        document.querySelectorAll('.menu-lateral li').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('onclick').includes(abaId)) item.classList.add('active');
        });
    }
};

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

    getVal: (id) => parseFloat(document.getElementById(id)?.value) || 0,
    showRes: (id, html) => {
        const el = document.getElementById(id);
        if(el) el.innerHTML = html;
    }
};

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
// MÓDULO 4: CALCULADORA DE RESISTOR (NOVO)
// ==========================================================================
const Resistor = {
    cores: {
        "0": "black", "1": "brown", "2": "red", "3": "orange", "4": "yellow",
        "5": "green", "6": "blue", "7": "violet", "8": "grey", "9": "white",
        "10": "gold", "100": "silver"
    },

    calcular: function() {
        const faixas = document.querySelector('input[name="faixas"]:checked').value;
        const d1 = document.getElementById('sel-band1').value;
        const d2 = document.getElementById('sel-band2').value;
        const d3 = (faixas === '5') ? document.getElementById('sel-band3').value : '';
        const mult = document.getElementById('sel-mult').value;
        const tol = document.getElementById('sel-tol').value;

        // Atualiza visual
        document.getElementById('band1').style.backgroundColor = this.getColor(d1);
        document.getElementById('band2').style.backgroundColor = this.getColor(d2);
        document.getElementById('band3').style.backgroundColor = (faixas === '5') ? this.getColor(d3) : 'transparent';
        document.getElementById('band-mult').style.backgroundColor = this.getColor(mult, true);
        document.getElementById('band-tol').style.backgroundColor = this.getColor(tol, true);

        if (d1 === '-1' || d2 === '-1' || mult === '-1' || tol === '-1' || (faixas === '5' && d3 === '-1')) {
            document.getElementById('resultadoResistor').innerText = "---";
            return;
        }

        const digitos = (faixas === '5') ? (d1 + d2 + d3) : (d1 + d2);
        const valorBase = parseInt(digitos);
        const valorFinal = valorBase * parseFloat(mult);

        document.getElementById('resultadoResistor').innerText = `${this.formatarValor(valorFinal)}Ω ±${tol}%`;
    },

    mudarFaixas: function() {
        const faixas = document.querySelector('input[name="faixas"]:checked').value;
        const selBand3 = document.getElementById('sel-band3');
        selBand3.style.display = (faixas === '5') ? 'block' : 'none';
        this.calcular();
    },

    getColor: function(val, isSpecial = false) {
        if (val === '-1') return 'transparent';
        if (isSpecial) {
            if (val === '0.1') return 'gold';
            if (val === '0.01') return 'silver';
            if (val === '5') return 'gold';
            if (val === '10') return 'silver';
        }
        return this.cores[val] || 'transparent';
    },

    formatarValor: function(valor) {
        if (valor >= 1000000) return (valor / 1000000) + ' M';
        if (valor >= 1000) return (valor / 1000) + ' k';
        return valor;
    }
};

window.calcularResistor = () => Resistor.calcular();
window.mudarFaixas = () => Resistor.mudarFaixas();


// ==========================================================================
// INICIALIZAÇÃO GERAL
// ==========================================================================
document.addEventListener("DOMContentLoaded", function () {
    Navigation.init();
    Resistor.calcular(); // Inicia o resistor
});
