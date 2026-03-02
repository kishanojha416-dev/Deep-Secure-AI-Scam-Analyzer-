import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const WHATSAPP_NUMBER = '918382930021';

function FeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const result = location.state?.result;
  const scannedMessage = location.state?.message || '';
  const hasResult = Boolean(result?.risk) && Number.isFinite(Number(result?.confidence));

  const [phoneNumber, setPhoneNumber] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [includeResult, setIncludeResult] = useState(hasResult);
  const [consent, setConsent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const helperText = useMemo(() => {
    if (!hasResult) {
      return 'No current analysis result available. You can still send your feedback.';
    }

    return `Current result: ${result.risk} | Confidence: ${result.confidence}%`;
  }, [hasResult, result]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const digitsOnlyPhone = phoneNumber.replace(/\D/g, '');
    const trimmedFeedback = feedbackText.trim();

    if (!/^[6-9]\d{9}$/.test(digitsOnlyPhone)) {
      setErrorMessage('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    if (trimmedFeedback.length < 10) {
      setErrorMessage('Feedback must be at least 10 characters long.');
      return;
    }

    if (!consent) {
      setErrorMessage('Please agree to share this feedback for improvement.');
      return;
    }

    const lines = ['Deep Secure Feedback:', `Phone: ${digitsOnlyPhone}`];

    if (includeResult && hasResult) {
      lines.push(`Result: ${result.risk} | Confidence: ${result.confidence}%`);
    }

    if (scannedMessage) {
      lines.push(`Message Context: ${scannedMessage}`);
    }

    lines.push(`Feedback: ${trimmedFeedback}`);

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setErrorMessage('');
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="mx-auto w-full max-w-lg rounded-xl border border-borderLight bg-card p-6 shadow-soft sm:p-7">
        <h1 className="text-2xl font-bold text-dark">Send Feedback</h1>
        <p className="mt-1 text-sm text-muted">Help us improve Deep Secure</p>

        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="feedback-phone" className="mb-1.5 block text-sm font-semibold text-dark">
              Phone number
            </label>
            <input
              id="feedback-phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="10-digit number"
              className="w-full rounded-xl border border-borderLight bg-white px-4 py-2.5 text-sm text-dark outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label htmlFor="feedback-text" className="mb-1.5 block text-sm font-semibold text-dark">
              Feedback
            </label>
            <textarea
              id="feedback-text"
              value={feedbackText}
              onChange={(event) => setFeedbackText(event.target.value)}
              placeholder="Tell us what can be improved..."
              className="h-32 w-full resize-none rounded-xl border border-borderLight bg-white px-4 py-3 text-sm text-dark outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <label className="flex items-start gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={includeResult}
              disabled={!hasResult}
              onChange={(event) => setIncludeResult(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-borderLight text-primary focus:ring-primary"
            />
            Include current analysis result
          </label>

          <p className="text-xs text-muted">{helperText}</p>

          <label className="flex items-start gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-borderLight text-primary focus:ring-primary"
              required
            />
            I agree to share this for improvement
          </label>

          {errorMessage ? <p className="text-xs font-medium text-scam">{errorMessage}</p> : null}

          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors duration-300 hover:bg-pink focus:outline-none focus-visible:ring-2 focus-visible:ring-pink focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Send on WhatsApp
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex w-full items-center justify-center rounded-xl border border-borderLight bg-white px-5 py-2.5 text-sm font-semibold text-dark transition-colors duration-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Back to Scanner
            </button>
          </div>

          <p className="text-xs text-muted">We don’t store your message. It will be sent via WhatsApp.</p>
        </form>
      </div>
    </section>
  );
}

export default FeedbackPage;
