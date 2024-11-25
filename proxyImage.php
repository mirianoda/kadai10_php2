<?php
// URLパラメータが存在するか確認
if (!isset($_GET['url'])) {
    header("HTTP/1.1 400 Bad Request");
    echo "Missing 'url' parameter";
    exit;
}

// Google Booksの画像URLを取得
$imageUrl = $_GET['url'];

// cURLを使ってリクエスト
$ch = curl_init($imageUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$response = curl_exec($ch);

if ($response === false) {
    header("HTTP/1.1 500 Internal Server Error");
    echo "Failed to fetch the image";
    exit;
}

// コンテンツタイプを取得
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

// コンテンツタイプをヘッダーに設定してレスポンスを返す
header("Content-Type: $contentType");
echo $response;

?>