import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-4xl font-bold">{title}</h1>
      {children}
    </div>
  );
}
