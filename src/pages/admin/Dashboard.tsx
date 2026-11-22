import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  CreditCard,
  GraduationCap,
  RefreshCw,
  Users,
  Wallet,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { BadgeTone } from '../../components/ui'
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
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
import { useAppDispatch } from '../../app/hooks'
import { pushToast } from '../../features/ui/uiSlice'
import {
  useGetAdminStatsQuery,
  useGetCoursesQuery,
  useGetEnrollmentsQuery,
  useGetPaymentsQuery,
  useGetUsersQuery,
  useResetDatabaseMutation,
  useUpdateEnrollmentMutation,
} from '../../features/api/apiSlice'
import {
  ROLE_LABEL,
  formatAZN,
  formatDate,
  getErrMsg,
  percent,
  relativeTime,
  todayISO,
} from '../../lib/utils'

/* Recharts alət pəncərəsinin vahid üslubu */
const CHART_TOOLTIP = {
  background: '#0d1326',
  border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 12,
  color: '#fff',
}

const MODE_COLORS = ['#6366f1', '#22d3ee', '#a855f7']

const QUICK_LINKS: { to: string; label: string; desc: string; icon: typeof BarChart3 }[] = [
  { to: '/panel/admin/analitika', label: 'Analitika', desc: 'Dərin statistika', icon: BarChart3 },
  { to: '/panel/admin/istifadeciler', label: 'İstifadəçilər', desc: 'Hesabların idarəsi', icon: Users },
  { to: '/panel/admin/qeydiyyatlar', label: 'Qeydiyyatlar', desc: 'Kurs qeydiyyatları', icon: ClipboardList },
  { to: '/panel/admin/odenisler', label: 'Ödənişlər', desc: 'Maliyyə əməliyyatları', icon: CreditCard },
]

interface FeedItem {
  id: string
  label: string
  text: string
  name: string
  gradient: string
  time: string
  tone: BadgeTone
}

