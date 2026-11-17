"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import { activeIn, isGroup, subHref, type NavGroup, type NavLink, type NavNodeKey, type ProjectNav } from "@/lib/projectNav";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";

type ProjectNavLinksProps = {
  projectId: string;
  nav: ProjectNav;
  onNavigate?: () => void;
};

const row = "box-border flex h-10.5 w-full items-center gap-3 rounded-lg px-3 text-[15px] no-underline hover:bg-white/6 hover:text-white";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

// The project's pages (board Main, design v2): single links and collapsible groups. The group
// holding the current page opens by itself and stays open; any number can be open at once.
export function ProjectNavLinks({ projectId, nav, onNavigate }: ProjectNavLinksProps) {
  const t = useTranslations("Overview.nav");
  const pathname = usePathname();
  const search = useSearchParams();
  const base = projectHref(projectId, "");
  const path = pathname === base ? "" : pathname.slice(base.length + 1);
  const active = activeIn(nav, path, search);
  const [open, setOpen] = useState<Partial<Record<NavNodeKey, boolean>>>({});
  // A group stays open once the reader has been inside it, until they close it.
  const [seen, setSeen] = useState<NavNodeKey | null>(null);
  if (active && active.node !== seen) {
    setSeen(active.node);
    if (active.sub && !open[active.node]) setOpen((o) => ({ ...o, [active.node]: true }));
  }

  // Keys are built from the nav model (items.balance, sub.balance.accounts …).
  const say = (key: string) => t(key as Parameters<typeof t>[0]);
  const label = (node: NavLink | NavGroup) => say(`items.${node.label ?? node.key}`);
  const renderNode = (node: NavLink | NavGroup) => {
    if (!isGroup(node)) {
      const current = active?.node === node.key && !active.sub;
      return (
        <Link
          key={node.key}
          href={projectHref(projectId, node.page)}
          onClick={onNavigate}
          aria-current={current ? "page" : undefined}
          className={cn(row, focus, current ? "bg-white/12 font-semibold text-white" : "font-medium text-white/80")}
        >
          <span className={cn("flex", current && "text-gold-light")}>
            <Icon name={node.icon} size={18} strokeWidth={1.8} />
          </span>
          {label(node)}
        </Link>
      );
    }
    const isOpen = Boolean(open[node.key]);
    const holdsActive = active?.node === node.key;
    const listId = `pk-nav-${node.key}`;
    return (
      <div key={node.key} className="flex flex-col">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={listId}
          onClick={() => setOpen((o) => ({ ...o, [node.key]: !isOpen }))}
          className={cn(
            row,
            focus,
            "cursor-pointer border-none bg-transparent text-left",
            holdsActive ? "font-semibold text-white" : "font-medium text-white/80",
          )}
        >
          <span className={cn("flex", holdsActive && "text-gold-light")}>
            <Icon name={node.icon} size={18} strokeWidth={1.8} />
          </span>
          {label(node)}
          <Icon name={isOpen ? "chevronUp" : "chevronDown"} size={16} strokeWidth={2} className="ml-auto opacity-70" />
        </button>
        {isOpen && (
          <div id={listId} className="mt-0.5 mb-1.5 ml-5.25 flex flex-col gap-0.5 border-l border-white/18 pl-3">
            {node.children.map((sub) => {
              const current = holdsActive && active?.sub === sub.key;
              return (
                <Link
                  key={sub.key}
                  href={projectHref(projectId, subHref(sub))}
                  onClick={onNavigate}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "box-border flex h-9 items-center rounded-md px-3 text-sm no-underline hover:bg-white/6 hover:text-white",
                    focus,
                    current ? "bg-white/12 font-semibold text-white" : "font-medium text-white/72",
                  )}
                >
                  {say(`sub.${node.key}.${sub.key}`)}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav aria-label={t("label")} className="flex flex-col gap-0.5">
      {nav.main.map(renderNode)}
      <p className="m-0 px-3 pt-3.5 pb-1.5 text-[13px] font-semibold text-white/62">{t("more")}</p>
      {nav.more.map(renderNode)}
    </nav>
  );
}
