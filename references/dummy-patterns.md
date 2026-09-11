# 典型的なダミー値・プレースホルダー一覧

これらの値がそのまま残っている場合は、ダミー値が消し忘れられている可能性が高い。ただし完全一致だけでなく、意味的に「明らかに仮の値」(例: 説明文が1単語だけ、URLのドメインがプロジェクト名と無関係、など)にも注意する。

## OGP/サイト基本情報

- ドメイン: `example.com`, `example.jp`, `yourdomain.com`, `your-site.com`, `localhost`, `test.local`, ステージング環境のドメインのまま(例: `xxx.sakura.ne.jp`の初期ドメイン、`xxx.herokuapp.com`など)
- サイト名: `Site Name`, `Your Site Name`, `My Site`, `サイト名`, `タイトル`, `Untitled`
- description: `description`, `Description`, `サイトの説明`, `TODO`, 空文字列, Lorem ipsum系のダミーテキスト
- OGP画像: 存在しないファイルを指している、あるいは明らかにデザインカンプ由来の仮画像(`dummy.png`, `sample.png`, `noimage.png`が本番想定でないのに残っている等)
- ページタイトル: `Home`, `Page Title`, `無題のページ`

## Google Analytics / Google Tag Manager

- GTM: `GTM-XXXXXX`, `GTM-XXXXXXX`, `GTM-0000000`, `GTM-YOURID`
- GA4: `G-XXXXXXXXXX`, `G-0000000000`
- UA(Universal Analytics、廃止済みだが古いコードに残っていることがある): `UA-XXXXXXX-X`, `UA-00000000-1`
- コメントアウトされたまま/条件分岐で無効化されたままになっているケースもあるので、grepで見つかったコードが実際に配信されるパスにあるか(本番ビルドで除外されていないか)も確認する。

## その他汎用パターン

以下は分野を問わず「仮の値」のサインとして扱う: `xxx`, `XXX`, `TBD`, `TODO`, `FIXME`, `hoge`, `foo`, `テスト`, `test123`, `dummy`, `sample`, `placeholder`, `your-`で始まる値, `00000000`のような明らかな連番/ゼロ埋め。
