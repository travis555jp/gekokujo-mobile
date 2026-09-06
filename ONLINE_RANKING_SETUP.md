# オンラインランキング設定

この版は、Supabase を設定すると全プレイヤー共通の TOP10 を表示します。未設定時や通信失敗時は、従来の端末内ランキングを表示します。

## 設定手順

1. Supabase でプロジェクトを作成します。
2. SQL Editor を開き、`supabase-ranking.sql` の内容を実行します。
3. Connect ダイアログ（または Settings > API Keys）から次の2項目を確認します。
   - Project URL
   - Publishable key（旧形式の場合は anon key）
4. `ranking-config.js` に値を設定します。

```js
window.GEKOKUJO_RANKING_CONFIG = Object.freeze({
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseKey: 'YOUR_PUBLISHABLE_OR_ANON_KEY'
});
```

`service_role` や secret key は、絶対にブラウザ用ファイルへ入れないでください。

## 動作

- 初回スコア送信時だけプレイヤー名を入力します。
- 名前は同じ端末に保存され、次回以降も使われます。
- ランキング画面にはオンライン TOP10 が表示されます。
- 設定がない場合や通信できない場合は端末 TOP10 に切り替わります。

## 簡易版について

公開ブラウザから直接登録する構成のため、入力値の範囲チェックはありますが、不正スコアを完全には防げません。本格運用時はサーバー側でプレイ結果を検証する方式へ移行してください。
