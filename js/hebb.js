let dados = [];
let etapaAtual = 0;
let faseAtual = 0;
let portaAtual = "AND";
let modoGrafico = "pesos";

let w1 = 0;
let w2 = 0;
let bias = 0;

let historico = [];

function obterDadosPorta(porta) {
    if (porta === "AND") {
        return [
            [-1, -1, -1],
            [-1,  1, -1],
            [ 1, -1, -1],
            [ 1,  1,  1]
        ];
    }

    if (porta === "OR") {
        return [
            [-1, -1, -1],
            [-1,  1,  1],
            [ 1, -1,  1],
            [ 1,  1,  1]
        ];
    }

    if (porta === "NAND") {
        return [
            [-1, -1,  1],
            [-1,  1,  1],
            [ 1, -1,  1],
            [ 1,  1, -1]
        ];
    }

    if (porta === "NOR") {
        return [
            [-1, -1,  1],
            [-1,  1, -1],
            [ 1, -1, -1],
            [ 1,  1, -1]
        ];
    }

    if (porta === "XNOR") {
        return [
            [-1, -1,  1],
            [-1,  1, -1],
            [ 1, -1, -1],
            [ 1,  1,  1]
        ];
    }

    if (porta === "NOT") {
        return [
            [-1, 0,  1],
            [ 1, 0, -1]
        ];
    }

    return [
        [-1, -1, -1],
        [-1,  1,  1],
        [ 1, -1,  1],
        [ 1,  1, -1]
    ];
}

function iniciarTreinamento() {
    const porta = document.getElementById("porta").value;
    portaAtual = porta;

    if (porta === "XOR") {
        modoGrafico = "pesos";
    }

    dados = obterDadosPorta(porta);
    etapaAtual = 0;
    faseAtual = 0;

    w1 = 0;
    w2 = 0;
    bias = 0;
    historico = [];

    document.getElementById("corpoTabela").innerHTML = "";
    document.getElementById("resultadoTeste").innerHTML = "Treinamento iniciado. Avance as etapas.";
    atualizarVisual(0, 0, 0);

    document.getElementById("painelPasso").innerHTML =
        `<strong>Treinamento iniciado para a porta ${porta}.</strong><br><br>
        A rede começará com pesos zerados:<br>
        w1 = 0, w2 = 0 e bias = 0.<br><br>
        Clique em <strong>Próxima etapa</strong> para acompanhar o aprendizado.`;

    if (porta === "XOR") {
        document.getElementById("painelPasso").innerHTML +=
            `<br><br><strong>Observação importante:</strong><br>
            XOR não é linearmente separável com um único neurônio.
            O gráfico mostra que não existe uma reta separando perfeitamente as classes.`;
    }

    if (porta === "XNOR") {
        document.getElementById("painelPasso").innerHTML +=
            `<br><br><strong>Observação importante:</strong><br>
            XNOR também não é linearmente separável com um único neurônio.
            A fronteira linear não consegue separar perfeitamente as classes.`;
    }

    if (porta === "NOT") {
        document.getElementById("painelPasso").innerHTML +=
            `<br><br><strong>Observação importante:</strong><br>
            Para manter o modelo com duas entradas, usamos x2 = 0 como entrada auxiliar.
            Assim, o comportamento lógico depende apenas de x1.`;
    }

    atualizarBotoesModoGrafico();
    desenharGrafico();
}

