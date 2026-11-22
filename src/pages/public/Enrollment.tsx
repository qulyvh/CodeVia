import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Layers,
  Laptop,
  Lock,
  MapPin,
  MonitorPlay,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react'
import {
  useCreateEnrollmentMutation,
  useGetCourseQuery,
  useGetCoursesQuery,
  useGetQuizQuery,
  useGetUsersQuery,
  useProcessPaymentMutation,
  useUpdateEnrollmentMutation,
} from '../../features/api/apiSlice'
import { useAppDispatch, useAuth } from '../../app/hooks'
import { pushToast } from '../../features/ui/uiSlice'
import type { CourseMode, Enrollment, PackageTier, Payment, ScheduleSlot, TeachingMode } from '../../types'
import type { CardInput } from '../../lib/utils'
import {
  CAMPUSES,
  MODE_LABEL,
  PACKAGES,
  SLOT_LABEL,
  TEACHING_DESC,
  TEACHING_LABEL,
  TEST_CARDS,
  WEEKDAYS,
  cardBrand,
  cn,
  formatAZN,
  formatCardNumber,
  formatDate,
  formatExpiry,
  getErrMsg,
  nextLessonDates,
  packagePrice,
  todayISO,
  validateCard,
} from '../../lib/utils'
import { Avatar, Badge, Button, Input, Loader, Panel, Progress, Ring, Select } from '../../components/ui'
import { CoverImage, GradientBlobs } from '../../components/common'

/* ------------------------------------------------------------------ */
const STEPS = [
  { key: 'quiz', label: 'Qəbul testi', icon: ClipboardCheck },
  { key: 'package', label: 'Paket seçimi', icon: Layers },
  { key: 'schedule', label: 'Cədvəl', icon: CalendarCheck },
  { key: 'payment', label: 'Ödəniş', icon: CreditCard },
] as const

const MODE_OPTIONS: { value: CourseMode; label: string; desc: string; icon: typeof Laptop }[] = [
  { value: 'online', label: 'Onlayn', desc: 'Canlı yayım + video arxiv', icon: Laptop },
  { value: 'offline', label: 'Oflayn', desc: 'Filialda üzbəüz dərslər', icon: MapPin },
  { value: 'hybrid', label: 'Hibrid', desc: 'Hər iki formatın birləşməsi', icon: MonitorPlay },
]

const TEACHING_OPTIONS: { value: TeachingMode; label: string; desc: string; icon: typeof Users }[] = [
  { value: 'group', label: TEACHING_LABEL.group, desc: TEACHING_DESC.group, icon: Users },
  { value: 'individual', label: TEACHING_LABEL.individual, desc: TEACHING_DESC.individual, icon: UserRound },
]

const EMPTY_CARD: CardInput = { number: '', holder: '', expiry: '', cvv: '' }

