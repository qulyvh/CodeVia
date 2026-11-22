import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Award,
  CalendarCheck,
  Flame,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Send,
  UserCircle,
  Users,
} from 'lucide-react'
import type { Course, Enrollment, EnrollmentStatus } from '../../types'
import { useAppDispatch, useAuth } from '../../app/hooks'
import {
  useGetCoursesQuery,
  useGetEnrollmentsQuery,
  useGetUsersQuery,
} from '../../features/api/apiSlice'
import { pushToast } from '../../features/ui/uiSlice'
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Input,
  Loader,
  Modal,
  Panel,
  Progress,
  SectionTitle,
  Select,
  TableWrap,
  Td,
  Textarea,
  Th,
} from '../../components/ui'
import { PageHeader, StatCard } from '../../components/common'
import { ENROLLMENT_STATUS_LABEL, MODE_LABEL } from '../../lib/utils'

const STATUS_TONE = {
  pending: 'warning',
  active: 'success',
  completed: 'brand',
  cancelled: 'danger',
} as const

interface StudentAgg {
  studentId: string
  items: Enrollment[]
  courses: Course[]
  attendance: number
  progress: number
  grade: number | null
  status: EnrollmentStatus
}

const gradeTone = (grade: number | null): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (grade === null) return 'neutral'
  if (grade >= 85) return 'success'
  if (grade >= 65) return 'warning'
  return 'danger'
}

