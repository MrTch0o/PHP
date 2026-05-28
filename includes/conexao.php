<?php
try {
    $pdo = new PDO("sqlite:" . __DIR__ . "/../banco/database.sqlite");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS experimentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            algoritmo TEXT NOT NULL,
            titulo TEXT,
            parametros TEXT,
            resultado TEXT,
            ip_usuario TEXT,
            data_criacao TEXT
        );

        CREATE TABLE IF NOT EXISTS conteudos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            algoritmo TEXT NOT NULL,
            texto TEXT NOT NULL,
            ordem INTEGER
        );
    ");

    $stmt = $pdo->query("SELECT COUNT(*) FROM usuarios");
    $total = $stmt->fetchColumn();

    if ($total == 0) {
        $senha = password_hash("123456", PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("
            INSERT INTO usuarios (nome, email, senha)
            VALUES (:nome, :email, :senha)
        ");

        $stmt->execute([
            ":nome" => "Administrador",
            ":email" => "admin@iclab.com",
            ":senha" => $senha
        ]);
    }

} catch (PDOException $e) {
    die("Erro na conexão com o banco: " . $e->getMessage());
}
?>