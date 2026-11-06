import {
  Check,
  ChevronDown,
  Gamepad2,
  GraduationCap,
  Heart,
  Monitor,
  Sparkles,
  Tag,
  Users,
  X,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DEVICES,
  GAME_TYPES,
  GRADES,
  GROUP_SIZES,
  MORE,
  PRICES,
  SKILL_AREAS,
  SKILLS,
} from "@/data/types";
import { FILTER_KEYS, type FilterKey, type Filters } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const FILTER_GROUPS: {
  key: FilterKey;
  label: string;
  icon: React.ElementType;
  options: readonly string[];
  fmt?: (v: string) => string;
}[] = [
  {
    key: "grades",
    label: "Age / grade",
    icon: GraduationCap,
    options: GRADES,
    fmt: (v) => `Grades ${v}`,
  },
  { key: "skills", label: "Skill", icon: Heart, options: SKILLS },
  { key: "types", label: "Game type", icon: Gamepad2, options: GAME_TYPES },
  { key: "groups", label: "Group size", icon: Users, options: GROUP_SIZES },
  { key: "devices", label: "Device", icon: Monitor, options: DEVICES },
  { key: "prices", label: "Price", icon: Tag, options: PRICES },
  { key: "more", label: "More", icon: Sparkles, options: MORE },
];

export function toggleIn(f: Filters, key: FilterKey, v: string): Filters {
  const cur = f[key];
  return { ...f, [key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] };
}

function OptionList({
  group,
  filters,
  onChange,
}: {
  group: (typeof FILTER_GROUPS)[number];
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  // Skills are long enough to need their five areas as headings.
  if (group.key === "skills") {
    return (
      <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
        {SKILL_AREAS.map((a) => (
          <div key={a.id}>
            <p className="px-3 pb-1 text-[13px] font-bold text-muted-foreground">{a.label}</p>
            <OptionItems options={a.skills} group={group} filters={filters} onChange={onChange} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <OptionItems options={group.options} group={group} filters={filters} onChange={onChange} />
  );
}

function OptionItems({
  options,
  group,
  filters,
  onChange,
}: {
  options: readonly string[];
  group: (typeof FILTER_GROUPS)[number];
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  return (
    <ul className="space-y-1">
      {options.map((o) => {
        const on = filters[group.key].includes(o);
        return (
          <li key={o}>
            <button
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => onChange(toggleIn(filters, group.key, o))}
              className={cn(
                "flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-left font-semibold capitalize hover:bg-muted",
                on && "bg-leaf-soft",
              )}
            >
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-lg border-2",
                  on ? "border-leaf bg-leaf text-primary-foreground" : "border-border bg-card",
                )}
              >
                {on && <Check className="size-4" />}
              </span>
              {group.fmt ? group.fmt(o) : o}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function StickerBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {FILTER_GROUPS.map((g) => {
        const n = filters[g.key].length;
        return (
          <Popover key={g.key}>
            <PopoverTrigger className="sticker" data-active={n > 0}>
              <span className="grid size-6 place-items-center">
                <g.icon className="size-5" aria-hidden />
              </span>
              {g.label}
              {n > 0 && (
                <span className="rounded-full bg-leaf px-2 text-sm text-primary-foreground">
                  {n}
                </span>
              )}
              <ChevronDown className="size-4" aria-hidden />
            </PopoverTrigger>
            <PopoverContent className="max-h-96 w-72 overflow-auto rounded-lg p-3">
              <OptionList group={g} filters={filters} onChange={onChange} />
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
}

export function FilterSidebar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  return (
    <div className="space-y-6">
      {FILTER_GROUPS.map((g) => (
        <fieldset key={g.key}>
          <legend className="mb-2 flex items-center gap-2 text-lg font-extrabold">
            <g.icon className="size-5 text-honey" aria-hidden />
            {g.label}
          </legend>
          <OptionList group={g} filters={filters} onChange={onChange} />
        </fieldset>
      ))}
    </div>
  );
}

export function ActiveChips({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const chips = FILTER_KEYS.flatMap((k) => filters[k].map((v) => ({ k, v })));
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map(({ k, v }) => (
        <button
          key={k + v}
          type="button"
          onClick={() => onChange(toggleIn(filters, k, v))}
          className="flex min-h-10 items-center gap-1.5 rounded-full bg-sky-soft px-3 font-bold capitalize hover:bg-sky"
          aria-label={`Remove filter ${v}`}
        >
          {v} <X className="size-4" aria-hidden />
        </button>
      ))}
      <button
        type="button"
        className="px-2 font-bold text-berry underline"
        onClick={() =>
          onChange({ ...filters, ...Object.fromEntries(FILTER_KEYS.map((k) => [k, []])) })
        }
      >
        Clear all
      </button>
    </div>
  );
}