function proximaEtapa() {
    if (dados.length === 0) {
        document.getElementById("painelPasso").innerHTML =
            "Primeiro escolha uma porta lógica e clique em <strong>Iniciar treinamento</strong>.";
        return;
    }

    if (etapaAtual >= dados.length) {
        document.getElementById("painelPasso").innerHTML =
            `<strong>Treinamento finalizado.</strong><br><br>
            Pesos finais:<br>
            w1 = ${w1}<br>
            w2 = ${w2}<br>
            bias = ${bias}<br><br>
            Agora você pode testar a rede treinada.`;
        return;
    }

    const amostra = dados[etapaAtual];
    const x1 = amostra[0];
    const x2 = amostra[1];
    const y = amostra[2];

    const soma = (x1 * w1) + (x2 * w2) + bias;
    const ativacao = soma >= 0 ? 1 : -1;

    if (faseAtual === 0) {
        atualizarVisual(x1, x2, "?");

        document.getElementById("painelPasso").innerHTML =
            `<strong>Amostra ${etapaAtual + 1}</strong><br><br>
            A rede recebeu as entradas:<br>
            x1 = ${x1}<br>
            x2 = ${x2}<br><br>
            A saída associada no treinamento é:<br>
            y = ${y}`;

        faseAtual++;
        return;
    }

    if (faseAtual === 1) {
        document.getElementById("painelPasso").innerHTML =
            `<strong>Combinação linear</strong><br><br>
            A rede multiplica cada entrada pelo seu peso e soma o bias:<br><br>
            soma = (x1 × w1) + (x2 × w2) + bias<br><br>
            soma = (${x1} × ${w1}) + (${x2} × ${w2}) + ${bias}<br>
            soma = ${soma}`;

        ativarNeuronio();
        faseAtual++;
        return;
    }

    if (faseAtual === 2) {
        atualizarVisual(x1, x2, ativacao);

        document.getElementById("painelPasso").innerHTML =
            `<strong>Função de ativação</strong><br><br>
            Usamos a função degrau bipolar:<br><br>
            se soma ≥ 0, saída = 1<br>
            se soma &lt; 0, saída = -1<br><br>
            Como soma = ${soma}, a saída calculada foi:<br>
            saída = ${ativacao}`;

        faseAtual++;
        return;
    }

    if (faseAtual === 3) {
        const novoW1 = w1 + (x1 * y);
        const novoW2 = w2 + (x2 * y);
        const novoBias = bias + y;

        document.getElementById("painelPasso").innerHTML =
            `<strong>Regra de Hebb</strong><br><br>
            Agora os pesos são reforçados pela associação entre entrada e saída:<br><br>
            w1 = w1 + (x1 × y)<br>
            w1 = ${w1} + (${x1} × ${y}) = ${novoW1}<br><br>
            w2 = w2 + (x2 × y)<br>
            w2 = ${w2} + (${x2} × ${y}) = ${novoW2}<br><br>
            bias = bias + y<br>
            bias = ${bias} + ${y} = ${novoBias}`;

        w1 = novoW1;
        w2 = novoW2;
        bias = novoBias;

        historico.push({
            amostra: etapaAtual + 1,
            x1: x1,
            x2: x2,
            y: y,
            w1: w1,
            w2: w2,
            bias: bias
        });

        adicionarLinhaTabela();
        atualizarVisual(x1, x2, y);
        desenharGrafico();

        etapaAtual++;
        faseAtual = 0;
        return;
    }
}

function atualizarVisual(x1, x2, saida) {
    document.getElementById("noX1").innerHTML = "x1<br>" + x1;
    document.getElementById("noX2").innerHTML = "x2<br>" + x2;
    document.getElementById("noSaida").innerHTML = "y<br>" + saida;

    document.getElementById("labelW1").innerHTML = "w1 = " + w1;
    document.getElementById("labelW2").innerHTML = "w2 = " + w2;
    document.getElementById("labelBias").innerHTML = "bias = " + bias;

    const linhaW1 = document.getElementById("linhaW1");
    const linhaW2 = document.getElementById("linhaW2");
    const linhaSaida = document.getElementById("linhaSaida");

    linhaW1.className = "ligacao l1";
    linhaW2.className = "ligacao l2";
    linhaSaida.className = "ligacao l3";

    if (w1 !== 0) {
        linhaW1.classList.add("forte");
    }

    if (w2 !== 0) {
        linhaW2.classList.add("forte");
    }

    if (w1 < 0) {
        linhaW1.classList.add("negativa");
    }

    if (w2 < 0) {
        linhaW2.classList.add("negativa");
    }

    if (saida === 1) {
        linhaSaida.classList.add("forte");
    }

    const noX1 = document.getElementById("noX1");
    const noX2 = document.getElementById("noX2");
    const noNeuronio = document.getElementById("noNeuronio");
    const noSaida = document.getElementById("noSaida");

    noX1.classList.remove("ativo");
    noX2.classList.remove("ativo");
    noNeuronio.classList.remove("ativo");
    noSaida.classList.remove("ativo");

    if (x1 === 1) {
        noX1.classList.add("ativo");
    }

    if (x2 === 1) {
        noX2.classList.add("ativo");
    }

    if (saida === 1) {
        noSaida.classList.add("ativo");
    }
}

function ativarNeuronio() {
    document.getElementById("noNeuronio").classList.add("ativo");
}

function adicionarLinhaTabela() {
    const ultimo = historico[historico.length - 1];

    const linha = `
        <tr>
            <td>${ultimo.amostra}</td>
            <td>${ultimo.x1}</td>
            <td>${ultimo.x2}</td>
            <td>${ultimo.y}</td>
            <td>${ultimo.w1}</td>
            <td>${ultimo.w2}</td>
            <td>${ultimo.bias}</td>
        </tr>
    `;

    document.getElementById("corpoTabela").innerHTML += linha;
}

