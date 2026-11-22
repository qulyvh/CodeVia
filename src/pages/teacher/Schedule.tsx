import { useState } from 'react'
import {
  CalendarCheck,
  CalendarDays,
  GraduationCap,
  MapPin,
  Users,
} from 'lucide-react'
import type { ScheduleSlot } from '../../types'
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
  Loader,
  Modal,
  Panel,
  SectionTitle,
  Select,
  Toggle,
} from '../../components/ui'
import { PageHeader } from '../../components/common'
import {
  MODE_LABEL,
  SLOT_LABEL,
  WEEKDAYS,
  formatDate,
  nextLessonDates,
} from '../../lib/utils'

const SLOTS: ScheduleSlot[] = ['seher', 'gunorta', 'axsam', 'heftesonu']

interface BoardEntry {
  courseTitle: string
  students: number
  mode: 'online' | 'offline' | 'hybrid'
}

interface WeekLesson {
  key: string
  date: string
  weekday: number
  slot: ScheduleSlot
  courseId: string
  courseTitle: string
  campus?: string
  students: { id: string; name: string }[]
}

const weekdayFromDate = (iso: string): number => {
  const d = new Date(iso).getDay()
  return d === 0 ? 7 : d
}

export default function TeacherSchedule() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const teacherId = user?.id ?? ''

  const { data: allCourses = [] } = useGetCoursesQuery()
  const { data: enrollments = [], isLoading } = useGetEnrollmentsQuery({ teacherId }, { skip: !teacherId })
  const { data: users = [] } = useGetUsersQuery()

  const [courseFilter, setCourseFilter] = useState('all')
  const [attendance, setAttendance] = useState<WeekLesson | null>(null)
  const [present, setPresent] = useState<Record<string, boolean>>({})

  const courses = allCourses.filter((c) => c.teacherId === teacherId)
  const courseMap = new Map(courses.map((c) => [c.id, c]))
  const userMap = new Map(users.map((u) => [u.id, u]))

  const activeEnrollments = enrollments.filter(
    (e) =>
      (e.status === 'active' || e.status === 'pending') &&
      (courseFilter === 'all' || e.courseId === courseFilter),
  )

  /* Həftəlik lövhə üçün xanalar */
  const cells = new Map<string, BoardEntry[]>()
  activeEnrollments.forEach((e) => {
    const course = courseMap.get(e.courseId)
    if (!course) return
    const students = enrollments.filter((x) => x.courseId === e.courseId).length
    e.days.forEach((d) => {
      const key = `${d}-${e.slot}`
      const list = cells.get(key) ?? []
      if (!list.some((item) => item.courseTitle === course.title)) {
        list.push({ courseTitle: course.title, students, mode: e.mode })
      }
      cells.set(key, list)
    })
  })

  /* Bu həftənin dərsləri */
  const weekLessons: WeekLesson[] = []
  activeEnrollments.forEach((e) => {
    const course = courseMap.get(e.courseId)
    if (!course) return
    const students = enrollments
      .filter((x) => x.courseId === e.courseId)
      .map((x) => ({
        id: x.studentId,
        name: userMap.get(x.studentId)?.fullName ?? 'Naməlum tələbə',
      }))
    nextLessonDates(e.startDate, e.days, 3).forEach((date) => {
      weekLessons.push({
        key: `${e.id}-${date}-${e.slot}`,
        date,
        weekday: weekdayFromDate(date),
        slot: e.slot,
        courseId: e.courseId,
        courseTitle: course.title,
        campus: e.mode === 'online' ? undefined : e.campus,
        students,
      })
    })
  })
  weekLessons.sort((a, b) => a.date.localeCompare(b.date))

  const openAttendance = (lesson: WeekLesson) => {
    setAttendance(lesson)
    const init: Record<string, boolean> = {}
    lesson.students.forEach((s) => {
      init[s.id] = true
    })
    setPresent(init)
  }

  const saveAttendance = () => {
    const count = Object.values(present).filter(Boolean).length
    dispatch(
      pushToast({
        type: 'success',
        title: 'Yadda saxlanıldı',
        message: `Davamiyyət qeyd edildi: ${count}/${attendance?.students.length ?? 0} tələbə iştirak etdi.`,
      }),
    )
    setAttendance(null)
  }

  if (isLoading) return <Loader label="Cədvəl yüklənir..." />

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<CalendarDays className="h-6 w-6" />}
        title="Dərs cədvəli"
        subtitle="Həftəlik dərs lövhəsi və yaxınlaşan dərslər."
        actions={
          courses.length > 0 ? (
            <div className="w-full max-w-xs">
              <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
                <option value="all">Bütün kurslar</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </Select>
            </div>
          ) : undefined
        }
      />

      <Panel className="animate-fade-up">
        <SectionTitle
          title="Həftəlik lövhə"
          subtitle="Gün və dərs saatı üzrə qruplar"
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Başlıq sətri */}
            <div className="grid grid-cols-[140px_repeat(7,minmax(0,1fr))] gap-2 border-b border-white/10 pb-2">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Dərs saatı</div>
              {WEEKDAYS.map((d) => (
                <div key={d.value} className="text-center text-xs font-bold uppercase tracking-wide text-slate-400">
                  {d.label}
                </div>
              ))}
            </div>

            {/* Slot sətirləri */}
            {SLOTS.map((slot) => (
              <div
                key={slot}
                className="grid grid-cols-[140px_repeat(7,minmax(0,1fr))] gap-2 border-b border-white/5 py-2"
              >
                <div className="flex items-start pt-1 text-xs font-semibold text-slate-300">
                  {SLOT_LABEL[slot]}
                </div>
                {WEEKDAYS.map((d) => {
                  const list = cells.get(`${d.value}-${slot}`) ?? []
                  return (
                    <div
                      key={d.value}
                      className="min-h-[64px] space-y-1.5 rounded-xl border border-white/5 bg-white/[0.02] p-2"
                    >
                      {list.map((entry) => (
                        <div
                          key={entry.courseTitle}
                          className="rounded-lg border border-brand-400/25 bg-brand-500/10 p-2"
                        >
                          <p className="text-xs font-semibold leading-tight text-white">{entry.courseTitle}</p>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                              <Users className="h-3 w-3" /> {entry.students}
                            </span>
                            <span className="text-[10px] font-semibold text-brand-200">
                              {MODE_LABEL[entry.mode]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel className="animate-fade-up animate-delay-100">
        <SectionTitle
          title="Bu həftənin dərsləri"
          subtitle={`${weekLessons.length} dərs planlanıb`}
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        {weekLessons.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck className="h-6 w-6" />}
            title="Planlanan dərs yoxdur"
            message="Aktiv qeydiyyatlar əsasında yaxınlaşan dərslər burada görünəcək."
          />
        ) : (
          <div className="space-y-3">
            {weekLessons.map((lesson) => (
              <div
                key={lesson.key}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex w-[120px] shrink-0 flex-col items-center rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                  <span className="text-xs font-bold uppercase text-brand-200">
                    {WEEKDAYS.find((w) => w.value === lesson.weekday)?.short ?? '—'}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(lesson.date)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{lesson.courseTitle}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" /> {SLOT_LABEL[lesson.slot]}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {lesson.students.length} tələbə
                    </span>
                    {lesson.campus && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {lesson.campus}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<GraduationCap className="h-4 w-4" />}
                  onClick={() => openAttendance(lesson)}
                >
                  Yoxlama (davamiyyət)
                </Button>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Modal
        open={Boolean(attendance)}
        onClose={() => setAttendance(null)}
        title="Davamiyyət yoxlaması"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAttendance(null)}>
              Ləğv et
            </Button>
            <Button onClick={saveAttendance} leftIcon={<CalendarCheck className="h-4 w-4" />}>
              Yadda saxla
            </Button>
          </>
        }
      >
        {attendance && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{attendance.courseTitle}</Badge>
              <Badge tone="neutral">{formatDate(attendance.date)}</Badge>
              <Badge tone="accent">{SLOT_LABEL[attendance.slot]}</Badge>
            </div>
            {attendance.students.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">Bu kursda tələbə yoxdur.</p>
            ) : (
              <div className="space-y-2">
                {attendance.students.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} size={34} />
                      <span className="text-sm text-slate-200">{s.name}</span>
                    </div>
                    <Toggle
                      checked={present[s.id] ?? false}
                      onChange={(v) => setPresent((p) => ({ ...p, [s.id]: v }))}
                      label={present[s.id] ? 'İştirak etdi' : 'Yoxdur'}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
