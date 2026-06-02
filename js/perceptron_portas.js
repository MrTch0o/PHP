let portaAtual = "AND";
let amostrasPortas = [];

let pesosPortas = [];
let biasPortas = new Decimal(0);
let alfaPortas = new Decimal(0.01);
let limiarPortas = new Decimal(0);
let limiteCiclosPortas = 1000;

let indiceAmostraPortas = 0;
let faseAtualPortas = 0;
let estadoPassoPortas = null;
let cicloAtualPortas = 1;
let houveErroNoCicloPortas = false;
let redePortasTreinada = false;
let treinoAutomaticoPortas = false;

let historicoPassosPortas = [];
let trajetoriaPesosPortas = [];
let paginaAtualTabelaPortas = 1;
let acompanharPaginaRecentePortas = true;

const LINHAS_POR_PAGINA_PORTAS = 20;
const LIMITE_PONTOS_GRAFICO_PORTAS = 300;

const D6 = (v) => new Decimal(v);
const F6 = (v) => D6(v).toDecimalPlaces(6).toFixed(6);
const N = (v) => D6(v).toNumber();

const NOMES_PORTAS = {
    AND: "AND (E)",
    OR: "OR (OU)",
    NOT: "NOT (NÃO)",
    NAND: "NAND (NE)",
    NOR: "NOR (NOU)",
    XOR: "XOR (OU Exclusivo)",
    XNOR: "XNOR (Coincidência)"
};

function bipolarParaBinario(v) {
    return v === 1 ? 1 : 0;
}

function formatarTextoCorrecaoPortas(errou, entrada, target, y, pesosAntes, biasAntes, diferenca) {
    if (!errou) {
        return "Não houve correção de pesos (saída correta).";
    }

    const delta = D6(alfaPortas).times(diferenca);
    const incW1 = delta.times(D6(entrada[0]));
    const incW2 = delta.times(D6(entrada[1]));

    return `Houve erro. Corrigindo pesos e bias:<br><br>
        Δ = α × (target - y)<br>
        Δ = ${F6(alfaPortas)} × (${target} - ${y}) = ${F6(delta)}<br><br>
        w1 = w1 + α × (target - y) × x1<br>
        w1 = ${F6(pesosAntes[0])} + ${F6(delta)} × (${entrada[0]})<br>
        w1 = ${F6(pesosAntes[0])} + ${F6(incW1)} = ${F6(pesosPortas[0])}<br><br>
        w2 = w2 + α × (target - y) × x2<br>
        w2 = ${F6(pesosAntes[1])} + ${F6(delta)} × (${entrada[1]})<br>
        w2 = ${F6(pesosAntes[1])} + ${F6(incW2)} = ${F6(pesosPortas[1])}<br><br>
        b = b + α × (target - y)<br>
        b = ${F6(biasAntes)} + ${F6(delta)} = ${F6(biasPortas)}`;
}

function obterDadosPorta(porta) {
    if (porta === "AND") {
        return [[-1, -1, -1], [-1, 1, -1], [1, -1, -1], [1, 1, 1]];
    }
    if (porta === "OR") {
        return [[-1, -1, -1], [-1, 1, 1], [1, -1, 1], [1, 1, 1]];
    }
    if (porta === "NAND") {
        return [[-1, -1, 1], [-1, 1, 1], [1, -1, 1], [1, 1, -1]];
    }
    if (porta === "NOR") {
        return [[-1, -1, 1], [-1, 1, -1], [1, -1, -1], [1, 1, -1]];
    }
    if (porta === "XNOR") {
        return [[-1, -1, 1], [-1, 1, -1], [1, -1, -1], [1, 1, 1]];
    }
    if (porta === "NOT") {
        return [[-1, 0, 1], [1, 0, -1]];
    }
    return [[-1, -1, -1], [-1, 1, 1], [1, -1, 1], [1, 1, -1]];
}

function obterAmostrasPorta(porta) {
    return obterDadosPorta(porta).map((linha, i) => {
        const x1 = linha[0];
        const x2 = linha[1];
        const target = linha[2];
        let nome;
        if (porta === "NOT") {
            nome = `A=${bipolarParaBinario(x1)}`;
        } else {
            nome = `(${bipolarParaBinario(x1)},${bipolarParaBinario(x2)})`;
        }
        return { nome, entrada: [x1, x2], target };
    });
}

function gerarPesoAleatorioPortas() {
    return new Decimal(Math.random() - 0.5);
}

