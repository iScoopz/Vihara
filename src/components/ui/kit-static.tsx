// Hook-free building blocks, safe to use from Server Components.
// Rules behind them live in DESIGN.md. Client-only pieces (Modal) are in kit.tsx.

export const inputClass =
  'w-full min-h-[44px] sm:min-h-[38px] bg-surface border border-line-strong rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-3 shadow-[inset_0_1px_2px_rgba(52,36,18,0.05)] focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand/15';

export const selectClass = inputClass;

// Colour carries meaning (DESIGN.md): purple = the app's actions, green = money/confirmation,
// gold = needs attention, red = destructive, white = leave without changing anything.
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'gold' | 'neutral' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

const raisedEdge = 'shadow-[0_1px_2px_rgba(52,36,18,0.07)]';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-on-brand shadow-button hover:bg-brand-hover',
  secondary: `bg-brand-soft text-brand-ink ring-1 ring-inset ring-brand/20 ${raisedEdge} hover:ring-brand/40 hover:brightness-[0.97]`,
  success: `bg-ok-soft text-ok ring-1 ring-inset ring-ok/25 ${raisedEdge} hover:ring-ok/45 hover:brightness-[0.97]`,
  gold: `bg-gold-soft text-gold ring-1 ring-inset ring-gold-line/40 ${raisedEdge} hover:ring-gold-line/70 hover:brightness-[0.97]`,
  neutral: `bg-surface text-ink border border-line-strong ${raisedEdge} hover:bg-surface-2`,
  ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
  danger: `bg-danger-soft text-danger ring-1 ring-inset ring-danger/25 ${raisedEdge} hover:ring-danger/45 hover:brightness-[0.97]`
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
  neutral: 'bg-surface-2 text-ink-2 ring-1 ring-inset ring-line',
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
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1">
      <div className="space-y-2 min-w-0">
        {/* Gold rule opens every page: the identity motif in DESIGN.md. */}
        <span className="block w-8 h-[3px] rounded-full bg-gold-line" aria-hidden />
        <h1 className="font-display text-[28px] sm:text-[34px] leading-[1.1] font-semibold text-ink">{title}</h1>
        {description && <p className="text-sm text-ink-2 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

// raised: the one card that floats above everything else on its screen (e.g. the login form).
export function Panel({ children, className = '', raised = false }: { children: React.ReactNode; className?: string; raised?: boolean }) {
  return <div className={`rounded-xl bg-surface border border-line ${raised ? 'shadow-raised' : 'shadow-panel'} ${className}`}>{children}</div>;
}

// Large serif number: the one figure on a screen the reader should see first.
export function FocalNumber({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`font-display text-4xl font-semibold leading-none tabular-nums text-brand ${className}`}>{children}</span>;
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
      <p className={kind === 'loading' ? 'text-sm text-ink-3' : 'font-display text-lg font-semibold text-ink'}>{title}</p>
      {description && <p className="text-sm text-ink-2 max-w-md mx-auto">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
