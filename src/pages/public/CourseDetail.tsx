import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  GraduationCap,
  Layers,
  MonitorPlay,
  PlayCircle,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import type { Lesson } from '../../types'
import {
  useGetCourseQuery,
  useGetCoursesQuery,
  useGetLessonsQuery,
  useGetUsersQuery,
} from '../../features/api/apiSlice'
import {
  LEVEL_LABEL,
  LESSON_TYPE_LABEL,
  MODE_LABEL,
  PACKAGES,
  cn,
  formatAZN,
  packagePrice,
} from '../../lib/utils'
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Loader,
  Modal,
  Panel,
  Rating,
  SectionTitle,
} from '../../components/ui'
import { CoverImage, GradientBlobs, VideoPlayer } from '../../components/common'
import { CourseCard } from '../../components/common/CourseCard'

const JOIN_FEATURES = [
  { icon: Award, text: 'Rəsmi CodeVia sertifikatı' },
  { icon: ShieldCheck, text: 'Fərdi mentor dəstəyi (24 saat)' },
  { icon: MonitorPlay, text: 'Ömürlük video dərs arxivi' },
]

export default function CourseDetail() {
  const { courseId } = useParams()
  const { data: course, isLoading, isError } = useGetCourseQuery(courseId!)
  const { data: lessons = [] } = useGetLessonsQuery(courseId!)
  const { data: users = [] } = useGetUsersQuery()
  const { data: allCourses = [] } = useGetCoursesQuery()

  const [openModule, setOpenModule] = useState<string | null>(null)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)

  const modules = useMemo(() => {
    const map = new Map<string, Lesson[]>()
    lessons.forEach((lesson) => {
      const group = map.get(lesson.moduleTitle) ?? []
      group.push(lesson)
      map.set(lesson.moduleTitle, group)
    })
    return Array.from(map.entries())
      .map(([title, items]) => ({
        title,
        order: items[0]?.moduleOrder ?? 0,
        lessons: [...items].sort((a, b) => a.order - b.order),
        duration: items.reduce((sum, l) => sum + l.durationMin, 0),
      }))
      .sort((a, b) => a.order - b.order)
  }, [lessons])

  if (isLoading) return <Loader label="Kurs yüklənir..." />

  if (isError || !course) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-24">
        <EmptyState
          title="Kurs tapılmadı"
          message="Axtardığınız kurs mövcud deyil və ya silinib. Kurs siyahısına qayıdaraq digər proqramlara baxa bilərsiniz."
          icon={<BookOpen className="h-6 w-6" />}
          action={
            <Link to="/kurslar">
              <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Kurslara qayıt
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  const effectiveOpen = openModule ?? modules[0]?.title ?? null
  const firstFreeLesson = lessons.find((l) => l.isFree)
  const teacher = users.find((u) => u.id === course.teacherId)
  const related = allCourses
    .filter((c) => c.category === course.category && c.id !== course.id)
    .slice(0, 3)

  const meta = [
    { icon: Clock, value: `${course.totalHours} saat` },
    { icon: CalendarDays, value: `${course.durationWeeks} həftə` },
    { icon: Layers, value: `${course.lessonsPerWeek} dərs/həftə` },
    { icon: Users, value: `${course.studentCount} tələbə` },
    { icon: GraduationCap, value: course.category },
  ]

  return (
    <div className="pb-20">
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden border-b border-white/10 pb-14 pt-10">
        <div className="absolute inset-0 grid-bg" />
        <GradientBlobs />
        <div className="relative mx-auto w-full max-w-7xl px-5">
          <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500">
            <Link to="/" className="transition-colors hover:text-slate-300">
              Ana səhifə
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/kurslar" className="transition-colors hover:text-slate-300">
              Kurslar
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="truncate text-slate-400">{course.title}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-3">
            {/* Sol sütun */}
            <div className="animate-fade-up lg:col-span-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brand">{course.category}</Badge>
                <Badge tone="neutral">{LEVEL_LABEL[course.level]}</Badge>
                <Badge
                  tone={
                    course.mode === 'online' ? 'accent' : course.mode === 'offline' ? 'warning' : 'neon'
                  }
                  icon={
                    course.mode === 'online' ? (
                      <Radio className="h-3 w-3" />
                    ) : (
                      <GraduationCap className="h-3 w-3" />
                    )
                  }
                >
                  {MODE_LABEL[course.mode]}
                </Badge>
                {course.popular && (
                  <Badge tone="danger" icon={<Sparkles className="h-3 w-3" />}>
                    Populyar
                  </Badge>
                )}
              </div>

              <h1 className="animate-delay-100 mt-5 animate-fade-up text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {course.title}
              </h1>

              <p className="animate-delay-100 mt-4 max-w-2xl animate-fade-up text-base leading-relaxed text-slate-400">
                {course.summary}
              </p>

              <div className="animate-delay-200 mt-5 flex animate-fade-up flex-wrap items-center gap-4">
                <Rating value={course.rating} count={course.reviewCount} size={16} />
                <span className="h-4 w-px bg-white/10" />
                <span className="text-sm text-slate-400">{course.durationWeeks} həftəlik proqram</span>
              </div>

              <div className="animate-delay-200 mt-6 flex animate-fade-up flex-wrap gap-x-6 gap-y-3">
                {meta.map((item) => {
                  const Icon = item.icon
                  return (
                    <span
                      key={item.value}
                      className="inline-flex items-center gap-2 text-sm text-slate-300"
                    >
                      <Icon className="h-4 w-4 text-brand-300" />
                      {item.value}
                    </span>
                  )
                })}
              </div>

              <div className="animate-delay-300 mt-6 animate-fade-up">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  İstifadə olunan texnologiyalar
                </p>
                <div className="flex flex-wrap gap-2">
                  {course.tech.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs font-semibold text-slate-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sağ sütun — sticky kart */}
            <div className="animate-delay-200 animate-fade-up lg:sticky lg:top-24 lg:self-start">
              <div className="relative">
                <div className="absolute -inset-4 rounded-[32px] bg-brand-grad opacity-15 blur-3xl" />
                <Panel className="relative border-white/12 shadow-glow">
                  <CoverImage prompt={course.coverPrompt} title={course.title} />

                  <div className="mt-5">
                    {course.oldPrice && (
                      <p className="text-sm text-slate-500 line-through">
                        {formatAZN(course.oldPrice)}
                      </p>
                    )}
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-3xl font-extrabold text-white">
                          {formatAZN(course.basePrice)}
                        </p>
                        <p className="text-xs text-slate-500">Start paket qiyməti</p>
                      </div>
                      <Rating value={course.rating} />
                    </div>
                  </div>

                  <Link to={`/kurslar/${course.id}/qeydiyyat`} className="mt-5 block">
                    <Button full size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      Qoşul
                    </Button>
                  </Link>

                  <Button
                    className="mt-3"
                    full
                    variant="secondary"
                    leftIcon={<PlayCircle className="h-4 w-4" />}
                    disabled={!firstFreeLesson}
                    onClick={() => firstFreeLesson && setActiveLesson(firstFreeLesson)}
                  >
                    Sınaq dərsi
                  </Button>
                  <Link to="/kurslar" className="mt-3 block">
                    <Button full variant="glass" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                      Kurslara qayıt
                    </Button>
                  </Link>

                  <div className="mt-5 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Paket qiymətləri
                    </p>
                    {PACKAGES.map((pkg) => (
                      <div
                        key={pkg.tier}
                        className={cn(
                          'flex items-center justify-between rounded-xl border px-3 py-2',
                          pkg.highlight
                            ? 'border-brand-400/40 bg-brand-500/10'
                            : 'border-white/10 bg-white/[0.03]',
                        )}
                      >
                        <span className="text-xs font-semibold text-slate-300">{pkg.name}</span>
                        <span className="font-mono text-sm font-bold text-white">
                          {formatAZN(packagePrice(course.basePrice, pkg.tier))}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
                    {JOIN_FEATURES.map((feature) => {
                      const Icon = feature.icon
                      return (
                        <div key={feature.text} className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4 shrink-0 text-accent-300" />
                          <span className="text-xs text-slate-400">{feature.text}</span>
                        </div>
                      )
                    })}
                  </div>
                </Panel>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Əsas məzmun ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-5 py-12">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            {/* Nə öyrənəcəksiniz */}
            <div>
              <SectionTitle
                icon={<Sparkles className="h-5 w-5" />}
                title="Nə öyrənəcəksiniz"
                subtitle="Kursun sonunda sizi gözləyən bacarıqlar"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {course.outcomes.map((outcome) => (
                  <Panel key={outcome} hover className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    <span className="text-sm text-slate-300">{outcome}</span>
                  </Panel>
                ))}
              </div>
            </div>

            {/* Tələblər */}
            <div>
              <SectionTitle
                icon={<Layers className="h-5 w-5" />}
                title="Tələblər"
                subtitle="Kursa başlamaq üçün nə lazımdır"
              />
              <Panel>
                <ul className="space-y-2.5">
                  {course.requirements.map((requirement) => (
                    <li
                      key={requirement}
                      className="flex items-start gap-3 text-sm text-slate-300"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                      {requirement}
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>

            {/* Kurs haqqında */}
            <div>
              <SectionTitle icon={<BookOpen className="h-5 w-5" />} title="Kurs haqqında" />
              <Panel className="space-y-3">
                {course.description
                  .split('\n')
                  .filter(Boolean)
                  .map((paragraph, i) => (
                    <p key={i} className="text-sm leading-relaxed text-slate-400">
                      {paragraph}
                    </p>
                  ))}
              </Panel>
            </div>
          </div>

          {/* Sağ tərəf — müəllim */}
          <div className="space-y-6">
            {teacher && (
              <Panel className="lg:sticky lg:top-24">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Müəllim
                </p>
                <div className="flex items-center gap-4">
                  <Avatar name={teacher.fullName} gradient={teacher.avatar} size={64} ring />
                  <div className="min-w-0">
                    <p className="text-base font-bold text-white">{teacher.fullName}</p>
                    <p className="text-xs font-semibold text-brand-300">
                      {teacher.specialization}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <Rating value={teacher.rating ?? 4.8} />
                      <Badge tone="neutral">{teacher.experienceYears} il</Badge>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">{teacher.bio}</p>
              </Panel>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- Silabus ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-5 pb-12">
        <SectionTitle
          icon={<MonitorPlay className="h-5 w-5" />}
          title="Kurikulum"
          subtitle={`${modules.length} modul · ${lessons.length} dərs`}
        />
        {modules.length === 0 ? (
          <EmptyState
            title="Kurikulum hazırlanır"
            message="Bu kurs üçün dərslər hələ əlavə edilməyib. Tezliklə yayımlanacaq."
            icon={<MonitorPlay className="h-6 w-6" />}
          />
        ) : (
          <div className="space-y-3">
            {modules.map((module, idx) => {
              const isOpen = effectiveOpen === module.title
              return (
                <Panel
                  key={module.title}
                  className={cn('overflow-hidden p-0', isOpen && 'border-brand-400/40 shadow-glow')}
                >
                  <button
                    type="button"
                    onClick={() => setOpenModule(isOpen ? '' : module.title)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-brand-grad-soft font-mono text-xs font-bold text-brand-200">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">{module.title}</p>
                        <p className="text-xs text-slate-500">
                          {module.lessons.length} dərs · {module.duration} dəq
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 shrink-0 text-brand-300 transition-transform',
                        isOpen && 'rotate-180',
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div className="animate-fade-in divide-y divide-white/5 border-t border-white/10">
                      {module.lessons.map((lesson, lessonIdx) => (
                        <div key={lesson.id} className="flex items-center gap-3 px-5 py-3">
                          <span className="shrink-0 font-mono text-xs text-slate-500">
                            {String(lessonIdx + 1).padStart(2, '0')}
                          </span>
                          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-200">
                              {lesson.title}
                            </span>
                            <Badge tone="neutral">{LESSON_TYPE_LABEL[lesson.type]}</Badge>
                            {lesson.isFree && <Badge tone="success">Pulsuz</Badge>}
                          </div>
                          <span className="shrink-0 text-xs text-slate-500">
                            {lesson.durationMin} dəq
                          </span>
                          {lesson.isFree ? (
                            <Button
                              size="xs"
                              variant="outline"
                              leftIcon={<PlayCircle className="h-3.5 w-3.5" />}
                              onClick={() => setActiveLesson(lesson)}
                            >
                              Bax
                            </Button>
                          ) : (
                            <ShieldCheck className="h-4 w-4 shrink-0 text-slate-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>
              )
            })}
          </div>
        )}
      </section>

      {/* ---------------- Oxşar kurslar ---------------- */}
      {related.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-5 pt-6">
          <SectionTitle
            icon={<BookOpen className="h-5 w-5" />}
            title="Oxşar kurslar"
            subtitle={`${course.category} kateqoriyasından digər proqramlar`}
            action={
              <Link to={`/kurslar?category=${encodeURIComponent(course.category)}`}>
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Hamısına bax
                </Button>
              </Link>
            }
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item, i) => (
              <div
                key={item.id}
                className={cn(
                  'animate-fade-up',
                  i % 3 === 1 && 'animate-delay-100',
                  i % 3 === 2 && 'animate-delay-200',
                )}
              >
                <CourseCard
                  course={item}
                  teacherName={users.find((u) => u.id === item.teacherId)?.fullName ?? '—'}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- Pulsuz dərs videosu ---------------- */}
      <Modal
        open={!!activeLesson}
        onClose={() => setActiveLesson(null)}
        title={activeLesson?.title ?? 'Pulsuz dərs'}
        size="lg"
      >
        {activeLesson && (
          <>
            <VideoPlayer
              youtubeId={activeLesson.youtubeId}
              title={activeLesson.title}
              badge="Pulsuz dərs"
            />
            {activeLesson.description && (
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                {activeLesson.description}
              </p>
            )}
          </>
        )}
      </Modal>
    </div>
  )
}
