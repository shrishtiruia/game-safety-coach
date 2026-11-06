import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Menu,
  Plus,
  Puzzle,
  Search,
  ShoppingBasket,
  UserRound,
  X,
} from "lucide-react";
import { chunkyVariants } from "@/components/chunky";
import { Toaster } from "@/components/ui/sonner";
import { emptyFilters } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Shared site shell: one sticky top nav, centered page container and footer.
 * The marketplace (buy side) and the studio (/studio, sell side) each get their
 * own nav links; "Upload a game" and "Browse games" link the two.
 */
type StudioItem = {
  label: string;
  to: "/studio" | "/studio/insights" | "/studio/submit";
  match: (path: string) => boolean;
};

export const NAV_ITEMS: StudioItem[] = [
  { label: "My games", to: "/studio", match: (p) => p === "/studio" || p === "/studio/" },
  { label: "Insights", to: "/studio/insights", match: (p) => p.startsWith("/studio/insights") },
  { label: "Upload a game", to: "/studio/submit", match: (p) => p.startsWith("/studio/submit") },
];

const isStudio = (path: string) => path === "/studio" || path.startsWith("/studio/");

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main id="main" className="flex-1">
        {children}
      </main>
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

function Logo({ studio }: { studio: boolean }) {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2.5 rounded-2xl" aria-label="Kitbit home">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Puzzle className="h-6 w-6" strokeWidth={2.5} />
      </span>
      <span className="font-display text-2xl font-extrabold text-info">
        Kit<span className="text-danger">bit</span>
      </span>
      {studio && (
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-extrabold text-muted-foreground">
          Studio
        </span>
      )}
    </Link>
  );
}

const linkCls = (active: boolean) =>
  cn(
    "flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 font-extrabold transition-colors",
    active
      ? "bg-primary-soft text-primary-pressed"
      : "text-foreground hover:bg-muted hover:text-primary-pressed",
  );

function StudioLinks({ path, onNavigate }: { path: string; onNavigate?: () => void }) {
  return (
    <>
      {NAV_ITEMS.slice(0, 2).map((item) => {
        const active = item.match(path);
        return (
          <li key={item.label}>
            <Link
              to={item.to}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={linkCls(active)}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </>
  );
}

function MarketLinks({ path, onNavigate }: { path: string; onNavigate?: () => void }) {
  return (
    <>
      <li>
        <Link
          to="/search"
          search={emptyFilters}
          onClick={onNavigate}
          className={linkCls(path.startsWith("/search"))}
        >
          Browse
        </Link>
      </li>
      <li>
        <Link to="/community" onClick={onNavigate} className={linkCls(path.startsWith("/community"))}>
          Community
        </Link>
      </li>
    </>
  );
}

function NavSearch() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  return (
    <form
      role="search"
      className="hidden h-11 max-w-sm flex-1 items-center gap-2 rounded-2xl border border-secondary bg-muted px-4 xl:flex"
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/search", search: { ...emptyFilters, q } });
      }}
    >
      <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search games and skills"
        aria-label="Search games"
        className="w-full bg-transparent font-semibold outline-none placeholder:text-muted-foreground"
      />
    </form>
  );
}

function CartLink() {
  const { cart } = useStore();
  return (
    <Link
      to="/cart"
      aria-label={`Cart, ${cart.length} items`}
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-secondary transition hover:bg-muted"
    >
      <ShoppingBasket className="h-5 w-5" strokeWidth={2.5} />
      {cart.length > 0 && (
        <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-danger text-[11px] font-black text-primary-foreground">
          {cart.length}
        </span>
      )}
    </Link>
  );
}

function ProfileLink() {
  return (
    <Link
      to="/profile"
      aria-label="My profile and classes"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-secondary bg-info-soft text-info transition hover:brightness-95"
    >
      <UserRound className="h-5 w-5" strokeWidth={2.5} />
    </Link>
  );
}

function TopNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const studio = isStudio(path);
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const close = () => setOpen(false);

  const crossLink = studio ? (
    <Link to="/" className={chunkyVariants({ variant: "ghost" })}>
      <ArrowLeft className="h-5 w-5" strokeWidth={3} /> Browse games
    </Link>
  ) : (
    <Link to="/studio/submit" className={chunkyVariants()}>
      <Plus className="h-5 w-5" strokeWidth={3} /> Upload a game
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b-2 border-secondary bg-background/95 backdrop-blur">
      <Container className="flex h-[72px] items-center gap-4 lg:gap-6">
        <Logo studio={studio} />
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {studio ? <StudioLinks path={path} /> : <MarketLinks path={path} />}
          </ul>
        </nav>
        {!studio && <NavSearch />}
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">{crossLink}</div>
          {!studio && <CartLink />}
          <ProfileLink />
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
          <Container className="space-y-4 py-4">
            <nav aria-label="Main">
              <ul className="flex flex-col gap-1">
                {studio ? (
                  <StudioLinks path={path} onNavigate={close} />
                ) : (
                  <MarketLinks path={path} onNavigate={close} />
                )}
              </ul>
            </nav>
            <div className="sm:hidden">{crossLink}</div>
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
            Soft-skill games made by teachers. Every one gets a safety check first.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-extrabold">
          <li>
            <Link to="/search" search={emptyFilters} className="rounded hover:text-primary-pressed hover:underline">
              Browse games
            </Link>
          </li>
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

export type Crumb = { label: string; to?: "/studio" | "/studio/insights" };

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
