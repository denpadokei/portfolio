// Twitch 関連リポジトリに GitHub topic `twitch` を付与する。
// 使い方: node tools/tag-twitch.js [--dry-run]
const { execFileSync } = require('child_process');

const DRY = process.argv.includes('--dry-run');
const TOPIC = 'twitch';

const REPOS = [
  'TwitchChatOverlay',        // Twitch チャンネルイベントのデスクトップ通知
  'TwitchRainmeter',          // Rainmeter で Twitch チャットを表示
  'EnhancedStreamChat',       // ストリーミングチャット統合 MOD
  'EnhancedStreamChat-v3',
  'StreamlabsChat',           // Streamlabs コメント表示 MOD
  'AndYou',                   // Bits / レイドを記録
  'StreamPartyCommand',       // 配信イベント連動 MOD
  'CatCore',                  // Twitch を含むチャットクライアントライブラリ
  'SongRequestManagerV2',     // Twitch チャットからの楽曲リクエスト
  'SongRequestManager',
];

function put(repo) {
  const path = `repos/denpadokei/${repo}/topics`;
  let names = [];
  try {
    names = JSON.parse(execFileSync('gh', ['api', path, '--jq', '.names'], {
      encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'],
    })).map(String);
  } catch {
    // topics 未設定でも PUT で作成できる
  }
  const next = [...new Set([...names, TOPIC])];
  if (names.includes(TOPIC) && names.length === next.length) return `SKIP  ${repo}`;
  if (DRY) return `DRY   ${repo}: [${names.join(',')}] -> [${next.join(',')}]`;
  try {
    execFileSync('gh', ['api', '--method', 'PUT', path, '--input', '-'], {
      input: JSON.stringify({ names: next }), encoding: 'utf8',
      maxBuffer: 8 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'],
    });
    return `SET   ${repo}: +${TOPIC}`;
  } catch (error) {
    return `ERROR ${repo}: ${String(error.stderr || error.message).trim().split('\n')[0]}`;
  }
}

for (const name of REPOS) console.log(put(name));