function renderizarTabelaVerdadePortas() {
    const el = document.getElementById("tabelaVerdadePortas");
    if (!el) {
        return;
    }

    const dados = obterDadosPorta(portaAtual);
    let html = `<table class="tabela"><thead><tr>`;
    if (portaAtual === "NOT") {
        html += "<th>A (0/1)</th><th>S (0/1)</th><th>Treino bipolar</th></tr></thead><tbody>";
        for (const [x1, , y] of dados) {
            html += `<tr><td>${bipolarParaBinario(x1)}</td><td>${bipolarParaBinario(y)}</td><td>[${x1}] → ${y}</td></tr>`;
        }
    } else {
        html += "<th>A</th><th>B</th><th>S</th><th>Treino bipolar</th></tr></thead><tbody>";
        for (const [x1, x2, y] of dados) {
            html += `<tr><td>${bipolarParaBinario(x1)}</td><td>${bipolarParaBinario(x2)}</td><td>${bipolarParaBinario(y)}</td><td>[${x1}, ${x2}] → ${y}</td></tr>`;
        }
    }
    html += "</tbody></table>";
    el.innerHTML = html;
}

function renderizarDescricaoPorta() {
    const el = document.getElementById("descricaoPortaLogica");
    if (!el) {
        return;
    }

    let aviso = "";
    if (portaAtual === "XOR" || portaAtual === "XNOR") {
        aviso = `<br><br><strong>Observação:</strong> ${NOMES_PORTAS[portaAtual]} não é linearmente separável. Um Perceptron simples pode não convergir.`;
    }
    if (portaAtual === "NOT") {
        aviso += `<br><br><strong>NOT:</strong> usa x2 = 0 como entrada auxiliar para manter 2 entradas no Perceptron.`;
    }

    el.innerHTML = `<strong>Porta ativa: ${NOMES_PORTAS[portaAtual]}</strong><br>
        Treine a rede e obtenha os pesos finais e o bias.${aviso}`;
}

function renderizarCabecalhoTabelaPortas() {
    const thead = document.getElementById("cabecalhoTabelaPortas");
    if (!thead) {
        return;
    }
    thead.innerHTML = `<tr>
        <th>Ciclo</th><th>Amostra</th><th>yLiq</th><th>y</th><th>target</th><th>Erro?</th>
        <th>x1</th><th>x2</th><th>w1</th><th>w2</th><th>bias</th>
    </tr>`;
}

function renderizarCamposTestePortas() {
    const el = document.getElementById("camposTestePortas");
    if (!el) {
        return;
    }

    if (portaAtual === "NOT") {
        el.innerHTML = `<label>A (bipolar):</label>
            <select id="testePortaX1"><option value="-1">-1 (0)</option><option value="1">1 (1)</option></select>
            <input type="hidden" id="testePortaX2" value="0">`;
    } else {
        el.innerHTML = `<label>A (bipolar):</label>
            <select id="testePortaX1"><option value="-1">-1 (0)</option><option value="1">1 (1)</option></select>
            <label>B (bipolar):</label>
            <select id="testePortaX2"><option value="-1">-1 (0)</option><option value="1">1 (1)</option></select>`;
    }
}

function atualizarVisualPortas(x1, x2, saida) {
    const exibirX2 = portaAtual !== "NOT";
    document.getElementById("noX1Portas").innerHTML = "x1<br>" + x1;
    document.getElementById("noX2Portas").innerHTML = exibirX2 ? ("x2<br>" + x2) : "x2<br>0";
    document.getElementById("noSaidaPortas").innerHTML = "y<br>" + saida;
    document.getElementById("labelW1Portas").innerHTML = "w1 = " + F6(pesosPortas[0] ?? 0);
    document.getElementById("labelW2Portas").innerHTML = "w2 = " + F6(pesosPortas[1] ?? 0);
    document.getElementById("labelBiasPortas").innerHTML = "bias = " + F6(biasPortas);

    const linhaW1 = document.getElementById("linhaW1Portas");
    const linhaW2 = document.getElementById("linhaW2Portas");
    const linhaSaida = document.getElementById("linhaSaidaPortas");
    linhaW1.className = "ligacao l1";
    linhaW2.className = "ligacao l2";
    linhaSaida.className = "ligacao l3";

    const w1 = N(pesosPortas[0] ?? 0);
    const w2 = N(pesosPortas[1] ?? 0);
    if (w1 !== 0) linhaW1.classList.add("forte");
    if (w2 !== 0) linhaW2.classList.add("forte");
    if (w1 < 0) linhaW1.classList.add("negativa");
    if (w2 < 0) linhaW2.classList.add("negativa");
    if (saida === 1) linhaSaida.classList.add("forte");
}

