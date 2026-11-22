import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle,
  CircleCheckBig,
  ClipboardList,
  Clock,
  Download,
  Eye,
  Star,
  Trash2,
  XCircle,
} from 'lucide-react'
import type { Enrollment, EnrollmentStatus } from '../../types'
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
  Progress,
  SectionTitle,
  Select,
  TableWrap,
  Tabs,
  Td,
  Th,
} from '../../components/ui'
import { PageHeader, StatCard } from '../../components/common'
import { useAppDispatch } from '../../app/hooks'
import { pushToast } from '../../features/ui/uiSlice'
import {
  useDeleteEnrollmentMutation,
  useGetCoursesQuery,
  useGetEnrollmentsQuery,
  useGetUsersQuery,
  useUpdateEnrollmentMutation,
} from '../../features/api/apiSlice'
import {
  ENROLLMENT_STATUS_LABEL,
  MODE_LABEL,
  SLOT_LABEL,
  SLOT_SHORT,
  dayLabel,
  formatAZN,
  formatDate,
  getErrMsg,
  packageOf,
} from '../../lib/utils'

const PAGE_SIZE = 8

const PACKAGE_TONE: Record<string, 'accent' | 'brand' | 'neon'> = {
  start: 'accent',
  pro: 'brand',
  elite: 'neon',
}

const STATUS_TONE: Record<EnrollmentStatus, 'warning' | 'success' | 'brand' | 'danger'> = {
  pending: 'warning',
  active: 'success',
  completed: 'brand',
  cancelled: 'danger',
}

