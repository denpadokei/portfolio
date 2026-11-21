// Beat Saber 関連リポジトリに GitHub topics を付与する。
// サイトのクイックフィルタはこのトピックを元に絞り込む。
// 使い方: node tools/tag-beatsaber.js [--dry-run]
const { execFileSync } = require('child_process');

const DRY = process.argv.includes('--dry-run');

// ゲーム内で動作する MOD / プラグイン
const MODS = [
  'SongRequestManagerV2', 'HttpStatusExtention', 'VoiceNote', 'JapaneseIME',
  'HeadDistanceTravelled', 'DathBomb', 'ComboSound', 'BetterPageControll',
  'BeatmapInformation', 'VMCOculus', 'UltimateFireworks', 'Torimochi',
  'TogglePauseButton', 'StreamPartyCommand', 'StreamlabsChat', 'SmoothVRPointer',
  'ScoreFeedBackVibring', 'RankTextChanger', 'NJOPriset', 'NJOCheck',
  'MoreBats', 'Hukidashi', 'HttpHDTStatus', 'HMUIScrollViewBugfix',
  'GeforceExperienceHotKey', 'FontNao-ru', 'FlyingScoreOffset', 'DontPause',
  'DisableUnityGC', 'DisableSmoothCamera', 'DathMo', 'BSWindowManager',
  'BSPlayerDataBackup', 'AutoScreenShot', 'AndYou', 'AdjustOnlyGame',
  'BeatSaberConnector', 'OculusEnableHighFPS',
  'EnhancedStreamChat-v3', 'HttpSiraStatus', 'PracticePlugin', 'CustomMenuMusic',
  'SyncSaber', 'AdvancedNoHUD', 'AutoPauseStealth', 'CustomPlatforms',
  'HighlightBombs', 'CameraPlus', 'JDFixer', 'CountersPlus', 'PPCounter',
  'SaberFactory', 'BeatSaber_BetterSongList', 'DiTails', 'DiBris', 'NoteMode',
  'PlaylistManager', 'NullponSpectrum', 'beatleader-mod', 'EasyOffset',
  'AudioVisualizer-BeatSaber', 'SoundReplacer', 'TrickSaber', 'BeatSaverVoting',
  'CustomBanners', 'BeatSaberSongDataCore', 'SiraLocalizer', 'beatsaver-notehistory',
  'HitSoundChanger', 'BeatSaberSongBrowser', 'BeatSaverDownloader', 'NotesPredictor',
  'CenterDistanceCounter', 'EnhancedStreamChat', 'PlaylistLoaderPlugin',
  'SongRequestManager', 'BeatSaberMultiplayer', 'BiliSaber', 'FC-Percentage',
  'AudioSplitter', 'ScoreSaber-Plugin', 'OcuFix', 'BeatSaber-IPA-Reloaded',
];

// MOD 開発・管理などの周辺ツール
const TOOLS = [
  'beatsaber-modding-skills', 'BeatSaberModdingToolsMCP', 'BeatSaberBackUpTool',
  'LocalModAssistant', 'BeatServerBrowser', 'CreateAllSongPlaylist',
  'BeatSaberModdingTools', 'UnityModdingTools.Templates.BeatSaber', 'bs-manager',
  'beat-saber-overlay', 'beat-saber-overlay-1', 'beatsaber-overlay',
  'TournamentAssistant', 'BeatSaberMarkupLanguage',
];

function api(args) {
  return execFileSync('gh', ['api', ...args], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
}

function put(repo, topic) {
  const path = `repos/denpadokei/${repo}/topics`;
  let names = [];
  try {
    names = JSON.parse(api([path, '--jq', '.names'])).map(String);
  } catch {
    // 未設定でも作成できる
  }
  const next = [...new Set([...names, topic])];
  if (names.includes(topic) && names.length === next.length) return `SKIP  ${repo}`;
  if (DRY) return `DRY   ${repo}: [${names.join(',')}] -> [${next.join(',')}]`;
  try {
    execFileSync('gh', ['api', '--method', 'PUT', path, '--input', '-'], {
      input: JSON.stringify({ names: next }),
      encoding: 'utf8',
      maxBuffer: 8 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return `SET   ${repo}: +${topic}`;
  } catch (error) {
    return `ERROR ${repo}: ${String(error.stderr || error.message).trim().split('\n')[0]}`;
  }
}

for (const name of MODS) console.log(put(name, 'beatsaber-mod'));
for (const name of TOOLS) console.log(put(name, 'beatsaber-tool'));
