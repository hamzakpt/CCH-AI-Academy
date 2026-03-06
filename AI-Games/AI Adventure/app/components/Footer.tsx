import hellenLogo from '/hellen-logo-footer.png';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-3 px-4 flex-shrink-0">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span className="text-base text-gray-900">Powered by</span>
        <img src={hellenLogo} alt="Hellen+" className="h-6" />
        <span className="text-base text-gray-900 mt-0.5">for AI Academy</span>
      </div>
    </footer>
  );
}