export default function AdminEnrollments() {
  const dispatch = useAppDispatch()

  const { data: enrollments = [], isLoading } = useGetEnrollmentsQuery(undefined)
  const { data: users = [] } = useGetUsersQuery()
  const { data: courses = [] } = useGetCoursesQuery()
  const [updateEnrollment] = useUpdateEnrollmentMutation()
  const [deleteEnrollment] = useDeleteEnrollmentMutation()

  const [statusTab, setStatusTab] = useState<'all' | EnrollmentStatus>('all')
  const [courseFilter, setCourseFilter] = useState('')
  const [modeFilter, setModeFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [gradeTarget, setGradeTarget] = useState<Enrollment | null>(null)
  const [gradeValue, setGradeValue] = useState('')
  const [viewTarget, setViewTarget] = useState<Enrollment | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Enrollment | null>(null)

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])
  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses])

  useEffect(() => {
    setPage(1)
  }, [statusTab, courseFilter, modeFilter, search])

  const counts = useMemo(
    () => ({
      all: enrollments.length,
      active: enrollments.filter((e) => e.status === 'active').length,
      completed: enrollments.filter((e) => e.status === 'completed').length,
      cancelled: enrollments.filter((e) => e.status === 'cancelled').length,
      pending: enrollments.filter((e) => e.status === 'pending').length,
    }),
    [enrollments],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return enrollments.filter((e) => {
      if (statusTab !== 'all' && e.status !== statusTab) return false
      if (courseFilter && e.courseId !== courseFilter) return false
      if (modeFilter && e.mode !== modeFilter) return false
      if (q) {
        const student = userMap.get(e.studentId)?.fullName.toLowerCase() ?? ''
        const course = courseMap.get(e.courseId)?.title.toLowerCase() ?? ''
        if (!student.includes(q) && !course.includes(q)) return false
      }
      return true
    })
  }, [enrollments, statusTab, courseFilter, modeFilter, search, userMap, courseMap])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const patch = async (id: string, data: Partial<Enrollment>, message: string) => {
    try {
      await updateEnrollment({ id, patch: data }).unwrap()
      dispatch(pushToast({ type: 'success', title: 'Yeniləndi', message }))
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const openGrade = (e: Enrollment) => {
    setGradeTarget(e)
    setGradeValue(e.grade === null ? '' : String(e.grade))
  }

  const handleGrade = async () => {
    if (!gradeTarget) return
    await patch(
      gradeTarget.id,
      { grade: gradeValue.trim() === '' ? null : Number(gradeValue) },
      'Bal yeniləndi.',
    )
    setGradeTarget(null)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteEnrollment(deleteTarget.id).unwrap()
      setDeleteTarget(null)
      dispatch(pushToast({ type: 'success', title: 'Silindi', message: 'Qeydiyyat silindi.' }))
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const handleExport = () => {
    const header = [
      'Tələbə',
      'Kurs',
      'Paket',
      'Rejim',
      'Kampus',
      'Cədvəl',
      'Başlama tarixi',
      'Məbləğ',
      'İrəliləyiş',
      'Bal',
      'Status',
    ]
    const rows = filtered.map((e) => [
      userMap.get(e.studentId)?.fullName ?? '',
      courseMap.get(e.courseId)?.title ?? '',
      packageOf(e.packageTier).name,
      MODE_LABEL[e.mode],
      e.campus ?? '',
      `${SLOT_SHORT[e.slot]} (${e.days.map((d) => dayLabel(d)).join(' ')})`,
      e.startDate,
      String(e.amount),
      `${e.progress}%`,
      e.grade === null ? '' : String(e.grade),
      ENROLLMENT_STATUS_LABEL[e.status],
    ])
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'qeydiyyatlar.csv'
    a.click()
    URL.revokeObjectURL(url)
    dispatch(pushToast({ type: 'success', title: 'İxrac edildi', message: 'CSV faylı yükləndi.' }))
  }

  if (isLoading) return <Loader label="Qeydiyyatlar yüklənir..." />

  return (
    <div className="space-y-7">
      <PageHeader
        icon={<ClipboardList className="h-6 w-6" />}
        title="Qeydiyyatlar"
        subtitle={`Platformada cəmi ${enrollments.length} qeydiyyat mövcuddur`}
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
          label="Ümumi qeydiyyat"
          value={counts.all}
          icon={<ClipboardList className="h-5 w-5" />}
          tone="brand"
        />
        <StatCard
          label="Aktiv"
          value={counts.active}
          icon={<CheckCircle className="h-5 w-5" />}
          tone="emerald"
        />
        <StatCard
          label="Tamamlanan"
          value={counts.completed}
          icon={<CircleCheckBig className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="Ləğv edilən"
          value={counts.cancelled}
          icon={<XCircle className="h-5 w-5" />}
          tone="rose"
        />
        <StatCard
          label="Gözləmədə"
          value={counts.pending}
          icon={<Clock className="h-5 w-5" />}
          tone="amber"
        />
      </div>

      <Panel className="animate-fade-up animate-delay-100 space-y-4">
        <Tabs
          value={statusTab}
          onChange={setStatusTab}
          tabs={[
            { value: 'all', label: 'Hamısı', count: counts.all },
            { value: 'active', label: 'Aktiv', count: counts.active },
            { value: 'pending', label: 'Gözləmədə', count: counts.pending },
            { value: 'completed', label: 'Tamamlanan', count: counts.completed },
            { value: 'cancelled', label: 'Ləğv edilən', count: counts.cancelled },
          ]}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
            <option value="">Bütün kurslar</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
          <Select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}>
            <option value="">Bütün rejimlər</option>
            <option value="online">Onlayn</option>
            <option value="offline">Oflayn</option>
            <option value="hybrid">Hibrid</option>
          </Select>
          <Input
            placeholder="Tələbə və ya kurs ilə axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Panel>

      {pageRows.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-6 w-6" />}
          title="Qeydiyyat tapılmadı"
          message="Filtrləri dəyişərək yenidən cəhd edin."
        />
      ) : (
        <Panel className="animate-fade-up animate-delay-200">
          <TableWrap>
            <thead>
              <tr>
                <Th>Tələbə</Th>
                <Th>Kurs</Th>
                <Th>Paket</Th>
                <Th>Rejim</Th>
                <Th>Cədvəl</Th>
                <Th>Məbləğ</Th>
                <Th>İrəliləyiş</Th>
                <Th>Bal</Th>
                <Th>Status</Th>
                <Th className="text-right">Əməliyyatlar</Th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((e) => {
                const student = userMap.get(e.studentId)
                const course = courseMap.get(e.courseId)
                return (
                  <tr key={e.id} className="transition-colors hover:bg-white/[0.03]">
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={student?.fullName ?? 'Tələbə'}
                          gradient={student?.avatar}
                          size={36}
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
                      <Badge tone={PACKAGE_TONE[e.packageTier]}>
                        {packageOf(e.packageTier).name}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="text-sm">{MODE_LABEL[e.mode]}</div>
                      {e.campus && <div className="text-xs text-slate-500">{e.campus}</div>}
                    </Td>
                    <Td>
                      <div className="text-sm">{SLOT_SHORT[e.slot]}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {e.days.map((d) => (
                          <span
                            key={d}
                            className="rounded-md bg-white/8 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300"
                          >
                            {dayLabel(d)}
                          </span>
                        ))}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">{formatDate(e.startDate)}</div>
                    </Td>
                    <Td>
                      <span className="font-semibold text-white">{formatAZN(e.amount)}</span>
                    </Td>
                    <Td className="min-w-[130px]">
                      <Progress value={e.progress} showLabel />
                    </Td>
                    <Td>{e.grade === null ? '—' : e.grade}</Td>
                    <Td>
                      <select
                        value={e.status}
                        onChange={(ev) =>
                          patch(
                            e.id,
                            { status: ev.target.value as EnrollmentStatus },
                            'Status yeniləndi.',
                          )
                        }
                        className="rounded-lg border border-white/12 bg-ink-900/70 px-2 py-1 text-xs text-white outline-none"
                      >
                        {(Object.keys(ENROLLMENT_STATUS_LABEL) as EnrollmentStatus[]).map((s) => (
                          <option key={s} value={s}>
                            {ENROLLMENT_STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="xs"
                          variant="ghost"
                          leftIcon={<Star className="h-3.5 w-3.5" />}
                          onClick={() => openGrade(e)}
                        >
                          Bal ver
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          leftIcon={<Eye className="h-3.5 w-3.5" />}
                          onClick={() => setViewTarget(e)}
                        >
                          Bax
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          className="text-rose-300"
                          leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                          onClick={() => setDeleteTarget(e)}
                        >
                          Sil
                        </Button>
                      </div>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </TableWrap>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Səhifə {safePage} / {totalPages} • {filtered.length} nəticə
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
              >
                Əvvəlki
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
              >
                Sonrakı
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {/* Bal vermə modalı */}
      <Modal
        open={Boolean(gradeTarget)}
        onClose={() => setGradeTarget(null)}
        title="Bal ver"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setGradeTarget(null)}>
              Ləğv et
            </Button>
            <Button onClick={handleGrade}>Yadda saxla</Button>
          </>
        }
      >
        <Input
          label="Bal (0–100)"
          type="number"
          hint="Boş buraxsanız bal silinəcək."
          value={gradeValue}
          onChange={(e) => setGradeValue(e.target.value)}
        />
      </Modal>

      {/* Detal modalı */}
      <Modal
        open={Boolean(viewTarget)}
        onClose={() => setViewTarget(null)}
        title="Qeydiyyat detalları"
        size="lg"
      >
        {viewTarget && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar
                name={userMap.get(viewTarget.studentId)?.fullName ?? 'Tələbə'}
                gradient={userMap.get(viewTarget.studentId)?.avatar}
                size={48}
                ring
              />
              <div>
                <p className="font-bold text-white">
                  {userMap.get(viewTarget.studentId)?.fullName ?? 'Naməlum'}
                </p>
                <p className="text-sm text-slate-400">
                  {courseMap.get(viewTarget.courseId)?.title ?? 'Kurs'}
                </p>
              </div>
              <Badge tone={STATUS_TONE[viewTarget.status]} className="ml-auto">
                {ENROLLMENT_STATUS_LABEL[viewTarget.status]}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">Paket</p>
                <p className="font-semibold text-white">
                  {packageOf(viewTarget.packageTier).name}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">Rejim</p>
                <p className="font-semibold text-white">
                  {MODE_LABEL[viewTarget.mode]}
                  {viewTarget.campus ? ` • ${viewTarget.campus}` : ''}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">Cədvəl</p>
                <p className="font-semibold text-white">{SLOT_LABEL[viewTarget.slot]}</p>
                <p className="text-xs text-slate-400">
                  {viewTarget.days.map((d) => dayLabel(d)).join(', ')}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">Başlama tarixi</p>
                <p className="font-semibold text-white">{formatDate(viewTarget.startDate)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">Ödəniş məbləği</p>
                <p className="font-semibold text-white">{formatAZN(viewTarget.amount)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">Test balı</p>
                <p className="font-semibold text-white">{viewTarget.quizScore}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">Davamiyyət</p>
                <p className="font-semibold text-white">{viewTarget.attendance}%</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">Bal</p>
                <p className="font-semibold text-white">
                  {viewTarget.grade === null ? 'Verilməyib' : viewTarget.grade}
                </p>
              </div>
            </div>

            <div>
              <SectionTitle title="İrəliləyiş" subtitle={`Tamamlanan dərs: ${viewTarget.completedLessonIds.length}`} />
              <Progress value={viewTarget.progress} showLabel />
            </div>

            {viewTarget.note && (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">Qeyd</p>
                <p className="text-sm text-slate-300">{viewTarget.note}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Qeydiyyatı silmək?"
        message="Qeydiyyat və ona aid ödənişlər silinəcək."
        confirmLabel="Sil"
      />
    </div>
  )
}
