import type { FC } from 'react';

export const Header: FC = () => {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
      <div className="flex items-center space-x-2">
        <span className="w-3 h-3 rounded-full bg-accent animate-pulse" />
        <h1 className="text-base font-semibold text-onPrimary tracking-wide">
          TidyTube
        </h1>
      </div>
      <span className="text-xs px-2 py-0.5 rounded bg-primary text-onSurface border border-border">
        v0.1.0
      </span>
    </header>
  );
};
