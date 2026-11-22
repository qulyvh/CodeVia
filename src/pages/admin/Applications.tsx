import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  BadgeCheck,
  Briefcase,
  CalendarClock,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Languages,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Star,
  UserCheck,
  UserX,
  Wallet,
} from 'lucide-react'
import type { User } from '../../types'
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Input,
  Loader,
  Modal,
  SectionTitle,
  Tabs,
  Textarea,
} from '../../components/ui'
import type { BadgeTone } from '../../components/ui'
import { PageHeader, StatCard } from '../../components/common'
import { useAppDispatch } from '../../app/hooks'
import { pushToast } from '../../features/ui/uiSlice'
import {
  useApproveTeacherMutation,
  useGetUsersQuery,
  useRejectTeacherMutation,
} from '../../features/api/apiSlice'
import { formatAZN, getErrMsg, relativeTime, USER_STATUS_LABEL } from '../../lib/utils'

type AppTab = 'pending' | 'active' | 'rejected'

const TAB_STATUS: Record<AppTab, User['status']> = {
  pending: 'pending',
  active: 'active',
  rejected: 'rejected',
}

const STATUS_TONE: Record<string, BadgeTone> = {
  pending: 'warning',
  active: 'success',
  rejected: 'danger',
  blocked: 'danger',
}

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
      <span className="mt-0.5 text-brand-300">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  )
}

