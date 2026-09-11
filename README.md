# prelaunch-check

Claude Code用のユーザーレベルSkill。Web制作プロジェクトの公開前チェックを、プロジェクトの実際のファイル構成を調べた上で行います。

## これは何をするものか

開発中に使っていたダミー値(`https://example.com`、`Site Name`、`GTM-XXXXXX`など)がそのまま本番公開されてしまう事故を防ぐため、以下の4項目を確認します。

1. **OGP設定** — タイトル・description・OGP画像のパスがダミー値のまま残っていないか、画像ファイルが実在するか
2. **Google Analytics / Google Tag Manager** — 計測タグのIDがダミー値・サンプルIDのまま残っていないか
3. **favicon / apple-touch-icon** — 用意されているか、実際にファイルが存在するか(リンクだけあってファイル実体がないケースも検出)
4. **sitemap.xml / robots.txt** — 生成される仕組みがあるか。無ければスタック(Astro/11ty/Next.js/Hugo/Jekyll/WordPress等)に応じた導入方法を提案

固定のスクリプトを1本実行するのではなく、**プロジェクトごとに構成が違う前提で、都度grep・ファイル探索して実態を確認する**のが設計の核です。そのため特定のフレームワークやディレクトリ構成に依存せず、Astro・11ty・Next.js・Hugo・Jekyll・WordPress・プレーンなHTMLなど、どんなプロジェクトでも使えます。

## インストール

このリポジトリを `~/.claude/skills/` 配下にクローンします。

```bash
git clone https://github.com/okoshi-evoworx/prelaunch-check.git ~/.claude/skills/prelaunch-check
```

Claude Codeのセッションを開始(または再起動)すると、ユーザーレベルのSkillとして認識されます。

## 使い方

チェックしたいプロジェクトのディレクトリでClaude Codeを開き、次のように依頼するだけです。

```
公開前チェックして
```

```
このサイト、本番公開できる状態か確認して
```

「公開前チェック」「リリース前チェック」「go-liveチェック」「OGP確認」「GTM設定確認」のような依頼で自動的にトリガーされます。

### 出力例

```
## 公開前チェック結果

- ❌ OGP: src/data/site.js の origin/name/description がダミー値のまま(https://example.com, Site Name, description)
- ❌ GA/GTM: GtagScript.astro のGTM IDが GTM-XXXXXX のまま
- ❌ favicon/apple-touch-icon: apple-touch-icon.png が存在しない(favicon.ico/svgは問題なし)
- ✅ sitemap.xml/robots.txt: @astrojs/sitemap で正常に生成されている

### 対応が必要な項目
1. src/data/site.js の origin/name/description を実際の値に置き換える
2. GtagScript.astro のGTM IDを実際のものに差し替える
3. public/apple-touch-icon.png (180x180推奨)を追加する
```

## 構成

```
prelaunch-check/
├── SKILL.md                          # チェック手順・探し方・レポート形式
├── references/
│   ├── dummy-patterns.md             # OGP/ドメイン/GA・GTMの典型的ダミー値一覧
│   └── sitemap-by-stack.md           # スタック別のsitemap.xml導入方法
└── assets/
    └── check-prelaunch.template.mjs  # site.js形式のAstroプロジェクト向け自動チェックスクリプトの雛形
```

Astroプロジェクトで、かつサイト共通データファイル(`site.js`等)+ `public/`中心の画像運用という構成が確認できた場合は、`assets/check-prelaunch.template.mjs`をベースにした自動チェックスクリプト一式を、そのプロジェクトへ恒常的なnpm scriptとして設置することも提案します。それ以外のスタックでは無理にスクリプト化せず、`references/sitemap-by-stack.md`記載のツール導入を提案する形にしています。

## ライセンス

[MIT](LICENSE)
