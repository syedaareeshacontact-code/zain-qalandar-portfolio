export default function DashboardHero({ title, subtitle, image }) {
  const titleId = `${title.toLowerCase().replaceAll(' ', '-')}-title`;

  return (
    <section className="bk-dashboard-hero" style={{ '--bk-hero-image': `url('${image}')` }} aria-labelledby={titleId}>
      <div className="bk-dashboard-hero-heading">
        <h1 id={titleId}>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <blockquote className="bk-quote">
        <p>“And establish prayer<br />and do not be among the forgetful.”</p>
        <cite>— &nbsp; Quran 2:43</cite>
      </blockquote>
    </section>
  );
}
