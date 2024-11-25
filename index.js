$(document).ready(function() {
  // 本の入力時
  $(".book_name").on("input", function() {
    const query = $(this).val();

    if (query.length > 1) {
      fetch(`getBookAPI.php?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
          $("#book-dropdown").empty().hide();

          if (data.items) {
            data.items.slice(0, 5).forEach(book => {
              const authors = book.volumeInfo.authors ? book.volumeInfo.authors.join(", ") : "著者不明";
              const item = $("<div>")
                .addClass("dropdown-item")
                .text(`${book.volumeInfo.title} - 著者: ${authors}`) // 本タイトルと著者を表示
                .data("bookId", book.id);
              $("#book-dropdown").append(item);
            });

            if (data.items.length > 0) {
              $("#book-dropdown").show();
            }
          }
        })
        .catch(error => console.error("本の検索エラー:", error));
    } else {
      $("#book-dropdown").empty().hide();
    }
  });

  // 候補クリック時
  $("#book-dropdown").on("click", ".dropdown-item", function() {
    bookId = $(this).data("bookId");
    const bookTitle = $(this).text();

    $(".book_name").val(bookTitle);
    $("#bookId").val(bookId); // 隠しフィールドに本IDを保存
    $("#book-dropdown").hide();
  });

  // クリック以外でドロップダウンを非表示
  $(document).on("click", function(e) {
    if (!$(e.target).closest("#book-input").length && !$(e.target).closest("#book-dropdown").length) {
      $("#book-dropdown").hide();
    }
  });
});