export default function Enrollment() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { data: course, isLoading } = useGetCourseQuery(courseId ?? '', { skip: !courseId })
  const { data: quiz, isLoading: quizLoading } = useGetQuizQuery(courseId ?? '', { skip: !courseId })
  const { data: users = [] } = useGetUsersQuery()
  const { data: courses = [] } = useGetCoursesQuery()

  const [createEnrollment] = useCreateEnrollmentMutation()
  const [updateEnrollment] = useUpdateEnrollmentMutation()
  const [processPayment, { isLoading: paying }] = useProcessPaymentMutation()

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [quizChecked, setQuizChecked] = useState(false)
  const [tier, setTier] = useState<PackageTier>('pro')
  const [mode, setMode] = useState<CourseMode | ''>('')
  const [teaching, setTeaching] = useState<TeachingMode>('group')
  const [campus, setCampus] = useState(CAMPUSES[0])
  const [slot, setSlot] = useState<ScheduleSlot | ''>('')
  const [days, setDays] = useState<number[]>([])
  const [startDate, setStartDate] = useState(todayISO(3))
  const [card, setCard] = useState<CardInput>(EMPTY_CARD)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [method, setMethod] = useState<'card' | 'installment'>('card')
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [result, setResult] = useState<Payment | null>(null)
  const [busy, setBusy] = useState(false)

  const activeMode: CourseMode = mode || course?.mode || 'online'
  const hasQuiz = Boolean(quiz && quiz.questions.length > 0)
  const amount = course ? packagePrice(course.basePrice, tier) : 0
  const teacher = users.find((u) => u.id === course?.teacherId)

  const correctCount = useMemo(
    () =>
      quiz ? quiz.questions.reduce((sum, q, i) => sum + (answers[i] === q.correctIndex ? 1 : 0), 0) : 0,
    [quiz, answers],
  )
  const quizScore = quiz && quiz.questions.length > 0 ? Math.round((correctCount / quiz.questions.length) * 100) : 100
  const quizPassed = !hasQuiz || quizScore >= (quiz?.passScore ?? 60)

  const previewDates = useMemo(() => nextLessonDates(startDate, days, 4), [startDate, days])
  const cardValidation = validateCard(card)
  const fieldError = (k: 'number' | 'holder' | 'expiry' | 'cvv') =>
    touched[k] ? cardValidation.errors[k] : undefined
  const fieldOk = (k: 'number' | 'holder' | 'expiry' | 'cvv') =>
    touched[k] && !cardValidation.errors[k] && Boolean(card[k]) ? 'Düzgün' : undefined

  /* Kurs dəyişdikdə əvvəlki seçimləri sıfırla */
  useEffect(() => {
    setStep(0)
    setAnswers({})
    setQuizChecked(false)
    setMode('')
    setSlot('')
    setDays([])
    setEnrollment(null)
    setResult(null)
  }, [courseId])

  /* ---------------- gates ---------------- */
  if (isLoading) return <Loader />
  if (!course) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-white">Kurs tapılmadı</h1>
        <p className="mt-3 text-sm text-slate-400">Axtardığınız kurs mövcud deyil və ya silinib.</p>
        <Link to="/kurslar" className="mt-6 inline-block">
          <Button leftIcon={<ArrowLeft className="h-4 w-4" />}>Kurslara qayıt</Button>
        </Link>
      </div>
    )
  }

  if (!user) {
    return (
      <Gate
        title="Qeydiyyat üçün daxil olun"
        message="Kursa qoşulmaq üçün tələbə hesabınızla daxil olmalısınız. Test hesablardan istifadə edə bilərsiniz."
        cta="Daxil ol"
        to="/giris"
      />
    )
  }

  if (user.role !== 'student') {
    return (
      <Gate
        title="Yalnız tələbə hesabları kursa qoşula bilər"
        message="Siz hazırda fərqli roldasınız. Tələbə hesabı ilə daxil olaraq qoşulma prosesini sınaya bilərsiniz."
        cta="Tələbə hesabı"
        to="/giris"
      />
    )
  }

  /* ---------------- actions ---------------- */
  function toggleDay(value: number) {
    setDays((prev) => (prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value].sort()))
  }

  function next() {
    if (step === 0) {
      if (hasQuiz && !quizChecked) {
        dispatch(pushToast({ type: 'warning', title: 'Testi tamamlayın', message: 'Əvvəlcə qəbul testini yoxlayın.' }))
        return
      }
      if (hasQuiz && !quizPassed) {
        dispatch(pushToast({ type: 'error', title: 'Test keçilmədi', message: 'Zəhmət olmasa yenidən cəhd edin.' }))
        return
      }
      setStep(1)
      return
    }
    if (step === 1) {
      setStep(2)
      return
    }
    if (step === 2) void goToPayment()
  }

  async function ensureEnrollment(): Promise<Enrollment | null> {
    if (!user || !course || !slot) return null
    const payload = {
      packageTier: tier,
      mode: activeMode,
      teaching,
      campus: activeMode === 'online' ? undefined : campus,
      slot,
      startDate,
      days,
      amount,
      quizScore,
    }
    try {
      if (enrollment) {
        const updated = await updateEnrollment({ id: enrollment.id, patch: payload }).unwrap()
        setEnrollment(updated)
        return updated
      }
      const created = await createEnrollment({
        studentId: user.id,
        courseId: course.id,
        ...payload,
      }).unwrap()
      setEnrollment(created)
      return created
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Qeydiyyat alınmadı', message: getErrMsg(e) }))
      return null
    }
  }

  async function goToPayment() {
    if (!slot) {
      dispatch(pushToast({ type: 'warning', title: 'Saat qrupu seçin', message: 'Dərs saatını seçməlisiniz.' }))
      return
    }
    if (days.length < 2) {
      dispatch(pushToast({ type: 'warning', title: 'Dərs günləri', message: 'Ən azı 2 dərs günü seçin.' }))
      return
    }
    setBusy(true)
    const en = await ensureEnrollment()
    setBusy(false)
    if (en) setStep(3)
  }

  async function pay() {
    setTouched({ number: true, holder: true, expiry: true, cvv: true })
    const v = validateCard(card)
    if (!v.ok) {
      dispatch(
        pushToast({
          type: 'error',
          title: 'Kart məlumatları yanlışdır',
          message: Object.values(v.errors)[0] ?? 'Zəhmət olmasa kartı yoxlayın.',
        }),
      )
      return
    }
    setBusy(true)
    const en = enrollment ?? (await ensureEnrollment())
    if (!en) {
      setBusy(false)
      return
    }
    try {
      const res = await processPayment({ enrollmentId: en.id, card, method }).unwrap()
      setBusy(false)
      if (res.ok) {
        setResult(res.payment)
        setStep(4)
        dispatch(pushToast({ type: 'success', title: 'Ödəniş uğurlu', message: res.message }))
      } else {
        dispatch(pushToast({ type: 'error', title: 'Ödəniş uğursuz', message: res.message }))
      }
    } catch (e) {
      setBusy(false)
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  function fillTestCard(number: string) {
    setCard({ number: formatCardNumber(number), holder: 'TEST KART', expiry: '12/29', cvv: '123' })
    setTouched({})
  }

  const loading = busy || paying

  return (
    <div className="relative">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <GradientBlobs />

      <div className="relative mx-auto w-full max-w-7xl px-5 py-10">
        {/* başlıq */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge tone="brand" icon={<ClipboardCheck className="h-3.5 w-3.5" />}>
              Kursa qoşulma
            </Badge>
            <h1 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">{course.title}</h1>
            <p className="mt-1 text-sm text-slate-400">
              Qəbul testi → paket → cədvəl → ödəniş. Addımları tamamlayaraq kursu aktivləşdirin.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-full sm:w-64">
              <Select
                label="Başqa kurs seç"
                value={course.id}
                onChange={(e) => navigate(`/kurslar/${e.target.value}/qeydiyyat`)}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </Select>
            </div>
            <Link to={`/kurslar/${course.id}`} className="sm:self-end sm:pb-0.5">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Kurs səhifəsi
              </Button>
            </Link>
          </div>
        </div>

        {/* stepper */}
        <Stepper step={step} onJump={(i) => i < step && setStep(i)} />

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* -------- ADDIM 0: QƏBUL TESTİ -------- */}
            {step === 0 && (
              <Panel className="animate-fade-in">
                {quizLoading ? (
                  <Loader label="Test yüklənir..." />
                ) : !hasQuiz ? (
                  <div className="py-6 text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
                    <h2 className="mt-3 text-lg font-bold text-white">Bu kurs üçün qəbul testi tələb olunmur</h2>
                    <p className="mt-2 text-sm text-slate-400">Növbəti addıma keçərək paketinizi seçə bilərsiniz.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                      <div>
                        <h2 className="text-lg font-bold text-white">Qəbul testi</h2>
                        <p className="mt-1 text-sm text-slate-400">
                          {quiz?.questions.length} sual · keçid balı {quiz?.passScore}
                        </p>
                      </div>
                      {quizChecked && (
                        <div className="flex items-center gap-3">
                          <Ring value={quizScore} label="bal" />
                          <div>
                            <p className={cn('text-sm font-bold', quizPassed ? 'text-emerald-400' : 'text-rose-400')}>
                              {quizPassed ? 'Test keçildi' : 'Test keçilmədi'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {correctCount} / {quiz?.questions.length} düzgün cavab
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 space-y-5">
                      {quiz?.questions.map((q, qi) => {
                        const chosen = answers[qi]
                        const isRight = qi < (quiz?.questions.length ?? 0) && chosen === q.correctIndex
                        return (
                          <div key={q.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-bold text-white">
                                {qi + 1}. {q.question}
                              </p>
                              <Badge tone="neutral">{q.topic}</Badge>
                            </div>
                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                              {q.options.map((opt, oi) => {
                                const selected = chosen === oi
                                const reveal = quizChecked
                                const okOpt = reveal && oi === q.correctIndex
                                const badOpt = reveal && selected && oi !== q.correctIndex
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    disabled={quizChecked}
                                    onClick={() => setAnswers((p) => ({ ...p, [qi]: oi }))}
                                    className={cn(
                                      'flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all',
                                      okOpt && 'border-emerald-400/40 bg-emerald-500/12 text-emerald-200',
                                      badOpt && 'border-rose-400/40 bg-rose-500/12 text-rose-200',
                                      !okOpt &&
                                        !badOpt &&
                                        (selected
                                          ? 'border-brand-400/50 bg-brand-500/12 text-white'
                                          : 'border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.06]'),
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        'grid h-6 w-6 shrink-0 place-items-center rounded-lg border text-[11px] font-bold',
                                        selected ? 'border-brand-400/50 bg-brand-500/25 text-white' : 'border-white/15 text-slate-400',
                                        okOpt && 'border-emerald-400/50 bg-emerald-500/25 text-white',
                                        badOpt && 'border-rose-400/50 bg-rose-500/25 text-white',
                                      )}
                                    >
                                      {okOpt ? <Check className="h-3.5 w-3.5" /> : String.fromCharCode(65 + oi)}
                                    </span>
                                    {opt}
                                  </button>
                                )
                              })}
                            </div>
                            {quizChecked && (
                              <p className={cn('mt-3 text-xs font-semibold', isRight ? 'text-emerald-400' : 'text-rose-400')}>
                                {isRight ? 'Düzgün cavab' : `Sizin cavabınız səhvdir · düzgün: ${q.options[q.correctIndex]}`}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      {!quizChecked ? (
                        <Button
                          leftIcon={<ClipboardCheck className="h-4 w-4" />}
                          disabled={Object.keys(answers).length < (quiz?.questions.length ?? 0)}
                          onClick={() => setQuizChecked(true)}
                        >
                          Testi yoxla
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          leftIcon={<RotateCcw className="h-4 w-4" />}
                          onClick={() => {
                            setAnswers({})
                            setQuizChecked(false)
                          }}
                        >
                          Yenidən cəhd et
                        </Button>
                      )}
                      {!quizChecked && (
                        <p className="text-xs text-slate-500">
                          Bütün suallara cavab verin ({Object.keys(answers).length}/{quiz?.questions.length})
                        </p>
                      )}
                    </div>
                  </>
                )}
              </Panel>
            )}

            {/* -------- ADDIM 1: PAKET -------- */}
            {step === 1 && (
              <div className="animate-fade-in space-y-5">
                <Panel>
                  <h2 className="text-lg font-bold text-white">Paket seçimi</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Ehtiyacınıza uyğun paketi seçin. Qiymət kursun baza qiymətinə görə hesablanır.
                  </p>
                </Panel>
                <div className="grid gap-5 md:grid-cols-3">
                  {PACKAGES.map((pkg) => {
                    const active = tier === pkg.tier
                    return (
                      <button
                        key={pkg.tier}
                        type="button"
                        onClick={() => setTier(pkg.tier)}
                        className={cn(
                          'card-3d relative flex flex-col text-left transition-all',
                          active
                            ? 'border-brand-400/50 shadow-glow ring-1 ring-brand-400/40'
                            : 'hover:-translate-y-1 hover:border-brand-400/30',
                        )}
                      >
                        {pkg.highlight && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-grad px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-glow">
                            Ən populyar
                          </span>
                        )}
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-extrabold text-white">{pkg.name}</h3>
                          {active && (
                            <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-grad text-white">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{pkg.tagline}</p>
                        <p className="mt-4 text-3xl font-extrabold text-white">
                          {formatAZN(packagePrice(course.basePrice, pkg.tier))}
                        </p>
                        <p className="text-xs text-slate-500">bütün kurs müddəti üçün</p>
                        <ul className="mt-4 space-y-2">
                          {pkg.features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* -------- ADDIM 2: CƏDVƏL -------- */}
            {step === 2 && (
              <div className="animate-fade-in space-y-5">
                <Panel>
                  <h2 className="text-lg font-bold text-white">Təhsil formatı</h2>
                  <p className="mt-1 text-sm text-slate-400">Dərslər onlayn, oflayn və ya hibrid ola bilər.</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {MODE_OPTIONS.map((m) => {
                      const Icon = m.icon
                      const active = activeMode === m.value
                      return (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setMode(m.value)}
                          className={cn(
                            'flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all',
                            active
                              ? 'border-brand-400/50 bg-brand-500/12 shadow-glow'
                              : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06]',
                          )}
                        >
                          <span
                            className={cn(
                              'grid h-10 w-10 place-items-center rounded-xl border border-white/10',
                              active ? 'bg-brand-500/20 text-brand-200' : 'bg-white/5 text-slate-300',
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="text-sm font-bold text-white">{m.label}</span>
                          <span className="text-xs text-slate-400">{m.desc}</span>
                        </button>
                      )
                    })}
                  </div>

                  {activeMode !== 'online' && (
                    <div className="mt-5">
                      <Select
                        label="Filial"
                        value={campus}
                        onChange={(e) => setCampus(e.target.value)}
                        hint="Oflayn dərslər seçilmiş filialda keçirilir."
                      >
                        {CAMPUSES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </Select>
                    </div>
                  )}
                </Panel>

                <Panel>
                  <h2 className="text-lg font-bold text-white">Tədris forması</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Qrupda birlikdə, yoxsa yalnız sizinlə fərdi tədris istədiyinizi seçin.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {TEACHING_OPTIONS.map((t) => {
                      const Icon = t.icon
                      const active = teaching === t.value
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setTeaching(t.value)}
                          className={cn(
                            'flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all',
                            active
                              ? 'border-brand-400/50 bg-brand-500/12 shadow-glow'
                              : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06]',
                          )}
                        >
                          <span
                            className={cn(
                              'grid h-10 w-10 place-items-center rounded-xl border border-white/10',
                              active ? 'bg-brand-500/20 text-brand-200' : 'bg-white/5 text-slate-300',
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="text-sm font-bold text-white">{t.label}</span>
                          <span className="text-xs text-slate-400">{t.desc}</span>
                        </button>
                      )
                    })}
                  </div>
                </Panel>

                <Panel>
                  <h2 className="text-lg font-bold text-white">Saat qrupu</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {(Object.keys(SLOT_LABEL) as ScheduleSlot[]).map((s) => {
                      const active = slot === s
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSlot(s)}
                          className={cn(
                            'rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all',
                            active
                              ? 'border-brand-400/50 bg-brand-500/12 text-white shadow-glow'
                              : 'border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.06]',
                          )}
                        >
                          {SLOT_LABEL[s]}
                        </button>
                      )
                    })}
                  </div>
                </Panel>

                <Panel>
                  <h2 className="text-lg font-bold text-white">Dərs günləri</h2>
                  <p className="mt-1 text-sm text-slate-400">Ən azı 2 gün seçin (həftədə {course.lessonsPerWeek} dərs).</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {WEEKDAYS.map((d) => {
                      const active = days.includes(d.value)
                      return (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => toggleDay(d.value)}
                          className={cn(
                            'rounded-xl border px-4 py-2 text-sm font-semibold transition-all',
                            active
                              ? 'border-brand-400/50 bg-brand-500/15 text-white shadow-glow'
                              : 'border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/[0.06]',
                          )}
                        >
                          {d.label}
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Başlama tarixi"
                      type="date"
                      value={startDate}
                      min={todayISO()}
                      onChange={(e) => setStartDate(e.target.value)}
                      hint="Kurs bu tarixdən başlayacaq."
                    />
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        İlk dərs tarixləri
                      </p>
                      {previewDates.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {previewDates.map((d) => (
                            <span
                              key={d}
                              className="rounded-lg border border-brand-400/25 bg-brand-500/10 px-2.5 py-1 text-xs font-semibold text-brand-200"
                            >
                              {formatDate(d)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-slate-500">Gün və tarix seçin.</p>
                      )}
                    </div>
                  </div>
                </Panel>
              </div>
            )}

            {/* -------- ADDIM 3: ÖDƏNİŞ -------- */}
            {step === 3 && (
              <div className="animate-fade-in space-y-5">
                <Panel>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-brand-grad-soft text-brand-200">
                        <Wallet className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="text-lg font-bold text-white">Bank kartı ilə ödəniş</h2>
                        <p className="text-xs text-slate-400">Test mühiti — real ödəniş aparılmır.</p>
                      </div>
                    </div>
                    <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
                      {(['card', 'installment'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMethod(m)}
                          className={cn(
                            'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                            method === m ? 'bg-brand-grad text-white shadow-glow' : 'text-slate-400 hover:text-white',
                          )}
                        >
                          {m === 'card' ? 'Tam ödəniş' : 'Hissə-hissə'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {method === 'installment' && (
                    <p className="mt-4 rounded-xl border border-accent-400/25 bg-accent-500/10 px-4 py-3 text-xs text-accent-200">
                      Hissə-hissə ödəniş: aylıq təxmini {formatAZN(Math.round(course.basePrice / 6))} (6 ay). Bu
                      yalnız simulyasiya kimi göstərilir.
                    </p>
                  )}

                  <div className="mt-5 space-y-4">
                    <Input
                      label="Kart nömrəsi"
                      inputMode="numeric"
                      placeholder="0000 0000 0000 0000"
                      value={card.number}
                      onChange={(e) => {
                        const v = e.target.value
                        setCard({
                          ...card,
                          number: /[^\d\s]/.test(v) ? v.slice(0, 19) : formatCardNumber(v),
                        })
                      }}
                      onBlur={() => setTouched((p) => ({ ...p, number: true }))}
                      error={fieldError('number')}
                      ok={fieldOk('number')}
                      hint={card.number ? `Aşkarlanan brend: ${cardBrand(card.number)}` : 'Yalnız rəqəm daxil edin.'}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Son istifadə tarixi"
                        inputMode="numeric"
                        placeholder="AA/İİ"
                        value={card.expiry}
                        onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                        onBlur={() => setTouched((p) => ({ ...p, expiry: true }))}
                        error={fieldError('expiry')}
                        ok={fieldOk('expiry')}
                      />
                      <Input
                        label="CVV"
                        inputMode="numeric"
                        type="password"
                        placeholder="•••"
                        value={card.cvv}
                        onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        onBlur={() => setTouched((p) => ({ ...p, cvv: true }))}
                        error={fieldError('cvv')}
                        ok={fieldOk('cvv')}
                      />
                    </div>

                    <Input
                      label="Kart sahibinin adı"
                      placeholder="AD SOYAD"
                      value={card.holder}
                      onChange={(e) => setCard({ ...card, holder: e.target.value })}
                      onBlur={() => setTouched((p) => ({ ...p, holder: true }))}
                      error={fieldError('holder')}
                      ok={fieldOk('holder')}
                      hint="Yalnız latın hərfləri (A–Z) ilə yazın."
                    />
                  </div>

                  <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-slate-400">
                    <Lock className="h-4 w-4 text-emerald-400" />
                    Məlumatlar yalnız brauzerinizdə saxlanılır. Kart heç bir real sistemə göndərilmir.
                  </div>
                </Panel>

                <Panel>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent-300" />
                    <h3 className="text-sm font-bold text-white">Test kartları (klikləyərək doldurun)</h3>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {TEST_CARDS.map((d) => (
                      <button
                        key={d.number}
                        type="button"
                        onClick={() => fillTestCard(d.number)}
                        className={cn(
                          'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:bg-white/[0.06]',
                          d.ok ? 'border-emerald-400/25 bg-emerald-500/[0.06]' : 'border-rose-400/25 bg-rose-500/[0.06]',
                        )}
                      >
                        <span>
                          <span className="block font-mono text-xs font-semibold text-white">{d.number}</span>
                          <span className={cn('text-[11px]', d.ok ? 'text-emerald-300' : 'text-rose-300')}>{d.label}</span>
                        </span>
                        <Badge tone={d.ok ? 'success' : 'danger'}>{d.ok ? 'Uğurlu' : 'Uğursuz'}</Badge>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-500/[0.07] px-4 py-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <p className="text-xs text-amber-200">
                      Test qaydaları: düzgün (fake) kartlar → uğurlu təsdiq. Kart sahibi adında{' '}
                      <strong>hərf xətası</strong> və ya <strong>Azərbaycan əlifbası hərfləri</strong> (ə, ı, ö, ü, ç, ş,
                      ğ) yazdıqda ödəniş uğursuz göstərilir.
                    </p>
                  </div>
                </Panel>
              </div>
            )}

            {/* -------- ADDIM 4: UĞUR -------- */}
            {step === 4 && result && (
              <Panel className="animate-scale-in text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </span>
                <h2 className="mt-4 text-2xl font-extrabold text-white">Ödəniş uğurla tamamlandı!</h2>
                <p className="mt-2 text-sm text-slate-400">
                  {course.title} kursuna qeydiyyatınız aktivləşdirildi. Dərslər şəxsi kabinetinizdə görünür.
                </p>

                <div className="mx-auto mt-6 grid max-w-lg gap-2 text-left">
                  {[
                    ['Kurs', course.title],
                    ['Paket', `${PACKAGES.find((p) => p.tier === tier)?.name} — ${formatAZN(amount)}`],
                    ['Format', MODE_LABEL[activeMode]],
                    ['Tədris', TEACHING_LABEL[teaching]],
                    ['Saat qrupu', slot ? SLOT_LABEL[slot] : '—'],
                    ['Dərs günləri', days.map((d) => WEEKDAYS.find((w) => w.value === d)?.short).join(' · ')],
                    ['Başlama', formatDate(startDate)],
                    ['Ödəniş', `${result.brand} •••• ${result.cardLast4}`],
                    ['Qəbz nömrəsi', result.invoiceNo],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5"
                    >
                      <span className="text-xs text-slate-500">{k}</span>
                      <span className="text-sm font-semibold text-white">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <Link to="/panel/telebe/kurslar">
                    <Button leftIcon={<Layers className="h-4 w-4" />}>Kurslarıma keç</Button>
                  </Link>
                  <Link to="/kurslar">
                    <Button variant="secondary">Digər kurslara bax</Button>
                  </Link>
                </div>
              </Panel>
            )}

            {/* naviqasiya */}
            {step < 4 && (
              <div className="mt-6 flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  Geri
                </Button>
                {step < 3 ? (
                  <Button
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    loading={busy}
                    disabled={step === 0 && hasQuiz && quizChecked && !quizPassed}
                    onClick={next}
                  >
                    {step === 2 ? 'Ödənişə keç' : 'Növbəti'}
                  </Button>
                ) : (
                  <Button
                    leftIcon={<Lock className="h-4 w-4" />}
                    loading={loading}
                    onClick={pay}
                  >
                    {formatAZN(amount)} ödə
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* -------- XÜLASƏ -------- */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-5">
              <Panel className="overflow-hidden p-0">
                <div className="p-4">
                  <CoverImage prompt={course.coverPrompt} title={course.title} tech={course.tech} />
                </div>
                <div className="px-5 pb-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="brand">{course.category}</Badge>
                    <Badge tone="neutral">{MODE_LABEL[course.mode]}</Badge>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-white">{course.title}</h3>
                  {teacher && (
                    <div className="mt-3 flex items-center gap-2">
                      <Avatar name={teacher.fullName} gradient={teacher.avatar} size={28} />
                      <span className="text-xs text-slate-400">{teacher.fullName}</span>
                    </div>
                  )}
                </div>
              </Panel>

              <Panel>
                <h4 className="text-sm font-bold uppercase tracking-wide text-slate-400">Sifariş xülasəsi</h4>
                <div className="mt-4 space-y-2.5 text-sm">
                  <Row label="Paket" value={PACKAGES.find((p) => p.tier === tier)?.name ?? '—'} />
                  <Row label="Format" value={MODE_LABEL[activeMode]} />
                  <Row label="Tədris" value={TEACHING_LABEL[teaching]} />
                  {activeMode !== 'online' && <Row label="Filial" value={campus} />}
                  <Row label="Saat" value={slot ? SLOT_LABEL[slot] : '—'} />
                  <Row
                    label="Günlər"
                    value={days.length ? days.map((d) => WEEKDAYS.find((w) => w.value === d)?.short).join(' · ') : '—'}
                  />
                  <Row label="Başlama" value={formatDate(startDate)} />
                  <Row label="Qəbul balı" value={`${quizScore}`} />
                </div>
                <div className="divider my-4" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Ümumi məbləğ</span>
                  <span className="text-xl font-extrabold text-white">{formatAZN(amount)}</span>
                </div>
                {course.oldPrice && (
                  <p className="mt-1 text-right text-xs text-slate-500 line-through">{formatAZN(course.oldPrice)}</p>
                )}
                <div className="mt-4">
                  <Progress value={(step / 4) * 100} showLabel />
                  <p className="mt-2 text-center text-xs text-slate-500">Addım {Math.min(step + 1, 4)} / 4</p>
                </div>
              </Panel>

              <div className="flex items-start gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] p-4">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <p className="text-xs text-emerald-200">
                  Test mühiti: heç bir real ödəniş yoxdur, bütün məlumatlar brauzerinizin lokal yaddaşında saxlanılır.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[60%] truncate text-right font-semibold text-white">{value}</span>
    </div>
  )
}

function Stepper({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {STEPS.map((s, i) => {
        const Icon = s.icon
        const done = i < step
        const active = i === step
        return (
          <div key={s.key} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onJump(i)}
              disabled={i >= step}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all',
                active && 'border-brand-400/50 bg-brand-500/15 text-white shadow-glow',
                done && 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
                !active && !done && 'border-white/10 bg-white/[0.03] text-slate-500',
              )}
            >
              <span
                className={cn(
                  'grid h-5 w-5 place-items-center rounded-full text-[10px]',
                  done ? 'bg-emerald-500/25' : active ? 'bg-brand-500/25' : 'bg-white/10',
                )}
              >
                {done ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <span className="h-px w-4 bg-white/15 sm:w-8" />}
          </div>
        )
      })}
    </div>
  )
}

function Gate({ title, message, cta, to }: { title: string; message: string; cta: string; to: string }) {
  return (
    <div className="relative min-h-[70vh]">
      <GradientBlobs />
      <div className="relative mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center px-5 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-brand-grad-soft text-brand-200 shadow-glow">
          <Lock className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-white">{title}</h1>
        <p className="mt-3 text-sm text-slate-400">{message}</p>
        <Link to={to} className="mt-6">
          <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
            {cta}
          </Button>
        </Link>
        <p className="mt-6 font-mono text-xs text-slate-500">student@codevia.az / student123</p>
      </div>
    </div>
  )
}
