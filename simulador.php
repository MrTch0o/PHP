<?php
include "includes/conexao.php";
include "includes/topo.php";
include "includes/menu.php";

$algoritmo = $_GET["algoritmo"] ?? "hebb";
?>

<?php if ($algoritmo === "perceptron_letras"): ?>
<h2>Trocando Hebb por Perceptron (Trabalho 02 - Parte 1)</h2>

<section class="card">
    <h3>Navegação</h3>
    <div class="grafico-modos">
        <a class="botao secundario" href="simulador.php?algoritmo=perceptron">Perceptron Simples</a>
        <a class="botao secundario" href="simulador.php?algoritmo=perceptron_portas">Trabalho 02 - Parte 2 (Portas lógicas)</a>
    </div>
</section>

<section class="card">
    <h3>Perceptron com letras A e B em matriz 7x7</h3>
    <p>Preencha as matrizes com valores <strong>-1</strong> e <strong>1</strong> para montar as letras A e B.</p>
    <p>Cada letra vira um vetor de 49 entradas para o Perceptron. Targets usados: A = -1 e B = 1.</p>

    <form class="form-lab">
        <label for="alfaLetrasInput">Taxa de aprendizagem (α):</label>
        <input type="number" id="alfaLetrasInput" min="0.000001" max="1" step="0.000001" value="0.01">

        <label for="maxCiclosLetrasInput">Limite de ciclos:</label>
        <input type="number" id="maxCiclosLetrasInput" min="1" step="1" value="1000">

        <button type="button" onclick="carregarPadroesExemploLetras()">
            Carregar exemplo A/B
        </button>
        <button type="button" class="secundario" onclick="limparTodasMatrizesLetras()">
            Limpar matrizes
        </button>
        <button type="button" onclick="treinarPerceptronLetras()">
            Treinar Perceptron
        </button>
        <button type="button" class="secundario" onclick="classificarMatrizTesteLetras()">
            Classificar matriz de teste
        </button>
    </form>
</section>

<div class="grid-lab">
    <section class="card">
        <h3>Matriz da letra A (target -1)</h3>
        <div class="matrix-editor-grid" id="matrizAEditor"></div>
    </section>

    <section class="card">
        <h3>Matriz da letra B (target 1)</h3>
        <div class="matrix-editor-grid" id="matrizBEditor"></div>
    </section>
</div>

<section class="card">
    <h3>Matriz de teste (7x7)</h3>
    <div class="matrix-editor-grid" id="matrizTesteEditor"></div>
    <div class="resultado" id="resultadoTesteLetras">
        Treine o Perceptron e classifique a matriz de teste.
    </div>
</section>

<div class="grid-baixo">
    <section class="card">
        <h3>Estado do treinamento</h3>
        <div class="resultado bloco-calculos bloco-calculos-grande" id="estadoTreinoLetras">
            Ainda não treinado.
        </div>
    </section>

    <section class="card">
        <h3>Histórico por ciclo</h3>
        <div class="explicacao-passos bloco-calculos bloco-calculos-grande" id="historicoLetras">
            O histórico aparecerá após o treinamento.
        </div>
    </section>
</div>

<section class="card">
    <h3>Cálculos detalhados do treinamento</h3>
    <div class="resultado bloco-calculos bloco-calculos-grande" id="calculosDetalhadosLetras">
        Os cálculos detalhados serão exibidos após o treinamento.
    </div>
</section>

<script src="js/perceptron_letras.js"></script>

<?php elseif ($algoritmo === "perceptron_portas"): ?>
<h2>Trabalho 02 — Parte 2: Portas lógicas com Perceptron</h2>

