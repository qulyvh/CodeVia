import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Camera, Play, Trash2, TrendingDown, TrendingUp, Upload } from 'lucide-react'
import type { SessionUser } from '../../types'
import { cn, courseCover, getErrMsg, youtubeEmbed, youtubeThumb } from '../../lib/utils'
import { useAppDispatch } from '../../app/hooks'
import { updateSessionUser } from '../../features/auth/authSlice'
import { useUpdateUserMutation } from '../../features/api/apiSlice'
import { pushToast } from '../../features/ui/uiSlice'
import { Avatar, Badge, Button } from '../ui'

/* ------------------------------------------------------------------ */
/* Logo                                                                */
/* ------------------------------------------------------------------ */
export function Logo({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-brand-grad shadow-glow">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" strokeWidth="2.2">
          <path
            d="M8.5 7 4 12l4.5 5M15.5 7 20 12l-4.5 5M13.5 5l-3 14"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="absolute inset-0 rounded-xl bg-brand-grad opacity-45 blur-md" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[17px] font-extrabold tracking-tight text-white">
            Code<span className="gradient-text">Via</span>
          </span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Academy
          </span>
        </span>
      )}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* StatCard                                                            */
/* ------------------------------------------------------------------ */
const TONE_RING: Record<string, string> = {
  brand: 'from-brand-500/25 to-transparent text-brand-300 border-brand-400/25',
  accent: 'from-accent-500/25 to-transparent text-accent-300 border-accent-400/25',
  neon: 'from-neon-500/25 to-transparent text-neon-300 border-neon-400/25',
  emerald: 'from-emerald-500/25 to-transparent text-emerald-300 border-emerald-400/25',
  amber: 'from-amber-500/25 to-transparent text-amber-300 border-amber-400/25',
  rose: 'from-rose-500/25 to-transparent text-rose-300 border-rose-400/25',
}

export function StatCard({
  label,
  value,
  icon,
  tone = 'brand',
  trend,
  hint,
  className,
}: {
  label: string
  value: ReactNode
  icon: ReactNode
  tone?: keyof typeof TONE_RING
  trend?: number
  hint?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'panel group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/35',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-gradient-to-br opacity-70 blur-2xl transition-opacity group-hover:opacity-100',
          TONE_RING[tone],
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-extrabold text-white">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        <span
          className={cn(
            'grid h-11 w-11 shrink-0 place-items-center rounded-xl border bg-white/[0.04]',
            TONE_RING[tone],
          )}
        >
          {icon}
        </span>
      </div>
      {trend !== undefined && (
        <div className="relative mt-3 inline-flex items-center gap-1 text-xs font-semibold">
          {trend >= 0 ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
          )}
          <span className={trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
            {trend >= 0 ? '+' : ''}
            {trend}%
          </span>
          <span className="text-slate-500">keçən həftəyə nisbətən</span>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* PageHeader                                                          */
/* ------------------------------------------------------------------ */
export function PageHeader({
  title,
  subtitle,
  actions,
  icon,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-4">
        {icon && (
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-brand-grad-soft text-brand-200 shadow-glow">
            {icon}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* CoverImage                                                          */
/* ------------------------------------------------------------------ */
export function CoverImage({
  prompt,
  title,
  className,
  ratio = 'aspect-[16/9]',
  tech,
}: {
  prompt: string
  title: string
  className?: string
  ratio?: string
  tech?: string[]
}) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={cn('relative w-full overflow-hidden rounded-2xl bg-ink-700', ratio, className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-brand-600/40 via-neon-600/25 to-accent-500/35" />
      {!failed && (
        <img
          src={courseCover(prompt)}
          alt={title}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/35 to-transparent" />
      {tech && tech.length > 0 && (
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {tech.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-lg border border-white/15 bg-ink-950/70 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-200 backdrop-blur"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* VideoPlayer                                                         */
/* ------------------------------------------------------------------ */
export function VideoPlayer({
  youtubeId,
  title,
  badge,
  className,
}: {
  youtubeId: string
  title: string
  badge?: string
  className?: string
}) {
  const [playing, setPlaying] = useState(false)
  return (
    <div
      className={cn(
        'group relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-ink-900',
        className,
      )}
    >
      {playing ? (
        <iframe
          key={youtubeId}
          src={`${youtubeEmbed(youtubeId)}&autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="absolute inset-0 h-full w-full"
          aria-label={`${title} videosunu oynat`}
        >
          <img
            src={youtubeThumb(youtubeId)}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover opacity-75 transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="relative grid h-16 w-16 place-items-center rounded-full bg-brand-grad shadow-glow transition-transform duration-300 group-hover:scale-110">
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-400/40" />
              <Play className="h-7 w-7 translate-x-0.5 fill-white text-white" />
            </span>
          </span>
          <span className="absolute bottom-4 left-4 right-4 text-left">
            {badge && (
              <Badge tone="brand" className="mb-2">
                {badge}
              </Badge>
            )}
            <span className="block text-sm font-bold text-white drop-shadow">{title}</span>
          </span>
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* GradientBlobs (background decoration)                               */
/* ------------------------------------------------------------------ */
export function GradientBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 top-10 h-72 w-72 animate-blob rounded-full bg-brand-600/25 blur-3xl" />
      <div className="animate-delay-200 absolute right-0 top-40 h-80 w-80 animate-blob rounded-full bg-accent-500/20 blur-3xl" />
      <div className="animate-delay-300 absolute bottom-0 left-1/3 h-72 w-72 animate-blob rounded-full bg-neon-500/20 blur-3xl" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* ProfilePhotoCard — profil şəklini yükləmə/silmə                     */
/* ------------------------------------------------------------------ */
export function ProfilePhotoCard({
  user,
  photo,
  size = 96,
}: {
  user: SessionUser
  photo?: string
  size?: number
}) {
  const dispatch = useAppDispatch()
  const fileRef = useRef<HTMLInputElement>(null)
  const [updateUser, { isLoading }] = useUpdateUserMutation()

  const persist = async (next: string) => {
    try {
      await updateUser({ id: user.id, patch: { photo: next } }).unwrap()
      dispatch(updateSessionUser({ photo: next }))
      dispatch(
        pushToast({
          type: 'success',
          title: next ? 'Profil şəkli yeniləndi' : 'Profil şəkli silindi',
        }),
      )
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const onPick = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      dispatch(pushToast({ type: 'error', title: 'Yalnız şəkil faylı seçin (JPG və ya PNG)' }))
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      dispatch(pushToast({ type: 'error', title: 'Şəkil ölçüsü 2 MB-dan çox olmamalıdır' }))
      return
    }
    const reader = new FileReader()
    reader.onload = () => persist(String(reader.result))
    reader.onerror = () => dispatch(pushToast({ type: 'error', title: 'Fayl oxuna bilmədi' }))
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar
          name={user.fullName}
          gradient={user.avatar}
          src={photo || undefined}
          size={size}
          ring
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-brand-grad text-white shadow-glow transition-transform hover:scale-105"
          title="Şəkil seç"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          size="xs"
          variant="secondary"
          loading={isLoading}
          leftIcon={<Upload className="h-3.5 w-3.5" />}
          onClick={() => fileRef.current?.click()}
        >
          Şəkil yüklə
        </Button>
        {photo ? (
          <Button
            size="xs"
            variant="ghost"
            className="text-rose-300"
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={() => persist('')}
          >
            Sil
          </Button>
        ) : null}
      </div>
      <p className="text-center text-xs text-slate-500">JPG və ya PNG, maksimum 2 MB</p>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}
