import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { createContext, Fragment, useContext, useEffect, useState, type ReactNode } from "react";
import { ChevronRight, Menu, Search, ShieldCheck, UserRound, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared site shell: sticky top nav, centered page container and footer.
 * Buy-side and sell-side pages render inside it via the root route.
 * To wire up a nav item, give it a `to` route and a `match` for its active state.
 */
type NavItem = { label: string; to?: "/"; match?: (path: string) => boolean };

export const NAV_ITEMS: NavItem[] = [
  { label: "Browse" },
  { label: "Submit a game" },
  { label: "My games", to: "/", match: (p) => p === "/" || p.startsWith("/games") },
  { label: "Insights" },
];

const SearchContext = createContext<{ query: string; setQuery: (q: string) => void }>({
  query: "",
  setQuery: () => {},
});

/** Text typed into the nav search field. Pages decide what it filters. */
export function useNavSearch() {
  return useContext(SearchContext);
}

export function AppShell({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      <div className="flex min-h-screen flex-col">
        <TopNav />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </SearchContext.Provider>
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
      <span className="text-xl font-black tracking-tight text-primary">SkillPlay</span>
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
        if (!item.to) {
          return (
            <li key={item.label}>
              <span
                aria-disabled="true"
                title="Coming soon"
                className={cn(base, "cursor-not-allowed text-muted-foreground")}
              >
                {item.label}
                <span
                  className={cn(
                    "rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide",
                    !vertical && "hidden xl:inline",
                  )}
                >
                  Soon
                </span>
              </span>
            </li>
          );
        }
        const active = item.match?.(path) ?? path === item.to;
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

function SearchField({ className }: { className?: string }) {
  const { query, setQuery } = useNavSearch();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (path !== "/") navigate({ to: "/" });
      }}
    >
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
        strokeWidth={2.5}
      />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search games"
        aria-label="Search games"
        className="h-11 w-full rounded-2xl border-2 border-secondary bg-muted pl-11 pr-4 font-bold placeholder:text-muted-foreground focus:border-info focus:bg-background"
      />
    </form>
  );
}

function Avatar() {
  return (
    <button
      type="button"
      aria-label="Profile"
      title="Profile"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-b-4 border-secondary bg-info-soft text-info transition hover:brightness-95"
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
        <SearchField className="ml-auto hidden min-w-0 flex-1 md:block lg:max-w-xs" />
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Avatar />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-b-4 border-secondary transition hover:bg-muted lg:hidden"
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
          <Container className="space-y-3 py-4">
            <SearchField className="md:hidden" />
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
    <footer className="mt-16 border-t-2 border-secondary bg-muted">
      <Container className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-black text-primary">SkillPlay</p>
          <p className="text-sm font-semibold text-muted-foreground">
            Every game gets a safety check before it reaches classrooms.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-extrabold">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              {item.to ? (
                <Link to={item.to} className="rounded hover:text-primary-pressed hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-disabled="true" title="Coming soon" className="text-muted-foreground">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </footer>
  );
}

export type Crumb = { label: string; to?: "/" | "/games/$id"; params?: { id: string } };

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
                  <Link
                    to={c.to}
                    params={c.params as never}
                    className="rounded hover:text-info hover:underline"
                  >
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