<div class="grid-lab">
    <section class="card">
        <h3>O que você vai observar?</h3>
        <p>
            Selecione uma porta lógica e treine um Perceptron simples (2 entradas, 1 saída bipolar).
            Ao final, a rede exibe os <strong>pesos finais e o bias</strong>, conforme o trabalho.
        </p>
        <br>
        <p><strong>Codificação usada no treino:</strong> 0 → -1 e 1 → +1 (padrão bipolar do curso).</p>
        <br>
        <p><strong>Fórmulas:</strong></p>
        <p>w = w + α × (target - y) × entrada</p>
        <p>b = b + α × (target - y)</p>

        <form class="form-lab">
            <label for="portaLogicaSelect">Porta lógica:</label>
            <select id="portaLogicaSelect" onchange="trocarPortaLogica()">
                <option value="AND">AND (E)</option>
                <option value="OR">OR (OU)</option>
                <option value="NOT">NOT (NÃO)</option>
                <option value="NAND">NAND (NE)</option>
                <option value="NOR">NOR (NOU)</option>
                <option value="XOR">XOR (OU Exclusivo)</option>
                <option value="XNOR">XNOR (Coincidência)</option>
            </select>

            <label for="alfaPortasInput">Taxa de aprendizagem (α):</label>
            <input type="number" id="alfaPortasInput" min="0.000001" max="1" step="0.000001" value="0.01">

            <label for="limiteCiclosPortasInput">Limite de ciclos:</label>
            <input type="number" id="limiteCiclosPortasInput" min="1" step="1" value="1000">

            <button type="button" onclick="iniciarTreinamentoPortas()">Iniciar treinamento</button>
            <button type="button" class="secundario" onclick="proximaEtapaPortas()">Próxima etapa</button>
            <button type="button" class="secundario" onclick="treinarAteConvergirPortas()">Treinar até convergir</button>
        </form>
    </section>

    <section class="card">
        <h3>Rede neural visual</h3>
        <div class="rede-area">
            <div class="ligacao l1" id="linhaW1Portas"></div>
            <div class="ligacao l2" id="linhaW2Portas"></div>
            <div class="ligacao l3" id="linhaSaidaPortas"></div>
            <div class="no x1" id="noX1Portas">x1</div>
            <div class="no x2" id="noX2Portas">x2</div>
            <div class="no neuronio" id="noNeuronioPortas">Σ</div>
            <div class="no saida" id="noSaidaPortas">y</div>
            <div class="peso-label peso-w1" id="labelW1Portas">w1 = 0</div>
            <div class="peso-label peso-w2" id="labelW2Portas">w2 = 0</div>
            <div class="peso-label peso-b" id="labelBiasPortas">bias = 0</div>
        </div>
    </section>
</div>

<section class="card">
    <h3>Navegação</h3>
    <div class="grafico-modos">
        <a class="botao secundario" href="simulador.php?algoritmo=perceptron">Perceptron Simples</a>
        <a class="botao secundario" href="simulador.php?algoritmo=perceptron_letras">Trabalho 02 - Parte 1 (Letras 7x7)</a>
    </div>
    <div class="resultado" id="descricaoPortaLogica">
        Escolha a porta, clique em <strong>Iniciar treinamento</strong> e avance passo a passo.
    </div>
</section>

<div class="grid-baixo">
    <section class="card">
        <h3>Estado atual da rede</h3>
        <div class="resultado bloco-calculos bloco-calculos-grande" id="estadoPortas">
            Selecione uma porta lógica e clique em <strong>Iniciar treinamento</strong>.
        </div>
        <div class="card" style="margin-top: 14px;">
            <h4>Tabela verdade (porta selecionada)</h4>
            <div id="tabelaVerdadePortas"></div>
        </div>
    </section>

    <section class="card">
        <h3>Aprendizado passo a passo</h3>
        <div class="explicacao-passos bloco-calculos bloco-calculos-grande" id="painelPassoPortas">
            Selecione a porta lógica e inicie o treinamento.
        </div>
    </section>
</div>

<div class="grid-baixo">
    <section class="card">
        <h3>Evolução dos pesos e bias</h3>
        <canvas id="graficoPortas" width="520" height="260"></canvas>
    </section>

    <section class="card">
        <h3>Pesos finais (entrega do trabalho)</h3>
        <div class="resultado" id="pesosFinaisPortas">
            Treine a rede para ver w1, w2 e bias finais.
        </div>
    </section>
</div>

<section class="card">
    <h3>Tabela do treinamento</h3>
    <p class="texto-auxiliar">20 linhas por página. A <strong>página 1</strong> mostra os passos mais recentes. Use <strong>Início »</strong> para ver os primeiros registros.</p>
    <div class="paginacao-tabela">
        <button type="button" class="secundario" onclick="irParaPrimeiraPaginaTabelaPortas()">« Recentes</button>
        <button type="button" class="secundario" onclick="paginaAnteriorTabelaPortas()">‹ Mais novos</button>
        <span class="info-pagina" id="infoPaginaTabelaPortas">Nenhuma linha registrada ainda</span>
        <button type="button" class="secundario" onclick="proximaPaginaTabelaPortas()">Mais antigos ›</button>
        <button type="button" class="secundario" onclick="irParaUltimaPaginaTabelaPortas()">Início »</button>
    </div>
    <table class="tabela">
        <thead id="cabecalhoTabelaPortas"></thead>
        <tbody id="corpoTabelaPortas"></tbody>
    </table>
</section>

<section class="card">
    <h3>Testar rede treinada</h3>
    <form class="form-lab" id="camposTestePortas"></form>
    <button type="button" onclick="testarPortas()">Testar</button>
    <div class="resultado" id="resultadoTestePortas">Treine a rede antes de testar.</div>