/* İdarəetmə mərkəzi — platformanın bütün göstəricilərinə vahid nəzarət */
export default function AdminDashboard() {
  const dispatch = useAppDispatch()
  const { data: stats, isLoading } = useGetAdminStatsQuery()
  const { data: users = [] } = useGetUsersQuery()
  const { data: courses = [] } = useGetCoursesQuery()
  const { data: enrollments = [] } = useGetEnrollmentsQuery(undefined)
  const { data: payments = [] } = useGetPaymentsQuery(undefined)
  const [resetDb, { isLoading: resetting }] = useResetDatabaseMutation()
  const [updateEnrollment] = useUpdateEnrollmentMutation()
  const [confirmReset, setConfirmReset] = useState(false)

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])
  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses])

  /* Son fəaliyyət lenti — qeydiyyatlar, ödənişlər və yeni istifadəçilər */
  const feed = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = []

    enrollments.slice(0, 6).forEach((e) => {
      const student = userMap.get(e.studentId)
      const course = courseMap.get(e.courseId)
      items.push({
        id: `e-${e.id}`,
        label: 'Yeni qeydiyyat',
        text: `${student?.fullName ?? 'Tələbə'} «${course?.title ?? 'Kurs'}» kursuna qeydiyyatdan keçdi`,
        name: student?.fullName ?? 'Tələbə',
        gradient: student?.avatar ?? 'from-brand-500 to-accent-400',
        time: e.createdAt,
        tone: 'accent',
      })
    })

    payments.slice(0, 4).forEach((p) => {
      const student = userMap.get(p.studentId)
      const course = courseMap.get(p.courseId)
      items.push({
        id: `p-${p.id}`,
        label: 'Ödəniş',
        text: `${student?.fullName ?? 'Tələbə'} «${course?.title ?? 'Kurs'}» üçün ${formatAZN(p.amount)} ödədi`,
        name: student?.fullName ?? 'Tələbə',
        gradient: student?.avatar ?? 'from-brand-500 to-accent-400',
        time: p.date,
        tone: p.status === 'paid' ? 'success' : p.status === 'failed' ? 'danger' : 'warning',
      })
    })

    ;[...users]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5)
      .forEach((u) => {
        items.push({
          id: `u-${u.id}`,
          label: 'Yeni istifadəçi',
          text: `${u.fullName} platformaya qoşuldu (${ROLE_LABEL[u.role]})`,
          name: u.fullName,
          gradient: u.avatar,
          time: u.createdAt,
          tone: 'brand',
        })
      })

    return items.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 8)
  }, [enrollments, payments, users, userMap, courseMap])

  const pendingPayments = useMemo(() => payments.filter((p) => p.status === 'pending'), [payments])

  if (isLoading || !stats) return <Loader label="İdarəetmə mərkəzi yüklənir..." />

  const maxRevenue = Math.max(1, ...stats.topCourses.map((c) => c.revenue))
  const categoryTotal = stats.enrollmentsByCategory.reduce((s, c) => s + c.value, 0)

  const handleReset = async () => {
    try {
      await resetDb().unwrap()
      setConfirmReset(false)
      dispatch(
        pushToast({
          type: 'success',
          title: 'Baza sıfırlandı',
          message: 'İlkin məlumatlar uğurla bərpa olundu.',
        }),
      )
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const handleApprove = async (enrollmentId: string) => {
    try {
      await updateEnrollment({ id: enrollmentId, patch: { status: 'active' } }).unwrap()
      dispatch(
        pushToast({
          type: 'success',
          title: 'Təsdiqləndi',
          message: 'Qeydiyyat aktiv vəziyyətə keçirildi.',
        }),
      )
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader
        icon={<BarChart3 className="h-6 w-6" />}
        title="İdarəetmə mərkəzi"
        subtitle="Platformanın bütün göstəricilərinə vahid yerdən nəzarət edin"
        actions={
          <>
            <Badge tone="brand" icon={<CalendarDays className="h-3 w-3" />}>
              Bugün: {formatDate(todayISO())}
            </Badge>
            <Button
              variant="danger"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={() => setConfirmReset(true)}
            >
              Verilənlər bazasını sıfırla
            </Button>
          </>
        }
      />

      {/* Əsas göstəricilər */}
      <div className="grid animate-fade-up gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Tələbələr"
          value={stats.students}
          icon={<Users className="h-5 w-5" />}
          tone="accent"
          trend={6}
        />
        <StatCard
          label="Müəllimlər"
          value={stats.teachers}
          icon={<GraduationCap className="h-5 w-5" />}
          tone="brand"
          trend={2}
        />
        <StatCard
          label="Kurslar"
          value={stats.courses}
          icon={<BookOpen className="h-5 w-5" />}
          tone="neon"
          trend={4}
        />
        <StatCard
          label="Aktiv qeydiyyatlar"
          value={stats.activeEnrollments}
          icon={<ClipboardList className="h-5 w-5" />}
          tone="emerald"
          trend={9}
        />
        <StatCard
          label="Ümumi gəlir"
          value={formatAZN(stats.revenue)}
          icon={<Wallet className="h-5 w-5" />}
          tone="emerald"
          trend={12}
        />
        <StatCard
          label="Gözləyən ödənişlər"
          value={stats.pendingPayments}
          icon={<CreditCard className="h-5 w-5" />}
          tone="amber"
          hint="Təsdiq gözləyir"
        />
      </div>

      {/* Gəlir dinamikası */}
      <Panel className="animate-fade-up animate-delay-100">
        <SectionTitle
          icon={<BarChart3 className="h-5 w-5" />}
          title="Aylıq gəlir dinamikası"
          subtitle="Onlayn və oflayn satışların müqayisəsi (son 6 ay)"
        />
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.revenueByMonth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gOnline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.04} />
                </linearGradient>
                <linearGradient id="gOffline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.04} />
                </linearGradient>
              </defs>
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
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Area
                type="monotone"
                dataKey="online"
                name="Onlayn"
                stackId="1"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#gOnline)"
              />
              <Area
                type="monotone"
                dataKey="offline"
                name="Oflayn"
                stackId="1"
                stroke="#22d3ee"
                strokeWidth={2}
                fill="url(#gOffline)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Kateqoriya və rejim bölgüsü */}
      <div className="grid animate-fade-up animate-delay-200 gap-5 lg:grid-cols-2">
        <Panel>
          <SectionTitle title="Kateqoriyalar üzrə qeydiyyat" subtitle="Hansı sahələrə daha çox maraq var" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.enrollmentsByCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {stats.enrollmentsByCategory.map((c) => (
                      <Cell key={c.name} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2.5 self-center">
              {stats.enrollmentsByCategory.map((c) => (
                <li key={c.name} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                    {c.name}
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {percent(c.value, categoryTotal)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel>
          <SectionTitle title="Tədris rejimi bölgüsü" subtitle="Onlayn, oflayn və hibrid qeydiyyatlar" />
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.modeSplit} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP}
                  cursor={{ fill: 'rgba(255,255,255,.04)' }}
                />
                <Bar dataKey="value" name="Qeydiyyat" radius={[8, 8, 0, 0]}>
                  {stats.modeSplit.map((m, i) => (
                    <Cell key={m.name} fill={MODE_COLORS[i % MODE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Ən gəlirli kurslar */}
      <Panel className="animate-fade-up animate-delay-300">
        <SectionTitle
          icon={<BookOpen className="h-5 w-5" />}
          title="Ən gəlirli kurslar"
          subtitle="Gəlirə görə sıralanmış ilk beş kurs"
        />
        <TableWrap>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Kurs</Th>
              <Th>Tələbə</Th>
              <Th>Gəlir</Th>
              <Th>Reytinq</Th>
              <Th>Gəlir payı</Th>
            </tr>
          </thead>
          <tbody>
            {stats.topCourses.map((c, i) => (
              <tr key={c.id} className="transition-colors hover:bg-white/[0.03]">
                <Td>
                  <span className="font-bold text-slate-500">{i + 1}</span>
                </Td>
                <Td>
                  <span className="font-semibold text-white">{c.title}</span>
                </Td>
                <Td>{c.students}</Td>
                <Td>
                  <span className="font-semibold text-emerald-300">{formatAZN(c.revenue)}</span>
                </Td>
                <Td>
                  <Rating value={c.rating} />
                </Td>
                <Td className="min-w-[160px]">
                  <Progress value={percent(c.revenue, maxRevenue)} />
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Panel>

      {/* Fəaliyyət və gözləyən ödənişlər */}
      <div className="grid animate-fade-up animate-delay-500 gap-5 lg:grid-cols-2">
        <Panel>
          <SectionTitle title="Son fəaliyyət" subtitle="Platformada baş verən son hadisələr" />
          <ul className="space-y-3">
            {feed.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <Avatar name={item.name} gradient={item.gradient} size={38} ring />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge tone={item.tone}>{item.label}</Badge>
                    <span className="text-[11px] text-slate-500">{relativeTime(item.time)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">{item.text}</p>
                </div>
              </li>
            ))}
            {feed.length === 0 && (
              <li className="py-6 text-center text-sm text-slate-500">Hələ fəaliyyət yoxdur.</li>
            )}
          </ul>
        </Panel>

        <Panel>
          <SectionTitle
            icon={<AlertTriangle className="h-5 w-5" />}
            title="Gözləyən ödənişlər"
            subtitle="Təsdiq gözləyən ödənişləri aktivləşdirin"
          />
          {pendingPayments.length === 0 ? (
            <EmptyState
              icon={<CreditCard className="h-6 w-6" />}
              title="Gözləyən ödəniş yoxdur"
              message="Bütün ödənişlər emal edilib. Yeni ödənişlər daxil olduqda burada görünəcək."
            />
          ) : (
            <ul className="space-y-3">
              {pendingPayments.map((p) => {
                const student = userMap.get(p.studentId)
                const course = courseMap.get(p.courseId)
                return (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar
                        name={student?.fullName ?? 'Tələbə'}
                        gradient={student?.avatar}
                        size={36}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {student?.fullName ?? 'Naməlum tələbə'}
                        </p>
                        <p className="truncate text-xs text-slate-400">{course?.title ?? 'Kurs'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-white">{formatAZN(p.amount)}</span>
                      <Button
                        size="xs"
                        variant="success"
                        onClick={() => handleApprove(p.enrollmentId)}
                      >
                        Təsdiqlə
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
      </div>

      {/* Sürətli keçidlər */}
      <div className="grid animate-fade-up gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon
          return (
            <Link key={link.to} to={link.to}>
              <Panel hover className="flex items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-brand-500/15 text-brand-300">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">{link.label}</p>
                  <p className="truncate text-xs text-slate-400">{link.desc}</p>
                </div>
              </Panel>
            </Link>
          )
        })}
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={handleReset}
        loading={resetting}
        title="Verilənlər bazasını sıfırlamaq?"
        message="Bütün dəyişikliklər silinəcək və ilkin məlumatlar bərpa olunacaq. Bu əməliyyat geri qaytarıla bilməz."
        confirmLabel="Sıfırla"
      />
    </div>
  )
}
