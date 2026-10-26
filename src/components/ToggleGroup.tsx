import type { FC, ReactNode } from 'react';

interface ToggleGroupProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const ToggleGroup: FC<ToggleGroupProps> = ({ title, description, children }) => {
  return (
    <section className="space-y-1">
      <div className="px-2 py-0.5">
        <h2 className="text-[10px] font-semibold uppercase tracking-wider text-onSurface">
          {title}
        </h2>
        {description && (
          <p className="text-[11px] text-textMuted mt-0.5 leading-tight">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-0.5">
        {children}
      </div>
    </section>
  );
};