function atualizarPesosFinaisPortas() {
    const el = document.getElementById("pesosFinaisPortas");
    if (!el || pesosPortas.length === 0) {
        return;
    }
    el.innerHTML = redePortasTreinada
        ? `<strong>Rede treinada — valores finais</strong><br><br>w1 = ${F6(pesosPortas[0])}<br>w2 = ${F6(pesosPortas[1])}<br>bias = ${F6(biasPortas)}`
        : `<strong>Pesos atuais</strong><br><br>w1 = ${F6(pesosPortas[0])}<br>w2 = ${F6(pesosPortas[1])}<br>bias = ${F6(biasPortas)}<br><br><em>Treinamento ainda não convergiu.</em>`;
}

function resetarEstadoPortas() {
    pesosPortas = [new Decimal(0), new Decimal(0)];
    biasPortas = new Decimal(0);
    indiceAmostraPortas = 0;
    faseAtualPortas = 0;
    estadoPassoPortas = null;
    cicloAtualPortas = 1;
    houveErroNoCicloPortas = false;
    redePortasTreinada = false;
    treinoAutomaticoPortas = false;
    historicoPassosPortas = [];
    trajetoriaPesosPortas = [];
    paginaAtualTabelaPortas = 1;
    acompanharPaginaRecentePortas = true;

    const corpo = document.getElementById("corpoTabelaPortas");
    if (corpo) corpo.innerHTML = "";
    atualizarInfoPaginacaoTabelaPortas();

    document.getElementById("resultadoTestePortas").innerHTML = "Treine a rede antes de testar.";
    document.getElementById("painelPassoPortas").innerHTML = "Selecione a porta e clique em <strong>Iniciar treinamento</strong>.";
    document.getElementById("pesosFinaisPortas").innerHTML = "Treine a rede para ver w1, w2 e bias finais.";

    atualizarEstadoPortas();
    desenharGraficoPortas();
    atualizarVisualPortas("?", "?", "?");
}

function trocarPortaLogica() {
    portaAtual = document.getElementById("portaLogicaSelect").value;
    amostrasPortas = obterAmostrasPorta(portaAtual);
    renderizarTabelaVerdadePortas();
    renderizarDescricaoPorta();
    renderizarCamposTestePortas();
    resetarEstadoPortas();
}

function iniciarTreinamentoPortas() {
    amostrasPortas = obterAmostrasPorta(portaAtual);
    pesosPortas = [gerarPesoAleatorioPortas(), gerarPesoAleatorioPortas()];
    biasPortas = gerarPesoAleatorioPortas();

    const alfa = parseFloat(document.getElementById("alfaPortasInput").value);
    const limite = parseInt(document.getElementById("limiteCiclosPortasInput").value, 10);

    if (!Number.isFinite(alfa) || alfa <= 0 || alfa > 1) {
        document.getElementById("painelPassoPortas").innerHTML = "<strong>α inválido.</strong> Use (0, 1].";
        return;
    }
    if (!Number.isInteger(limite) || limite < 1) {
        document.getElementById("painelPassoPortas").innerHTML = "<strong>Limite de ciclos inválido.</strong>";
        return;
    }

    alfaPortas = D6(alfa);
    limiteCiclosPortas = limite;
    limiarPortas = new Decimal(0);
    indiceAmostraPortas = 0;
    faseAtualPortas = 0;
    estadoPassoPortas = null;
    cicloAtualPortas = 1;
    houveErroNoCicloPortas = false;
    redePortasTreinada = false;
    treinoAutomaticoPortas = false;
    historicoPassosPortas = [];
    trajetoriaPesosPortas = [{ passo: 0, pesos: pesosPortas.map(p => D6(p)), bias: D6(biasPortas) }];
    paginaAtualTabelaPortas = 1;
    acompanharPaginaRecentePortas = true;

    document.getElementById("corpoTabelaPortas").innerHTML = "";
    atualizarInfoPaginacaoTabelaPortas();
    document.getElementById("resultadoTestePortas").innerHTML = "Treinamento iniciado.";

    document.getElementById("painelPassoPortas").innerHTML =
        `<strong>Treinamento iniciado — ${NOMES_PORTAS[portaAtual]}</strong><br><br>
        Pesos iniciais (sorteados em [-0.5, +0.5]):<br>
        w1 = ${F6(pesosPortas[0])}, w2 = ${F6(pesosPortas[1])}, bias = ${F6(biasPortas)}<br><br>
        Clique em <strong>Próxima etapa</strong>.`;

    atualizarEstadoPortas();
    atualizarPesosFinaisPortas();
    desenharGraficoPortas();
    atualizarVisualPortas("?", "?", "?");
}

