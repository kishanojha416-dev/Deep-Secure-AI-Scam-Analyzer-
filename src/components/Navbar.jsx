import { trackEvent } from '../services/analytics';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const logoSrc = '/deepsecure-logo.png';

  const handleBrandClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScanClick = () => {
    trackEvent('click_scan_now');

    const inputElement = document.getElementById('scan-input');
    if (!inputElement) {
      navigate('/');
      return;
    }

    inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    inputElement.focus({ preventScroll: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-borderLight bg-white shadow-soft">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 lg:px-8">
        <button
          type="button"
          onClick={handleBrandClick}
          className="flex items-center gap-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          aria-label="Go to top"
        >
          <img
            src={logoSrc}
            alt="Deep Secure Logo"
            className="h-8 w-auto shrink-0 object-contain md:h-9"
          />
          <p className="text-base font-semibold tracking-[0.04em] text-dark sm:text-xl">Deep Secure</p>
        </button>
        <button
          type="button"
          onClick={handleScanClick}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition-colors duration-300 ease-smooth hover:bg-pink focus:outline-none focus-visible:ring-2 focus-visible:ring-pink focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-5 sm:py-2.5"
        >
          Analyze Message
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
