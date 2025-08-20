const $ = (sel) => document.querySelector(sel);
const serverUrlEl = $("#serverUrl");
const serverInput = $("#serverInput");
const connectBtn = $("#connectBtn");
const colorPicker = $("#colorPicker");
const paletteEl = $("#palette");
const resetViewBtn = $("#resetView");


const canvas = $("#canvas");
const overlay = $("#overlay");
const ctx = canvas.getContext("2d");
const octx = overlay.getContext("2d");
const minimap = $("#minimap");
const mctx = minimap.getContext("2d");
const coordEl = $("#coord");
const zoomEl = $("#zoom");


let ioSocket = null;
let meta = null; // { width, height, palette }
let pixels = null; // Uint8Array (palette indices)


// ワールド座標系 (px)
let scale = 1; // 画面ピクセル / キャンバスピクセル
let offsetX = 0; // キャンバス -> 画面 変換の平行移動
let offsetY = 0;


let hover = { x: -1, y: -1 };
let selectedColorIndex = 1; // 0 は背景なので既定は 1


// ========= 接続 =========
connectBtn.addEventListener("click", async () => {
const url = serverInput.value.trim();
if (!url) return alert("サーバーURLを入力してください");
await connectServer(url);
});


async function connectServer(baseUrl) {
try {
serverUrlEl.textContent = baseUrl;


// メタ取得
const metaRes = await fetch(new URL("/meta", baseUrl));
meta = await metaRes.json();


// ダンプ取得（生バイナリ）
const dumpRes = await fetch(new URL("/dump", baseUrl));
const dumpBuf = new Uint8Array(await dumpRes.arrayBuffer());


if (dumpBuf.byteLength !== meta.width * meta.height) {
throw new Error(`Dump size mismatch: ${dumpBuf.