export default function TeacherStudents() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const teacherId = user?.id ?? ''

  const { data: allCourses = [] } = useGetCoursesQuery()
  const { data: enrollments = [], isLoading } = useGetEnrollmentsQuery({ teacherId }, { skip: !teacherId })
  const { data: users = [] } = useGetUsersQuery()

  const [courseFilter, setCourseFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | EnrollmentStatus>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<StudentAgg | null>(null)
  const [message, setMessage] = useState('')

  const courses = allCourses.filter((c) => c.teacherId === teacherId)
  const courseMap = new Map(courses.map((c) => [c.id, c]))
  const userMap = new Map(users.map((u) => [u.id, u]))

  /* Tələbələri studentId üzrə qruplaşdırırıq */
  const aggMap = new Map<string, StudentAgg>()
  enrollments.forEach((e) => {
    const existing = aggMap.get(e.studentId)
    const course = courseMap.get(e.courseId)
    if (existing) {
      existing.items.push(e)
      if (course) existing.courses.push(course)
    } else {
      aggMap.set(e.studentId, {
        studentId: e.studentId,
        items: [e],
        courses: course ? [course] : [],
        attendance: 0,
        progress: 0,
        grade: null,
        status: e.status,
      })
    }
  })

  const aggs: StudentAgg[] = Array.from(aggMap.values()).map((agg) => {
    const attendance = Math.round(agg.items.reduce((s, e) => s + e.attendance, 0) / agg.items.length)
    const progress = Math.round(agg.items.reduce((s, e) => s + e.progress, 0) / agg.items.length)
    const graded = agg.items.filter((e) => e.grade !== null)
    const grade = graded.length
      ? Math.round(graded.reduce((s, e) => s + (e.grade ?? 0), 0) / graded.length)
      : null
    let status: EnrollmentStatus = 'pending'
    if (agg.items.some((e) => e.status === 'active')) status = 'active'
    else if (agg.items.some((e) => e.status === 'completed')) status = 'completed'
    else if (agg.items.some((e) => e.status === 'pending')) status = 'pending'
    else status = 'cancelled'
    return { ...agg, attendance, progress, grade, status }
  })

  const filtered = aggs.filter((agg) => {
    const student = userMap.get(agg.studentId)
    if (courseFilter !== 'all' && !agg.items.some((e) => e.courseId === courseFilter)) return false
    if (statusFilter !== 'all' && agg.status !== statusFilter) return false
    if (search.trim()) {
      const hay = `${student?.fullName ?? ''} ${student?.email ?? ''}`.toLowerCase()
      if (!hay.includes(search.trim().toLowerCase())) return false
    }
    return true
  })

  const totalStudents = aggs.length
  const activeStudents = aggs.filter((a) => a.status === 'active').length
  const avgAttendance = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + e.attendance, 0) / enrollments.length)
    : 0
  const gradedAll = enrollments.filter((e) => e.grade !== null)
  const avgGrade = gradedAll.length
    ? Math.round(gradedAll.reduce((s, e) => s + (e.grade ?? 0), 0) / gradedAll.length)
    : 0

  const sendMessage = () => {
    if (!message.trim()) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: 'Mesaj mətni boş ola bilməz.' }))
      return
    }
    dispatch(pushToast({ type: 'success', title: 'Göndərildi', message: 'Mesajınız tələbəyə çatdırıldı.' }))
    setMessage('')
  }

  if (isLoading) return <Loader label="Tələbələr yüklənir..." />

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Users className="h-6 w-6" />}
        title="Tələbələrim"
        subtitle={`Ümumilikdə ${totalStudents} tələbə kurslarınızda qeydiyyatdan keçib.`}
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ümumi tələbə" value={totalStudents} icon={<Users className="h-5 w-5" />} tone="brand" />
        <StatCard label="Aktiv tələbə" value={activeStudents} icon={<GraduationCap className="h-5 w-5" />} tone="accent" />
        <StatCard
          label="Orta davamiyyət (%)"
          value={`${avgAttendance}%`}
          icon={<CalendarCheck className="h-5 w-5" />}
          tone="neon"
        />
        <StatCard label="Orta bal" value={avgGrade || '—'} icon={<Award className="h-5 w-5" />} tone="amber" />
      </div>

      <Panel className="animate-fade-up">
        <SectionTitle title="Filtrlər" subtitle="Tələbələri kurs, status və ada görə süzün" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Select label="Kurs" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
            <option value="all">Hamısı</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | EnrollmentStatus)}
          >
            <option value="all">Hamısı</option>
            <option value="active">Aktiv</option>
            <option value="pending">Gözləmədə</option>
            <option value="completed">Tamamlandı</option>
            <option value="cancelled">Ləğv edildi</option>
          </Select>
          <Input
            label="Axtarış"
            placeholder="Ad və ya e-poçt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Panel>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title={totalStudents === 0 ? 'Hələ tələbəniz yoxdur' : 'Nəticə tapılmadı'}
          message={
            totalStudents === 0
              ? 'Kurslarınıza qeydiyyatdan keçən tələbələr burada görünəcək.'
              : 'Filtrlərə uyğun tələbə tapılmadı.'
          }
        />
      ) : (
        <Panel className="animate-fade-up animate-delay-100">
          <TableWrap>
            <thead>
              <tr>
                <Th>Tələbə</Th>
                <Th>Kurs(lar)</Th>
                <Th>Paket</Th>
                <Th className="w-[140px]">Davamiyyət</Th>
                <Th className="w-[140px]">İrəliləyiş</Th>
                <Th>Bal</Th>
                <Th>Status</Th>
                <Th>Əməliyyat</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((agg) => {
                const student = userMap.get(agg.studentId)
                const name = student?.fullName ?? 'Naməlum tələbə'
                return (
                  <tr key={agg.studentId} className="transition-colors hover:bg-white/[0.03]">
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={name} gradient={student?.avatar} size={38} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{name}</p>
                          <p className="truncate text-xs text-slate-500">{student?.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-1.5">
                        {agg.courses.slice(0, 2).map((c) => (
                          <Badge key={c.id} tone="brand">
                            {c.title.length > 18 ? `${c.title.slice(0, 16)}…` : c.title}
                          </Badge>
                        ))}
                        {agg.courses.length > 2 && <Badge tone="neutral">+{agg.courses.length - 2}</Badge>}
                      </div>
                    </Td>
                    <Td>
                      <Badge tone="neon">{agg.items[0].packageTier.toUpperCase()}</Badge>
                    </Td>
                    <Td>
                      <Progress value={agg.attendance} showLabel tone="accent" />
                    </Td>
                    <Td>
                      <Progress value={agg.progress} showLabel />
                    </Td>
                    <Td>
                      {agg.grade !== null ? (
                        <Badge tone={gradeTone(agg.grade)}>{agg.grade}</Badge>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </Td>
                    <Td>
                      <Badge tone={STATUS_TONE[agg.status]}>{ENROLLMENT_STATUS_LABEL[agg.status]}</Badge>
                    </Td>
                    <Td>
                      <Button
                        size="xs"
                        variant="secondary"
                        leftIcon={<UserCircle className="h-3.5 w-3.5" />}
                        onClick={() => {
                          setSelected(agg)
                          setMessage('')
                        }}
                      >
                        Profil
                      </Button>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </TableWrap>
        </Panel>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Tələbə profili"
        size="lg"
      >
        {selected &&
          (() => {
            const student = userMap.get(selected.studentId)
            const name = student?.fullName ?? 'Naməlum tələbə'
            return (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <Avatar name={name} gradient={student?.avatar} size={64} ring />
                  <div>
                    <p className="text-lg font-bold text-white">{name}</p>
                    <p className="text-sm text-slate-400">{student?.email}</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      <Badge tone="neon" icon={<Flame className="h-3 w-3" />}>
                        {student?.level ?? 'Səviyyə 1'}
                      </Badge>
                      <Badge tone="brand">{student?.xp ?? 0} XP</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <InfoItem icon={<Phone className="h-4 w-4" />} label="Telefon" value={student?.phone ?? '—'} />
                  <InfoItem icon={<Mail className="h-4 w-4" />} label="E-poçt" value={student?.email ?? '—'} />
                  <InfoItem icon={<MapPin className="h-4 w-4" />} label="Şəhər" value={student?.city ?? '—'} />
                </div>

                {student?.bio && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Haqqında</p>
                    <p className="mt-1 text-sm text-slate-300">{student.bio}</p>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-sm font-bold text-white">Kurslar üzrə göstəricilər</p>
                  <div className="space-y-2">
                    {selected.items.map((e) => {
                      const course = courseMap.get(e.courseId)
                      return (
                        <div key={e.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-white">
                              {course?.title ?? 'Naməlum kurs'}
                            </span>
                            <Badge tone="neutral">{MODE_LABEL[e.mode]}</Badge>
                          </div>
                          <div className="mt-2 grid gap-3 sm:grid-cols-3">
                            <div>
                              <p className="text-[10px] uppercase text-slate-500">İrəliləyiş</p>
                              <Progress value={e.progress} showLabel />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase text-slate-500">Davamiyyət</p>
                              <Progress value={e.attendance} showLabel tone="accent" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase text-slate-500">Bal</p>
                              {e.grade !== null ? (
                                <Badge tone={gradeTone(e.grade)}>{e.grade}</Badge>
                              ) : (
                                <span className="text-xs text-slate-500">—</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Textarea
                    label="Mesaj yaz"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tələbəyə qısa mesaj göndərin..."
                  />
                  <div className="flex justify-end">
                    <Button leftIcon={<Send className="h-4 w-4" />} onClick={sendMessage}>
                      Mesajı göndər
                    </Button>
                  </div>
                </div>
              </div>
            )
          })()}
      </Modal>
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-500">
        {icon} {label}
      </p>
      <p className="mt-1 truncate text-sm text-slate-200">{value}</p>
    </div>
  )
}
