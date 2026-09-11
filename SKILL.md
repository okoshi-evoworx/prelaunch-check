---
name: prelaunch-check
description: >-
  Web制作プロジェクトの公開前チェック。OGP設定・Google Analytics/Google Tag ManagerのID・favicon/apple-touch-icon・sitemap.xml/robots.txt・APIキーなど機密情報の露出・(WordPressの場合)セキュリティプラグインや.htaccess・バックアップ取得状況がダミー値のまま/未設定/未確認のまま残っていないかを、プロジェクトの実際のファイル構成を調べて確認する。「公開前チェック」「リリース前チェック」「本番公開できるか確認して」「サイト公開の準備」「go-liveチェック」「OGP確認」「GTM設定確認」「ダミーIDのままになっていないか」「WordPressのセキュリティ確認」「APIキーが漏れていないか」「バックアップ取ったか確認して」のような依頼で必ず使う。フレームワークを問わず(Astro/11ty/Next.js/Hugo/Jekyll/WordPress/プレーンなHTML等)使えるので、スタックが分からない/初めて見るプロジェクトでも積極的に使うこと。
---

# 公開前チェック(Prelaunch Check)

Web制作の現場では、開発中に使っていたダミー値(`https://example.com`、`Site Name`、`GTM-XXXXXX`など)がそのまま本番公開されてしまう事故が多い。このスキルは、そうした「ダミー値の消し忘れ」と「設定自体の抜け漏れ」を、プロジェクトごとに実際のファイルを調べて機械的に検出するための手順を示す。

固定のスクリプトを1本実行するのではなく、**プロジェクトごとに構成が違う前提で、都度grep/検索して実態を確認する**のがこのスキルの核。以下の項目を順番にチェックする(5〜7は該当する場合のみ)。

## 進め方の基本方針

1. まずプロジェクトのスタックを把握する(`package.json`の依存関係、ディレクトリ構成、拡張子などから判断: Astro / Next.js / 11ty / Hugo / Jekyll / WordPress / プレーンなHTML など)。
2. 各項目について、後述の「探し方」に従ってgrep・ファイル探索を行う。設定が1箇所に集まっているとは限らないので、`<head>`テンプレート・レイアウトファイル・共通コンポーネント・環境変数ファイルなど複数の候補を当たること。
3. 見つかった値を、[references/dummy-patterns.md](references/dummy-patterns.md)の典型的なダミーパターンと照合する。
4. 結果は下記の「レポート形式」でまとめて報告する。自動修正はせず、まず報告する(値の妥当性はプロジェクトの持ち主にしか判断できないため)。ただし本物のIDやドメインが分かっている場合や、ファイルの追加だけで直せるもの(robots.txt生成など)は、報告後に実施してよいか確認してから直す。

## 1. OGP設定

**確認すること**: タイトル・description・OGP画像のパスがダミー値のまま残っていないか、画像ファイルが実際に存在するか。

**探し方**:
- サイト共通のメタ情報を持つファイルを探す(例: `site.config.*`, `siteMetadata`, `_data/site.*`, `src/data/site.*`, `next.config.*`, `wp_options`のOGPプラグイン設定, Hugoの`config.toml`/`config.yaml`など)。1ファイルに集約されていないプロジェクトも多いので、`og:title`/`og:description`/`og:image`/`twitter:card`でgrepしてテンプレート側も確認する。
- `<meta property="og:image">` や `<meta property="og:title">` の実際の値を、ビルド後のHTML(あれば)またはテンプレートの変数展開元まで辿って確認する。**値がダミーでなくても**、ここで実際のURL/パスの「形」を見る。ベースURLと相対パスの連結ロジックが二重スラッシュになっていないか、絶対パスと相対パスが混在していないかは、値そのものがダミーかどうかとは別の観点で必ず確認する(テンプレート側の組み立てロジックのバグは、ダミー値と違ってgrep一発では見つからず、実際のレンダリング結果を見て初めて気づける)。
- 画像パスが指すファイルが実際に存在するか(`public/`・`static/`・`assets/`など、そのプロジェクトの静的ファイルルートを起点に)確認する。

**典型的なダミー値**: [references/dummy-patterns.md](references/dummy-patterns.md)の「OGP/サイト基本情報」を参照。

