import { useState } from 'react'
import {
  Award,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Eye,
  Send,
  TrendingUp,
} from 'lucide-react'
import type { Enrollment, Lesson } from '../../types'
import { useAppDispatch, useAuth } from '../../app/hooks'
import {
  useGetCoursesQuery,
  useGetEnrollmentsQuery,
  useGetLessonsQuery,
} from '../../features/api/apiSlice'
import { pushToast } from '../../features/ui/uiSlice'
import {
  Badge,
  Button,
  EmptyState,
  Loader,
  Modal,
  Panel,
  Progress,
  SectionTitle,
  TableWrap,
  Td,
  Textarea,
  Th,
} from '../../components/ui'
import { PageHeader, StatCard } from '../../components/common'
import { ENROLLMENT_STATUS_LABEL, formatDate, packageOf } from '../../lib/utils'

const STATUS_TONE: Record<Enrollment['status'], 'success' | 'brand' | 'warning' | 'danger'> = {
  active: 'success',
  completed: 'brand',
  pending: 'warning',
  cancelled: 'danger',
}

function gradeTone(grade: number): 'success' | 'accent' | 'warning' | 'danger' {
  if (grade >= 90) return 'success'
  if (grade >= 80) return 'accent'
  if (grade >= 70) return 'warning'
  return 'danger'
}

