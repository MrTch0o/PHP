let dados = [];
let etapaAtual = 0;
let faseAtual = 0;

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

    return [
        [-1, -1, -1],
        [-1,  1,  1],
        [ 1, -1,  1],
        [ 1,  1, -1]
    ];
}

function iniciarTreinamento() {
    const porta = document.getElementById("porta").value;

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
    const canvas = document.getElementById("graficoPesos");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, 220);
    ctx.lineTo(500, 220);
    ctx.stroke();

    ctx.fillStyle = "#e5e7eb";
    ctx.fillText("Evolução", 40, 15);

    desenharLinhaGrafico(ctx, "w1", "#38bdf8", historico.map(h => h.w1));
    desenharLinhaGrafico(ctx, "w2", "#22c55e", historico.map(h => h.w2));
    desenharLinhaGrafico(ctx, "bias", "#f472b6", historico.map(h => h.bias));

    ctx.fillStyle = "#38bdf8";
    ctx.fillText("w1", 430, 30);

    ctx.fillStyle = "#22c55e";
    ctx.fillText("w2", 430, 50);

    ctx.fillStyle = "#f472b6";
    ctx.fillText("bias", 430, 70);
}

function desenharLinhaGrafico(ctx, nome, cor, valores) {
    if (valores.length === 0) {
        return;
    }

    ctx.beginPath();
    ctx.strokeStyle = cor;
    ctx.lineWidth = 2;

    for (let i = 0; i < valores.length; i++) {
        const x = 70 + (i * 90);
        const y = 120 - (valores[i] * 25);

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        ctx.fillStyle = cor;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillText(valores[i], x - 5, y - 10);
    }

    ctx.stroke();
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