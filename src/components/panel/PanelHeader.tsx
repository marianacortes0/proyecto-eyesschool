import type { ReactNode } from 'react';

/** Editorial page header used across panel screens (light word + bold accent). */
export default function PanelHeader({
  light,
  bold,
  subtitle,
  actions,
}: {
  light: string;
  bold: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-12 flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-start">
      <div>
        <h1 className="font-headline text-4xl lg:text-5xl font-light tracking-tight text-on-surface mb-3">
          {light} <span className="font-black text-primary">{bold}</span>
        </h1>
        {subtitle && (
          <p className="text-on-surface-variant text-base lg:text-lg font-light tracking-wide">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-4 flex-wrap">{actions}</div>}
    </header>
  );
}
