// three.jsのセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight * 1);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.getElementById("shelf").appendChild(renderer.domElement);

// カメラ位置設定
camera.position.set(0, 2, 15);
camera.lookAt(0, 0, 0);

// 背景色を明るく設定
renderer.setClearColor(0xf09c7a);

// 環境光とスポットライトを追加
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 0.8);
spotLight.position.set(5, 15, 10);
spotLight.castShadow = true;
scene.add(spotLight);

// 本棚の構造を作成する関数
function createShelf() {
  const shelfMaterial = new THREE.MeshStandardMaterial({ color: 0x8B5A2B });
  const shelfWidth = 7;
  const shelfHeight = 0.1;
  const shelfDepth = 0.5;
  const shelfSpacing = 1.4;

  for (let i = 0; i < 3; i++) {
    const geometry = new THREE.BoxGeometry(shelfWidth, shelfHeight, shelfDepth);
    const shelf = new THREE.Mesh(geometry, shelfMaterial);
    shelf.position.set(0, i * shelfSpacing - 1.5, 0);
    shelf.receiveShadow = true;
    scene.add(shelf);
  }
}

// 本を作成する関数
function createBook(textureUrl, x, y, bookId) {
  const proxiedTextureUrl = getProxiedImageUrl(textureUrl); // プロキシURLを使用
  const geometry = new THREE.BoxGeometry(0.7, 1.1, 0.1);
  const texture = new THREE.TextureLoader().load(proxiedTextureUrl);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const book = new THREE.Mesh(geometry, material);
  book.position.set(x, y + 0.9, -0.2);
  book.rotation.x = Math.PI / -10;
  book.castShadow = true;
  book.userData = { bookId };
  scene.add(book);
  return book;
}

//本データを取得する関数
async function fetchBooksFromDatabase() {
  const response = await fetch('getBookImageAPI.php');
  const data = await response.json();

  if (data.error) {
    console.error('Error fetching books:', data.error);
    return [];
  }

  return data; // [{ book_id, title, cover_url }, ...]
}

// プロキシを経由するための関数
function getProxiedImageUrl(originalUrl) {
  return `proxyImage.php?url=${encodeURIComponent(originalUrl)}`;
}

//本棚に取得した本を並べる関数
async function populateShelfFromDatabase() {
  const bookData = await fetchBooksFromDatabase(); // データベースから本データを取得
  const books = [];
  const booksPerShelf = 7; // 1段に並べる本の数
  const shelfSpacing = 1.4; // 段の間隔

  for (let i = 0; i < bookData.length; i++) {
    const getBookData = bookData[i];
    const shelfLevel = Math.floor(i / booksPerShelf); // 段を計算
    // const yPosition = shelfLevel * shelfSpacing - 1.9; // Y座標を設定
    const yPosition = (2 - shelfLevel) * shelfSpacing - 1.9; // 棚の逆順に調整
    const xPosition = (i % booksPerShelf - (booksPerShelf - 1) / 2) * 0.85; // X座標を設定

    // 本を作成
    const book = createBook(getBookData.cover_url, xPosition, yPosition, getBookData.book_id);
    books.push(book);
  }

  return books;
}

let books = []; // グローバル変数として定義

// 本棚を作成してデータベースの本を配置
createShelf(); // 本棚を作成

// 本を非同期で取得して設定
const initialPositions = new Map();
populateShelfFromDatabase().then((result) => {
  books = result; // booksに結果を代入
  // 各本の初期位置を保持
  books.forEach((book) => {
    initialPositions.set(book, book.position.clone()); // 初期位置を記録
  });
});

// クリックイベント処理の追加
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1.3;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(books);

  if (intersects.length > 0) {
    const clickedBook = intersects[0].object;
    const bookId = clickedBook.userData.bookId; // book_id を取得

    if (bookId) {
      // sakuhin.html に遷移し、book_id を渡す
      window.location.href = `sakuhin.html?book_id=${bookId}`;
    }
  }
}

window.addEventListener('click', onMouseClick, false);


// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();


// マウスムーブイベントのためのベクターと変数
let hoveredBook = null;
const raycaster2 = new THREE.Raycaster();
const mouse2 = new THREE.Vector2();

// マウスムーブイベントを監視
function onMouseMove(event) {
  // マウス位置を正規化
  mouse2.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse2.y = -(event.clientY / window.innerHeight) * 2 + 1.3;

  // Raycasterにカメラとマウス座標をセット
  raycaster2.setFromCamera(mouse2, camera);

  // 本との交差判定
  const intersects = raycaster2.intersectObjects(books);

  if (intersects.length > 0) {
    const intersectedBook = intersects[0].object;

    // ホバーされた本が変更された場合のみ処理
    if (hoveredBook !== intersectedBook) {
      if (hoveredBook) {
        // 前のホバーされた本を元の位置に戻す
        gsap.to(hoveredBook.position, {
          y: initialPositions.get(hoveredBook).y, // 初期位置に戻す
          duration: 0.3,
        });
      }

      // 新しいホバーされた本を少し浮かせる
      hoveredBook = intersectedBook;
      gsap.to(hoveredBook.position, {
        y: initialPositions.get(hoveredBook).y + 0.2, // 浮かせる
        duration: 0.3,
      });
    }
  } else {
    // マウスが本から離れたときにリセット
    if (hoveredBook) {
      gsap.to(hoveredBook.position, {
        y: initialPositions.get(hoveredBook).y, // 初期位置に戻す
        duration: 0.3,
      });
      hoveredBook = null;
    }
  }
}

// マウスムーブイベントのリスナー
window.addEventListener('mousemove', onMouseMove, false);

