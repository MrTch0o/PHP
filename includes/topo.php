<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$paginaAtual = basename($_SERVER["PHP_SELF"] ?? "");
$paginasPublicas = ["login.php"];

if (!in_array($paginaAtual, $paginasPublicas, true)) {
    include_once __DIR__ . "/verifica_login.php";
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>ICLab - Laboratório de Inteligência Computacional</title>
    <link rel="stylesheet" href="css/estilo.css">
    <script src="https://cdn.jsdelivr.net/npm/decimal.js@10.4.3/decimal.min.js"></script>
</head>
<body>

<header class="topo">
    <h1>ICLab</h1>
    <p>Laboratório de Inteligência Computacional</p>
</header>

<div class="container">