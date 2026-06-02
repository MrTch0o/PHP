const EXERCICIOS_PERCEPTRON = {
    base: {
        nome: "Algoritmo do professor (programa em C)",
        descricao: "Mesmos dados do material: entradas A/B, w = [0.5, -0.1, 0.4, -0.27], bias = 0.3256, α = 0.01 e limiar = 0.",
        entradas: [
            { nome: "A", entrada: [-1, -1, 1, 1], target: -1 },
            { nome: "B", entrada: [1, -1, 1, -1], target: 1 }
        ],
        pesosFixos: [0.5, -0.1, 0.4, -0.27],
        biasFixo: 0.3256,
        alfaPadrao: 0.01
    },
    proximo: {
        nome: "Exercício padrões próximos (2 entradas)",
        descricao: "Implemente Perceptron simples: 2 entradas, 2 padrões, saída -1 ou 1. Padrões [1,1] e [1,1.00001]. Pesos aleatórios em [-0.5, +0.5].",
        entradas: [
            { nome: "P1", entrada: [1.0, 1.0], target: -1 },
            { nome: "P2", entrada: [1.0, 1.00001], target: 1 }
        ],
        pesosFixos: null,
        biasFixo: null,
        alfaPadrao: 0.01
    }
};

let exercicioAtualChave = "base";
let exercicioAtual = EXERCICIOS_PERCEPTRON.base;
let amostrasPerceptron = exercicioAtual.entradas;

let pesos = [];
let biasPerceptron = new Decimal(0);
let alfaPerceptron = new Decimal(0.000001);
let limiarPerceptron = new Decimal(0);
let limiteCiclosPerceptron = 1000;

let indiceAmostraAtual = 0;
let faseAtualPerceptron = 0;
let estadoPassoAtual = null;
let cicloAtual = 1;
let houveErroNoCiclo = false;
let redeTreinada = false;
let treinoAutomaticoAtivo = false;

let historicoPassos = [];
let trajetoriaPesos = [];
let paginaAtualTabela = 1;
let acompanharPaginaRecente = true;
const LINHAS_POR_PAGINA = 20;
const LIMITE_PONTOS_GRAFICO = 300;

const D6 = (v) => new Decimal(v);
const F6 = (v) => D6(v).toDecimalPlaces(6).toFixed(6);
const N = (v) => D6(v).toNumber();

function gerarPesoAleatorio() {
    return new Decimal(Math.random() - 0.5);
}

function selecionarExercicioPerceptron(chave) {
    exercicioAtualChave = chave;
    exercicioAtual = EXERCICIOS_PERCEPTRON[chave] || EXERCICIOS_PERCEPTRON.base;
    amostrasPerceptron = exercicioAtual.entradas;

    atualizarBotoesExercicioPerceptron();
    renderizarDescricaoExercicio();
    renderizarAmostrasExercicio();
    renderizarCabecalhoTabela();
    renderizarCamposTeste();
    resetarEstadoPerceptron();
}

function atualizarBotoesExercicioPerceptron() {
    const btnBase = document.getElementById("btnExercicioPerceptronBase");
    const btnProximo = document.getElementById("btnExercicioPerceptronProximo");
    if (!btnBase || !btnProximo) {
        return;
    }

    btnBase.classList.remove("ativo");
    btnProximo.classList.remove("ativo");
    btnBase.classList.add("secundario");
    btnProximo.classList.add("secundario");

    if (exercicioAtualChave === "proximo") {
        btnProximo.classList.add("ativo");
        btnProximo.classList.remove("secundario");
    } else {
        btnBase.classList.add("ativo");
        btnBase.classList.remove("secundario");
    }
}

function renderizarDescricaoExercicio() {
    const el = document.getElementById("descricaoExercicioPerceptron");
    if (!el) {
        return;
    }

    const dimensao = amostrasPerceptron[0].entrada.length;
    el.innerHTML = `<strong>${exercicioAtual.nome}</strong><br>${exercicioAtual.descricao}<br>Entradas por padrão: ${dimensao}.`;
}

function renderizarAmostrasExercicio() {
    const el = document.getElementById("amostrasPerceptronTexto");
    if (!el) {
        return;
    }

    el.innerHTML = amostrasPerceptron
        .map(a => `<p><strong>${a.nome}:</strong> [${a.entrada.join(", ")}] → target ${a.target}</p>`)
        .join("");
}

