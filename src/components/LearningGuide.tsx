import PersistenceGuide from './PersistenceGuide'
import DatabaseSetupGuide from './DatabaseSetupGuide'
import type { Lesson } from '../data/curriculum'

const stepTitles = ['要件を具体例にする', 'エディタで実装する', 'プレビューで操作する', 'テストを書いて実行する']
export function NextAction({ lesson, current }: { lesson: Lesson; current: number }) {
  if (lesson.id === 'basic-08') return <PersistenceGuide />
  if (lesson.id === 'basic-07' || lesson.id === 'intermediate-07') return <section className="next-action" aria-labelledby="next-action-title">
    <div className="eyebrow">LOCAL DATABASE LAB</div>
    <h2 id="next-action-title">PostgreSQL・Prisma学習ガイド</h2>
    <p>自分のPCで、DBの準備から保存まで確認します。詳しい手順は <code>docs/prisma-local.md</code> にまとめています。</p>
    {lesson.id === 'basic-07' ? <DatabaseSetupGuide /> : <>
      <p><code>server/prisma.test.ts</code>の参考例3件を読み、一覧取得のTODO2件を実装します。実PrismaClientの代わりにモックを渡すため、DBの起動は不要です。</p>
      <p><code>npm run test:prisma</code>で確認し、<code>npm run test:learning -- intermediate-07</code>で結果パネルを更新します。</p>
    </>}
    <p>PracticeTaskは独立した参考例です。タスク画面のAPI連携は基礎6で実装し、基礎8でこの保存方式をタスクAPIに組み込みます。</p>
    <p>提供済みテストの成功だけでは章は完了しません。実DBの確認／自分のテスト追加まで行い、下の工程を記録します。</p>
  </section>
  return <section className="next-action" aria-labelledby="next-action-title">
    <div className="eyebrow">YOUR NEXT ACTION</div>
    {lesson.id === 'basic-06' && <div className="api-test-setup">
      <h3>APIテストは専用サーバーで実行</h3>
      <p><code>server/exercises.test.ts</code> を編集します。起動・終了の準備は記述済み。各テストが空の専用領域から始まります。DB保存へ移行後は、初回に npm run db:test:setup を実行してください。</p>
      <pre><code>{'const res = await fetch(`${origin}/api/tasks`);'}</code></pre>
      <p>Nodeのfetchは相対URLを使えないため、POST・PATCH・DELETEにも <code>origin</code> を付けます。同じAPI実装を別ポートで起動するので、開発サーバーやダミーAPIへの接続は不要です。</p>
      <pre><code>npm test -- server/exercises.test.ts -t basic-06</code></pre>
    </div>}

    <h2 id="next-action-title">{current === 4 ? 'この課題の記録が完了しました' : `次にすること：${stepTitles[current]}`}</h2>
    {current === 0 && <><p>下の要件を読み、「何を操作したら、何が表示されるか」を具体例にします。</p><p className="action-example">確認例：{lesson.checks[0]}</p><p>期待する結果を説明できたら、下の「要件を読んだ」にチェックします。</p></>}
    {current === 1 && <><p>普段のエディタで <code>{lesson.file}</code> を開いて編集・保存します。</p><p>CSSの記述は不要です。通常のbutton・input・liに直接イベントを書けます。別コンポーネントを変更する必要はありません。使い方は docs/ui-kit.md を参照してください。このページにはコードを入力しません。全課題で同じタスクアプリを育てるので、課題を選んでもコードは切り替わりません。</p><p>保存してエラーなく表示できたら「実装した」にチェックします。</p></>}
    {current === 2 && <><p>プレビュー（PCでは右側、狭い画面では下側）で、確認項目を一つずつ操作します。</p><p className="action-example">{lesson.checks[0]}</p><p>期待と違えばコードに戻って修正。すべて確かめてから「UIで確認した」にチェックします。</p></>}
    {current === 3 && <><p>今操作した内容を、テストの「準備 → 操作 → 結果の確認」に置き換えます。</p><p><code>src/exercises/chapters.test.tsx</code>（React課題）のdescribeにあるit.todoの本文を書きます。APIの検証は <code>server/exercises.test.ts</code>、実ブラウザの操作は <code>e2e/exercises/</code> に追加します。</p><p>結果はターミナルで確認します。自分が追加したテストが実行されて成功したら「テストを追加・実行した」にチェックします。既存テストの成功だけでは、この課題の完了にはなりません。</p></>}
    {current === 4 && <p>チェックはあなたの確認記録です。コードの自動採点ではありません。「次の課題へ」から、今の実装に次の機能を追加しましょう。</p>}
    <p className="action-location">チェック欄は、この課題の下部「取り組みを記録」にあります。</p>
  </section>
}
