import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  FolderKanban,
  LayoutDashboard,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import type { TeacherStats } from '../../types'
import { useAuth } from '../../app/hooks'
import {
  useGetCoursesQuery,
  useGetEnrollmentsQuery,
  useGetTeacherStatsQuery,
  useGetUsersQuery,
} from '../../features/api/apiSlice'
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Loader,
  Panel,
  Progress,
  Rating,
  SectionTitle,
  TableWrap,
  Td,
  Th,
} from '../../components/ui'
import { PageHeader, StatCard } from '../../components/common'
import {
  ENROLLMENT_STATUS_LABEL,
  LEVEL_LABEL,
  MODE_LABEL,
  SLOT_LABEL,
  WEEKDAYS,
  formatAZN,
  formatDate,
} from '../../lib/utils'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

/* Boş statistika — məlumat gəlməzdən əvvəl crash olmasın */
const EMPTY_STATS: TeacherStats = {
  courses: 0,
  students: 0,
  activeStudents: 0,
  lessons: 0,
  avgProgress: 0,
  avgRating: 0,
  revenue: 0,
  upcoming: [],
  progressByCourse: [],
}

const ENROLLMENT_TONE = {
  pending: 'warning',
  active: 'success',
  completed: 'brand',
  cancelled: 'danger',
} as const