/* ------------------------------------------------------------------ */
/* Kurs üzrə tapşırıqlar                                               */
/* ------------------------------------------------------------------ */
function CourseAssignments({
  courseTitle,
  courseId,
  completedLessonIds,
  startDate,
}: {
  courseTitle: string
  courseId: string
  completedLessonIds: string[]
  startDate: string
}) {
  const dispatch = useAppDispatch()
  const { data: lessons = [], isLoading } = useGetLessonsQuery(courseId, { skip: !courseId })
  const [active, setActive] = useState<Lesson | null>(null)
  const [answer, setAnswer] = useState('')

  const latest = [...lessons].slice(-3).reverse()
  const deadline = (() => {
    const d = new Date(startDate)
    if (Number.isNaN(d.getTime())) return '—'
    d.setDate(d.getDate() + 7)
    return formatDate(d.toISOString())
  })()

  const submit = () => {
    if (!answer.trim()) {
      dispatch(pushToast({ type: 'warning', title: 'Cavab boş ola bilməz' }))
      return
    }
    setAnswer('')
    setActive(null)
    dispatch(pushToast({ type: 'success', title: 'Tapşırıq təqdim edildi' }))
  }

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="line-clamp-1 text-sm font-bold text-white">{courseTitle}</h4>
        <span className="shrink-0 text-xs text-slate-500">{latest.length} tapşırıq</span>
      </div>

      <div className="mt-3 space-y-2">
        {isLoading ? (
          <p className="text-xs text-slate-500">Yüklənir...</p>
        ) : latest.length === 0 ? (
          <p className="text-xs text-slate-500">Bu kurs üzrə tapşırıq yoxdur.</p>
        ) : (
          latest.map((lesson) => {
            const done = completedLessonIds.includes(lesson.id)
            return (
              <div
                key={lesson.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-500/12 text-xs font-bold text-brand-300">
                  {lesson.order}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-slate-200">
                  {lesson.title}
                </span>
                <Badge tone={done ? 'success' : 'warning'}>
                  {done ? 'Tamamlanıb' : 'Gözləmədə'}
                </Badge>
                <Button
                  variant="ghost"
                  size="xs"
                  leftIcon={<Eye className="h-3.5 w-3.5" />}
                  onClick={() => setActive(lesson)}
                >
                  Bax
                </Button>
              </div>
            )
          })
        )}
      </div>

      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active?.title ?? 'Tapşırıq'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setActive(null)}>
              Ləğv et
            </Button>
            <Button variant="primary" onClick={submit} leftIcon={<Send className="h-4 w-4" />}>
              Tapşırığı təqdim et
            </Button>
          </>
        }
      >
        {active && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300">{active.description}</p>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs text-slate-400">
                Son təqdim tarixi:{' '}
                <span className="font-semibold text-white">{deadline}</span>
              </p>
            </div>
            <Textarea
              label="Cavabınız"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Tapşırıq üzrə cavabınızı yazın və ya GitHub linkini paylaşın..."
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Əsas səhifə                                                         */
/* ------------------------------------------------------------------ */
export default function StudentGrades() {
  const { user } = useAuth()
  const { data: enrollments = [], isLoading } = useGetEnrollmentsQuery(
    { studentId: user?.id },
    { skip: !user?.id },
  )
  const { data: courses = [] } = useGetCoursesQuery()

  const courseOf = (id: string) => courses.find((c) => c.id === id)

  const graded = enrollments.filter((e) => e.grade !== null)
  const avgGrade = graded.length
    ? Math.round(graded.reduce((s, e) => s + (e.grade ?? 0), 0) / graded.length)
    : 0
  const maxGrade = graded.length ? Math.max(...graded.map((e) => e.grade ?? 0)) : 0
  const avgAttendance = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + e.attendance, 0) / enrollments.length)
    : 0
  const lessonsDone = enrollments.reduce((s, e) => s + e.completedLessonIds.length, 0)

  const activeEnrollments = enrollments.filter((e) => e.status === 'active')

  const header = (
    <PageHeader
      title="Qiymətlər və Tapsırıqlar"
      subtitle="Kurslar üzrə ballarınız, davamiyyətiniz və tapşırıq vəziyyətiniz"
      icon={<ClipboardList className="h-6 w-6" />}
    />
  )

  if (isLoading) {
    return (
      <div className="animate-fade-up">
        {header}
        <Loader label="Qiymətlər yüklənir..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">{header}</div>

      <div className="grid animate-fade-up animate-delay-100 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ümumi bal ortalaması"
          value={avgGrade}
          icon={<Award className="h-5 w-5" />}
          tone="brand"
          hint="Qiymətləndirilən kurslar üzrə"
        />
        <StatCard
          label="Ən yüksək bal"
          value={maxGrade}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="accent"
          hint="Əldə etdiyiniz ən yüksək nəticə"
        />
        <StatCard
          label="Davamiyyət"
          value={`${avgAttendance}%`}
          icon={<CalendarCheck className="h-5 w-5" />}
          tone="emerald"
          hint="Orta iştirak göstəricisi"
        />
        <StatCard
          label="Tamamlanan dərslər"
          value={lessonsDone}
          icon={<BookOpen className="h-5 w-5" />}
          tone="neon"
          hint="Bütün kurslar üzrə cəmi"
        />
      </div>

      <Panel className="animate-fade-up animate-delay-200">
        <SectionTitle
          title="Kurs qiymətləri"
          subtitle="Hər kurs üzrə detallı göstəricilər"
          icon={<Award className="h-5 w-5" />}
        />
        {enrollments.length === 0 ? (
          <EmptyState
            title="Məlumat yoxdur"
            message="Qeydiyyatdan keçdikdən sonra qiymətləriniz burada görünəcək."
            icon={<ClipboardList className="h-6 w-6" />}
          />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Kurs</Th>
                <Th>Paket</Th>
                <Th>Bal</Th>
                <Th>Davamiyyət</Th>
                <Th>İrəliləyiş</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id}>
                  <Td className="max-w-[260px]">
                    <span className="line-clamp-1 font-semibold text-white">
                      {courseOf(e.courseId)?.title ?? 'Kurs'}
                    </span>
                  </Td>
                  <Td>
                    <Badge tone="neon">{packageOf(e.packageTier).name}</Badge>
                  </Td>
                  <Td>
                    {e.grade === null ? (
                      <span className="text-slate-500">—</span>
                    ) : (
                      <Badge tone={gradeTone(e.grade)}>{e.grade}</Badge>
                    )}
                  </Td>
                  <Td className="w-[160px]">
                    <Progress value={e.attendance} showLabel />
                  </Td>
                  <Td className="w-[160px]">
                    <Progress value={e.progress} showLabel tone="accent" />
                  </Td>
                  <Td>
                    <Badge tone={STATUS_TONE[e.status]}>{ENROLLMENT_STATUS_LABEL[e.status]}</Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Panel>

      <div className="animate-fade-up animate-delay-300">
        <SectionTitle
          title="Tapsırıqlar"
          subtitle="Aktiv kurslarınız üzrə son tapşırıqlar"
          icon={<ClipboardList className="h-5 w-5" />}
        />
        {activeEnrollments.length === 0 ? (
          <EmptyState
            title="Aktiv tapşırıq yoxdur"
            message="Aktiv kursunuz olduqda tapşırıqlarınız burada siyahılanacaq."
            icon={<ClipboardList className="h-6 w-6" />}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {activeEnrollments.map((e) => (
              <CourseAssignments
                key={e.id}
                courseId={e.courseId}
                courseTitle={courseOf(e.courseId)?.title ?? 'Kurs'}
                completedLessonIds={e.completedLessonIds}
                startDate={e.startDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
