<?php
include "includes/conexao.php";

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$erro = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST["email"] ?? "";
    $senha = $_POST["senha"] ?? "";

    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = :email");
    $stmt->execute([":email" => $email]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($usuario && password_verify($senha, $usuario["senha"])) {
        $_SESSION["usuario_id"] = $usuario["id"];
        $_SESSION["usuario_nome"] = $usuario["nome"];

        setcookie("ultimo_email", $email, time() + 3600 * 24 * 7);

        header("Location: index.php");
        exit;
    } else {
        $erro = "E-mail ou senha inválidos.";
    }
}

include "includes/topo.php";
include "includes/menu.php";
?>

<h2>Login</h2>

<?php if ($erro != ""): ?>
    <div class="erro"><?php echo $erro; ?></div>
<?php endif; ?>

<form method="POST" action="login.php">
    <label>E-mail:</label>
    <input type="email" name="email" value="<?php echo $_COOKIE['ultimo_email'] ?? ''; ?>" required>

    <label>Senha:</label>
    <input type="password" name="senha" required>

    <button type="submit">Entrar</button>
</form>

<div class="card">
    <p><strong>Usuário inicial:</strong> admin@iclab.com</p>
    <p><strong>Senha:</strong> 123456</p>
</div>

<?php include "includes/rodape.php"; ?>