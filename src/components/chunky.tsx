import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  GraduationCap,
  Lock,
  BadgeDollarSign,
  MessageCircle,
  Lightbulb,
  Clock,
  Send,
  Loader2,
} from "lucide-react";
import type { Category } from "@/lib/eval-config";

export const chunkyVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-2xl font-extrabold uppercase tracking-wide transition-all border-b-4 active:border-b-0 active:translate-y-1 disabled:opacity-60 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground border-primary-pressed hover:brightness-105",
        info: "bg-info text-primary-foreground border-info-pressed hover:brightness-105",
        danger: "bg-danger text-primary-foreground border-danger-pressed hover:brightness-105",
        ghost: "bg-background text-info border-2 border-b-4 border-secondary hover:bg-muted",
      },
      size: {
        md: "h-12 px-6 text-sm",
        lg: "h-16 px-10 text-lg w-full sm:w-auto",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function ChunkyButton({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof chunkyVariants>) {
  return <button className={cn(chunkyVariants({ variant, size }), className)} {...props} />;
}

export const CATEGORY_ICON: Record<Category, typeof Lock> = {
  content_safety: ShieldAlert,
  age_fit: GraduationCap,
  privacy: Lock,
  ads_spending: BadgeDollarSign,
  contact_social: MessageCircle,
  learning_fit: Lightbulb,
};

type StatusStyle = { label: string; cls: string; Icon: typeof Lock };

const DRAFT_STYLE: StatusStyle = {
  label: "Draft",
  cls: "bg-muted text-muted-foreground",
  Icon: Clock,
};

const STATUS_STYLE: Record<string, StatusStyle> = {
  draft: DRAFT_STYLE,
  submitted: { label: "Ready to check", cls: "bg-info-soft text-info", Icon: Send },
  in_review: { label: "Checking", cls: "bg-info-soft text-info", Icon: Loader2 },
  approved: { label: "Approved", cls: "bg-primary-soft text-primary-pressed", Icon: CheckCircle2 },
  approved_with_notes: {
    label: "Approved with notes",
    cls: "bg-warning-soft text-warning-pressed",
    Icon: AlertTriangle,
  },
  needs_changes: { label: "Needs changes", cls: "bg-danger-soft text-danger", Icon: XCircle },
};

export function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? DRAFT_STYLE;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-extrabold", s.cls)}>
      <s.Icon className="h-4 w-4" strokeWidth={3} />
      {s.label}
    </span>
  );
}

export const SEVERITY_CLS = {
  must_fix: "bg-danger text-primary-foreground",
  should_fix: "bg-warning text-primary-foreground",
  suggestion: "bg-info text-primary-foreground",
} as const;