function renderizarCabecalhoTabela() {
    const thead = document.getElementById("cabecalhoTabelaPerceptron");
    if (!thead) {
        return;
    }

    const dimensao = amostrasPerceptron[0].entrada.length;
    let html = "<tr><th>Ciclo</th><th>Amostra</th><th>yLiq</th><th>y</th><th>target</th><th>Erro?</th>";
    for (let i = 0; i < dimensao; i++) {
        html += `<th>x${i + 1}</th>`;
    }
    for (let i = 0; i < dimensao; i++) {
        html += `<th>w${i + 1}</th>`;
    }
    html += "<th>bias</th></tr>";
    thead.innerHTML = html;
}

function renderizarCamposTeste() {
    const el = document.getElementById("camposTestePerceptron");
    if (!el) {
        return;
    }

    const dimensao = amostrasPerceptron[0].entrada.length;
    const valores = [...new Set(amostrasPerceptron.flatMap(a => a.entrada))];
    const opcoes = valores.map(v => `<option value="${v}">${v}</option>`).join("");

    let html = "";
    for (let i = 0; i < dimensao; i++) {
        html += `<label>x${i + 1}:</label><select id="testePX${i + 1}">${opcoes}</select>`;
    }
    el.innerHTML = html;
}

function resetarEstadoPerceptron() {
    const dimensao = amostrasPerceptron[0].entrada.length;
    pesos = Array(dimensao).fill(0).map(() => new Decimal(0));
    biasPerceptron = new Decimal(0);
    indiceAmostraAtual = 0;
    faseAtualPerceptron = 0;
    estadoPassoAtual = null;
    cicloAtual = 1;
    houveErroNoCiclo = false;
    redeTreinada = false;
    treinoAutomaticoAtivo = false;
    historicoPassos = [];
    trajetoriaPesos = [];
    paginaAtualTabela = 1;
    acompanharPaginaRecente = true;

    const corpo = document.getElementById("corpoTabelaPerceptron");
    if (corpo) {
        corpo.innerHTML = "";
    }
    atualizarInfoPaginacaoTabela();

    const resultado = document.getElementById("resultadoTestePerceptron");
    if (resultado) {
        resultado.innerHTML = "Treine a rede antes de testar.";
    }

    const painel = document.getElementById("painelPassoPerceptron");
    if (painel) {
        painel.innerHTML = "Clique em <strong>Iniciar treinamento</strong> para começar o ciclo 1.";
    }

    atualizarEstadoPerceptron();
    desenharGraficoPerceptron();
}

