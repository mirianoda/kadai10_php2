<?php
try {
    // データベース接続
    $pdo = new PDO('mysql:dbname=kadai_php2;host=localhost;charset=utf8', 'root', '');

    // データベースからbook_idを取得
    $stmt = $pdo->prepare("SELECT book_id FROM gs_bm_table ORDER BY id ASC");
    $stmt->execute();
    $books = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Google Books APIキー
    $apiKey = "***********";

    // 各book_idでGoogle Books APIを呼び出して表紙URLを取得
    $results = [];
    foreach ($books as $book) {
        $bookId = $book['book_id'];
        $apiUrl = "https://www.googleapis.com/books/v1/volumes/{$bookId}?key={$apiKey}";

        $response = file_get_contents($apiUrl);
        if ($response === false) {
            continue; // エラーが発生した場合はスキップ
        }

        $data = json_decode($response, true);
        $coverUrl = $data['volumeInfo']['imageLinks']['thumbnail'] ?? null; // 表紙URL
        $title = $data['volumeInfo']['title'] ?? "Unknown Title";

        if ($coverUrl) {
            $results[] = [
                'book_id' => $bookId,
                'title' => $title,
                'cover_url' => $coverUrl,
            ];
        }
    }

    // JSON形式で結果を返す
    header('Content-Type: application/json');
    echo json_encode($results);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
    exit;
}