function desenharGrafico() {
    if (modoGrafico === "fronteira") {
        desenharFronteiraDecisao();
        return;
    }

    if ((portaAtual === "XOR" || portaAtual === "XNOR") && historico.length === 0) {
        desenharGraficoXOR();
        return;
    }

    desenharGraficoPesos();
}

function definirModoGrafico(modo) {
    modoGrafico = modo;
    atualizarBotoesModoGrafico();
    desenharGrafico();
}

function atualizarBotoesModoGrafico() {
    const btnPesos = document.getElementById("btnModoPesos");
    const btnFronteira = document.getElementById("btnModoFronteira");

    if (!btnPesos || !btnFronteira) {
        return;
    }

    btnPesos.classList.remove("ativo");
    btnFronteira.classList.remove("ativo");

    if (modoGrafico === "pesos") {
        btnPesos.classList.add("ativo");
    } else {
        btnFronteira.classList.add("ativo");
    }
}

function desenharGraficoPesos() {
    const canvas = document.getElementById("graficoPesos");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const margemEsquerda = 60;
    const margemDireita = 500;
    const topo = 34;
    const base = 224;
    const largura = margemDireita - margemEsquerda;
    const etapas = [0, ...historico.map((_, i) => i + 1)];
    const serieW1 = [0, ...historico.map(h => h.w1)];
    const serieW2 = [0, ...historico.map(h => h.w2)];
    const serieBias = [0, ...historico.map(h => h.bias)];
    const todosValores = [...serieW1, ...serieW2, ...serieBias, 0];
    const maiorModulo = Math.max(1, ...todosValores.map(v => Math.abs(v)));
    const maxEtapa = Math.max(4, etapas[etapas.length - 1]);
    const passoY = Math.max(1, Math.ceil(maiorModulo / 4));

    for (let etapa = 0; etapa <= maxEtapa; etapa++) {
        const x = mapearEtapaParaX(etapa, maxEtapa, margemEsquerda, largura);
        ctx.strokeStyle = etapa === 0 ? "#475569" : "#1f2937";
        ctx.lineWidth = etapa === 0 ? 1.4 : 1;
        ctx.beginPath();
        ctx.moveTo(x, topo);
        ctx.lineTo(x, base);
        ctx.stroke();
    }

    for (let valor = -maiorModulo; valor <= maiorModulo; valor += passoY) {
        const y = mapearValorParaY(valor, topo, base, maiorModulo);
        ctx.strokeStyle = valor === 0 ? "#475569" : "#1f2937";
        ctx.lineWidth = valor === 0 ? 1.4 : 1;
        ctx.beginPath();
        ctx.moveTo(margemEsquerda, y);
        ctx.lineTo(margemDireita, y);
        ctx.stroke();
    }

    ctx.fillStyle = "#e5e7eb";
    ctx.fillText("Plano cartesiano da evolucao dos pesos", margemEsquerda, 16);

    ctx.fillStyle = "#94a3b8";
    ctx.fillText("X = etapa | Y = valor do peso", 326, 16);

    for (let valor = -maiorModulo; valor <= maiorModulo; valor += passoY) {
        const y = mapearValorParaY(valor, topo, base, maiorModulo);
        ctx.fillStyle = "#64748b";
        ctx.fillText(String(valor), 18, y + 4);
    }

    for (let etapa = 0; etapa <= maxEtapa; etapa++) {
        const x = mapearEtapaParaX(etapa, maxEtapa, margemEsquerda, largura);
        ctx.fillStyle = "#64748b";
        ctx.fillText(String(etapa), x - 3, base + 16);
    }

    desenharLinhaGrafico(ctx, "#38bdf8", etapas, serieW1, maiorModulo, topo, base, margemEsquerda, largura, maxEtapa);
    desenharLinhaGrafico(ctx, "#22c55e", etapas, serieW2, maiorModulo, topo, base, margemEsquerda, largura, maxEtapa);
    desenharLinhaGrafico(ctx, "#f472b6", etapas, serieBias, maiorModulo, topo, base, margemEsquerda, largura, maxEtapa);

    ctx.fillStyle = "#38bdf8";
    ctx.fillText("w1", 430, 34);

    ctx.fillStyle = "#22c55e";
    ctx.fillText("w2", 430, 54);

    ctx.fillStyle = "#f472b6";
    ctx.fillText("bias", 430, 74);

    ctx.fillStyle = "#94a3b8";
    ctx.fillText("etapa", 472, 240);
    ctx.save();
    ctx.translate(8, 40);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("valor", 0, 0);
    ctx.restore();
}

