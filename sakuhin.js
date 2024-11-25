
  // URLから book_id を取得
const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get('book_id');

// book_id を使ってデータベースや API から詳細情報を取得する処理をここに追加
  async function fetchBookDetails(bookId) {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
    const data = await response.json();
    console.log("Fetched data:", data); // レスポンス内容を確認
    return {
      title: data.volumeInfo.title || "ー",
      releaseDate: data.volumeInfo.publishedDate || "",
      runtime: `${data.volumeInfo.pageCount || ""} ページ`,
      genre: data.volumeInfo.categories?.join(", ") || "",
      story: data.volumeInfo.description || "ー",
      author: data.volumeInfo.authors?.join(", ") || "ー", 
      poster: data.volumeInfo.imageLinks?.thumbnail || "" 
    };
  }
  
  // 作品情報を取得して表示
  async function displayWorkDetails() {
    const data =await fetchBookDetails(bookId);
  
    // 取得したデータをHTMLに挿入
    $("#title").text(data.title || "ー");
    $("#releaseDate").text(data.releaseDate+"刊行、" || "");
    $("#runtime").text(data.runtime || "");
    $("#genre").text(data.genre || "");
    $("#story").text(data.story || "ー");
    $("#author").text(data.author || "ー");
    $("#poster").attr("src", data.poster || "");
  }

  displayWorkDetails();

  // データベース情報を取得する関数
async function fetchUserDetails(bookId) {
  try {
    const response = await fetch(`getUserInfo.php?book_id=${bookId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user details for bookId: ${bookId}`);
    }
    const data = await response.json();
    if (data.error) {
      console.error("Error fetching user details:", data.error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// データを表示する関数
async function displayUserDetails() {
  const userDetails = await fetchUserDetails(bookId);
  if (!userDetails) {
    alert("ユーザー情報を取得できませんでした。");
    return;
  }

  // ユーザー情報をHTMLに挿入
  $("#name").text(userDetails.name || "匿名");
  $("#gender").text(userDetails.gender || "不明");
  $("#age").text(`${userDetails.age || "不明"}歳`);
  $("#comment").text(userDetails.comment || "不明");
}

// 詳細を表示
displayUserDetails();


  //左矢印を押したら、前画面に戻る
  $(".hidari").on("click", function() {
    window.history.back();
  });



