const TAMANHO_MATRIZ = 7;

const TOTAL_ENTRADAS = TAMANHO_MATRIZ * TAMANHO_MATRIZ;

const ITENS_POR_LINHA_CALCULO = 7;



let matrizA = criarMatriz(-1);

let matrizB = criarMatriz(-1);

let matrizTeste = criarMatriz(-1);



let pesosLetras = [];

let biasLetras = new Decimal(0);

let redeLetrasTreinada = false;



const D = (v) => new Decimal(v);

const F6 = (v) => D(v).toDecimalPlaces(6).toFixed(6);



function definirTextoCalculos(html) {

    const el = document.getElementById("calculosDetalhadosLetras");

    if (el) {

        el.innerHTML = html;

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



function formatarEntradaResumo(entrada) {

    const linhas = [];

    for (let i = 0; i < TOTAL_ENTRADAS; i += TAMANHO_MATRIZ) {

        linhas.push(entrada.slice(i, i + TAMANHO_MATRIZ).join(", "));

    }

    return linhas.join("\n");

}



function montarTermosCalculoLetras(entrada, pesosAtuais, biasAtual) {

    const termosMultiplicacao = entrada.map((x, i) => `(${x} × ${F6(pesosAtuais[i])})`);

    const termosProdutos = entrada.map((x, i) => F6(D(x).times(pesosAtuais[i])));

    return { termosMultiplicacao, termosProdutos, biasAtual: F6(biasAtual) };

}



function formatarTermosPorLinhas(termos, rotulo) {

    let html = `<strong>${rotulo}</strong><br>`;

    for (let i = 0; i < termos.length; i += ITENS_POR_LINHA_CALCULO) {

        const linhaMatriz = Math.floor(i / ITENS_POR_LINHA_CALCULO) + 1;

        html += `linha ${linhaMatriz}: ${termos.slice(i, i + ITENS_POR_LINHA_CALCULO).join(" + ")}<br>`;

    }

    return html;

}



function gerarBlocoCalculoPadrao(ciclo, nomePadrao, entrada, pesosAntes, biasAntes, target, alfaDec) {

    const yLiq = somatorio(entrada, pesosAntes, biasAntes);

    const y = yLiq.greaterThanOrEqualTo(0) ? 1 : -1;

    const errou = y !== target;

    const diferenca = D(target - y);

    const { termosMultiplicacao, termosProdutos, biasAtual } = montarTermosCalculoLetras(entrada, pesosAntes, biasAntes);



    let html = `<div class="secao-calculo">`;

    html += `<strong>Ciclo ${ciclo} — Padrão ${nomePadrao}</strong><br><br>`;



    html += `<strong>1) Entradas (vetor 7×7 = 49 posições)</strong><br>`;

    html += `<pre>${formatarEntradaResumo(entrada)}</pre>`;

    html += `target = ${target}<br><br>`;



    html += `<strong>2) Combinação linear</strong><br>`;

    html += `yLiq = Σ(xi × wi) + b<br><br>`;

    html += formatarTermosPorLinhas(termosMultiplicacao, "Produtos (xi × wi):");

    html += `<br>+ bias = ${biasAtual}<br><br>`;

    html += formatarTermosPorLinhas(termosProdutos, "Resultado parcial (xi × wi):");

    html += `<br>yLiq = ${F6(yLiq)}<br><br>`;



    html += `<strong>3) Função de ativação</strong><br>`;

    html += `limiar = 0 (degrau bipolar)<br>`;

    html += `se yLiq ≥ 0 → y = 1<br>`;

    html += `se yLiq &lt; 0 → y = -1<br><br>`;

    html += `Como yLiq = ${F6(yLiq)}, a saída calculada foi y = ${y}<br>`;

    html += `target = ${target} → erro = ${errou ? "sim" : "não"}<br><br>`;



    if (errou) {

        html += `<strong>4) Correção do Perceptron</strong><br>`;

        html += `Δ = α × (target - y) = ${F6(alfaDec)} × (${target} - ${y}) = ${F6(alfaDec.times(diferenca))}<br><br>`;



        html += `<strong>Atualização do bias:</strong><br>`;

        html += `b = b + α × (target - y)<br>`;

        html += `b = ${F6(biasAntes)} + ${F6(alfaDec.times(diferenca))} = ${F6(D(biasAntes).plus(alfaDec.times(diferenca)))}<br><br>`;



        html += `<strong>Atualização de cada peso:</strong><br>`;

        html += `w = w + α × (target - y) × x<br><br>`;

        for (let i = 0; i < TOTAL_ENTRADAS; i++) {

            const incremento = alfaDec.times(diferenca).times(D(entrada[i]));

            const pesoNovo = D(pesosAntes[i]).plus(incremento);

            html += `w${i + 1} = ${F6(pesosAntes[i])} + ${F6(alfaDec)} × (${target} - ${y}) × ${entrada[i]} = ${F6(pesoNovo)}<br>`;

        }

    } else {

        html += `<strong>4) Correção do Perceptron</strong><br>`;

        html += `Não houve correção de pesos (classificação correta).<br>`;

    }



    html += `</div>`;

    return { html, y, errou, yLiq };

}



function montarEstadoTreinamentoCompleto(convergiu, cicloFinal, alfaDec, pesosIniciais, biasInicial) {

    let html = `<strong>${convergiu ? "Rede treinada com sucesso." : "Treino interrompido no limite de ciclos."}</strong><br><br>`;

    html += `ciclos executados: ${cicloFinal}<br>`;

    html += `α: ${F6(alfaDec)}<br>`;

    html += `limiar: 0<br>`;

    html += `target(A) = -1, target(B) = 1<br><br>`;



    html += `<strong>Pesos iniciais (sorteados em [-0.5, +0.5])</strong><br>`;

    for (let i = 0; i < TOTAL_ENTRADAS; i++) {

        html += `w${i + 1} = ${F6(pesosIniciais[i])}<br>`;

    }

    html += `bias inicial = ${F6(biasInicial)}<br><br>`;



    html += `<strong>Pesos finais</strong><br>`;

    for (let i = 0; i < TOTAL_ENTRADAS; i++) {

        html += `w${i + 1} = ${F6(pesosLetras[i])}<br>`;

    }

    html += `bias final = ${F6(biasLetras)}`;



    return html;

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

    biasLetras = new Decimal(0);

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

    let s = D(bias);

    for (let i = 0; i < entrada.length; i++) {

        s = s.plus(D(entrada[i]).times(D(pesos[i])));

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

    const nomes = ["A", "B"];

    const targets = [-1, 1];



    const alfaDec = D(alfa);

    pesosLetras = Array.from({ length: TOTAL_ENTRADAS }, () => D(Math.random() - 0.5));

    biasLetras = D(Math.random() - 0.5);

    const pesosIniciais = pesosLetras.map(p => D(p));

    const biasInicial = D(biasLetras);

    redeLetrasTreinada = false;



    let historico = [];

    let calculosHtml = [];

    let convergiu = false;

    let cicloFinal = 0;



    for (let ciclo = 1; ciclo <= maxCiclos; ciclo++) {

        let erroNoCiclo = false;

        let erros = 0;



        calculosHtml.push(`<div class="secao-calculo"><strong>===== CICLO ${ciclo} =====</strong></div>`);



        for (let p = 0; p < entradas.length; p++) {

            const pesosAntes = pesosLetras.map(w => D(w));

            const biasAntes = D(biasLetras);

            const bloco = gerarBlocoCalculoPadrao(

                ciclo,

                nomes[p],

                entradas[p],

                pesosAntes,

                biasAntes,

                targets[p],

                alfaDec

            );

            calculosHtml.push(bloco.html);



            if (bloco.errou) {

                erroNoCiclo = true;

                erros++;

                const diferenca = D(targets[p] - bloco.y);

                for (let i = 0; i < pesosLetras.length; i++) {

                    pesosLetras[i] = D(pesosLetras[i]).plus(alfaDec.times(diferenca).times(D(entradas[p][i])));

                }

                biasLetras = D(biasLetras).plus(alfaDec.times(diferenca));

            }

        }



        historico.push(`Ciclo ${ciclo}: erros = ${erros}`);

        cicloFinal = ciclo;



        if (!erroNoCiclo) {

            convergiu = true;

            break;

        }

    }



    redeLetrasTreinada = convergiu;



    document.getElementById("estadoTreinoLetras").innerHTML = montarEstadoTreinamentoCompleto(

        convergiu,

        cicloFinal,

        alfaDec,

        pesosIniciais,

        biasInicial

    );



    document.getElementById("historicoLetras").innerHTML = historico.join("<br>");

    definirTextoCalculos(calculosHtml.join(""));

}



function classificarMatrizTesteLetras() {

    if (!redeLetrasTreinada || pesosLetras.length === 0) {

        document.getElementById("resultadoTesteLetras").innerHTML =

            "<strong>A rede ainda não foi treinada.</strong> Clique em Treinar Perceptron.";

        return;

    }



    const entradaTeste = vetorizarMatriz(matrizTeste);

    const pesosAtuais = pesosLetras.map(w => D(w));

    const biasAtual = D(biasLetras);

    const { termosMultiplicacao, termosProdutos, biasAtual: biasFmt } = montarTermosCalculoLetras(

        entradaTeste,

        pesosAtuais,

        biasAtual

    );

    const yLiq = somatorio(entradaTeste, pesosAtuais, biasAtual);

    const y = yLiq.greaterThanOrEqualTo(0) ? 1 : -1;

    const classe = y === -1 ? "A" : "B";



    document.getElementById("resultadoTesteLetras").innerHTML =

        `<strong>Resultado da classificação</strong><br><br>

        <strong>Combinação linear</strong><br>

        yLiq = Σ(xi × wi) + b<br><br>

        ${formatarTermosPorLinhas(termosMultiplicacao, "Produtos (xi × wi):")}

        <br>+ bias = ${biasFmt}<br><br>

        ${formatarTermosPorLinhas(termosProdutos, "Resultado parcial:")}

        <br>yLiq = ${F6(yLiq)}<br><br>

        <strong>Função de ativação:</strong> y = ${y}<br>

        classe reconhecida: <strong>${classe}</strong>`;

}



renderizarTodasMatrizes();


