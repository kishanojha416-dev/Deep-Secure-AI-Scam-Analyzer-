import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ResultCard from './ResultCard';
import { analyzeMessage } from '../services/analyzeApi';
import { trackEvent } from '../services/analytics';

const dummyResults = [
  {
    risk: 'Likely Safe',
    confidence: 92,
    reasons: ['No suspicious links detected', 'No urgency or impersonation patterns found'],
    actions: ['Still verify sensitive requests through official sources'],
  },
  {
    risk: 'Uncertain',
    confidence: 68,
    reasons: ['Contains some risk signals', 'Sender identity is not fully verified'],
    actions: ['Verify the sender before taking action', 'Avoid sharing personal or financial details'],
  },
  {
    risk: 'High Risk',
    confidence: 96,
    reasons: ['Uses urgent language', 'Mentions bank account blockage', 'Asks you to click a verification link'],
    actions: ['Do NOT click the link', 'Do NOT share OTP or login details', 'Contact your bank directly through the official website or app'],
  },
];

function Hero() {
  const navigate = useNavigate();
  const defaultResult = dummyResults[1];
  const [message, setMessage] = useState('');
  const [lastScannedMessage, setLastScannedMessage] = useState('');
  const [result, setResult] = useState(defaultResult);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAnalyzeAnother = () => {
    setMessage('');
    setErrorMessage('');
    setResult(defaultResult);

    const inputElement = document.getElementById('scan-input');
    if (!inputElement) return;

    inputElement.focus({ preventScroll: true });
  };

  const handleScan = async () => {
    trackEvent('click_analyze_message');

    const trimmedMessage = message.trim();

    if (trimmedMessage.length < 5) {
      setErrorMessage('Please enter at least 5 characters before scanning.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage('');

    try {
      const analysis = await analyzeMessage(trimmedMessage);
      setResult(analysis);
      setLastScannedMessage(trimmedMessage);
      trackEvent('analysis_success', {
        risk_level: analysis.risk,
        confidence: analysis.confidence,
      });
    } catch (error) {
      setErrorMessage(error.message || 'Unable to analyze message right now. Please try again.');
      trackEvent('analysis_error', {
        status: error?.status || 0,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGiveFeedback = () => {
    navigate('/feedback', {
      state: {
        result,
        message: lastScannedMessage,
      },
    });
  };

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10 lg:px-8 lg:py-16">
      <div>
        <p className="mb-4 inline-flex rounded-full border border-pink/30 bg-pink/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-pink">
          AI Scam Defense
        </p>
        <h1 className="text-4xl font-bold leading-tight text-dark sm:text-5xl lg:text-[3.25rem]">
          Check If This Message Is a Scam.
        </h1>
        <span className="mt-3 block h-1 w-20 rounded-full bg-pink/80" aria-hidden="true" />
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Paste suspicious text or links and let AI analyze it instantly.
        </p>

        <div className="mt-7 rounded-xl border border-borderLight bg-card p-4 shadow-soft sm:mt-8 sm:p-5">
          <label htmlFor="scan-input" className="mb-2 block text-sm font-semibold text-dark">
            Paste message or link
          </label>
          <textarea
            id="scan-input"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Example: Your bank account is blocked. Verify now: ..."
            className="h-44 w-full resize-none rounded-xl border border-borderLight bg-white px-4 py-3 text-sm text-dark shadow-soft outline-none transition-all duration-300 ease-smooth placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="button"
            onClick={handleScan}
            disabled={isAnalyzing}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft transition-colors duration-300 ease-smooth hover:bg-pink focus:outline-none focus-visible:ring-2 focus-visible:ring-pink focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Message'}
          </button>
          {errorMessage ? <p className="mt-2 text-xs font-medium text-scam">{errorMessage}</p> : null}
          <p className="mt-2.5 text-xs text-muted">Your data is never stored.</p>
        </div>
      </div>

      <div className="self-start space-y-3 lg:pt-10">
        <ResultCard result={result} onAnalyzeAnother={handleAnalyzeAnother} />
        <button
          type="button"
          onClick={handleGiveFeedback}
          className="text-sm font-semibold text-primary transition-colors duration-300 hover:text-pink"
        >
          Give feedback / Report wrong result
        </button>
      </div>
    </section>
  );
}

export default Hero;
