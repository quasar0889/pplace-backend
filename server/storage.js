import { createClient } from "redis";
this.redisUrl = redisUrl;
/**
* ピクセル値は「パレットのインデックス（0..255）」を格納。
* 0 = 背景色
*/
this.buf = new Uint8Array(this.size); // メモリ用
this.client = null;
}


async init() {
if (this.useRedis) {
this.client = createClient({ url: this.redisUrl });
this.client.on("error", (e) => console.error("Redis error:", e));
await this.client.connect();
// 既存データロード
const existing = await this.client.getBuffer("canvas");
if (existing) {
if (existing.length !== this.size) {
console.warn("Canvas size mismatch. Resetting Redis canvas.");
await this.client.set("canvas", Buffer.from(this.buf));
} else {
this.buf = new Uint8Array(existing);
}
} else {
await this.client.set("canvas", Buffer.from(this.buf));
}
}
}


index(x, y) {
return y * this.width + x;
}


/** 単一ピクセル取得 */
get(x, y) {
return this.buf[this.index(x, y)];
}


/** 単一ピクセル更新 */
async set(x, y, colorIndex) {
this.buf[this.index(x, y)] = colorIndex;
if (this.useRedis) {
// Redis のバイナリを部分更新（SETRANGE）
const offset = this.index(x, y);
await this.client.sendCommand(["SETRANGE", "canvas", String(offset), Buffer.from([colorIndex])]);
}
}


/** 全体ダンプ（Uint8Array） */
dump() {
return this.buf;
}


/** 全体リセット */
async clear() {
this.buf.fill(0);
if (this.useRedis) {
await this.client.set("canvas", Buffer.from(this.buf));
}
}
}
