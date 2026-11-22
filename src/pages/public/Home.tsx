import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  CalendarCheck,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  GraduationCap,
  Layers,
  Laptop,
  MapPin,
  MonitorPlay,
  Quote,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import { useGetCoursesQuery, useGetUsersQuery } from '../../features/api/apiSlice'
import { CATEGORIES, SAMPLE_ACCOUNTS } from '../../data/seed'
import {
  cn,
  formatAZN,
  generatedImage,
  LEVEL_LABEL,
  ROLE_LABEL,
  SLOT_LABEL,
} from '../../lib/utils'
import { Avatar, Badge, Button, Loader, Panel, Rating, SectionTitle } from '../../components/ui'
import { CourseCard } from '../../components/common/CourseCard'
import { GradientBlobs, StatCard } from '../../components/common'

const TECH_STACK = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Docker', 'Kubernetes',
  'PostgreSQL', 'Figma', 'Playwright', 'Next.js', 'Kali Linux', 'Pandas',
]

const FEATURES = [
  {
    icon: MonitorPlay,
    title: 'Canlı və video dərslər',
    text: 'Hər dərs YouTube üzərində peşəkar video kimi arxivlənir — istənilən vaxt təkrar baxa bilərsiniz.',
    tone: 'brand',
  },
  {
    icon: Layers,
    title: 'Strukturlaşdırılmış silabus',
    text: 'Hər kurs modul və dərslərə bölünüb. Tələbə irəliləyişi real vaxtda izlənilir.',
    tone: 'accent',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Real layihə təcrübəsi',
    text: 'Kurs boyu 3–5 real layihə qurulur, nəticə portfolio və GitHub profilinə əlavə olunur.',
    tone: 'neon',
  },
  {
    icon: CalendarCheck,
    title: 'Çevik cədvəl',
    text: 'Səhər, günorta, axşam və həftəsonu qrupları. İşləyənlər üçün axşam və həftəsonu formatı.',
    tone: 'emerald',
  },
  {
    icon: ShieldCheck,
    title: 'Mentor dəstəyi',
    text: 'Hər tələbəyə mentor təyin olunur. Suallar 24 saat ərzində cavablandırılır.',
    tone: 'amber',
  },
  {
    icon: Award,
    title: 'Sertifikat və işə düzəlmə',
    text: 'Kursu bitirənlər rəsmi sertifikat alır. Elite paketdə internship və işə yerləşdirmə var.',
    tone: 'rose',
  },
] as const

const STEPS = [
  { icon: ClipboardCheck, title: 'Qəbul testi', text: 'Səviyyənizi müəyyən edən qısa qiymətləndirmə testi keçin.' },
  { icon: Layers, title: 'Paket seçimi', text: 'Start, Pro və ya Elite — ehtiyacınıza uyğun paketi seçin.' },
  { icon: CalendarCheck, title: 'Cədvəl qurulumu', text: 'Rejimi (onlayn/oflayn), günləri, saatı və başlama tarixini seçin.' },
  { icon: CreditCard, title: 'Ödəniş & başlanğıc', text: 'Bank kartı ilə təhlükəsiz ödəniş edin və dərhal portalda dərslərə başlayın.' },
]

const TESTIMONIALS = [
  {
    name: 'Fərid Babayev',
    role: 'QA Engineer @ Bank',
    text: 'Kursdan sonra 2 ay ərzində test avtomatlaşdırma üzrə işə düzəldim. Praktik tapşırıqlar müsahibədə çox kömək etdi.',
    rating: 5,
  },
  {
    name: 'Ayan Hacıyeva',
    role: 'Data Analyst @ Retail',
    text: 'Silabus çox aydın qurulmuşdu. Hər modulun sonunda real layihə olması bilikləri möhkəmləndirdi.',
    rating: 5,
  },
  {
    name: 'Murad Əhmədov',
    role: 'Backend Developer @ Startup',
    text: 'Müəllimlər hər suala sürətli cavab verirdi. Node.js və PostgreSQL təcrübəsi karyeramı dəyişdi.',
    rating: 4,
  },
]

