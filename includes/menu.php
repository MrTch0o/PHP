<nav class="menu">
    <a href="index.php">Início</a>
    <a href="simulador.php?algoritmo=hebb">Regra de Hebb</a>
    <a href="simulador.php?algoritmo=perceptron">Perceptron Simples</a>
    <a href="simulador.php?algoritmo=adaline">Adaline</a>
    <a href="simulador.php?algoritmo=mlp">MLP Básico</a>
    <a href="historico.php">Histórico</a>

    <?php if (isset($_SESSION["usuario_id"])): ?>
        <a href="admin/conteudos.php">Admin</a>
        <a href="logout.php">Sair</a>
    <?php else: ?>
        <a href="login.php">Login</a>
    <?php endif; ?>
</nav>

<main class="conteudo">