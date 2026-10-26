import type { FC, ReactNode } from 'react';

interface ToggleGroupProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const ToggleGroup: FC<ToggleGroupProps> = ({ title, description, children }) => {
  return (
    <section className="bg-surface border border-border rounded-lg p-3 space-y-2.5">
      <div className="border-b border-border pb-1.5 mb-2">
        <h2 className="text-xs font-semibold text-onPrimary uppercase tracking-wider">
          {title}
        </h2>
        {description && (
          <p className="text-[11px] text-onSurface mt-0.5 leading-tight">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </section>
  );
};