</section>

<script src="js/perceptron_portas.js"></script>

<?php elseif ($algoritmo === "perceptron"): ?>
<h2>Perceptron Simples — Laboratório Visual</h2>

<div class="grid-lab">

    <section class="card">
        <h3>O que você vai observar?</h3>

        <p>
            Este simulador reproduz o programa em C do professor (Prof. Dr. Jefferson Beethoven Martins):
            duas amostras A e B, quatro entradas, pesos e bias iniciais fixos,
            função de ativação bipolar e correção de pesos quando há erro.
        </p>

        <br>

        <p><strong>Ideia central:</strong></p>
        <p>Se a saída da rede estiver errada, os pesos e o bias são corrigidos.</p>

        <br>

        <p><strong>Fórmula usada:</strong></p>
        <p>w = w + α × (target - y) × entrada</p>
        <p>b = b + α × (target - y)</p>

        <br>

        <form class="form-lab">
            <label>Parâmetros do programa C:</label>
            <p>limiar = 0, target(A) = -1, target(B) = 1</p>
            <p>w = [0.5, -0.1, 0.4, -0.27], bias = 0.3256</p>
            <label for="alfaPerceptronInput">Taxa de aprendizagem (α):</label>
            <input
                type="number"
                id="alfaPerceptronInput"
                min="0.000001"
                max="1"
                step="0.000001"
                value="0.01"
            >
            <label for="limiteCiclosPerceptronInput">Limite de ciclos:</label>
            <input
                type="number"
                id="limiteCiclosPerceptronInput"
                min="1"
                step="1"
                value="1000"
            >

            <button type="button" onclick="iniciarTreinamentoPerceptron()">
                Iniciar treinamento
            </button>

            <button type="button" class="secundario" onclick="proximaEtapaPerceptron()">
                Próxima etapa
            </button>

            <button type="button" class="secundario" onclick="treinarAteConvergirPerceptron()">
                Treinar até convergir
            </button>
        </form>
    </section>

    <section class="card">
        <h3>Estado atual da rede</h3>
        <div class="resultado" id="estadoPerceptron">
            Clique em <strong>Iniciar treinamento</strong> para carregar os pesos iniciais.
        </div>

        <div class="card" style="margin-top: 14px;">
            <h4>Amostras usadas no treinamento</h4>
            <div id="amostrasPerceptronTexto"></div>
        </div>
    </section>

</div>

<section class="card">
    <h3>Modos de prática</h3>
    <div class="grafico-modos">
        <button type="button" id="btnExercicioPerceptronBase" onclick="selecionarExercicioPerceptron('base')">
            Algoritmo do professor (C)
        </button>
        <button type="button" class="secundario" id="btnExercicioPerceptronProximo" onclick="selecionarExercicioPerceptron('proximo')">
            Exercício padrões próximos (2 entradas)
        </button>
        <a class="botao secundario" href="simulador.php?algoritmo=perceptron_letras">
            Trabalho 02 - Parte 1 (Letras 7x7)
        </a>
        <a class="botao secundario" href="simulador.php?algoritmo=perceptron_portas">
            Trabalho 02 - Parte 2 (Portas lógicas)
        </a>
    </div>
    <div class="resultado" id="descricaoExercicioPerceptron">
        O modo padrão carrega o algoritmo do professor com os mesmos valores do programa em C.
        Clique em <strong>Iniciar treinamento</strong> e avance etapa a etapa.
    </div>
</section>

<div class="grid-baixo">
    <section class="card">
        <h3>Aprendizado passo a passo</h3>

        <div class="explicacao-passos" id="painelPassoPerceptron">
            Clique em <strong>Iniciar treinamento</strong> para começar o ciclo 1.
        </div>
    </section>

    <section class="card">
        <h3>Evolução dos pesos e bias</h3>
        <canvas id="graficoPerceptron" width="520" height="260"></canvas>
    </section>

</div>

<section class="card">
    <h3>Tabela do treinamento</h3>
    <p class="texto-auxiliar">20 linhas por página. A <strong>página 1</strong> mostra os passos mais recentes e atualiza durante o treino. Use <strong>Início »</strong> para ver os primeiros registros (pesos iniciais).</p>

    <div class="paginacao-tabela" id="paginacaoTabelaPerceptron">
        <button type="button" class="secundario" onclick="irParaPrimeiraPaginaTabelaPerceptron()">« Recentes</button>
        <button type="button" class="secundario" onclick="paginaAnteriorTabelaPerceptron()">‹ Mais novos</button>
        <span class="info-pagina" id="infoPaginaTabelaPerceptron">Nenhuma linha registrada ainda</span>
        <button type="button" class="secundario" onclick="proximaPaginaTabelaPerceptron()">Mais antigos ›</button>
        <button type="button" class="secundario" onclick="irParaUltimaPaginaTabelaPerceptron()">Início »</button>
    </div>

    <table class="tabela">
        <thead id="cabecalhoTabelaPerceptron"></thead>
        <tbody id="corpoTabelaPerceptron">
        </tbody>
    </table>
