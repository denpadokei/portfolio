"use strict";

(() => {
  const FEATURED = [
    { name: "SongRequestManagerV2", copy: "Beat Saber のチャット連携楽曲リクエストマネージャー。★18 / fork 9 の代表作", category: "Beat Saber MOD" },
    { name: "TwitchChatOverlay", copy: "Twitch のチャット／イベントを Windows デスクトップにトースト通知として届ける WPF アプリ", category: "Windows アプリ" },
    { name: "HttpStatusExtention", copy: "HttpStatus では届かないゲーム情報を拡張して送信する MOD", category: "Beat Saber MOD" },
    { name: "openchamber-itachou-mod", copy: "OpenChamber を全画面背景＋半透明UIに染める痛PCスキン（JavaScript / CSS）", category: "アプリスキン" },
    { name: "pso2ngs-boost-bot", copy: "PSO2NGS のブーストキャンペーンを Discord へ通知する Python ボット", category: "自動化" },
    { name: "JapaneseIME", copy: "Beat Saber 1.40.8 のテキスト入力欄で日本語 IME を使えるようにする MOD", category: "Beat Saber MOD" },
    { name: "BeatmapInformation", copy: "譜面情報をプレイスペースの背後に表示する MOD", category: "Beat Saber MOD" },
    { name: "Voiceroid2Sharp", copy: "VOICEROID2 を外部から操作する C# ライブラリ", category: "ライブラリ" },
    { name: "CatCore", copy: ".NET Standard 2.0 の高性能チャットクライアントライブラリ（upstream へのコントリビューション）", category: "ライブラリ" },
    { name: "opencode-config-backup", copy: "OpenCode / OpenChamber の設定と AI 向け復手順を残す PowerShell プロジェクト", category: "AI / 自動化" }
  ];
  const QUICK_FILTERS = [
    { topic: "", label: "すべて" },
    { topic: "beatsaber-mod", label: "Beat Saber MOD" },
    { topic: "beatsaber-tool", label: "Beat Saber ツール" }
  ];
  const LANGUAGE_COLORS = {
    "C#": "#a98bfa", JavaScript: "#f1d363", Python: "#85bf75", PowerShell: "#80b9e8",
    TypeScript: "#62a4e8", "C++": "#ed9b77", C: "#a8b7c7", ShaderLab: "#e1a2ca"
  };
  const $ = (selector) => document.querySelector(selector);
  const byId = (id) => document.getElementById(id);
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  };

  let projects = [];
  let stats = null;
  let quickButtons = [];
  const grid = byId("project-grid");
  const featuredGrid = byId("featured-grid");
  const searchInput = byId("search-input");
  const languageFilter = byId("language-filter");
  const topicFilter = byId("topic-filter");
  const sortSelect = byId("sort-select");
  const forkToggle = byId("fork-toggle");
  const notice = byId("data-notice");

  function safeGithubUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && url.hostname === "github.com" ? url.href : "https://github.com/denpadokei";
    } catch {
      return "https://github.com/denpadokei";
    }
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const light = theme === "light";
    byId("theme-toggle").setAttribute("aria-label", light ? "ダークテーマに切り替え" : "ライトテーマに切り替え");
    try { localStorage.setItem("portfolio-theme", theme); } catch { /* 保存できない環境では現在の表示だけ切り替える */ }
  }

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem("portfolio-theme"); } catch { /* localStorage が使えない場合はOS設定に従う */ }
    const preferred = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    setTheme(saved === "light" || saved === "dark" ? saved : preferred);
    byId("theme-toggle").addEventListener("click", () => {
      setTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
    });
  }

  function formatDate(value) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "日付不明";
    const [year, month, day] = value.split("-");
    return `${year}.${month}.${day}`;
  }

  function validArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function makeTag(text, extraClass = "") {
    return make("span", `tag${extraClass ? ` ${extraClass}` : ""}`, text);
  }

  function addStats(parent, stars, forks) {
    const statsLine = make("div", "card-stats");
    const star = make("span", "", `★ ${Number.isFinite(Number(stars)) ? Number(stars) : 0}`);
    const fork = make("span", "", `⑂ ${Number.isFinite(Number(forks)) ? Number(forks) : 0}`);
    statsLine.append(star, fork);
    parent.append(statsLine);
  }

  function languagePill(language) {
    const pill = make("span", "language-pill", language || "言語未設定");
    const color = LANGUAGE_COLORS[language];
    if (color) pill.style.setProperty("--language-color", color);
    return pill;
  }

  function renderFeatured() {
    clearNode(featuredGrid);
    const byName = new Map(projects.map((project) => [project.name, project]));
    let rendered = 0;
    FEATURED.forEach((item, index) => {
      const project = byName.get(item.name);
      if (!project) return;
      rendered += 1;
      const link = make("a", "featured-card");
      link.href = safeGithubUrl(project.url);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `${project.name} — GitHubでプロジェクトを見る`);
      const top = make("div", "featured-top");
      top.append(make("span", "featured-number", `SELECTED / ${String(index + 1).padStart(2, "0")}`), make("span", "featured-arrow", "↗"));
      const title = make("h3", "", project.name);
      const description = make("p", "", item.copy);
      const bottom = make("div", "featured-bottom");
      const tags = make("div", "featured-tags");
      tags.append(makeTag(item.category));
      validArray(project.topics).slice(0, 2).forEach((topic) => tags.append(makeTag(topic)));
      const meta = make("div", "card-stats");
      meta.append(make("span", "", `★ ${Number(project.stars) || 0}`), make("span", "", `⑂ ${Number(project.forks) || 0}`));
      bottom.append(tags, meta);
      const footer = make("div", "repo-meta");
      footer.append(languagePill(project.language));
      const date = make("time", "", formatDate(project.updated || project.pushed));
      if (project.updated || project.pushed) date.dateTime = project.updated || project.pushed;
      footer.append(date);
      link.append(top, title, description, bottom, footer);
      featuredGrid.append(link);
    });
    if (!rendered) featuredGrid.append(make("p", "empty-state", "プロジェクトデータを読み込めませんでした。"));
  }

  function updateHeroStats() {
    if (!stats) return;
    byId("stat-repos").textContent = Number(stats.total) || 137;
    byId("stat-original").textContent = Number(stats.original) || 70;
    byId("stat-stars").textContent = Number(stats.totalStars) || 136;
    byId("stat-languages").textContent = validArray(stats.languages).length || 8;
  }

  function renderFilters() {
    const languages = [...new Set(projects.map((project) => project.language).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja"));
    const topics = [...new Set(projects.flatMap((project) => validArray(project.topics)).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja"));
    languages.forEach((language) => {
      const option = make("option", "", language);
      option.value = language;
      languageFilter.append(option);
    });
    topics.forEach((topic) => {
      const option = make("option", "", topic);
      option.value = topic;
      topicFilter.append(option);
    });
  }

  function syncQuickFilters() {
    quickButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.topic === topicFilter.value));
    });
  }

  function renderQuickFilters() {
    const container = byId("quick-filters");
    clearNode(container);
    quickButtons = QUICK_FILTERS.map((item) => {
      const count = item.topic
        ? projects.filter((project) => validArray(project.topics).includes(item.topic)).length
        : projects.length;
      const button = make("button", "quick-chip", item.label);
      button.type = "button";
      button.dataset.topic = item.topic;
      button.append(make("span", "quick-count", String(count)));
      button.addEventListener("click", () => {
        topicFilter.value = item.topic;
        // クイックフィルタの件数はフォーク込みなので、選択時はフォークも表示する
        forkToggle.checked = Boolean(item.topic);
        renderProjects();
      });
      container.append(button);
      return button;
    });
    syncQuickFilters();
  }

  function projectCard(project) {
    const article = make("article", "project-card");
    const titleLink = make("a", "repo-title-link");
    titleLink.href = safeGithubUrl(project.url);
    titleLink.target = "_blank";
    titleLink.rel = "noopener noreferrer";
    titleLink.setAttribute("aria-label", `${project.name} — GitHubで開く`);
    titleLink.append(make("h3", "", project.name));

    const descriptionText = String(project.description || "").trim() || "説明文はまだ登録されていません。";
    const description = make("p", "repo-description", descriptionText);
    const meta = make("div", "repo-meta");
    meta.append(languagePill(project.language));
    addStats(meta, project.stars, project.forks);
    const date = make("time", "", formatDate(project.updated || project.pushed));
    if (project.updated || project.pushed) date.dateTime = project.updated || project.pushed;
    meta.append(date);
    const topics = make("div", "repo-topics");
    const topicList = validArray(project.topics);
    topicList.slice(0, 4).forEach((topic) => topics.append(makeTag(topic)));
    if (topicList.length > 4) topics.append(makeTag(`+${topicList.length - 4}`, "tag-more"));
    article.append(titleLink, description, meta, topics);
    return article;
  }

  function renderProjects() {
    if (!projects.length) {
      clearNode(grid);
      grid.append(make("p", "empty-state", "プロジェクト一覧を表示できません。しばらくしてから再読み込みしてください。"));
      byId("result-count").textContent = "0 件";
      return;
    }
    const query = searchInput.value.trim().toLocaleLowerCase("ja");
    const language = languageFilter.value;
    const topic = topicFilter.value;
    const includeForks = forkToggle.checked;
    const filtered = projects.filter((project) => {
      if (!includeForks && project.isFork) return false;
      if (language && project.language !== language) return false;
      if (topic && !validArray(project.topics).includes(topic)) return false;
      if (query) {
        const searchable = [project.name, project.description, project.language, ...validArray(project.topics)]
          .filter(Boolean).join(" ").toLocaleLowerCase("ja");
        if (!searchable.includes(query)) return false;
      }
      return true;
    });
    const sort = sortSelect.value;
    filtered.sort((a, b) => {
      if (sort === "stars") return (Number(b.stars) || 0) - (Number(a.stars) || 0) || a.name.localeCompare(b.name);
      if (sort === "name") return a.name.localeCompare(b.name, "ja", { sensitivity: "base" });
      return String(b.updated || b.pushed || "").localeCompare(String(a.updated || a.pushed || "")) || a.name.localeCompare(b.name);
    });
    clearNode(grid);
    if (!filtered.length) {
      grid.append(make("p", "empty-state", "条件に合うプロジェクトはありません。検索語やフィルターを変更してください。"));
    } else {
      const fragment = document.createDocumentFragment();
      filtered.forEach((project) => fragment.append(projectCard(project)));
      grid.append(fragment);
    }
    const count = make("span", "", `${filtered.length}`);
    const label = make("span", "", ` / ${projects.length} 件`);
    const result = byId("result-count");
    clearNode(result);
    result.append(count, label);
    syncQuickFilters();
  }

  function renderLanguages() {
    const container = byId("language-bars");
    clearNode(container);
    const languages = validArray(stats && stats.languages);
    const max = Math.max(1, ...languages.map((entry) => Number(entry[1]) || 0));
    languages.forEach((entry) => {
      if (!Array.isArray(entry) || !entry[0]) return;
      const row = make("div", "language-row");
      row.append(make("span", "language-name", entry[0]));
      const track = make("span", "language-track");
      const fill = make("span", "language-fill");
      fill.style.setProperty("--bar-width", `${Math.max(3, (Number(entry[1]) || 0) / max * 100)}%`);
      const color = LANGUAGE_COLORS[entry[0]];
      if (color) fill.style.background = color;
      track.append(fill);
      row.append(track, make("span", "language-count", Number(entry[1]) || 0));
      container.append(row);
    });
    if (!container.childElementCount) container.append(make("p", "loading-note", "言語データを読み込めませんでした。"));
  }

  function renderTopics() {
    const container = byId("topic-cloud");
    clearNode(container);
    const topics = validArray(stats && stats.topics);
    topics.slice(0, 24).forEach((entry) => {
      if (!Array.isArray(entry) || !entry[0]) return;
      const chip = make("span", "topic-chip");
      chip.append(document.createTextNode(String(entry[0])), make("span", "", Number(entry[1]) || 0));
      container.append(chip);
    });
    if (!container.childElementCount) container.append(make("p", "loading-note", "トピックデータを読み込めませんでした。"));
  }

  function renderTimeline() {
    const container = byId("timeline");
    clearNode(container);
    const years = validArray(stats && stats.years);
    const max = Math.max(1, ...years.map((entry) => Number(entry[1]) || 0));
    years.forEach((entry) => {
      if (!Array.isArray(entry) || !entry[0]) return;
      const column = make("div", "year-column");
      const count = Number(entry[1]) || 0;
      column.append(make("span", "year-count", count));
      const track = make("span", "year-track");
      const bar = make("span", "year-bar");
      bar.style.setProperty("--bar-height", `${Math.max(5, count / max * 100)}%`);
      bar.setAttribute("aria-label", `${entry[0]}年: ${count}件`);
      track.append(bar);
      column.append(track, make("span", "year-label", entry[0]));
      container.append(column);
    });
    if (!container.childElementCount) container.append(make("p", "loading-note", "活動データを読み込めませんでした。"));
  }

  function showLoadNotice(failedFiles) {
    if (!failedFiles.length) return;
    notice.hidden = false;
    const localFile = window.location.protocol === "file:";
    notice.textContent = localFile
      ? "データを読み込めませんでした。file:// では読み込みが制限されます。README.md の手順でローカルサーバーを起動してください。"
      : `データを読み込めませんでした（${failedFiles.join("・")}）。ネットワークを確認し、README.md の方法でローカルサーバーから開いてください。`;
  }

  async function loadData() {
    const [projectResult, statsResult] = await Promise.allSettled([
      fetch("./data/projects.json", { cache: "no-store" }).then((response) => {
        if (!response.ok) throw new Error("projects");
        return response.json();
      }),
      fetch("./data/stats.json", { cache: "no-store" }).then((response) => {
        if (!response.ok) throw new Error("stats");
        return response.json();
      })
    ]);
    const failed = [];
    if (projectResult.status === "fulfilled" && Array.isArray(projectResult.value)) {
      projects = projectResult.value;
    } else {
      failed.push("projects.json");
    }
    if (statsResult.status === "fulfilled" && statsResult.value && typeof statsResult.value === "object") {
      stats = statsResult.value;
    } else {
      failed.push("stats.json");
    }
    updateHeroStats();
    if (projects.length) {
      renderFeatured();
      renderFilters();
      renderQuickFilters();
      renderProjects();
    } else {
      clearNode(featuredGrid);
      featuredGrid.append(make("p", "empty-state", "データを読み込めませんでした。"));
      renderProjects();
    }
    renderLanguages();
    renderTopics();
    renderTimeline();
    showLoadNotice(failed);
  }

  function initFilters() {
    [searchInput, languageFilter, topicFilter, sortSelect, forkToggle].forEach((control) => {
      control.addEventListener("input", renderProjects);
      control.addEventListener("change", renderProjects);
    });
    byId("project-filters").addEventListener("submit", (event) => event.preventDefault());
    byId("clear-filters").addEventListener("click", () => {
      searchInput.value = "";
      languageFilter.value = "";
      topicFilter.value = "";
      sortSelect.value = "updated";
      forkToggle.checked = false;
      renderProjects();
      searchInput.focus();
    });
  }

  initTheme();
  initFilters();
  loadData().catch((error) => {
    console.error("ポートフォリオの表示に失敗しました:", error);
    notice.hidden = false;
    notice.textContent = "表示中にエラーが発生しました。ページを再読み込みしてください。";
  });
})();
