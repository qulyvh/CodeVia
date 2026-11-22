import {
  Clock,
  Coins,
  Receipt,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useAuth } from '../../app/hooks'
import {
  useGetCoursesQuery,
  useGetPaymentsQuery,
  useGetUsersQuery,
} from '../../features/api/apiSlice'
import {
  Badge,
  EmptyState,
  Loader,
  Panel,
  Progress,
  SectionTitle,
  TableWrap,
  Td,
  Th,
} from '../../components/ui'
import { PageHeader, StatCard } from '../../components/common'
import { MONTHS_SHORT_AZ, PAYMENT_STATUS_LABEL, formatAZN, formatDate, percent } from '../../lib/utils'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const STATUS_TONE = {
  pending: 'warning',
  paid: 'success',
  failed: 'danger',
  refunded: 'neutral',
} as const

const PIE_COLORS = ['#6366f1', '#22d3ee', '#a855f7', '#10b981', '#f59e0b', '#f43f5e']

const METHOD_LABEL: Record<'card' | 'installment', string> = {
  card: 'Kart',
  installment: 'Hissə-hissə',
}

const TOOLTIP_STYLE = {
  background: '#0d1326',
  border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 12,
  color: '#fff',
} as const

export default function TeacherRevenue() {
  const { user } = useAuth()
  const teacherId = user?.id ?? ''

  const { data: payments = [], isLoading } = useGetPaymentsQuery({ teacherId }, { skip: !teacherId })
  const { data: allCourses = [] } = useGetCoursesQuery()
  const { data: users = [] } = useGetUsersQuery()

  const courses = allCourses.filter((c) => c.teacherId === teacherId)
  const courseMap = new Map(courses.map((c) => [c.id, c]))
  const userMap = new Map(users.map((u) => [u.id, u]))

  const paid = payments.filter((p) => p.status === 'paid')
  const totalRevenue = paid.reduce((s, p) => s + p.amount, 0)

  const now = new Date()
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthRevenue = paid
    .filter((p) => p.date.slice(0, 7) === currentKey)
    .reduce((s, p) => s + p.amount, 0)

  const pending = payments.filter((p) => p.status === 'pending')
  const pendingAmount = pending.reduce((s, p) => s + p.amount, 0)
  const avgPayment = paid.length ? Math.round(totalRevenue / paid.length) : 0

  /* Son 6 ayın gəliri */
  const monthly = [] as { month: string; value: number }[]
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthly.push({
      month: MONTHS_SHORT_AZ[d.getMonth()],
      value: paid.filter((p) => p.date.slice(0, 7) === key).reduce((s, p) => s + p.amount, 0),
    })
  }

  /* Kurs üzrə gəlir */
  const revenueByCourse = courses
    .map((c) => ({
      id: c.id,
      title: c.title,
      revenue: paid.filter((p) => p.courseId === c.id).reduce((s, p) => s + p.amount, 0),
    }))
    .filter((c) => c.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)

  const maxRevenue = revenueByCourse[0]?.revenue ?? 0
  const pieData = revenueByCourse.slice(0, 6)

  if (isLoading) return <Loader label="Gəlir məlumatları yüklənir..." />

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Wallet className="h-6 w-6" />}
        title="Gəlir & Ödənişlər"
        subtitle="Kurslarınız üzrə maliyyə göstəriciləri və ödəniş tarixçəsi."
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ümumi gəlir" value={formatAZN(totalRevenue)} icon={<Wallet className="h-5 w-5" />} tone="emerald" />
        <StatCard
          label="Bu ay"
          value={formatAZN(monthRevenue)}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="brand"
          hint={MONTHS_SHORT_AZ[now.getMonth()]}
        />
        <StatCard
          label="Gözləyən ödənişlər"
          value={`${pending.length} / ${formatAZN(pendingAmount)}`}
          icon={<Clock className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          label="Orta ödəniş məbləği"
          value={formatAZN(avgPayment)}
          icon={<Coins className="h-5 w-5" />}
          tone="accent"
        />
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-6 w-6" />}
          title="Ödəniş tapılmadı"
          message="Kurslarınıza aid ödənişlər burada görünəcək."
        />
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
              <Panel className="animate-fade-up">
                <SectionTitle
                  title="Aylıq gəlir"
                  subtitle="Son 6 ay üzrə ödənilmiş məbləğlər"
                  icon={<TrendingUp className="h-5 w-5" />}
                />
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.7} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(value) => [formatAZN(Number(value)), 'Gəlir']}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        fill="url(#revenueGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel className="animate-fade-up animate-delay-100">
                <SectionTitle
                  title="Kurslar üzrə gəlir payı"
                  subtitle="Ən gəlirli kurslar"
                  icon={<Coins className="h-5 w-5" />}
                />
                {pieData.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">Məlumat yoxdur.</p>
                ) : (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="revenue"
                          nameKey="title"
                          innerRadius={70}
                          outerRadius={110}
                          paddingAngle={3}
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={entry.id} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={TOOLTIP_STYLE}
                          formatter={(value) => [formatAZN(Number(value)), 'Gəlir']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Panel>
            </div>

            <div className="space-y-6">
              <Panel className="animate-fade-up animate-delay-100">
                <SectionTitle
                  title="Top kurslar"
                  subtitle="Gəlirə görə sıralanıb"
                  icon={<Coins className="h-5 w-5" />}
                />
                {revenueByCourse.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">Ödənişli kurs yoxdur.</p>
                ) : (
                  <div className="space-y-4">
                    {revenueByCourse.map((c) => (
                      <div key={c.id}>
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <span className="truncate text-sm font-semibold text-white">{c.title}</span>
                          <span className="shrink-0 text-sm font-bold text-emerald-300">
                            {formatAZN(c.revenue)}
                          </span>
                        </div>
                        <Progress value={percent(c.revenue, maxRevenue)} tone="success" />
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </div>
          </div>

          <Panel className="animate-fade-up animate-delay-200">
            <SectionTitle
              title="Ödəniş tarixçəsi"
              subtitle={`${payments.length} ödəniş`}
              icon={<Receipt className="h-5 w-5" />}
            />
            <TableWrap>
              <thead>
                <tr>
                  <Th>Tarix</Th>
                  <Th>Tələbə</Th>
                  <Th>Kurs</Th>
                  <Th>Məbləğ</Th>
                  <Th>Üsul</Th>
                  <Th>Status</Th>
                  <Th>Faktura</Th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const student = userMap.get(p.studentId)
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-white/[0.03]">
                      <Td>{formatDate(p.date)}</Td>
                      <Td>
                        <span className="font-semibold text-white">
                          {student?.fullName ?? 'Naməlum tələbə'}
                        </span>
                      </Td>
                      <Td>{courseMap.get(p.courseId)?.title ?? 'Kurs silinib'}</Td>
                      <Td>
                        <span className="font-bold text-white">{formatAZN(p.amount)}</span>
                      </Td>
                      <Td>{METHOD_LABEL[p.method]}</Td>
                      <Td>
                        <Badge tone={STATUS_TONE[p.status]}>{PAYMENT_STATUS_LABEL[p.status]}</Badge>
                      </Td>
                      <Td>
                        <span className="font-mono text-xs text-slate-400">{p.invoiceNo}</span>
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </TableWrap>
          </Panel>
        </>
      )}
    </div>
  )
}