function iniciarTreinamentoPerceptron() {
    if (exercicioAtual.pesosFixos && exercicioAtual.pesosFixos.length > 0) {
        pesos = exercicioAtual.pesosFixos.map(v => D6(v));
        biasPerceptron = D6(exercicioAtual.biasFixo);
    } else {
        pesos = Array(amostrasPerceptron[0].entrada.length).fill(0).map(() => gerarPesoAleatorio());
        biasPerceptron = gerarPesoAleatorio();
    }

    const alfaInput = document.getElementById("alfaPerceptronInput");
    const alfaPadrao = exercicioAtual.alfaPadrao ?? 0.01;
    if (alfaInput && exercicioAtualChave === "base") {
        alfaInput.value = String(alfaPadrao);
    }
    const alfaInformado = parseFloat(alfaInput ? alfaInput.value : String(alfaPadrao));
    if (!Number.isFinite(alfaInformado) || alfaInformado <= 0 || alfaInformado > 1) {
        document.getElementById("painelPassoPerceptron").innerHTML =
            `<strong>Valor de α inválido.</strong><br><br>
            Informe um valor no intervalo (0, 1].<br>
            Exemplo: 0.01, 0.001 ou 0.00001.`;
        return;
    }

    const limiteInput = document.getElementById("limiteCiclosPerceptronInput");
    const limiteInformado = parseInt(limiteInput ? limiteInput.value : "1000", 10);
    if (!Number.isInteger(limiteInformado) || limiteInformado < 1) {
        document.getElementById("painelPassoPerceptron").innerHTML =
            `<strong>Limite de ciclos inválido.</strong><br><br>
            Informe um inteiro maior ou igual a 1.`;
        return;
    }

    alfaPerceptron = D6(alfaInformado);
    limiteCiclosPerceptron = limiteInformado;
    limiarPerceptron = new Decimal(0);
    indiceAmostraAtual = 0;
    faseAtualPerceptron = 0;
    estadoPassoAtual = null;
    cicloAtual = 1;
    houveErroNoCiclo = false;
    redeTreinada = false;
    treinoAutomaticoAtivo = false;
    historicoPassos = [];
    trajetoriaPesos = [{ passo: 0, pesos: pesos.map(p => D6(p)), bias: D6(biasPerceptron) }];
    paginaAtualTabela = 1;
    acompanharPaginaRecente = true;

    const linhasPesosIniciais = pesos.map((p, i) => `w${i + 1} = ${F6(p)}`).join("<br>");
    const textoPesosIniciais = exercicioAtual.pesosFixos
        ? "Pesos iniciais (como no programa C do professor):"
        : "Pesos iniciais (sorteados em [-0.5, +0.5]):";
    document.getElementById("corpoTabelaPerceptron").innerHTML = "";
    atualizarInfoPaginacaoTabela();
    document.getElementById("resultadoTestePerceptron").innerHTML =
        "Treinamento iniciado. Avance as etapas para acompanhar os ciclos.";
    document.getElementById("painelPassoPerceptron").innerHTML =
        `<strong>Treinamento iniciado.</strong><br><br>
        Exercício: ${exercicioAtual.nome}<br>
        Ciclo atual: ${cicloAtual}<br>
        Próxima amostra: ${amostrasPerceptron[indiceAmostraAtual].nome}<br><br>
        ${textoPesosIniciais}<br>
        ${linhasPesosIniciais}<br>
        bias = ${F6(biasPerceptron)}<br><br>
        Clique em <strong>Próxima etapa</strong> para ver a amostra e iniciar o ciclo.`;

    atualizarEstadoPerceptron();
    desenharGraficoPerceptron();
}

function calcularSaidaAmostra(entrada, pesosAtuais, biasAtual) {
    let yLiq = new Decimal(0);
    for (let i = 0; i < entrada.length; i++) {
        yLiq = yLiq.plus(D6(entrada[i]).times(D6(pesosAtuais[i])));
    }
    yLiq = yLiq.plus(D6(biasAtual));
    const y = yLiq.greaterThanOrEqualTo(D6(limiarPerceptron)) ? 1 : -1;
    return { yLiq, y };
}

function montarTermosCalculo(entrada, pesosAtuais, biasAtual) {
    const termosMultiplicacao = entrada
        .map((x, i) => `(${x} × ${F6(pesosAtuais[i])})`)
        .join(" + ");
    const termosProdutos = entrada
        .map((x, i) => F6(D6(x).times(pesosAtuais[i])))
        .join(" + ");
    return { termosMultiplicacao, termosProdutos };
}

function registrarPontoTrajetoria(forcar = false) {
    const ponto = {
        passo: trajetoriaPesos.length,
        pesos: pesos.map(p => D6(p)),
        bias: D6(biasPerceptron),
        ciclo: cicloAtual
    };

    if (treinoAutomaticoAtivo && !forcar) {
        const ultimo = trajetoriaPesos[trajetoriaPesos.length - 1];
        if (ultimo && ultimo.ciclo === cicloAtual) {
            trajetoriaPesos[trajetoriaPesos.length - 1] = ponto;
            return;
        }
    }

    trajetoriaPesos.push(ponto);

    if (trajetoriaPesos.length > LIMITE_PONTOS_GRAFICO) {
        const primeiro = trajetoriaPesos[0];
        const ultimos = trajetoriaPesos.slice(-(LIMITE_PONTOS_GRAFICO - 1));
        trajetoriaPesos = [primeiro, ...ultimos];
    }
}

function formatarPesosBiasResumo() {
    const linhasPesos = pesos.map((p, i) => `w${i + 1} = ${F6(p)}`).join(", ");
    return `${linhasPesos}, bias = ${F6(biasPerceptron)}`;
}

function obterTotalPaginasTabela() {
    return Math.max(1, Math.ceil(historicoPassos.length / LINHAS_POR_PAGINA));
}

