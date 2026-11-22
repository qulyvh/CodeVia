import { useEffect } from 'react'
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Inbox,
  Info,
  Loader2,
  Star,
  X,
  XCircle,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { dismissToast } from '../../features/ui/uiSlice'

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'glass'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  full?: boolean
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-grad text-white shadow-glow hover:brightness-110 active:scale-[.98] border border-white/10',
  secondary: 'bg-white/10 text-white border border-white/15 hover:bg-white/15 active:scale-[.98]',
  outline:
    'bg-transparent text-brand-200 border border-brand-400/50 hover:bg-brand-500/10 hover:border-brand-400 active:scale-[.98]',
  ghost: 'bg-transparent text-slate-300 hover:bg-white/8 hover:text-white',
  danger: 'bg-rose-500/90 text-white border border-rose-400/40 hover:bg-rose-500 active:scale-[.98]',
  success:
    'bg-emerald-500/90 text-white border border-emerald-400/40 hover:bg-emerald-500 active:scale-[.98]',
  glass: 'glass text-white hover:bg-white/10 active:scale-[.98]',
}

const BUTTON_SIZES: Record<ButtonSize, string> = {
  xs: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  sm: 'h-9 px-3.5 text-sm rounded-xl gap-1.5',
  md: 'h-11 px-5 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  full,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex select-none items-center justify-center font-semibold transition-all duration-200',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25',
        'disabled:cursor-not-allowed disabled:opacity-50',
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        full && 'w-full',
        className,
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
      <span className="truncate">{children}</span>
      {!loading && rightIcon}
    </button>
  )
}

export function IconButton({
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all hover:bg-white/10 hover:text-white',
        className,
      )}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Surface / Panel                                                     */
/* ------------------------------------------------------------------ */
export function Panel({
  className,
  children,
  hover,
}: {
  className?: string
  children: ReactNode
  hover?: boolean
}) {
  return <div className={cn('panel p-5', hover && 'panel-hover', className)}>{children}</div>
}

export function SectionTitle({
  title,
  subtitle,
  action,
  icon,
  className,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  icon?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-5 flex flex-wrap items-end justify-between gap-3', className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-brand-500/15 text-brand-300">
            {icon}
          </span>
        )}
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Badge / Chip                                                        */
/* ------------------------------------------------------------------ */
export type BadgeTone =
  | 'brand'
  | 'accent'
  | 'neon'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'sky'

const BADGE_TONES: Record<BadgeTone, string> = {
  brand: 'bg-brand-500/15 text-brand-200 border-brand-400/30',
  accent: 'bg-accent-500/15 text-accent-200 border-accent-400/30',
  neon: 'bg-neon-500/15 text-neon-300 border-neon-400/30',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  danger: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
  neutral: 'bg-white/8 text-slate-300 border-white/15',
  sky: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
}

