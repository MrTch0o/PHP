const TAMANHO_MATRIZ = 7;

let matrizA = criarMatriz(-1);
let matrizB = criarMatriz(-1);
let matrizTeste = criarMatriz(-1);

let pesosLetras = [];
let biasLetras = 0;
let redeLetrasTreinada = false;

function definirTextoCalculos(valor) {
    const el = document.getElementById("calculosDetalhadosLetras");
    if (el) {
        el.textContent = valor;
    }
}

function criarMatriz(valorInicial) {
    return Array.from({ length: TAMANHO_MATRIZ }, () =>
        Array.from({ length: TAMANHO_MATRIZ }, () => valorInicial)
    );
}

function renderizarMatriz(containerId, matriz, bloqueada = false) {
    const container = document.getElementById(containerId);
    if (!container) {
        return;
    }

    container.innerHTML = "";
    for (let i = 0; i < TAMANHO_MATRIZ; i++) {
        for (let j = 0; j < TAMANHO_MATRIZ; j++) {
            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = "matrix-cell";
            if (matriz[i][j] === 1) {
                botao.classList.add("ativo");
            }
            botao.textContent = String(matriz[i][j]);
            if (bloqueada) {
                botao.disabled = true;
            } else {
                botao.addEventListener("click", () => {
                    matriz[i][j] = matriz[i][j] === 1 ? -1 : 1;
                    renderizarTodasMatrizes();
                });
            }
            container.appendChild(botao);
        }
    }
}

function renderizarTodasMatrizes() {
    renderizarMatriz("matrizAEditor", matrizA);
    renderizarMatriz("matrizBEditor", matrizB);
    renderizarMatriz("matrizTesteEditor", matrizTeste);
}

function carregarPadroesExemploLetras() {
    matrizA = [
        [-1, -1, 1, 1, 1, -1, -1],
        [-1, 1, -1, -1, -1, 1, -1],
        [1, -1, -1, -1, -1, -1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, -1, -1, -1, -1, -1, 1],
        [1, -1, -1, -1, -1, -1, 1],
        [1, -1, -1, -1, -1, -1, 1]
    ];

    matrizB = [
        [1, 1, 1, 1, 1, -1, -1],
        [1, -1, -1, -1, -1, 1, -1],
        [1, -1, -1, -1, -1, 1, -1],
        [1, 1, 1, 1, 1, -1, -1],
        [1, -1, -1, -1, -1, 1, -1],
        [1, -1, -1, -1, -1, 1, -1],
        [1, 1, 1, 1, 1, -1, -1]
    ];

    matrizTeste = criarMatriz(-1);
    redeLetrasTreinada = false;
    renderizarTodasMatrizes();
    document.getElementById("estadoTreinoLetras").innerHTML =
        "Padrões de exemplo carregados. Clique em <strong>Treinar Perceptron</strong>.";
    definirTextoCalculos("Os cálculos detalhados serão exibidos após o treinamento.");
}

function limparTodasMatrizesLetras() {
    matrizA = criarMatriz(-1);
    matrizB = criarMatriz(-1);
    matrizTeste = criarMatriz(-1);
    redeLetrasTreinada = false;
    pesosLetras = [];
    biasLetras = 0;
    renderizarTodasMatrizes();
    document.getElementById("estadoTreinoLetras").innerHTML = "Matrizes limpas.";
    document.getElementById("historicoLetras").innerHTML = "O histórico aparecerá após o treinamento.";
    document.getElementById("resultadoTesteLetras").innerHTML =
        "Treine o Perceptron e classifique a matriz de teste.";
    definirTextoCalculos("Os cálculos detalhados serão exibidos após o treinamento.");
}

function vetorizarMatriz(matriz) {
    return matriz.flat();
}

function somatorio(entrada, pesos, bias) {
    let s = bias;
    for (let i = 0; i < entrada.length; i++) {
        s += entrada[i] * pesos[i];
    }
    return s;
}