function obterIntervaloPagina(pagina) {
    const total = historicoPassos.length;
    const totalPaginas = obterTotalPaginasTabela();
    const paginaValida = Math.min(Math.max(1, pagina), totalPaginas);
    const fim = total - (paginaValida - 1) * LINHAS_POR_PAGINA;
    const inicio = Math.max(0, fim - LINHAS_POR_PAGINA);
    return { inicio, fim, pagina: paginaValida };
}

function obterRotuloPaginaTabela(pagina) {
    const total = historicoPassos.length;
    const totalPaginas = obterTotalPaginasTabela();
    if (pagina === 1) {
        return "passos mais recentes";
    }
    if (pagina === totalPaginas) {
        return "início do treinamento";
    }
    return "histórico intermediário";
}

function montarLinhaHtmlTabela(registro) {
    let linha = `<tr><td>${registro.ciclo}</td><td>${registro.amostra}</td><td>${F6(registro.yLiq)}</td><td>${registro.y}</td><td>${registro.target}</td><td>${registro.erro ? "Sim" : "Não"}</td>`;

    for (const x of registro.entradas) {
        linha += `<td>${x}</td>`;
    }
    for (const w of registro.pesos) {
        linha += `<td>${F6(w)}</td>`;
    }
    linha += `<td>${F6(registro.bias)}</td></tr>`;
    return linha;
}

function atualizarInfoPaginacaoTabela() {
    const info = document.getElementById("infoPaginaTabelaPerceptron");
    if (!info) {
        return;
    }

    const total = historicoPassos.length;
    if (total === 0) {
        info.textContent = "Nenhuma linha registrada ainda";
        return;
    }

    const totalPaginas = obterTotalPaginasTabela();
    const { inicio, fim } = obterIntervaloPagina(paginaAtualTabela);
    const rotulo = obterRotuloPaginaTabela(paginaAtualTabela);
    info.textContent = `Página ${paginaAtualTabela} de ${totalPaginas} (passos ${inicio + 1}–${fim} de ${total} — ${rotulo})`;
}

function renderizarPaginaTabela(pagina) {
    const corpo = document.getElementById("corpoTabelaPerceptron");
    if (!corpo) {
        return;
    }

    if (historicoPassos.length === 0) {
        corpo.innerHTML = "";
        paginaAtualTabela = 1;
        atualizarInfoPaginacaoTabela();
        return;
    }

    const totalPaginas = obterTotalPaginasTabela();
    paginaAtualTabela = Math.min(Math.max(1, pagina), totalPaginas);
    const { inicio, fim } = obterIntervaloPagina(paginaAtualTabela);

    let html = "";
    for (let i = inicio; i < fim; i++) {
        html += montarLinhaHtmlTabela(historicoPassos[i]);
    }
    corpo.innerHTML = html;
    atualizarInfoPaginacaoTabela();
}

function irParaPrimeiraPaginaTabelaPerceptron() {
    acompanharPaginaRecente = true;
    renderizarPaginaTabela(1);
}

function paginaAnteriorTabelaPerceptron() {
    renderizarPaginaTabela(paginaAtualTabela - 1);
    acompanharPaginaRecente = paginaAtualTabela === 1;
}

function proximaPaginaTabelaPerceptron() {
    acompanharPaginaRecente = false;
    renderizarPaginaTabela(paginaAtualTabela + 1);
}

function irParaUltimaPaginaTabelaPerceptron() {
    acompanharPaginaRecente = false;
    renderizarPaginaTabela(obterTotalPaginasTabela());
}

function registrarPassoHistorico(cicloRegistro, amostra, entrada, yLiq, y, target, errou) {
    historicoPassos.push({
        ciclo: cicloRegistro,
        amostra: amostra.nome,
        entradas: [...entrada],
        yLiq: D6(yLiq),
        y,
        target,
        erro: errou,
        pesos: pesos.map(p => D6(p)),
        bias: D6(biasPerceptron)
    });
}

function atualizarTabelaHistorico(forcarPaginaRecente = false) {
    if (forcarPaginaRecente || acompanharPaginaRecente) {
        acompanharPaginaRecente = true;
        renderizarPaginaTabela(1);
        return;
    }
    atualizarInfoPaginacaoTabela();
}