function calcularSaidaPortas(entrada, pesosAtuais, biasAtual) {
    let yLiq = D6(biasAtual);
    for (let i = 0; i < 2; i++) {
        yLiq = yLiq.plus(D6(entrada[i]).times(D6(pesosAtuais[i])));
    }
    const y = yLiq.greaterThanOrEqualTo(D6(limiarPortas)) ? 1 : -1;
    return { yLiq, y };
}

function montarTermosCalculoPortas(entrada, pesosAtuais, biasAtual) {
    return {
        termosMultiplicacao: `(${entrada[0]} × ${F6(pesosAtuais[0])}) + (${entrada[1]} × ${F6(pesosAtuais[1])})`,
        termosProdutos: `${F6(D6(entrada[0]).times(pesosAtuais[0]))} + ${F6(D6(entrada[1]).times(pesosAtuais[1]))}`,
        biasFmt: F6(biasAtual)
    };
}

function registrarPontoTrajetoriaPortas(forcar = false) {
    const ponto = { passo: trajetoriaPesosPortas.length, pesos: pesosPortas.map(p => D6(p)), bias: D6(biasPortas), ciclo: cicloAtualPortas };
    if (treinoAutomaticoPortas && !forcar) {
        const ultimo = trajetoriaPesosPortas[trajetoriaPesosPortas.length - 1];
        if (ultimo && ultimo.ciclo === cicloAtualPortas) {
            trajetoriaPesosPortas[trajetoriaPesosPortas.length - 1] = ponto;
            return;
        }
    }
    trajetoriaPesosPortas.push(ponto);
    if (trajetoriaPesosPortas.length > LIMITE_PONTOS_GRAFICO_PORTAS) {
        trajetoriaPesosPortas = [trajetoriaPesosPortas[0], ...trajetoriaPesosPortas.slice(-(LIMITE_PONTOS_GRAFICO_PORTAS - 1))];
    }
}

function obterTotalPaginasTabelaPortas() {
    return Math.max(1, Math.ceil(historicoPassosPortas.length / LINHAS_POR_PAGINA_PORTAS));
}

function obterIntervaloPaginaPortas(pagina) {
    const total = historicoPassosPortas.length;
    const totalPaginas = obterTotalPaginasTabelaPortas();
    const paginaValida = Math.min(Math.max(1, pagina), totalPaginas);
    const fim = total - (paginaValida - 1) * LINHAS_POR_PAGINA_PORTAS;
    const inicio = Math.max(0, fim - LINHAS_POR_PAGINA_PORTAS);
    return { inicio, fim };
}

function montarLinhaHtmlTabelaPortas(r) {
    return `<tr><td>${r.ciclo}</td><td>${r.amostra}</td><td>${F6(r.yLiq)}</td><td>${r.y}</td><td>${r.target}</td><td>${r.erro ? "Sim" : "Não"}</td>
        <td>${r.entradas[0]}</td><td>${r.entradas[1]}</td><td>${F6(r.pesos[0])}</td><td>${F6(r.pesos[1])}</td><td>${F6(r.bias)}</td></tr>`;
}

function atualizarInfoPaginacaoTabelaPortas() {
    const info = document.getElementById("infoPaginaTabelaPortas");
    if (!info) return;
    const total = historicoPassosPortas.length;
    if (total === 0) { info.textContent = "Nenhuma linha registrada ainda"; return; }
    const totalPaginas = obterTotalPaginasTabelaPortas();
    const { inicio, fim } = obterIntervaloPaginaPortas(paginaAtualTabelaPortas);
    const rotulo = paginaAtualTabelaPortas === 1 ? "passos mais recentes" : (paginaAtualTabelaPortas === totalPaginas ? "início do treinamento" : "histórico intermediário");
    info.textContent = `Página ${paginaAtualTabelaPortas} de ${totalPaginas} (passos ${inicio + 1}–${fim} de ${total} — ${rotulo})`;
}

