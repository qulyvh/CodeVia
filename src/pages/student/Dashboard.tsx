import { Link } from 'react-router-dom'
import {
  Award,
  Bell,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  GraduationCap,
  PlayCircle,
} from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import type { Notification } from '../../types'
import { useAppDispatch, useAuth } from '../../app/hooks'
import {
  useGetCoursesQuery,
  useGetEnrollmentsQuery,
  useGetNotificationsQuery,
  useGetStudentStatsQuery,
  useGetUsersQuery,
  useMarkNotificationReadMutation,
} from '../../features/api/apiSlice'
import { pushToast } from '../../features/ui/uiSlice'
import {
  Badge,
  Button,
  EmptyState,
  Loader,
  Panel,
  Progress,
  Ring,
  SectionTitle,
} from '../../components/ui'
import { CoverImage, PageHeader, StatCard } from '../../components/common'
import { cn, formatDate, MODE_LABEL, nextLessonDates, percent, relativeTime } from '../../lib/utils'

const NOTIF_TONE: Record<Notification['type'], 'brand' | 'success' | 'warning' | 'accent'> = {
  info: 'brand',
  success: 'success',
  warning: 'warning',
  grade: 'accent',
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()

  const { data: stats, isLoading: statsLoading } = useGetStudentStatsQuery(user?.id ?? '', {
    skip: !user?.id,
  })
  const { data: enrollments = [], isLoading: enrLoading } = useGetEnrollmentsQuery(
    { studentId: user?.id },
    { skip: !user?.id },
  )
  const { data: courses = [] } = useGetCoursesQuery()
  const { data: users = [] } = useGetUsersQuery()
  const { data: notifications = [] } = useGetNotificationsQuery(user?.id ?? '', {
    skip: !user?.id,
  })
  const [markRead] = useMarkNotificationReadMutation()

  const firstName = (user?.fullName ?? 'Tələbə').split(' ')[0]
  const courseOf = (id: string) => courses.find((c) => c.id === id)
  const teacherName = (teacherId: string) =>
    users.find((u) => u.id === teacherId)?.fullName ?? 'Müəllim'

  const activeEnrollments = enrollments.filter((e) => e.status === 'active')
  const overall = percent(stats?.lessonsDone ?? 0, stats?.totalLessons ?? 0)

  const handleNotification = (id: string) => {
    markRead(id)
    dispatch(pushToast({ type: 'info', title: 'Bildiriş oxundu kimi işarələndi' }))
  }

  const header = (
    <PageHeader
      title={`Xoş gəldiniz, ${firstName}!`}
      subtitle="Təhsilinizin ümumi mənzərəsi, davam edən kurslar və bu həftəki fəaliyyətiniz bir yerdə."
      icon={<GraduationCap className="h-6 w-6" />}
    />
  )

  if (statsLoading || enrLoading) {
    return (
      <div className="animate-fade-up">
        {header}
        <Loader label="Panel yüklənir..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">{header}</div>

      {/* Statistika kartları */}
      <div className="grid animate-fade-up grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Aktiv kurslar"
          value={stats?.activeCourses ?? 0}
          icon={<BookOpen className="h-5 w-5" />}
          tone="brand"
          trend={12}
          hint="Davam edən proqramlar"
        />
        <StatCard
          label="Tamamlanmış"
          value={stats?.completedCourses ?? 0}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="emerald"
          trend={3}
          hint="Sertifikat qazanılmış kurslar"
        />
        <StatCard
          label="Davamiyyət (%)"
          value={`${stats?.attendance ?? 0}%`}
          icon={<CalendarCheck className="h-5 w-5" />}
          tone="accent"
          trend={6}
          hint="Orta iştirak göstəricisi"
        />
        <StatCard
          label="Ortalama bal"
          value={stats?.avgGrade ?? 0}
          icon={<Award className="h-5 w-5" />}
          tone="amber"
          trend={-4}
          hint="Qiymətləndirilən kurslar üzrə"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Sol sütun */}
        <div className="space-y-5 xl:col-span-2">
          <Panel className="animate-fade-up animate-delay-100">
            <SectionTitle
              title="Davam edən kurslar"
              subtitle="Ən son fəaliyyətinizə əsasən davam etdirin"
              icon={<BookOpen className="h-5 w-5" />}
              action={
                <Link to="/panel/telebe/kurslar">
                  <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}>
                    Hamısı
                  </Button>
                </Link>
              }
            />

            {activeEnrollments.length === 0 ? (
              <EmptyState
                title="Davam edən kursunuz yoxdur"
                message="Yeni kurslara qeydiyyatdan keçərək öyrənməyə başlayın."
                icon={<BookOpen className="h-6 w-6" />}
                action={
                  <Link to="/kurslar">
                    <Button variant="primary" leftIcon={<BookOpen className="h-4 w-4" />}>
                      Kurslara bax
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4">
                {activeEnrollments.slice(0, 3).map((e) => {
                  const course = courseOf(e.courseId)
                  const next = nextLessonDates(e.startDate, e.days, 1)[0]
                  return (
                    <div
                      key={e.id}
                      className="panel panel-hover flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="w-full shrink-0 sm:w-44">
                        <CoverImage
                          prompt={course?.coverPrompt ?? e.courseId}
                          title={course?.title ?? 'Kurs'}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone="brand">{course?.category ?? 'Kurs'}</Badge>
                          <Badge
                            tone={
                              e.mode === 'online' ? 'accent' : e.mode === 'offline' ? 'warning' : 'neon'
                            }
                          >
                            {MODE_LABEL[e.mode]}
                          </Badge>
                        </div>
                        <h3 className="mt-2 line-clamp-1 text-base font-bold text-white">
                          {course?.title ?? 'Kurs'}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {teacherName(course?.teacherId ?? '')}
                        </p>
                        <div className="mt-3">
                          <Progress value={e.progress} showLabel />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          {next ? `Növbəti dərs: ${formatDate(next)}` : 'Cədvəl gözləmədədir'}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <Link to={`/panel/telebe/kurs/${e.courseId}`}>
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<PlayCircle className="h-4 w-4" />}
                          >
                            Davam et
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Panel>

          <Panel className="animate-fade-up animate-delay-200">
            <SectionTitle
              title="Sürətli keçidlər"
              subtitle="Tez-tez istifadə etdiyiniz bölmələr"
              icon={<ChevronRight className="h-5 w-5" />}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Link
                to="/panel/telebe/kurslar"
                className="glass group flex items-center gap-3 rounded-2xl p-4 transition-all hover:-translate-y-1 hover:border-brand-400/40 hover:bg-white/10"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                  <BookOpen className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-white">Kurslarım</span>
              </Link>
              <Link
                to="/panel/telebe/cedvel"
                className="glass group flex items-center gap-3 rounded-2xl p-4 transition-all hover:-translate-y-1 hover:border-accent-400/40 hover:bg-white/10"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-500/15 text-accent-300">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-white">Dərs cədvəlim</span>
              </Link>
              <Link
                to="/panel/telebe/odenisler"
                className="glass group flex items-center gap-3 rounded-2xl p-4 transition-all hover:-translate-y-1 hover:border-neon-400/40 hover:bg-white/10"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-neon-500/15 text-neon-300">
                  <CreditCard className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-white">Ödənişlərim</span>
              </Link>
            </div>
          </Panel>
        </div>

        {/* Sağ sütun */}
        <div className="space-y-5">
          <Panel className="animate-fade-up animate-delay-100">
            <div className="flex items-center gap-5">
              <Ring value={overall} size={92} label="Ümumi" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">Ümumi irəliləyiş</p>
                <p className="mt-1 text-xs text-slate-400">
                  {stats?.lessonsDone ?? 0} / {stats?.totalLessons ?? 0} dərs tamamlanıb
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {stats?.xp ?? 0} XP · {stats?.level ?? 'Səviyyə 1'}
                </p>
              </div>
            </div>
          </Panel>

          <Panel className="animate-fade-up animate-delay-200">
            <SectionTitle
              title="Bu həftə"
              subtitle="Dərslərə ayırdığınız dəqiqələr"
              icon={<CalendarCheck className="h-5 w-5" />}
            />
            <div className="h-[190px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.weeklyActivity ?? []} margin={{ top: 6, right: 4, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,.05)' }}
                    contentStyle={{
                      background: '#0d1326',
                      border: '1px solid rgba(255,255,255,.1)',
                      borderRadius: 12,
                      color: '#fff',
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="minutes" fill="#6366f1" radius={[6, 6, 0, 0]} name="Dəqiqə" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel className="animate-fade-up animate-delay-300">
            <SectionTitle
              title="Sınaq nəticələri"
              subtitle="Qəbul testi ballarınız"
              icon={<Award className="h-5 w-5" />}
            />
            {enrollments.length === 0 ? (
              <p className="text-sm text-slate-400">Hələ sınaq nəticəniz yoxdur.</p>
            ) : (
              <div className="space-y-4">
                {enrollments.map((e) => (
                  <div key={e.id}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="line-clamp-1 text-xs font-semibold text-slate-300">
                        {courseOf(e.courseId)?.title ?? 'Kurs'}
                      </span>
                      <span className="shrink-0 text-xs font-bold text-white">{e.quizScore}%</span>
                    </div>
                    <Progress
                      value={e.quizScore}
                      tone={e.quizScore >= 70 ? 'success' : 'warning'}
                    />
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel className="animate-fade-up animate-delay-500">
            <SectionTitle
              title="Bildirişlər"
              subtitle="Son yeniliklər"
              icon={<Bell className="h-5 w-5" />}
            />
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-400">Bildiriş yoxdur.</p>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 4).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleNotification(n.id)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors',
                      n.read
                        ? 'border-white/8 bg-white/[0.02] hover:bg-white/[0.05]'
                        : 'border-brand-400/25 bg-brand-500/10 hover:bg-brand-500/15',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-1 h-2 w-2 shrink-0 rounded-full',
                        n.read ? 'bg-slate-600' : 'bg-brand-400',
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="line-clamp-1 text-xs font-bold text-white">{n.title}</span>
                        <Badge tone={NOTIF_TONE[n.type]} className="ml-auto">
                          {relativeTime(n.date)}
                        </Badge>
                      </span>
                      <span className="mt-0.5 block line-clamp-2 text-xs text-slate-400">
                        {n.body}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
