<?php
include "includes/conexao.php";
include "includes/topo.php";
include "includes/menu.php";

$algoritmo = $_GET["algoritmo"] ?? "hebb";
?>

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

<?php include "includes/rodape.php"; ?>