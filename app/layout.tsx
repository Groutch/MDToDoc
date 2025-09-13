import "./globals.css";
import "highlight.js/styles/github-dark.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alpha Docs",
  description: "Documentation interne Alpha",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
          <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
            <div className="font-bold tracking-tight">📚 Docs</div>
            <nav className="text-sm text-neutral-400">
              <a className="hover:text-white" href="/">Accueil</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
