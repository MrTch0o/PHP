const EXERCICIOS_PERCEPTRON = {
    base: {
        nome: "Modelo do professor (4 entradas)",
        descricao: "Duas amostras A/B com 4 entradas cada. Pesos iniciam aleatórios em [-0.5, +0.5].",
        entradas: [
            { nome: "A", entrada: [-1, -1, 1, 1], target: -1 },
            { nome: "B", entrada: [1, -1, 1, -1], target: 1 }
        ],
        pesosFixos: null,
        biasFixo: null
    },
    proximo: {
        nome: "Exercício padrões próximos (2 entradas)",
        descricao: "Padrões [1,1] e [1,1.00001]. Pesos também iniciam aleatórios em [-0.5, +0.5].",
        entradas: [
            { nome: "P1", entrada: [1.0, 1.0], target: -1 },
            { nome: "P2", entrada: [1.0, 1.00001], target: 1 }
        ],
        pesosFixos: null,
        biasFixo: null
    }
};

let exercicioAtualChave = "base";
let exercicioAtual = EXERCICIOS_PERCEPTRON.base;
let amostrasPerceptron = exercicioAtual.entradas;

let pesos = [];
let biasPerceptron = 0;
let alfaPerceptron = 0.01;
let limiarPerceptron = 0;
let limiteCiclosPerceptron = 1000;

let indiceAmostraAtual = 0;
let cicloAtual = 1;
let houveErroNoCiclo = false;
let redeTreinada = false;
let treinoAutomaticoAtivo = false;

let historicoPassos = [];
let trajetoriaPesos = [];

function gerarPesoAleatorio() {
    return Math.random() - 0.5;
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
    pesos = Array(dimensao).fill(0);
    biasPerceptron = 0;
    indiceAmostraAtual = 0;
    cicloAtual = 1;
    houveErroNoCiclo = false;
    redeTreinada = false;
    treinoAutomaticoAtivo = false;
    historicoPassos = [];
    trajetoriaPesos = [];

    const corpo = document.getElementById("corpoTabelaPerceptron");
    if (corpo) {
        corpo.innerHTML = "";
    }

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
        pesos = [...exercicioAtual.pesosFixos];
        biasPerceptron = exercicioAtual.biasFixo;
    } else {
        pesos = Array(amostrasPerceptron[0].entrada.length).fill(0).map(() => gerarPesoAleatorio());
        biasPerceptron = gerarPesoAleatorio();
    }

    const alfaInput = document.getElementById("alfaPerceptronInput");
    const alfaInformado = parseFloat(alfaInput ? alfaInput.value : "0.01");
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

    alfaPerceptron = alfaInformado;
    limiteCiclosPerceptron = limiteInformado;
    limiarPerceptron = 0;
    indiceAmostraAtual = 0;
    cicloAtual = 1;
    houveErroNoCiclo = false;
    redeTreinada = false;
    treinoAutomaticoAtivo = false;
    historicoPassos = [];
    trajetoriaPesos = [{ passo: 0, pesos: [...pesos], bias: biasPerceptron }];

    document.getElementById("corpoTabelaPerceptron").innerHTML = "";
    document.getElementById("resultadoTestePerceptron").innerHTML =
        "Treinamento iniciado. Avance as etapas para acompanhar os ciclos.";
    document.getElementById("painelPassoPerceptron").innerHTML =
        `<strong>Treinamento iniciado.</strong><br><br>
        Exercício: ${exercicioAtual.nome}<br>
        Ciclo atual: ${cicloAtual}<br>
        Próxima amostra: ${amostrasPerceptron[indiceAmostraAtual].nome}<br><br>
        Clique em <strong>Próxima etapa</strong> para processar a amostra.`;

    atualizarEstadoPerceptron();
    desenharGraficoPerceptron();
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

    const amostra = amostrasPerceptron[indiceAmostraAtual];
    const entrada = amostra.entrada;
    const target = amostra.target;
    const dimensao = entrada.length;

    let yLiq = 0;
    for (let i = 0; i < dimensao; i++) {
        yLiq += entrada[i] * pesos[i];
    }
    yLiq += biasPerceptron;

    const y = yLiq >= limiarPerceptron ? 1 : -1;
    const errou = y !== target;
    const diferenca = target - y;
    const pesosAntes = [...pesos];
    const biasAntes = biasPerceptron;

    if (errou) {
        houveErroNoCiclo = true;
        for (let i = 0; i < dimensao; i++) {
            pesos[i] = pesos[i] + (alfaPerceptron * diferenca * entrada[i]);
        }
        biasPerceptron = biasPerceptron + (alfaPerceptron * diferenca);
    }

    historicoPassos.push({
        ciclo: cicloAtual,
        amostra: amostra.nome,
        entradas: [...entrada],
        yLiq,
        y,
        target,
        erro: errou,
        pesos: [...pesos],
        bias: biasPerceptron
    });

    trajetoriaPesos.push({ passo: trajetoriaPesos.length, pesos: [...pesos], bias: biasPerceptron });

    adicionarLinhaTabelaPerceptron();
    atualizarEstadoPerceptron();
    desenharGraficoPerceptron();

    let textoCorrecao = "Não houve correção de pesos (saída correta).";
    if (errou) {
        textoCorrecao = `Houve erro. Δ = α × (target - y) = ${alfaPerceptron} × (${target} - ${y}) = ${(alfaPerceptron * diferenca).toFixed(4)}<br>`;
        for (let i = 0; i < dimensao; i++) {
            textoCorrecao += `w${i + 1}: ${pesosAntes[i].toFixed(4)} → ${pesos[i].toFixed(4)}<br>`;
        }
        textoCorrecao += `b: ${biasAntes.toFixed(4)} → ${biasPerceptron.toFixed(4)}`;
    }

    let mensagemFimCiclo = "";
    indiceAmostraAtual++;
    if (indiceAmostraAtual >= amostrasPerceptron.length) {
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

    document.getElementById("painelPassoPerceptron").innerHTML =
        `<strong>Ciclo ${historicoPassos[historicoPassos.length - 1].ciclo} - Amostra ${amostra.nome}</strong><br><br>
        entradas = [${entrada.join(", ")}]<br>
        target = ${target}<br>
        yLiq = ${yLiq.toFixed(5)}<br>
        y = ${y}<br>
        erro = ${errou ? "sim" : "não"}<br><br>
        ${textoCorrecao}
        ${mensagemFimCiclo}`;
}