export default function TeacherDashboard() {
  const { user } = useAuth()
  const teacherId = user?.id ?? ''

  const { data: statsData, isLoading: statsLoading } = useGetTeacherStatsQuery(teacherId, {
    skip: !teacherId,
  })
  const { data: allCourses = [], isLoading: coursesLoading } = useGetCoursesQuery()
  const { data: enrollments = [] } = useGetEnrollmentsQuery({ teacherId }, { skip: !teacherId })
  const { data: users = [] } = useGetUsersQuery()

  const stats = statsData ?? EMPTY_STATS
  const courses = allCourses.filter((c) => c.teacherId === teacherId)
  const userMap = new Map(users.map((u) => [u.id, u]))
  const courseMap = new Map(courses.map((c) => [c.id, c]))

  /* Kurs üzrə orta irəliləyişi və unikal tələbə sayını hesablayırıq */
  const courseProgress = (courseId: string): number => {
    const list = enrollments.filter((e) => e.courseId === courseId)
    if (!list.length) return 0
    return Math.round(list.reduce((sum, e) => sum + e.progress, 0) / list.length)
  }
  const courseStudents = (courseId: string): number =>
    new Set(enrollments.filter((e) => e.courseId === courseId).map((e) => e.studentId)).size

  if (statsLoading || coursesLoading) return <Loader label="İdarə paneli yüklənir..." />

  const firstName = user?.fullName?.split(' ')[0] ?? ''
  const recent = enrollments.slice(0, 5)

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<LayoutDashboard className="h-6 w-6" />}
        title={`Xoş gəldiniz, ${firstName}!`}
        subtitle="Kurslarınızın, tələbələrinizin və gəlirinizin ümumi icmalı bir yerdə."
      />

      {/* ---------------- Statistika kartları ---------------- */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Kurslarım"
          value={stats.courses}
          icon={<BookOpen className="h-5 w-5" />}
          tone="brand"
          trend={10}
          hint={`${courses.filter((c) => c.status === 'published').length} dərc edilmiş kurs`}
        />
        <StatCard
          label="Tələbələrim"
          value={stats.students}
          icon={<Users className="h-5 w-5" />}
          tone="accent"
          trend={14}
          hint={`${stats.activeStudents} aktiv qeydiyyat`}
        />
        <StatCard
          label="Orta irəliləyiş (%)"
          value={`${stats.avgProgress}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="neon"
          trend={6}
          hint="Bütün kurslar üzrə ortalama"
        />
        <StatCard
          label="Ümumi gəlir"
          value={formatAZN(stats.revenue)}
          icon={<Wallet className="h-5 w-5" />}
          tone="emerald"
          trend={18}
          hint="Ödənilib statuslu ödənişlər"
        />
      </div>

      {/* ---------------- Sürətli əməliyyatlar ---------------- */}
      <Panel className="animate-fade-up">
        <SectionTitle
          title="Sürətli əməliyyatlar"
          subtitle="Ən çox istifadə olunan bölmələrə birbaşa keçid"
        />
        <div className="flex flex-wrap gap-3">
          <Link to="/panel/muellim/dersler">
            <Button variant="glass" leftIcon={<FolderKanban className="h-4 w-4" />}>
              Dərslər & Silabus
            </Button>
          </Link>
          <Link to="/panel/muellim/telebe">
            <Button variant="glass" leftIcon={<Users className="h-4 w-4" />}>
              Tələbələrim
            </Button>
          </Link>
          <Link to="/panel/muellim/cedvel">
            <Button variant="glass" leftIcon={<CalendarDays className="h-4 w-4" />}>
              Dərs cədvəli
            </Button>
          </Link>
          <Link to="/panel/muellim/gelir">
            <Button variant="glass" leftIcon={<Wallet className="h-4 w-4" />}>
              Gəlir & Ödənişlər
            </Button>
          </Link>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* ---------------- Sol tərəf ---------------- */}
        <div className="space-y-6 xl:col-span-2">
          <Panel className="animate-fade-up">
            <SectionTitle
              title="Kurslarım üzrə irəliləyiş"
              subtitle="Hər kurs üzrə tələbələrin orta tamamlama faizi"
              icon={<BarChart3 className="h-5 w-5" />}
            />
            {stats.progressByCourse.length === 0 ? (
              <EmptyState
                title="Hələ kursunuz yoxdur"
                message="İrəliləyiş statistikasını görmək üçün ilk kursunuzu yaradın."
                icon={<BookOpen className="h-6 w-6" />}
              />
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.progressByCourse}
                    layout="vertical"
                    margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={140}
                      tick={{ fill: '#cbd5e1', fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,.04)' }}
                      contentStyle={{
                        background: '#0d1326',
                        border: '1px solid rgba(255,255,255,.1)',
                        borderRadius: 12,
                        color: '#fff',
                      }}
                      formatter={(value) => [`${String(value)}%`, 'Orta irəliləyiş']}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          <Panel className="animate-fade-up animate-delay-100">
            <SectionTitle
              title="Kurslarım"
              subtitle={`${courses.length} kurs`}
              icon={<BookOpen className="h-5 w-5" />}
            />
            {courses.length === 0 ? (
              <EmptyState
                title="Kurs tapılmadı"
                message="Kurslarınızı idarə etmək üçün yeni kurs yaradın."
                icon={<BookOpen className="h-6 w-6" />}
                action={
                  <Link to="/panel/muellim/kurslar">
                    <Button leftIcon={<BookOpen className="h-4 w-4" />}>Kurslarım</Button>
                  </Link>
                }
              />
            ) : (
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Kurs</Th>
                    <Th>Səviyyə</Th>
                    <Th>Tələbə</Th>
                    <Th className="w-[160px]">Orta irəliləyiş</Th>
                    <Th>Reytinq</Th>
                    <Th>Əməliyyat</Th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="transition-colors hover:bg-white/[0.03]">
                      <Td>
                        <span className="block font-semibold text-white">{course.title}</span>
                        <span className="text-xs text-slate-500">{course.category}</span>
                      </Td>
                      <Td>
                        <Badge tone="neutral">{LEVEL_LABEL[course.level]}</Badge>
                      </Td>
                      <Td>{courseStudents(course.id)}</Td>
                      <Td>
                        <Progress value={courseProgress(course.id)} showLabel />
                      </Td>
                      <Td>
                        <Rating value={course.rating} count={course.reviewCount} />
                      </Td>
                      <Td>
                        <Link to={`/panel/muellim/kurslar/${course.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
                          >
                            İdarə et
                          </Button>
                        </Link>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </Panel>
        </div>

        {/* ---------------- Sağ tərəf ---------------- */}
        <div className="space-y-6">
          <Panel className="animate-fade-up animate-delay-100">
            <SectionTitle
              title="Növbəti dərslər"
              subtitle="Aktiv qrupların cədvəli"
              icon={<CalendarDays className="h-5 w-5" />}
            />
            {stats.upcoming.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">Yaxınlaşan dərs yoxdur.</p>
            ) : (
              <div className="space-y-3">
                {stats.upcoming.map((item, i) => (
                  <div
                    key={`${item.courseId}-${i}`}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{item.courseTitle}</p>
                      <Badge tone="accent">{MODE_LABEL[courseMap.get(item.courseId)?.mode ?? 'online']}</Badge>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-400">{SLOT_LABEL[item.slot]}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {item.days.map((d) => (
                        <span
                          key={d}
                          className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-semibold text-slate-300"
                        >
                          {WEEKDAYS.find((w) => w.value === d)?.short ?? '—'}
                        </span>
                      ))}
                      <span className="ml-auto text-xs text-slate-500">{item.students} tələbə</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel className="animate-fade-up animate-delay-200">
            <SectionTitle
              title="Son qeydiyyatlar"
              subtitle="Ən son 5 müraciət"
              icon={<Users className="h-5 w-5" />}
            />
            {recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">Hələ qeydiyyat yoxdur.</p>
            ) : (
              <div className="space-y-3">
                {recent.map((e) => {
                  const student = userMap.get(e.studentId)
                  return (
                    <div key={e.id} className="flex items-center gap-3">
                      <Avatar name={student?.fullName ?? 'Naməlum'} gradient={student?.avatar} size={38} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {student?.fullName ?? 'Naməlum tələbə'}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {courseMap.get(e.courseId)?.title ?? 'Kurs silinib'}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {formatDate(e.createdAt)} · {e.packageTier.toUpperCase()}
                        </p>
                      </div>
                      <Badge tone={ENROLLMENT_TONE[e.status]}>{ENROLLMENT_STATUS_LABEL[e.status]}</Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