function finalizarAmostraPerceptron(estado, opcoes = {}) {
    const { modoSilencioso = false } = opcoes;
    const { amostra, entrada, target, yLiq, y, errou, pesosAntes, biasAntes } = estado;
    const dimensao = entrada.length;
    const diferenca = new Decimal(target - y);

    if (errou) {
        houveErroNoCiclo = true;
        for (let i = 0; i < dimensao; i++) {
            pesos[i] = D6(pesos[i]).plus(D6(alfaPerceptron).times(diferenca).times(D6(entrada[i])));
        }
        biasPerceptron = D6(biasPerceptron).plus(D6(alfaPerceptron).times(diferenca));
    }

    indiceAmostraAtual++;

    const cicloRegistro = cicloAtual;
    let mensagemFimCiclo = "";
    const fimDoCiclo = indiceAmostraAtual >= amostrasPerceptron.length;
    if (fimDoCiclo) {
        if (houveErroNoCiclo) {
            mensagemFimCiclo = `<br><br><strong>Fim do ciclo ${cicloAtual}:</strong> houve erro, iniciaremos novo ciclo.`;
            cicloAtual++;
            indiceAmostraAtual = 0;
            houveErroNoCiclo = false;
        } else {
            redeTreinada = true;
            mensagemFimCiclo = `<br><br><strong>Fim do ciclo ${cicloAtual}:</strong> sem erros. Rede treinada.`;
        }
    }

    if (modoSilencioso) {
        registrarPassoHistorico(cicloRegistro, amostra, entrada, yLiq, y, target, errou);
        if (fimDoCiclo || redeTreinada) {
            registrarPontoTrajetoria(true);
        } else {
            registrarPontoTrajetoria(false);
        }
        faseAtualPerceptron = 0;
        estadoPassoAtual = null;
        return;
    }

    registrarPassoHistorico(cicloRegistro, amostra, entrada, yLiq, y, target, errou);
    registrarPontoTrajetoria(true);
    atualizarTabelaHistorico(true);
    atualizarEstadoPerceptron();
    desenharGraficoPerceptron();

    let textoCorrecao = "Não houve correção de pesos (saída correta).";
    if (errou) {
        textoCorrecao = `Houve erro. Δ = α × (target - y) = ${F6(alfaPerceptron)} × (${target} - ${y}) = ${F6(D6(alfaPerceptron).times(diferenca))}<br>`;
        for (let i = 0; i < dimensao; i++) {
            textoCorrecao += `w${i + 1}: ${F6(pesosAntes[i])} → ${F6(pesos[i])}<br>`;
        }
        textoCorrecao += `b: ${F6(biasAntes)} → ${F6(biasPerceptron)}`;
    }

    const { termosMultiplicacao, termosProdutos } = montarTermosCalculo(entrada, pesosAntes, biasAntes);

    document.getElementById("painelPassoPerceptron").innerHTML =
        `<strong>Ciclo ${cicloRegistro} - Amostra ${amostra.nome} — Correção do Perceptron</strong><br><br>
        yLiq = ${F6(yLiq)} → y = ${y}, target = ${target}<br>
        erro = ${errou ? "sim" : "não"}<br><br>
        ${textoCorrecao}
        ${mensagemFimCiclo}`;

    faseAtualPerceptron = 0;
    estadoPassoAtual = null;

    if (!redeTreinada && indiceAmostraAtual < amostrasPerceptron.length) {
        document.getElementById("painelPassoPerceptron").innerHTML +=
            `<br><br>Próxima amostra: <strong>${amostrasPerceptron[indiceAmostraAtual].nome}</strong>. Clique em <strong>Próxima etapa</strong>.`;
    }
}

function processarAmostraCompletaPerceptron(modoSilencioso = false) {
    const amostra = amostrasPerceptron[indiceAmostraAtual];
    const entrada = amostra.entrada;
    const target = amostra.target;
    const pesosAntes = pesos.map(p => D6(p));
    const biasAntes = D6(biasPerceptron);
    const { yLiq, y } = calcularSaidaAmostra(entrada, pesosAntes, biasAntes);
    const errou = y !== target;

    finalizarAmostraPerceptron({
        amostra,
        entrada,
        target,
        yLiq,
        y,
        errou,
        pesosAntes,
        biasAntes
    }, { modoSilencioso });
}

