/**
 * Calculator Module - Consolidação de Todas as Calculadoras
 * Contém: volume, área, fumigação, conversões, diâmetro
 */

class Calculator {
  /**
   * Calcular volume e doses de fumigação (blocos)
   */
  static calcularVolume(altura, largura, comprimento) {
    altura = parseFloat(altura);
    largura = parseFloat(largura);
    comprimento = parseFloat(comprimento);

    if (
      [altura, largura, comprimento].some((val) => isNaN(val) || val === "")
    ) {
      throw new Error("Preencha todos os valores corretamente");
    }

    const metragemCubica = altura * largura * comprimento;
    return {
      cubica: metragemCubica.toFixed(2),
      sache: (metragemCubica / 56).toFixed(2),
      pastilha: (metragemCubica * 2).toFixed(2),
      comprimido: (metragemCubica * 10).toFixed(2),
    };
  }

  /**
   * Calcular área (2D)
   */
  static calcularArea(largura, comprimento) {
    largura = parseFloat(largura);
    comprimento = parseFloat(comprimento);

    if (
      isNaN(largura) ||
      isNaN(comprimento) ||
      largura <= 0 ||
      comprimento <= 0
    ) {
      throw new Error("Insira valores positivos para largura e comprimento");
    }

    return (largura * comprimento).toFixed(2);
  }

  /**
   * Calcular fumigação para silo cilíndrico
   */
  static calcularFumigacaoSilo(diametro, altura, tipoMaterial = "milho") {
    diametro = parseFloat(diametro);
    altura = parseFloat(altura);

    if (isNaN(diametro) || isNaN(altura) || diametro <= 0 || altura <= 0) {
      throw new Error("Insira valores positivos para diâmetro e altura");
    }

    const raio = diametro / 2;
    const volume = Math.PI * Math.pow(raio, 2) * altura;

    const taxas = {
      milho: 4,
      soja: 5,
      arroz: 3,
      amendoim: 5,
      sorgo: 4.5,
    };

    const dosagemPorM3 = taxas[tipoMaterial] || 4;
    const quantidadeFumigante = volume * dosagemPorM3;

    return {
      volume: volume.toFixed(2),
      material: tipoMaterial,
      dosagem: quantidadeFumigante.toFixed(2),
      tempoExposicao: "10 dias",
    };
  }

  /**
   * Calcular diâmetro a partir da circunferência
   */
  static calcularDiametro(circunferencia) {
    circunferencia = parseFloat(circunferencia);

    if (isNaN(circunferencia) || circunferencia <= 0) {
      throw new Error("Insira a circunferência para calcular o diâmetro");
    }

    return (circunferencia / Math.PI).toFixed(2);
  }

  /**
   * Converter metros para outras unidades
   */
  static converterMetros(metros, tipo) {
    metros = parseFloat(metros);

    if (isNaN(metros) || metros < 0) {
      throw new Error("Insira um valor válido em metros");
    }

    const conversoes = {
      centimetros: (metros * 100).toFixed(2),
      quilometros: (metros / 1000).toFixed(4),
      milhas: (metros / 1609.34).toFixed(4),
    };

    if (!conversoes[tipo]) {
      throw new Error(`Tipo de conversão "${tipo}" não suportado`);
    }

    return conversoes[tipo];
  }

  /**
   * Calcular resistor (4 ou 5 faixas)
   */
  static calcularResistor(
    d1,
    d2,
    d3,
    multiplicador,
    tolerancia,
    numFaixas = 4,
  ) {
    const digitos = numFaixas === 5 ? d1 + d2 + d3 : d1 + d2;
    const valorBase = parseInt(digitos);
    const valorFinal = valorBase * parseFloat(multiplicador);

    return {
      base: valorBase,
      final: valorFinal,
      tolerancia: tolerancia,
      unidade: valorFinal >= 1000000 ? "MΩ" : valorFinal >= 1000 ? "kΩ" : "Ω",
      valorFormatado:
        valorFinal >= 1000000
          ? (valorFinal / 1000000).toFixed(2)
          : valorFinal >= 1000
            ? (valorFinal / 1000).toFixed(2)
            : valorFinal.toFixed(2),
    };
  }

  /**
   * Validar entrada e mostrar mensagem de erro
   */
  static validar(valores, nomes) {
    for (let i = 0; i < valores.length; i++) {
      if (isNaN(valores[i]) || valores[i] === "") {
        throw new Error(`${nomes[i]} inválido`);
      }
    }
    return true;
  }

  /**
   * Formatar número com separador de milhares
   */
  static formatarNumero(numero) {
    return parseFloat(numero).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}

export default Calculator;
