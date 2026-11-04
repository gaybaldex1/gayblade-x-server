// =====================================================================
//  GAYBLADE X 専用サーバー(Cloudflare Workers + Durable Objects)
//  合言葉ごとに1つの「部屋」(GameRoom)を作り、参加者全員と WebSocket でつながる。
//  物理(衝突・回転)・試合の進行・トーナメントはすべてこの部屋で計算し、
//  参加者には座標などの結果だけを送る(参加者の端末は描くだけ)。
//  計算の中身は、ゲーム本体(index.html)の「#core」部分をそのまま使う(src/core.js は自動生成)。
//  インターネット対戦: 「マッチング係」(Matchmaker)が、待っている人どうしを組み合わせて、2人用の部屋を作る。
// =====================================================================
import { DurableObject } from 'cloudflare:workers';
import { createCore } from './core.js';

export interface Env {
	ROOMS: DurableObjectNamespace<GameRoom>;
	MATCH: DurableObjectNamespace<Matchmaker>; // インターネット対戦のマッチング係(全体で1つ)
	DEV_TEST?: string; // 手元の動作確認用(.dev.vars に DEV_TEST=1)。本番では使わない
}

type Msg = Record<string, any>;
// 1人ぶんの接続(index.html の PeerJS の接続と同じ形: peer = プレイヤーID / open / send / close)
interface Conn { peer: string; open: boolean; send(m: Msg): void; close(): void; ws: WebSocket }

const MAX_MSG = 400_000;    // 受け取る1通の上限(ブレード画像 約300KB + 余裕)
const TICK_MS = 1000 / 60;  // 試合中の時計(1秒に60回)
const RESULT_TAIL = 7;      // 決着後、飛んだパーツが落ちて溶けきるまで時計を回しておく秒数
const SAVE_KEY = 'room';    // 部屋の状態(休止しても消えないように保存する)
const READY_MAX = 6;        // 試合の開始: 戦う人全員の画面の準備ができるまで待つ最長の秒数
// ---------- インターネット対戦 ----------
const OL_STADIUMS = ['standard', 'extreme']; // 選べるスタジアム(「どちらでも」はこのどちらか)
const OL_NOSHOW = 15;       // マッチしたのに相手が部屋に来ないとき、あきらめてさがし直すまでの秒数
const OL_READY_MAX = 8;     // 2人そろってから、準備の合図(olr)を待つ最長の秒数