function proximaEtapaPerceptron(interno = false) {
    if (treinoAutomaticoAtivo && !interno) {
        document.getElementById("painelPassoPerceptron").innerHTML =
            `<strong>Treino automático em andamento.</strong><br><br>
            Aguarde finalizar ou atingir o limite de ciclos.`;
        return;
    }

    if (redeTreinada) {
        document.getElementById("painelPassoPerceptron").innerHTML =
            `<strong>Rede já treinada.</strong><br><br>
            O treinamento convergiu no ciclo ${cicloAtual}.<br>
            Use a área de teste para operar a rede.`;
        return;
    }

    if (historicoPassos.length === 0 && trajetoriaPesos.length === 0 && !interno) {
        document.getElementById("painelPassoPerceptron").innerHTML =
            `Clique em <strong>Iniciar treinamento</strong> antes de avançar as etapas.`;
        return;
    }

    if (interno) {
        processarAmostraCompletaPerceptron(true);
        return;
    }

    const amostra = amostrasPerceptron[indiceAmostraAtual];
    const entrada = amostra.entrada;
    const target = amostra.target;

    if (faseAtualPerceptron === 0) {
        document.getElementById("painelPassoPerceptron").innerHTML =
            `<strong>Ciclo ${cicloAtual} — Amostra ${amostra.nome}</strong><br><br>
            A rede recebeu as entradas:<br>
            x = [${entrada.join(", ")}]<br><br>
            A saída desejada (target) é:<br>
            target = ${target}`;
        faseAtualPerceptron = 1;
        return;
    }

    const pesosAntes = pesos.map(p => D6(p));
    const biasAntes = D6(biasPerceptron);
    const { yLiq, y } = calcularSaidaAmostra(entrada, pesosAntes, biasAntes);
    const { termosMultiplicacao, termosProdutos } = montarTermosCalculo(entrada, pesosAntes, biasAntes);

    if (faseAtualPerceptron === 1) {
        document.getElementById("painelPassoPerceptron").innerHTML =
            `<strong>Combinação linear</strong><br><br>
            yLiq = Σ(xi × wi) + b<br><br>
            yLiq = ${termosMultiplicacao} + ${F6(biasAntes)}<br>
            yLiq = ${termosProdutos} + ${F6(biasAntes)}<br>
            yLiq = ${F6(yLiq)}`;
        faseAtualPerceptron = 2;
        return;
    }

    if (faseAtualPerceptron === 2) {
        document.getElementById("painelPassoPerceptron").innerHTML =
            `<strong>Função de ativação</strong><br><br>
            Usamos degrau bipolar com limiar = ${F6(limiarPerceptron)}:<br><br>
            se yLiq ≥ limiar, y = 1<br>
            se yLiq &lt; limiar, y = -1<br><br>
            Como yLiq = ${F6(yLiq)}, a saída calculada foi:<br>
            y = ${y}<br><br>
            target = ${target}<br>
            erro = ${y !== target ? "sim — os pesos serão corrigidos na próxima etapa" : "não — saída correta"}`;
        estadoPassoAtual = {
            amostra,
            entrada,
            target,
            yLiq,
            y,
            errou: y !== target,
            pesosAntes,
            biasAntes
        };
        faseAtualPerceptron = 3;
        return;
    }

    if (faseAtualPerceptron === 3 && estadoPassoAtual) {
        finalizarAmostraPerceptron(estadoPassoAtual);
    }
}

function atualizarEstadoPerceptron() {
    const linhasPesos = pesos.map((p, i) => `w${i + 1} = ${F6(p)}`).join("<br>");
    document.getElementById("estadoPerceptron").innerHTML =
        `<strong>Parâmetros atuais</strong><br><br>
        exercício: ${exercicioAtual.nome}<br>
        α atual: ${F6(alfaPerceptron)}<br>
        limite de ciclos: ${limiteCiclosPerceptron}<br>
        ciclo atual: ${cicloAtual}<br>
        próxima amostra: ${redeTreinada ? "rede treinada" : amostrasPerceptron[indiceAmostraAtual].nome}<br><br>
        ${linhasPesos}<br>
        bias = ${F6(biasPerceptron)}`;
}

