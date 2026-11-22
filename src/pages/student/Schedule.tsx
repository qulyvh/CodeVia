import {
  CalendarDays,
  Clock,
  MapPin,
} from 'lucide-react'
import type { CourseMode, Enrollment } from '../../types'
import { useAuth } from '../../app/hooks'
import { useGetCoursesQuery, useGetEnrollmentsQuery } from '../../features/api/apiSlice'
import { Badge, EmptyState, Loader, Panel, SectionTitle } from '../../components/ui'
import { PageHeader } from '../../components/common'
import { cn, formatDate, MODE_LABEL, nextLessonDates, SLOT_LABEL, SLOT_SHORT, WEEKDAYS } from '../../lib/utils'

const MODE_TONE: Record<CourseMode, 'accent' | 'warning' | 'neon'> = {
  online: 'accent',
  offline: 'warning',
  hybrid: 'neon',
}

const MODE_BORDER: Record<CourseMode, string> = {
  online: 'border-accent-400/30 bg-accent-500/[0.08]',
  offline: 'border-amber-400/30 bg-amber-500/[0.08]',
  hybrid: 'border-neon-400/30 bg-neon-500/[0.08]',
}

function weekdayLabel(iso: string): string {
  const day = new Date(iso).getDay()
  const value = day === 0 ? 7 : day
  return WEEKDAYS.find((w) => w.value === value)?.label ?? ''
}

export default function StudentSchedule() {
  const { user } = useAuth()
  const { data: enrollments = [], isLoading } = useGetEnrollmentsQuery(
    { studentId: user?.id },
    { skip: !user?.id },
  )
  const { data: courses = [] } = useGetCoursesQuery()

  const courseOf = (id: string) => courses.find((c) => c.id === id)
  const relevant = enrollments.filter((e) => e.status === 'active' || e.status === 'pending')

  const header = (
    <PageHeader
      title="Dərs cədvəlim"
      subtitle="Həftəlik dərs qrafikiniz və növbəti dərs tarixləri"
      icon={<CalendarDays className="h-6 w-6" />}
    />
  )

  if (isLoading) {
    return (
      <div className="animate-fade-up">
        {header}
        <Loader label="Cədvəl yüklənir..." />
      </div>
    )
  }

  if (relevant.length === 0) {
    return (
      <div className="animate-fade-up space-y-6">
        {header}
        <EmptyState
          title="Cədvəliniz boşdur"
          message="Aktiv və ya gözləmədə olan qeydiyyatınız olduqda dərs cədvəliniz burada görünəcək."
          icon={<CalendarDays className="h-6 w-6" />}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">{header}</div>

      {/* Həftəlik lövhə */}
      <Panel className="animate-fade-up animate-delay-100">
        <SectionTitle
          title="Həftəlik cədvəl"
          subtitle="Dərslər həftənin günlərinə görə yerləşdirilib"
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <div className="overflow-x-auto pb-1">
          <div className="grid min-w-[900px] grid-cols-7 gap-3">
            {WEEKDAYS.map((day) => {
              const items = relevant.filter((e) => e.days.includes(day.value))
              return (
                <div key={day.value} className="space-y-3">
                  <div className="panel p-3 text-center">
                    <p className="text-sm font-bold text-white">{day.short}</p>
                    <p className="mt-0.5 text-[10px] leading-tight text-slate-500">{day.label}</p>
                  </div>
                  <div className="min-h-[120px] space-y-2">
                    {items.length === 0 ? (
                      <p className="pt-4 text-center text-[10px] text-slate-600">Dərs yoxdur</p>
                    ) : (
                      items.map((enrollment: Enrollment) => {
                        const course = courseOf(enrollment.courseId)
                        return (
                          <div
                            key={`${enrollment.id}-${day.value}`}
                            className={cn('rounded-xl border p-2.5', MODE_BORDER[enrollment.mode])}
                          >
                            <p className="line-clamp-2 text-xs font-semibold text-white">
                              {course?.title ?? 'Kurs'}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-1">
                              <Badge tone="neutral" className="px-1.5 py-0.5 text-[10px]">
                                {SLOT_SHORT[enrollment.slot]}
                              </Badge>
                              <Badge
                                tone={MODE_TONE[enrollment.mode]}
                                className="px-1.5 py-0.5 text-[10px]"
                              >
                                {MODE_LABEL[enrollment.mode]}
                              </Badge>
                            </div>
                            {enrollment.mode === 'offline' && enrollment.campus && (
                              <p className="mt-1 line-clamp-1 text-[10px] text-slate-500">
                                {enrollment.campus}
                              </p>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-white/10 pt-4">
          <span className="text-xs font-semibold text-slate-400">İzah:</span>
          <span className="inline-flex items-center gap-2 text-xs text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-400" /> Onlayn
          </span>
          <span className="inline-flex items-center gap-2 text-xs text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Oflayn
          </span>
          <span className="inline-flex items-center gap-2 text-xs text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-neon-400" /> Hibrid
          </span>
        </div>
      </Panel>

      {/* Növbəti dərslər */}
      <Panel className="animate-fade-up animate-delay-200">
        <SectionTitle
          title="Növbəti dərslər"
          subtitle="Yaxınlaşan dərs tarixləriniz"
          icon={<Clock className="h-5 w-5" />}
        />
        <div className="space-y-4">
          {relevant.map((enrollment) => {
            const course = courseOf(enrollment.courseId)
            const dates = nextLessonDates(enrollment.startDate, enrollment.days, 3)
            return (
              <div key={enrollment.id} className="panel p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="line-clamp-1 text-sm font-bold text-white">
                    {course?.title ?? 'Kurs'}
                  </h4>
                  <Badge tone={MODE_TONE[enrollment.mode]}>{SLOT_LABEL[enrollment.slot]}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {dates.length === 0 ? (
                    <span className="text-xs text-slate-500">Tarix müəyyən edilməyib.</span>
                  ) : (
                    dates.map((date) => (
                      <div
                        key={date}
                        className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center"
                      >
                        <p className="text-xs font-bold text-white">{formatDate(date)}</p>
                        <p className="mt-0.5 text-[10px] text-slate-500">{weekdayLabel(date)}</p>
                      </div>
                    ))
                  )}
                </div>
                {enrollment.mode === 'offline' && enrollment.campus && (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="h-3.5 w-3.5" /> {enrollment.campus}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
