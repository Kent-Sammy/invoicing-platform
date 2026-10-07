"use client";

import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EditorSectionProps {
  title: string;
  /** Right side of the heading: a count, a total, a switch. */
  meta?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function EditorSection({ title, meta, children, className }: EditorSectionProps) {
  return (
    <section className={cn("border-b border-border/60 px-6 py-5 last:border-b-0", className)}>
      <div className="flex min-h-5 items-center justify-between gap-4">
        <h2 className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          {title}
        </h2>
        {meta}
      </div>
      {children && <div className="mt-3.5 space-y-3">{children}</div>}
    </section>
  );
}

/**
 * An optional section that stays a single quiet line until the user opts in.
 * Opens automatically when it already has content.
 */
export function OptionalSection({
  title,
  description,
  hasContent,
  children,
}: {
  title: string;
  description: string;
  hasContent: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(hasContent);
  if (open) return <EditorSection title={title}>{children}</EditorSection>;
  return (
    <section className="flex items-center justify-between gap-4 border-b border-border/60 px-6 py-4 last:border-b-0">
      <div>
        <h2 className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          {title}
        </h2>
        <p className="mt-0.5 text-[12.5px] text-muted-foreground/80">{description}</p>
      </div>
      <Button variant="outline" size="xs" onClick={() => setOpen(true)}>
        <Plus /> Add
      </Button>
    </section>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-[12px] font-normal text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint && <div className="text-[11.5px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

/** Two fields side by side, stacking on very narrow screens. */
export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 min-[420px]:grid-cols-2">{children}</div>;
}

/** Quiet text button for small inline actions. */
export function TextButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm text-[12px] text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {children}
    </button>
  );
}

export interface DisclosureGroup {
  id: string;
  label: string;
  /** Start open (e.g. because these fields already have values). */
  defaultOpen: boolean;
  content: ReactNode;
}

/**
 * Progressive disclosure for secondary fields: open groups render in order,
 * closed ones collapse into a single row of "+ Add …" links.
 */
export function Disclosures({ groups }: { groups: DisclosureGroup[] }) {
  const [opened, setOpened] = useState(
    () => new Set(groups.filter((group) => group.defaultOpen).map((group) => group.id)),
  );
  const closed = groups.filter((group) => !opened.has(group.id));

  return (
    <>
      {groups
        .filter((group) => opened.has(group.id))
        .map((group) => (
          <div key={group.id} className="animate-in space-y-3 duration-150 fade-in-0">
            {group.content}
          </div>
        ))}
      {closed.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
          {closed.map((group) => (
            <TextButton key={group.id} onClick={() => setOpened(new Set(opened).add(group.id))}>
              <span className="inline-flex items-center gap-1">
                <Plus className="size-3" />
                {group.label}
              </span>
            </TextButton>
          ))}
        </div>
      )}
    </>
  );
}