export class GameRoom extends DurableObject<Env> {
	C: any;                   // 共通コア(物理・試合進行)
	S: any;                   // コアの状態(index.html の S と同じもの)
	timer: any = null;
	last = 0;
	resultT = 0;
	dirty = false;
	savedImgs = new Map<string, string>(); // 保存済みのブレード画像(変わったものだけ書き直す)
	readyWait: Set<string> | null = null;  // 試合の開始: まだ画面の準備ができていない人
	readyT = 0;
	// インターネット対戦の部屋だけで使う
	olReady = new Set<string>();  // 部屋に入って準備ができた人(ブレード画像などを送り終えた)
	olAgain = new Set<string>();  // 結果画面で「もう一度」を押した人(2人そろったら再戦)
	olSkip = new Set<string>();   // リプレイの「スキップ」を押した人(2人そろったら飛ばす)
	olStarted = false;            // 最初の試合を始めたか
	olTimer: any = null;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.C = createCore(this.hooks());
		this.S = this.C.S;
		this.S.role = 'host'; // この部屋がホスト(物理を計算する側)
		this.S.lead = null;   // 部屋を仕切る人(最初に部屋を作った人。抜けたら次の人)
		// 参加者の「生きてるよ」の合図には、部屋を起こさずに自動で返事をする(休止中は料金がかからない)
		ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
		ctx.blockConcurrencyWhile(() => this.restore());
	}

	// ---------- コアから呼ばれる画面の処理(サーバーには画面がないので、参加者へ知らせるだけ) ----------
	hooks() {
		const noop = () => {};
		return {
			onEvent: noop, uiClearField: noop, uiMatchStart: noop, uiBracketHide: noop, uiSkipFx: noop,
			uiIntroEnd: noop, uiGo: noop, uiUnfreeze: noop, uiReplayStart: noop, uiReplayEnd: noop, uiGuideEnd: noop,
			uiHoldFreeze: () => false,
			uiLobby: () => { this.dirty = true; },
			// 部屋を仕切る人へのお知らせ(「2人以上必要です」など)
			uiMsg: (text: string) => { const c = this.S.conns.get(this.S.lead); if (c) c.send({ t: 'msg', text }); },
			// 試合の始まり: 戦う人全員の画面(3D)の準備ができてから、開始演出とカウントダウンを進める
			uiEnterGame: () => {
				this.readyWait = new Set(this.S.players.filter((p: any) => !p.cpu && this.S.conns.has(p.id)).map((p: any) => p.id));
				this.readyT = 0;
				this.startLoop();
			},
			// トーナメント表を全員に見せる
			uiBracket: () => { this.sendBracket(true); this.dirty = true; },
			uiEnd: () => { if (this.S.tour) this.sendBracket(false); this.dirty = true; },
			uiToLobby: () => this.stopLoop(),
		};
	}
	tourData() {
		const T = this.S.tour;
		return T ? { roster: T.roster, rounds: T.rounds, champ: T.champ || null } : null;
	}
	// cpu: 次がCPU同士の試合か(「CPU戦をスキップ」ボタンを出すか)
	sendBracket(show: boolean) { this.C.broadcast({ t: 'bk', tour: this.tourData(), show: show ? 1 : 0, cpu: this.C.nextIsCpuMatch() ? 1 : 0 }); }

	// ---------- 接続 ----------
	async fetch(req: Request): Promise<Response> {
		if (req.headers.get('Upgrade') !== 'websocket') return new Response('WebSocket で接続してください', { status: 426 });
		const pair = new WebSocketPair();
		const [client, server] = Object.values(pair);
		const id = 'p' + crypto.randomUUID().replace(/-/g, '').slice(0, 10);
		this.ctx.acceptWebSocket(server);
		server.serializeAttachment({ id }); // 休止から起きても、だれの接続か分かるように
		this.wrap(server, id);
		return new Response(null, { status: 101, webSocket: client });
	}
	// WebSocket を、コアが使う「接続」の形にする(hello が来るまでは S.conns に入れない)
	wrap(ws: WebSocket, id: string): Conn {
		const c: Conn = {
			peer: id, open: true, ws,
			send(m: Msg) { if (!c.open) return; try { ws.send(JSON.stringify(m)); } catch (e) { c.open = false; } },
			close() { c.open = false; try { ws.close(1000, 'bye'); } catch (e) {} },
		};
		(ws as any).__conn = c;
		return c;
	}
	connOf(ws: WebSocket): Conn {
		const c = (ws as any).__conn as Conn | undefined;
		if (c) return c;
		const a = (ws.deserializeAttachment() || {}) as { id?: string };
		return this.wrap(ws, a.id || 'p' + crypto.randomUUID().replace(/-/g, '').slice(0, 10));
	}

	async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer) {
		if (typeof raw !== 'string' || raw.length > MAX_MSG) return;
		let d: Msg;
		try { d = JSON.parse(raw); } catch (e) { return; }
		if (!d || typeof d.t !== 'string') return;
		const conn = this.connOf(ws);
		if (d.t === '__sleep' && this.env.DEV_TEST === '1') return this.devSleep(); // 動作確認用: 休止して起きたときと同じ状態を作る
		try { this.onMessage(conn, d); } catch (e) { console.error('message error', d.t, e); }
		await this.flush();
	}
	// 動作確認用: 部屋が休止して、また起きたときと同じこと(メモリの状態を捨てて、保存から復元)をする
	async devSleep() {
		this.stopLoop(); await this.flush();
		for (const ws of this.ctx.getWebSockets()) delete (ws as any).__conn;
		this.C = createCore(this.hooks()); this.S = this.C.S; this.S.role = 'host'; this.S.lead = null;
		this.savedImgs.clear();
		await this.restore();
		console.log('devSleep: restored', this.S.players.length, 'players, phase', this.S.phase, 'tour', !!this.S.tour, 'lead', this.S.lead);
	}
	async webSocketClose(ws: WebSocket, code: number) {
		try { ws.close(code === 1005 || code === 1006 ? 1000 : code, 'bye'); } catch (e) {} // 閉じる合図に返事をする
		await this.leave(ws);
	}
	async webSocketError(ws: WebSocket) { await this.leave(ws); }

	onMessage(conn: Conn, d: Msg) {
		const S = this.S, C = this.C, id = conn.peer;
		if (d.t === 'hello') {
			if (S.conns.has(id)) return;
			const empty = S.conns.size === 0;
			if (d.ol) return this.olHello(conn, d, empty); // インターネット対戦(マッチングで決まった2人用の部屋)
			if (S.mode === 'online' && !empty) return C.reject(conn, 'この部屋には入れません。');
			// 「部屋を作る」で入ったのに、もう人がいる / 「部屋に入る」で入ったのに、だれもいない
			if (d.create && !empty) return C.reject(conn, 'この合言葉の部屋はすでにあります。「部屋に入る」を押してください。');
			if (!d.create && empty) return C.reject(conn, 'その合言葉の部屋はまだありません。先に誰かが「部屋を作る」を押してください。');
			if (empty) { this.stopLoop(); this.resetRoom(); S.lead = id; S.cutShort = !!d.cs; }
			C.onHostData(conn, d); // 参加者として登録して、ロビーの状態を全員へ
			return;
		}
		if (!S.conns.has(id)) return; // hello の前のメッセージは受け付けない
		if (d.t === 'rdy') { if (this.readyWait) this.readyWait.delete(id); return; } // 試合の画面の準備ができた
		if (['set', 'img', 's', 'a', 'shoot', 'rub', 'aim', 'cheer', 'gd'].includes(d.t)) { // gd: 試合前の操作の案内(見たい・読み終わった)
			C.onHostData(conn, d);
			if (d.t === 'img') this.dirty = true;
			return;
		}
		if (S.mode === 'online') return this.olMessage(id, d); // インターネット対戦には部屋を仕切る人がいない(2人とも同じ立場)
		if (id !== S.lead) return; // ここから下は、部屋を仕切る人の操作だけ
		const inLobby = S.phase === 'lobby', between = S.phase === 'lobby' || S.phase === 'result';
		switch (d.t) {
			case 'cfg': // 対戦モード・スタジアム
				if (!inLobby) return;
				if (d.mode && C.MODE_INFO[d.mode]) S.mode = d.mode;
				if (d.stadium && C.STADIUMS[d.stadium]) S.stadium = d.stadium;
				C.broadcastLobby();
				break;
			case 'cpu': if (inLobby) C.addCpu(); break;
			case 'kick': { // 参加者・CPUを外す
				if (!inLobby) return;
				const p = S.players.find((p: any) => p.id === d.id);
				if (p && p.id !== S.lead) C.kick(p);
				break;
			}
			case 'team': { // 団体戦のチーム(CPU・ほかの人のぶんも)
				if (!inLobby) return;
				const p = S.players.find((p: any) => p.id === d.id);
				if (p && Number.isInteger(d.team) && d.team >= 0 && d.team < 4) { p.team = d.team; C.broadcastLobby(); }
				break;
			}
			case 'start': if (between) C.hostStart(); break;              // バトル開始(トーナメントは表を作る・次の試合)
			case 'tgo': if (between && S.tour) C.tourPlayNext(); break;   // トーナメントの次の試合
			case 'tskip': if (between && S.tour) C.tourSkipCpu(); break;  // CPU同士の試合をまとめて決める
			case 'again': if (S.phase === 'result') C.hostAgain(); break; // もう一度 / トーナメント表へ
			case 'lobby': C.toLobby(); break;                             // ロビーへ戻る(試合の途中でも)
			case 'skip':                                                  // 残りがCPUだけの試合を、一気に結果まで
				if ((S.phase === 'countdown' || S.phase === 'battle') && C.cpuOnlyBattle()) C.skipToResult();
				break;
			case 'cs': S.cutShort = !!d.on; this.dirty = true; break;     // 3D召喚の短縮(2回目以降)
			case 'rskip': C.skipReplay(); break;                          // トーナメントの決め手のリプレイを飛ばす
		}
	}

	// 抜けた人の後始末。部屋を仕切る人が抜けたら、次の人に交代。だれもいなくなったら部屋を片付ける
	async leave(ws: WebSocket) {
		const conn = this.connOf(ws);
		conn.open = false;
		const S = this.S, id = conn.peer;
		if (!S.conns.has(id)) return;
		const wasLead = S.lead === id;
		if (wasLead) {
			const next = S.players.find((p: any) => !p.cpu && p.id !== id && S.conns.has(p.id))?.id || [...S.conns.keys()].find(k => k !== id);
			S.lead = next || null;
		}
		this.C.onLeave(id); // ロビーなら外す・試合中ならその場で脱落
		if (S.mode === 'online' && S.conns.size > 0) this.olLeft(id);
		if (S.conns.size === 0) { // だれもいない → 片付ける
			this.stopLoop(); this.resetRoom();
			this.savedImgs.clear(); this.dirty = false;
			await this.ctx.storage.deleteAll();
			return;
		}
		if (wasLead && S.phase !== 'lobby') this.C.broadcast({ t: 'lead', id: S.lead }); // 試合中はロビーの状態を送らず、交代だけ知らせる
		this.dirty = true;
		await this.flush();
	}
	resetRoom() {
		const S = this.S;
		this.olClearTimer(); this.olReady.clear(); this.olAgain.clear(); this.olSkip.clear(); this.olStarted = false; S.olSeen = null;
		Object.assign(S, { players: [], imgs: {}, mode: 'ffa', stadium: 'standard', sageIds: [], stats: {}, hist: [], tour: null,
			phase: 'lobby', tops: [], lead: null, cutShort: false, pendingEnd: null, replay: null, slow: null, kakutei: null, freezeT: 0, introT: 0 });
	}

	// ---------- 試合の時計(試合中だけ回す。止まっている間は部屋が休止できる) ----------
	startLoop() {
		this.resultT = 0;
		if (this.timer) return;
		this.last = Date.now();
		this.timer = setInterval(() => this.tick(), TICK_MS);
	}
	stopLoop() {
		if (this.timer) clearInterval(this.timer);
		this.timer = null;
	}
	tick() {
		const now = Date.now(), dt = Math.min(0.1, (now - this.last) / 1000);
		if (dt <= 0) return;
		this.last = now;
		const S = this.S;
		if (this.readyWait) { // 画面の準備を待っている(抜けた人は待たない)
			for (const pid of this.readyWait) if (!S.conns.has(pid)) this.readyWait.delete(pid);
			this.readyT += dt;
			if (this.readyWait.size && this.readyT < READY_MAX && S.phase === 'countdown') return;
			this.readyWait = null;
		}
		try { this.C.hostTick(dt); } catch (e) { console.error('tick error', e); }
		if (S.phase === 'result') {
			this.resultT += dt;
			if (this.resultT > RESULT_TAIL) { this.stopLoop(); this.flush(); }
		} else this.resultT = 0;
		if (S.phase === 'lobby') { this.stopLoop(); this.flush(); }
	}

	// ---------- 保存と復元(部屋が休止して、また起きたとき用) ----------
	async flush() {
		if (!this.dirty) return;
		this.dirty = false;
		const S = this.S, T = S.tour;
		const state = {
			players: S.players, mode: S.mode, stadium: S.stadium, sageIds: S.sageIds, stats: S.stats, hist: S.hist, lead: S.lead, cutShort: !!S.cutShort,
			phase: S.phase === 'lobby' ? 'lobby' : 'result',
			tour: T ? { roster: T.roster, rounds: T.rounds, cur: T.cur || null, champ: T.champ || null, champDone: !!T.champDone, seen: T.seen ? [...T.seen] : [] } : null,
		};
		const puts: Record<string, any> = { [SAVE_KEY]: state }, dels: string[] = [];
		for (const [pid, data] of Object.entries(S.imgs as Record<string, string>)) {
			if (this.savedImgs.get(pid) !== data) { puts['img:' + pid] = data; this.savedImgs.set(pid, data); }
		}
		for (const pid of [...this.savedImgs.keys()]) if (!S.imgs[pid]) { dels.push('img:' + pid); this.savedImgs.delete(pid); }
		try {
			await this.ctx.storage.put(puts);
			if (dels.length) await this.ctx.storage.delete(dels);
		} catch (e) { console.error('save error', e); }
	}
	async restore() {
		const sockets = this.ctx.getWebSockets();
		if (!sockets.length) { await this.ctx.storage.deleteAll(); return; } // だれもつながっていない → 新しい部屋
		const all = await this.ctx.storage.list();
		const st: any = all.get(SAVE_KEY);
		const S = this.S;
		if (st) {
			Object.assign(S, { players: st.players || [], mode: st.mode || 'ffa', stadium: st.stadium || 'standard', sageIds: st.sageIds || [],
				stats: st.stats || {}, hist: st.hist || [], lead: st.lead || null, cutShort: !!st.cutShort, phase: st.phase || 'lobby', tops: [] });
			if (st.tour) S.tour = { ...st.tour, seen: new Set(st.tour.seen || []) };
		}
		for (const [k, v] of all) if (k.startsWith('img:') && typeof v === 'string') { S.imgs[k.slice(4)] = v; this.savedImgs.set(k.slice(4), v); }
		// つながったままの参加者を、もう一度「接続」に戻す
		for (const ws of sockets) {
			const c = this.connOf(ws);
			if (S.players.some((p: any) => p.id === c.peer) || (S.tour && S.tour.roster.some((p: any) => p.id === c.peer))) S.conns.set(c.peer, c);
		}
		if (!S.conns.has(S.lead)) S.lead = [...S.conns.keys()][0] || null;
	}

	// =====================================================================
	//  インターネット対戦の部屋(マッチング係が決めた2人だけが入る)
	//  2人そろったら自動で試合開始 → 決着 → 2人とも「もう一度」を押したら同じ相手と再戦
	// =====================================================================
	olHello(conn: Conn, d: Msg, empty: boolean) {
		const S = this.S, C = this.C;
		if (!empty && S.mode !== 'online') return C.reject(conn, '対戦の部屋に入れませんでした。');
		if (S.conns.size >= 2 || S.phase !== 'lobby' || this.olStarted) return C.reject(conn, 'この対戦はすでに始まっています。');
		if (empty) {
			this.stopLoop(); this.resetRoom();
			S.mode = 'online';
			S.stadium = OL_STADIUMS.includes(d.st) ? d.st : 'standard';
			S.lead = conn.peer; S.cutShort = true; // 召喚は、同じ人の2回目以降を短い版に
			// 相手がいつまでも来ない(マッチ直後に閉じた・つながらない) → 待っている人にさがし直してもらう
			this.olTimer = setTimeout(() => {
				if (S.mode !== 'online' || this.olStarted || S.players.length >= 2) return;
				for (const c of [...S.conns.values()]) { c.send({ t: 'olx' }); c.close(); }
			}, OL_NOSHOW * 1000);
		}
		C.onHostData(conn, d); // 参加者として登録
		this.dirty = true;
		this.olCheckStart();
	}
	olClearTimer() { if (this.olTimer) clearTimeout(this.olTimer); this.olTimer = null; }
	// 今つながっている、戦う2人
	olHumans(): string[] { const S = this.S; return S.players.filter((p: any) => !p.cpu && !p.left && S.conns.has(p.id)).map((p: any) => p.id); }
	// 2人そろって、2人とも準備ができたら(または少し待ったら)試合を始める
	olCheckStart() {
		const S = this.S;
		if (S.mode !== 'online' || S.phase !== 'lobby' || this.olStarted || S.players.length < 2) return;
		const go = () => {
			if (this.olStarted || S.phase !== 'lobby' || S.players.length < 2) return;
			this.olStarted = true; this.olClearTimer(); this.olSkip.clear(); this.olAgain.clear();
			this.C.hostStart();
			this.dirty = true; this.flush();
		};
		if (S.players.every((p: any) => this.olReady.has(p.id))) return go();
		this.olClearTimer();
		this.olTimer = setTimeout(go, OL_READY_MAX * 1000);
	}
	olMessage(id: string, d: Msg) {
		const S = this.S, C = this.C;
		switch (d.t) {
			case 'olr': this.olReady.add(id); this.olCheckStart(); break; // 部屋に入って、準備ができた
			case 'again': { // 結果画面の「もう一度」: 2人そろったら再戦
				if (S.phase !== 'result') return;
				this.olAgain.add(id);
				C.broadcast({ t: 'olag', ids: [...this.olAgain] });
				const hs = this.olHumans();
				if (hs.length === 2 && hs.every(h => this.olAgain.has(h))) { this.olAgain.clear(); this.olSkip.clear(); C.hostStart(); this.dirty = true; }
				break;
			}
			case 'rskip': { // 決め手のリプレイの「スキップ」: 2人とも押したら飛ばす(片方だけなら、相手はそのまま見られる)
				if (S.phase !== 'replay') return;
				this.olSkip.add(id);
				C.broadcast({ t: 'olsk', ids: [...this.olSkip] });
				if (this.olHumans().every(h => this.olSkip.has(h))) { this.olSkip.clear(); C.skipReplay(); }
				break;
			}
		}
	}
	// 相手が抜けた: 残った人に知らせる(試合中なら、抜けた人はその場で脱落 → 残った人の勝ち)
	olLeft(id: string) {
		const S = this.S;
		this.olAgain.delete(id); this.olSkip.delete(id); this.olReady.delete(id);
		if (S.phase === 'lobby' && !this.olStarted) { // 試合の前に抜けた → 残った人はさがし直す
			for (const c of [...S.conns.values()]) { c.send({ t: 'olx' }); c.close(); }
			return;
		}
		this.C.broadcast({ t: 'olleft' });
	}
}