function renderizarPaginaTabelaPortas(pagina) {
    const corpo = document.getElementById("corpoTabelaPortas");
    if (!corpo) return;
    if (historicoPassosPortas.length === 0) { corpo.innerHTML = ""; paginaAtualTabelaPortas = 1; atualizarInfoPaginacaoTabelaPortas(); return; }
    paginaAtualTabelaPortas = Math.min(Math.max(1, pagina), obterTotalPaginasTabelaPortas());
    const { inicio, fim } = obterIntervaloPaginaPortas(paginaAtualTabelaPortas);
    let html = "";
    for (let i = inicio; i < fim; i++) html += montarLinhaHtmlTabelaPortas(historicoPassosPortas[i]);
    corpo.innerHTML = html;
    atualizarInfoPaginacaoTabelaPortas();
}

function irParaPrimeiraPaginaTabelaPortas() { acompanharPaginaRecentePortas = true; renderizarPaginaTabelaPortas(1); }
function paginaAnteriorTabelaPortas() { renderizarPaginaTabelaPortas(paginaAtualTabelaPortas - 1); acompanharPaginaRecentePortas = paginaAtualTabelaPortas === 1; }
function proximaPaginaTabelaPortas() { acompanharPaginaRecentePortas = false; renderizarPaginaTabelaPortas(paginaAtualTabelaPortas + 1); }
function irParaUltimaPaginaTabelaPortas() { acompanharPaginaRecentePortas = false; renderizarPaginaTabelaPortas(obterTotalPaginasTabelaPortas()); }

function atualizarTabelaHistoricoPortas(forcar = false) {
    if (forcar || acompanharPaginaRecentePortas) { acompanharPaginaRecentePortas = true; renderizarPaginaTabelaPortas(1); return; }
    atualizarInfoPaginacaoTabelaPortas();
}

function registrarPassoHistoricoPortas(ciclo, amostra, entrada, yLiq, y, target, errou) {
    historicoPassosPortas.push({
        ciclo, amostra: amostra.nome, entradas: [...entrada], yLiq: D6(yLiq), y, target, erro: errou,
        pesos: pesosPortas.map(p => D6(p)), bias: D6(biasPortas)
    });
}

function finalizarAmostraPortas(estado, modoSilencioso = false) {
    const { amostra, entrada, target, yLiq, y, errou, pesosAntes, biasAntes } = estado;
    const diferenca = new Decimal(target - y);

    if (errou) {
        houveErroNoCicloPortas = true;
        for (let i = 0; i < 2; i++) {
            pesosPortas[i] = D6(pesosPortas[i]).plus(D6(alfaPortas).times(diferenca).times(D6(entrada[i])));
        }
        biasPortas = D6(biasPortas).plus(D6(alfaPortas).times(diferenca));
    }

    indiceAmostraPortas++;
    const cicloRegistro = cicloAtualPortas;
    let mensagemFimCiclo = "";
    const fimDoCiclo = indiceAmostraPortas >= amostrasPortas.length;

    if (fimDoCiclo) {
        if (houveErroNoCicloPortas) {
            mensagemFimCiclo = `<br><br><strong>Fim do ciclo ${cicloAtualPortas}:</strong> houve erro, novo ciclo.`;
            cicloAtualPortas++;
            indiceAmostraPortas = 0;
            houveErroNoCicloPortas = false;
        } else {
            redePortasTreinada = true;
            mensagemFimCiclo = `<br><br><strong>Fim do ciclo ${cicloAtualPortas}:</strong> sem erros. Rede treinada.`;
        }
    }

    if (modoSilencioso) {
        registrarPassoHistoricoPortas(cicloRegistro, amostra, entrada, yLiq, y, target, errou);
        registrarPontoTrajetoriaPortas(fimDoCiclo || redePortasTreinada);
        faseAtualPortas = 0;
        estadoPassoPortas = null;
        return;
    }

    registrarPassoHistoricoPortas(cicloRegistro, amostra, entrada, yLiq, y, target, errou);
    registrarPontoTrajetoriaPortas(true);
    atualizarTabelaHistoricoPortas(true);
    atualizarEstadoPortas();
    atualizarPesosFinaisPortas();
    desenharGraficoPortas();
    atualizarVisualPortas(entrada[0], entrada[1], y);

    let textoCorrecao = formatarTextoCorrecaoPortas(errou, entrada, target, y, pesosAntes, biasAntes, diferenca);

    document.getElementById("painelPassoPortas").innerHTML =
        `<strong>Ciclo ${cicloRegistro} - Amostra ${amostra.nome} — Correção do Perceptron</strong><br><br>
        yLiq = ${F6(yLiq)} → y = ${y}, target = ${target}<br>
        erro = ${errou ? "sim" : "não"}<br><br>
        ${textoCorrecao}${mensagemFimCiclo}`;

    faseAtualPortas = 0;
    estadoPassoPortas = null;
}