export function Badge({
  tone = 'neutral',
  children,
  icon,
  className,
}: {
  tone?: BadgeTone
  children: ReactNode
  icon?: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        BADGE_TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Inputs                                                              */
/* ------------------------------------------------------------------ */
export interface FieldProps {
  label?: string
  error?: string
  hint?: string
  ok?: string
  required?: boolean
  className?: string
}

export function Input({
  label,
  error,
  hint,
  ok,
  required,
  className,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & FieldProps) {
  const inputId = id ?? rest.name ?? label
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <input
        id={inputId}
        {...rest}
        className={cn('field', error && 'field-error', !error && ok && 'field-ok')}
      />
      {error ? (
        <p className="hint-error">
          <XCircle className="h-3.5 w-3.5" /> {error}
        </p>
      ) : ok ? (
        <p className="hint-ok">
          <Check className="h-3.5 w-3.5" /> {ok}
        </p>
      ) : hint ? (
        <p className="hint">{hint}</p>
      ) : null}
    </div>
  )
}

export function Textarea({
  label,
  error,
  hint,
  required,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="label">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <textarea {...rest} className={cn('field min-h-[110px] resize-y', error && 'field-error')} />
      {error ? (
        <p className="hint-error">
          <XCircle className="h-3.5 w-3.5" /> {error}
        </p>
      ) : hint ? (
        <p className="hint">{hint}</p>
      ) : null}
    </div>
  )
}

export function Select({
  label,
  error,
  hint,
  required,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & FieldProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="label">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <div className="relative">
        <select {...rest} className={cn('field appearance-none pr-10', error && 'field-error')}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      {error ? (
        <p className="hint-error">
          <XCircle className="h-3.5 w-3.5" /> {error}
        </p>
      ) : hint ? (
        <p className="hint">{hint}</p>
      ) : null}
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3"
    >
      <span
        className={cn(
          'relative h-6 w-11 rounded-full border transition-colors',
          checked ? 'border-brand-400/40 bg-brand-500/70' : 'border-white/15 bg-white/10',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all',
            checked ? 'left-[22px]' : 'left-0.5',
          )}
        />
      </span>
      {label && <span className="text-sm text-slate-300">{label}</span>}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Progress                                                           */
/* ------------------------------------------------------------------ */
export function Progress({
  value,
  className,
  tone = 'brand',
  showLabel,
}: {
  value: number
  className?: string
  tone?: 'brand' | 'accent' | 'success' | 'warning'
  showLabel?: boolean
}) {
  const tones = {
    brand: 'from-brand-500 to-neon-500',
    accent: 'from-accent-400 to-brand-500',
    success: 'from-emerald-400 to-accent-400',
    warning: 'from-amber-400 to-rose-400',
  }
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', tones[tone])}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && <span className="w-10 shrink-0 text-right text-xs font-semibold text-slate-300">{value}%</span>}
    </div>
  )
}

export function Ring({
  value,
  size = 76,
  stroke = 7,
  label,
}: {
  value: number
  size?: number
  stroke?: number
  label?: string
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`ring-${size}-${stroke}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="60%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,.09)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#ring-${size}-${stroke})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-sm font-bold text-white">{value}%</div>
        {label && <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Avatar / Rating                                                     */
/* ------------------------------------------------------------------ */
export function Avatar({
  name,
  gradient,
  size = 40,
  className,
  ring,
  src,
}: {
  name: string
  gradient?: string
  size?: number
  className?: string
  ring?: boolean
  /** Profil şəkli (data URL və ya xarici URL) */
  src?: string
}) {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase()
  if (src) {
    return (
      <span
        className={cn('shrink-0 overflow-hidden rounded-full bg-ink-800 shadow-lg', ring && 'ring-2 ring-white/15', className)}
        style={{ width: size, height: size }}
      >
        <img src={src} alt={name} className="h-full w-full object-cover" />
      </span>
    )
  }
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-bold text-white shadow-lg',
        gradient ?? 'from-brand-500 to-accent-400',
        ring && 'ring-2 ring-white/15',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {letters}
    </span>
  )
}

export function Rating({
  value,
  count,
  size = 14,
}: {
  value: number
  count?: number
  size?: number
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={cn(
              i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-600',
            )}
          />
        ))}
      </span>
      <span className="text-xs font-semibold text-slate-300">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-xs text-slate-500">({count})</span>}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-ink-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'glass-strong relative z-10 max-h-[90vh] w-full animate-scale-in overflow-hidden rounded-3xl shadow-2xl',
          sizes[size],
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <IconButton onClick={onClose} aria-label="Bağla">
            <X className="h-4 w-4" />
          </IconButton>
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/10 bg-white/[0.02] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Təsdiqlə',
  loading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Ləğv et
          </Button>
          <Button variant="danger" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-500/15 text-rose-400">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <p className="text-sm text-slate-300">{message}</p>
      </div>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/* Tabs / Empty / Loader                                               */
/* ------------------------------------------------------------------ */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { value: T; label: string; count?: number }[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all',
            value === t.value
              ? 'border-brand-400/40 bg-brand-500/15 text-white shadow-glow'
              : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.07] hover:text-white',
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">{t.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}

export function EmptyState({
  title,
  message,
  action,
  icon,
}: {
  title: string
  message: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/12 text-brand-300">
        {icon ?? <Inbox className="h-6 w-6" />}
      </span>
      <h4 className="text-base font-bold text-white">{title}</h4>
      <p className="max-w-sm text-sm text-slate-400">{message}</p>
      {action}
    </div>
  )
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-brand-400', className)} />
}

export function Loader({ label = 'Yüklənir...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Spinner className="h-7 w-7" />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  )
}

export function SkeletonCard({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="panel animate-pulse space-y-4 p-6">
          <div className="h-36 rounded-2xl bg-white/5" />
          <div className="h-4 w-3/4 rounded bg-white/8" />
          <div className="h-3 w-1/2 rounded bg-white/5" />
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Table primitives                                                    */
/* ------------------------------------------------------------------ */
export function TableWrap({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto rounded-2xl border border-white/10', className)}>
      <table className="w-full min-w-[640px] border-collapse text-sm">{children}</table>
    </div>
  )
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'border-b border-white/10 bg-white/[0.03] px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400',
        className,
      )}
    >
      {children}
    </th>
  )
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn('border-b border-white/5 px-4 py-3 align-middle text-slate-300', className)}>
      {children}
    </td>
  )
}

/* ------------------------------------------------------------------ */
/* Toaster                                                             */
/* ------------------------------------------------------------------ */
export function Toaster() {
  const toasts = useAppSelector((s) => s.ui.toasts)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map((t) =>
      setTimeout(() => dispatch(dismissToast(t.id)), 4200),
    )
    return () => timers.forEach(clearTimeout)
  }, [toasts, dispatch])

  const tones = {
    success: { cls: 'border-emerald-400/30 bg-emerald-500/12', icon: <Check className="h-4 w-4 text-emerald-400" /> },
    error: { cls: 'border-rose-400/30 bg-rose-500/12', icon: <XCircle className="h-4 w-4 text-rose-400" /> },
    info: { cls: 'border-brand-400/30 bg-brand-500/12', icon: <Info className="h-4 w-4 text-brand-300" /> },
    warning: { cls: 'border-amber-400/30 bg-amber-500/12', icon: <AlertTriangle className="h-4 w-4 text-amber-400" /> },
  }

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex w-[min(360px,92vw)] flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex animate-slide-in-right items-start gap-3 rounded-2xl border p-4 backdrop-blur-xl',
            tones[t.type].cls,
          )}
        >
          <span className="mt-0.5">{tones[t.type].icon}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white">{t.title}</p>
            {t.message && <p className="mt-0.5 text-xs text-slate-300">{t.message}</p>}
          </div>
          <button
            onClick={() => dispatch(dismissToast(t.id))}
            className="text-slate-400 transition-colors hover:text-white"
            aria-label="Bağla"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
