import { useMemo, useState } from 'react'
import {
  BarChart3,
  ClipboardList,
  Star,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { EnrollmentStatus, PackageTier } from '../../types'
import {
  Avatar,
  Badge,
  Loader,
  Panel,
  Progress,
  Ring,
  SectionTitle,
  TableWrap,
  Tabs,
  Td,
  Th,
} from '../../components/ui'
import { PageHeader, StatCard } from '../../components/common'
import {
  useGetAdminStatsQuery,
  useGetCoursesQuery,
  useGetEnrollmentsQuery,
  useGetPaymentsQuery,
  useGetUsersQuery,
} from '../../features/api/apiSlice'
import {
  CAMPUSES,
  ENROLLMENT_STATUS_LABEL,
  formatAZN,
  packageOf,
  percent,
} from '../../lib/utils'

const CHART_TOOLTIP = {
  background: '#0d1326',
  border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 12,
  color: '#fff',
}

const TIERS: PackageTier[] = ['start', 'pro', 'elite']
const TIER_COLORS: Record<PackageTier, string> = {
  start: '#22d3ee',
  pro: '#6366f1',
  elite: '#a855f7',
}

const STATUSES: EnrollmentStatus[] = ['pending', 'active', 'completed', 'cancelled']
const STATUS_COLORS: Record<EnrollmentStatus, string> = {
  pending: '#f59e0b',
  active: '#10b981',
  completed: '#6366f1',
  cancelled: '#f43f5e',
}

type Period = '6' | '3' | '1'

interface CohortRow {
  id: string
  title: string
  enrollments: number
  completed: number
  progress: number
  grade: number
  revenue: number
}

type SortKey = 'title' | 'enrollments' | 'completed' | 'progress' | 'grade' | 'revenue'

export default function AdminAnalytics() {
  const [period, setPeriod] = useState<Period>('6')
  const [sortKey, setSortKey] = useState<SortKey>('revenue')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const { data: stats, isLoading } = useGetAdminStatsQuery()
  const { data: users = [] } = useGetUsersQuery()
  const { data: courses = [] } = useGetCoursesQuery()
  const { data: enrollments = [] } = useGetEnrollmentsQuery(undefined)
  const { data: payments = [] } = useGetPaymentsQuery(undefined)

  /* Sürüşdürülmüş gəlir trendi */
  const revenueTrend = useMemo(() => {
    const months = stats?.revenueByMonth ?? []
    const n = Number(period)
    return months.slice(-n).map((m) => ({ month: m.month, gelir: m.online + m.offline }))
  }, [stats, period])

  /* Kateqoriya üzrə tələbə sayı */
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>()
    enrollments.forEach((e) => {
      const course = courses.find((c) => c.id === e.courseId)
      if (!course) return
      map.set(course.category, (map.get(course.category) ?? 0) + 1)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [enrollments, courses])

  /* Paket bölgüsü */
  const tierDistribution = useMemo(
    () =>
      TIERS.map((tier) => ({
        name: packageOf(tier).name,
        tier,
        value: enrollments.filter((e) => e.packageTier === tier).length,
      })),
    [enrollments],
  )

  /* Status bölgüsü */
  const statusCounts = useMemo(
    () =>
      STATUSES.map((status) => ({
        name: ENROLLMENT_STATUS_LABEL[status],
        status,
        value: enrollments.filter((e) => e.status === status).length,
      })),
    [enrollments],
  )

  /* Filiallar üzrə bölgü */
  const campusBreakdown = useMemo(() => {
    const online = enrollments.filter((e) => e.mode === 'online').length
    return [
      { name: 'Onlayn', value: online },
      ...CAMPUSES.map((campus) => ({
        name: campus,
        value: enrollments.filter((e) => e.campus === campus).length,
      })),
    ]
  }, [enrollments])

  /* Kohort cədvəli */
  const cohortRows = useMemo<CohortRow[]>(() => {
    return courses.map((course) => {
      const list = enrollments.filter((e) => e.courseId === course.id)
      const graded = list.filter((e) => e.grade !== null)
      return {
        id: course.id,
        title: course.title,
        enrollments: list.length,
        completed: list.filter((e) => e.status === 'completed').length,
        progress: list.length
          ? Math.round(list.reduce((s, e) => s + e.progress, 0) / list.length)
          : 0,
        grade: graded.length
          ? Math.round(graded.reduce((s, e) => s + (e.grade ?? 0), 0) / graded.length)
          : 0,
        revenue: payments
          .filter((p) => p.courseId === course.id && p.status === 'paid')
          .reduce((s, p) => s + p.amount, 0),
      }
    })
  }, [courses, enrollments, payments])

  const sortedCohort = useMemo(() => {
    const rows = [...cohortRows]
    rows.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      return sortDir === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av)
    })
    return rows
  }, [cohortRows, sortKey, sortDir])

  /* Ən yaxşı tələbələr */
  const leaders = useMemo(
    () =>
      users
        .filter((u) => u.role === 'student')
        .sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0))
        .slice(0, 6),
    [users],
  )
  const topXp = leaders[0]?.xp ?? 1

  if (isLoading || !stats) return <Loader label="Analitika yüklənir..." />

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sortIndicator = (key: SortKey) =>
    key === sortKey ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  const headers: { key: SortKey; label: string }[] = [
    { key: 'title', label: 'Kurs' },
    { key: 'enrollments', label: 'Qeydiyyat' },
    { key: 'completed', label: 'Tamamlanan' },
    { key: 'progress', label: 'Orta irəliləyiş' },
    { key: 'grade', label: 'Orta bal' },
    { key: 'revenue', label: 'Gəlir' },
  ]

  return (
    <div className="space-y-7">
      <PageHeader
        icon={<BarChart3 className="h-6 w-6" />}
        title="Analitika"
        subtitle="Platformanın dərin göstəriciləri və tendensiyaları"
        actions={
          <Tabs
            value={period}
            onChange={setPeriod}
            tabs={[
              { value: '6', label: '6 ay' },
              { value: '3', label: '3 ay' },
              { value: '1', label: 'Bu ay' },
            ]}
          />
        }
      />

      {/* KPI göstəriciləri */}
      <div className="grid animate-fade-up gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Orta tamamlanma faizi"
          value={`${stats.completionRate}%`}
          icon={<Target className="h-5 w-5" />}
          tone="brand"
          trend={5}
        />
        <StatCard
          label="Orta reytinq"
          value={stats.averageRating.toFixed(1)}
          icon={<Star className="h-5 w-5" />}
          tone="amber"
          trend={3}
        />
        <StatCard
          label="Ümumi gəlir"
          value={formatAZN(stats.revenue)}
          icon={<Wallet className="h-5 w-5" />}
          tone="emerald"
          trend={12}
        />
        <StatCard
          label="Aktiv qeydiyyat"
          value={stats.activeEnrollments}
          icon={<ClipboardList className="h-5 w-5" />}
          tone="accent"
          trend={8}
        />
      </div>

      {/* Gəlir trendi + tamamlanma halqası */}
      <div className="grid animate-fade-up animate-delay-100 gap-5 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <SectionTitle
            icon={<TrendingUp className="h-5 w-5" />}
            title="Gəlir trendi"
            subtitle="Seçilmiş dövr üzrə aylıq gəlir"
          />
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                />
                <Tooltip contentStyle={CHART_TOOLTIP} formatter={(v) => formatAZN(Number(v))} />
                <Line
                  type="monotone"
                  dataKey="gelir"
                  name="Ümumi gəlir"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#6366f1' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="flex flex-col items-center justify-center gap-4 text-center">
          <SectionTitle title="Tamamlanma nisbəti" subtitle="Kursları bitirən tələbələr" />
          <Ring value={stats.completionRate} size={140} stroke={12} label="tamamlanma" />
          <p className="max-w-xs text-sm text-slate-400">
            Qeydiyyatdan keçən tələbələrin {stats.completionRate}%-i kursu uğurla tamamlayıb.
          </p>
        </Panel>
      </div>

      {/* Kateqoriya + paket bölgüsü */}
      <div className="grid animate-fade-up animate-delay-200 gap-5 lg:grid-cols-2">
        <Panel>
          <SectionTitle title="Kateqoriyalar üzrə tələbə sayı" subtitle="Hər sahəyə olan maraq" />
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryCounts} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={CHART_TOOLTIP} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
                <Bar dataKey="value" name="Tələbə" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <SectionTitle title="Paket bölgüsü" subtitle="Start, Pro və Elite seçimləri" />
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  stroke="none"
                >
                  {tierDistribution.map((t) => (
                    <Cell key={t.tier} fill={TIER_COLORS[t.tier]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP} />
                <Legend wrapperStyle={{ fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Status + filiallar */}
      <div className="grid animate-fade-up animate-delay-300 gap-5 lg:grid-cols-2">
        <Panel>
          <SectionTitle title="Qeydiyyat statusları" subtitle="Statuslara görə qeydiyyat sayı" />
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusCounts} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={CHART_TOOLTIP} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
                <Bar dataKey="value" name="Qeydiyyat" radius={[8, 8, 0, 0]}>
                  {statusCounts.map((s) => (
                    <Cell key={s.status} fill={STATUS_COLORS[s.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <SectionTitle
            icon={<Users className="h-5 w-5" />}
            title="Filiallar üzrə"
            subtitle="Onlayn və fiziki filial bölgüsü"
          />
          <div className="space-y-4">
            {campusBreakdown.map((c) => (
              <div key={c.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-slate-300">{c.name}</span>
                  <span className="font-semibold text-white">{c.value}</span>
                </div>
                <Progress value={percent(c.value, enrollments.length)} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Kohort cədvəli */}
      <Panel className="animate-fade-up animate-delay-500">
        <SectionTitle
          icon={<ClipboardList className="h-5 w-5" />}
          title="Kohort cədvəli"
          subtitle="Başlığa klik etməklə sıralayın"
        />
        <TableWrap>
          <thead>
            <tr>
              {headers.map((h) => (
                <Th key={h.key}>
                  <button
                    type="button"
                    onClick={() => toggleSort(h.key)}
                    className="inline-flex items-center gap-1 transition-colors hover:text-white"
                  >
                    {h.label}
                    <span className="text-brand-300">{sortIndicator(h.key)}</span>
                  </button>
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedCohort.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-white/[0.03]">
                <Td>
                  <span className="font-semibold text-white">{row.title}</span>
                </Td>
                <Td>{row.enrollments}</Td>
                <Td>{row.completed}</Td>
                <Td className="min-w-[140px]">
                  <Progress value={row.progress} showLabel />
                </Td>
                <Td>{row.grade}</Td>
                <Td>
                  <span className="font-semibold text-emerald-300">{formatAZN(row.revenue)}</span>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Panel>

      {/* Ən yaxşı tələbələr */}
      <Panel className="animate-fade-up animate-delay-500">
        <SectionTitle
          icon={<Star className="h-5 w-5" />}
          title="Ən yaxşı tələbələr"
          subtitle="XP göstəricisinə görə liderlər"
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {leaders.map((u, i) => (
            <div
              key={u.id}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4"
            >
              <Avatar name={u.fullName} gradient={u.avatar} size={48} ring />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-white">{u.fullName}</p>
                  <Badge tone={i === 0 ? 'warning' : 'neutral'}>#{i + 1}</Badge>
                </div>
                <p className="text-xs text-slate-400">{u.level ?? 'Səviyyə 1'}</p>
                <div className="mt-2">
                  <Progress value={percent(u.xp ?? 0, topXp)} tone="brand" />
                </div>
                <p className="mt-1 text-xs font-semibold text-brand-200">{u.xp ?? 0} XP</p>
              </div>
            </div>
          ))}
          {leaders.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500 sm:col-span-2 xl:col-span-3">
              Tələbə məlumatı yoxdur.
            </p>
          )}
        </div>
      </Panel>
    </div>
  )
}
