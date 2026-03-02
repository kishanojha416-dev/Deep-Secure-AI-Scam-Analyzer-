const features = [
  {
    title: 'AI-Powered Detection',
    description: 'Advanced language and link-pattern analysis to identify fraud signals quickly and accurately.',
  },
  {
    title: 'Built for Indian Users',
    description: 'Designed with local scam trends, payment behavior, and messaging patterns in mind.',
  },
  {
    title: 'No Data Stored',
    description: 'Privacy-first architecture with session-only analysis behavior for trusted user protection.',
  },
];

function Features() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
      <h2 className="text-2xl font-semibold text-dark sm:text-3xl">Why Deep Secure</h2>
      <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-xl border border-borderLight bg-card p-6 shadow-soft transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-dark">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Features;
