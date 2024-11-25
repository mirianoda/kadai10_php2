<?php
try {
    // データベース接続
    $pdo = new PDO('mysql:dbname=kadai_php2;host=localhost;charset=utf8', 'root', '');

    // book_id を取得
    if (!isset($_GET['book_id'])) {
        echo json_encode(["error" => "Missing book_id parameter"]);
        exit;
    }
    $bookId = $_GET['book_id'];

    // データベースから book_id に対応する情報を取得
    $stmt = $pdo->prepare("SELECT name, gender, age, comment FROM gs_bm_table WHERE book_id = :book_id");
    $stmt->bindValue(':book_id', $bookId, PDO::PARAM_STR);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        echo json_encode($result);
    } else {
        echo json_encode(["error" => "No data found for the given book_id"]);
    }
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
    exit;
}
?>
