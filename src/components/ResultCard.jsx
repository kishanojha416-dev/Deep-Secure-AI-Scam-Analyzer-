import { useState } from 'react';
import { trackEvent } from '../services/analytics';
import { getTheme, themeClassMap } from '../utils/riskTheme';

const styleByRisk = {
  'Likely Safe': {
    icon: '✅',
    title: 'LIKELY SAFE',
    badgeLabel: 'Likely Safe',
    confidenceLabel: 'Low risk level',
    whyTitle: 'Why this looks safe',
  },
  Uncertain: {
    icon: '⚠️',
    title: 'Needs verification',
    badgeLabel: 'Needs verification',
    confidenceLabel: 'Medium risk level',
    whyTitle: 'Why this needs caution',
  },
  'High Risk': {
    icon: '🚨',
    title: 'High risk detected',
    badgeLabel: 'High Risk',
    confidenceLabel: 'High risk level',
    whyTitle: 'Why this looks risky',
  },
};

const fallbackActionsByRisk = {
  'Likely Safe': ['Continue to verify sensitive requests through official sources'],
  Uncertain: ['Verify the sender before taking action', 'Avoid sharing personal or financial details'],
  'High Risk': ['Do NOT click links', 'Do NOT share OTP or login details', 'Contact your bank through the official app or website'],
};

function toBulletList(items, fallbackText, fallbackItems = []) {
  if (Array.isArray(items) && items.length > 0) {
    return items.filter(Boolean).slice(0, 5);
  }

  const sentences = typeof fallbackText === 'string'
    ? fallbackText
        .split(/[.!?]+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean)
        .slice(0, 5)
    : [];

  if (sentences.length > 0) {
    return sentences;
  }

  return fallbackItems;
}

function AccordionSection({ id, title, isOpen, onToggle, items }) {
  return (
    <div className="border-t border-borderLight pt-3">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-dark">{title}</span>
        <span className={`text-base text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>⌄</span>
      </button>

      {isOpen ? (
        <ul className="mt-2 space-y-1.5 pl-4 text-sm text-muted">
          {items.map((item) => (
            <li key={item} className="list-disc">
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ResultCard({ result, onAnalyzeAnother }) {
  const [openSection, setOpenSection] = useState('why');
  const riskKey = styleByRisk[result.risk] ? result.risk : 'Uncertain';
  const currentStyle = styleByRisk[riskKey];
  const activeTheme = getTheme(result);
  const themeClasses = themeClassMap[activeTheme];

  const reasons = toBulletList(result.reasons, result.explanation, ['Risk indicators were identified in this message']);
  const actions = toBulletList(result.actions, '', fallbackActionsByRisk[riskKey]);
  const isTransactionLikelySafe =
    riskKey === 'Likely Safe' && reasons.some((reason) => /transaction alert/i.test(reason));

  const handleToggle = (sectionId) => {
    setOpenSection((previous) => {
      const nextOpenSection = previous === sectionId ? '' : sectionId;

      if (nextOpenSection === 'why') {
        trackEvent('open_why_section');
      }

      if (nextOpenSection === 'actions') {
        trackEvent('open_what_to_do_section');
      }

      return nextOpenSection;
    });
  };

  const handleAnalyzeAnotherClick = () => {
    trackEvent('click_analyze_another');
    onAnalyzeAnother();
  };

  const showWarningLine = riskKey !== 'Likely Safe';

  return (
    <section className={`relative w-full overflow-hidden rounded-xl border border-borderLight border-l-4 bg-card p-6 transition-colors duration-300 sm:p-7 ${themeClasses.accentBorder} ${themeClasses.cardShadow}`}>
      <div className={`absolute inset-x-0 top-0 h-1.5 ${themeClasses.topTint}`} aria-hidden="true" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-dark">
          {isTransactionLikelySafe ? '✅ Transaction Alert Detected' : `${currentStyle.icon} ${currentStyle.title}`}
        </h3>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${themeClasses.badge}`}>
          <span>{currentStyle.badgeLabel}</span>
        </span>
      </div>

      {isTransactionLikelySafe ? (
        <p className="mt-2 text-sm font-semibold text-dark">Looks like a normal bank/UPI update. No action needed.</p>
      ) : null}

      {showWarningLine ? <p className="mt-2 text-sm font-semibold text-dark">Do not act immediately. Verify independently.</p> : null}

      <div className="mt-6 space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <p className="font-semibold text-dark">Risk confidence: {result.confidence}%</p>
          <p className="text-xs font-semibold tracking-wide text-muted">{currentStyle.confidenceLabel}</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-smooth ${themeClasses.progress}`}
            style={{ width: `${result.confidence}%` }}
          />
        </div>
        <p className="text-xs text-muted">Higher percentage means higher chance of fraud.</p>
      </div>

      <div className="mt-6 space-y-3">
        <AccordionSection
          id="why"
          title={currentStyle.whyTitle}
          isOpen={openSection === 'why'}
          onToggle={handleToggle}
          items={reasons}
        />
        <AccordionSection
          id="actions"
          title="What you should do"
          isOpen={openSection === 'actions'}
          onToggle={handleToggle}
          items={actions}
        />
      </div>

      {showWarningLine ? (
        <p className="mt-4 text-xs text-muted">
          AI may occasionally be wrong. If this is a bank-related message, verify using official bank app/website.
        </p>
      ) : null}

      <p className="mt-4 text-xs text-muted">Analysis powered by AI pattern detection.</p>

      <button
        type="button"
        onClick={handleAnalyzeAnotherClick}
        className={`mt-4 inline-flex w-full items-center justify-center rounded-xl border border-borderLight bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors duration-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white ${themeClasses.dangerButtonRing}`}
      >
        Analyze another message
      </button>
    </section>
  );
}

export default ResultCard;
