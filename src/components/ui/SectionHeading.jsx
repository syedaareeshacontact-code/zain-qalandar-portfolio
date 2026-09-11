export default function SectionHeading({ number, label, title, description, children }) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow"><span>{number}</span> / {label}</p>
        <h2>{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {children}
    </div>
  );
}