const FAQ = [
  {
    q: 'Kurslara qoşulmaq üçün nə lazımdır?',
    a: 'Kurs səhifəsindən «Qoşul» düyməsini basın. İlk addımda qəbul testi (qiymətləndirmə) keçirsiniz, sonra paket, cədvəl və rejim seçir, bank kartı ilə ödəniş edirsiniz. Ödəniş təsdiqləndikdən sonra kurs dərhal şəxsi kabinetdə görünür.',
  },
  {
    q: 'Onlayn və oflayn dərslər arasında fərq nədir?',
    a: 'Onlayn qruplarda dərslər canlı yayımlanır və arxiv kimi saxlanılır. Oflayn dərslər Bakı, Sumqayıt və Gəncə filiallarında üzbəüz keçirilir. Hibrid formatda hər iki imkandan istifadə edə bilərsiniz.',
  },
  {
    q: 'Dərs cədvəlini dəyişə bilərəm?',
    a: 'Bəli. Şəxsi kabinetdəki «Dərs cədvəlim» bölməsində dərs günlərini və saat qrupunu görürsünüz. Dəyişiklik üçün mentorla əlaqə saxlamaq kifayətdir.',
  },
  {
    q: 'Ödənişi hissə-hissə etmək mümkündür?',
    a: 'Bəli, Pro və Elite paketlər üçün ödənişi hissə-hissə (installment) seçmək olar. Ödəniş prosesi tamamilə simulyasiya mühitində icra olunur.',
  },
  {
    q: 'Kursu bitirdikdən sonra sertifikat verilir?',
    a: 'Bütün dərsləri tamamlayan tələbələrə CodeVia Academy-nin rəsmi sertifikatı verilir. Sertifikat şəxsi kabinetdən yüklənə bilər.',
  },
]