export default function AdminApplications() {
  const dispatch = useAppDispatch()

  const { data: users = [], isLoading } = useGetUsersQuery()
  const [approveTeacher, { isLoading: approving }] = useApproveTeacherMutation()
  const [rejectTeacher, { isLoading: rejecting }] = useRejectTeacherMutation()

  const [tab, setTab] = useState<AppTab>('pending')
  const [detailTarget, setDetailTarget] = useState<User | null>(null)
  const [approveTarget, setApproveTarget] = useState<User | null>(null)
  const [rejectTarget, setRejectTarget] = useState<User | null>(null)
  const [approveNote, setApproveNote] = useState('')
  const [rejectNote, setRejectNote] = useState('')

  const applications = useMemo(
    () => users.filter((u) => u.role === 'teacher' && u.appliedAt !== undefined),
    [users],
  )

  const pending = applications.filter((u) => u.status === 'pending')
  const approved = applications.filter((u) => u.status === 'active')
  const rejected = applications.filter((u) => u.status === 'rejected')

  const list = useMemo(
    () => applications.filter((u) => u.status === TAB_STATUS[tab]),
    [applications, tab],
  )

  const handleApprove = async () => {
    if (!approveTarget) return
    try {
      await approveTeacher({ id: approveTarget.id, note: approveNote.trim() || undefined }).unwrap()
      setApproveTarget(null)
      setApproveNote('')
      dispatch(
        pushToast({
          type: 'success',
          title: 'Müraciət təsdiqləndi',
          message: `${approveTarget.fullName} artıq sistemə giriş edə bilər.`,
        }),
      )
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const handleReject = async () => {
    if (!rejectTarget) return
    if (!rejectNote.trim()) {
      dispatch(pushToast({ type: 'error', title: 'Rədd səbəbini qeyd edin' }))
      return
    }
    try {
      await rejectTeacher({ id: rejectTarget.id, note: rejectNote.trim() }).unwrap()
      setRejectTarget(null)
      setRejectNote('')
      dispatch(
        pushToast({
          type: 'success',
          title: 'Müraciət rədd edildi',
          message: `${rejectTarget.fullName} adlı müraciət rədd olundu.`,
        }),
      )
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  if (isLoading) return <Loader label="Müraciətlər yüklənir..." />

  return (
    <div className="space-y-7">
      <PageHeader
        icon={<ClipboardCheck className="h-6 w-6" />}
        title="Müraciətlər"
        subtitle="Müəllim müraciətlərini nəzərdən keçirin, CV-ləri yoxlayın və təsdiqləyin"
      />

      <div className="grid animate-fade-up gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Təsdiq gözləyən"
          value={pending.length}
          icon={<CalendarClock className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          label="Təsdiqlənmiş"
          value={approved.length}
          icon={<BadgeCheck className="h-5 w-5" />}
          tone="emerald"
        />
        <StatCard
          label="Rədd edilmiş"
          value={rejected.length}
          icon={<UserX className="h-5 w-5" />}
          tone="rose"
        />
        <StatCard
          label="Ümumi müraciət"
          value={applications.length}
          icon={<ClipboardCheck className="h-5 w-5" />}
          tone="brand"
        />
      </div>

      <Tabs<AppTab>
        className="animate-fade-up animate-delay-100"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'pending', label: 'Təsdiq gözləyən', count: pending.length },
          { value: 'active', label: 'Təsdiqlənmiş', count: approved.length },
          { value: 'rejected', label: 'Rədd edilmiş', count: rejected.length },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="h-6 w-6" />}
          title="Müraciət yoxdur"
          message={
            tab === 'pending'
              ? 'Hazırda təsdiq gözləyən müəllim müraciəti yoxdur.'
              : 'Bu kateqoriyada müraciət tapılmadı.'
          }
        />
      ) : (
        <div className="grid animate-fade-up animate-delay-200 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((t) => (
            <div key={t.id} className="panel flex flex-col gap-4 p-5">
              <div className="flex items-start gap-3">
                <Avatar name={t.fullName} gradient={t.avatar} src={t.photo} size={52} ring />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-white">{t.fullName}</p>
                  <p className="truncate text-xs text-slate-400">
                    {t.specialization || 'İxtisas göstərilməyib'}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {t.appliedAt ? relativeTime(t.appliedAt) : '—'}
                  </p>
                </div>
                <Badge tone={STATUS_TONE[t.status] ?? 'neutral'}>{USER_STATUS_LABEL[t.status]}</Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge tone="brand" icon={<Briefcase className="h-3 w-3" />}>
                  {t.experienceYears ?? 0} il təcrübə
                </Badge>
                {t.hourlyRate ? (
                  <Badge tone="success" icon={<Wallet className="h-3 w-3" />}>
                    {formatAZN(t.hourlyRate)}/saat
                  </Badge>
                ) : null}
                {t.cvFileName || t.cvText ? (
                  <Badge tone="sky" icon={<FileText className="h-3 w-3" />}>
                    CV əlavə edilib
                  </Badge>
                ) : null}
              </div>

              {t.skills && t.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {t.skills.slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-slate-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {t.approvalNote && (
                <p className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Qeyd: </span>
                  {t.approvalNote}
                </p>
              )}

              <div className="mt-auto flex flex-wrap gap-2">
                <Button size="xs" variant="secondary" onClick={() => setDetailTarget(t)}>
                  Ətraflı bax
                </Button>
                {t.status !== 'active' && (
                  <Button
                    size="xs"
                    variant="success"
                    leftIcon={<UserCheck className="h-3.5 w-3.5" />}
                    onClick={() => {
                      setApproveTarget(t)
                      setApproveNote('')
                    }}
                  >
                    Təsdiqlə
                  </Button>
                )}
                {t.status !== 'rejected' && (
                  <Button
                    size="xs"
                    variant="ghost"
                    className="text-rose-300"
                    leftIcon={<UserX className="h-3.5 w-3.5" />}
                    onClick={() => {
                      setRejectTarget(t)
                      setRejectNote('')
                    }}
                  >
                    Rədd et
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ətraflı baxış modalı */}
      <Modal
        open={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        title={detailTarget?.fullName ?? 'Müraciət'}
        size="lg"
        footer={
          detailTarget && (
            <>
              {detailTarget.status !== 'active' && (
                <Button
                  variant="success"
                  leftIcon={<UserCheck className="h-4 w-4" />}
                  onClick={() => {
                    const t = detailTarget
                    setDetailTarget(null)
                    setApproveTarget(t)
                    setApproveNote('')
                  }}
                >
                  Təsdiqlə
                </Button>
              )}
              {detailTarget.status !== 'rejected' && (
                <Button
                  variant="danger"
                  leftIcon={<UserX className="h-4 w-4" />}
                  onClick={() => {
                    const t = detailTarget
                    setDetailTarget(null)
                    setRejectTarget(t)
                    setRejectNote('')
                  }}
                >
                  Rədd et
                </Button>
              )}
            </>
          )
        }
      >
        {detailTarget && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar
                name={detailTarget.fullName}
                gradient={detailTarget.avatar}
                src={detailTarget.photo}
                size={64}
                ring
              />
              <div className="min-w-0">
                <p className="text-lg font-bold text-white">{detailTarget.fullName}</p>
                <p className="text-sm text-slate-400">
                  {detailTarget.specialization || 'İxtisas göstərilməyib'}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <Badge tone={STATUS_TONE[detailTarget.status] ?? 'neutral'}>
                    {USER_STATUS_LABEL[detailTarget.status]}
                  </Badge>
                  {detailTarget.rating ? <Badge tone="warning">{detailTarget.rating.toFixed(1)} ★</Badge> : null}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow icon={<Mail className="h-4 w-4" />} label="E-poçt" value={detailTarget.email} />
              <DetailRow icon={<Phone className="h-4 w-4" />} label="Telefon" value={detailTarget.phone || '—'} />
              <DetailRow icon={<MapPin className="h-4 w-4" />} label="Şəhər" value={detailTarget.city || '—'} />
              <DetailRow
                icon={<Briefcase className="h-4 w-4" />}
                label="Təcrübə"
                value={`${detailTarget.experienceYears ?? 0} il`}
              />
              <DetailRow
                icon={<GraduationCap className="h-4 w-4" />}
                label="Təhsil"
                value={detailTarget.education || '—'}
              />
              <DetailRow
                icon={<Wallet className="h-4 w-4" />}
                label="Saatlıq haqqı"
                value={detailTarget.hourlyRate ? formatAZN(detailTarget.hourlyRate) : '—'}
              />
              <DetailRow
                icon={<CalendarClock className="h-4 w-4" />}
                label="Müraciət tarixi"
                value={detailTarget.appliedAt ? relativeTime(detailTarget.appliedAt) : '—'}
              />
              <DetailRow
                icon={<Languages className="h-4 w-4" />}
                label="Dillər"
                value={detailTarget.languages?.length ? detailTarget.languages.join(', ') : '—'}
              />
            </div>

            {detailTarget.skills && detailTarget.skills.length > 0 && (
              <div>
                <SectionTitle title="Bacarıqlar" subtitle="Müraciətdə göstərilən texnologiyalar" icon={<Sparkles className="h-5 w-5" />} />
                <div className="flex flex-wrap gap-2">
                  {detailTarget.skills.map((s) => (
                    <Badge key={s} tone="brand">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {detailTarget.bio && (
              <div>
                <SectionTitle title="Təqdimat" icon={<Star className="h-5 w-5" />} />
                <p className="text-sm leading-relaxed text-slate-300">{detailTarget.bio}</p>
              </div>
            )}

            <div>
              <SectionTitle
                title="CV / Təcrübə mətni"
                subtitle={detailTarget.cvFileName || 'Fayl adı göstərilməyib'}
                icon={<FileText className="h-5 w-5" />}
              />
              {detailTarget.cvText ? (
                <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-ink-900/60 p-4 text-sm leading-relaxed text-slate-300">
                  {detailTarget.cvText}
                </pre>
              ) : (
                <p className="text-sm text-slate-500">CV mətni əlavə edilməyib.</p>
              )}
            </div>

            {detailTarget.approvalNote && (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-300">
                <span className="font-semibold text-slate-200">Admin qeydi: </span>
                {detailTarget.approvalNote}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Təsdiq modalı */}
      <Modal
        open={Boolean(approveTarget)}
        onClose={() => {
          setApproveTarget(null)
          setApproveNote('')
        }}
        title="Müraciəti təsdiqlə"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setApproveTarget(null)
                setApproveNote('')
              }}
            >
              Ləğv et
            </Button>
            <Button variant="success" loading={approving} onClick={handleApprove}>
              Təsdiqlə
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-white">{approveTarget?.fullName}</span> adlı müəllim
          müraciətini təsdiqləyirsiniz. Təsdiqdən sonra müəllim sistemə daxil ola biləcək.
        </p>
        <div className="mt-4">
          <Textarea
            label="Qeyd (istəyə bağlı)"
            value={approveNote}
            onChange={(e) => setApproveNote(e.target.value)}
            placeholder="Məs. CV-ni nəzərdən keçirdim, təsdiqləyirəm."
          />
        </div>
      </Modal>

      {/* Rədd modalı */}
      <Modal
        open={Boolean(rejectTarget)}
        onClose={() => {
          setRejectTarget(null)
          setRejectNote('')
        }}
        title="Müraciəti rədd et"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setRejectTarget(null)
                setRejectNote('')
              }}
            >
              Ləğv et
            </Button>
            <Button variant="danger" loading={rejecting} onClick={handleReject}>
              Rədd et
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-white">{rejectTarget?.fullName}</span> adlı müraciəti
          rədd edirsiniz. Namizəd bu qərar haqqında məlumatlandırılacaq.
        </p>
        <div className="mt-4">
          <Input
            label="Rədd səbəbi"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Məs. CV tələblərə uyğun deyil"
            required
          />
        </div>
      </Modal>
    </div>
  )
}
