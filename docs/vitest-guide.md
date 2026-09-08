# Vitestのコードを読む：カウンターからタスク追加へ

最初はアプリの「00 はじめに：カウンターで実演」を開いてください。完成したコードを読み、ボタンを触った後に、この解説へ進みます。

## 何を使っているのか

| 道具 | 担当 |
| --- | --- |
| Vitest | テストを実行し、合格・失敗を判定する。it / expectを提供 |
| React Testing Library | テスト用DOMにReactを描画し、要素を探す。render / screenを提供 |
| user-event | 利用者のクリックや文字入力を再現する |
| jest-dom | DOMに対するexpectの検証機能を追加する。toHaveTextContent / toHaveValueなど |
| jsdom | Node.js上でDOMを扱えるようにする。実ブラウザのレイアウトは再現しない |
| Playwright | 起動しているアプリを実ブラウザで操作する |

全部がVitestの機能というわけではありません。このプロジェクトでは既に設定・インストール済みです。

## 動くテストの全体

実ファイルは `src/tutorial/Counter.test.tsx`。カウンターを実装し、ブラウザで0→1→2→0を確認した後に追加しました。

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import Counter from './Counter';

it('最初は0を表示する', () => {
  render(<Counter />);
  expect(screen.getByRole('status', { name: 'カウント' })).toHaveTextContent(/^0$/);
});

it('＋1を2回押すと1、2の順に増える', async () => {
  // 準備：操作する人と、テスト用の画面を用意する
  const user = userEvent.setup();
  render(<Counter />);
  const count = screen.getByRole('status', { name: 'カウント' });
  const plusButton = screen.getByRole('button', { name: '＋1' });

  // 操作 → 結果の確認
  await user.click(plusButton);
  expect(count).toHaveTextContent(/^1$/);
  await user.click(plusButton);
  expect(count).toHaveTextContent(/^2$/);
});

it('増やした後にリセットすると0に戻る', async () => {
  const user = userEvent.setup();
  render(<Counter />);
  await user.click(screen.getByRole('button', { name: '＋1' }));
  await user.click(screen.getByRole('button', { name: 'リセット' }));
  expect(screen.getByRole('status', { name: 'カウント' })).toHaveTextContent(/^0$/);
});
```

## 1つずつ読む

### import：使う道具を読み込む

`render` と `screen` はReact Testing Library、`userEvent` はuser-event、`expect` と `it` はVitestから読み込みます。`Counter` は自分が検証したいコンポーネントです。ファイル名が `.tsx` なのは `<Counter />` というJSXを含むためです。

### it：一つの確認を名前付きで登録する

```ts
it('最初は0を表示する', () => { /* 確認する処理 */ });
```

最初の文字列は、失敗したときに何の確認か分かる名前。関数の中がテスト本体です。`test` という名前でも登録できます。すべてのケースを一つに詰め込むより、初期値・加算・リセットに分けると失敗の理由を追いやすくなります。

### 準備：操作する人と画面を用意する

```tsx
const user = userEvent.setup();
render(<Counter />);
```

`user` はクリックなどを再現するためのオブジェクトです。`render` はテスト用DOMにCounterを描画します。開いているブラウザを動かしているのではないため、`npm run dev` が動いていなくても、このテスト単体は実行できます。

### screen / getByRole：どの要素を操作・検証するか決める

```ts
const count = screen.getByRole('status', { name: 'カウント' });
const plusButton = screen.getByRole('button', { name: '＋1' });
```

`screen` はテスト用DOMから要素を探す道具です。スクリーンショットではありません。

`button` はボタンの役割、`name` は利用者に伝わる名前です。HTMLの `<button>＋1</button>` は、そのまま名前が「＋1」のボタンになります。`name` はHTMLのname属性を指定しているわけではありません。

`<output aria-label="カウント">` は、暗黙の役割が `status`、名前が「カウント」です。

`getByRole` は一致する要素が一つ必要です。0件・複数件なら失敗します。消えていることを確認したい場合は、0件でnullを返す `queryByRole` を使います。通信後など後から現れる要素を待つ場合は `await screen.findByRole(...)` を検討します。

### 操作：クリックを待つ

```ts
await user.click(plusButton);
```

クリック操作が完了してから次へ進みます。非同期処理を待つ `await` を使うため、テスト関数に `async` を付けます。待たずに結果を調べると、操作が反映される前に確認してしまう可能性があります。固定時間のsleepで解決する必要はありません。

### 検証：画面の結果を比べる

```ts
expect(count).toHaveTextContent(/^1$/);
```

`expect(count)` は検証対象のDOM要素を渡します。続く `toHaveTextContent` が、要素内の文字を検証します。これをmatcherと呼びます。

`/^1$/` は正規表現です。`^` は先頭、`$` は末尾なので「全体が1」と指定しています。文字列 `'1'` の部分一致で `'10'` を成功扱いすることを避けます。

`count` というstateを直接見ず、利用者が見る表示を確認しています。そのため、後で内部のstate管理を変更しても、同じ要件を検証できます。

### 各テストが0から始まる理由

各 `it` で新しく `render` します。また `src/test-setup.ts` では、各テスト終了後に `cleanup` を呼び、描画した画面を片付けます。前のテストで2になった値に依存しません。

同じsetupファイルで `@testing-library/jest-dom/vitest` を読み込み、`toHaveTextContent` などを使えるようにしています。`vitest.config.ts` の `environment: 'jsdom'` がDOM環境を指定しています。

## 実行結果の見方

```sh
npm test -- src/tutorial/Counter.test.tsx --reporter=verbose
```

プロジェクトのターミナルで実行します。`--` 以降はVitestへ渡されます。`--reporter=verbose` で各テスト名を表示できます。

- 実行対象が自分のテストファイルになっているか。
- テストが3件実行され、すべて成功しているか。
- 失敗した場合は、どのテスト名で、どのexpectが失敗したか。

成功したことだけでなく、対象と件数も確認します。基盤テストの成功と、これから自分で書く課題テストの成功を混同しないようにします。

### 失敗の読み方（説明用の例）

1回押した結果に対して「2」を期待した場合、期待は2・実際は1なので失敗します。この例は説明用で、今回の実演で発生した失敗の記録ではありません。

この場合、要件は「1ずつ増える」なのでテストの期待値が誤りです。逆に2回押しても1のままなら実装側を調べます。とにかく緑にするのではなく、要件に戻って判断します。

## 次のタスク追加で増える構文

| 構文 | 意味 |
| --- | --- |
| `await user.type(input, 'Reactを学ぶ')` | 入力欄に文字を入力する。カウンターにはなかった操作 |
| `expect(input).toHaveValue('')` | 入力値が空であることを確認する |
| `it.each(['', '   '])('入力 %j を拒否', async (title) => …)` | 各入力で同じテストを実行する。%jは入力をJSON表記で名前に出す |
| `expect(screen.queryByRole('alert')).not.toBeInTheDocument()` | エラー表示が存在しないことを確認する |
| `expect(element.textContent).toBe('Reactを学ぶ')` | 前後空白を含めて厳密に比較する。trimの検証に使う |

次はチャプター1のタスク追加を自分で実装します。準備→操作→検証の骨組みは同じです。

## 公式資料

- [Testing Library: user-event](https://testing-library.com/docs/user-event/intro/)
- [Testing Library: ByRole](https://testing-library.com/docs/queries/byrole/)
- [Vitest: 実行環境](https://vitest.dev/guide/environment.html)
