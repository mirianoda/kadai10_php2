<?php
// APIキー（サーバー側で管理）
$apiKey = "AIzaSyD_ASTpi0mKIWoZKka2UBlrjCLEX0r3apo";

// クエリを取得
$query = $_GET["query"] ?? "";

// APIリクエスト
$url = "https://www.googleapis.com/books/v1/volumes?q=" . urlencode($query) . "&langRestrict=ja&key=" . $apiKey;

// Google Books APIへのリクエスト
$response = file_get_contents($url);

// レスポンスをそのまま出力
header("Content-Type: application/json");
echo $response;
