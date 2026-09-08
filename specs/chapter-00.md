# チャプター0：カウンターとVitestの読み方

タスク入力より前に、0から始まるカウンター（+1とリセット）で要件→実装→UI確認→テスト追加を実演する。

初期画面をチャプター0にする。サイドバーから再訪でき、既存18課題と進捗IDは変更しない。導入の実演は18課題の完了件数に含めない。「タスク追加へ進む」でbasic-01へ移動する。

完成カウンターはsrc/tutorial/Counter.tsxで、学習者のTaskWorkspaceとは独立。コードとVitestの解説は初期閉のトグルにする。実際のソースをraw表示し、教材とテストの不一致を避ける。

テストはUI確認後に作成。it、render、screen、getByRole、userEvent.setup、async/await、expect、toHaveTextContent、準備/操作/検証、jsdomと実ブラウザの違い、cleanup、実行コマンド、失敗の読み方を説明する。テストのimport元と設定済み環境を明示する。

初期0→2回で2→リセット0を実ブラウザで観測し、ログ・画像・文書をdocs/walkthrough/chapter-00に保存する。提供した実演と、ユーザーがこれから再現する手順を区別する。