function processarAmostraCompletaPortas() {
    const amostra = amostrasPortas[indiceAmostraPortas];
    const pesosAntes = pesosPortas.map(p => D6(p));
    const biasAntes = D6(biasPortas);
    const { yLiq, y } = calcularSaidaPortas(amostra.entrada, pesosAntes, biasAntes);
    finalizarAmostraPortas({ amostra, entrada: amostra.entrada, target: amostra.target, yLiq, y, errou: y !== amostra.target, pesosAntes, biasAntes }, true);
}

function proximaEtapaPortas(interno = false) {
    if (treinoAutomaticoPortas && !interno) {
        document.getElementById("painelPassoPortas").innerHTML = "<strong>Treino automático em andamento...</strong>";
        return;
    }
    if (redePortasTreinada) {
        document.getElementById("painelPassoPortas").innerHTML = `<strong>Rede treinada</strong> no ciclo ${cicloAtualPortas}.`;
        return;
    }
    if (historicoPassosPortas.length === 0 && trajetoriaPesosPortas.length === 0 && !interno) {
        document.getElementById("painelPassoPortas").innerHTML = "Clique em <strong>Iniciar treinamento</strong> primeiro.";
        return;
    }
    if (interno) { processarAmostraCompletaPortas(); return; }

    const amostra = amostrasPortas[indiceAmostraPortas];
    const entrada = amostra.entrada;
    const target = amostra.target;
    const pesosAntes = pesosPortas.map(p => D6(p));
    const biasAntes = D6(biasPortas);
    const { yLiq, y } = calcularSaidaPortas(entrada, pesosAntes, biasAntes);
    const termos = montarTermosCalculoPortas(entrada, pesosAntes, biasAntes);

    if (faseAtualPortas === 0) {
        atualizarVisualPortas(entrada[0], entrada[1], "?");
        let avisoNot = "";
        if (portaAtual === "NOT") {
            avisoNot = `<br><br><em>NOT usa x2 = 0 como entrada auxiliar para manter duas entradas no Perceptron.</em>`;
        }
        document.getElementById("painelPassoPortas").innerHTML =
            `<strong>Ciclo ${cicloAtualPortas} — Amostra ${amostra.nome}</strong><br><br>
            A rede recebeu as entradas:<br>
            x1 = ${entrada[0]}, x2 = ${entrada[1]}<br><br>
            A saída desejada (target) é:<br>
            target = ${target}<br><br>
            Pesos atuais: w1 = ${F6(pesosAntes[0])}, w2 = ${F6(pesosAntes[1])}, bias = ${F6(biasAntes)}${avisoNot}`;
        faseAtualPortas = 1;
        return;
    }
    if (faseAtualPortas === 1) {
        document.getElementById("painelPassoPortas").innerHTML =
            `<strong>Combinação linear</strong><br><br>
            yLiq = (x1 × w1) + (x2 × w2) + b<br><br>
            yLiq = ${termos.termosMultiplicacao} + ${termos.biasFmt}<br>
            yLiq = ${termos.termosProdutos} + ${termos.biasFmt}<br>
            yLiq = ${F6(yLiq)}`;
        faseAtualPortas = 2;
        return;
    }
    if (faseAtualPortas === 2) {
        document.getElementById("painelPassoPortas").innerHTML =
            `<strong>Função de ativação</strong><br><br>
            Usamos degrau bipolar com limiar = 0:<br><br>
            se yLiq ≥ 0, y = 1<br>
            se yLiq &lt; 0, y = -1<br><br>
            Como yLiq = ${F6(yLiq)}, a saída calculada foi:<br>
            y = ${y}<br><br>
            target = ${target}<br>
            erro = ${y !== target ? "sim — os pesos serão corrigidos na próxima etapa" : "não — saída correta"}`;
        estadoPassoPortas = { amostra, entrada, target, yLiq, y, errou: y !== target, pesosAntes, biasAntes };
        faseAtualPortas = 3;
        return;
    }
    if (faseAtualPortas === 3 && estadoPassoPortas) {
        finalizarAmostraPortas(estadoPassoPortas, false);
    }
}

