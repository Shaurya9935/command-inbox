import { Wordmark } from "./wordmark";

export function Footer() {
  return (
    <footer className="border-t border-line px-5 py-8">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 sm:flex-row">
        <Wordmark />
        <div className="flex flex-wrap justify-center gap-6 font-mono text-[10px] uppercase tracking-wider text-muted">
          <a href="#features">Features</a>
          <a href="#security">Security</a>
          <a href="#roadmap">Roadmap</a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
        <p className="font-mono text-[10px] text-muted">© 2026 NEXUS</p>
      </div>
    </footer>
  );
}
