const steps = [
  {
    icon: '📝',
    title: 'Paste message',
    description: 'Drop any suspicious text or link into the scanner.',
  },
  {
    icon: '🤖',
    title: 'AI analyzes patterns',
    description: 'The model checks language, intent, and link risk signals.',
  },
  {
    icon: '📊',
    title: 'Get instant risk report',
    description: 'You receive a clear risk label and confidence score immediately.',
  },
];

function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
      <h2 className="text-2xl font-semibold text-dark sm:text-3xl">How It Works</h2>
      <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-3">
        {steps.map((step) => (
          <article
            key={step.title}
            className="rounded-xl border border-borderLight bg-card p-5 shadow-soft transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-primary/30"
          >
            <p className="text-xl" aria-hidden="true">
              {step.icon}
            </p>
            <h3 className="mt-3 text-base font-semibold text-dark">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;
