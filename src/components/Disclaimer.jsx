function Disclaimer() {
  return (
    <section className="mx-auto w-full max-w-6xl border-t border-borderLight px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <div className="mx-auto w-full max-w-4xl rounded-xl bg-[#F1F5F9] p-5 text-[#334155] shadow-soft sm:p-6">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-sm">
            🛡️
          </span>
          <h3 className="text-sm font-semibold tracking-wide">Digital Safety Disclaimer</h3>
        </div>

        <p className="mt-3 text-sm leading-relaxed">
          This tool provides AI-based analysis. Final decisions should always be verified with official
          sources. Deep Secure does not guarantee 100% accuracy.
        </p>

        <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">
          Protect yourself by confirming sensitive requests through official government or bank channels.
        </p>
      </div>
    </section>
  );
}

export default Disclaimer;