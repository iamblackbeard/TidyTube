import type { FC } from 'react';

interface CheckboxItemProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  indent?: boolean;
  isMaster?: boolean;
}

export const CheckboxItem: FC<CheckboxItemProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
  indent = false,
  isMaster = false,
}) => {
  const itemContent = (
    <label
      htmlFor={id}
      className={`group flex items-start cursor-pointer transition-colors select-none ${
        isMaster
          ? 'gap-3'
          : indent
          ? 'gap-2.5 p-1.5 rounded-md hover:bg-surfaceHover'
          : 'gap-3 p-2 rounded-lg hover:bg-surfaceHover'
      }`}
    >
      <div className="pt-0.5 relative shrink-0">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <div
          className={`checkbox-box border border-border bg-surface peer-checked:bg-accent peer-checked:border-accent flex items-center justify-center text-onAccent ${
            indent
              ? 'w-3.5 h-3.5 rounded-[3px]'
              : 'w-4 h-4 rounded-[4px]'
          }`}
        >
          <svg
            className={`${
              indent ? 'w-2.5 h-2.5' : 'w-3 h-3'
            } stroke-onAccent stroke-[2.5] fill-none opacity-0 peer-checked:opacity-100 transition-opacity`}
            viewBox="0 0 24 24"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`${
            isMaster
              ? 'text-[13px] font-semibold text-onPrimary leading-tight'
              : indent
              ? 'text-[12.5px] font-medium text-onPrimary group-hover:text-white leading-tight'
              : 'text-[13px] font-medium text-onPrimary group-hover:text-white leading-tight'
          }`}
        >
          {label}
        </div>
        {description && (
          <div className="text-[11px] text-onSurface mt-0.5 leading-tight">
            {description}
          </div>
        )}
      </div>
    </label>
  );

  if (isMaster) {
    return (
      <div className="bg-surface rounded-lg border border-border p-2">
        {itemContent}
      </div>
    );
  }

  return itemContent;
};
