import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Upload,
  UserPlus,
  XCircle,
} from 'lucide-react'
import { useRegisterMutation } from '../../features/api/apiSlice'
import { useAppDispatch } from '../../app/hooks'
import { pushToast } from '../../features/ui/uiSlice'
import type { Role } from '../../types'
import { cn, getErrMsg } from '../../lib/utils'
import { Badge, Button, Input, Panel, Select, Textarea } from '../../components/ui'
import { GradientBlobs, Logo } from '../../components/common'

const CITIES = [
  'Bakı',
  'Sumqayıt',
  'Gəncə',
  'Mingəçevir',
  'Lənkəran',
  'Şəki',
  'Şirvan',
  'Naxçıvan',
  'Digər',
]

const PERKS: Record<'student' | 'teacher', string[]> = {
  student: [
    'Pulsuz qəbul testi ilə səviyyənizi müəyyən edin',
    'Start, Pro və ya Elite paketlərindən birini seçin',
    'Onlayn və ya oflayn formatda dərhal başlayın',
  ],
  teacher: [
    'CV-nizi göndərin — müraciətiniz yoxlanılacaq',
    'Təsdiqdən sonra müəllim panelinə giriş əldə edin',
    'Dərslərinizi, silabusu və tələbələrinizi idarə edin',
  ],
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface RegisterErrors {
  fullName?: string
  email?: string
  phone?: string
  city?: string
  password?: string
  password2?: string
  specialization?: string
  experienceYears?: string
  cv?: string
}

export default function Register() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [register, { isLoading, error }] = useRegisterMutation()
  const fileRef = useRef<HTMLInputElement>(null)

  const [role, setRole] = useState<Role>('student')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState<RegisterErrors>({})

  /* müəllim sahələri */
  const [specialization, setSpecialization] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [education, setEducation] = useState('')
  const [skills, setSkills] = useState('')
  const [languages, setLanguages] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [bio, setBio] = useState('')
  const [cvText, setCvText] = useState('')
  const [cvFileName, setCvFileName] = useState('')

  const [pending, setPending] = useState(false)
  const isTeacher = role === 'teacher'
  const errorText = getErrMsg(error)

  function toList(value: string): string[] {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const next: RegisterErrors = {}
    if (!fullName.trim()) next.fullName = 'Ad və soyadı daxil edin.'
    if (!email.trim()) next.email = 'E-poçtu daxil edin.'
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Düzgün e-poçt ünvanı daxil edin.'
    if (!phone.trim()) next.phone = 'Telefon nömrəsini daxil edin.'
    else if (phone.replace(/\D/g, '').length < 9) next.phone = 'Düzgün telefon nömrəsi daxil edin.'
    if (!city) next.city = 'Şəhəri seçin.'
    if (!password) next.password = 'Şifrəni daxil edin.'
    else if (password.length < 6) next.password = 'Şifrə ən azı 6 simvol olmalıdır.'
    if (!password2) next.password2 = 'Şifrəni təkrar daxil edin.'
    else if (password2 !== password) next.password2 = 'Şifrələr uyğun gəlmir.'

    if (isTeacher) {
      if (!specialization.trim()) next.specialization = 'İxtisas sahəsini daxil edin.'
      if (experienceYears && Number(experienceYears) < 0) next.experienceYears = 'Düzgün rəqəm daxil edin.'
      if (!cvFileName && !cvText.trim()) next.cv = 'CV faylını yükləyin və ya CV mətnini yapışdırın.'
    }

    setErrors(next)
    if (Object.keys(next).length > 0) return

    try {
      const created = await register({
        role,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        city,
        ...(isTeacher
          ? {
              specialization: specialization.trim(),
              experienceYears: experienceYears ? Number(experienceYears) : undefined,
              education: education.trim() || undefined,
              skills: toList(skills),
              languages: toList(languages),
              hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
              bio: bio.trim() || undefined,
              cvText: cvText.trim() || undefined,
              cvFileName: cvFileName || undefined,
            }
          : {}),
      }).unwrap()

      if (created.status === 'pending') {
        setPending(true)
        dispatch(
          pushToast({
            type: 'info',
            title: 'Müraciət göndərildi',
            message: 'Müraciətiniz admin təsdiqini gözləyir.',
          }),
        )
        return
      }

      dispatch(
        pushToast({
          type: 'success',
          title: 'Qeydiyyat uğurlu',
          message: 'İndi daxil ola bilərsiniz.',
        }),
      )
      navigate('/giris')
    } catch {
      /* xəta mesajı getErrMsg ilə göstərilir */
    }
  }

  /* ---------------- müraciət göndərildi ---------------- */
  if (pending) {
    return (
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 grid-bg" />
        <GradientBlobs />
        <div className="relative mx-auto w-full max-w-2xl px-5">
          <Panel className="animate-scale-in rounded-3xl text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/15 text-amber-300">
              <Clock className="h-8 w-8" />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold text-white">Müraciətiniz qeydə alındı</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Müəllim müraciətiniz administrator tərəfindən yoxlanılır. Təsdiqləndikdən sonra
              <span className="font-semibold text-white"> {email} </span>
              ünvanı ilə sistemə daxil ola biləcəksiniz. Nəticə barədə sizə məlumat veriləcək.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/">
                <Button variant="secondary">Ana səhifə</Button>
              </Link>
              <Link to="/giris">
                <Button leftIcon={<ArrowRight className="h-4 w-4" />}>Giriş səhifəsi</Button>
              </Link>
            </div>
          </Panel>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden py-10 lg:py-16">
      <div className="absolute inset-0 grid-bg" />
      <GradientBlobs />
      <div className="relative mx-auto grid w-full max-w-7xl items-start gap-14 px-5 lg:grid-cols-2">
        {/* ---------------- Sol panel: brend ---------------- */}
        <div className="animate-fade-up">
          <Logo />
          <Badge tone="accent" className="mt-6" icon={<Sparkles className="h-3.5 w-3.5" />}>
            Yeni həyat — yeni peşə
          </Badge>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Hesab yaradın və <span className="gradient-text">bu gün başlayın</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
            {isTeacher
              ? 'Müəllim kimi qoşulun — CV-nizi göndərin, müraciətiniz təsdiqləndikdən sonra giriş əldə edin.'
              : 'Qeydiyyatdan keçin, qəbul testindən keçin və səviyyənizə uyğun kurslara dərhal qoşulun. Bütün proses bir neçə dəqiqə çəkir.'}
          </p>

          <ul className="mt-6 space-y-3">
            {PERKS[isTeacher ? 'teacher' : 'student'].map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-8 grid max-w-lg grid-cols-3 gap-4">
            {[
              { label: 'Kurs', value: '10+' },
              { label: 'Müəllim', value: '8' },
              { label: 'Məzun', value: '2 400+' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          <Panel className="mt-8 max-w-lg">
            <ShieldCheck className="h-6 w-6 text-brand-400/70" />
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Bu simulyasiya mühitidir — bank ödənişi yoxdur və bütün məlumatlar yalnız brauzerinizin
              yaddaşında saxlanılır.
            </p>
          </Panel>
        </div>

        {/* ---------------- Sağ panel: qeydiyyat kartı ---------------- */}
        <div className="relative">
          <div className="absolute -inset-6 rounded-[36px] bg-brand-grad opacity-15 blur-3xl" />
          <div className="relative animate-fade-up animate-delay-100">
            <Panel className="rounded-3xl">
              <h2 className="text-2xl font-extrabold text-white">Qeydiyyatdan keçin</h2>
              <p className="mt-1 text-sm text-slate-400">
                {isTeacher
                  ? 'Müəllim müraciəti üçün məlumatlarınızı və CV-nizi göndərin.'
                  : 'Məlumatlarınızı doldurun — tələbə hesabınız dərhal yaradılacaq.'}
              </p>

              {/* rol seçimi */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {([
                  { value: 'student' as Role, label: 'Tələbə', desc: 'Kurslara qoşulmaq üçün', icon: GraduationCap },
                  { value: 'teacher' as Role, label: 'Müəllim', desc: 'Dərs vermək üçün (CV tələb olunur)', icon: Briefcase },
                ]).map((r) => {
                  const Icon = r.icon
                  const active = role === r.value
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        setRole(r.value)
                        setErrors({})
                      }}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl border p-4 text-left transition-all',
                        active
                          ? 'border-brand-400/50 bg-brand-500/12 shadow-glow'
                          : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06]',
                      )}
                    >
                      <span
                        className={cn(
                          'grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10',
                          active ? 'bg-brand-500/20 text-brand-200' : 'bg-white/5 text-slate-300',
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                          {r.label}
                          {active && <Check className="h-3.5 w-3.5 text-brand-300" />}
                        </span>
                        <span className="block text-xs text-slate-400">{r.desc}</span>
                      </span>
                    </button>
                  )
                })}
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <Input
                  label="Ad və soyad"
                  name="fullName"
                  autoComplete="name"
                  placeholder="Ad Soyad"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  error={errors.fullName}
                  required
                />

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

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Telefon"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+994 50 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={errors.phone}
                    required
                  />
                  <Select
                    label="Şəhər"
                    name="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    error={errors.city}
                    required
                  >
                    <option value="">Şəhər seçin</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="w-full">
                  <label htmlFor="reg-password" className="label">
                    Şifrə <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      name="password"
                      type={showPass ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Ən azı 6 simvol"
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

                <Input
                  label="Şifrə təkrarı"
                  name="password2"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Şifrəni təkrar daxil edin"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  error={errors.password2}
                  required
                />

                {/* ---------------- müəllim əlavə sahələri ---------------- */}
                {isTeacher && (
                  <div className="animate-fade-in space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4 text-accent-300" />
                      <h3 className="text-sm font-bold text-white">Müəllim müraciəti</h3>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="İxtisas sahəsi"
                        name="specialization"
                        placeholder="Məs: Frontend / React"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        error={errors.specialization}
                        required
                      />
                      <Input
                        label="Təcrübə (il)"
                        name="experienceYears"
                        type="number"
                        min={0}
                        placeholder="5"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        error={errors.experienceYears}
                      />
                    </div>

                    <Input
                      label="Təhsil"
                      name="education"
                      placeholder="Universitet / ixtisas"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Bacarıqlar"
                        name="skills"
                        placeholder="React, Node.js, SQL"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        hint="Vergüllə ayırın."
                      />
                      <Input
                        label="Dillər"
                        name="languages"
                        placeholder="Azərbaycan, İngilis"
                        value={languages}
                        onChange={(e) => setLanguages(e.target.value)}
                        hint="Vergüllə ayırın."
                      />
                    </div>

                    <Input
                      label="Saatlıq haqqı (AZN)"
                      name="hourlyRate"
                      type="number"
                      min={0}
                      placeholder="30"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                    />

                    <Textarea
                      label="Qısa təqdimat"
                      name="bio"
                      placeholder="Tədris təcrübəniz və yanaşmanız barədə qısa məlumat..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />

                    {/* CV yükləmə */}
                    <div className="w-full">
                      <label className="label">
                        CV faylı <span className="text-rose-400">*</span>
                      </label>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:border-brand-400/40 hover:text-white"
                        >
                          <Upload className="h-4 w-4" /> Fayl seç
                        </button>
                        {cvFileName ? (
                          <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300">
                            <FileText className="h-4 w-4" /> {cvFileName}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">PDF, DOC və ya DOCX</span>
                        )}
                      </div>
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          setCvFileName(e.target.files?.[0]?.name ?? '')
                          setErrors((p) => ({ ...p, cv: undefined }))
                        }}
                      />
                    </div>

                    <Textarea
                      label="CV mətni"
                      name="cvText"
                      placeholder="Və ya CV məzmununu buraya yapışdırın..."
                      value={cvText}
                      onChange={(e) => {
                        setCvText(e.target.value)
                        setErrors((p) => ({ ...p, cv: undefined }))
                      }}
                      hint="Fayl yükləmək mümkün deyilsə, CV mətnini yapışdırın."
                    />

                    {errors.cv && (
                      <p className="hint-error">
                        <XCircle className="h-3.5 w-3.5" /> {errors.cv}
                      </p>
                    )}
                  </div>
                )}

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
                  leftIcon={<UserPlus className="h-4 w-4" />}
                >
                  {isTeacher ? 'Müraciət göndər' : 'Qeydiyyatdan keç'}
                </Button>

                {isTeacher && (
                  <p className="text-center text-xs text-slate-500">
                    Müəllim hesabları yalnız admin təsdiqindən sonra aktivləşir.
                  </p>
                )}
              </form>

              <p className="mt-4 text-center text-sm text-slate-400">
                Artıq hesabınız var?{' '}
                <Link
                  to="/giris"
                  className="inline-flex items-center gap-1 font-semibold text-brand-300 transition-colors hover:text-brand-200"
                >
                  Daxil olun <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </p>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  )
}
