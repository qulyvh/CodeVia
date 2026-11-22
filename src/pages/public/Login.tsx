import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LogIn,
  Quote,
  ShieldCheck,
  Sparkles,
  UserRound,
  XCircle,
} from 'lucide-react'
import { useLoginMutation } from '../../features/api/apiSlice'
import { useAppDispatch } from '../../app/hooks'
import { ROLE_HOME, setCredentials } from '../../features/auth/authSlice'
import { SAMPLE_ACCOUNTS } from '../../data/seed'
import { cn, getErrMsg, ROLE_LABEL } from '../../lib/utils'
import { Badge, Button, Input, Panel } from '../../components/ui'
import { GradientBlobs, Logo } from '../../components/common'

const BENEFITS = [
  'Bütün kurslar, video dərslər və silabus tək platformada',
  'Şəxsi kabinetdə dərs cədvəli, qiymətlər və ödənişlər',
  'Mentor dəstəyi və real vaxtda irəliləyiş izləmə',
]

const STATS = [
  { label: 'Məzun', value: '2 400+' },
  { label: 'Kurs', value: '10+' },
  { label: 'Reytinq', value: '4.8' },
  { label: 'İşə düzəlmə', value: '92%' },
]

const TONES: Record<string, 'accent' | 'brand' | 'neon'> = {
  student: 'accent',
  teacher: 'brand',
  admin: 'neon',
}

interface LoginErrors {
  email?: string
  password?: string
}

export default function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [login, { isLoading, error }] = useLoginMutation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})

  const errorText = getErrMsg(error)

  function fill(mail: string, pass: string) {
    setEmail(mail)
    setPassword(pass)
    setErrors({})
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const next: LoginErrors = {}
    if (!email.trim()) next.email = 'E-poçtu daxil edin.'
    if (!password) next.password = 'Şifrəni daxil edin.'
    setErrors(next)
    if (next.email || next.password) return

    try {
      const res = await login({ email: email.trim(), password }).unwrap()
      dispatch(
        setCredentials({
          user: {
            id: res.user.id,
            fullName: res.user.fullName,
            email: res.user.email,
            role: res.user.role,
            avatar: res.user.avatar,
            photo: res.user.photo,
          },
          token: res.token,
        }),
      )
      navigate(ROLE_HOME[res.user.role])
    } catch {
      /* xəta mesajı getErrMsg ilə göstərilir */
    }
  }

  return (
    <section className="relative overflow-hidden py-10 lg:py-16">
      <div className="absolute inset-0 grid-bg" />
      <GradientBlobs />
      <div className="relative mx-auto grid w-full max-w-7xl items-start gap-14 px-5 lg:grid-cols-2">
        {/* ---------------- Sol panel: brend ---------------- */}
        <div className="animate-fade-up">
          <Logo />
          <Badge tone="brand" className="mt-6" icon={<Sparkles className="h-3.5 w-3.5" />}>
            Azərbaycanda praktikaya əsaslanan IT təhsili
          </Badge>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            İrəliləyişiniz qaldığı yerdən <span className="gradient-text">davam etsin</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
            Şəxsi kabinetinizə daxil olun — kurslarınız, dərs cədvəliniz, qiymətləriniz və ödənişləriniz
            tək yerdə, əlçatan və aydın.
          </p>

          <ul className="mt-6 space-y-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-8 grid max-w-lg grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          <Panel className="mt-8 max-w-lg">
            <Quote className="h-6 w-6 text-brand-400/60" />
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              «Kursdan sonra 2 ay ərzində QA sahəsində işə düzəldim. Platformada hər şey sistemli və
              aydın idi, mentorlar isə həmişə dəstək oldu.»
            </p>
            <p className="mt-3 text-xs font-semibold text-brand-300">Fərid Babayev · QA Engineer</p>
          </Panel>
        </div>

        {/* ---------------- Sağ panel: giriş kartı ---------------- */}
        <div className="relative">
          <div className="absolute -inset-6 rounded-[36px] bg-brand-grad opacity-15 blur-3xl" />
          <div className="relative animate-fade-up animate-delay-100">
            <Panel className="rounded-3xl">
              <h2 className="text-2xl font-extrabold text-white">Hesabınıza daxil olun</h2>
              <p className="mt-1 text-sm text-slate-400">
                Test hesablardan birini seçin və ya məlumatlarınızı əl ilə daxil edin.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <Input
                  label="E-poçt"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ad@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  required
                />

                <div className="w-full">
                  <label htmlFor="login-password" className="label">
                    Şifrə <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      name="password"
                      type={showPass ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn('field pr-11', errors.password && 'field-error')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      aria-label={showPass ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-white"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="hint-error">
                      <XCircle className="h-3.5 w-3.5" /> {errors.password}
                    </p>
                  )}
                </div>

                {errorText && (
                  <div className="flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                    <p className="text-sm text-rose-200">{errorText}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  full
                  size="lg"
                  loading={isLoading}
                  leftIcon={<LogIn className="h-4 w-4" />}
                >
                  Daxil ol
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-slate-400">
                Hesabınız yoxdur?{' '}
                <Link
                  to="/qeydiyyat"
                  className="font-semibold text-brand-300 transition-colors hover:text-brand-200"
                >
                  Qeydiyyat
                </Link>
              </p>

              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Test hesablar
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <div className="flex flex-wrap gap-2">
                {SAMPLE_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => fill(acc.email, acc.password)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:border-brand-400/40 hover:text-white"
                  >
                    <UserRound className="h-3.5 w-3.5" />
                    {ROLE_LABEL[acc.role]}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid gap-2">
                {SAMPLE_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => fill(acc.email, acc.password)}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 text-left transition-all hover:border-brand-400/40 hover:bg-white/[0.06]"
                  >
                    <div className="min-w-0">
                      <Badge tone={TONES[acc.role]}>{acc.label}</Badge>
                      <p className="mt-1.5 truncate font-mono text-[11px] text-slate-400">{acc.email}</p>
                      <p className="truncate font-mono text-[11px] text-accent-300">{acc.password}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-300" />
                  </button>
                ))}
              </div>

              <p className="mt-3 flex items-start gap-2 text-xs text-slate-500">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
                İstənilən test hesaba klikləyin — e-poçt və şifrə avtomatik olaraq formaya doldurulacaq.
              </p>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  )
}