function atualizarEstadoPortas() {
    document.getElementById("estadoPortas").innerHTML =
        `<strong>Parâmetros atuais</strong><br><br>
        porta: ${NOMES_PORTAS[portaAtual]}<br>
        α: ${F6(alfaPortas)}<br>
        limite de ciclos: ${limiteCiclosPortas}<br>
        ciclo atual: ${cicloAtualPortas}<br>
        próxima amostra: ${redePortasTreinada ? "rede treinada" : amostrasPortas[indiceAmostraPortas]?.nome ?? "-"}<br><br>
        w1 = ${F6(pesosPortas[0] ?? 0)}<br>
        w2 = ${F6(pesosPortas[1] ?? 0)}<br>
        bias = ${F6(biasPortas)}`;
}

function mapearPassoParaXCartesianoPortas(passo, maxPasso, inicioX, largura) {
    if (maxPasso <= 0) {
        return inicioX;
    }
    return inicioX + ((passo / maxPasso) * largura);
}

function mapearValorParaYPortas(valor, topo, base, maiorModulo) {
    const centro = (topo + base) / 2;
    const escala = ((base - topo) / 2) / maiorModulo;
    return centro - (valor * escala);
}

function desenharSeriePortas(ctx, cor, valores, maiorModulo, topo, base, inicioX, largura, maxPasso) {
    if (valores.length === 0) {
        return;
    }
    ctx.beginPath();
    ctx.strokeStyle = cor;
    ctx.lineWidth = 2;
    for (let i = 0; i < valores.length; i++) {
        const x = mapearPassoParaXCartesianoPortas(i, maxPasso, inicioX, largura);
        const y = mapearValorParaYPortas(valores[i], topo, base, maiorModulo);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();

    const desenharMarcadores = valores.length <= 80;
    const intervaloMarcador = valores.length > 80 ? Math.ceil(valores.length / 40) : 1;
    for (let i = 0; i < valores.length; i += intervaloMarcador) {
        if (!desenharMarcadores && i !== 0 && i !== valores.length - 1) {
            continue;
        }
        const x = mapearPassoParaXCartesianoPortas(i, maxPasso, inicioX, largura);
        const y = mapearValorParaYPortas(valores[i], topo, base, maiorModulo);
        ctx.fillStyle = cor;
        ctx.beginPath();
        ctx.arc(x, y, desenharMarcadores ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function desenharGraficoPortas() {
    const canvas = document.getElementById("graficoPortas");
    if (!canvas) {
        return;
    }
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const margemEsquerda = 60;
    const margemDireita = 500;
    const topo = 34;
    const base = 224;
    const largura = margemDireita - margemEsquerda;

    const seriesPesos = [0, 1].map(i => trajetoriaPesosPortas.map(p => N(p.pesos[i] ?? 0)));
    const serieBias = trajetoriaPesosPortas.map(p => N(p.bias));
    const todosValores = [...seriesPesos.flat(), ...serieBias, 0];
    const maiorModulo = Math.max(1, ...todosValores.map(v => Math.abs(v)));
    const maxPasso = Math.max(4, trajetoriaPesosPortas.length - 1);
    const passoY = Math.max(0.1, Math.ceil((maiorModulo / 4) * 10) / 10);
    const intervaloGradeX = maxPasso > 40 ? Math.ceil(maxPasso / 10) : 1;

    for (let passo = 0; passo <= maxPasso; passo += intervaloGradeX) {
        const x = mapearPassoParaXCartesianoPortas(passo, maxPasso, margemEsquerda, largura);
        ctx.strokeStyle = passo === 0 ? "#475569" : "#1f2937";
        ctx.lineWidth = passo === 0 ? 1.4 : 1;
        ctx.beginPath();
        ctx.moveTo(x, topo);
        ctx.lineTo(x, base);
        ctx.stroke();
    }

    for (let valor = -maiorModulo; valor <= maiorModulo + 0.0001; valor += passoY) {
        const y = mapearValorParaYPortas(valor, topo, base, maiorModulo);
        const pertoDoZero = Math.abs(valor) < (passoY / 2);
        ctx.strokeStyle = pertoDoZero ? "#475569" : "#1f2937";
        ctx.lineWidth = pertoDoZero ? 1.6 : 1;
        ctx.beginPath();
        ctx.moveTo(margemEsquerda, y);
        ctx.lineTo(margemDireita, y);
        ctx.stroke();
    }

    ctx.fillStyle = "#e5e7eb";
    ctx.fillText("Plano cartesiano: evolução dos pesos", margemEsquerda, 16);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("X = passo | Y = valor do peso", 340, 16);

    for (let valor = -maiorModulo; valor <= maiorModulo + 0.0001; valor += passoY) {
        const y = mapearValorParaYPortas(valor, topo, base, maiorModulo);
        ctx.fillStyle = "#64748b";
        ctx.fillText(F6(valor), 16, y + 4);
    }

    for (let passo = 0; passo <= maxPasso; passo += intervaloGradeX) {
        const x = mapearPassoParaXCartesianoPortas(passo, maxPasso, margemEsquerda, largura);
        ctx.fillStyle = "#64748b";
        ctx.fillText(String(passo), x - 3, base + 16);
    }

    const cores = ["#38bdf8", "#22c55e", "#f472b6"];
    for (let i = 0; i < seriesPesos.length; i++) {
        desenharSeriePortas(ctx, cores[i], seriesPesos[i], maiorModulo, topo, base, margemEsquerda, largura, maxPasso);
        ctx.fillStyle = cores[i];
        ctx.fillText(`w${i + 1}`, 430, 30 + (i * 16));
    }

    desenharSeriePortas(ctx, "#f472b6", serieBias, maiorModulo, topo, base, margemEsquerda, largura, maxPasso);
    ctx.fillStyle = "#f472b6";
    ctx.fillText("bias", 430, 30 + (seriesPesos.length * 16));

    ctx.fillStyle = "#94a3b8";
    ctx.fillText("passo", 472, 240);
    ctx.save();
    ctx.translate(8, 44);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("valor", 0, 0);
    ctx.restore();
}

function testarPortas() {
    if (historicoPassosPortas.length === 0) {
        document.getElementById("resultadoTestePortas").innerHTML = "Treine a rede antes de testar.";
        return;
    }
    const x1 = parseFloat(document.getElementById("testePortaX1").value);
    const x2 = parseFloat(document.getElementById("testePortaX2").value);
    const entrada = [x1, x2];
    const pesosAtuais = pesosPortas.map(p => D6(p));
    const termos = montarTermosCalculoPortas(entrada, pesosAtuais, biasPortas);
    const { yLiq, y } = calcularSaidaPortas(entrada, pesosAtuais, biasPortas);

    document.getElementById("resultadoTestePortas").innerHTML =
        `<strong>Teste da rede treinada</strong><br><br>
        entrada = [${entrada.join(", ")}]<br>
        yLiq = ${termos.termosMultiplicacao} + ${termos.biasFmt}<br>
        yLiq = ${termos.termosProdutos} + ${termos.biasFmt}<br>
        yLiq = ${F6(yLiq)}<br>
        saída y = ${y}`;
}

function treinarAteConvergirPortas() {
    if (trajetoriaPesosPortas.length === 0) {
        iniciarTreinamentoPortas();
        if (trajetoriaPesosPortas.length === 0) return;
    }
    if (redePortasTreinada) return;

    limiteCiclosPortas = parseInt(document.getElementById("limiteCiclosPortasInput").value, 10);
    treinoAutomaticoPortas = true;

    function executarLote() {
        let n = 0;
        while (!redePortasTreinada && cicloAtualPortas <= limiteCiclosPortas && n < 500) {
            proximaEtapaPortas(true);
            n++;
        }
        atualizarEstadoPortas();
        atualizarPesosFinaisPortas();
        desenharGraficoPortas();
        atualizarTabelaHistoricoPortas();

        if (redePortasTreinada || cicloAtualPortas > limiteCiclosPortas) {
            treinoAutomaticoPortas = false;
            irParaPrimeiraPaginaTabelaPortas();
            document.getElementById("painelPassoPortas").innerHTML = redePortasTreinada
                ? `<strong>Treino concluído</strong> no ciclo ${cicloAtualPortas}.<br><br>w1 = ${F6(pesosPortas[0])}<br>w2 = ${F6(pesosPortas[1])}<br>bias = ${F6(biasPortas)}`
                : `<strong>Não convergiu</strong> até ${limiteCiclosPortas} ciclos.<br><br>w1 = ${F6(pesosPortas[0])}<br>w2 = ${F6(pesosPortas[1])}<br>bias = ${F6(biasPortas)}`;
            return;
        }
        document.getElementById("painelPassoPortas").innerHTML = `<strong>Treinando...</strong> ciclo ${cicloAtualPortas} de ${limiteCiclosPortas}`;
        setTimeout(executarLote, 0);
    }
    executarLote();
}

renderizarCabecalhoTabelaPortas();
trocarPortaLogica();
