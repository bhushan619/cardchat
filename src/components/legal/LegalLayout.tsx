import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

export default function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 backdrop-blur-lg bg-background/70 border-b border-border/50">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/landing" className="flex items-center gap-2.5">
            <Logo className="w-9 h-9" />
            <span className="font-heading font-bold text-lg">CardChat</span>
          </Link>
          <Link to="/landing" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </nav>
      <article className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="font-heading text-4xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-2">Last updated: {updated}</p>
        </header>
        <div className="prose prose-invert max-w-none space-y-8 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_ul]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:leading-relaxed">
          {children}
        </div>
      </article>
      <footer className="border-t border-border/50 mt-10">
        <div className="max-w-3xl mx-auto px-6 py-6 text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} CardChat. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
