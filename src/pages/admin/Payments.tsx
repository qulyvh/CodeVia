import { useEffect, useMemo, useState } from 'react'
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
import {
  Clock,
  Coins,
  CreditCard,
  Download,
  Eye,
  Printer,
  Receipt,
  RotateCcw,
  Wallet,
  XCircle,
} from 'lucide-react'
import type { Payment, PaymentStatus } from '../../types'
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Input,
  Loader,
  Modal,
  Panel,
  SectionTitle,
  Select,
  TableWrap,
  Tabs,
  Td,
  Th,
} from '../../components/ui'
import { Logo, PageHeader, StatCard } from '../../components/common'
import { useAppDispatch } from '../../app/hooks'
import { pushToast } from '../../features/ui/uiSlice'
import {
  useGetCoursesQuery,
  useGetPaymentsQuery,
  useGetUsersQuery,
  useRefundPaymentMutation,
  useUpdateEnrollmentMutation,
} from '../../features/api/apiSlice'
import {
  MONTHS_SHORT_AZ,
  PAYMENT_STATUS_LABEL,
  formatAZN,
  formatDate,
  getErrMsg,
} from '../../lib/utils'

const STATUS_TONE: Record<PaymentStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  paid: 'success',
  pending: 'warning',
  failed: 'danger',
  refunded: 'neutral',
}

const STATUS_COLOR: Record<PaymentStatus, string> = {
  paid: '#10b981',
  pending: '#f59e0b',
  failed: '#f43f5e',
  refunded: '#64748b',
}

const METHOD_LABEL: Record<Payment['method'], string> = {
  card: 'Kart',
  installment: 'Hisə-hissə',
}

const TOOLTIP_STYLE = {
  background: '#0d1326',
  border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 12,
  color: '#fff',
}

