import type { FC } from 'react';

export const Header: FC = () => {
  return (
    <header className="px-4 py-3 bg-surface border-b border-border flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center text-onAccent shadow-sm">
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
          </svg>
        </div>
        <span className="text-[13px] font-semibold tracking-tight text-onPrimary">
          TidyTube
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-activeGreenBg text-activeGreen text-[10px] font-medium"
          title="Active on youtube.com"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-activeGreen animate-pulse" />
          <span>Active</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surfaceHover text-onSurface border border-border">
          v0.1.0
        </span>
      </div>
    </header>
  );
};
