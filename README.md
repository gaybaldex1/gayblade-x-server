# GAYBLADE X 専用サーバー

GAYBLADE X の対戦で、物理(衝突・回転)と試合の進行をまとめて計算するサーバーです。
Cloudflare Workers + Durable Objects で動きます。

- 合言葉ごとに1つの「部屋」(Durable Object)ができ、参加者全員と WebSocket でつながります。
- 部屋が試合を計算して、座標などの結果だけを 1秒に30回 全員へ送ります。参加者の端末は描くだけです。
- 最初に「部屋を作る」を押した人が部屋を仕切ります(モード・スタジアム・CPU追加・開始など)。その人が抜けたら、次の人に交代します。
- 試合中だけ時計を回します。ロビーや結果の画面で待っている間は部屋が休止するので、料金(無料枠)をほとんど使いません。休止しても、部屋の状態(参加者・戦績・トーナメント表・ブレード画像)は保存しているので、起きたときにそのまま続きから遊べます。

## ファイル

| ファイル | 中身 |
|---|---|
| `src/index.ts` | 入口(`/room/<部屋ID>` を部屋へつなぐ)と、部屋(`GameRoom`)の処理 |
| `src/core.js` | **自動生成**。ゲーム本体 `index.html` の「`#core`」部分(物理・試合進行・トーナメント)をそのまま集めたもの |
| `tools/build-core.mjs` | `src/core.js` を作るスクリプト |
| `wrangler.json` | Cloudflare の設定(Durable Object の名前 `GameRoom`、つなぎ名 `ROOMS`) |

## ゲーム本体とのつなぎ方

`index.html` の中の次の1行に、このサーバーの場所を書きます(`https://` ではなく `wss://`)。

```js
const SERVER_URL = 'wss://gayblade-x-server.gaybaldex1.workers.dev';
```

空(`''`)のままなら、今まで通り PeerJS(部屋を作った人の端末が計算)で遊べます。
サーバーにつながらないときも、自動で PeerJS に切り替わります。

## ゲーム本体の物理を変えたとき

`index.html` の物理やバランスを変えたら、サーバーの計算も同じにするために `src/core.js` を作り直して、コミットします。

```bash
node tools/build-core.mjs ../index.html   # index.html のある場所を指定
```

GitHub に push すると、Cloudflare(Workers Builds)が自動でデプロイします。

## 手元で動かす

```bash
npm install
npm run dev            # http://127.0.0.1:8787
```

ゲーム本体を `index.html?server=ws://127.0.0.1:8787` で開くと、手元のサーバーにつながります(`?p2p=1` で PeerJS)。
`.dev.vars` に `DEV_TEST=1` と書くと、休止からの復元を試す確認用のメッセージ(`__sleep`)が使えます(本番では無効)。

## 通信(参考)

- 参加者 → サーバー: `hello`(create: 部屋を作る) / `set` / `img` / `shoot` / `aim` / `a`(覚醒) / `s`(賢者モード) / `rub` / `cheer`(トーナメントの応援) / `rdy`(試合の画面の準備ができた) / `gd`(試合前の操作の案内: 見たい・読み終わった)
- 部屋を仕切る人だけ: `cfg`(モード・スタジアム) / `cpu` / `kick` / `team` / `start` / `tgo`(トーナメントの次の試合) / `tskip` / `again` / `lobby` / `skip` / `cs`(召喚の短縮) / `rskip`(トーナメントのリプレイを飛ばす)
- サーバー → 参加者: `welcome`(id) / `reject` / `lobby`(lead: 仕切る人) / `lead` / `img` / `start`(bgm: 戦闘BGMの番号 / gw: 操作の案内を読む人) / `st`(試合の状態) / `me`(自分のコマの状態) / `end` / `bk`(トーナメント表) / `msg`
- `ping` には、部屋を起こさずに `pong` を自動で返します。
