import { Link } from 'react-router-dom';

function Footer() {
  const logoSrc = '/deepsecure-logo.png';

  return (
    <footer className="border-t border-borderLight bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img
            src={logoSrc}
            alt="Deep Secure Logo"
            className="h-7 w-auto shrink-0 object-contain"
          />
          <p className="font-semibold tracking-[0.04em] text-dark">Deep Secure</p>
        </div>
        <div className="flex items-center gap-5">
          <a href="#" className="transition-colors duration-300 hover:text-primary">
            Privacy Policy
          </a>
          <a href="#" className="transition-colors duration-300 hover:text-primary">
            Terms
          </a>
          <Link to="/feedback" className="transition-colors duration-300 hover:text-primary">
            Give feedback
          </Link>
          <a href="#" className="transition-colors duration-300 hover:text-pink">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
