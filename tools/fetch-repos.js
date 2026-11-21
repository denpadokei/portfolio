// GitHub API (gh CLI 認証) から公開リポジトリを取得し、ポートフォリオ用の
// コンパクトなデータファイルを生成する。サイト本体はこの JSON を読み込む。
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const USER = 'denpadokei';
const OUT_DIR = path.join(__dirname, '..', 'data');

function api(page) {
  const url = `/users/${USER}/repos?per_page=100&page=${page}&type=owner&sort=pushed&direction=desc`;
  const raw = execFileSync('gh', ['api', url, '--hostname', 'github.com'], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    shell: false,
  });
  return JSON.parse(raw);
}

const all = [];
for (let page = 1; page <= 5; page++) {
  const chunk = api(page);
  all.push(...chunk);
  if (chunk.length < 100) break;
}

const uniq = new Map();
for (const r of all) uniq.set(r.full_name, r);

const repos = [...uniq.values()]
  .filter((r) => !r.archived && !r.disabled)
  .map((r) => ({
    name: r.name,
    full_name: r.full_name,
    description: r.description || '',
    language: r.language || '',
    topics: r.topics || [],
    stars: r.stargazers_count || 0,
    forks: r.forks_count || 0,
    watchers: r.subscribers_count || 0,
    isFork: !!r.fork,
    isTemplate: !!r.is_template,
    hasPages: !!r.has_pages,
    homepage: r.homepage || '',
    license: r.license ? r.license.spdx_id : '',
    created: (r.created_at || '').slice(0, 10),
    pushed: (r.pushed_at || '').slice(0, 10),
    updated: (r.updated_at || '').slice(0, 10),
    size: r.size || 0,
    defaultBranch: r.default_branch || 'main',
    url: r.html_url,
    ownerAvatar: r.owner && r.owner.avatar_url ? r.owner.avatar_url : '',
  }))
  .sort((a, b) => b.pushed.localeCompare(a.pushed));

const languages = {};
const topics = {};
const years = {};
for (const r of repos) {
  if (r.language) languages[r.language] = (languages[r.language] || 0) + 1;
  if (!r.isFork) {
    for (const t of r.topics) topics[t] = (topics[t] || 0) + 1;
    const y = r.created.slice(0, 4);
    if (y) years[y] = (years[y] || 0) + 1;
  }
}

const stats = {
  generatedAt: new Date().toISOString(),
  user: USER,
  total: repos.length,
  original: repos.filter((r) => !r.isFork).length,
  forks: repos.filter((r) => r.isFork).length,
  totalStars: repos.reduce((s, r) => s + r.stars, 0),
  totalForks: repos.reduce((s, r) => s + r.forks, 0),
  languages: Object.entries(languages).sort((a, b) => b[1] - a[1]),
  topics: Object.entries(topics).sort((a, b) => b[1] - a[1]).slice(0, 40),
  years: Object.entries(years).sort((a, b) => a[0].localeCompare(b[0])),
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'projects.json'), JSON.stringify(repos, null, 2), 'utf8');
fs.writeFileSync(path.join(OUT_DIR, 'stats.json'), JSON.stringify(stats, null, 2), 'utf8');
console.log(JSON.stringify({ total: stats.total, original: stats.original, forks: stats.forks, totalStars: stats.totalStars, languages: stats.languages.slice(0, 10), top: repos.slice(0, 5).map((r) => r.name) }, null, 2));