// =====================================================================
//  インターネット対戦のマッチング係(全体で1つ)
//  「さがす」を押した人と WebSocket でつながり、スタジアムの希望が合う人を、待った順に組み合わせる。
//  待っている人の希望は、それぞれの接続に覚えさせておく(休止して起きても、待ち行列がそのまま残る)
// =====================================================================
type QInfo = { st?: string; name?: string; at?: number };
const fits = (a: string, b: string) => a === 'any' || b === 'any' || a === b; // スタジアムの希望が合うか
export class Matchmaker extends DurableObject<Env> {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong')); // 待っている間の合図には、起きずに返事
	}
	async fetch(req: Request): Promise<Response> {
		if (req.headers.get('Upgrade') !== 'websocket') return new Response('WebSocket で接続してください', { status: 426 });
		const pair = new WebSocketPair();
		const [client, server] = Object.values(pair);
		this.ctx.acceptWebSocket(server);
		server.serializeAttachment({});
		return new Response(null, { status: 101, webSocket: client });
	}
	async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer) {
		if (typeof raw !== 'string' || raw.length > 2000) return;
		let d: Msg;
		try { d = JSON.parse(raw); } catch (e) { return; }
		if (!d) return;
		if (d.t === 'cancel') { ws.serializeAttachment({}); try { ws.close(1000, 'cancel'); } catch (e) {} return; }
		if (d.t !== 'q') return;
		const me: QInfo = { st: ['standard', 'extreme', 'any'].includes(d.st) ? d.st : 'any', name: String(d.name || 'プレイヤー').slice(0, 10), at: Date.now() };
		// 先に待っている人から順に、スタジアムの希望が合う人をさがす
		const waiting = this.ctx.getWebSockets()
			.filter(w => w !== ws)
			.map(w => ({ w, a: (w.deserializeAttachment() || {}) as QInfo }))
			.filter(x => x.a.st && fits(me.st!, x.a.st))
			.sort((x, y) => (x.a.at || 0) - (y.a.at || 0));
		for (const { w, a } of waiting) {
			// 対戦するスタジアム: どちらかが選んだほう。2人とも「どちらでも」ならランダム
			const stadium = me.st !== 'any' ? me.st! : a.st !== 'any' ? a.st! : OL_STADIUMS[Math.floor(Math.random() * OL_STADIUMS.length)];
			const room = 'ol-' + crypto.randomUUID().replace(/-/g, '');
			try { w.send(JSON.stringify({ t: 'match', room, stadium, opp: me.name })); }
			catch (e) { w.serializeAttachment({}); continue; } // その人はもういない → 次の人
			w.serializeAttachment({});
			ws.send(JSON.stringify({ t: 'match', room, stadium, opp: a.name }));
			try { w.close(1000, 'matched'); } catch (e) {}
			try { ws.close(1000, 'matched'); } catch (e) {}
			return;
		}
		ws.serializeAttachment(me); // まだ相手がいない → 待ち行列に入る
		ws.send(JSON.stringify({ t: 'queued' }));
	}
	async webSocketClose(ws: WebSocket, code: number) {
		try { ws.close(code === 1005 || code === 1006 ? 1000 : code, 'bye'); } catch (e) {}
	}
	async webSocketError(ws: WebSocket) {}
}

// ---------- 入口: /room/<部屋ID> を、その部屋の Durable Object へつなぐ ----------
export default {
	async fetch(req: Request, env: Env): Promise<Response> {
		const url = new URL(req.url);
		if (url.pathname === '/' || url.pathname === '/health') return new Response('GAYBLADE X server: OK', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
		if (url.pathname === '/match') { // インターネット対戦のマッチング
			if (req.headers.get('Upgrade') !== 'websocket') return new Response('WebSocket で接続してください', { status: 426 });
			return env.MATCH.get(env.MATCH.idFromName('global')).fetch(req);
		}
		const m = url.pathname.match(/^\/room\/([A-Za-z0-9_-]{1,80})$/);
		if (!m) return new Response('Not found', { status: 404 });
		if (req.headers.get('Upgrade') !== 'websocket') return new Response('WebSocket で接続してください', { status: 426 });
		const stub = env.ROOMS.get(env.ROOMS.idFromName(m[1]));
		return stub.fetch(req);
	},
} satisfies ExportedHandler<Env>;
