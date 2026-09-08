# 課題別テスト結果と編集の簡素化

- サイドバーは常設ボタンで開閉でき、閉じたときは問題・プレビューが横幅を使う。設定をブラウザ保存。
- LEARNING NOTEは削除し、課題に必要な各テストの結果articleに置き換える。
- 要件はtest-requirements.tsにIDと名前を定義し、describeに課題ID、itの名前に要件IDを付ける。
- テスト本体未記入はit.todo。空関数の成功を初期状態として配らない。ユーザーが書いた3件を保持し、必要最低限以外も追加可能。
- npm run test:learning -- basic-02 は指定課題をVitestで実行し、JSON結果を.learning/へ保存。npm run test:learning は全課題。失敗時は非0終了。
- APIは結果を読むだけ。ブラウザからシェル実行しない。実行日時・成否・TODO・スキップ・未検出を明示する。
- src/server/設定のハッシュを記録し、結果採取後の変更は再実行必要と表示。実行途中・実行エラー時に過去の成功を流用しない。
- TaskWorkspaceはネイティブHTMLに戻す。liやbuttonのonClickを同じファイルに直接書ける。task-workspaceの内側は共通CSSが適用される。TaskUIをたどる必要はない。
- Hooks/Express参考書は残すがテストの参考書は設けない。テストの書き方はチャプター0へ集約。各課題には必要テストと実行コマンドだけを表示。
