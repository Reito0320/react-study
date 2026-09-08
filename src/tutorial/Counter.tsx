import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <section className="counter-demo" aria-label="チャプター0のカウンター">
      <output aria-label="カウント">{count}</output>
      <div>
        <button onClick={() => setCount((current) => current + 1)}>＋1</button>
        <button onClick={() => setCount(0)}>リセット</button>
      </div>
    </section>
  );
}
