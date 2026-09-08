import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import Chapters from './chapters';
import userEvent from '@testing-library/user-event';

// 1. chapters.tsxに機能を実装する。
// 2. ブラウザで要件どおり動くことを確認する。
// 3. it.todoをitに変え、第二引数にテスト本体を記述する。
// [ID]と既存タイトルは画面の結果表示に使います。追加のテストはIDなしで自由に書けます。
// 書き方はチャプター0と docs/vitest-guide.md を参照。
describe('[basic-01] チャプター1：タスクを追加して一覧に表示', () => {
  beforeEach(() => {
    render(<Chapters />);
  });
  it('最初は空文字の状態で表示される', () => {
    const input = screen.getByRole('textbox', { name: 'input' });
    expect(input).toHaveValue('');
  });

  it('[basic-01-01] inputに文字を入力して追加ボタンを押すとタスクが追加され、inputが空文字になる', async () => {
    const input = screen.getByRole('textbox', { name: 'input' });
    const addButton = screen.getByRole('button', { name: 'add' });

    const user = userEvent.setup();
    await user.type(input, '筋トレ');
    expect(input).toHaveValue('筋トレ');
    await user.click(addButton);
    const taskTitle = await screen.findByText('筋トレ');
    expect(taskTitle).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('[basic-01-02] inputに文字を入力せずに追加ボタンを押すとerror messageが表示され、タスクも追加されない。', async () => {
    const addButton = screen.getByRole('button', { name: 'add' });

    const user = userEvent.setup();
    await user.click(addButton);

    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent(
      'タスク名を入力してください。空白だけでは追加できません。',
    );
  });
  it('[basic-01-03] 前後の空白を除いて追加し、同名の2件にも異なるIDを付けて追加順に表示する', async () => {
    const input = screen.getByRole('textbox', { name: 'input' });
    const addButton = screen.getByRole('button', { name: 'add' });

    const user = userEvent.setup();
    await user.type(input, ' こんにちは ');
    await user.click(addButton);
    await user.type(input, ' こんにちは ');
    await user.click(addButton);

    const items = screen.getAllByRole('listitem');
    expect(items[0]).not.toHaveAttribute(
      'data-test-id',
      items[1].getAttribute('data-test-id'),
    );
    expect(items[0]).toHaveTextContent('こんにちは');
    expect(items[1]).toHaveTextContent('こんにちは');
  });
});

// 要件を実装 → ブラウザで確認 → it.todoをitに変えて第二引数にテスト本体を記述。
// [ID]と既存タイトルは結果表示に使うため保持してください。追加テストはIDなしで自由に書けます。

describe('[basic-02] チャプター2：編集と削除を実装', () => {
  it.todo(
    '[basic-02-01] 選択したタスクを編集して保存すると、そのIDのタイトルだけが更新される',
  );
  it.todo('[basic-02-02] 編集をキャンセルすると元のタイトルが維持される');
  it.todo('[basic-02-03] 空白のみのタイトルでは保存できず、理由が表示される');
  it.todo('[basic-02-04] 同名タスクが2件あっても指定したIDの1件だけを削除する');
});

describe('[basic-03] チャプター3：完了と未完了を切り替え', () => {
  it.todo(
    '[basic-03-01] チェック操作で完了状態と状態を示すテキストが更新される',
  );
  it.todo(
    '[basic-03-02] 完了から未完了に戻すとチェック状態と未完了件数も元に戻る',
  );
  it.todo('[basic-03-03] タスクが0件のとき未完了件数は0になる');
});

describe('[basic-04] チャプター4：検索・絞り込み・並び替え', () => {
  it.todo(
    '[basic-04-01] タイトルの部分一致検索と完了状態フィルターを同時に適用する',
  );
  it.todo(
    '[basic-04-02] タイトル順に並べた後に検索を消して追加順に戻すと元の順序になる',
  );
  it.todo('[basic-04-03] 並び替えても元のタスク配列を変更しない');
  it.todo(
    '[basic-04-04] 検索に一致するタスクがないとき該当なしの案内を表示する',
  );
});

describe('[basic-05] チャプター5：期限と優先度を設定', () => {
  it.todo('[basic-05-01] 期限未設定でタスクを追加できる');
  it.todo('[basic-05-02] ラベルで取得した入力から期限を設定・変更・解除できる');
  it.todo(
    '[basic-05-03] 優先度をlow・medium・highに変更でき、一覧に期限と優先度を文字で表示する',
  );
  it.todo('[basic-05-04] キーボードだけで期限と優先度を編集できる');
});

describe('[intermediate-01] 中級1：状態遷移をreducerに整理', () => {
  it.todo(
    '[intermediate-01-01] 追加・編集・削除・完了のactionが基礎と同じ結果を返す',
  );
  it.todo('[intermediate-01-02] 凍結した入力stateを変更せずに次の状態を返す');
  it.todo(
    '[intermediate-01-03] 存在しないIDへの操作では他のタスクを変更しない',
  );
});

describe('[intermediate-02] 中級2：Contextと独自Hookで共有', () => {
  it.todo(
    '[intermediate-02-01] 一覧で完了を切り替えると同じProviderのサマリーも更新される',
  );
  it.todo('[intermediate-02-02] 別のProviderのタスク状態には変更が伝わらない');
  it.todo(
    '[intermediate-02-03] Providerの外で利用用Hookを呼ぶと明確なエラーになる',
  );
});

describe('[intermediate-03] 中級3：入力とフォーカスを改善', () => {
  it.todo(
    '[intermediate-03-01] 編集開始時に選択したタスクの入力へフォーカスが移る',
  );
  it.todo(
    '[intermediate-03-02] 入力エラー時に下書きを保持し、入力欄とエラーをaria-describedbyで関連付ける',
  );
  it.todo('[intermediate-03-03] 保存後に適切な操作位置へフォーカスが戻る');
  it.todo(
    '[intermediate-03-04] キーボードだけで編集・保存・キャンセルを完了できる',
  );
});

describe('[intermediate-04] 中級4：非同期検索を独自Hookへ', () => {
  it.todo(
    '[intermediate-04-01] 検索語の変更で通信中を表示し、成功すると対応する結果を表示する',
  );
  it.todo(
    '[intermediate-04-02] 取得失敗の理由を表示し、再試行に成功すると一覧を表示する',
  );
  it.todo('[intermediate-04-03] アンマウント時に通信のAbortSignalが中断される');
});

describe('[intermediate-05] 中級5：計測して検索表示を最適化', () => {
  it.todo(
    '[intermediate-05-01] 最適化後も検索・絞り込み・並び替えの結果が変更前と一致する',
  );
  it.todo(
    '[intermediate-05-02] 検索語やタスクを変更すると古い計算結果を残さず最新結果を表示する',
  );
  it.todo(
    '[intermediate-05-03] 最適化後もタスクの編集と完了切替が正しい対象に反映される',
  );
});

describe('[nightmare-01] ナイトメア1：削除をUndoできるようにする', () => {
  it.todo(
    '[nightmare-01-01] 削除から5秒の直前まで取り消せて元の位置に復元され、サーバー削除は実行されない',
  );
  it.todo(
    '[nightmare-01-02] 5秒経過後は取り消せず、サーバー削除後の再取得でも削除が維持される',
  );
  it.todo(
    '[nightmare-01-03] 2件を連続削除して片方を取り消しても、もう片方の削除は維持される',
  );
  it.todo(
    '[nightmare-01-04] 削除保存の失敗を表示し、アンマウント時にタイマーを解除する',
  );
});

describe('[nightmare-02] ナイトメア2：完了切替を楽観的に反映', () => {
  it.todo(
    '[nightmare-02-01] API応答前に完了状態と件数を更新し、保存中を表示する',
  );
  it.todo(
    '[nightmare-02-02] 保存失敗時に直前の確定状態と件数へ戻して理由を表示する',
  );
  it.todo(
    '[nightmare-02-03] 保存中のタスクだけ切替を無効にし、他のタスクは操作できる',
  );
  it.todo(
    '[nightmare-02-04] 1件の保存失敗でも別タスクで成功した変更は維持される',
  );
});

describe('[nightmare-03] ナイトメア3：検索の競合と中断を制御', () => {
  it.todo(
    '[nightmare-03-01] 最後の入力から300ms未満は通信せず、300ms経過すると一度だけ通信する',
  );
  it.todo(
    '[nightmare-03-02] 新しい検索で古い通信を中断し、遅れて届いた古い成功で最新結果を上書きしない',
  );
  it.todo(
    '[nightmare-03-03] 古い通信の失敗と中断はエラー表示や最新通信のloadingを変更しない',
  );
  it.todo('[nightmare-03-04] アンマウント時に待機タイマーと通信を中断する');
});

describe('[nightmare-04] ナイトメア4：大量データでも入力を優先', () => {
  it.todo(
    '[nightmare-04-01] 重い検索表示の更新中も入力欄には最新の入力値を表示する',
  );
  it.todo(
    '[nightmare-04-02] 遅延表示の更新が完了すると最新の検索条件に一致する結果を表示する',
  );
  it.todo(
    '[nightmare-04-03] Transitionによる表示切替中は更新待ちを示し、完了後は最新の選択に一致する',
  );
});
