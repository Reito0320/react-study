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