function Hero() {
  const { data: courses = [] } = useGetCoursesQuery()
  const popular = courses.filter((c) => c.popular).slice(0, 3)

  return (
    <section className="relative overflow-hidden pb-20 pt-14 sm:pt-20">
      <div className="absolute inset-0 grid-bg" />
      <GradientBlobs />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-5 lg:grid-cols-2">
        <div className="animate-fade-up">
          <Badge tone="brand" icon={<Sparkles className="h-3.5 w-3.5" />}>
            Azərbaycanda praktikaya əsaslanan IT təhsili
          </Badge>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            IT peşəsini <span className="gradient-text">CodeVia Academy</span> ilə sıfırdan öyrən
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Frontend, Backend, Data, Kibertəhlükəsizlik, Dizayn və DevOps üzrə 10+ peşəkar kurs.
            Onlayn və ya oflayn formatda, real layihələrlə, mentor dəstəyi ilə. Qəbul testi keçin,
            paketinizi seçin və dərhal başlayın.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/kurslar">
              <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Kurslara bax
              </Button>
            </Link>
            <Link to="/giris">
              <Button size="lg" variant="secondary" leftIcon={<Search className="h-4 w-4" />}>
                Test hesabla giriş
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid max-w-lg grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Kurs', value: `${courses.length}+` },
              { label: 'Məzun', value: '2 400+' },
              { label: 'Reytinq', value: '4.8' },
              { label: 'İşə düzəlmə', value: '92%' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative perspective">
          <div className="relative mx-auto max-w-md">
            <div className="absolute -inset-6 rounded-[36px] bg-brand-grad opacity-20 blur-3xl" />
            <div className="relative animate-float rounded-[28px] border border-white/10 bg-ink-800/80 p-4 shadow-glow backdrop-blur-xl">
              <div className="flex items-center gap-2 pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-2 font-mono text-[10px] text-slate-500">codevia.academy/panel</span>
              </div>
              <img
                src={generatedImage(
                  'dark modern lms dashboard user interface with course cards, progress rings, code editor panel, glowing indigo cyan accents, clean ui design, high detail',
                  'landscape_4_3',
                )}
                alt="CodeVia Academy idarə paneli"
                className="w-full rounded-xl border border-white/10 object-cover"
              />
            </div>

            <div className="absolute -left-6 bottom-16 hidden w-52 animate-float-slow rounded-2xl border border-white/10 bg-ink-800/90 p-3 shadow-card backdrop-blur-xl sm:block">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Qəbul testi</p>
              <p className="mt-1 text-xl font-extrabold text-white">83 / 100</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[83%] rounded-full bg-brand-grad" />
              </div>
              <p className="mt-2 text-[10px] text-emerald-400">Pro paket tövsiyə olunur</p>
            </div>

            <div className="animate-delay-300 absolute -right-4 top-10 hidden w-44 animate-float rounded-2xl border border-white/10 bg-ink-800/90 p-3 shadow-card backdrop-blur-xl sm:block">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Növbəti dərs</p>
              <p className="mt-1 text-xs font-bold text-white">Axşam · 18:00</p>
              <p className="mt-0.5 text-[10px] text-slate-400">B.e · Ç · C</p>
            </div>
          </div>

          {popular.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {popular.map((c) => (
                <span
                  key={c.id}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-slate-300"
                >
                  {c.title.split(':')[0]}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function TechMarquee() {
  const row = [...TECH_STACK, ...TECH_STACK]
  return (
    <section className="relative border-y border-white/10 bg-ink-900/50 py-5">
      <div className="flex overflow-hidden">
        <div className="flex min-w-full shrink-0 animate-marquee items-center gap-3">
          {row.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="whitespace-nowrap rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-xs font-semibold text-slate-400"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function SampleAccounts() {
  const toneMap: Record<string, 'accent' | 'brand' | 'neon'> = {
    student: 'accent',
    teacher: 'brand',
    admin: 'neon',
  }
  return (
    <section className="relative mx-auto w-full max-w-7xl px-5 py-20">
      <SectionTitle
        icon={<ShieldCheck className="h-5 w-5" />}
        title="Test giriş məlumatları"
        subtitle="Sistemi sınamaq üçün hazır hesablar — e-poçt və şifrəni kopyalayaraq daxil olun"
      />
      <div className="grid gap-5 md:grid-cols-3">
        {SAMPLE_ACCOUNTS.map((acc, i) => (
          <div
            key={acc.role}
            className={cn('card-3d animate-fade-up', i === 1 && 'animate-delay-100', i === 2 && 'animate-delay-200')}
          >
            <div className="flex items-center justify-between">
              <Badge tone={toneMap[acc.role]}>{acc.label}</Badge>
              <Avatar name={acc.name} size={40} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">{acc.name}</h3>
            <p className="mt-1 text-sm text-slate-400">{acc.description}</p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2">
                <span className="text-xs text-slate-500">E-poçt</span>
                <span className="font-mono text-xs font-semibold text-white">{acc.email}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2">
                <span className="text-xs text-slate-500">Şifrə</span>
                <span className="font-mono text-xs font-semibold text-accent-300">{acc.password}</span>
              </div>
            </div>

            <Link to="/giris" className="mt-4 block">
              <Button full variant="secondary" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Bu hesabla daxil ol
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="space-y-3">
      {FAQ.map((item, i) => (
        <div key={item.q} className="panel overflow-hidden p-0">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
          >
            <span className="text-sm font-bold text-white">{item.q}</span>
            <ChevronDown
              className={cn('h-4 w-4 shrink-0 text-brand-300 transition-transform', open === i && 'rotate-180')}
            />
          </button>
          {open === i && (
            <p className="animate-fade-in border-t border-white/10 px-5 py-4 text-sm leading-relaxed text-slate-400">
              {item.a}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const { data: courses = [], isLoading } = useGetCoursesQuery()
  const { data: users = [] } = useGetUsersQuery()

  const teachers = users.filter((u) => u.role === 'teacher')
  const teacherName = (id: string) => users.find((u) => u.id === id)?.fullName ?? '—'
  const popular = [...courses].sort((a, b) => b.studentCount - a.studentCount).slice(0, 6)

  return (
    <div>
      <Hero />
      <TechMarquee />

      {/* ---------------- Niyə CodeVia ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-5 py-20">
        <SectionTitle
          icon={<Rocket className="h-5 w-5" />}
          title="Niyə CodeVia Academy?"
          subtitle="Nəzəriyyə deyil — işə yarayan praktik bacarıqlar"
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className={cn('card-3d animate-fade-up', i % 3 === 1 && 'animate-delay-100', i % 3 === 2 && 'animate-delay-200')}
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-brand-grad-soft text-brand-200">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.text}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ---------------- Populyar kurslar ---------------- */}
      <section className="relative mx-auto w-full max-w-7xl px-5 py-14">
        <SectionTitle
          icon={<BookOpen className="h-5 w-5" />}
          title="Populyar kurslar"
          subtitle="Ən çox seçilən proqramlar"
          action={
            <Link to="/kurslar">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Hamısına bax
              </Button>
            </Link>
          }
        />
        {isLoading ? (
          <Loader />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {popular.map((c, i) => (
              <div key={c.id} className={cn('animate-fade-up', i % 3 === 1 && 'animate-delay-100', i % 3 === 2 && 'animate-delay-200')}>
                <CourseCard course={c} teacherName={teacherName(c.teacherId)} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---------------- Kateqoriyalar ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-5 py-14">
        <SectionTitle
          icon={<Layers className="h-5 w-5" />}
          title="İstiqamətlər"
          subtitle="Karyera hədəfinizə uyğun sahəni seçin"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((cat) => {
            const count = courses.filter((c) => c.category === cat.name).length
            return (
              <Link
                key={cat.name}
                to={`/kurslar?category=${encodeURIComponent(cat.name)}`}
                className="panel panel-hover group flex flex-col items-start gap-2 p-5"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-brand-grad-soft text-brand-200 transition-transform group-hover:scale-110">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <span className="text-sm font-bold text-white">{cat.name}</span>
                <span className="text-xs text-slate-500">{count} kurs</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ---------------- Necə qoşulmaq olar ---------------- */}
      <section className="relative overflow-hidden border-y border-white/10 bg-ink-900/40 py-20">
        <GradientBlobs />
        <div className="relative mx-auto w-full max-w-7xl px-5">
          <SectionTitle
            icon={<ClipboardCheck className="h-5 w-5" />}
            title="Kursa qoşulma necə baş verir?"
            subtitle="4 sadə addım — qəbul testindən ödənişə qədər"
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={s.title} className="relative">
                  <div className="card-3d h-full">
                    <div className="flex items-center justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-brand-grad-soft text-brand-200">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-mono text-3xl font-extrabold text-white/10">0{i + 1}</span>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-white">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.text}</p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <ArrowRight className="absolute -right-4 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-brand-400/50 lg:block" />
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Laptop, title: 'Onlayn', text: 'Canlı yayım + video arxiv, ölkənin hər yerindən' },
              { icon: MapPin, title: 'Oflayn', text: 'Bakı, Sumqayıt və Gəncə filiallarında üzbəüz dərslər' },
              { icon: MonitorPlay, title: 'Hibrid', text: 'Hər iki formatı birləşdirən ən çevik seçim' },
            ].map((f) => {
              const Icon = f.icon
              return (
                <Panel key={f.title} hover className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-accent-500/15 text-accent-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{f.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{f.text}</p>
                  </div>
                </Panel>
              )
            })}
          </div>
        </div>
      </section>

      <SampleAccounts />

      {/* ---------------- Müəllimlər ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-5 py-14">
        <SectionTitle
          icon={<Users className="h-5 w-5" />}
          title="Müəllim heyəti"
          subtitle="Sənayedə çalışan praktik mütəxəssislər"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {teachers.slice(0, 4).map((t, i) => (
            <div key={t.id} className={cn('card-3d text-center animate-fade-up', i % 4 === 1 && 'animate-delay-100', i % 4 === 2 && 'animate-delay-200', i % 4 === 3 && 'animate-delay-300')}>
              <div className="flex justify-center">
                <Avatar name={t.fullName} gradient={t.avatar} size={72} ring />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">{t.fullName}</h3>
              <p className="mt-1 text-xs font-semibold text-brand-300">{t.specialization}</p>
              <p className="mt-2 line-clamp-2 text-xs text-slate-400">{t.bio}</p>
              <div className="mt-3 flex items-center justify-center gap-3">
                <Rating value={t.rating ?? 4.8} />
                <Badge tone="neutral">{t.experienceYears} il</Badge>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Rəylər ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-5 py-14">
        <SectionTitle
          icon={<Star className="h-5 w-5" />}
          title="Məzunlarımız nə deyir?"
          subtitle="2 400-dən çox məzunun real rəyləri"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className={cn('card-3d animate-fade-up', i === 1 && 'animate-delay-100', i === 2 && 'animate-delay-200')}>
              <Quote className="h-7 w-7 text-brand-400/60" />
              <p className="mt-4 text-sm leading-relaxed text-slate-300">{t.text}</p>
              <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                <Avatar name={t.name} size={40} />
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
                <span className="ml-auto">
                  <Rating value={t.rating} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Statistika ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-5 py-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Aktiv kurs" value={courses.length} icon={<BookOpen className="h-5 w-5" />} tone="brand" trend={12} />
          <StatCard label="Qeydiyyatlı tələbə" value={courses.reduce((s, c) => s + c.studentCount, 0)} icon={<Users className="h-5 w-5" />} tone="accent" trend={8} />
          <StatCard label="Orta kurs qiyməti" value={formatAZN(courses.length ? courses.reduce((s, c) => s + c.basePrice, 0) / courses.length : 0)} icon={<CreditCard className="h-5 w-5" />} tone="neon" hint="Paket seçiminə görə dəyişir" />
          <StatCard label="Müəllim" value={teachers.length} icon={<BadgeCheck className="h-5 w-5" />} tone="emerald" hint="Hamısı sənaye təcrübəli" />
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="mx-auto w-full max-w-4xl px-5 py-16">
        <SectionTitle icon={<Sparkles className="h-5 w-5" />} title="Tez-tez verilən suallar" />
        <Faq />
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-5 pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-grad-soft p-10 text-center shadow-glow">
          <div className="absolute inset-0 grid-bg" />
          <div className="relative">
            <h2 className="text-2xl font-extrabold text-white sm:text-4xl">
              Bu gün başla, <span className="gradient-text">6 ay sonra peşəkar ol</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
              Qəbul testindən keç, səviyyənə uyğun paketi seç və dərslərə dərhal qoşul. Bütün prosesi
              canlı olaraq sınaqdan keçirə bilərsən.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link to="/kurslar">
                <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Kurs seç və qoşul
                </Button>
              </Link>
              <Link to="/haqqimizda">
                <Button size="lg" variant="glass">
                  Akademiya haqqında
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-slate-400">
              Test rejimi: real bank ödənişi yoxdur · Bütün məlumatlar yalnız brauzerinizdə saxlanılır
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 pb-4">
        <p className="text-center text-xs text-slate-600">
          Test giriş: {SAMPLE_ACCOUNTS.map((a) => `${ROLE_LABEL[a.role]} → ${a.email} / ${a.password}`).join(' · ')}
          {' · '}
          Nümunə cədvəl: {SLOT_LABEL.axsam} · Səviyyələr: {LEVEL_LABEL.baslangic}, {LEVEL_LABEL.orta}, {LEVEL_LABEL.pesekar}
        </p>
      </div>
    </div>
  )
}
