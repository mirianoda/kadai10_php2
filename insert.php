<?php
// 1. POSTデータの取得
$name = $_POST["name"];
$gender = $_POST["gender"];
$age = $_POST["age"];
$book_name = $_POST["book_name"];
$book_id = $_POST["book_id"]; // 隠しフィールドから受け取る
$comment = $_POST["comment"];

// 2. DB接続
try {
    $pdo = new PDO('mysql:dbname=kadai_php2;host=localhost;charset=utf8', 'root', '');
} catch (PDOException $e) {
    exit('DB接続エラー:' . $e->getMessage());
}

// 3. データ登録SQL作成
$sql = "INSERT INTO gs_bm_table(name, gender, age, book_name, book_id, comment, indate) 
        VALUES(:name, :gender, :age, :book_name, :book_id, :comment, sysdate())";
$stmt = $pdo->prepare($sql);
$stmt->bindValue(':name', $name, PDO::PARAM_STR);
$stmt->bindValue(':gender', $gender, PDO::PARAM_STR);
$stmt->bindValue(':age', $age, PDO::PARAM_INT);
$stmt->bindValue(':book_name', $book_name, PDO::PARAM_STR);
$stmt->bindValue(':book_id', $book_id, PDO::PARAM_STR);
$stmt->bindValue(':comment', $comment, PDO::PARAM_STR);
$status = $stmt->execute(); // 実行

// 4. データ登録処理後
if ($status == false) {
    // SQL実行時にエラーがある場合（エラー表示）
    $error = $stmt->errorInfo();
    exit("ErrorQuery:" . $error[2]);
} else {
    // 登録成功時（例：リダイレクト）
    header("Location: home.html");
    exit;
}
?>
