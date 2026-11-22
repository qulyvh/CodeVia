import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Award,
  BookOpen,
  Compass,
  GraduationCap,
  HeartHandshake,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useGetUsersQuery } from '../../features/api/apiSlice'
import { CAMPUSES, cn, generatedImage } from '../../lib/utils'
import { Avatar, Badge, Button, Panel, SectionTitle } from '../../components/ui'
import { GradientBlobs, StatCard } from '../../components/common'

type Tone = 'brand' | 'accent' | 'neon' | 'emerald' | 'amber' | 'rose'

const STATS: { label: string; value: string; icon: LucideIcon; tone: Tone }[] = [
  { label: 'Məzun', value: '2 400+', icon: GraduationCap, tone: 'brand' },
  { label: 'Aktiv kurs', value: '10+', icon: BookOpen, tone: 'accent' },
  { label: 'Müəllim', value: '8', icon: Users, tone: 'neon' },
  { label: 'Filial', value: '4', icon: MapPin, tone: 'emerald' },
]

const MISSION_POINTS = [
  'Nəzəriyyədən çox praktik bacarıqlara fokuslanırıq',
  'Müəllim heyəti sənayedə fəaliyyət göstərən mütəxəssislərdir',
  'Hər tələbəyə fərdi mentor və karyera dəstəyi veririk',
]

const ACHIEVEMENTS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: '2019', label: 'Təsis ili', icon: Rocket },
  { value: '2 400+', label: 'Yetişdirdiyimiz məzun', icon: GraduationCap },
  { value: '92%', label: 'İşə düzəlmə nisbəti', icon: TrendingUp },
  { value: '4.8', label: 'Orta məmnunluq reytinqi', icon: HeartHandshake },
]

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Rocket,
    title: 'Praktikaya fokus',
    text: 'Hər modulun sonunda real layihə qurulur — biliyi dərhal tətbiq edirsiniz.',
  },
  {
    icon: Compass,
    title: 'Aydın yol xəritəsi',
    text: 'Sıfırdan peşəkara qədər addım-addım strukturlaşdırılmış silabus.',
  },
  {
    icon: ShieldCheck,
    title: 'Mentor dəstəyi',
    text: 'Suallarınız 24 saat ərzində cavablandırılır, hər tələbəyə mentor təyin olunur.',
  },
  {
    icon: Users,
    title: 'Kiçik qruplar',
    text: 'Pro paketdə 6 nəfərə qədər kiçik qruplar — daha çox fərdi diqqət.',
  },
  {
    icon: Award,
    title: 'Rəsmi sertifikat',
    text: 'Kursu bitirənlərə CodeVia Academy-nin rəsmi sertifikatı verilir.',
  },
  {
    icon: BookOpen,
    title: 'Zəngin material',
    text: 'Video dərslər, PDF qeydlər və kod nümunələri ömürlük əlçatandır.',
  },
]

const APPROACH = [
  { step: '01', title: 'Öyrən', text: 'Canlı və video dərslərlə nəzəri əsasları mənimsəyirsiniz.' },
  { step: '02', title: 'Tətbiq et', text: 'Hər dərsdən sonra praktik tapşırıq və layihə üzərində işləyirsiniz.' },
  { step: '03', title: 'Mentorla yoxla', text: 'Mentor kodunuzu nəzərdən keçirir və fərdi geribildirim verir.' },
  { step: '04', title: 'Nəticəni gör', text: 'Portfolio, sertifikat və müsahibə hazırlığı ilə karyeraya çıxırsınız.' },
]

const TIMELINE = [
  { year: '2019', title: 'CodeVia Academy təsis edildi', text: 'Kiçik bir sinifdə ilk qrupumuzla yola düşdük.' },
  { year: '2021', title: 'İlk oflayn filial — Bakı, Nizami', text: 'Üzbəüz dərslər üçün müasir filial açıldı.' },
  { year: '2023', title: 'Onlayn platforma işə salındı', text: 'Ölkənin hər yerindən canlı dərslərə qoşulma imkanı.' },
  { year: '2025', title: 'Sumqayıt və Gəncə filialları', text: 'Şəbəkə genişləndi, 2 400-dən çox məzun yetişdi.' },
]

