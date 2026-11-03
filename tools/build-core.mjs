// index.html(ゲーム本体)の「#core」部分を集めて、サーバー用の src/core.js を作る
// 使い方: node tools/build-core.mjs ../index.html
// #core で囲まれた部分は、画面(DOM)・音・3Dに触れない「試合の計算」なので、サーバーでもそのまま動く。
// 画面の処理は ui〜 という名前の関数(フック)で呼ばれるので、サーバーは同じ名前の関数を渡して差し替える。
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const src = process.argv[2];
if (!src) { console.error('使い方: node tools/build-core.mjs <index.html のパス>'); process.exit(1); }
const html = readFileSync(src, 'utf8');
const lines = html.split('\n');
const parts = [];
let on = false, start = 0;
lines.forEach((ln, i) => {
  if (/^\/\/ #core /.test(ln)) { if (on) throw new Error(`#core が閉じていません(${start + 1}行目)`); on = true; start = i; return; }
  if (/^\/\/ #\/core/.test(ln)) { if (!on) throw new Error(`#/core が余っています(${i + 1}行目)`); on = false; parts.push(`  // ---- index.html ${start + 2}〜${i}行目 ----`); return; }
  if (on) parts.push('  ' + ln);
});
if (on) throw new Error('#core が閉じていません');

// サーバーが差し替える関数(画面の処理)
export const HOOKS = ['onEvent', 'uiLobby', 'uiClearField', 'uiMsg', 'uiMatchStart', 'uiEnterGame', 'uiBracket', 'uiBracketHide', 'uiEnd', 'uiSkipFx',
  'uiIntroEnd', 'uiGo', 'uiHoldFreeze', 'uiUnfreeze', 'uiReplayStart', 'uiReplayEnd', 'uiToLobby'];
// サーバーから使う名前
const API = ['S', 'LOOP', 'DT', 'TIME_LIMIT', 'MAX_PLAYERS', 'TOUR_MIN', 'PART_MELT', 'TYPES', 'BLADES', 'STADIUMS', 'MODE_INFO', 'TEAM_NAMES',
  'clamp', 'isImgData', 'makePlayer', 'addCpu', 'kick', 'reject', 'onHostData', 'onLeave', 'broadcast', 'broadcastLobby',
  'hostStart', 'hostAgain', 'toLobby', 'tourPlayNext', 'tourSkipCpu', 'tourP', 'tourNext', 'skipToResult', 'cpuOnlyBattle', 'nextIsCpuMatch',
  'hostTick', 'step', 'checkWin', 'initTops', 'launchMatch', 'makeSnap', 'sendPads', 'fastSimulate'];

const out = `// 自動生成ファイル(直接編集しない): index.html の「#core」部分をそのまま集めたもの
// 作り直し: node tools/build-core.mjs <index.html のパス>
// 部屋ごとに createCore() を呼んで、部屋ごとに別々の状態(S)を持つ
/* eslint-disable */
export function createCore(hooks) {
  const { ${HOOKS.join(', ')} } = hooks;
${parts.join('\n')}
  return { ${API.join(', ')} };
}
`;
const dst = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'core.js');
writeFileSync(dst, out);
console.log('src/core.js を作りました(' + parts.length + '行)');