function desenharGraficoPerceptron() {
    const canvas = document.getElementById("graficoPerceptron");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const margemEsquerda = 60;
    const margemDireita = 500;
    const topo = 34;
    const base = 224;
    const largura = margemDireita - margemEsquerda;

    const seriesPesos = pesos.map((_, idx) => trajetoriaPesos.map(p => N(p.pesos[idx] ?? 0)));
    const serieBias = trajetoriaPesos.map(p => N(p.bias));
    const todosValores = [...seriesPesos.flat(), ...serieBias, 0];
    const maiorModulo = Math.max(1, ...todosValores.map(v => Math.abs(v)));
    const maxPasso = Math.max(4, trajetoriaPesos.length - 1);
    const passoY = Math.max(0.1, Math.ceil((maiorModulo / 4) * 10) / 10);
    const intervaloGradeX = maxPasso > 40 ? Math.ceil(maxPasso / 10) : 1;

    for (let passo = 0; passo <= maxPasso; passo += intervaloGradeX) {
        const x = mapearPassoParaXCartesiano(passo, maxPasso, margemEsquerda, largura);
        ctx.strokeStyle = passo === 0 ? "#475569" : "#1f2937";
        ctx.lineWidth = passo === 0 ? 1.4 : 1;
        ctx.beginPath();
        ctx.moveTo(x, topo);
        ctx.lineTo(x, base);
        ctx.stroke();
    }

    for (let valor = -maiorModulo; valor <= maiorModulo + 0.0001; valor += passoY) {
        const y = mapearValorParaYPerceptron(valor, topo, base, maiorModulo);
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
        const y = mapearValorParaYPerceptron(valor, topo, base, maiorModulo);
        ctx.fillStyle = "#64748b";
        ctx.fillText(F6(valor), 16, y + 4);
    }

    for (let passo = 0; passo <= maxPasso; passo += intervaloGradeX) {
        const x = mapearPassoParaXCartesiano(passo, maxPasso, margemEsquerda, largura);
        ctx.fillStyle = "#64748b";
        ctx.fillText(String(passo), x - 3, base + 16);
    }

    const cores = ["#38bdf8", "#22c55e", "#f59e0b", "#a78bfa", "#f97316", "#06b6d4"];
    for (let i = 0; i < seriesPesos.length; i++) {
        desenharSerie(ctx, cores[i % cores.length], seriesPesos[i], maiorModulo, topo, base, margemEsquerda, largura, maxPasso);
        ctx.fillStyle = cores[i % cores.length];
        ctx.fillText(`w${i + 1}`, 430, 30 + (i * 16));
    }

    desenharSerie(ctx, "#f472b6", serieBias, maiorModulo, topo, base, margemEsquerda, largura, maxPasso);
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

function mapearPassoParaXCartesiano(passo, maxPasso, inicioX, largura) {
    if (maxPasso <= 0) {
        return inicioX;
    }
    return inicioX + ((passo / maxPasso) * largura);
}

function mapearValorParaYPerceptron(valor, topo, base, maiorModulo) {
    const centro = (topo + base) / 2;
    const escala = ((base - topo) / 2) / maiorModulo;
    return centro - (valor * escala);
}

function desenharSerie(ctx, cor, valores, maiorModulo, topo, base, inicioX, largura, maxPasso) {
    if (valores.length === 0) {
        return;
    }
    ctx.beginPath();
    ctx.strokeStyle = cor;
    ctx.lineWidth = 2;
    for (let i = 0; i < valores.length; i++) {
        const x = mapearPassoParaXCartesiano(i, maxPasso, inicioX, largura);
        const y = mapearValorParaYPerceptron(valores[i], topo, base, maiorModulo);
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
        const x = mapearPassoParaXCartesiano(i, maxPasso, inicioX, largura);
        const y = mapearValorParaYPerceptron(valores[i], topo, base, maiorModulo);
        ctx.fillStyle = cor;
        ctx.beginPath();
        ctx.arc(x, y, desenharMarcadores ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function testarPerceptron() {
    if (historicoPassos.length === 0) {
        document.getElementById("resultadoTestePerceptron").innerHTML = "Treine a rede antes de testar.";
        return;
    }

    const dimensao = amostrasPerceptron[0].entrada.length;
    const entradaTeste = [];
    for (let i = 0; i < dimensao; i++) {
        entradaTeste.push(parseFloat(document.getElementById(`testePX${i + 1}`).value));
    }

    let soma = new Decimal(0);
    for (let i = 0; i < dimensao; i++) {
        soma = soma.plus(D6(entradaTeste[i]).times(D6(pesos[i])));
    }
    soma = soma.plus(D6(biasPerceptron));

    const yTeste = soma.greaterThanOrEqualTo(D6(limiarPerceptron)) ? 1 : -1;
    const classe = yTeste === -1 ? amostrasPerceptron[0].nome : amostrasPerceptron[1].nome;

    document.getElementById("resultadoTestePerceptron").innerHTML =
        `<strong>Teste da rede treinada</strong><br><br>
        entrada = [${entradaTeste.join(", ")}]<br>
        soma = ${F6(soma)}<br>
        saída y = ${yTeste}<br>
        classe reconhecida: <strong>${classe}</strong>`;
}

function treinarAteConvergirPerceptron() {
    if (trajetoriaPesos.length === 0) {
        iniciarTreinamentoPerceptron();
        if (trajetoriaPesos.length === 0) {
            return;
        }
    }

    if (redeTreinada) {
        document.getElementById("painelPassoPerceptron").innerHTML =
            `<strong>Rede já treinada.</strong><br><br>
            O treinamento convergiu no ciclo ${cicloAtual}.`;
        return;
    }

    const limiteInput = document.getElementById("limiteCiclosPerceptronInput");
    const limiteInformado = parseInt(limiteInput ? limiteInput.value : "1000", 10);
    if (!Number.isInteger(limiteInformado) || limiteInformado < 1) {
        document.getElementById("painelPassoPerceptron").innerHTML =
            `<strong>Limite de ciclos inválido.</strong><br><br>
            Informe um inteiro maior ou igual a 1.`;
        return;
    }
    limiteCiclosPerceptron = limiteInformado;
    treinoAutomaticoAtivo = true;
    document.getElementById("painelPassoPerceptron").innerHTML =
        `<strong>Treino automático iniciado.</strong><br><br>
        Processando até convergir ou atingir ${limiteCiclosPerceptron} ciclos...`;

    const TAMANHO_LOTE = 500;

    function executarLote() {
        let passosNoLote = 0;
        while (!redeTreinada && cicloAtual <= limiteCiclosPerceptron && passosNoLote < TAMANHO_LOTE) {
            proximaEtapaPerceptron(true);
            passosNoLote++;
        }

        atualizarEstadoPerceptron();
        desenharGraficoPerceptron();
        atualizarTabelaHistorico();

        if (redeTreinada) {
            treinoAutomaticoAtivo = false;
            irParaPrimeiraPaginaTabelaPerceptron();
            document.getElementById("painelPassoPerceptron").innerHTML =
                `<strong>Treino automático concluído.</strong><br><br>
                A rede convergiu no ciclo ${cicloAtual}.<br><br>
                <strong>Pesos finais:</strong><br>
                ${pesos.map((p, i) => `w${i + 1} = ${F6(p)}`).join("<br>")}<br>
                bias = ${F6(biasPerceptron)}`;
            return;
        }

        if (cicloAtual > limiteCiclosPerceptron) {
            treinoAutomaticoAtivo = false;
            irParaPrimeiraPaginaTabelaPerceptron();
            document.getElementById("painelPassoPerceptron").innerHTML =
                `<strong>Treino automático interrompido.</strong><br><br>
                A rede não convergiu até o limite de ${limiteCiclosPerceptron} ciclos.<br>
                Ajuste α ou aumente o limite e tente novamente.<br><br>
                <strong>Pesos atuais:</strong><br>
                ${pesos.map((p, i) => `w${i + 1} = ${F6(p)}`).join("<br>")}<br>
                bias = ${F6(biasPerceptron)}`;
            return;
        }

        document.getElementById("painelPassoPerceptron").innerHTML =
            `<strong>Treino automático em andamento...</strong><br><br>
            Ciclo ${cicloAtual} de ${limiteCiclosPerceptron}<br>
            ${formatarPesosBiasResumo()}<br>
            Histórico: ${historicoPassos.length} linhas (${obterTotalPaginasTabela()} páginas)<br><br>
            <em>A página 1 atualiza ao vivo. Use <strong>Início »</strong> para ver os pesos iniciais.</em>`;

        setTimeout(executarLote, 0);
    }

    executarLote();
}

const exercicioInicial = new URLSearchParams(window.location.search).get("exercicio");
if (exercicioInicial && EXERCICIOS_PERCEPTRON[exercicioInicial]) {
    selecionarExercicioPerceptron(exercicioInicial);
} else {
    selecionarExercicioPerceptron("base");
}
