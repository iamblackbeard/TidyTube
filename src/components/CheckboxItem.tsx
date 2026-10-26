import type { FC } from 'react';

interface CheckboxItemProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  indent?: boolean;
}

export const CheckboxItem: FC<CheckboxItemProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
  indent = false,
}) => {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-2.5 p-1.5 rounded cursor-pointer transition-colors hover:bg-primary/40 select-none ${
        indent ? 'ml-4 border-l border-border pl-2.5' : ''
      }`}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-border bg-primary text-accent accent-accent focus:ring-0 focus:ring-offset-0 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-onPrimary block leading-snug">
          {label}
        </span>
        {description && (
          <span className="text-[11px] text-onSurface block mt-0.5 leading-tight">
            {description}
          </span>
        )}
      </div>
    </label>
  );
};