export default function AdminPayments() {
  const dispatch = useAppDispatch()

  const { data: payments = [], isLoading } = useGetPaymentsQuery(undefined)
  const { data: users = [] } = useGetUsersQuery()
  const { data: courses = [] } = useGetCoursesQuery()
  const [refundPayment, { isLoading: refunding }] = useRefundPaymentMutation()
  const [updateEnrollment] = useUpdateEnrollmentMutation()

  const [statusTab, setStatusTab] = useState<'all' | PaymentStatus>('all')
  const [methodFilter, setMethodFilter] = useState('')
  const [search, setSearch] = useState('')

  const [viewTarget, setViewTarget] = useState<Payment | null>(null)
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null)

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])
  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses])

  const stats = useMemo(() => {
    const paidList = payments.filter((p) => p.status === 'paid')
    const now = new Date()
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const monthRevenue = paidList
      .filter((p) => p.date.slice(0, 7) === monthKey)
      .reduce((s, p) => s + p.amount, 0)
    const pendingList = payments.filter((p) => p.status === 'pending')
    return {
      revenue: paidList.reduce((s, p) => s + p.amount, 0),
      monthRevenue,
      pendingCount: pendingList.length,
      pendingAmount: pendingList.reduce((s, p) => s + p.amount, 0),
      failedCount: payments.filter((p) => p.status === 'failed').length,
      refundedCount: payments.filter((p) => p.status === 'refunded').length,
    }
  }, [payments])

  const monthly = useMemo(() => {
    const now = new Date()
    const out: { month: string; amount: number }[] = []
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const amount = payments
        .filter((p) => p.status === 'paid' && p.date.slice(0, 7) === key)
        .reduce((s, p) => s + p.amount, 0)
      out.push({ month: MONTHS_SHORT_AZ[d.getMonth()], amount })
    }
    return out
  }, [payments])

  const statusData = useMemo(
    () =>
      (Object.keys(PAYMENT_STATUS_LABEL) as PaymentStatus[]).map((s) => ({
        name: PAYMENT_STATUS_LABEL[s],
        value: payments.filter((p) => p.status === s).length,
        color: STATUS_COLOR[s],
      })),
    [payments],
  )

  const counts = useMemo(
    () => ({
      all: payments.length,
      paid: payments.filter((p) => p.status === 'paid').length,
      pending: payments.filter((p) => p.status === 'pending').length,
      failed: payments.filter((p) => p.status === 'failed').length,
      refunded: payments.filter((p) => p.status === 'refunded').length,
    }),
    [payments],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return payments.filter((p) => {
      if (statusTab !== 'all' && p.status !== statusTab) return false
      if (methodFilter && p.method !== methodFilter) return false
      if (q) {
        const holder = p.cardHolder.toLowerCase()
        const invoice = p.invoiceNo.toLowerCase()
        const last4 = p.cardLast4.toLowerCase()
        if (!holder.includes(q) && !invoice.includes(q) && !last4.includes(q)) return false
      }
      return true
    })
  }, [payments, statusTab, methodFilter, search])

  useEffect(() => {
    setSearch('')
  }, [statusTab])

  const handleExport = () => {
    const header = [
      'Faktura',
      'Tarix',
      'Tələbə',
      'Kurs',
      'Məbləğ',
      'Kart',
      'Kart sahibi',
      'Üsul',
      'Status',
    ]
    const rows = filtered.map((p) => [
      p.invoiceNo,
      p.date,
      userMap.get(p.studentId)?.fullName ?? '',
      courseMap.get(p.courseId)?.title ?? '',
      String(p.amount),
      `${p.brand} •••• ${p.cardLast4}`,
      p.cardHolder,
      METHOD_LABEL[p.method],
      PAYMENT_STATUS_LABEL[p.status],
    ])
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'odenisler.csv'
    a.click()
    URL.revokeObjectURL(url)
    dispatch(pushToast({ type: 'success', title: 'İxrac edildi', message: 'CSV faylı yükləndi.' }))
  }

  const handleRefund = async () => {
    if (!refundTarget) return
    try {
      await refundPayment(refundTarget.id).unwrap()
      await updateEnrollment({
        id: refundTarget.enrollmentId,
        patch: { status: 'pending' },
      }).unwrap()
      setRefundTarget(null)
      dispatch(
        pushToast({
          type: 'success',
          title: 'Geri qaytarıldı',
          message: 'Ödəniş geri qaytarıldı və qeydiyyat gözləmə statusuna keçdi.',
        }),
      )
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  if (isLoading) return <Loader label="Ödənişlər yüklənir..." />

  const totalStatus = statusData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="space-y-7">
      <PageHeader
        icon={<Wallet className="h-6 w-6" />}
        title="Ödənişlər"
        subtitle={`Platformada cəmi ${payments.length} ödəniş əməliyyatı mövcuddur`}
        actions={
          <Button
            variant="secondary"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleExport}
          >
            İxrac (CSV)
          </Button>
        }
      />

      <div className="grid animate-fade-up gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Ümumi gəlir"
          value={formatAZN(stats.revenue)}
          icon={<Coins className="h-5 w-5" />}
          tone="emerald"
          hint="Ödənilmiş ödənişlərin cəmi"
        />
        <StatCard
          label="Bu ay"
          value={formatAZN(stats.monthRevenue)}
          icon={<Wallet className="h-5 w-5" />}
          tone="brand"
          hint="Cari ayın gəliri"
        />
        <StatCard
          label="Gözləmədə"
          value={stats.pendingCount}
          icon={<Clock className="h-5 w-5" />}
          tone="amber"
          hint={formatAZN(stats.pendingAmount)}
        />
        <StatCard
          label="Uğursuz"
          value={stats.failedCount}
          icon={<XCircle className="h-5 w-5" />}
          tone="rose"
          hint="Bank tərəfindən rədd edilmiş"
        />
        <StatCard
          label="Geri qaytarılan"
          value={stats.refundedCount}
          icon={<RotateCcw className="h-5 w-5" />}
          tone="accent"
          hint="İstifadəçiyə qaytarılmış"
        />
      </div>

      <div className="grid animate-fade-up animate-delay-100 gap-5 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <SectionTitle
            title="Aylıq gəlir dinamikası"
            subtitle="Son 6 ay üzrə ödənilmiş məbləğlər"
            icon={<Coins className="h-5 w-5" />}
          />
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value) => [formatAZN(Number(value)), 'Gəlir']}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#paidGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <SectionTitle title="Status bölgüsü" subtitle="Ödənişlərin növünə görə" icon={<Receipt className="h-5 w-5" />} />
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  stroke="none"
                >
                  {statusData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2">
            {statusData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-slate-300">{d.name}</span>
                <span className="ml-auto font-semibold text-white">{d.value}</span>
                <span className="w-10 text-right text-xs text-slate-500">
                  {totalStatus ? Math.round((d.value / totalStatus) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="animate-fade-up animate-delay-200 space-y-4">
        <Tabs
          value={statusTab}
          onChange={setStatusTab}
          tabs={[
            { value: 'all', label: 'Hamısı', count: counts.all },
            { value: 'paid', label: 'Ödənilib', count: counts.paid },
            { value: 'pending', label: 'Gözləmədə', count: counts.pending },
            { value: 'failed', label: 'Uğursuz', count: counts.failed },
            { value: 'refunded', label: 'Geri qaytarılıb', count: counts.refunded },
          ]}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
            <option value="">Bütün üsullar</option>
            <option value="card">Kart</option>
            <option value="installment">Hisə-hissə</option>
          </Select>
          <Input
            placeholder="Faktura, kart və ya sahibi ilə axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Panel>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-6 w-6" />}
          title="Ödəniş tapılmadı"
          message="Filtrləri dəyişərək yenidən cəhd edin."
        />
      ) : (
        <Panel className="animate-fade-up animate-delay-300">
          <TableWrap>
            <thead>
              <tr>
                <Th>Faktura</Th>
                <Th>Tarix</Th>
                <Th>Tələbə</Th>
                <Th>Kurs</Th>
                <Th>Məbləğ</Th>
                <Th>Kart</Th>
                <Th>Üsul</Th>
                <Th>Status</Th>
                <Th className="text-right">Əməliyyatlar</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const student = userMap.get(p.studentId)
                const course = courseMap.get(p.courseId)
                return (
                  <tr
                    key={p.id}
                    className={
                      p.status === 'failed'
                        ? 'bg-rose-500/[0.04] transition-colors hover:bg-rose-500/[0.07]'
                        : 'transition-colors hover:bg-white/[0.03]'
                    }
                  >
                    <Td>
                      <span className="font-mono text-xs font-semibold text-white">{p.invoiceNo}</span>
                    </Td>
                    <Td>
                      <span className="text-xs text-slate-400">{formatDate(p.date)}</span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={student?.fullName ?? 'Tələbə'}
                          gradient={student?.avatar}
                          size={34}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {student?.fullName ?? 'Naməlum'}
                          </p>
                          <p className="truncate text-xs text-slate-400">{student?.email ?? '—'}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span className="text-sm">{course?.title ?? '—'}</span>
                    </Td>
                    <Td>
                      <span className="font-semibold text-white">{formatAZN(p.amount)}</span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1.5 text-sm text-slate-300">
                        <CreditCard className="h-3.5 w-3.5 text-slate-500" />
                        <span>{p.brand}</span>
                        <span className="font-mono text-xs">•••• {p.cardLast4}</span>
                      </div>
                      <p className="mt-0.5 text-xs uppercase text-slate-500">{p.cardHolder || '—'}</p>
                    </Td>
                    <Td>
                      <span className="text-sm">{METHOD_LABEL[p.method]}</span>
                    </Td>
                    <Td>
                      <Badge tone={STATUS_TONE[p.status]}>{PAYMENT_STATUS_LABEL[p.status]}</Badge>
                      {p.status === 'failed' && p.failReason && (
                        <p className="mt-1 max-w-[180px] text-xs text-rose-400">{p.failReason}</p>
                      )}
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="xs"
                          variant="ghost"
                          leftIcon={<Eye className="h-3.5 w-3.5" />}
                          onClick={() => setViewTarget(p)}
                        >
                          Detallar
                        </Button>
                        {p.status === 'paid' && (
                          <Button
                            size="xs"
                            variant="ghost"
                            className="text-rose-300"
                            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                            onClick={() => setRefundTarget(p)}
                          >
                            Geri qaytar
                          </Button>
                        )}
                      </div>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </TableWrap>
          <p className="mt-4 text-xs text-slate-400">{filtered.length} nəticə göstərilir</p>
        </Panel>
      )}

      {/* Faktura (invoice) modalı */}
      <Modal
        open={Boolean(viewTarget)}
        onClose={() => setViewTarget(null)}
        title="Faktura detalları"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setViewTarget(null)}>
              Bağla
            </Button>
            <Button
              variant="secondary"
              leftIcon={<Printer className="h-4 w-4" />}
              onClick={() => window.print()}
            >
              Çap et
            </Button>
          </>
        }
      >
        {viewTarget && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <Logo />
              <div className="text-right">
                <p className="font-mono text-sm font-bold text-white">{viewTarget.invoiceNo}</p>
                <p className="text-xs text-slate-400">{formatDate(viewTarget.date)}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">Tələbə</p>
                <p className="font-semibold text-white">
                  {userMap.get(viewTarget.studentId)?.fullName ?? 'Naməlum'}
                </p>
                <p className="text-xs text-slate-400">
                  {userMap.get(viewTarget.studentId)?.email ?? '—'}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">Kurs</p>
                <p className="font-semibold text-white">
                  {courseMap.get(viewTarget.courseId)?.title ?? '—'}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Ödəniş üsulu</span>
                <span className="text-slate-200">{METHOD_LABEL[viewTarget.method]}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-400">Kart</span>
                <span className="text-slate-200">
                  {viewTarget.brand} •••• {viewTarget.cardLast4}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-400">Kart sahibi</span>
                <span className="uppercase text-slate-200">{viewTarget.cardHolder || '—'}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-sm font-semibold text-slate-300">Ümumi məbləğ</span>
                <span className="text-lg font-extrabold text-white">
                  {formatAZN(viewTarget.amount)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Status</span>
              <Badge tone={STATUS_TONE[viewTarget.status]}>
                {PAYMENT_STATUS_LABEL[viewTarget.status]}
              </Badge>
            </div>

            {viewTarget.status === 'failed' && viewTarget.failReason && (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3">
                <p className="text-xs font-semibold text-rose-300">Uğursuzluq səbəbi</p>
                <p className="mt-1 text-sm text-rose-200">{viewTarget.failReason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(refundTarget)}
        onClose={() => setRefundTarget(null)}
        onConfirm={handleRefund}
        loading={refunding}
        title="Ödənişi geri qaytarmaq?"
        message="Məbləğ tələbəyə geri qaytarılacaq və uyğun qeydiyyat gözləmə statusuna keçəcək."
        confirmLabel="Geri qaytar"
      />
    </div>
  )
}
