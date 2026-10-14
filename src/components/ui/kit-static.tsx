// Hook-free building blocks, safe to use from Server Components.
// Rules behind them live in DESIGN.md. Client-only pieces (Modal) are in kit.tsx.

export const inputClass =
  'w-full min-h-[44px] sm:min-h-[38px] bg-surface border border-line-strong rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-brand';

export const selectClass = inputClass;

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-on-brand hover:bg-brand-hover',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-surface-2',
  ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
  danger: 'bg-surface text-danger border border-line-strong hover:bg-danger-soft'
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'min-h-[36px] px-3 text-xs',
  md: 'min-h-[44px] sm:min-h-[38px] px-4 text-sm'
};

export function buttonClass(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md') {
  return `inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer disabled:opacity-50 ${buttonVariants[variant]} ${buttonSizes[size]}`;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button type={type} className={`${buttonClass(variant, size)} ${className}`} {...props} />;
}

type BadgeTone = 'neutral' | 'brand' | 'gold' | 'ok' | 'danger';

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-2 text-ink-2',
  brand: 'bg-brand-soft text-brand-ink',
  gold: 'bg-gold-soft text-gold',
  ok: 'bg-ok-soft text-ok',
  danger: 'bg-danger-soft text-danger'
};

export function Badge({ tone = 'neutral', children, className = '' }: { tone?: BadgeTone; children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap ${badgeTones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
      <div className="space-y-1 min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-ink">{title}</h1>
        {description && <p className="text-sm text-ink-2">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl bg-surface border border-line ${className}`}>{children}</div>;
}

export function Field({ label, hint, children, className = '' }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-medium text-ink-2 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-ink-3 mt-1">{hint}</span>}
    </label>
  );
}

// One component for loading, empty and error so every list says what is going on.
export function StateMessage({
  kind,
  title,
  description,
  action
}: {
  kind: 'loading' | 'empty' | 'error';
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className="py-12 px-4 text-center space-y-2">
      <p className={`text-sm ${kind === 'loading' ? 'text-ink-3' : 'font-semibold text-ink'}`}>{title}</p>
      {description && <p className="text-sm text-ink-2 max-w-md mx-auto">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