## 2. Google Analytics / Google Tag Manager

**確認すること**: 計測タグのIDがダミー値・サンプルIDのまま残っていないか。

**探し方**:
- `GTM-`, `G-`, `UA-`, `gtag(`, `googletagmanager.com`, `google-analytics.com` でプロジェクト全体をgrepする。
- WordPressなら計測タグ用プラグインの設定(管理画面のDBに入っている場合はコードから追えないこともあるので、その場合は「コード上には見つからなかった。管理画面側の設定を確認してください」と報告する)。
- 見つかったIDのフォーマットが正しいか(`GTM-XXXXXXX`のように英数字7桁程度、`G-XXXXXXXXXX`、`UA-XXXXXXX-X`)と、[references/dummy-patterns.md](references/dummy-patterns.md)記載のプレースホルダー文字列そのものになっていないかを確認する。

## 3. favicon / apple-touch-icon

**確認すること**: favicon(`.ico`/`.svg`/`.png`)とapple-touch-iconが用意されているか。

**探し方**:
- 静的ファイルルート(`public/`, `static/`, プロジェクトルート直下など)に`favicon.ico`・`favicon.svg`・`apple-touch-icon.png`(または`apple-touch-icon-precomposed.png`)があるか確認する。
- `public/`/`static/`のような慣習的なディレクトリが無いプロジェクトもある(ビルド設定側で個別ファイルをコピー対象に指定するタイプ)。その場合はビルド設定(webpack/viteの`copy`系プラグイン、11tyの`addPassthroughCopy`、その他アセットコピー設定)を読んで、実際にどのソースパスが配信対象になっているかを特定してから、そのパスにファイルが実在するか確認する。
- `<head>`テンプレート側で`<link rel="icon">`・`<link rel="apple-touch-icon">`が実際にファイルを参照しているか(パスが存在するファイルと一致しているか)も確認する。ファイルはあるがリンクされていない、あるいはその逆のケースがある。
- **注意**: 多くのビルドツールの「アセットコピー」系設定は、コピー元のファイルが存在しなくても警告を出さず静かに無視する。「ビルドがエラーなく通った」ことは「ファイルが実在する」ことの証明にならないので、必ずビルド後の出力ディレクトリに実ファイルが生成されているかを直接確認する。

## 4. sitemap.xml / robots.txt

**確認すること**: sitemap.xmlが生成される仕組みがあるか(またはビルド後に実在するか)、robots.txtがsitemap.xmlを参照しているか。

**探し方**:
- ビルド出力(`dist/`, `out/`, `build/`, `public/`(Next.jsなど)など)に`sitemap.xml`または`sitemap-index.xml`があるか確認する。ビルドしないと出てこない場合は、まずビルドを実行してから確認する。
- sitemap生成の仕組みが**存在しない**場合は、そのプロジェクトのスタックに応じた導入方法を[references/sitemap-by-stack.md](references/sitemap-by-stack.md)から選んで提案する。**Astroプロジェクトで、かつsite共通データファイル(`site.js`/`site.config.*`等)+ `public/`中心の画像運用という構成が確認できた場合は**、[assets/check-prelaunch.template.mjs](assets/check-prelaunch.template.mjs)をベースにした自動チェックスクリプト一式(このスキル自体の手動チェックを、そのプロジェクトに恒常的なnpm scriptとして設置するもの)を設置してよいか提案する。他のスタックでは無理にスクリプト化せず、reference記載の該当ツール導入を提案するだけでよい。
- robots.txtがあれば`Sitemap:`行でsitemap.xmlを正しく参照しているか確認する。なければ最低限`User-agent: * / Allow: /`だけでも用意されているか確認する。

## 5. APIキー・機密情報の露出(全スタック共通)

**確認すること**: サーバーサイド専用のシークレット(DB接続情報、決済APIの秘密鍵など)が、クライアントに配信されるファイルや公開ディレクトリに紛れ込んでいないか。

**探し方・注意点**: 詳細は[references/secrets-exposure.md](references/secrets-exposure.md)を参照。**「公開されて問題ないキー」(GA測定ID、GTM IDなど)と「公開してはいけないキー」を混同しないことが重要**なので、必ず先にこのreferenceを読んでから判断すること。見つけたキーの値そのものはレポートに書かない(場所と種類だけを報告する)。

