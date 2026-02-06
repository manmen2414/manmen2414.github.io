# manmen2414.github.io
My introdution, some tools, and my playground.  

※Very Bad English!!!  

私の自己紹介といくつかのツールを提供する私の遊び場。  

## Light / Dark
ライトモードとダークモードに対応しています。  
右上のメニューから切り替えが可能です。  

Light mode and Dark mode are available.  
You can change them at top right menu.  

## English / 日本語
右上のメニューから、日本語と英語を切り替えることができます。  
翻訳している状態は基本ページをまたいでも維持されます。  

You can change English/Japanese at top right menu.  
It keeps selected language between pages.  

## Parameters / URLパラメータ
+ ja: 日本語 Japanese  
+ en: 英語 English  
+ dev: デバッグモード Debug mode  
+ ignore-korockle-connect: コロックルの接続を無視してUIを表示 Show ui without korockle connect  
  + /tools/korockle.html, /tools/korohub/korohub.html で動作  
  + It effects /tools/korockle.html, /tools/korohub/korohub.html  

## Warning / 注意
このプロジェクトはGit Submoduleを用いています。  
初期化時には`git submodule update --init --recursive`を実行してください。  

This project used Git Submodule.  
Please run `git submodule update --init --recursive` on init。  

## Memo for me / メモ
定期的に`git submodule update --remote --merge`でMameKorockleLibをアップデートする。