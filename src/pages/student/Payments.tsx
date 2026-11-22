import { useState } from 'react'
import { Clock, CreditCard, Receipt, RotateCcw, Wallet } from 'lucide-react'
import type { Payment, PaymentStatus } from '../../types'
import { useAppDispatch, useAuth } from '../../app/hooks'
import {
  useGetCoursesQuery,
  useGetPaymentsQuery,
  useProcessPaymentMutation,
} from '../../features/api/apiSlice'
import { pushToast } from '../../features/ui/uiSlice'
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Loader,
  Modal,
  Panel,
  TableWrap,
  Td,
  Th,
} from '../../components/ui'
import { PageHeader, StatCard } from '../../components/common'
import {
  TEST_CARDS,
  digitsOnly,
  formatAZN,
  formatCardNumber,
  formatDate,
  formatExpiry,
  getErrMsg,
  PAYMENT_STATUS_LABEL,
} from '../../lib/utils'

const STATUS_TONE: Record<PaymentStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  paid: 'success',
  pending: 'warning',
  failed: 'danger',
  refunded: 'neutral',
}

const METHOD_LABEL: Record<Payment['method'], string> = {
  card: 'Kart',
  installment: 'Hisə-hissə',
}

export default function StudentPayments() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()

  const { data: payments = [], isLoading } = useGetPaymentsQuery(
    { studentId: user?.id },
    { skip: !user?.id },
  )
  const { data: courses = [] } = useGetCoursesQuery()
  const [processPayment, { isLoading: paying }] = useProcessPaymentMutation()

  const [payTarget, setPayTarget] = useState<Payment | null>(null)
  const [receipt, setReceipt] = useState<Payment | null>(null)
  const [card, setCard] = useState({ number: '', holder: '', expiry: '', cvv: '' })
  const [error, setError] = useState('')

  const courseOf = (id: string) => courses.find((c) => c.id === id)

  const paidTotal = payments
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + p.amount, 0)
  const pendingList = payments.filter((p) => p.status === 'pending')
  const pendingTotal = pendingList.reduce((s, p) => s + p.amount, 0)
  const refundedCount = payments.filter((p) => p.status === 'refunded').length

  const openPay = (payment: Payment) => {
    setError('')
    setCard({ number: '', holder: '', expiry: '', cvv: '' })
    setPayTarget(payment)
  }

  const handlePay = async () => {
    if (!payTarget) return
    setError('')
    try {
      const result = await processPayment({
        enrollmentId: payTarget.enrollmentId,
        card,
        method: 'card',
      }).unwrap()
      if (result.ok) {
        dispatch(pushToast({ type: 'success', title: 'Ödəniş uğurlu', message: result.message }))
        setPayTarget(null)
      } else {
        setError(result.message)
      }
    } catch (e) {
      setError(getErrMsg(e))
    }
  }

  const header = (
    <PageHeader
      title="Ödənişlərim"
      subtitle="Kurs ödənişləriniz, fakturalar və qəbzlər bir yerdə"
      icon={<CreditCard className="h-6 w-6" />}
    />
  )

  if (isLoading) {
    return (
      <div className="animate-fade-up">
        {header}
        <Loader label="Ödənişlər yüklənir..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">{header}</div>

      <div className="grid animate-fade-up animate-delay-100 grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Ümumi ödənilmiş"
          value={formatAZN(paidTotal)}
          icon={<Wallet className="h-5 w-5" />}
          tone="emerald"
          hint="Bütün uğurlu ödənişlər"
        />
        <StatCard
          label="Gözləyən ödənişlər"
          value={pendingList.length}
          icon={<Clock className="h-5 w-5" />}
          tone="amber"
          hint={`Cəmi: ${formatAZN(pendingTotal)}`}
        />
        <StatCard
          label="Geri qaytarılanlar"
          value={refundedCount}
          icon={<RotateCcw className="h-5 w-5" />}
          tone="rose"
          hint="Geri qaytarılmış ödənişlər"
        />
      </div>

      <Panel className="animate-fade-up animate-delay-200">
        {payments.length === 0 ? (
          <EmptyState
            title="Ödəniş tapılmadı"
            message="Kursa qeydiyyatdan keçdikdən sonra ödənişləriniz burada görünəcək."
            icon={<CreditCard className="h-6 w-6" />}
          />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Tarix</Th>
                <Th>Kurs</Th>
                <Th>Məbləğ</Th>
                <Th>Ödəniş üsulu</Th>
                <Th>Kart</Th>
                <Th>Status</Th>
                <Th>Faktura</Th>
                <Th>Əməliyyat</Th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <Td className="whitespace-nowrap">{formatDate(p.date)}</Td>
                  <Td className="max-w-[220px]">
                    <span className="line-clamp-1 font-semibold text-white">
                      {courseOf(p.courseId)?.title ?? 'Kurs'}
                    </span>
                    {p.status === 'failed' && p.failReason && (
                      <span className="mt-0.5 block line-clamp-1 text-xs text-rose-400">
                        {p.failReason}
                      </span>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap font-semibold text-white">
                    {formatAZN(p.amount)}
                  </Td>
                  <Td>{METHOD_LABEL[p.method]}</Td>
                  <Td className="whitespace-nowrap">
                    {p.brand} •••• {p.cardLast4}
                  </Td>
                  <Td>
                    <Badge tone={STATUS_TONE[p.status]}>{PAYMENT_STATUS_LABEL[p.status]}</Badge>
                  </Td>
                  <Td className="whitespace-nowrap font-mono text-xs text-slate-400">
                    {p.invoiceNo}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      {p.status === 'pending' && (
                        <Button
                          variant="primary"
                          size="xs"
                          leftIcon={<CreditCard className="h-3.5 w-3.5" />}
                          onClick={() => openPay(p)}
                        >
                          Ödə
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="xs"
                        leftIcon={<Receipt className="h-3.5 w-3.5" />}
                        onClick={() => setReceipt(p)}
                      >
                        Qəbz
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Panel>

      {/* Ödəniş modalı */}
      <Modal
        open={Boolean(payTarget)}
        onClose={() => setPayTarget(null)}
        title="Ödənişi tamamla"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPayTarget(null)}>
              Ləğv et
            </Button>
            <Button
              variant="primary"
              loading={paying}
              onClick={handlePay}
              leftIcon={<CreditCard className="h-4 w-4" />}
            >
              {payTarget ? formatAZN(payTarget.amount) : 'Ödə'} ödə
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {payTarget && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs text-slate-400">Ödəniləcək kurs</p>
              <p className="mt-0.5 text-sm font-bold text-white">
                {courseOf(payTarget.courseId)?.title ?? 'Kurs'}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {TEST_CARDS.filter((c) => c.ok)
              .slice(0, 3)
              .map((tc) => (
                <button
                  key={tc.number}
                  type="button"
                  onClick={() => setCard((prev) => ({ ...prev, number: tc.number }))}
                  className="glass rounded-xl px-3 py-2 text-left text-xs transition-all hover:bg-white/10"
                >
                  <span className="block font-mono text-[11px] text-white">{tc.number}</span>
                  <span className="block text-[10px] text-slate-400">{tc.label}</span>
                </button>
              ))}
          </div>

          <Input
            label="Kart nömrəsi"
            value={card.number}
            onChange={(e) => setCard((prev) => ({ ...prev, number: formatCardNumber(e.target.value) }))}
            placeholder="4242 4242 4242 4242"
            inputMode="numeric"
          />
          <Input
            label="Ad Soyad"
            value={card.holder}
            onChange={(e) => setCard((prev) => ({ ...prev, holder: e.target.value }))}
            placeholder="AD SOYAD"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="AA/İİ"
              value={card.expiry}
              onChange={(e) => setCard((prev) => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
              placeholder="AA/İİ"
              inputMode="numeric"
            />
            <Input
              label="CVV"
              value={card.cvv}
              onChange={(e) =>
                setCard((prev) => ({ ...prev, cvv: digitsOnly(e.target.value).slice(0, 4) }))
              }
              placeholder="•••"
              inputMode="numeric"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300">
              {error}
            </div>
          )}
        </div>
      </Modal>

      {/* Qəbz modalı */}
      <Modal
        open={Boolean(receipt)}
        onClose={() => setReceipt(null)}
        title="Qəbz"
        footer={
          <Button variant="ghost" onClick={() => setReceipt(null)}>
            Bağla
          </Button>
        }
      >
        {receipt && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-extrabold text-white">
                  Code<span className="gradient-text">Via</span> Academy
                </p>
                <p className="text-xs text-slate-400">Bakı, Azərbaycan · LMS Ödəniş qəbzi</p>
              </div>
              <Badge tone={STATUS_TONE[receipt.status]}>
                {PAYMENT_STATUS_LABEL[receipt.status]}
              </Badge>
            </div>

            <div className="divider" />

            <div className="space-y-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Faktura nömrəsi</span>
                <span className="font-mono text-white">{receipt.invoiceNo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tarix</span>
                <span className="text-white">{formatDate(receipt.date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Kurs</span>
                <span className="max-w-[60%] truncate text-white">
                  {courseOf(receipt.courseId)?.title ?? 'Kurs'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Ödəniş üsulu</span>
                <span className="text-white">{METHOD_LABEL[receipt.method]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Kart</span>
                <span className="text-white">
                  {receipt.brand} •••• {receipt.cardLast4}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-brand-grad-soft px-4 py-3">
              <span className="text-sm font-semibold text-slate-200">Ümumi məbləğ</span>
              <span className="text-lg font-extrabold text-white">{formatAZN(receipt.amount)}</span>
            </div>

            <p className="text-center text-[11px] text-slate-500">
              Bu qəbz nümunə məqsədi ilə göstərilir.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
