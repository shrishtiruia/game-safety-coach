import { Link, useRouterState } from "@tanstack/react-router";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import { ChevronRight, Menu, ShieldCheck, UserRound, X } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

/**
 * Shared site shell: sticky top nav, centered page container and footer.
 * Buy-side and sell-side pages render inside it via the root route.
 */
type NavItem = {
  label: string;
  to: "/" | "/insights" | "/submit";
  match: (path: string) => boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "My games", to: "/", match: (p) => p === "/" },
  { label: "Insights", to: "/insights", match: (p) => p.startsWith("/insights") },
  { label: "Submit a game", to: "/submit", match: (p) => p.startsWith("/submit") },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <div className="flex-1">{children}</div>
      <Footer />
      <Toaster position="top-center" offset={88} />
    </div>
  );
}

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2.5 rounded-2xl">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <ShieldCheck className="h-6 w-6" strokeWidth={2.5} />
      </span>
      <span className="font-display text-2xl font-extrabold text-info">
        Kit<span className="text-danger">bit</span>
      </span>
    </Link>
  );
}

function NavLinks({
  path,
  vertical,
  onNavigate,
}: {
  path: string;
  vertical?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <ul className={cn("flex", vertical ? "flex-col gap-1" : "items-center gap-1")}>
      {NAV_ITEMS.map((item) => {
        const base =
          "flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 font-extrabold transition-colors";
        const active = item.match(path);
        return (
          <li key={item.label}>
            <Link
              to={item.to}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                base,
                active
                  ? "bg-primary-soft text-primary-pressed"
                  : "text-foreground hover:bg-muted hover:text-primary-pressed",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Avatar() {
  return (
    <button
      type="button"
      aria-label="Profile"
      title="Profile"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-secondary bg-info-soft text-info transition hover:brightness-95"
    >
      <UserRound className="h-5 w-5" strokeWidth={2.5} />
    </button>
  );
}

function TopNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-secondary bg-background/95 backdrop-blur">
      <Container className="flex h-[72px] items-center gap-4 lg:gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden lg:block">
          <NavLinks path={path} />
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Avatar />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-secondary transition hover:bg-muted lg:hidden"
          >
            {open ? (
              <X className="h-5 w-5" strokeWidth={3} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={3} />
            )}
          </button>
        </div>
      </Container>
      {open && (
        <div id="mobile-nav" className="border-t-2 border-secondary lg:hidden">
          <Container className="py-4">
            <nav aria-label="Main">
              <NavLinks path={path} vertical onNavigate={() => setOpen(false)} />
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t-2 border-secondary">
      <Container className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg font-extrabold text-info">
            Kit<span className="text-danger">bit</span>
          </p>
          <p className="text-sm font-semibold text-muted-foreground">
            Every game gets a safety check before it reaches classrooms.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-extrabold">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <Link to={item.to} className="rounded hover:text-primary-pressed hover:underline">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </footer>
  );
}

export type Crumb = { label: string; to?: "/" | "/insights" };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm font-extrabold text-muted-foreground">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={i}>
              <li>
                {c.to && !last ? (
                  <Link to={c.to} className="rounded hover:text-info hover:underline">
                    {c.label}
                  </Link>
                ) : (
                  <span
                    aria-current={last ? "page" : undefined}
                    className={cn(last && "text-foreground")}
                  >
                    {c.label}
                  </span>
                )}
              </li>
              {!last && (
                <li aria-hidden>
                  <ChevronRight className="h-4 w-4" strokeWidth={3} />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
