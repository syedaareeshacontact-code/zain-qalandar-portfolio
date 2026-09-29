export default function BarakahPage({ title, subtitle, items = [] }) {
  return (
    <section className="bk-page">
      <header className="bk-page-head">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>
      <div className="bk-page-grid">
        {items.map((item) => (
          <article className="bk-page-card" key={item.title}>
            <small>{item.kicker}</small>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
