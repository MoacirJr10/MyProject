### 1. Introdução e Objetivo
O projeto nasceu da necessidade de alimentar equipamentos sensíveis de alto desempenho — um PC Gamer e uma Impressora 3D — que demandam energia estável e proteção contra interferências. O objetivo foi criar uma central de distribuição que não fosse apenas uma 'extensão', mas um sistema de tratamento de energia com monitoramento em tempo real.

### 2. Especificações do Hardware
Para garantir a integridade do sistema sob carga de 20A, foram selecionados componentes de nível industrial:

* **Filtragem EMI de 3 Estágios:** Utilização de um módulo com indutores de modo comum e diferencial, capaz de eliminar ruídos de alta frequência.
* **Monitoramento Atorch (100A):** Implementação de um medidor inteligente para acompanhamento de voltagem, corrente e consumo (kWh).
* **Condutores de 2,5mm²:** Dimensionamento de fiação tripolar conforme normas técnicas para suportar a corrente nominal sem aquecimento.

<div class='img-container'>
    <h4 style='text-align:center; margin-bottom:10px;'>Componentes Internos</h4>
    <img src='src/frontend/imagens/protetor_de_surto/construção2.jpeg' class='img-artigo' alt='Componentes internos'>
    <div class='img-legenda'>Filtro EMI, Disjuntor e Medidor Atorch</div>
</div>

### 3. Melhorias e Evolução do Projeto
Durante o desenvolvimento, identificou-se que o filtro original era focado apenas em ruído e não em surtos de alta tensão. As seguintes melhorias foram aplicadas:

#### Proteção Ativa contra Surtos (DPS)
Integração de **Varistores de Óxido Metálico (MOV)** de 14mm (471K) na entrada do circuito. Eles atuam como válvulas de escape, ceifando picos de tensão.

<div class='img-container'>
    <h4 style='text-align:center; margin-bottom:10px;'>Melhoria com Varistores</h4>
    <img src='src/frontend/imagens/protetor_de_surto/melhoria_no_filtro_de_ruido.jpeg' class='img-artigo' alt='Melhoria com Varistores'>
    <div class='img-legenda'>Adição de varistores para proteção contra surtos</div>
</div>

#### O Protetor Ideal
Abaixo, o modelo de protetor de surto comercial que serviu de inspiração e que possui as características ideais de proteção.

<div class='img-container'>
    <h4 style='text-align:center; margin-bottom:10px;'>Referência Técnica</h4>
    <img src='src/frontend/imagens/protetor_de_surto/protetor_de_surto_correto.jpeg' class='img-artigo' alt='Protetor de Surto Ideal'>
    <div class='img-legenda'>Modelo de referência para o projeto</div>
</div>

### 4. Passo a Passo da Montagem
Abaixo, o processo de construção da case em PETG e a montagem dos componentes eletrônicos.

<div class='galeria-grid'>
<img src='src/frontend/imagens/protetor_de_surto/contrução.jpeg'>
<img src='src/frontend/imagens/protetor_de_surto/construção3.jpeg'>
<img src='src/frontend/imagens/protetor_de_surto/funcinamento.jpeg'>
<img src='src/frontend/imagens/protetor_de_surto/funcionamento2.jpeg'>
</div>

#### Download do Projeto 3D
Se você tem uma impressora 3D, pode baixar o arquivo STL da case gratuitamente.

<a href='src/frontend/imagens/protetor_de_surto/case3D/case.stl' class='btn btn-download' download><i class='fas fa-download'></i> Baixar Case 3D (.STL)</a>
