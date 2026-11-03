// 自動生成ファイル(直接編集しない): index.html の「#core」部分をそのまま集めたもの
// 作り直し: node tools/build-core.mjs <index.html のパス>
// 部屋ごとに createCore() を呼んで、部屋ごとに別々の状態(S)を持つ
/* eslint-disable */
export function createCore(hooks) {
  const { onEvent, uiLobby, uiClearField, uiMsg, uiMatchStart, uiEnterGame, uiBracket, uiBracketHide, uiEnd, uiSkipFx, uiIntroEnd, uiGo, uiHoldFreeze, uiUnfreeze, uiReplayStart, uiReplayEnd, uiToLobby } = hooks;
  // ---------- 設定値 ----------
  const R = 300;              // スタジアム半径
  const TOP_R = 28;           // ベイの半径(当たり判定)
  const DT = 1 / 60;          // 物理の固定ステップ
  const MAX_PLAYERS = 8;
  const TIME_LIMIT = 90;      // 制限時間(秒)
  const POCKETS = [Math.PI / 2, Math.PI * 7 / 6, Math.PI * 11 / 6]; // ポケット(落とし穴)の中心角
  const POCKET_W = 0.3;       // ポケットの半幅(ラジアン)
  // ポケット接近の警報(mn11): ポケットの手前の小さな範囲に入ったら鳴らす
  const PK_WARN_ANG = POCKET_W + 0.08; // 範囲の幅: ポケット中心からの角度(ポケットより左右に少しだけ広い)
  const PK_WARN_IN = 45;               // 範囲の奥行き: 落ちるラインから内側へこの距離まで
  const PK_WARN_CD = 1.5;              // 同じコマで続けて鳴らさない間隔(秒)
  const OVER_SPEED = 680;     // この速度以上で壁に当たると場外(オーバーアウト)
  const BOWL_H = 28;          // すり鉢の縁の高さ(見た目)
  const ID_PREFIX = 'spinarena-v1-';
  const FACE_SPIN = 0.18;     // 画像プレートの回転速度(ブレード比)。1にすると本体と同じ速さで回る
  
  // 覚醒モード
  const AWAKE_TIME = 10;      // 効果時間(秒)
  const AWAKE_CHARGE = 16;    // 効果が切れてから再び使えるまでのチャージ時間(秒)。ビットをこすると最大で半分(8秒)まで縮められる
  const SAGE_TIME = 5;        // 賢者モード: 効果時間(秒)。前回の優勝者だけが1試合に1回使える
  const AW_GRACE = 0.35;      // 通信の遅れ対策: チャージ残りがこの秒数以下で押されたら、終わった瞬間に発動する
  const ORBIT_R = R * 0.62;   // アタック: 周回する半径
  const ORBIT_V = 520;        // アタック: 普段の周回スピード(他のコマよりずっと速い)
  const ORBIT_AW = 1.4;       // アタック: 覚醒中の周回スピード倍率
  const ORBIT_DRAIN = 1.5;    // アタック: 覚醒中のスタミナの減り倍率(1.8 → 1.5 に緩和)
  const BOUNCE_P = 0.45;      // ディフェンス: 上下運動の周期(秒)
  const AIR_T = 0.45;         // ディフェンス: 打ち上げられた相手の滞空時間(秒)
  // バランス崩れ(0〜1)。1になると転倒して脱落。回転が速いほど早く立ち直り、遅いと立ち直れず悪化する
  const WOB_SLAM = 0.55;      // ディフェンスの叩きつけで崩れる量
  const WOB_OIL = 0.72;       // 相手のオイルの上にいる間、1秒あたりに崩れる量(最初の72% = 80%からさらに10%下げた)
  const OIL_RESIST = { balance: 0.3 }; // オイルで崩れる量の倍率(バランスタイプはぬるぬるに慣れていて30%しか崩れない)
  const FLOWER_W = 2.1;       // アタック: 内側へ切り込む「花びら軌道」の速さ(ラジアン/秒、約3秒で1回)
  const FLOWER_IN = 0.3;      // アタック: 切り込むときに周回半径をどこまで縮めるか(0.3 = 半径の30%まで = ほぼ中央)
  const WOB_LAND = 0.3;       // 打ち上げから着地したときに崩れる量
  const wobRecover = sr => 1.2 * sr * sr - 0.25; // 1秒あたりの立ち直り量(回転100%: 0.95 / 46%: ほぼ0 / それ以下: マイナス)
  const OIL_FT = 0.7;         // バランス: オイル弾の飛行時間(秒)
  const OIL_INTERVAL = 0.7;   // バランス: 発射間隔(秒)
  const PUDDLE_LIFE = 6;      // バランス: 水たまりが残る時間(秒)
  const PUDDLE_R = 50;        // バランス: 水たまりの半径
  const PART_MELT = 5;        // バーストで外れたブレード・ビットが、スタジアム内で止まってからオイルに溶けきるまでの秒数
  const RAGNA_T = 15;         // ラグナロク: 変幻の間隔(秒)。15秒でアタック形態 → さらに15秒でスタミナ形態 → 以降くり返し
  const RAGNA_SLOW = 0.45;    // ラグナロク: アタック形態で覚醒したとき(重さ3倍)の周回スピード倍率
  
  // 中央の回転ディスク(上を通ると加速する)
  const DISC_R = 50;          // ディスクの半径
  const DISC_PUSH = 520;      // 進行方向への加速
  const DISC_SPIN = 380;      // ディスクの回転方向へ引っぱる加速
  const DISC_W = 2.6;         // 見た目の回転速度(rad/秒)
  // 開始演出: 場外から投げ入れる
  const LAUNCH_T = 0.7;       // 投げ入れてから着地するまでの時間(秒)
  // シュート(射出): GOに合わせて撃つ。強さ(スワイプの速さ・振った勢い)で初速と回転、向き(傾き・ボタン)で着地点が決まる
  const SHOT_LATE = 0.7;      // GOからこの秒数たっても撃たないと、弱いシュートで自動発射
  const SHOT_JUST = 0.1;      // GOとのズレがこの秒数以内なら「ジャストシュート」(回転ボーナス)
  const SHOT_GOOD = 0.3;      // ここまでは「グッド」(減点わずか)
  // 向き: 発射台から中央へまっすぐを0として、左右に最大 AIM_MAX ラジアン(約40度)。PCの「左斜め・右斜め」は AIM_PC
  const AIM_MAX = 0.7, AIM_PC = 0.55;
  // トーナメントだけの演出
  const REPLAY_PRE = 1.1, REPLAY_POST = 0.3, REPLAY_SPEED = 0.42; // 決め手のリプレイ: 決着の何秒前から何秒後まで / 再生速度
  const LAUNCH_H = 110;       // カウントダウン中に構えている高さ
  
  // タイプ別性能(mass:重さ accel:操作の効き dash:(未使用) decay:回転の減りやすさ hit:攻撃力 guard:被ダメ倍率 recv:弾かれやすさ slope:中央へ戻る力)
  // 重さの基準はスタミナ。ディフェンス1.5倍、バランス1.2倍、アタック・ラグナロク(覚醒時以外)は同じ
  const BASE_MASS = 1.15;
  const TYPES = {
    balance:  { name: 'バランス',     mass: BASE_MASS * 1.2, accel: 1.05, dash: 1.1, decay: 0.7, hit: 1.4, guard: 0.38, recv: 0.65, slope: 1.15,
                desc: '中くらいの太さと長さのビット。覚醒: 先端からヌルヌルのオイル弾を連射。水たまりに乗った相手は滑って踏ん張れず、バランスを崩しやすくなる。自分はぬるぬるに慣れていて、オイルでバランスを崩しにくい(ほかのタイプの30%)。' },
    attack:   { name: 'アタック',     mass: BASE_MASS, accel: 1.2,  dash: 1.25, decay: 0.85, // スタミナを上げた(回転の減り 1.0 → 0.85)
                hit: 1.25,  guard: 0.9, recv: 0.9,
                desc: '先が平らな六角柱のビットで、スタジアムの外周をぐるぐる周回し、ときどき花びらを描くように中央へ切り込む。覚醒: 3基のロケットが点火し、周回スピードが圧倒的に上がる。そのぶんスタミナの減りも早くなる。' },
    defense:  { name: 'ディフェンス', mass: BASE_MASS * 1.5, accel: 0.8,  dash: 0.9, decay: 1.3,  hit: 0.85, guard: 0, recv: 1.3, wobT: 0.8,
                desc: '太くて短いビットで逆回転。重さはスタミナの1.5倍で、相手に当たってもスタミナが減らない。覚醒: ブレードが上下に激しく動き、上がる瞬間に当たった相手は打ち上げ(壁の外まで飛ぶことも)、下がる瞬間は叩きつけてバランスを崩させる。' },
    stamina:  { name: 'スタミナ',     mass: BASE_MASS, accel: 0.9,  dash: 0.9, decay: 0.37,  hit: 0.8,  guard: 0.6, recv: 0.5, slope: 1.5, wobT: 0.8,
                desc: '細長いビット。覚醒: ビットがさらに1.5倍(計2.25倍)に伸び、ブレードも巨大化。覚醒中はスタミナの減りが止まる。' },
    ragnarok: { name: 'ラグナロク',   mass: BASE_MASS, accel: 0.85, dash: 1.0, decay: 0.3,  hit: 1.65, guard: 0.15, recv: 0.65, slope: 1.1, wobT: 0.78,
                desc: 'バランス型の形をブロンズの装甲スリーブが覆ったビット。形は変わらないまま、15秒で性能がアタック形態(外周を周回)に変幻し、さらに15秒でスタミナ形態へ。以降アタック⇄スタミナをくり返す。覚醒: コマが黒く染まり重量3倍。弾かれにくいが、アタック形態では重さで周回が遅くなる。' },
  };
  // ラグナロクの形態: 経過時間で base(初期) → attack → stamina → attack → … と変わる
  function ragFormAt(sec) { const k = Math.floor(sec / RAGNA_T); return k === 0 ? 'base' : (k % 2 === 1 ? 'attack' : 'stamina'); }
  const RAG_ATK_DECAY = 0.7;   // ラグナロクのアタック形態の減りやすさ(アタック比。アタックの緩和前と同じ値 0.825 を保つ)
  function ragStats(form) {
    const g = TYPES.ragnarok;
    if (form === 'attack') return { ...TYPES.attack, mass: BASE_MASS, hit: 1.8, recv: 0.85, guard: g.guard, decay: RAG_ATK_DECAY, wobT: g.wobT }; // 減りやすさはアタックに近い(他のタイプよりは多い)
    if (form === 'stamina') return { ...TYPES.stamina, mass: BASE_MASS, hit: g.hit, recv: 0.8, guard: g.guard, wobT: g.wobT }; // 減りにくさはスタミナと同じ
    return g;
  }
  // ---------- ブレード(刃)5種 ----------
  // タイプ(ビット)の性能に掛け算する。hit:攻撃力 guard:受けるダメージ recv:弾かれやすさ burst:バーストしにくさ
  // decay:回転の減りやすさ mass:重さ rad:当たり判定の大きさ upper:アッパー(当てた相手を浮かせてバランスを崩す・バーストさせやすい)
  // wobRes:バランスの崩れやすさ(オイル・叩きつけ・アッパー・着地)
  const BLADES = {
    shark:  { name: 'シャークエッジ', hit: 1.0, guard: 1.05, recv: 1.15, burst: 0.85, decay: 1.0, mass: 1.0, rad: 1.0, upper: 0.16, wobRes: 1.0,
              desc: '急角度のアッパー刃3枚。下からかち上げるように当て、相手のバランスを崩してバーストさせやすい。そのぶん自分も弾かれやすく、バーストにやや弱い。' },
    knight: { name: 'ナイトシールド', hit: 0.9, guard: 0.7, recv: 0.7, burst: 1.3, decay: 1.0, mass: 1.0, rad: 1.0, upper: 0, wobRes: 0.75,
              desc: '丸みを帯びた薄い防御刃6枚。当たりを受け流すので、弾かれにくく、受けるダメージも少ない。攻撃力は控えめ。' },
    wizard: { name: 'ウィザードアロー', hit: 0.9, guard: 1.0, recv: 0.95, burst: 1.1, decay: 0.9, mass: 1.05, rad: 1.05, upper: 0, wobRes: 1.0,
              desc: '2枚の大型円形刃。外側に重さが集まっていて回転が長持ちする(回転の減り15%減)。刃が大きく当たり判定も少し広い。' },
    shell:  { name: 'ブラックシェル', hit: 0.9, guard: 0.8, recv: 0.9, burst: 1.35, decay: 1.0, mass: 1.1, rad: 1.0, upper: 0, wobRes: 0.7,
              desc: '外周に向かって下向きに傾いた防御刃8枚。相手の刃を上から押さえ込むので、バーストやアッパー・オイルによるバランス崩れにとても強い。少し重い。' },
    tiger:  { name: 'ヴァイスタイガー', hit: 0.9, guard: 1.0, recv: 0.95, burst: 1.1, decay: 1.0, mass: 1.0, rad: 1.0, upper: 0.08, wobRes: 0.9,
              desc: 'アッパー刃・ダンパー刃・スマッシュ刃の3つを持つ万能型。攻撃も守りもそこそこで、苦手な相手が少ない。' },
    // ---- 新ブレード5種 ----
    // chip: 当たるたびに相手の回転を必ず削る量 / smash: 相手を吹き飛ばす力の倍率 / counter: 受けたダメージを相手へ返す割合
    // drain: 与えたダメージを自分の回転として吸い取る割合 / lunge: 偏芯で不規則に飛び出す強さ
    needle: { name: 'ニードルストーム', hit: 0.85, guard: 1.0, recv: 1.05, burst: 1.0, decay: 1.0, mass: 0.95, rad: 1.0, upper: 0, wobRes: 1.0, chip: 2.0,
              desc: '外周に12本の細いトゲが並ぶ連打型。一発は軽いが、当たるたびに相手の回転を必ず少し削る。当てるほど効いてくる。' },
    hammer: { name: 'ギガハンマー', hit: 0.85, guard: 1.0, recv: 1.05, burst: 1.0, decay: 1.0, mass: 0.95, rad: 1.0, upper: 0, wobRes: 1.0, chip: 2.0,
              desc: '分厚い鉄塊の刃2枚で、叩くたびに相手の回転を必ず少し削る連打型。一発は軽く、重さも0.95倍と軽めで、少し弾かれやすい。ラグナロクと組むと、削る力が0.75倍(覚醒中は0.55倍)・覚醒時の重さが2.4倍に抑えられる。' },
    mirror: { name: 'ミラーリフレクト', hit: 0.85, guard: 0.8, recv: 0.9, burst: 1.1, decay: 1.0, mass: 1.0, rad: 1.0, upper: 0, wobRes: 1.0, counter: 1.2,
              desc: '鏡のように磨かれた4枚のひし形刃を持つカウンター型。受けたダメージの一部をそのまま相手へはね返す。自分から攻めるのは苦手。' },
    drain:  { name: 'ドレインファング', hit: 0.95, guard: 0.95, recv: 1.0, burst: 1.05, decay: 1.0, mass: 1.0, rad: 1.0, upper: 0, wobRes: 1.0, drain: 0.8,
              desc: '後ろ向きに反った3本の牙を持つ回転吸収型。当てた相手から回転を吸い取って自分の回転に変える(与えたダメージの8割)。' },
    chaos:  { name: 'カオスエクリプス', hit: 1.25, guard: 0.85, recv: 0.75, burst: 1.0, decay: 1.0, mass: 1.0, rad: 1.0, upper: 0, wobRes: 1.05, lunge: 90,
              desc: '片側だけに大きな三日月刃がついた偏芯型。重心がずれていて、ときどき不規則に飛び出すので動きが読めない。' },
  };
  const BLADE_KEYS = Object.keys(BLADES);
  const randBlade = () => BLADE_KEYS[Math.floor(Math.random() * BLADE_KEYS.length)];
  
  // ---------- スタジアム3種 ----------
  const STADIUMS = {
    standard: { name: 'スタンダードスタジアム', desc: 'いつものスタジアム。3か所のポケットに落ちると場外。' },
    viking:   { name: 'バイキングスタジアム', desc: '壁にトゲがびっしり。勢いよく壁にぶつかると回転が大きく削られ、バーストしやすい。' },
    meteor:   { name: 'メテオスタジアム', desc: 'コマの衝突(コマ同士・壁)がたまると、空から隕石が降ってくる。落ちる場所には赤い印が出て、当たると吹き飛ばされて回転も削られる(バーストすることも)。降り終わるとまた衝突がたまったらもう一度。' },
    tilt:     { name: 'ティルトスタジアム', desc: 'コマの衝突(コマ同士・壁)がたまると、床が大きく傾く。低くなる方向はぐるぐる回り、コマは坂を転がるように流される。しばらくすると水平に戻り、また衝突がたまったらもう一度。' },
    extreme:  { name: 'エクストリームスタジアム', desc: '壁にダッシュレール付き。壁に当たったり沿って動いたコマは、レールに乗ってアタックタイプのように加速して外周を駆け抜ける。' },
  };
  
  // ---------- ギミック(メテオ・ティルト) ----------
  const GIM_HITS = 8;         // ギミックが動き出すまでの衝突回数(コマ同士+壁。1対1の試合では1試合で平均6回ほどしか起きないので8回にしている)
  const METEOR_TIME = 8;      // メテオ: 隕石が降り続ける時間(秒)
  const METEOR_EVERY = 0.65;  // メテオ: 隕石が落ちてくる間隔(秒)
  const METEOR_FALL = 1.2;    // メテオ: 赤い印が出てから着弾までの時間(秒)
  const METEOR_R = 85;        // メテオ: 着弾の衝撃が届く半径
  const METEOR_PUSH = 520;    // メテオ: 吹き飛ばす強さ
  const TILT_TIME = 10;       // ティルト: 傾いている時間(秒。最初と最後の2秒はゆっくり傾いて・戻る)
  const TILT_G = 240;         // ティルト: 坂を下る加速の強さ
  const TILT_ANGLE = 0.14;    // ティルト: 見た目の傾き(ラジアン。約8度)
  const TILT_SPIN = 0.55;     // ティルト: 低くなる方向が回る速さ(ラジアン/秒)
  
  // ---------- バースト ----------
  const BURST_TH = 600;      // バーストする衝撃の基準値(大きいほどバーストしにくい)
  const UPPER_WOB = 0.7;     // アッパー刃で相手のバランスを崩す強さ
  const BURST_SOFT = 0.5;    // 基準値をこの割合だけ超えると確実にバースト(それまでは確率)
  // タイプ別のバースト確率の倍率(アタック70%減・バランス25%減・ラグナロク50%減・ディフェンス40%減)
  const BURST_TYPE = { attack: 0.3, balance: 0.75, ragnarok: 0.65, defense: 0.6, stamina: 0.7 }; // ディフェンスは中央で当たられ続けてバーストが多すぎたので40%減
  // 覚醒中は硬くなってバーストしにくい(確率の倍率)。アタックは覚醒中バーストしない
  const BURST_AWAKE = { attack: 0 };
  const BURST_AWAKE_DEFAULT = 0.4;
  const VIKING_BURST = 3.2;  // バイキング: 壁にぶつかった速さ × この値 をバーストの衝撃として扱う
  const VIKING_SPIN = 0.02;  // バイキング: 壁のトゲで削られる回転(ぶつかった速さあたり)
  // エクストリームのダッシュレール
  const RAIL_V = 950;        // レール上の速さ(アタックの覚醒より速い)
  const RAIL_T = 1.1;        // 1回のダッシュの長さ(秒)
  const RAIL_CD = 1.4;       // 次にレールに乗れるまでの時間(秒)
  // レールの終わりは内側へ曲がる「フック」: ダッシュを降りるとき、キュッと中央へ向きを変える(そのまま場外へ飛び出さないように)
  const HOOK_T = 0.16;       // 向きを変えるのにかかる時間(秒)
  const HOOK_ANG = 1.5;      // 曲がる角度(ラジアン。約86度 = まっすぐ中央へ向く)
  const RAIL_LOOK = 0.3;     // ポケットのこの角度(ラジアン)手前で、フックに入る(フックの壁の付け根もここ)
  const HOOK_IN = 48;        // フックの先が外周から内側へ入り込む深さ
  
  const TEAM_COLORS = ['#ff4d5e', '#3da2ff', '#3ddc84', '#ffc53d'];
  const TEAM_NAMES = ['レッド', 'ブルー', 'グリーン', 'イエロー'];
  // 対戦モード(選択画面のカード)
  const MODE_INFO = {
    ffa:     { name: '個人戦', sub: '1対1・バトルロイヤル', desc: '全員が自分以外みんな敵。最後まで回っていた1人が勝ち。' },
    team:    { name: '団体戦', sub: 'チームに分かれて戦う', desc: 'チームに分かれて戦う。相手チームを全員倒したチームの勝ち(チーム変更ボタンで所属を選べます)。' },
    tourney: { name: 'トーナメント', sub: '1vs1の勝ち抜き戦(4人以上)', desc: '1対1の勝ち抜き戦。覚醒すると3Dのモンスターが召喚され、決着の瞬間はスローで見られる。' },
  };
  const PLAYER_COLORS = ['#ff4d5e', '#3da2ff', '#3ddc84', '#ffc53d', '#c06bff', '#ff8a3d', '#3de0e0', '#ff6bc9'];
  const REASONS = { draw: '同時に脱落 → 判定', burst: 'バーストフィニッシュ', pocket: 'ポケットアウト', over: 'オーバーアウト', spin: 'スピンフィニッシュ', topple: '転倒(バランス崩れ)', time: 'タイムアップ判定(残り回転量)', left: '相手が退出' };
  
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const angDiff = (a, b) => ((a - b + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  const floorH = r => BOWL_H * Math.min(1, r / R) ** 2; // すり鉢の床の高さ
  const visSpin = spin => 6 + spin * 0.12;               // 見た目の回転速度(rad/秒)
  // 演出で試合を止める長さ(秒): 1対1のカットイン / トーナメントの3D召喚(通常・2回目以降の短縮版)
  const CUTIN_T = 2.2;
  const SUMMON_LEN = { full: 3.2, short: 1.4 };
  // 戦闘BGMの曲数(今は mn5 のみ)。試合ごとにホスト(サーバー)が1曲選んで、全員の端末で同じ曲を流す
  const BGM_COUNT = 1;
  const CHEER_GAP = 300; // 応援: 同じ人が続けて送れる間隔(ミリ秒)
  
  // ---------- 全体の状態 ----------
  const S = {
    role: null,          // 'host' | 'client' | 'solo'
    peer: null,
    conns: new Map(),    // ホスト用: peerId → 接続
    hostConn: null,      // クライアント用: ホストへの接続
    myId: null,
    pass: '',
    players: [],         // {id,name,team,type,color,cpu,left}
    imgs: {},            // playerId → ブレード画像(dataURL)
    mode: 'ffa',         // 'ffa'(個人戦) | 'team'(チーム戦)
    stadium: 'standard', // 'standard' | 'viking' | 'extreme'
    sageIds: [],         // 前回の優勝者(賢者モードを使える人)。部屋を作った直後の1試合目は誰もいない
    phase: 'lobby',      // lobby | countdown | battle | result
    tops: [],            // ホスト用: 物理計算するベイ
    view: {},            // クライアント用: 受信した位置を補間して表示
    inputs: {},          // ホスト用: 各プレイヤーの入力
    puddles: [], oilQ: [], // ホスト用: 水たまりと着弾待ちのオイル
    phaseT: 0, elapsed: 0, tl: TIME_LIMIT, goT: 0,
    pendingEv: [], pendingEnd: null, lastKO: null,
    stats: {}, hist: [],  // 戦績(この部屋で遊んだ分。ホストが記録して、ロビーで全員に配る)
    pvId: null, pvAwake: false, // ロビーのプレビュー対象と「覚醒時を見る」
  };
  const isHost = () => S.role === 'host' || S.role === 'solo';
  const battleTime = () => isHost() ? S.elapsed : TIME_LIMIT - S.tl; // バトル開始からの経過秒
  // 試合を進める時計(ホスト・サーバー): acc = 物理の固定ステップのたまり / pad = コントローラーの状態を送る間隔 / snap = 画面の状態を送る間隔
  const LOOP = { acc: 0, pad: 0, snap: 0 };
  // ---- index.html 952〜1160行目 ----
  function randType() { const k = Object.keys(TYPES); return k[Math.floor(Math.random() * k.length)]; }
  const isImgData = d => typeof d === 'string' && d.startsWith('data:image/') && d.length < 300000;
  
  function makePlayer(id, name, cpu, type, blade) {
    const used = new Set(S.players.map(p => p.color));
    const color = PLAYER_COLORS.find(c => !used.has(c)) || PLAYER_COLORS[0];
    const cnt = [0, 0];
    S.players.forEach(p => { if (p.team < 2) cnt[p.team]++; });
    return { id, name, cpu, type, blade: BLADES[blade] ? blade : 'tiger', color, team: cnt[0] <= cnt[1] ? 0 : 1, left: false };
  }
  // CPUを1人追加する(部屋を作った人の操作)
  function addCpu() {
    if (S.players.length >= MAX_PLAYERS) return;
    let n = 1; while (S.players.some(p => p.name === 'CPU' + n)) n++;
    S.players.push(makePlayer('cpu-' + Date.now() + '-' + n, 'CPU' + n, true, randType(), randBlade()));
    broadcastLobby();
  }
  // 参加者を外す(部屋を作った人の操作)
  function kick(p) {
    if (!p.cpu) { const c = S.conns.get(p.id); if (c) { S.conns.delete(p.id); reject(c, 'ホストによって退出しました。'); } }
    S.players = S.players.filter(q => q !== p);
    delete S.imgs[p.id];
    broadcast({ t: 'img', id: p.id, data: null });
    broadcastLobby();
  }
  // ---- index.html 1216〜1240行目 ----
  function onHostData(conn, d) {
    const id = conn.peer;
    const inp = () => S.inputs[id] || (S.inputs[id] = { ax: 0, ay: 0, dashReq: false, awakeReq: false });
    switch (d.t) {
      case 'hello': {
        if (S.phase !== 'lobby') return reject(conn, 'バトル中です。終わってから入り直してください。');
        if (S.players.length >= MAX_PLAYERS) return reject(conn, '満員です(最大' + MAX_PLAYERS + '人)。');
        S.conns.set(id, conn);
        S.players.push(makePlayer(id, String(d.name || 'ゲスト').slice(0, 10), false, TYPES[d.type] ? d.type : 'balance', d.blade));
        conn.send({ t: 'welcome', id });
        // すでにいる人のブレード画像を新しい人へ送る
        for (const [pid, data] of Object.entries(S.imgs)) conn.send({ t: 'img', id: pid, data });
        broadcastLobby();
        break;
      }
      case 'set': {
        const p = S.players.find(p => p.id === id);
        if (!p || S.phase !== 'lobby') return;
        if (TYPES[d.type]) p.type = d.type;
        if (BLADES[d.blade]) p.blade = d.blade;
        if (Number.isInteger(d.team) && d.team >= 0 && d.team < 4) p.team = d.team;
        broadcastLobby();
        break;
      }
      case 'img': { // ブレード画像の登録・削除 → 全員へ配る
        if (isImgData(d.data)) S.imgs[id] = d.data; else delete S.imgs[id];
        broadcast({ t: 'img', id, data: S.imgs[id] || null });
        uiLobby();
        break;
      }
      case 's': { // 賢者モード: 使えるならその場で発動し、すぐ本人へ返事をする
        const t = S.tops.find(t => t.id === id);
        if (t && canSage(t)) { startSage(t); sendPads(id); }
        break;
      }
      case 'a': { // 覚醒: 発動できる状態ならフレームを待たずにその場で発動し、すぐ本人へ返事をする
        const t = S.tops.find(t => t.id === id);
        if (t && t.alive && canAwaken(t)) { startAwaken(t); sendPads(id); } else inp().awakeReq = true;
        break;
      }
      case 'shoot': { // シュート: GOとのズレは参加者の端末で測ったものを使う(通信の遅れで不利にならないように)
        const t = S.tops.find(t => t.id === id);
        if (t && t.launchAt == null && !S.shots[id]) S.shots[id] = { pw: clamp(+d.pw || 0, 0, 1), aim: clamp(+d.aim || 0, -AIM_MAX, AIM_MAX), off: clamp(+d.off || 0, -3, 3) };
        break;
      }
      case 'rub': { // ビットをこすった分だけ覚醒のチャージを進める(0.1秒ごと・上限あり・1回のチャージで半分まで)
        const t = S.tops.find(t => t.id === id);
        rubCharge(t, clamp(+d.s || 0, 0, RUB_CAP * 1.2));
        break;
      }
      case 'aim': { // 向きの変更(スワイプ中・ボタン。撃つ前だけ。ホストの画面の矢印に反映)
        const t = S.tops.find(t => t.id === id);
        if (t && t.launchAt == null && !S.shots[id]) t.aimSel = clamp(+d.aim || 0, -AIM_MAX, AIM_MAX);
        break;
      }
      case 'cheer': hostCheer(id); break; // トーナメントの応援(観戦している人)
    }
  }
  function reject(conn, reason) { conn.send({ t: 'reject', r: reason }); setTimeout(() => conn.close(), 300); }
  
  function onLeave(id) {
    if (!S.conns.has(id)) return;
    S.conns.delete(id);
    if (S.phase === 'lobby') {
      S.players = S.players.filter(p => p.id !== id);
      delete S.imgs[id];
      broadcastLobby();
    } else {
      // バトル中に抜けた人はその場で脱落扱い
      const p = S.players.find(p => p.id === id) || (S.tour && tourP(id)); if (p) p.left = true;
      const t = S.tops.find(t => t.id === id);
      if (t && t.alive) { t.alive = false; t.awake = 0; S.lastKO = 'left'; }
    }
  }
  
  function broadcast(msg) { for (const c of S.conns.values()) if (c.open) c.send(msg); }
  // lead: 部屋を仕切る人(専用サーバーのとき) / tour: トーナメント中か
  function broadcastLobby() { broadcast({ t: 'lobby', players: S.players, mode: S.mode, stadium: S.stadium, sage: S.sageIds, stats: S.stats, hist: S.hist, lead: S.lead || null, tour: S.tour ? 1 : 0 }); uiLobby(); }
  // ---- index.html 1279〜1356行目 ----
  function hostStart() {
    if (S.mode === 'tourney') return S.tour ? tourPlayNext() : tourStart();
    const alivePlayers = S.players.filter(p => !p.left);
    if (alivePlayers.length < 2) return uiMsg('2人以上必要です(CPUを追加できます)。');
    if (S.mode === 'team' && new Set(alivePlayers.map(p => p.team)).size < 2) return uiMsg('団体戦には2チーム以上必要です。');
    launchMatch(alivePlayers);
  }
  // バトルを始める(players がそのまま戦う。トーナメントでは毎回2人)
  // ---------- シュート(射出) ----------
  // 撃つ向き ang(発射台から見て、中央へまっすぐ = 0、右 = プラス)と強さ pw から、飛ぶ向きと着地点を決める
  // 強いほど奥まで飛ぶ。ただし必ずスタジアムの内側(半径0.8R以内)に着地させる
  function shotPlan(t, ang, pw) {
    ang = clamp(+ang || 0, -AIM_MAX, AIM_MAX);
    const h = t.a0 + Math.PI + ang, dx = Math.cos(h), dy = Math.sin(h);
    const r0 = Math.hypot(t.sx, t.sy), lim = R * 0.8, Lc = -(t.sx * dx + t.sy * dy); // Lc: 中央に一番近づく地点までの距離
    const rAt = L => Math.hypot(t.sx + dx * L, t.sy + dy * L);
    let L = r0 * (0.5 + 0.35 * pw);
    for (let k = 0; k < 80 && rAt(L) > lim; k++) L += Math.sign(Lc - L) * 5; // 外にはみ出すときは、中央に近づく側へずらす
    return { h, x: t.sx + dx * L, y: t.sy + dy * L };
  }
  const SHOT_GRADES = ['just', 'good', 'early', 'late'];
  function shotGrade(off) { const a = Math.abs(off); return a <= SHOT_JUST ? 'just' : a <= SHOT_GOOD ? 'good' : off < 0 ? 'early' : 'late'; }
  // シュートの結果から、着地点・走り出す向きと速さ・最初の回転(スタミナ)を決めて発射する
  // sh: { pw: 強さ0〜1, aim: 向き(ラジアン), off: GOとのズレ(秒。マイナスはフライング) }
  function applyShot(t, sh) {
    const pw = clamp(+sh.pw || 0, 0, 1), aim = clamp(+sh.aim || 0, -AIM_MAX, AIM_MAX), off = +sh.off || 0;
    const P = shotPlan(t, aim + (Math.random() - 0.5) * 0.04, pw);
    t.lx = P.x; t.ly = P.y;
    // 着地したら、撃った向きのまま走り出す(まっすぐなら中央へ突っ込み、斜めなら外周に沿って走る = レールに乗りやすい)
    t.va = P.h; t.lv = 130 + 200 * pw;
    // 最初の回転: 強く撃つほど多い。GOぴったりならボーナス、フライング・遅れはズレに応じて減点
    const a = Math.abs(off);
    let spin = 78 + 22 * pw;
    if (a <= SHOT_JUST) spin += 8; else spin -= Math.min(40, (a - SHOT_JUST) * 45);
    t.spin = clamp(spin, 35, 108);
    t.shotGrade = shotGrade(off); t.aimSel = aim;
    t.launchAt = Math.max(0, S.elapsed); S.padDirty = true;
    emit(['sh', t.idx, SHOT_GRADES.indexOf(t.shotGrade), Math.round(pw * 100), Math.round(aim * 100), Math.round(t.spin)]);
  }
  // ---------- エクストリームスタジアムのスロー演出(1vs1トーナメントだけ) = 確定演出 ----------
  // レールで加速しているコマが、ポケット手前のフックから中央へ射出される直前(0.15〜0.5秒前)に、
  // 「射出された直後の軌道」と「相手のその時刻の位置(今の動きから予測)」がほぼ重なるときだけ、壁との接点をアップにしてスローにする。
  // 飛び出したら、なめらかに通常の速さへ戻る。この演出のあとで実際に相手へ当たったら、その瞬間だけ相手のバースト耐性は15%(85%でバースト)
  // 射出する側のコマは、演出が始まってから終わるまで(当たる・受付時間が過ぎる)バーストしない
  const SLOW_K = 0.28;        // スロー中の速さ(通常の何倍か): レールの上
  const FLY_K = 0.5;          // 壁から射出されて相手へ向かう間の速さ
  const IMPACT_K = 0.035;     // 激突の瞬間の超スローモーション
  const IMPACT_HOLD = 1.25;   // 超スローを続ける時間(実際の秒)
  const KAKUTEI_RES = 0.15;   // 確定演出で当たったときの、相手のバースト耐性(どのタイプ・ブレード・覚醒中でもこの値)
  const KAKUTEI_WIN = 1.0;    // 射出されてから何秒以内の当たりを「確定演出の当たり」とするか(反対側の壁ぎわまで届く長さ)
  const KAKUTEI_REACH = 0.9;  // 射出されてから何秒先までの軌道で、相手に当たるかを読むか(反対側まで約0.6〜0.8秒)
  // コマの動きを、試合の物理(中央へ戻る力・回転による横すべり・周回・ダッシュレール・フック・中央ディスク・摩擦)と同じ式で先読みする
  // (ぶつかり合い・ふらつき・オイル・偏芯の飛び出しなど、読めないものは入れない)
  function predictPath(t, secs) {
    const q = { x: t.x, y: t.y, vx: t.vx, vy: t.vy, railT: t.railT, hookT: t.hookT, hookDir: t.hookDir, hookV0: t.hookV0, flw: t.flw ?? 0 };
    const kind = t.p.type, sr = t.spin / 100, rot = kind === 'defense' ? -1 : 1, slope = 1.15 * (t.T.slope || 1), h = 1 / 60, rr = radOf(t);
    const orbiting = (kind === 'attack' || t.form === 'attack') && !t.slip && t.wob < 0.3;
    const vOrbit = ORBIT_V * (isAw(t, 'attack') ? ORBIT_AW : 1) * (isAw(t, 'ragnarok') ? RAGNA_SLOW : 1) * (0.75 + 0.25 * Math.min(1, sr));
    const pts = []; let hookAt = null;
    for (let i = 0, n = Math.round(secs / h); i < n; i++) {
      const d = Math.hypot(q.x, q.y) || 1, nx = q.x / d, ny = q.y / d;
      let ax = -q.x * slope, ay = -q.y * slope;
      ax += -ny * 90 * Math.min(1.3, sr) * rot; ay += nx * 90 * Math.min(1.3, sr) * rot;
      if (orbiting) {
        q.flw += FLOWER_W * h;
        const rO = ORBIT_R * (1 - (1 - FLOWER_IN) * Math.max(0, Math.sin(q.flw)) ** 2);
        const vt = -q.vx * ny + q.vy * nx, vr = q.vx * nx + q.vy * ny, inward = Math.max(0, vt) ** 2 / Math.max(40, d) - (rO - d) * 4;
        ax = -nx * (inward + vr * 3) - ny * (vOrbit - vt) * 6; ay = -ny * (inward + vr * 3) + nx * (vOrbit - vt) * 6;
      }
      if (q.railT > 0) {
        q.railT -= h;
        const dir = t.railDir, tx = -ny * dir, ty = nx * dir;
        const near = POCKETS.some(p => Math.abs(angDiff(Math.atan2(q.y, q.x) + dir * RAIL_LOOK, p)) < POCKET_W + 0.05);
        if (near) q.railT = 0;
        if (q.railT <= 0) {
          q.railT = 0;
          if (near) { q.hookT = HOOK_T; q.hookDir = dir; q.hookV0 = Math.hypot(q.vx, q.vy); hookAt = i * h; }
          else { q.vx = q.vx * 0.5 - nx * 120; q.vy = q.vy * 0.5 - ny * 120; }
        } else {
          const rT = R - rr - 6, vt = q.vx * tx + q.vy * ty, vr = q.vx * nx + q.vy * ny, inward = Math.max(0, vt) ** 2 / Math.max(40, d) - (rT - d) * 8;
          ax = -nx * (inward + vr * 4) + tx * (RAIL_V - vt) * 14; ay = -ny * (inward + vr * 4) + ty * (RAIL_V - vt) * 14;
        }
      }
      if (q.hookT > 0) {
        q.hookT -= h;
        const k = Math.min(1, (1 - Math.max(0, q.hookT) / HOOK_T) * 1.15), phi = HOOK_ANG * k, tx = -ny * q.hookDir, ty = nx * q.hookDir;
        const sp = Math.max(q.hookV0 || 0, RAIL_V), wx = Math.cos(phi) * tx - Math.sin(phi) * nx, wy = Math.cos(phi) * ty - Math.sin(phi) * ny;
        ax += (wx * sp - q.vx) * 24; ay += (wy * sp - q.vy) * 24;
      }
      if (d < DISC_R) { const sp = Math.hypot(q.vx, q.vy) || 1; ax += q.vx / sp * DISC_PUSH - ny * DISC_SPIN; ay += q.vy / sp * DISC_PUSH + nx * DISC_SPIN; }
      q.vx += ax * h; q.vy += ay * h;
      const f = Math.exp(-0.7 * h); q.vx *= f; q.vy *= f;
      q.x += q.vx * h; q.y += q.vy * h;
      const d2 = Math.hypot(q.x, q.y);
      if (d2 > R - rr && POCKETS.some(p => Math.abs(angDiff(Math.atan2(q.y, q.x), p)) < POCKET_W)) return { pts, hookAt, out: true }; // ポケットに落ちる
      if (d2 > R - rr) { const ux = q.x / d2, uy = q.y / d2, vr = q.vx * ux + q.vy * uy; q.x = ux * (R - rr); q.y = uy * (R - rr); if (vr > 0) { q.vx -= ux * vr * 1.5; q.vy -= uy * vr * 1.5; } } // 壁ではね返る(おおまか)
      pts.push(q.x, q.y);
    }
    return { pts, hookAt };
  }
  // レールのコマ t がフックで射出された直後に、相手 o へ当たるか(両方の動きを先読みして、同じ時刻に重なるか)
  function railThreat(t, o) {
    const A = predictPath(t, 0.5 + KAKUTEI_REACH), B = predictPath(o, 0.5 + KAKUTEI_REACH);
    if (A.out) return null; // 射出されずにポケットへ落ちそう
    if (A.hookAt == null || A.hookAt < 0.15 || A.hookAt > 0.5) return null; // フックで射出されない・まだ遠い・もう間に合わない
    const hitR = (radOf(t) + radOf(o)) * 0.95; // しっかり重なるときだけ
    for (let i = 0; i < A.pts.length / 2; i++) {
      if (2 * i + 1 >= B.pts.length) break; // 相手がポケットに落ちる先は読まない
      const T = (i + 1) / 60, dd = Math.hypot(A.pts[2 * i] - B.pts[2 * i], A.pts[2 * i + 1] - B.pts[2 * i + 1]);
      if (T < A.hookAt) { if (dd < hitR) return null; continue; } // 射出の前にレールの上でぶつかる → 演出の対象外
      if (T > A.hookAt + KAKUTEI_REACH) break;
      if (dd < hitR) { const j = Math.round(A.hookAt * 60); return { tt: A.hookAt, T, px: A.pts[2 * i], py: A.pts[2 * i + 1], ox: B.pts[2 * i], oy: B.pts[2 * i + 1], hx: A.pts[2 * j], hy: A.pts[2 * j + 1] }; }
    }
    return null;
  }
  function checkRailSlow() {
    if (S.slow || S.mode !== 'tourney' || S.stadium !== 'extreme' || S.headless || S.fastSim || S.phase !== 'battle' || S.freezeT > 0) return;
    for (const t of S.tops) {
      if (!(t.alive && t.railT > 0)) { t.slowChk = false; continue; }
      if (t.slowChk) continue; // 1回のダッシュで演出は1回
      const o = S.tops.find(x => x !== t && x.alive && !x.launching && isEnemy(t, x));
      // 相手が空中・レールの上にいるときは動きが読めないので出さない
      if (!o || o.air > 0 || o.railT > 0 || o.hookT > 0) continue;
      const th = railThreat(t, o);
      if (th) {
        t.slowChk = true;
        if (S.kStats && S.kStats.log) S.kStats.log.push({ t0: S.elapsed, ...th, a: t.idx, b: o.idx });
        S.slow = { idx: t.idx, t: 0, ph: 'in', k: 1 };
        S.kakutei = { a: t.idx, b: o.idx, until: null }; // この2つが当たったら確定(射出から KAKUTEI_WIN 秒以内)
        if (S.kStats) S.kStats.trig++;
        if (!S.kStats) emit(['kk', t.idx, o.idx]); // 確定演出の始まり(演出・kk.wav は onEvent で。参加者の画面にも届く)
        return;
      }
    }
  }
  // 確定演出の当たりか(当たったら、相手のバースト耐性を15%にしてバーストの判定をする)。1回きり
  function kakuteiHit(a, b, nx, ny) {
    const k = S.kakutei; if (!k) return null;
    if (k.until != null && S.elapsed > k.until) { S.kakutei = null; return null; }
    const pair = (a.idx === k.a && b.idx === k.b) ? b : (b.idx === k.a && a.idx === k.b) ? a : null;
    if (!pair) return null;
    S.kakutei = null;
    if (S.kStats) S.kStats.hit++;
    const atk = pair === b ? a : b, survive = !pair.alive || pair.launching || Math.random() < KAKUTEI_RES; // 15%で耐える
    // 激突の瞬間: 超スローモーションに切り替えて、激突の演出(聖獣・閃光・衝撃波・稲妻)を出す
    if (S.slow && !S.kStats) { S.slow.ph = 'impact'; S.slow.t0 = S.slow.t; S.slow.k = IMPACT_K; }
    if (!S.kStats) emit(['kh', atk.idx, pair.idx, Math.round((a.x + b.x) / 2), Math.round((a.y + b.y) / 2), survive ? 0 : 1]);
    if (survive) return pair;
    const dx = pair === b ? nx : -nx, dy = pair === b ? ny : -ny;
    pair.burst = { dx, dy, parts: makeBurstParts(pair, dx, dy) };
    ko(pair, 'burst');
    if (S.kStats) S.kStats.burst++;
    return pair;
  }
  function updateSlow(dt) {
    const sl = S.slow; if (!sl) return;
    if (S.phase !== 'battle') { S.slow = null; S.kakutei = null; return; }
    if (S.freezeT > 0) return; // カットイン中はそのまま
    sl.t += dt;
    const t = S.tops[sl.idx], onRail = t && t.alive && (t.railT > 0 || t.hookT > 0);
    if (sl.ph === 'in') { const q = Math.min(1, sl.t / 0.25); sl.k = 1 + (SLOW_K - 1) * (1 - (1 - q) ** 3); if (q >= 1) sl.ph = 'hold'; }
    if ((sl.ph === 'in' || sl.ph === 'hold') && (!onRail || sl.t > 4)) { // 壁から飛び出した → 少し速めのスローで相手へ。確定演出の当たりの受付はここから KAKUTEI_WIN 秒
      sl.ph = 'fly'; sl.t0 = sl.t; sl.k0 = sl.k;
      if (S.kakutei && S.kakutei.until == null) S.kakutei.until = S.elapsed + KAKUTEI_WIN;
    }
    if (sl.ph === 'fly') {
      const q = Math.min(1, (sl.t - sl.t0) / 0.3); sl.k = sl.k0 + (FLY_K - sl.k0) * q;
      if (!S.kakutei) { sl.ph = 'out'; sl.t0 = sl.t; sl.k0 = sl.k; } // 当たらないまま受付が終わった → 戻す
    }
    if (sl.ph === 'impact') {
      // 激突の瞬間: ほぼ止まるくらいの超スロー → 少しずつ動き出す → IMPACT_HOLD 秒で通常の速さへ戻し始める
      const q = Math.min(1, (sl.t - sl.t0) / IMPACT_HOLD);
      sl.k = q < 0.35 ? IMPACT_K : IMPACT_K + (SLOW_K * 0.6 - IMPACT_K) * ((q - 0.35) / 0.65) ** 2;
      if (q >= 1) { sl.ph = 'out'; sl.t0 = sl.t; sl.k0 = sl.k; }
    }
    if (sl.ph === 'out') {
      const q = Math.min(1, (sl.t - sl.t0) / 0.8), e = q < 0.5 ? 4 * q * q * q : 1 - (-2 * q + 2) ** 3 / 2;
      sl.k = sl.k0 + (1 - sl.k0) * e;
      if (q >= 1) S.slow = null;
    }
  }
  function launchMatch(players) {
    uiMatchStart(); // シュートのゲージは毎試合0から
    S.players = players;
    initTops();
    S.elapsed = 0; S.tl = TIME_LIMIT; S.pendingEv = []; S.pendingEnd = null; S.lastKO = null; S.freezeT = 0;
    S.bgm = Math.floor(Math.random() * BGM_COUNT); // この試合の戦闘BGM(0 = mn5)
    broadcast({ t: 'start', players: S.players, mode: S.mode, stadium: S.stadium, sage: S.sageIds, bgm: S.bgm, lp: S.tops.map(t => [Math.round(t.a0 * 1000) / 1000, Math.round(t.sx), Math.round(t.sy)]) });
    enterGameState(); uiEnterGame();
  }
  // 試合の始まり: まず約2.5秒の開始演出 → 終わったら「3, 2, 1, GO」(カウントの音声もそこで鳴らす)
  function enterGameState() { S.phase = 'countdown'; S.phaseT = 3; S.goT = 0; S.introT = INTRO_TIME; }
  // =====================================================================
  //  1vs1トーナメント(4人以上)
  //  ランダムに組み合わせ、人数が2の累乗でないときはランダムにシード(1回戦なし)を作る。負けたら終わり。
  //  1試合ずつ「その2人だけ」のバトルを行い、勝ち上がった1人が優勝(次の試合で賢者モードが使える)
  // =====================================================================
  const TOUR_MIN = 4;
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function tourCreate(players) {
    const ids = shuffle(players.map(p => p.id)), n = ids.length;
    let size = 1; while (size < n) size *= 2;
    const byes = size - n, first = [];
    for (let i = 0; i < size / 2; i++) first.push(i < byes ? { a: ids.pop(), b: null, w: null, bye: true } : { a: ids.pop(), b: ids.pop(), w: null });
    shuffle(first);
    const rounds = [first];
    for (let m = size / 4; m >= 1; m /= 2) rounds.push(Array.from({ length: m }, () => ({ a: null, b: null, w: null })));
    const T = { roster: players.slice(), rounds, cur: null, champ: null };
    tourPropagate(T);
    return T;
  }
  const tourP = id => S.tour && S.tour.roster.find(p => p.id === id);
  // 勝ち上がりを次の回戦へ書き込む。シード(相手なし)と、抜けた人の試合は自動で決める
  function tourPropagate(T) {
    for (let r = 0; r < T.rounds.length; r++) {
      T.rounds[r].forEach((M, m) => {
        if (!M.w && M.bye && M.a) M.w = M.a;
        if (!M.w && M.a && M.b) {
          const la = tourP(M.a)?.left, lb = tourP(M.b)?.left;
          if (la && !lb) M.w = M.b; else if (lb && !la) M.w = M.a; else if (la && lb) M.w = M.a;
        }
        if (M.w && r + 1 < T.rounds.length) T.rounds[r + 1][m >> 1][m % 2 ? 'b' : 'a'] = M.w;
      });
    }
    const fin = T.rounds[T.rounds.length - 1][0];
    T.champ = fin.w || null;
  }
  // 次に行う試合(両方そろっていて、まだ勝者が決まっていない最初の試合)
  function tourNext(T) {
    for (let r = 0; r < T.rounds.length; r++) for (let m = 0; m < T.rounds[r].length; m++) {
      const M = T.rounds[r][m]; if (M.a && M.b && !M.w) return { r, m };
    }
    return null;
  }
  function roundName(T, r) {
    const left = T.rounds.length - 1 - r;
    return left === 0 ? '決勝' : left === 1 ? '準決勝' : left === 2 ? '準々決勝' : (r + 1) + '回戦';
  }
  function tourStart() {
    const alive = S.players.filter(p => !p.left);
    if (alive.length < TOUR_MIN) return uiMsg('トーナメントは' + TOUR_MIN + '人以上必要です(CPUを追加できます)。');
    S.tour = tourCreate(alive);
    uiBracket();
  }
  // 次の試合を始める(その2人だけでバトル)
  function tourPlayNext() {
    const T = S.tour; if (!T) return;
    tourPropagate(T);
    const nx = tourNext(T);
    if (!nx) { uiBracket(); return; }
    T.cur = nx;
    const M = T.rounds[nx.r][nx.m];
    uiBracketHide();
    launchMatch([tourP(M.a), tourP(M.b)]);
  }
  
  
  function initTops() {
    uiClearField(); // 前の試合でスタジアム奥に残っているモンスターを片付ける
    const n = S.players.length;
    const rnd = (a, b) => a + Math.random() * (b - a);
    S.tops = S.players.map((p, i) => {
      // シュート位置は毎回少しだけランダム(構える角度・着地点・走り出す向きと勢い)
      const a = i / n * Math.PI * 2 - Math.PI / 2 + rnd(-0.12, 0.12);
      const la = a + rnd(0.1, 0.4);                  // 着地点は少し回り込んだ位置
      const lr = R * rnd(0.5, 0.72);                 // 着地点の中心からの距離
      const va = la + Math.PI / 2 + rnd(0.25, 0.75); // 着地後はやや内向きの接線方向へ走り出す
      return {
        id: p.id, idx: i, p, T: TYPES[p.type], B: BLADES[p.blade] || BLADES.tiger, team: p.team, cpu: p.cpu,
        // 場外(壁の外)から投げ入れる
        sx: Math.cos(a) * (R + 50), sy: Math.sin(a) * (R + 50),
        lx: Math.cos(la) * lr, ly: Math.sin(la) * lr, va, lv: 170 * rnd(0.85, 1.2), launching: true, onDisc: false,
        x: Math.cos(a) * (R + 50), y: Math.sin(a) * (R + 50),
        vx: 0, vy: 0, burst: null, railT: 0, railCd: 0, railDir: 1, hookT: 0, hookDir: 1,
        sageOK: S.mode !== 'tourney' && S.sageIds.includes(p.id), sage: 0, sageUsed: false, // トーナメントでは賢者モードなし
        // シュート: a0 = 発射台の角度 / aimSel = 選んでいる向き(-1 左斜め・0 中央・1 右斜め) / launchAt = 撃った時刻(まだなら null)
        a0: a, aimSel: 0, launchAt: null, shotGrade: null,
        cpuShot: p.cpu ? { pw: rnd(0.55, 1), aim: Math.random() < 0.4 ? rnd(-0.15, 0.15) : (Math.random() < 0.5 ? -1 : 1) * rnd(0.3, AIM_MAX), off: rnd(-0.28, 0.32) } : null,
        ang: Math.random() * 6.28, spin: 100, alive: true, out: false, flash: 0,
        awake: 0, awakeCd: 0, bounceT: 0, oilT: 0, air: 0, wob: 0, slip: false, form: 'base',
      };
    });
    S.tops.forEach(t => { if (t.cpuShot) t.aimSel = t.cpuShot.aim; });
    S.shots = {}; S.rec = []; S.recEv = []; S.replay = null; S.koT = null; S.slow = null; S.kakutei = null; // シュートの受付・リプレイ用の記録・スロー演出(確定演出)
    S.inputs = {}; S.puddles = []; S.oilQ = [];
    S.hits = 0; S.gimT = 0; S.meteors = []; S.meteorNext = 0; S.tiltAmp = 0; S.tiltDir = Math.random() * Math.PI * 2; // ギミック
  }
  
  // 戦績を記録する(ホストのみ): 参加者ごとの試合数・勝ち・負け・引き分け・トーナメント優勝回数と、最近の試合の結果
  function recordResult(w, r) {
    const ps = S.players.filter(Boolean);
    const winners = w == null ? [] : String(w).startsWith('T:') ? ps.filter(p => 'T:' + p.team === String(w)).map(p => p.id) : [w];
    for (const p of ps) {
      const st = S.stats[p.id] || (S.stats[p.id] = { games: 0, wins: 0, losses: 0, draws: 0, titles: 0 });
      st.name = p.name; st.color = p.color; st.cpu = !!p.cpu; st.games++;
      if (w == null) st.draws++; else if (winners.includes(p.id)) st.wins++; else st.losses++;
    }
    const winName = w == null ? '引き分け' : String(w).startsWith('T:') ? TEAM_NAMES[+String(w).slice(2)] + 'チーム' : ((ps.find(p => p.id === w) || {}).name || '???');
    let champ = null;
    if (S.tour && S.tour.champ && !S.tour.champDone) { S.tour.champDone = true; const st = S.stats[S.tour.champ]; if (st) { st.titles++; champ = st.name; } }
    S.hist.unshift({ mode: S.mode, names: ps.map(p => p.name), win: winName, reason: REASONS[r] || '', champ });
    if (S.hist.length > 30) S.hist.length = 30;
  }
  function endBattle(w, r) {
    // 優勝者を記録 → 次の試合で賢者モードが使える(チーム戦は勝ったチーム全員、引き分けは誰もなし)
    if (S.tour && S.tour.cur) {
      if (w == null) { w = S.players[Math.floor(Math.random() * S.players.length)].id; r = 'draw'; } // トーナメントは引き分けなし(判定)
      const { r: rr, m } = S.tour.cur; S.tour.rounds[rr][m].w = w; S.tour.cur = null;
      tourPropagate(S.tour);
      recordResult(w, r);
      if (S.tour.champ) S.sageIds = [S.tour.champ]; // 優勝者 → 次の試合で賢者モード
      if (S.headless) { S.phase = 'result'; return; } // 画面に出さずにまとめて計算した試合
    } else recordResult(w, r);
    if (!S.tour) S.sageIds = w == null ? [] : String(w).startsWith('T:') ? S.players.filter(p => 'T:' + p.team === String(w)).map(p => p.id) : [w];
    if (S.role === 'host') sendPads();
    S.phase = 'result';
    const msg = { t: 'end', w, r, tc: S.tour && S.tour.champ || null }; // tc: トーナメントの優勝者(決まったとき)
    uiEnd(msg); // 結果の画面(決着したらBGMをフェードアウト)
    broadcast(msg);
  }
  
  
  // ---------- CPU戦のスキップ(ホストのみ) ----------
  // 残っているコマが全部CPUになったら、演出なしで物理だけを一気に計算して、結果画面まで進める
  const cpuOnlyBattle = () => { const al = (S.tops || []).filter(t => t.alive); return al.length > 0 && al.every(t => t.cpu); };
  function fastSimulate() {
    S.fastSim = true;
    let n = 0;
    while (S.phase === 'battle' && n++ < 60 * 200) { step(DT); S.elapsed += DT; S.tl = Math.max(0, TIME_LIMIT - S.elapsed); checkWin(); }
    S.fastSim = false; S.pendingEv = [];
  }
  function skipToResult() {
    if (!isHost() || !cpuOnlyBattle() || (S.phase !== 'countdown' && S.phase !== 'battle')) return;
    uiSkipFx(); // 開始演出・カットインを片付ける
    if (S.phase === 'countdown') { S.introT = 0; S.phase = 'battle'; } // 開始演出・カウントダウン中でもOK
    S.freezeT = 0; S.goT = 0;
    fastSimulate();
  }
  // トーナメント: 次から続く CPU 同士の試合を、画面に出さずにまとめて決める(人が出る試合の手前で止まる)
  function tourSkipCpu() {
    const T = S.tour; if (!T || !isHost()) return;
    let nx, k = 0;
    while ((nx = tourNext(T)) && k++ < 64) {
      const M = T.rounds[nx.r][nx.m], a = tourP(M.a), b = tourP(M.b);
      if (!a.cpu || !b.cpu) break;
      T.cur = nx; S.players = [a, b]; initTops();
      S.elapsed = 0; S.tl = TIME_LIMIT; S.pendingEnd = null; S.lastKO = null; S.freezeT = 0;
      S.phase = 'battle'; S.headless = true;
      fastSimulate();
      S.headless = false;
    }
    S.phase = 'result';
    uiBracket();
  }
  const nextIsCpuMatch = () => { const T = S.tour, nx = T && tourNext(T); if (!nx) return false; const M = T.rounds[nx.r][nx.m]; return tourP(M.a).cpu && tourP(M.b).cpu; };
  function sideOf(t) { return S.mode === 'team' ? 'T:' + t.team : t.id; }
  const isEnemy = (a, b) => !(S.mode === 'team' && a.team === b.team);
  
  function checkWin() {
    // 決着が付いても少しだけ余韻を残してから結果を出す
    if (S.pendingEnd) {
      S.pendingEnd.t -= DT;
      if (S.pendingEnd.t <= 0) { const pe = S.pendingEnd; if (canReplay(pe)) startReplay(pe); else endBattle(pe.w, pe.r); }
      return;
    }
    const alive = S.tops.filter(t => t.alive);
    const sides = new Set(alive.map(sideOf));
    if (sides.size > 1 && S.elapsed < TIME_LIMIT) return;
    let w = null, r = S.lastKO || 'spin';
    if (sides.size === 1) w = [...sides][0];
    else if (sides.size > 1) {
      // 時間切れ: 残り回転量の合計が多い側の勝ち
      const sum = {};
      alive.forEach(t => { const k = sideOf(t); sum[k] = (sum[k] || 0) + t.spin; });
      w = Object.entries(sum).sort((a, b) => b[1] - a[1])[0][0];
      return endBattle(w, 'time');
    }
    S.pendingEnd = { w, r, t: 1.2 }; S.koT = S.elapsed; // 決着した時刻(リプレイの中心)
  }
  
  // =====================================================================
  //  決め手のスロー再生(1vs1トーナメントだけ・ホストの画面)
  //  試合中の動きを毎フレーム記録しておき、決着したら決着の少し前から REPLAY_SPEED 倍速で見せる。カメラは負けたコマに寄る
  // =====================================================================
  function recFrame() {
    if (!S.rec) return;
    S.rec.push({ t: S.elapsed, s: S.tops.map(t => ({ x: t.x, y: t.y, ang: t.ang, spin: t.spin, alive: t.alive, out: t.out,
      awake: Math.max(0, t.awake), awakeCd: t.awakeCd, air: t.air, wob: Math.min(1, t.wob), railT: t.railT, railDir: t.railDir, sage: t.sage,
      burst: t.burst ? { parts: t.burst.parts.map(P => ({ x: P.x, y: P.y, z: P.z, vy: P.vy, rest: P.rest, melt: P.melt })) } : null })) });
    if (S.rec.length > 240) S.rec.shift(); // 4秒分あれば足りる
  }
  const canReplay = pe => S.mode === 'tourney' && S.tour && !S.headless && !S.fastSim && pe.w != null && S.koT != null && S.rec && S.rec.length > 10 && pe.r !== 'left';
  function startReplay(pe) {
    const t0 = S.koT - REPLAY_PRE, t1 = S.koT + REPLAY_POST;
    const frames = S.rec.filter(f => f.t >= t0 && f.t <= t1);
    if (frames.length < 5) return endBattle(pe.w, pe.r);
    const loser = S.tops.find(t => t.id !== pe.w);
    S.replay = { frames, i: 0, t: frames[0].t, t1: frames[frames.length - 1].t, pe, loserIdx: loser ? loser.idx : 0,
      ev: (S.recEv || []).filter(e => e[0] >= frames[0].t && e[0] <= t1), evI: 0, hold: 0 };
    S.phase = 'replay';
    uiReplayStart(frames);
  }
  function updateReplay(dt) {
    const RP = S.replay; if (!RP) return;
    RP.t += dt * REPLAY_SPEED;
    while (RP.evI < RP.ev.length && RP.ev[RP.evI][0] <= RP.t) { const e = RP.ev[RP.evI++][1]; onEvent(e); if (S.role === 'host') S.pendingEv.push(e); } // 当たりの火花・音も同じ時刻に(参加者へも)
    if (RP.t >= RP.t1) { RP.hold += dt; if (RP.hold > 0.7) endReplay(); }
  }
  function endReplay() {
    const RP = S.replay; if (!RP) return;
    S.replay = null; uiReplayEnd();
    S.phase = 'battle'; endBattle(RP.pe.w, RP.pe.r);
  }
  // リプレイ中の描画用: 再生時刻の前後のフレームをなめらかにつなぐ
  function replayList() {
    const RP = S.replay, F = RP.frames;
    let i = RP.i; while (i + 1 < F.length && F[i + 1].t <= RP.t) i++; RP.i = i;
    const a = F[i], b = F[Math.min(F.length - 1, i + 1)], k = b.t > a.t ? clamp((RP.t - a.t) / (b.t - a.t), 0, 1) : 0;
    return S.tops.map((t, n) => {
      const A = a.s[n], B = b.s[n];
      return { ...A, p: t.p, x: A.x + (B.x - A.x) * k, y: A.y + (B.y - A.y) * k, ang: A.ang + (B.ang - A.ang) * k };
    });
  }
  // トーナメントの応援: 観戦している人(この試合で戦っていない人)が「応援」を押したら、全員の画面に吹き出しを出す
  // イベント ['ch', 応援した人のID, 名前, 色, 出てくる側(0 = 左・1 = 右), 高さ(0〜100)]
  function hostCheer(id) {
    if (S.mode !== 'tourney' || !S.tour || !(S.phase === 'countdown' || S.phase === 'battle' || S.phase === 'replay')) return;
    if (S.players.some(p => p.id === id)) return; // 戦っている本人は応援できない
    const p = tourP(id); if (!p) return;
    const now = Date.now(), at = S.cheerAt || (S.cheerAt = {});
    if (now - (at[id] || 0) < CHEER_GAP) return;
    at[id] = now;
    emit(['ch', id, p.name, p.color, Math.random() < 0.5 ? 0 : 1, Math.round(Math.random() * 100)]);
  }
  // 決着後の「もう一度」(トーナメントは表へ)
  function hostAgain() { if (S.tour) uiBracket(); else hostStart(); }
  // ロビーへ戻る(試合の途中でも。トーナメントの途中・終了後は、参加者全員をロビーに戻す)
  function toLobby() {
    if (S.tour) { S.players = S.tour.roster; S.tour = null; }
    S.players = S.players.filter(p => !p.left);
    S.tops = []; S.pendingEnd = null; S.replay = null; S.slow = null; S.kakutei = null;
    uiToLobby();
    S.phase = 'lobby'; S.introT = 0; S.freezeT = 0;
    broadcastLobby();
  }
  // ---- index.html 2127〜2571行目 ----
  const ZERO = { ax: 0, ay: 0, dashReq: false, awakeReq: false };
  const isAw = (t, type) => t.awake > 0 && t.p.type === type;
  // バランスの崩れやすさ = ブレード(wobRes) × タイプ(wobT。ラグナロクは装甲スリーブで崩れにくい)
  const wobK = t => t.B.wobRes * (t.T.wobT || 1);
  // ラグナロク+ギガハンマーの組み合わせだけの下方修正: 覚醒中の重さ3倍→2.4倍、削り(chip)は常に0.75倍・覚醒中は0.55倍
  const RAG_HAMMER = t => t.p.type === 'ragnarok' && t.p.blade === 'hammer';
  const chipOf = t => (t.B.chip || 0) * (RAG_HAMMER(t) ? (t.awake > 0 ? 0.55 : 0.75) : 1);
  
  // 覚醒中・水たまりの上などの性能補正
  function massOf(t) {
    let m = t.T.mass * t.B.mass;
    if (t.awake > 0) {
      if (t.p.type === 'ragnarok') m *= RAG_HAMMER(t) ? 2.4 : 3; // ラグナロク+ギガハンマーは重さ2.4倍まで(下方修正)
      else if (t.p.type === 'stamina') m *= 1.6;
      else if (t.p.type === 'defense') m *= 1.3;
    }
    return m;
  }
  const radOf = t => TOP_R * t.B.rad * (isAw(t, 'stamina') ? 1.35 : 1);
  const hitOf = t => t.T.hit * t.B.hit * (t.awake > 0 ? 1.2 : 1);
  const guardOf = t => t.T.guard * t.B.guard * (isAw(t, 'ragnarok') ? 0.7 : 1); // ディフェンスは guard 0 なので常にダメージなし
  // 弾かれやすさ: タイプごとの基本値 × 水たまりの上は踏ん張れず1.5倍 × 覚醒ラグナロクは重くて0.4倍
  const recvOf = t => (t.T.recv || 1) * t.B.recv * (t.slip ? 1.5 : 1) * (isAw(t, 'ragnarok') ? 0.4 : 1);
  // バーストしにくさ: ブレードの値 × 回転が弱るとバーストしやすい × 覚醒ラグナロクは重くて外れにくい
  const burstThOf = t => BURST_TH * t.B.burst * (0.55 + 0.45 * clamp(t.spin / 100, 0, 1)) * (isAw(t, 'ragnarok') ? 1.6 : 1);
  // 衝撃 f を受けたときのバースト判定(基準値を超えた分に応じた確率。BURST_SOFT 分超えると確実)
  function tryBurst(t, f, nx, ny) {
    if (!t.alive || t.launching || t.sage > 0) return false;
    if (S.kakutei && S.kakutei.a === t.idx) return false; // エクストリームの確定演出: 射出する側のコマは、演出が終わるまでバーストしない
    if (isAw(t, 'attack')) return false; // アタックは覚醒中(ロケット全開)はバーストしない
    if (S.dbgBurst) S.dbgBurst.push(f / burstThOf(t));
    const th = burstThOf(t);
    const awK = t.awake > 0 ? (BURST_AWAKE[t.p.type] ?? BURST_AWAKE_DEFAULT) : 1;
    const chance = Math.min(1, (f - th) / (th * BURST_SOFT)) * (BURST_TYPE[t.p.type] ?? 1) * awK;
    if (f <= th || Math.random() > chance) return false;
    t.burst = { dx: nx, dy: ny, parts: makeBurstParts(t, nx, ny) };
    ko(t, 'burst');
    return true;
  }
  
  // ---------- バーストで外れたパーツ(ブレード側・ビット) ----------
  // 物理側で飛ばして止まった場所を決める(見た目はこの位置をそのまま使う)。
  // スタジアムの中(すり鉢の床)で止まったら、5秒かけてオイルに溶ける → バランスの覚醒と同じオイルの水たまりになり、時間で消える
  function makeBurstParts(t, dx, dy) {
    const rs = () => Math.random() - .5, g = groundAt(t.x, t.y), bh = BITS[t.p.type].r;
    return [
      { x: t.x, y: g + 4, z: t.y, h: 4, vx: dx * 240 + rs() * 120, vy: 340 + Math.random() * 80, vz: dy * 240 + rs() * 120, rest: false, melt: -1 },  // ブレード側
      { x: t.x, y: g + bh, z: t.y, h: bh, vx: -dx * 90 + rs() * 120, vy: 200 + Math.random() * 60, vz: -dy * 90 + rs() * 120, rest: false, melt: -1 }, // ビット
    ];
  }
  function updateBurstParts(dt) {
    for (const t of S.tops) {
      if (!t.burst || !t.burst.parts) continue;
      for (const P of t.burst.parts) {
        if (P.melt >= 0) { P.melt = Math.min(PART_MELT, P.melt + dt); continue; } // 溶けている途中
        if (P.rest) continue;
        // 放物線で飛んで、床ではねながら止まる
        P.vy -= 900 * dt;
        P.x += P.vx * dt; P.y += P.vy * dt; P.z += P.vz * dt;
        const fl = groundAt(P.x, P.z) + P.h;
        if (P.y < fl) {
          P.y = fl; P.vy = Math.abs(P.vy) * 0.35; P.vx *= 0.55; P.vz *= 0.55;
          if (P.vy < 50) { P.vy = 0; if (Math.hypot(P.vx, P.vz) < 15) P.rest = true; }
        }
        // スタジアムの中で止まった → 溶け始める。水たまりは5秒かけて広がり、そのあと普通のオイルと同じ時間で消える
        if (P.rest && Math.hypot(P.x, P.z) < R - 8) {
          P.melt = 0;
          // 効果があるのは試合中だけ(決着後は見た目だけオイルになる)
          if (S.phase === 'battle') S.puddles.push({ x: P.x, y: P.z, life: PART_MELT + PUDDLE_LIFE, side: 'burst', r: 0, grow: PART_MELT, age: 0 });
          emit(['bo', Math.round(P.x), Math.round(P.z)]);
        }
      }
    }
  }
  
  function step(dt) {
    const A = S.tops;
    // エクストリームの確定演出: 当たりの受付時間が過ぎた・どちらかが脱落したら終わり(射出した側のバーストしない補正も解ける)
    const kk = S.kakutei;
    if (kk && ((kk.until != null && S.elapsed > kk.until) || !(A[kk.a] && A[kk.a].alive) || !(A[kk.b] && A[kk.b].alive))) S.kakutei = null;
    updateBurstParts(dt);
    // --- ラグナロクの変幻(15秒ごとにアタック形態 ⇄ スタミナ形態) ---
    const rf = ragFormAt(S.elapsed);
    for (const t of A) {
      if (t.p.type === 'ragnarok' && t.alive && t.form !== rf) {
        t.form = rf; t.T = ragStats(rf);
        emit(['tf', t.idx, rf === 'attack' ? 1 : 2]);
      }
    }
    // --- ギミック(メテオ・ティルト) ---
    updateGimmick(dt);
    // --- オイルの着弾と水たまりの寿命 ---
    for (let i = S.oilQ.length - 1; i >= 0; i--) {
      const o = S.oilQ[i];
      if ((o.t -= dt) <= 0) { S.puddles.push({ x: o.x, y: o.y, life: PUDDLE_LIFE, side: o.side }); S.oilQ.splice(i, 1); }
    }
    for (let i = S.puddles.length - 1; i >= 0; i--) {
      const p = S.puddles[i];
      if (p.grow) { p.age += dt; p.r = PUDDLE_R * Math.min(1, p.age / p.grow); } // バーストのパーツが溶けたオイル: 5秒かけて広がる
      if ((p.life -= dt) <= 0) S.puddles.splice(i, 1);
    }
  
    // --- 各ベイの運動 ---
    for (const t of A) {
      if (!t.alive) continue;
      // 投げ入れ中: 場外から着地点へ放物線で飛んでいく(当たり判定なし)
      if (t.launching) {
        if (t.launchAt == null) {
          // 発射待ち: 人はシュートが届いたら、CPUは決めたタイミングで撃つ。GOから SHOT_LATE 秒たっても撃たなければ弱いシュートで自動発射
          const sh = t.cpu ? (S.elapsed >= Math.max(0, t.cpuShot.off) ? t.cpuShot : null) : S.shots[t.id];
          if (sh) applyShot(t, sh);
          else if (S.elapsed >= SHOT_LATE) applyShot(t, { pw: 0.3, aim: t.aimSel, off: S.elapsed });
          else continue;
        }
        const f = Math.min(1, (S.elapsed + dt - t.launchAt) / LAUNCH_T);
        t.x = t.sx + (t.lx - t.sx) * f; t.y = t.sy + (t.ly - t.sy) * f;
        t.ang += visSpin(t.spin) * dt;
        if (f >= 1) {
          t.launching = false;
          t.vx = Math.cos(t.va) * t.lv; t.vy = Math.sin(t.va) * t.lv;
          emit(['land', Math.round(t.x), Math.round(t.y)]);
        }
        continue;
      }
      const inp = t.cpu ? cpuInput(t) : (S.inputs[t.id] || ZERO);
      const kind = t.p.type;
      // 覚醒の発動(効果10秒 → 切れてから16秒チャージすると再び使える。ビットをこすると最大で半分まで縮む)
      if (inp.awakeReq) {
        if (canAwaken(t)) { inp.awakeReq = false; startAwaken(t); }
        else if (!(t.awake <= 0 && t.awakeCd <= AW_GRACE)) inp.awakeReq = false; // チャージ残りわずかなら予約しておく
      }
      if (inp.sageReq) { inp.sageReq = false; if (canSage(t)) startSage(t); }
      if (t.sage > 0) { t.sage -= dt; if (t.sage <= 0) { t.sage = 0; S.padDirty = true; } }
      if (t.awake > 0) { t.awake -= dt; if (t.awake <= 0) { t.awake = 0; t.awakeCd = AWAKE_CHARGE; t.rubUsed = 0; t.cpuRub = 0.2 + Math.random() * 0.7; S.padDirty = true; } }
      else if (t.awakeCd > 0) {
        t.awakeCd = Math.max(0, t.awakeCd - dt);
        if (t.cpu) rubCharge(t, t.cpuRub * dt); // CPUもチャージ中はビットをこする(強さは毎回ランダム。人の平均くらい)
      }
  
      // 打ち上げられて空中にいる間は、操作も摩擦も効かずまっすぐ飛ぶ
      if (t.air > 0) {
        t.air -= dt;
        t.x += t.vx * dt; t.y += t.vy * dt;
        t.spin -= 2 * dt; t.ang += visSpin(t.spin) * dt;
        if (t.air <= 0) { t.air = 0; t.wob += WOB_LAND * wobK(t); emit(['land', Math.round(t.x), Math.round(t.y)]); }
        continue;
      }
  
      const aw = t.awake > 0;
      const sr = t.spin / 100;
      const d = Math.hypot(t.x, t.y) || 1, nx = t.x / d, ny = t.y / d;
      let accelMul = t.T.accel, fric = 0.7, decayMul = t.T.decay * t.B.decay, slope = 1.15 * (t.T.slope || 1); // slope: 中央へ戻る力(スタミナは強め)
  
      // 相手の水たまりの上ではツルツル滑る(踏ん張れず、斜面の戻る力も弱まる)
      t.slip = t.sage <= 0 && S.puddles.some(p => p.side !== sideOf(t) && Math.hypot(p.x - t.x, p.y - t.y) < (p.r ?? PUDDLE_R)); // バーストのオイル(side='burst')は全員に効く
      const oilK = OIL_RESIST[kind] ?? 1;
      if (t.slip) { fric = 0.03; accelMul *= 0.25; slope *= 0.35; t.wob += WOB_OIL * oilK * wobK(t) * dt; } // 滑るうえにバランスも崩れる
      // バランス崩れ: 回転が速ければ立ち直り、遅いと立ち直れずにどんどん傾いていく
      if (t.wob > 0) {
        t.wob = Math.max(0, t.wob - wobRecover(Math.min(1, sr)) * dt);
        const w = Math.min(1, t.wob);
        accelMul *= 1 - 0.85 * w; decayMul += 2.5 * w;
        if (t.wob >= 1) { t.toppled = true; ko(t, 'topple'); continue; } // 転倒
      }
  
      // すり鉢状の斜面: 中心へ引き寄せる
      let ax = -t.x * slope, ay = -t.y * slope;
      // ティルト: 床が傾いている間は、低い方へ坂を下るように流される
      if (S.tiltAmp > 0 && t.air <= 0) { ax += Math.cos(S.tiltDir) * TILT_G * S.tiltAmp; ay += Math.sin(S.tiltDir) * TILT_G * S.tiltAmp; }
      // 回転による旋回(ベイが円を描いて走る動き)
      const rot = kind === 'defense' ? -1 : 1; // ディフェンスは逆回転なので、走る向きも逆になる
      ax += -ny * 90 * Math.min(1.3, sr) * rot; ay += nx * 90 * Math.min(1.3, sr) * rot;
  
      // アタック(先が平らなビット): 斜面に逆らって外周をぐるぐる周回する
      // 操作はできないので、周回半径が周期的に縮む「花びら軌道」で内側の相手へ自動で切り込む
      const orbiting = (kind === 'attack' || t.form === 'attack') && !t.slip && t.wob < 0.3;
      if (orbiting) {
        const dd = Math.max(40, d);
        const keep = 1;
        t.flw = (t.flw ?? Math.random() * 6.28) + FLOWER_W * dt;
        const rT = ORBIT_R * (1 - (1 - FLOWER_IN) * Math.max(0, Math.sin(t.flw)) ** 2); // 今の目標半径
        const vt = -t.vx * ny + t.vy * nx;                       // 周回方向(反時計回り)の速さ
        // アタック覚醒で速く、ラグナロク(アタック形態)の覚醒は重さ3倍で遅くなる
        const vTarget = ORBIT_V * (isAw(t, 'attack') ? ORBIT_AW : 1) * (isAw(t, 'ragnarok') ? RAGNA_SLOW : 1) * (0.75 + 0.25 * Math.min(1, sr));
        // 円を描くための向心力(常に) + 周回半径へ戻る力(操作中は弱まる)
        const inward = Math.max(0, vt) ** 2 / dd - (rT - d) * 4 * keep;
        const vr = t.vx * nx + t.vy * ny;                        // 外向きの速さ(周回の軌道からはみ出す勢いを吸収する)
        ax = ax * (1 - keep) - nx * (inward + vr * 3 * keep) - ny * (vTarget - vt) * 6;
        ay = ay * (1 - keep) - ny * (inward + vr * 3 * keep) + nx * (vTarget - vt) * 6;
      }
  
      // カオスエクリプス: 偏芯のせいで、ときどき不規則な方向へ飛び出す
      if (t.B.lunge && t.air <= 0) {
        t.lungeT = (t.lungeT ?? Math.random()) - dt;
        if (t.lungeT <= 0) {
          t.lungeT = 0.9 + Math.random() * 0.9;
          // 向きは不規則だが、壁際では内側寄りに飛び出す(場外へ自滅しにくくする)
          const la = (d > R * 0.55 ? Math.atan2(-t.y, -t.x) + (Math.random() - 0.5) * 2.4 : Math.random() * Math.PI * 2), k = t.B.lunge * (0.5 + 0.5 * Math.min(1, sr));
          t.vx += Math.cos(la) * k; t.vy += Math.sin(la) * k;
        }
      }
  
      // エクストリーム: ダッシュレールに乗っている間は、壁沿いを猛スピードで駆け抜ける
      if (t.railCd > 0) t.railCd -= dt;
      if (t.railT > 0) {
        t.railT -= dt;
        const dir = t.railDir, tx = -ny * dir, ty = nx * dir;           // 進む向き(壁に沿った接線)
        // レールはポケットの手前で、内側へ曲がるフックになって終わる
        const aAhead = Math.atan2(t.y, t.x) + dir * RAIL_LOOK;
        const nearPocket = POCKETS.some(p => Math.abs(angDiff(aAhead, p)) < POCKET_W + 0.05);
        const hook = nearPocket;                                          // ポケット手前で降りるときだけフックで中央へ(時間切れのときは今まで通り壁沿いの勢いを残す)
        if (nearPocket || t.slip || t.air > 0) t.railT = 0;
        if (t.railT <= 0) {
          t.railT = 0; t.railCd = RAIL_CD;
          if (hook && !t.slip && t.air <= 0) { t.hookT = HOOK_T; t.hookDir = dir; t.hookV0 = Math.hypot(t.vx, t.vy); } // キュッと中央へ
          else { t.vx = t.vx * 0.5 - nx * 120; t.vy = t.vy * 0.5 - ny * 120; }      // オイルや空中で外れたときは、勢いを落として内側へ
        }
        else {
          const rT = R - radOf(t) - 6;                                   // レールの位置(壁のすぐ内側)
          const vt = t.vx * tx + t.vy * ty, vr = t.vx * nx + t.vy * ny;
          const inward = Math.max(0, vt) ** 2 / Math.max(40, d) - (rT - d) * 8;
          ax = -nx * (inward + vr * 4) + tx * (RAIL_V - vt) * 14; // 一気に最高速まで加速
          ay = -ny * (inward + vr * 4) + ty * (RAIL_V - vt) * 14;
          decayMul *= 0.6;                                               // レールの上は摩擦が少ない
        }
      }
      // フック: 進む向きを、壁沿いから中央へ一気に曲げて、超スピードのまま発射する
      if (t.hookT > 0) {
        t.hookT -= dt;
        const k = Math.min(1, (1 - Math.max(0, t.hookT) / HOOK_T) * 1.15), phi = HOOK_ANG * k;
        const tx = -ny * t.hookDir, ty = nx * t.hookDir;
        const sp = Math.max(t.hookV0 || 0, RAIL_V); // 勢いは殺さず、レールの最高速のまま中央へ発射
        const wx = Math.cos(phi) * tx - Math.sin(phi) * nx, wy = Math.cos(phi) * ty - Math.sin(phi) * ny;
        ax += (wx * sp - t.vx) * 24; ay += (wy * sp - t.vy) * 24;
      }
  
      if (aw) {
        if (kind === 'attack') {
          // ロケット全開: 周回スピードが圧倒的に上がるかわりに、スタミナの減りが早くなる
          decayMul *= ORBIT_DRAIN;
        } else if (kind === 'stamina') {
          // スタミナの減りが止まる
          decayMul = 0;
        } else if (kind === 'defense') {
          t.bounceT += dt;
          if (t.bounceT >= BOUNCE_P) { t.bounceT -= BOUNCE_P; shockwave(t, 90, 140); }
        } else if (kind === 'balance') {
          t.oilT -= dt;
          if (t.oilT <= 0) { t.oilT = OIL_INTERVAL; launchOil(t); }
        }
      }
  
      // 中央の回転ディスク: 上を通ると進行方向に押し出され、ディスクの回転方向にも引っぱられる
      const onDisc = d < DISC_R;
      if (onDisc) {
        const s = Math.hypot(t.vx, t.vy) || 1;
        ax += t.vx / s * DISC_PUSH - ny * DISC_SPIN;
        ay += t.vy / s * DISC_PUSH + nx * DISC_SPIN;
        if (!t.onDisc) emit(['bst', t.idx]);
      }
      t.onDisc = onDisc;
  
      // 回転が弱る・バランスを崩す・滑るとふらつく
      let wob = t.spin < 30 ? (30 - t.spin) * 6 : 0;
      if (t.wob > 0) wob += 700 * Math.min(1, t.wob);
      if (t.slip) wob += 216 * (OIL_RESIST[kind] ?? 1);
      if (wob) { ax += (Math.random() - .5) * wob; ay += (Math.random() - .5) * wob; }
      t.vx += ax * dt; t.vy += ay * dt;
      // 床との摩擦
      const f = Math.exp(-fric * dt); t.vx *= f; t.vy *= f;
      t.x += t.vx * dt; t.y += t.vy * dt;
      // 回転の自然減衰
      // 周回中は速さによる減りを小さくする(減りやすさはタイプの decay で決める)
      t.spin -= (2.2 * decayMul + (decayMul > 0 ? Math.hypot(t.vx, t.vy) * (orbiting ? 0.0006 : 0.002) : 0)) * dt;
      t.ang += visSpin(t.spin) * dt;
      t.flash = Math.max(0, t.flash - dt);
    }
  
    // --- ベイ同士の衝突(空中にいるベイは当たらない) ---
    for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) {
      const a = A[i], b = A[j];
      if (!a.alive || !b.alive || a.air > 0 || b.air > 0 || a.launching || b.launching) continue;
      if (a.sage > 0 || b.sage > 0) continue; // 賢者モード中はすり抜ける(当てることも当てられることもない)
      const dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy), minD = radOf(a) + radOf(b);
      if (dist >= minD || dist === 0) continue;
      const nx = dx / dist, ny = dy / dist, ma = massOf(a), mb = massOf(b);
      // めり込みを解消(重い方は動きにくい)
      const ov = minD - dist;
      a.x -= nx * ov * mb / (ma + mb); a.y -= ny * ov * mb / (ma + mb);
      b.x += nx * ov * ma / (ma + mb); b.y += ny * ov * ma / (ma + mb);
      const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (rv >= 0) continue; // すでに離れつつある
      const impact = -rv;
      // 弾性衝突
      const jn = (1 + 0.85) * impact / (1 / ma + 1 / mb);
      a.vx -= jn / ma * nx; a.vy -= jn / ma * ny;
      b.vx += jn / mb * nx; b.vy += jn / mb * ny;
      if (isEnemy(a, b)) {
        // 相手の回転が強いほど大きく弾かれる
        // 相手の回転が強いほど大きく弾かれる(ギガハンマーは吹き飛ばす力が強い)
        const ka = 130 * (b.spin / 100) * hitOf(b) * (b.B.smash || 1) / ma * recvOf(a), kb = 130 * (a.spin / 100) * hitOf(a) * (a.B.smash || 1) / mb * recvOf(b);
        a.vx -= nx * ka; a.vy -= ny * ka; b.vx += nx * kb; b.vy += ny * kb;
        // 回転ダメージ
        // 速く動いている側ほど有利(勢いで押し勝つ)
        const base = 0.8 + impact * 0.012;
        const va = Math.hypot(a.vx, a.vy), vb = Math.hypot(b.vx, b.vy), adv = va / (va + vb + 1);
        const dA = base * hitOf(b) * guardOf(a) * (0.5 + b.spin / 100) * (1.3 - 0.6 * adv);
        a.spin -= dA;
        const dB = base * hitOf(a) * guardOf(b) * (0.5 + a.spin / 100) * (0.7 + 0.6 * adv);
        b.spin -= dB;
        // 新ブレードの特殊効果
        for (const [me, op, dMe, dOp] of [[a, b, dA, dB], [b, a, dB, dA]]) {
          if (me.B.chip && op.T.guard > 0) op.spin -= chipOf(me);              // ニードルストーム: 当たるたびに必ず削る(ディフェンスには効かない)
          if (me.B.counter) op.spin -= dMe * me.B.counter;                   // ミラーリフレクト: 受けたダメージの一部をはね返す
          if (me.B.drain) me.spin = Math.min(100, me.spin + dOp * me.B.drain); // ドレインファング: 与えたダメージを吸い取る
        }
        // ディフェンス覚醒: 上がる瞬間なら打ち上げ、下がる瞬間なら叩きつけ
        for (const [df, o, sgn] of [[a, b, 1], [b, a, -1]]) {
          if (!isAw(df, 'defense') || o.air > 0) continue;
          if (df.bounceT / BOUNCE_P < 0.5) {
            o.air = AIR_T;
            o.vx += nx * sgn * 160 * recvOf(o); o.vy += ny * sgn * 160 * recvOf(o);
            emit(['lift', o.idx]);
          } else {
            o.wob += WOB_SLAM * wobK(o); o.spin -= 8;
            emit(['slam', o.idx]);
          }
        }
        // アッパー刃: 当てた相手を下からかち上げて、バランスを崩す
        for (const [hi, o] of [[a, b], [b, a]]) if (hi.B.upper > 0) o.wob += UPPER_WOB * hi.B.upper * clamp(impact / 300, 0.3, 1.5) * wobK(o);
        // バースト: 強い衝撃を受けると、ブレードとビットが外れて脱落(相手が重いほど、アッパー刃ほど衝撃が大きい)
        // エクストリームの確定演出のあとの当たりは、相手のバースト耐性がその瞬間だけ15%になる(ふだんのバースト判定の代わり)
        // (確定演出の当たりでは、射出した側のコマはバーストしない)
        const kk = kakuteiHit(a, b, nx, ny);
        if (!kk) {
          tryBurst(a, impact * hitOf(b) * Math.sqrt(mb / ma) * (1 + 1.5 * b.B.upper), -nx, -ny);
          tryBurst(b, impact * hitOf(a) * Math.sqrt(ma / mb) * (1 + 1.5 * a.B.upper), nx, ny);
        }
      }
      if (impact > 40) emit(['h', Math.round((a.x + b.x) / 2), Math.round((a.y + b.y) / 2), Math.min(9, 1 + Math.floor(impact / 70))]);
      if (impact > 8 && S.gimT <= 0) S.hits = (S.hits || 0) + 1; // ギミック用の衝突回数(軽いこすれは数えない)
    }
  
    // --- 壁・ポケット・回転切れ ---
    for (const t of A) {
      if (!t.alive || t.launching) continue;
      if (t.spin <= 0) { t.spin = 0; ko(t, 'spin'); continue; }
      const d = Math.hypot(t.x, t.y), rr = radOf(t);
      if (d > R - rr) {
        const nx = t.x / d, ny = t.y / d, vr = t.vx * nx + t.vy * ny;
        const a = Math.atan2(t.y, t.x);
        const inPocket = POCKETS.some(p => Math.abs(angDiff(a, p)) < POCKET_W);
        // 空中で勢いよく壁を越えたら場外。
        // エクストリームは壁にレールがあるので、地面を走っているコマは勢いよく当たってもレールが受け止める(場外にならない)
        const railCatch = S.stadium === 'extreme' && t.air <= 0;
        if (inPocket || (vr > OVER_SPEED && !railCatch) || (t.air > 0 && vr > 220)) {
          const k = inPocket ? R + 14 : R + 45;
          t.x = nx * k; t.y = ny * k; t.out = true; t.air = 0;
          ko(t, inPocket ? 'pocket' : 'over');
          continue;
        }
        // 壁で跳ね返る
        t.x = nx * (R - rr); t.y = ny * (R - rr);
        if (vr > 0) {
          t.vx -= 1.55 * vr * nx; t.vy -= 1.55 * vr * ny; t.spin -= vr * 0.006;
          if (vr > 60 && S.gimT <= 0) S.hits = (S.hits || 0) + 1; // 壁への衝突もギミックの回数に数える
          if (vr > 120) emit(['h', Math.round(t.x), Math.round(t.y), Math.min(9, 1 + Math.floor(vr / 120))]);
          // バイキング: 壁のトゲで回転が削られ、勢いよく当たるとバーストする
          if (S.stadium === 'viking' && vr > 60) {
            t.spin -= vr * VIKING_SPIN;
            if (vr > 120) emit(['spk', Math.round(t.x), Math.round(t.y)]);
            if (tryBurst(t, vr * VIKING_BURST, nx, ny)) continue;
          }
        }
        // エクストリーム: 壁に触れたらダッシュレールに乗る
        if (S.stadium === 'extreme' && t.railT <= 0 && t.railCd <= 0 && t.air <= 0) {
          const vt = -t.vx * ny + t.vy * nx; // 反時計回りの向きの速さ
          t.railDir = Math.abs(vt) > 30 ? Math.sign(vt) : (t.p.type === 'defense' ? -1 : 1);
          t.railT = RAIL_T;
          emit(['rail', t.idx]);
        }
      }
    }
    // --- エクストリーム: フックの壁 ---
    if (S.stadium === 'extreme') for (const t of A) if (t.alive && !t.launching && !t.out) hookCollide(t);
    // --- ポケット接近の警報(場外アウトしそう!) ---
    for (const t of A) if (t.alive && !t.launching && !t.out) pocketWarnCheck(t, dt);
  }
  
  // ポケットの手前の小さな範囲に「入った瞬間」に1回だけ警報を出す。範囲から出て入り直すとまた鳴る
  // ---------- エクストリーム: レールの両端は、床の上を内側へ曲がる「フックの壁」 ----------
  // 形(物理の座標 x = r cos a, y = r sin a): 外周の壁ぎわから接線方向に出て、ポケットの手前で中央へ曲がる
  function hookCurvePts(aEnd, sgn, n = 24) {
    // 2次ベジェ曲線(付け根 → 曲がり角 → 先端)を n 等分した点 {x, y}
    const P = (r, a) => ({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    const p0 = P(R - 3, aEnd - sgn * (RAIL_LOOK - 0.05)), p1 = P(R - 3, aEnd - sgn * 0.07), p2 = P(R - HOOK_IN, aEnd - sgn * 0.04), pts = [];
    for (let i = 0; i <= n; i++) {
      const k = i / n, u = 1 - k;
      pts.push({ x: u * u * p0.x + 2 * u * k * p1.x + k * k * p2.x, y: u * u * p0.y + 2 * u * k * p1.y + k * k * p2.y });
    }
    return pts;
  }
  let HOOK_LINES = null; // [[x0,y0,x1,y1], ...] フックの壁を細かい線分に分けたもの
  function hookLines() {
    if (!HOOK_LINES) {
      HOOK_LINES = [];
      for (const [a0, a1] of wallSegments([...POCKETS].sort((a, b) => a - b)))
        for (const [aEnd, sgn] of [[a1, 1], [a0, -1]]) {
          const pts = hookCurvePts(aEnd, sgn, 16);
          for (let i = 0; i < pts.length - 1; i++) HOOK_LINES.push([pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, sgn]);
          // フックの先から外周へまっすぐ伸びる壁(ここから先はポケットへの通り道。フックの外側は壁で埋まっている)
          const tip = pts[pts.length - 1], ta = Math.atan2(tip.y, tip.x);
          HOOK_LINES.push([tip.x, tip.y, Math.cos(ta) * (R + 20), Math.sin(ta) * (R + 20), 0]);
        }
    }
    return HOOK_LINES;
  }
  // コマがフックの壁に当たったら、いる側へ押し戻して跳ね返す(外周の壁と同じ跳ね返り方)
  function hookCollide(t) {
    const rr = radOf(t) * 0.9, HW = 1.5; // 壁の厚みの半分
    for (const [x0, y0, x1, y1, sgn] of hookLines()) {
      const sx = x1 - x0, sy = y1 - y0, L2 = sx * sx + sy * sy;
      const k = clamp(((t.x - x0) * sx + (t.y - y0) * sy) / L2, 0, 1);
      const cx = x0 + sx * k, cy = y0 + sy * k;
      let dx = t.x - cx, dy = t.y - cy; const d = Math.hypot(dx, dy);
      if (d >= rr + HW || d < 1e-6) continue;
      dx /= d; dy /= d;
      t.x = cx + dx * (rr + HW); t.y = cy + dy * (rr + HW);
      const vn = t.vx * dx + t.vy * dy;
      if (vn < 0) {
        t.vx -= 1.55 * vn * dx; t.vy -= 1.55 * vn * dy;
        if (-vn > 120) emit(['h', Math.round(cx), Math.round(cy), Math.min(9, 1 + Math.floor(-vn / 120))]);
        if (-vn > 60 && S.gimT <= 0) S.hits = (S.hits || 0) + 1;
      }
      // 中央側からフックに沿って外周へ向かって当たったら、そのままレールに乗ってダッシュ(フックはレールの入口にもなる)
      const along = -(t.vx * sx + t.vy * sy) / Math.sqrt(L2); // フックの付け根(外周)へ向かう速さ
      const toCenter = -(cx * dx + cy * dy) > 0;               // コマがフックの中央側にいる
      if (sgn && toCenter && along > 60 && t.railT <= 0 && t.railCd <= 0 && t.hookT <= 0) {
        t.railDir = -sgn; t.railT = RAIL_T; emit(['rail', t.idx]);
      }
    }
  }
  
  function pocketWarnCheck(t, dt) {
    if (t.pkCd > 0) t.pkCd -= dt;
    const d = Math.hypot(t.x, t.y), a = Math.atan2(t.y, t.x);
    let pk = -1;
    for (let i = 0; i < POCKETS.length; i++) if (Math.abs(angDiff(a, POCKETS[i])) < PK_WARN_ANG) { pk = i; break; }
    const edge = R - radOf(t);                       // ここを越えるとポケットに落ちる
    const inside = pk >= 0 && d > edge - PK_WARN_IN;
    if (inside && !t.pkIn && !(t.pkCd > 0) && S.phase === 'battle') { t.pkCd = PK_WARN_CD; emit(['pw', pk]); }
    // 出たかどうかは少し余裕を持って判定(境目でガタガタ鳴り続けないように)
    if (inside) t.pkIn = true;
    else if (pk < 0 || d < edge - PK_WARN_IN - 15) t.pkIn = false;
  }
  
  // ギミック: 衝突が GIM_HITS 回たまったら発動 → 一定時間で終わり、また数え直す
  function updateGimmick(dt) {
    const st = S.stadium;
    if (st !== 'meteor' && st !== 'tilt') return;
    if (S.gimT <= 0 && (S.hits || 0) >= GIM_HITS) {
      S.gimT = st === 'meteor' ? METEOR_TIME : TILT_TIME; S.meteorNext = 0.3;
      if (st === 'tilt') S.tiltDir = Math.random() * Math.PI * 2;
      emit(['gim', st === 'meteor' ? 1 : 2]);
    }
    if (S.gimT > 0) {
      S.gimT -= dt;
      if (st === 'meteor') {
        S.meteorNext -= dt;
        if (S.meteorNext <= 0 && S.gimT > METEOR_FALL) {
          S.meteorNext = METEOR_EVERY * (0.7 + Math.random() * 0.6);
          // 半分は誰かのコマを狙い、半分はランダムな場所へ
          const alive = S.tops.filter(t => t.alive);
          let x, y;
          if (alive.length && Math.random() < 0.5) { const t = alive[Math.floor(Math.random() * alive.length)]; x = t.x + (Math.random() - .5) * 60; y = t.y + (Math.random() - .5) * 60; }
          else { const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * R * 0.85; x = Math.cos(a) * r; y = Math.sin(a) * r; }
          S.meteors.push({ x, y, t: METEOR_FALL });
          emit(['mt', Math.round(x), Math.round(y)]);
        }
      } else {
        // ゆっくり傾いて、しばらく傾いたまま低い方向が回り、最後にゆっくり水平へ戻る
        const el = TILT_TIME - S.gimT;
        S.tiltAmp = Math.max(0, Math.min(1, el / 2, S.gimT / 2));
        S.tiltDir += TILT_SPIN * dt;
      }
      if (S.gimT <= 0) { S.gimT = 0; S.hits = 0; S.tiltAmp = 0; }
    }
    // 隕石の着弾
    for (let i = S.meteors.length - 1; i >= 0; i--) {
      const m = S.meteors[i]; m.t -= dt;
      if (m.t > 0) continue;
      S.meteors.splice(i, 1);
      for (const t of S.tops) {
        if (!t.alive || t.launching || t.air > 0 || t.sage > 0) continue;
        const dx = t.x - m.x, dy = t.y - m.y, d = Math.hypot(dx, dy);
        if (d > METEOR_R + radOf(t)) continue;
        const k = 1 - Math.min(1, d / (METEOR_R + radOf(t))), nx = d > 1 ? dx / d : 1, ny = d > 1 ? dy / d : 0;
        t.vx += nx * METEOR_PUSH * k / massOf(t) * recvOf(t); t.vy += ny * METEOR_PUSH * k / massOf(t) * recvOf(t);
        t.spin -= 12 * k * Math.max(0.3, guardOf(t));
        t.wob += 0.35 * k * wobK(t);
        if (tryBurst(t, 700 * k, nx, ny)) continue;
      }
      emit(['mi', Math.round(m.x), Math.round(m.y)]);
    }
  }
  
  // ディフェンスの着地の衝撃波: 近くの相手を少し押し返す
  function shockwave(t, radius, power) {
    for (const o of S.tops) {
      if (o === t || !o.alive || o.air > 0 || o.launching || o.sage > 0 || !isEnemy(t, o)) continue;
      const dx = o.x - t.x, dy = o.y - t.y, d = Math.hypot(dx, dy);
      if (d < radius && d > 1) {
        const k = power * (1 - d / radius) / massOf(o) * recvOf(o);
        o.vx += dx / d * k; o.vy += dy / d * k;
      }
    }
    emit(['sw', Math.round(t.x), Math.round(t.y), radius]);
  }
  // バランスのオイル弾: ランダムな方向へ撃ち、着弾点に水たまりを作る
  function launchOil(t) {
    const a = Math.random() * Math.PI * 2, dist = 90 + Math.random() * 120;
    let tx = t.x + Math.cos(a) * dist, ty = t.y + Math.sin(a) * dist;
    const dd = Math.hypot(tx, ty), lim = R - 50;
    if (dd > lim) { tx *= lim / dd; ty *= lim / dd; }
    S.oilQ.push({ x: tx, y: ty, t: OIL_FT, side: sideOf(t) });
    emit(['oil', t.idx, Math.round(t.x), Math.round(t.y), Math.round(tx), Math.round(ty)]);
  }
  function ko(t, reason) {
    t.alive = false; t.awake = 0; S.lastKO = reason; S.padDirty = true;
    if (reason === 'burst') emit(['bu', t.idx, Math.round(t.x), Math.round(t.y), Math.round(t.burst.dx * 100), Math.round(t.burst.dy * 100)]);
    else emit(['h', Math.round(t.x), Math.round(t.y), 10, t.out ? 1 : 2]); // 5番目: 1=場外 2=回転切れ・転倒
    emit(['ko', t.idx, t.out ? 1 : 0, reason]); // 「〇〇 バースト！」などの表示(参加者の画面にも出す)
  }
  
  // ---------- CPUの思考(コマは操作できないので、覚醒するタイミングだけを決める) ----------
  function cpuInput(t) {
    const inp = t.cpuIn || (t.cpuIn = { ax: 0, ay: 0, dashReq: false, awakeReq: false });
    t.cpuThink = (t.cpuThink || 0) - DT;
    if (t.cpuThink > 0) return inp;
    t.cpuThink = 0.1 + Math.random() * 0.15; // 反応の遅れ
    let tgt = null, bd = 1e9;
    for (const o of S.tops) {
      if (o === t || !o.alive || !isEnemy(t, o)) continue;
      const d = Math.hypot(o.x - t.x, o.y - t.y);
      if (d < bd) { bd = d; tgt = o; }
    }
    // 覚醒: ピンチか、相手が近いときに使う(アタックは減りが早いので、回転に余裕があって相手が近いときだけ)
    const wantAw = t.p.type === 'attack' ? (t.spin > 45 && tgt && bd < 160) : (t.spin < 55 || (tgt && bd < 150));
    if (t.awake <= 0 && t.awakeCd <= 0 && S.elapsed > 3 && wantAw && Math.random() < 0.06) inp.awakeReq = true;
    // 賢者モード: ピンチのとき(回転が弱った・相手が目の前)に逃げる
    if (t.sageOK && !t.sageUsed && t.awake <= 0 && S.elapsed > 3 && (t.spin < 35 || (tgt && bd < 75)) && Math.random() < 0.05) inp.sageReq = true;
    return inp;
  }
  
  // ---------- イベント(当たり・覚醒・衝撃波・オイルなど)----------
  // ホストはその場で演出し、同じものをクライアントへも送る
  function emit(ev) {
    hostEvent(ev); // 試合を止める演出(カットイン・3D召喚)の長さを決める
    if (!S.fastSim) onEvent(ev); // CPU戦をスキップして一気に計算している間は、演出も音も出さない
    if (S.recEv && S.mode === 'tourney' && !S.fastSim && (ev[0] === 'h' || ev[0] === 'land' || ev[0] === 'sw')) { // リプレイで同じ火花・音を出す
      S.recEv.push([S.elapsed, ev]); if (S.recEv.length > 300) S.recEv.shift();
    }
    if (S.role === 'host') S.pendingEv.push(ev);
  }
  
  // ---------- 参加者のコントローラーへ送る状態 ----------
  // 参加者は画面を描画しないので、送るのは「自分のコマの状態」だけ(軽くて速い)
  function canAwaken(t) { return !t.launching && t.sage <= 0 && t.awake <= 0 && t.awakeCd <= 0 && t.spin > 5 && S.phase === 'battle'; }
  // 賢者モード: 前回の優勝者だけ・1試合に1回・覚醒中は使えない
  function canSage(t) { return t.sageOK && !t.sageUsed && t.alive && !t.launching && t.awake <= 0 && t.sage <= 0 && S.phase === 'battle'; }
  function startSage(t) { t.sage = SAGE_TIME; t.sageUsed = true; S.padDirty = true; emit(['sg', t.idx]); }
  function startAwaken(t) { t.awake = AWAKE_TIME; t.bounceT = 0; t.oilT = 0.25; S.padDirty = true; emit(['aw', t.idx]); }
  function sendPads(only) {
    for (const [id, conn] of S.conns) {
      if (!conn.open || (only && id !== only)) continue;
      const t = S.tops.find(t => t.id === id);
      conn.send({ t: 'me', ph: S.phase === 'countdown' ? 'c' : 'b', cd: Math.round(S.phaseT * 100) / 100, vs: S.introT > 0 ? 1 : 0, fz: S.freezeT > 0 ? 1 : 0,
        al: !!(t && t.alive), sp: t ? Math.round(t.spin) : 0,
        aw: t ? Math.round(Math.max(0, t.awake) * 100) / 100 : 0, ac: t ? Math.round(t.awakeCd * 100) / 100 : 0,
        // 賢者モード: 0=使えない 1=使える 2=発動中 3=使用済み / sgt=残り秒数
        sg: !t || !t.sageOK ? 0 : t.sage > 0 ? 2 : t.sageUsed ? 3 : 1, sgt: t ? Math.round(t.sage * 100) / 100 : 0,
        sh: t && t.launchAt != null ? 1 : 0 }); // sh: 発射済み
    }
  }
  // 1対1の試合だけ、覚醒・賢者モードの瞬間にカットイン(トーナメントは3D召喚)を出して試合を止める
  const cutinOn = () => S.tops && S.tops.length === 2;
  // 試合を止める長さを決める(ホスト・サーバー。参加者の画面には止まった状態が届く)
  function hostEvent(ev) {
    if (S.fastSim || !isHost() || !cutinOn()) return;
    const p = S.players[ev[1]];
    if (ev[0] === 'aw' && p) {
      if (S.mode === 'tourney') {
        // 短縮がONなら、このトーナメントで2回目以降の召喚は短い版にする(ev[2] で参加者の画面にも伝える)
        const seen = S.tour ? (S.tour.seen || (S.tour.seen = new Set())) : new Set();
        const short = !!S.cutShort && seen.has(p.id); seen.add(p.id); ev[2] = short ? 1 : 0;
        S.freezeT = short ? SUMMON_LEN.short : SUMMON_LEN.full;
      } else S.freezeT = CUTIN_T;
    } else if (ev[0] === 'sg' && p) S.freezeT = CUTIN_T;
    else return;
    LOOP.acc = 0; S.padDirty = true;
  }
  // ---- index.html 2727〜3327行目 ----
  const NET_HZ = 30, NET_DELAY = 110; // 送る回数(1秒あたり) / 再生の遅らせ(ミリ秒)
  const PH_CODE = { countdown: 0, battle: 1, replay: 2, result: 3 }, PH_NAME = ['countdown', 'battle', 'replay', 'result'];
  const SL_PH = ['in', 'hold', 'fly', 'impact', 'out'];
  const nr1 = v => Math.round((v || 0) * 10) / 10, nr2 = v => Math.round((v || 0) * 100) / 100;
  // ---- index.html 3337〜3340行目 ----
  function makeSnap() {
    const list = hostDrawList();
    const o = list.map((t, i) => {
      const T = S.tops[i] || {};
      const fl = (t.alive ? 1 : 0) | (t.out ? 2 : 0) | (t.burst ? 4 : 0) | (t.launching ? 8 : 0) | (t.wait ? 16 : 0) | (T.sageOK ? 32 : 0) | (T.sageUsed ? 64 : 0);
      return [nr1(t.x), nr1(t.y), Math.round((t.ang || 0) * 1000) / 1000, nr1(t.spin), fl, nr2(t.awake), nr2(t.awakeCd), nr2(t.air), nr2(t.wob),
        t.railT > 0 ? (t.railDir || 1) : 0, nr2(t.sage), nr2(t.lf), nr2(t.aimSel)];
    });
    const snap = { t: 'st', ht: Math.round(performance.now()), ph: PH_CODE[S.phase] ?? 1, pt: nr2(S.phaseT), it: nr2(S.introT), fz: S.freezeT > 0 ? 1 : 0,
      tl: nr1(S.tl ?? TIME_LIMIT), el: nr2(S.elapsed), sl: S.slow ? [S.slow.idx, Math.round(S.slow.k * 1000) / 1000, SL_PH.indexOf(S.slow.ph)] : 0,
      rp: S.replay ? S.replay.loserIdx : -1, ta: nr2(S.tiltAmp), td: nr2(S.tiltDir), gt: S.gimT > 0 ? 1 : 0, hi: S.hits || 0, o, ev: S.pendingEv };
    list.forEach((t, i) => { if (t.burst && t.burst.parts) (snap.bp || (snap.bp = {}))[i] = t.burst.parts.map(P => [nr1(P.x), nr1(P.y), nr1(P.z), P.vy === 0 ? 0 : 1, P.rest ? 1 : 0, nr2(P.melt)]); });
    S.pendingEv = [];
    return snap;
  }
  function hostSendSnap(dt) {
    LOOP.snap += dt;
    if (LOOP.snap < 1 / NET_HZ) return;
    LOOP.snap = 0;
    if (!S.conns || !S.conns.size) { S.pendingEv = []; return; }
    broadcast(makeSnap());
  }
  // 描く・送るためのコマの状態(リプレイ中は記録をなめらかにつないだもの)
  function hostDrawList() {
    if (S.replay) return replayList();
    return S.tops.map(t => ({ p: t.p, x: t.x, y: t.y, ang: t.ang, spin: t.spin, alive: t.alive, out: t.out,
      awake: Math.max(0, t.awake), awakeCd: t.awakeCd,
      air: t.air, wob: Math.min(1, t.wob), burst: t.burst, railT: t.railT, railDir: t.railDir, sage: t.sage,
      // シュート: 発射待ちか・飛んでいる割合・狙いの向き(矢印の表示用)
      launching: t.launching, wait: t.launchAt == null, lf: t.launchAt == null ? 0 : clamp((S.elapsed - t.launchAt) / LAUNCH_T, 0, 1),
      aimSel: t.aimSel, a0: t.a0, sx: t.sx, sy: t.sy }));
  }
  // 試合を dt 秒ぶん進める(ホストの画面の毎フレーム・サーバーの時計から呼ぶ)
  function hostTick(dt) {
    if (S.phase === 'countdown' && S.introT > 0) {
      // 開始演出の間はカウントダウンを止めておく
      S.introT -= dt;
      if (S.introT <= 0) { S.introT = 0; uiIntroEnd(); }
    } else if (S.phase === 'countdown') {
      S.phaseT -= dt;
      if (S.phaseT <= 0) { S.phase = 'battle'; S.goT = 0.9; LOOP.acc = 0; uiGo(); }
    } else if (S.phase === 'battle' && S.freezeT > 0) {
      // カットイン中: 試合は止めたまま(終わったら、止めた瞬間の動きからそのまま再開)
      if (uiHoldFreeze()) S.freezeT = 0.001; else S.freezeT -= dt;
      if (S.freezeT <= 0) { S.freezeT = 0; uiUnfreeze(); S.padDirty = true; }
    } else if (S.phase === 'battle') {
      updateSlow(dt);
      LOOP.acc += dt * (S.slow ? S.slow.k : 1); // エクストリームのスロー演出中は、試合の進みもゆっくり
      while (LOOP.acc >= DT && S.phase === 'battle' && !(S.freezeT > 0)) {
        LOOP.acc -= DT; step(DT);
        S.elapsed += DT; S.tl = Math.max(0, TIME_LIMIT - S.elapsed);
        if (S.mode === 'tourney' && !S.headless) recFrame(); // 決め手のリプレイ用に記録
        checkWin();
      }
      checkRailSlow(); // レールから飛び出す先に相手がいそうなら、スロー演出
    } else if (S.phase === 'replay') updateReplay(dt);     // 決め手のスロー再生
    else if (S.phase === 'result') updateBurstParts(dt); // 決着後も、飛んだパーツが落ちて溶けるところまで見せる
  
    // 参加者へ状態を送る: コントローラーの状態(覚醒の開始・終了や脱落はすぐに、それ以外は1秒に10回)と、画面の状態(座標など・1秒に30回)
    if (S.role === 'host' && (S.phase === 'countdown' || S.phase === 'battle')) {
      LOOP.pad += dt;
      if (LOOP.pad >= 0.1 || S.padDirty) { LOOP.pad = 0; S.padDirty = false; sendPads(); }
    }
    if (S.role === 'host' && S.tops && S.tops.length && PH_CODE[S.phase] != null) hostSendSnap(dt);
  }
  // ---- index.html 3346〜3410行目 ----
  function wallSegments(pk) { // ポケットの間の壁の範囲 [a0, a1]
    const out = [];
    for (let i = 0; i < pk.length; i++) out.push([pk[i] + POCKET_W, (i + 1 < pk.length ? pk[i + 1] : pk[0] + Math.PI * 2) - POCKET_W]);
    return out;
  }
  // ---- index.html 4310〜4314行目 ----
  const BITS = {
    attack:   { L: 18, r: 6.5, hex: true },
    defense:  { L: 14, r: 8.5 },
    stamina:  { L: 26, r: 3.6 },
    balance:  { L: 20, r: 6.05 },
    ragnarok: { L: 20, r: 6.05, sleeve: true },
  };
  // ---- index.html 5454〜5460行目 ----
  // その地点の床の高さ(スタジアムの中 / 壁の上 / 場外の床)
  function groundAt(x, z) {
    const r = Math.hypot(x, z);
    return r <= R ? floorH(r) : r <= R + 30 ? BOWL_H + 24 : -68;
  }
  // ---- index.html 5689〜5693行目 ----
  const INTRO_TIME = 2.5; // バトル開始の演出の長さ(秒)
  // ---- index.html 8237〜8237行目 ----
  const RUB_CAP = 0.1;      // 0.1秒あたりに進められる上限(秒) → こすり続けても速さは最大2倍
  const RUB_MAX = AWAKE_CHARGE / 2; // 1回のチャージでこすって縮められるのは半分まで
  // ---- index.html 8262〜8263行目 ----
  function rubCharge(t, sec) {
    if (!(t && t.alive && t.awake <= 0 && t.awakeCd > 0 && S.phase === 'battle')) return false;
    const ok = Math.max(0, Math.min(sec, RUB_MAX - (t.rubUsed || 0))); // 半分まで縮めたら、それ以上はこすっても進まない
    t.rubUsed = (t.rubUsed || 0) + ok; t.awakeCd = Math.max(0, t.awakeCd - ok);
    return ok > 0;
  }
  // ---- index.html 8306〜8311行目 ----
  return { S, LOOP, DT, TIME_LIMIT, MAX_PLAYERS, TOUR_MIN, PART_MELT, TYPES, BLADES, STADIUMS, MODE_INFO, TEAM_NAMES, clamp, isImgData, makePlayer, addCpu, kick, reject, onHostData, onLeave, broadcast, broadcastLobby, hostStart, hostAgain, toLobby, tourPlayNext, tourSkipCpu, tourP, tourNext, skipToResult, cpuOnlyBattle, nextIsCpuMatch, hostTick, step, checkWin, initTops, launchMatch, makeSnap, sendPads, fastSimulate };
}
