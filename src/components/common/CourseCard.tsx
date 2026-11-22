import { Link } from 'react-router-dom'
import { Clock, GraduationCap, Radio, Users } from 'lucide-react'
import type { Course } from '../../types'
import { cn, formatAZN, LEVEL_LABEL, MODE_LABEL } from '../../lib/utils'
import { Badge, Rating } from '../ui'
import { CoverImage } from './index'

export function CourseCard({
  course,
  teacherName,
  className,
  compact,
}: {
  course: Course
  teacherName?: string
  className?: string
  compact?: boolean
}) {
  return (
    <Link
      to={`/kurslar/${course.id}`}
      className={cn(
        'panel group flex flex-col overflow-hidden p-0 transition-all duration-400 hover:-translate-y-1.5 hover:border-brand-400/40 hover:shadow-glow',
        className,
      )}
    >
      <div className="relative p-3 pb-0">
        <CoverImage prompt={course.coverPrompt} title={course.title} tech={course.tech} />
        <div className="absolute left-6 top-6 flex flex-col items-start gap-2">
          {course.popular && (
            <span className="rounded-lg bg-brand-grad px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-glow">
              Populyar
            </span>
          )}
          {course.oldPrice && (
            <span className="rounded-lg bg-rose-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Endirim
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone="brand">{course.category}</Badge>
          <Badge tone="neutral">{LEVEL_LABEL[course.level]}</Badge>
          <Badge
            tone={course.mode === 'online' ? 'accent' : course.mode === 'offline' ? 'warning' : 'neon'}
            icon={
              course.mode === 'online' ? (
                <Radio className="h-3 w-3" />
              ) : (
                <GraduationCap className="h-3 w-3" />
              )
            }
          >
            {MODE_LABEL[course.mode]}
          </Badge>
        </div>

        <h3 className="text-base font-bold leading-snug text-white transition-colors group-hover:text-brand-200">
          {course.title}
        </h3>
        {!compact && <p className="mt-2 line-clamp-2 text-sm text-slate-400">{course.summary}</p>}

        <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {course.totalHours} saat
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> {course.studentCount}
          </span>
          <span>{course.durationWeeks} həftə</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <Rating value={course.rating} count={course.reviewCount} />
            {teacherName && (
              <p className="mt-1.5 text-xs text-slate-500">{teacherName}</p>
            )}
          </div>
          <div className="text-right">
            {course.oldPrice && (
              <p className="text-xs text-slate-500 line-through">{formatAZN(course.oldPrice)}</p>
            )}
            <p className="text-lg font-extrabold text-white">{formatAZN(course.basePrice)}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
