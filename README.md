# denpadokei — Developer Portfolio

GitHub の公開リポジトリ情報を表示する、ビルド不要の静的ポートフォリオです。日本語の紹介、注目プロジェクト、リポジトリ検索、言語・トピック別の絞り込み、活動統計を掲載しています。

## ローカルで確認

プロジェクトのルートで次を実行し、ブラウザーで `http://localhost:8000/` を開いてください。`file://` で直接開くとデータを取得できません。

```powershell
py -m http.server 8000
```

## データ更新

ルートで次を実行すると、`data/projects.json` と `data/stats.json` を再生成します。

```powershell
node tools/fetch-repos.js
```

更新後、変更したデータを GitHub に反映してください。

## Beat Saber のタグ

Beat Saber 関連リポジトリには GitHub topics を付与しています。

- `beatsaber-mod`: ゲーム内で動作する MOD / プラグイン（82件）
- `beatsaber-tool`: MOD 開発・管理などの周辺ツール（14件）
- `twitch`: Twitch チャット／配信イベント関連（10件）

`node tools/tag-beatsaber.js` と `node tools/tag-twitch.js` で一括付与できます（`--dry-run` で確認のみ）。サイトの「All Projects」にはこれらのトピックを使ったクイックフィルタがあります。

## 公開先

https://denpadokei.github.io/portfolio/
