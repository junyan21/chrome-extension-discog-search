---
layout: default
lang: ja
---

# Vinyl Lens Chrome Extension サポートページ

## 開発背景

この拡張機能は、レコードショッピングをより便利にするために作りました。

我が家では、自宅の居住スペース確保のために見境なくレコードを買うことは難しくなり、  
レコードを買うなら『デジタルでは買えないヴァイナルオンリーの音源である』という家族への言い訳が必要になっています。

これにはデジタルリリースの有無を確認する必要なわけですが、
レコード商品ページで拡張機能を使えば、その音源がヴァイナルオンリーのリリースかどうかを確認することができます。

## 利用方法

### 1. 事前準備：Gemini API キーの取得

この拡張機能は、Google Gemini AI を使用して Web ページから音楽情報を抽出し、Discogs で検索します。  
利用には**Gemini API キー**が必要です。

#### API キーの取得方法

1. [Google AI Studio](https://aistudio.google.com/app/apikey){:target="_blank" rel="noopener noreferrer"}にアクセス
2. Google アカウントでログイン
3. 「Create API key」をクリック
4. 「Create API key in new project」を選択
5. 生成された API キーをコピー

<div class="security-warning">
<h4>🔒 セキュリティ上の重要な注意事項</h4>
<p>API キーは機密情報です。他人と共有したり、パブリックリポジトリにコミットしたりしないでください。API キーが漏洩した場合は、すぐに無効化して新しいキーを生成してください。</p>
</div>

#### 推奨モデルの選択

- **推奨モデル：**`gemini-2.0-flash-lite`（低遅延、高速で低コスト）
  - 他のモデルを使うのも自由ですが、この拡張機能に高機能なモデルを使う必要性はあまりないと考えています。

**モデル一覧：**[Google AI Models](https://ai.google.dev/models){:target="_blank" rel="noopener noreferrer"}

### 2. 拡張機能の設定

1. Chrome 拡張機能のアイコンをクリック
2. 「設定」ボタン（歯車アイコン）をクリック
3. 取得した API キーを「Gemini API Key」欄に入力
4. 「保存」ボタンをクリック

### 3. 使用方法

1. レコードの商品単品ページを開く
2. Chrome 拡張機能のアイコンをクリック
3. 「検索開始」ボタンをクリック
4. 結果が表示されるまで待つ

#### 結果の見方

- **🎵 VINYL ONLY RELEASE**（緑色）：ヴァイナルオンリーのリリース
- **📀 MULTIPLE FORMATS AVAILABLE**（赤色）：複数フォーマットで発売

## 注意事項

### ⚠️ 注意事項

1. **検索精度について**

   - 音楽情報の検出・検索は 100%の正確性を保証するものではありません
   - AI による自動判定のため、誤った結果が表示される可能性があります

2. **API コストについて**

   - Gemini API の利用料金は利用者の負担です。
   - **ただし、ほとんどの場合は Google の無料利用枠内で利用可能だと思います**
   - 詳細は[Google AI Studio 料金](https://ai.google.dev/pricing){:target="_blank" rel="noopener noreferrer"}をご確認ください

3. **利用制限について**
   - 一部の Web サイトでは動作しない場合があります
   - Chrome 拡張機能の制限により、特定のページ（chrome://、拡張機能ページなど）では動作しません

### Q&A

**Q: 拡張機能が動作しない場合は？**

A: 以下をご確認ください：

- API キーが正しく設定されているか
- 現在のページが音楽関連のコンテンツを含んでいるか
- インターネット接続が正常か

**Q: 異なる結果が表示される場合は？**

A: AI の判定には多少の変動があります。最終的な確認はレーベルのサイト、Bandcamp, Discogs ページで直接確認することをお勧めします。

**Q: 料金はどのくらいかかりますか？**

A: 通常の使用では、Google の無料利用枠（月間 1,500 リクエスト）内で十分です。  
詳細は料金ページをご確認ください。

## 技術情報

- Gemini の利用背景

  - Google Gemini アカウントが多くのユーザーの方にとって最も用意が簡単そうであったので、Gemini にしました。
    - ついでに Google 検索機能も利用してるので、全体を Google でまとめる意図もありました。
    - Open AI, Anthropic については今のところ対応予定はありません。

- ソースコードは下記リポジトリにあります。

  - **GitHub**：[chrome-extension-vinyl-lens](https://github.com/junyan21/chrome-extension-vinyl-lens){:target="_blank" rel="noopener noreferrer"}

  - なにかあれば、[GitHub Issues](https://github.com/junyan21/chrome-extension-vinyl-lens/issues){:target="_blank" rel="noopener noreferrer"}でお問い合わせください。