## 6. WordPress固有チェック(WordPressの場合のみ)

`wp-config.php`や`wp-content/`の存在からWordPressだと判断した場合のみ、以下を確認する。それ以外のスタックでは不要。

**確認すること**: セキュリティプラグインの導入、自動アップデート設定、検索エンジンのインデックス許可設定、.htaccess(Apache環境)の基本的なセキュリティ強化設定。

**探し方**: 詳細は[references/wordpress-security.md](references/wordpress-security.md)を参照。`wp-cli`が使える環境なら`wp plugin list`や`wp option get`で確実に確認できるものが多いので、使えるか先に確認するとよい。使えない場合はファイル・ディレクトリの静的な確認に切り替え、それでも判断できないものは「管理画面で確認してください」と正直に報告する。

## 7. バックアップ

**確認すること**: 公開前の状態に戻せるバックアップ(DB・ファイル、またはコードの場合はデプロイ前のコミット/タグ)が用意されているか。

**このスキルにおける位置づけ**: 「実際に直前のバックアップを取得したか」は操作ログや管理画面の状態を見ないと分からず、ファイル調査だけでは確認しきれないことが多い。無理に自動判定せず、以下のように**手段の有無**までを確認し、実行済みかどうかは必ず人に確認を促す。

- コードベース(静的サイト/Git管理下のプロジェクト): デプロイ対象のコミットに対して、直前の本番相当の状態を指すコミット/タグが存在するか(`git log`, `git tag`で確認)。
- WordPress: バックアッププラグイン(`UpdraftPlus`, `BackWPup`, `All-in-One WP Migration`等)が導入されているか、`wp-cli`の`wp db export`が使える環境か。詳細は[references/wordpress-security.md](references/wordpress-security.md)。
- 上記いずれについても、「仕組みは確認できたが、実際に今回のリリース前に実行したかはコードから分からないため、実行したか確認してください」と必ず一言添えてレポートする。

## レポート形式

チェックが終わったら、必ず次の形式で報告する(見つからなかった項目は「未確認」として理由を添える。全部を無理に自動化しようとせず、コードから追えないものは正直にそう書く)。WordPress以外のプロジェクトでは項目6は「該当なし(WordPressではない)」の1行で済ませてよい。

```
## 公開前チェック結果

- [✅|❌|⚠️未確認] OGP: <詳細と根拠(見つけたファイル・値)>
- [✅|❌|⚠️未確認] GA/GTM: <詳細と根拠>
- [✅|❌|⚠️未確認] favicon/apple-touch-icon: <詳細と根拠>
- [✅|❌|⚠️未確認] sitemap.xml/robots.txt: <詳細と根拠>
- [✅|❌|⚠️未確認] APIキー・機密情報の露出: <詳細と根拠(値そのものは書かない)>
- [✅|❌|⚠️未確認|該当なし] WordPress固有(セキュリティプラグイン/.htaccess等): <詳細と根拠>
- [⚠️要確認] バックアップ: <手段の有無と、実行有無を確認してほしい旨>

### 対応が必要な項目
<❌の項目について、具体的にどのファイルの何を直せばよいか>

### その他気づいた点(あれば)
<各項目のどれにも厳密には当てはまらないが、公開前に直した方がよい問題(テンプレートの組み立てロジックのバグ、ビルド設定の不備など)があればここに書く>
```

## 参考

- [references/dummy-patterns.md](references/dummy-patterns.md) — OGP・ドメイン・GA/GTMの典型的なダミー値/プレースホルダー一覧
- [references/sitemap-by-stack.md](references/sitemap-by-stack.md) — スタック別のsitemap.xml導入方法
- [references/secrets-exposure.md](references/secrets-exposure.md) — APIキー・機密情報の露出チェックの詳細と、公開してよいキー/悪いキーの見分け方
- [references/wordpress-security.md](references/wordpress-security.md) — WordPress固有のセキュリティプラグイン・.htaccess・バックアップチェックの詳細
- [assets/check-prelaunch.template.mjs](assets/check-prelaunch.template.mjs) — Astro(site.jsパターン)向け自動チェックスクリプトのテンプレート