</section>

<section class="card">
    <h3>Testar rede treinada</h3>

    <form class="form-lab">
        <div id="camposTestePerceptron"></div>

        <button type="button" onclick="testarPerceptron()">
            Testar
        </button>
    </form>

    <div class="resultado" id="resultadoTestePerceptron">
        Treine a rede antes de testar.
    </div>
</section>

<script src="js/perceptron.js"></script>

<?php else: ?>
<h2>Regra de Hebb — Laboratório Visual</h2>

<div class="grid-lab">

    <section class="card">
        <h3>O que você vai observar?</h3>

        <p>
            A Regra de Hebb trabalha com a ideia de associação:
            quando entradas e saída aparecem juntas, os pesos são reforçados.
        </p>

        <br>

        <p><strong>Ideia central:</strong></p>
        <p>“neurônios que disparam juntos permanecem juntos”.</p>

        <br>

        <p><strong>Fórmula usada:</strong></p>
        <p>w = w + x × y</p>

        <br>

        <form class="form-lab">
            <label>Escolha a porta lógica:</label>
            <select id="porta">
                <option value="AND">AND</option>
                <option value="OR">OR</option>
                <option value="NAND">NAND</option>
                <option value="NOR">NOR</option>
                <option value="XOR">XOR</option>
                <option value="XNOR">XNOR</option>
                <option value="NOT">NOT</option>
            </select>

            <button type="button" onclick="iniciarTreinamento()">
                Iniciar treinamento
            </button>

            <button type="button" class="secundario" onclick="proximaEtapa()">
                Próxima etapa
            </button>
        </form>
    </section>

    <section class="card">
        <h3>Rede neural visual</h3>

        <div class="rede-area">
            <div class="ligacao l1" id="linhaW1"></div>
            <div class="ligacao l2" id="linhaW2"></div>
            <div class="ligacao l3" id="linhaSaida"></div>

            <div class="no x1" id="noX1">x1</div>
            <div class="no x2" id="noX2">x2</div>
            <div class="no neuronio" id="noNeuronio">Σ</div>
            <div class="no saida" id="noSaida">y</div>

            <div class="peso-label peso-w1" id="labelW1">w1 = 0</div>
            <div class="peso-label peso-w2" id="labelW2">w2 = 0</div>
            <div class="peso-label peso-b" id="labelBias">bias = 0</div>
        </div>
    </section>

</div>

<div class="grid-baixo">

    <section class="card">
        <h3>Aprendizado passo a passo</h3>

        <div class="explicacao-passos" id="painelPasso">
            Escolha uma porta lógica e clique em <strong>Iniciar treinamento</strong>.
        </div>
    </section>

    <section class="card">
        <h3>Evolução dos pesos</h3>
        <div class="grafico-modos">
            <button type="button" id="btnModoPesos" onclick="definirModoGrafico('pesos')">
                Ver plano de pesos
            </button>
            <button type="button" class="secundario" id="btnModoFronteira" onclick="definirModoGrafico('fronteira')">
                Ver fronteira de decisão
            </button>
        </div>
        <canvas id="graficoPesos" width="520" height="260"></canvas>
    </section>

</div>

<section class="card">
    <h3>Tabela do treinamento</h3>

    <table class="tabela">
        <thead>
            <tr>
                <th>Amostra</th>
                <th>x1</th>
                <th>x2</th>
                <th>y</th>
                <th>w1</th>
                <th>w2</th>
                <th>bias</th>
            </tr>
        </thead>
        <tbody id="corpoTabela">
        </tbody>
    </table>
</section>

<section class="card">
    <h3>Testar rede treinada</h3>

    <form class="form-lab">
        <label>x1:</label>
        <select id="testeX1">
            <option value="-1">-1</option>
            <option value="1">1</option>
        </select>

        <label>x2:</label>
        <select id="testeX2">
            <option value="-1">-1</option>
            <option value="1">1</option>
        </select>

        <button type="button" onclick="testarRede()">
            Testar
        </button>
    </form>

    <div class="resultado" id="resultadoTeste">
        Treine a rede antes de testar.
    </div>
</section>

<script src="js/hebb.js"></script>
<?php endif; ?>

<?php include "includes/rodape.php"; ?>