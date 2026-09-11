// prelaunch-checkスキル用テンプレート。
//
// このスクリプトは「site.js のようなサイト共通データファイル + public/ 中心の画像運用」という
// astro_tailwindスタイルのAstroプロジェクトに構成が近い場合にだけ提案・設置すること。
// 他のスタック(11ty/Next.js/WordPress/プレーンHTML等)にはそのまま使えないので、
// references/sitemap-by-stack.md の該当ツール導入を代わりに提案する。
//
// 設置する際は、以下の "★調整" コメント箇所を実際のプロジェクトのファイル構成に合わせて書き換える。
// site.js の形(name/origin/description/ogImage というキー)が異なる場合は、
// そのプロジェクトの実際のキー名に合わせてチェック内容ごと調整すること。

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
// ★調整: サイト共通データのimportパス。無ければ該当プロジェクトの site 設定ファイルに置き換える。
import { site } from "../src/data/site.js";

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const distDir = path.join(rootDir, "dist"); // ★調整: ビルド出力先が異なる場合は変更
const publicDir = path.join(rootDir, "public"); // ★調整: 静的ファイルルートが異なる場合は変更

const results = [];

function check(label, ok, hint) {
  results.push({ label, ok, hint });
}

// --- OGP ---
// ★調整: ダミー値の実値("https://example.com"等)はプロジェクトの初期値に合わせる
check(
  "site.origin がダミー値のままでない",
  site.origin !== "https://example.com",
  "サイト共通データの origin を本番ドメインに設定してください",
);
check("site.name がダミー値のままでない", site.name !== "Site Name", "サイト共通データの name を設定してください");
check(
  "site.description がダミー値のままでない",
  site.description !== "description",
  "サイト共通データの description を設定してください",
);

const ogImagePath = path.join(publicDir, site.ogImage.replace(/^\//, ""));
check(
  `OGP画像(${site.ogImage})が public/ 配下に実在する`,
  fs.existsSync(ogImagePath),
  `${site.ogImage} を public/ 配下に配置してください`,
);

// --- GA/GTM ---
// ★調整: GTM/GAスニペットを持つファイルのパスとダミーIDのパターン
const gtagScriptPath = path.join(rootDir, "src/components/common/GtagScript.astro");
const gtagScript = fs.readFileSync(gtagScriptPath, "utf-8");
check(
  "GTM/GAのIDがダミー値のままでない",
  !gtagScript.includes("GTM-XXXXXX"),
  `${path.relative(rootDir, gtagScriptPath)} のGTM/GAのIDを実際のものに差し替えてください`,
);

// --- favicon / apple-touch-icon ---
check("public/favicon.ico が存在する", fs.existsSync(path.join(publicDir, "favicon.ico")));
check("public/favicon.svg が存在する", fs.existsSync(path.join(publicDir, "favicon.svg")));
check(
  "public/apple-touch-icon.png が存在する",
  fs.existsSync(path.join(publicDir, "apple-touch-icon.png")),
  "public/apple-touch-icon.png (180x180推奨)を追加してください",
);

// --- sitemap.xml / robots.txt ---
// ★調整: @astrojs/sitemap を導入した場合の出力ファイル名。他のsitemap生成手段なら変更する。
check(
  "sitemap-index.xml がビルド後に生成されている",
  fs.existsSync(path.join(distDir, "sitemap-index.xml")),
  '"npm run build" を先に実行してください(未導入なら @astrojs/sitemap を追加)',
);
check(
  "robots.txt がビルド後に生成されている",
  fs.existsSync(path.join(distDir, "robots.txt")),
  '"npm run build" を先に実行してください',
);

console.log("公開前チェック\n");
let hasFailure = false;
for (const { label, ok, hint } of results) {
  console.log(`  ${ok ? "✅" : "❌"} ${label}`);
  if (!ok) {
    hasFailure = true;
    if (hint) console.log(`     → ${hint}`);
  }
}

if (hasFailure) {
  console.error("\n未対応の項目があります。");
  process.exit(1);
} else {
  console.log("\nOK: すべての項目をクリアしています。");
}