export default function About() {
  const { data: users = [] } = useGetUsersQuery()
  const mentors = users.filter((u) => u.role === 'teacher').slice(0, 6)

  return (
    <div className="relative">
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden pb-16 pt-14 sm:pt-20">
        <div className="absolute inset-0 grid-bg" />
        <GradientBlobs />
        <div className="relative mx-auto w-full max-w-7xl px-5">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-up">
              <Badge tone="brand" icon={<Sparkles className="h-3.5 w-3.5" />}>
                2019-cu ildən bəri
              </Badge>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
                CodeVia Academy <span className="gradient-text">haqqında</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
                Biz nəzəriyyə deyil, işə yarayan praktik bacarıqlar öyrədirik. Missiyamız Azərbaycanda
                keyfiyyətli IT təhsilini hamı üçün əlçatan etmək və gəncləri beynəlxalq səviyyəli
                mütəxəssislərə çevirməkdir.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/kurslar">
                  <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Kurslara bax
                  </Button>
                </Link>
                <Link to="/elaqe">
                  <Button size="lg" variant="secondary">
                    Bizimlə əlaqə
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative animate-fade-up animate-delay-100">
              <div className="absolute -inset-6 rounded-[36px] bg-brand-grad opacity-15 blur-3xl" />
              <img
                src={generatedImage(
                  'modern coding bootcamp classroom with students at laptops, glowing screens, dark tech ambience, indigo and cyan accents, cinematic lighting',
                  'landscape_16_9',
                )}
                alt="CodeVia Academy dərs mühiti"
                className="relative w-full rounded-3xl border border-white/10 object-cover shadow-glow"
              />
            </div>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} icon={<s.icon className="h-5 w-5" />} tone={s.tone} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Missiyamız ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-5 py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge tone="accent" icon={<Target className="h-3.5 w-3.5" />}>
              Missiyamız
            </Badge>
            <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
              Hər tələbəni işə hazır <span className="gradient-text">peşəkar</span> kimi yetişdirmək
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
              Təhsil modelimiz sənayenin real tələbləri üzərində qurulub. Dərslər praktik tapşırıqlar,
              layihələr və mentor geribildirimi ilə davam edir — beləliklə biliyi dərhal bacarığa
              çevirirsiniz.
            </p>
            <ul className="mt-6 space-y-3">
              {MISSION_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-slate-300">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[36px] bg-brand-grad opacity-15 blur-3xl" />
            <img
              src={generatedImage(
                'team of diverse IT instructors collaborating at a modern office, coding on screens, dark navy background, glowing indigo cyan accents, professional photography',
                'landscape_16_9',
              )}
              alt="CodeVia Academy müəllim komandası"
              className="relative w-full rounded-3xl border border-white/10 object-cover shadow-glow"
            />
          </div>
        </div>
      </section>

      {/* ---------------- Rəqəmlər / nailiyyətlər ---------------- */}
      <section className="relative overflow-hidden border-y border-white/10 bg-ink-900/40 py-16">
        <GradientBlobs />
        <div className="relative mx-auto w-full max-w-7xl px-5">
          <SectionTitle
            icon={<TrendingUp className="h-5 w-5" />}
            title="Rəqəmlərlə CodeVia"
            subtitle="İllər ərzində topladığımız nəticələr"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ACHIEVEMENTS.map((a, i) => (
              <div
                key={a.label}
                className={cn('card-3d animate-fade-up text-center', i % 4 === 1 && 'animate-delay-100', i % 4 === 2 && 'animate-delay-200', i % 4 === 3 && 'animate-delay-300')}
              >
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-brand-grad-soft text-brand-200">
                  <a.icon className="h-6 w-6" />
                </span>
                <p className="mt-4 text-3xl font-extrabold text-white">{a.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{a.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Nə üçün biz? ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-5 py-16">
        <SectionTitle
          icon={<Rocket className="h-5 w-5" />}
          title="Nə üçün biz?"
          subtitle="Bizi fərqləndirən əsas prinsiplər"
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={cn('card-3d animate-fade-up', i % 3 === 1 && 'animate-delay-100', i % 3 === 2 && 'animate-delay-200')}
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-brand-grad-soft text-brand-200">
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-base font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Öyrənmə yanaşması ---------------- */}
      <section className="relative overflow-hidden border-y border-white/10 bg-ink-900/40 py-16">
        <div className="relative mx-auto w-full max-w-7xl px-5">
          <SectionTitle
            icon={<Compass className="h-5 w-5" />}
            title="Öyrənmə yanaşmamız"
            subtitle="4 addımlı davamlı inkişaf dövrü"
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {APPROACH.map((a) => (
              <div key={a.step} className="card-3d h-full">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-brand-grad-soft text-brand-200">
                    <Target className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-3xl font-extrabold text-white/10">{a.step}</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-white">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Filiallar ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-5 py-16">
        <SectionTitle
          icon={<MapPin className="h-5 w-5" />}
          title="Filiallarımız"
          subtitle="Ən yaxın filialda üzbəüz dərslərə qoşulun"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CAMPUSES.map((c, i) => (
            <Panel
              key={c}
              hover
              className={cn('animate-fade-up', i % 4 === 1 && 'animate-delay-100', i % 4 === 2 && 'animate-delay-200', i % 4 === 3 && 'animate-delay-300')}
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-accent-500/15 text-accent-300">
                <MapPin className="h-5 w-5" />
              </span>
              <p className="mt-4 text-sm font-bold text-white">{c}</p>
              <p className="mt-1 text-xs text-slate-400">B.e – C, 09:00 – 20:00</p>
            </Panel>
          ))}
        </div>
      </section>

      {/* ---------------- Mentorlar ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-5 py-16">
        <SectionTitle
          icon={<Users className="h-5 w-5" />}
          title="Müəllim və mentor heyəti"
          subtitle="Sənayedə çalışan praktik mütəxəssislər"
        />
        <Panel className="rounded-3xl">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
            {mentors.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <Avatar name={m.fullName} gradient={m.avatar} size={52} ring />
                <div>
                  <p className="text-sm font-bold text-white">{m.fullName}</p>
                  <p className="text-xs text-slate-400">{m.specialization ?? 'Müəllim'}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      {/* ---------------- Zaman xətti ---------------- */}
      <section className="relative overflow-hidden border-y border-white/10 bg-ink-900/40 py-16">
        <div className="relative mx-auto w-full max-w-3xl px-5">
          <SectionTitle
            icon={<HeartHandshake className="h-5 w-5" />}
            title="Yolumuz"
            subtitle="Təsis edildiyimiz gündən bu günə"
          />
          <div className="relative border-l border-white/10 pl-6">
            {TIMELINE.map((t) => (
              <div key={t.year} className="relative pb-8 last:pb-0">
                <span className="absolute -left-[31px] top-1 grid h-3 w-3 place-items-center rounded-full bg-brand-grad shadow-glow" />
                <Badge tone="brand">{t.year}</Badge>
                <h3 className="mt-2 text-base font-bold text-white">{t.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-5 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-grad-soft p-10 text-center shadow-glow">
          <div className="absolute inset-0 grid-bg" />
          <div className="relative">
            <h2 className="text-2xl font-extrabold text-white sm:text-4xl">
              Gələcəyinizi <span className="gradient-text">bu gün qurun</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
              Komandamıza qoşulun — qəbul testindən keçin, istiqamətinizi seçin və IT karyeranıza
              CodeVia Academy ilə başlayın.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link to="/kurslar">
                <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Kurslara bax
                </Button>
              </Link>
              <Link to="/giris">
                <Button size="lg" variant="glass">
                  Test hesabla giriş
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
