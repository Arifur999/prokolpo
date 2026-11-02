import type { ReactNode } from "react";

type ProjectPageHeaderProps = {
  projectName: string;
  title: string;
  actions?: ReactNode;
};

// The top of every page inside a project: the project's name over the page title, actions
// on the right (boards ExpenseList, SupplierList, Accounts).
export function ProjectPageHeader({ projectName, title, actions }: ProjectPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-ink-2">{projectName}</span>
        <h1 className="m-0 text-2xl leading-[1.3] font-semibold lg:text-[28px]">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}