function mapearEtapaParaX(etapa, maxEtapa, inicioX, largura) {
    if (maxEtapa <= 0) {
        return inicioX;
    }

    return inicioX + ((etapa / maxEtapa) * largura);
}

function mapearValorParaY(valor, topo, base, maiorModulo) {
    const centro = (topo + base) / 2;
    const escala = ((base - topo) / 2) / maiorModulo;
    return centro - (valor * escala);
}

function desenharLinhaGrafico(ctx, cor, etapas, valores, maiorModulo, topo, base, inicioX, largura, maxEtapa) {
    if (valores.length === 0) {
        return;
    }

    ctx.beginPath();
    ctx.strokeStyle = cor;
    ctx.lineWidth = 2;

    for (let i = 0; i < valores.length; i++) {
        const x = mapearEtapaParaX(etapas[i], maxEtapa, inicioX, largura);
        const y = mapearValorParaY(valores[i], topo, base, maiorModulo);

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();

    for (let i = 0; i < valores.length; i++) {
        const x = mapearEtapaParaX(etapas[i], maxEtapa, inicioX, largura);
        const y = mapearValorParaY(valores[i], topo, base, maiorModulo);

        ctx.fillStyle = cor;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillText(valores[i], x - 5, y - 10);
    }
}

function desenharGraficoXOR() {
    const canvas = document.getElementById("graficoPesos");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const margemEsquerda = 70;
    const margemDireita = 475;
    const topo = 34;
    const base = 224;
    const centroX = (margemEsquerda + margemDireita) / 2;
    const centroY = (topo + base) / 2;
    const escalaX = ((margemDireita - margemEsquerda) / 2) - 34;
    const escalaY = ((base - topo) / 2) - 18;

    const mapX = (v) => centroX + (v * escalaX);
    const mapY = (v) => centroY - (v * escalaY);

    for (let valor = -1; valor <= 1; valor++) {
        const x = mapX(valor);
        const y = mapY(valor);

        ctx.strokeStyle = valor === 0 ? "#475569" : "#1f2937";
        ctx.lineWidth = valor === 0 ? 1.6 : 1;

        ctx.beginPath();
        ctx.moveTo(x, topo);
        ctx.lineTo(x, base);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(margemEsquerda, y);
        ctx.lineTo(margemDireita, y);
        ctx.stroke();
    }

    ctx.fillStyle = "#e5e7eb";
    const tituloPorta = portaAtual === "XNOR" ? "XNOR" : "XOR";
    ctx.fillText(`Plano cartesiano da porta ${tituloPorta}`, margemEsquerda, 16);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("x1 no eixo X | x2 no eixo Y", 340, 16);

    const pontos = dados.length > 0 ? dados.map(a => ({ x1: a[0], x2: a[1], y: a[2] })) : [
        { x1: -1, x2: -1, y: -1 },
        { x1: -1, x2:  1, y:  1 },
        { x1:  1, x2: -1, y:  1 },
        { x1:  1, x2:  1, y: -1 }
    ];

    for (const p of pontos) {
        const x = mapX(p.x1);
        const y = mapY(p.x2);
        const cor = p.y === 1 ? "#22c55e" : "#fb7185";

        ctx.beginPath();
        ctx.fillStyle = cor;
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#cbd5e1";
        ctx.fillText(`(${p.x1}, ${p.x2})`, x - 20, y - 12);
    }

    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(margemEsquerda + 40, topo + 18);
    ctx.lineTo(margemDireita - 40, base - 18);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#fbbf24";
    ctx.fillText("Nenhuma reta separa perfeitamente as duas classes.", 230, 212);

    ctx.fillStyle = "#64748b";
    ctx.fillText("-1", mapX(-1) - 7, centroY + 16);
    ctx.fillText("0", mapX(0) - 4, centroY + 16);
    ctx.fillText("1", mapX(1) - 4, centroY + 16);
    ctx.fillText("-1", centroX + 8, mapY(-1) + 4);
    ctx.fillText("0", centroX + 8, mapY(0) + 4);
    ctx.fillText("1", centroX + 8, mapY(1) + 4);
    ctx.fillText("x1", margemDireita + 8, centroY + 4);
    ctx.fillText("x2", centroX + 8, topo - 8);
}

function desenharFronteiraDecisao() {
    const canvas = document.getElementById("graficoPesos");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const margemEsquerda = 70;
    const margemDireita = 475;
    const topo = 34;
    const base = 224;
    const centroX = (margemEsquerda + margemDireita) / 2;
    const centroY = (topo + base) / 2;
    const escalaX = ((margemDireita - margemEsquerda) / 2) - 34;
    const escalaY = ((base - topo) / 2) - 18;

    const mapX = (v) => centroX + (v * escalaX);
    const mapY = (v) => centroY - (v * escalaY);

    for (let valor = -1; valor <= 1; valor++) {
        const x = mapX(valor);
        const y = mapY(valor);

        ctx.strokeStyle = valor === 0 ? "#475569" : "#1f2937";
        ctx.lineWidth = valor === 0 ? 1.6 : 1;

        ctx.beginPath();
        ctx.moveTo(x, topo);
        ctx.lineTo(x, base);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(margemEsquerda, y);
        ctx.lineTo(margemDireita, y);
        ctx.stroke();
    }

    const pontos = dados.length > 0 ? dados : obterDadosPorta(portaAtual);
    for (const ponto of pontos) {
        const x = mapX(ponto[0]);
        const y = mapY(ponto[1]);
        const cor = ponto[2] === 1 ? "#22c55e" : "#fb7185";

        ctx.beginPath();
        ctx.fillStyle = cor;
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#cbd5e1";
        ctx.fillText(`(${ponto[0]}, ${ponto[1]})`, x - 20, y - 12);
    }

    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);

    let legendaLinha = "";
    if (w2 !== 0) {
        const xInicio = -1.2;
        const xFim = 1.2;
        const yInicio = ((-w1 * xInicio) - bias) / w2;
        const yFim = ((-w1 * xFim) - bias) / w2;

        ctx.beginPath();
        ctx.moveTo(mapX(xInicio), mapY(yInicio));
        ctx.lineTo(mapX(xFim), mapY(yFim));
        ctx.stroke();
        legendaLinha = `y = (${(-w1).toFixed(2)}x - ${bias.toFixed(2)}) / ${w2.toFixed(2)}`;
    } else if (w1 !== 0) {
        const xVertical = (-bias) / w1;
        ctx.beginPath();
        ctx.moveTo(mapX(xVertical), mapY(-1.2));
        ctx.lineTo(mapX(xVertical), mapY(1.2));
        ctx.stroke();
        legendaLinha = `x = ${xVertical.toFixed(2)}`;
    } else {
        legendaLinha = "fronteira indefinida (w1 = 0 e w2 = 0)";
    }

    ctx.setLineDash([]);

    ctx.fillStyle = "#e5e7eb";
    ctx.fillText(`Fronteira de decisao atual - ${portaAtual}`, margemEsquerda, 16);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("w1*x1 + w2*x2 + bias = 0", 328, 16);

    ctx.fillStyle = "#fbbf24";
    ctx.fillText(legendaLinha, 220, 212);

    if (portaAtual === "XOR" || portaAtual === "XNOR") {
        ctx.fillStyle = "#fda4af";
        ctx.fillText(`Na ${portaAtual}, a reta sempre vai errar pelo menos um ponto.`, 170, 232);
    }

    ctx.fillStyle = "#64748b";
    ctx.fillText("-1", mapX(-1) - 7, centroY + 16);
    ctx.fillText("0", mapX(0) - 4, centroY + 16);
    ctx.fillText("1", mapX(1) - 4, centroY + 16);
    ctx.fillText("-1", centroX + 8, mapY(-1) + 4);
    ctx.fillText("0", centroX + 8, mapY(0) + 4);
    ctx.fillText("1", centroX + 8, mapY(1) + 4);
    ctx.fillText("x1", margemDireita + 8, centroY + 4);
    ctx.fillText("x2", centroX + 8, topo - 8);
}

function testarRede() {
    if (historico.length === 0) {
        document.getElementById("resultadoTeste").innerHTML =
            "Treine a rede antes de testar.";
        return;
    }

    const x1 = parseInt(document.getElementById("testeX1").value);
    const x2 = parseInt(document.getElementById("testeX2").value);

    const soma = (x1 * w1) + (x2 * w2) + bias;
    const saida = soma >= 0 ? 1 : -1;

    atualizarVisual(x1, x2, saida);
    ativarNeuronio();

    document.getElementById("resultadoTeste").innerHTML =
        `<strong>Teste da rede treinada</strong><br><br>
        soma = (x1 × w1) + (x2 × w2) + bias<br><br>
        soma = (${x1} × ${w1}) + (${x2} × ${w2}) + ${bias}<br>
        soma = ${soma}<br><br>
        Aplicando função degrau bipolar:<br>
        saída = ${saida}`;
}

atualizarBotoesModoGrafico();