function treinarPerceptronLetras() {
    const alfa = parseFloat(document.getElementById("alfaLetrasInput").value);
    const maxCiclos = parseInt(document.getElementById("maxCiclosLetrasInput").value, 10);

    if (!Number.isFinite(alfa) || alfa <= 0 || alfa > 1) {
        document.getElementById("estadoTreinoLetras").innerHTML =
            "<strong>α inválido.</strong> Use um valor no intervalo (0, 1].";
        return;
    }

    if (!Number.isInteger(maxCiclos) || maxCiclos < 1) {
        document.getElementById("estadoTreinoLetras").innerHTML =
            "<strong>Limite de ciclos inválido.</strong> Use um inteiro maior ou igual a 1.";
        return;
    }

    const entradaA = vetorizarMatriz(matrizA);
    const entradaB = vetorizarMatriz(matrizB);
    const entradas = [entradaA, entradaB];
    const targets = [-1, 1];

    pesosLetras = Array.from({ length: TAMANHO_MATRIZ * TAMANHO_MATRIZ }, () => (Math.random() - 0.5));
    biasLetras = Math.random() - 0.5;
    redeLetrasTreinada = false;

    let historico = [];
    let calculos = [];
    let convergiu = false;
    let cicloFinal = 0;

    for (let ciclo = 1; ciclo <= maxCiclos; ciclo++) {
        let erroNoCiclo = false;
        let erros = 0;
        calculos.push(`===== CICLO ${ciclo} =====`);

        for (let p = 0; p < entradas.length; p++) {
            const nomePadrao = p === 0 ? "A" : "B";
            const pesosAntes = [...pesosLetras];
            const biasAntes = biasLetras;
            const yLiq = somatorio(entradas[p], pesosLetras, biasLetras);
            const y = yLiq >= 0 ? 1 : -1;
            const target = targets[p];
            calculos.push(
                `${nomePadrao}: yLiq = Σ(xi*wi) + b = ${yLiq.toFixed(6)} | y = ${y} | target = ${target}`
            );

            if (y !== target) {
                erroNoCiclo = true;
                erros++;
                const diferenca = target - y;
                const delta = alfa * diferenca;
                for (let i = 0; i < pesosLetras.length; i++) {
                    pesosLetras[i] += alfa * diferenca * entradas[p][i];
                }
                biasLetras += alfa * diferenca;
                calculos.push(
                    `${nomePadrao}: ERRO -> Δ = α*(target-y) = ${alfa}*(${target}-${y}) = ${delta.toFixed(6)}`
                );
                calculos.push(
                    `${nomePadrao}: bias ${biasAntes.toFixed(6)} -> ${biasLetras.toFixed(6)}`
                );
                calculos.push(
                    `${nomePadrao}: pesos antes = [${pesosAntes.map(v => v.toFixed(4)).join(", ")}]`
                );
                calculos.push(
                    `${nomePadrao}: pesos depois = [${pesosLetras.map(v => v.toFixed(4)).join(", ")}]`
                );
            } else {
                calculos.push(`${nomePadrao}: sem ajuste de pesos (classificação correta).`);
            }
        }

        historico.push(`Ciclo ${ciclo}: erros = ${erros}`);
        calculos.push(`Resumo ciclo ${ciclo}: erros = ${erros}`);
        cicloFinal = ciclo;

        if (!erroNoCiclo) {
            convergiu = true;
            break;
        }
    }

    redeLetrasTreinada = convergiu;

    const trechoPesos = pesosLetras.slice(0, 10).map(v => v.toFixed(4)).join(", ");
    document.getElementById("estadoTreinoLetras").innerHTML =
        `<strong>${convergiu ? "Rede treinada com sucesso." : "Treino interrompido no limite de ciclos."}</strong><br><br>
        ciclos executados: ${cicloFinal}<br>
        α: ${alfa}<br>
        bias: ${biasLetras.toFixed(4)}<br>
        primeiros 10 pesos: [${trechoPesos}]`;

    document.getElementById("historicoLetras").innerHTML = historico.join("<br>");
    definirTextoCalculos(calculos.join("\n"));
}

function classificarMatrizTesteLetras() {
    if (!redeLetrasTreinada || pesosLetras.length === 0) {
        document.getElementById("resultadoTesteLetras").innerHTML =
            "<strong>A rede ainda não foi treinada.</strong> Clique em Treinar Perceptron.";
        return;
    }

    const entradaTeste = vetorizarMatriz(matrizTeste);
    const yLiq = somatorio(entradaTeste, pesosLetras, biasLetras);
    const y = yLiq >= 0 ? 1 : -1;
    const classe = y === -1 ? "A" : "B";

    document.getElementById("resultadoTesteLetras").innerHTML =
        `<strong>Resultado da classificação</strong><br><br>
        yLiq = ${yLiq.toFixed(4)}<br>
        saída = ${y}<br>
        classe reconhecida: <strong>${classe}</strong>`;
}

renderizarTodasMatrizes();
