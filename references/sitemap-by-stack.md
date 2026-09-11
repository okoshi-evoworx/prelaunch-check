# スタック別 sitemap.xml 導入方法

sitemap.xmlが存在しない場合、そのプロジェクトのスタックに応じて以下を提案する。いずれも「サイトのURL一覧」を正として自動生成する仕組みが基本方針で、手書きのsitemap.xmlはページ追加のたびに更新漏れが起きるため最終手段とする。

## Astro

`@astrojs/sitemap`公式インテグレーションを使う。

```bash
npx astro add sitemap
```

または手動インストールの場合、`astro.config.mjs`に`site`(本番URL)を設定した上で:

```js
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://example.com", // 本番ドメインに置き換える
  integrations: [sitemap()],
});
```

ビルド時に`dist/sitemap-index.xml`(+`dist/sitemap-0.xml`)が自動生成される。`site`は可能な限りプロジェクトのサイト共通データ(`site.js`等)の値を参照させ、二重管理を避ける。

robots.txtは静的ファイルでは動的にURLを埋め込めないため、`src/pages/robots.txt.js`のようなAPIルートとして生成し、`Sitemap: `行に上記sitemapのURLを埋め込むのが良い([assets/check-prelaunch.template.mjs](assets/check-prelaunch.template.mjs)と対になる実例は元プロジェクトの`src/pages/robots.txt.js`を参照)。

## 11ty (Eleventy)

公式のsitemap専用プラグインは無いため、`.eleventy.js`でXMLテンプレートを1枚生成するのが一般的。`src/sitemap.xml.njk`のようなテンプレートを作り、`collections.all`を使って全ページURLを列挙する:

```njk
---
permalink: /sitemap.xml
eleventyExcludeFromCollections: true
---
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{%- for page in collections.all %}
  <url><loc>{{ site.origin }}{{ page.url }}</loc></url>
{%- endfor %}
</urlset>
```

## Next.js (App Router)

`app/sitemap.ts`(または`.js`)を作成し、`MetadataRoute.Sitemap`を返す関数をexportするだけでNext.jsが自動的に`/sitemap.xml`を生成する。公式ドキュメント: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap

## Hugo

`config.toml`で`sitemap`が標準機能として組み込まれており、追加設定なしで`/sitemap.xml`が生成される。出力先や優先度を変えたい場合のみ`[sitemap]`セクションで調整する。

## Jekyll

`jekyll-sitemap`プラグインを`Gemfile`と`_config.yml`の`plugins:`に追加するだけで、ビルド時に自動生成される。

## WordPress

Yoast SEOやRank MathなどのSEOプラグインが入っていればsitemap.xmlは自動生成されている(`/sitemap_index.xml`等)。プラグインが入っていない場合は、それらのプラグインの導入を提案するのが最も現実的(自前実装は避ける)。

## プレーンなHTML/静的サイトジェネレーターなし

ページ数が少なければ手書きでも許容されるが、更新漏れが起きやすいので、ビルドスクリプト(npm scriptやシェルスクリプト)で`*.html`を列挙してsitemap.xmlを生成する小さなスクリプトを書くことを提案する。
