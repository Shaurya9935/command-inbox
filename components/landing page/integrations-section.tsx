const integrations = [
  ["Gmail", "G", true],
  ["Google Calendar", "31", true],
  ["Slack", "S", false],
  ["Notion", "N", false],
  ["GitHub", "GH", false],
  ["Linear", "L", false],
  ["Outlook", "O", false],
] as const;

export function IntegrationBadge({
  name,
  glyph,
  live,
}: {
  name: string;
  glyph: string;
  live: boolean;
}) {
  return (
    <div className="integration-badge">
      <span
        className={`integration-logo ${
          live ? "bg-tint text-accent" : "bg-[#F0EFEA] text-muted"
        }`}
      >
        {glyph}
      </span>
      <span className="text-sm font-medium">{name}</span>
      <span
        className={`ml-auto rounded-full px-2 py-1 text-[8px] font-semibold uppercase tracking-wider ${
          live ? "bg-[#E7F4EB] text-[#277247]" : "bg-[#F1F0EC] text-muted"
        }`}
      >
        {live ? "Live" : "Coming soon"}
      </span>
    </div>
  );
}

export function Integrations() {
  const steps = [
    "Write actions",
    "Universal search",
    "Meeting briefings",
    "Daily briefings",
  ];
  return (
    <section id="integrations" className="section-shell pt-12">
      <div className="section-heading">
        <p className="mono-kicker">INTEGRATIONS</p>
        <h2>Start with where your day already lives.</h2>
        <p>
          Gmail and Google Calendar are live today. More connections are on the
          way.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {integrations.map(([name, glyph, live]) => (
          <IntegrationBadge key={name} name={name} glyph={glyph} live={live} />
        ))}
      </div>
      <div id="roadmap" className="mt-20">
        <p className="mono-kicker mb-8">ROADMAP</p>
        <ol className="roadmap">
          {steps.map((step, i) => (
            <li key={step}>
              <span>0{i + 1}</span>
              <strong>{step}</strong>
              <small>{i === 0 ? "In progress" : "Planned"}</small>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