function atualizarEstadoPerceptron() {
    const linhasPesos = pesos.map((p, i) => `w${i + 1} = ${p.toFixed(5)}`).join("<br>");
    document.getElementById("estadoPerceptron").innerHTML =
        `<strong>Parâmetros atuais</strong><br><br>
        exercício: ${exercicioAtual.nome}<br>
        α atual: ${alfaPerceptron}<br>
        limite de ciclos: ${limiteCiclosPerceptron}<br>
        ciclo atual: ${cicloAtual}<br>
        próxima amostra: ${redeTreinada ? "rede treinada" : amostrasPerceptron[indiceAmostraAtual].nome}<br><br>
        ${linhasPesos}<br>
        bias = ${biasPerceptron.toFixed(5)}`;
}

function adicionarLinhaTabelaPerceptron() {
    const ultimo = historicoPassos[historicoPassos.length - 1];
    let linha = `<tr><td>${ultimo.ciclo}</td><td>${ultimo.amostra}</td><td>${ultimo.yLiq.toFixed(5)}</td><td>${ultimo.y}</td><td>${ultimo.target}</td><td>${ultimo.erro ? "Sim" : "Não"}</td>`;

    for (const x of ultimo.entradas) {
        linha += `<td>${x}</td>`;
    }
    for (const w of ultimo.pesos) {
        linha += `<td>${w.toFixed(5)}</td>`;
    }
    linha += `<td>${ultimo.bias.toFixed(5)}</td></tr>`;

    document.getElementById("corpoTabelaPerceptron").innerHTML += linha;
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

    const seriesPesos = pesos.map((_, idx) => trajetoriaPesos.map(p => p.pesos[idx] ?? 0));
    const serieBias = trajetoriaPesos.map(p => p.bias);
    const todosValores = [...seriesPesos.flat(), ...serieBias, 0];
    const maiorModulo = Math.max(1, ...todosValores.map(v => Math.abs(v)));
    const maxPasso = Math.max(4, trajetoriaPesos.length - 1);
    const passoY = Math.max(0.1, Math.ceil((maiorModulo / 4) * 10) / 10);

    for (let passo = 0; passo <= maxPasso; passo++) {
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
        ctx.fillText(valor.toFixed(1), 16, y + 4);
    }

    for (let passo = 0; passo <= maxPasso; passo++) {
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

    for (let i = 0; i < valores.length; i++) {
        const x = mapearPassoParaXCartesiano(i, maxPasso, inicioX, largura);
        const y = mapearValorParaYPerceptron(valores[i], topo, base, maiorModulo);
        ctx.fillStyle = cor;
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
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

    let soma = 0;
    for (let i = 0; i < dimensao; i++) {
        soma += entradaTeste[i] * pesos[i];
    }
    soma += biasPerceptron;

    const yTeste = soma >= limiarPerceptron ? 1 : -1;
    const classe = yTeste === -1 ? amostrasPerceptron[0].nome : amostrasPerceptron[1].nome;

    document.getElementById("resultadoTestePerceptron").innerHTML =
        `<strong>Teste da rede treinada</strong><br><br>
        entrada = [${entradaTeste.join(", ")}]<br>
        soma = ${soma.toFixed(5)}<br>
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

    const TAMANHO_LOTE = 120;

    function executarLote() {
        let passosNoLote = 0;
        while (!redeTreinada && cicloAtual <= limiteCiclosPerceptron && passosNoLote < TAMANHO_LOTE) {
            proximaEtapaPerceptron(true);
            passosNoLote++;
        }

        if (redeTreinada) {
            treinoAutomaticoAtivo = false;
            document.getElementById("painelPassoPerceptron").innerHTML =
                `<strong>Treino automático concluído.</strong><br><br>
                A rede convergiu no ciclo ${cicloAtual}.`;
            return;
        }

        if (cicloAtual > limiteCiclosPerceptron) {
            treinoAutomaticoAtivo = false;
            document.getElementById("painelPassoPerceptron").innerHTML =
                `<strong>Treino automático interrompido.</strong><br><br>
                A rede não convergiu até o limite de ${limiteCiclosPerceptron} ciclos.<br>
                Ajuste α ou aumente o limite e tente novamente.`;
            return;
        }

        setTimeout(executarLote, 0);
    }

    executarLote();
}

selecionarExercicioPerceptron("base");
