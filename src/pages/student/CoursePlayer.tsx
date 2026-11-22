import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Save,
  Send,
} from 'lucide-react'
import type { Lesson } from '../../types'
import { useAppDispatch, useAuth } from '../../app/hooks'
import {
  useGetCourseQuery,
  useGetEnrollmentsQuery,
  useGetLessonsQuery,
  useToggleLessonCompleteMutation,
} from '../../features/api/apiSlice'
import { pushToast } from '../../features/ui/uiSlice'
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Loader,
  Panel,
  Progress,
  Ring,
  Tabs,
  Textarea,
} from '../../components/ui'
import { PageHeader, VideoPlayer } from '../../components/common'
import { cn, getErrMsg, LESSON_TYPE_LABEL, percent, relativeTime } from '../../lib/utils'

type TabValue = 'notes' | 'discussion' | 'mine'

const COMMENTS = [
  {
    id: 'c1',
    name: 'Ayan Hacıyeva',
    gradient: 'from-neon-500 to-brand-400',
    minutesAgo: 35,
    text: 'İzahlar çox aydın idi, xüsusilə praktik nümunələr üçün təşəkkürlər!',
  },
  {
    id: 'c2',
    name: 'Murad Əhmədov',
    gradient: 'from-accent-400 to-accent-500',
    minutesAgo: 140,
    text: 'Ev tapşırığını necə təqdim edək? GitHub linki kifayətdir?',
  },
  {
    id: 'c3',
    name: 'Kamran Əliyev',
    gradient: 'from-brand-500 to-accent-400',
    minutesAgo: 320,
    text: 'Bəli, GitHub reposunu paylaşın — həftə sonu hamısını nəzərdən keçirəcəyəm.',
  },
]

export default function StudentCoursePlayer() {
  const { courseId = '' } = useParams()
  const { user } = useAuth()
  const dispatch = useAppDispatch()

  const { data: course, isLoading: courseLoading } = useGetCourseQuery(courseId, { skip: !courseId })
  const { data: enrollments = [], isLoading: enrLoading } = useGetEnrollmentsQuery(
    { studentId: user?.id, courseId },
    { skip: !user?.id || !courseId },
  )
  const { data: lessons = [], isLoading: lessonsLoading } = useGetLessonsQuery(courseId, {
    skip: !courseId,
  })
  const [toggleComplete, { isLoading: toggling }] = useToggleLessonCompleteMutation()

  const [currentId, setCurrentId] = useState('')
  const [tab, setTab] = useState<TabValue>('notes')
  const [notes, setNotes] = useState('')
  const [comment, setComment] = useState('')

  const enrollment =
    enrollments.find((e) => e.status === 'active' || e.status === 'pending') ?? enrollments[0]
  const completedIds = enrollment?.completedLessonIds ?? []
  const current = lessons.find((l) => l.id === currentId) ?? lessons[0]

  useEffect(() => {
    if (currentId || lessons.length === 0) return
    const firstIncomplete = lessons.find((l) => !completedIds.includes(l.id))
    setCurrentId((firstIncomplete ?? lessons[0]).id)
  }, [lessons, currentId, completedIds])

  if (courseLoading || enrLoading || lessonsLoading) {
    return (
      <div className="animate-fade-up">
        <Loader label="Dərs yüklənir..." />
      </div>
    )
  }

  if (!enrollment) {
    return (
      <div className="animate-fade-up space-y-6">
        <PageHeader
          title={course?.title ?? 'Kurs'}
          subtitle="Video təhsil mərkəzi"
          icon={<BookOpen className="h-6 w-6" />}
        />
        <EmptyState
          title="Bu kursa qeydiyyatınız yoxdur"
          message="Kursa baxmaq üçün əvvəlcə qeydiyyatdan keçməlisiniz."
          icon={<BookOpen className="h-6 w-6" />}
          action={
            <Link to={`/kurslar/${courseId}`}>
              <Button variant="primary" leftIcon={<BookOpen className="h-4 w-4" />}>
                Kurs səhifəsinə keç
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  if (!current) {
    return (
      <div className="animate-fade-up space-y-6">
        <PageHeader
          title={course?.title ?? 'Kurs'}
          subtitle="Video təhsil mərkəzi"
          icon={<BookOpen className="h-6 w-6" />}
        />
        <EmptyState
          title="Dərs tapılmadı"
          message="Bu kurs üzrə hələ dərs əlavə edilməyib."
          icon={<BookOpen className="h-6 w-6" />}
        />
      </div>
    )
  }

  const index = lessons.findIndex((l) => l.id === current.id)
  const isCompleted = completedIds.includes(current.id)

  const modules = lessons.reduce<{ title: string; items: Lesson[] }[]>((acc, lesson) => {
    let module = acc.find((m) => m.title === lesson.moduleTitle)
    if (!module) {
      module = { title: lesson.moduleTitle, items: [] }
      acc.push(module)
    }
    module.items.push(lesson)
    return acc
  }, [])

  const goTo = (id: string) => {
    setCurrentId(id)
    setTab('notes')
  }

  const handleToggle = async () => {
    try {
      await toggleComplete({ enrollmentId: enrollment.id, lessonId: current.id }).unwrap()
      dispatch(
        pushToast({
          type: 'success',
          title: isCompleted ? 'Dərs işarəsi silindi' : 'Dərs tamamlandı kimi işarələndi',
        }),
      )
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const handleSaveNotes = () => {
    dispatch(pushToast({ type: 'success', title: 'Qeydləriniz yadda saxlanıldı' }))
  }

  const handleSendComment = () => {
    if (!comment.trim()) {
      dispatch(pushToast({ type: 'warning', title: 'Şərh boş ola bilməz' }))
      return
    }
    setComment('')
    dispatch(pushToast({ type: 'success', title: 'Şərhiniz göndərildi' }))
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <Link
          to="/panel/telebe/kurslar"
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Kurslarıma qayıt
        </Link>
        <PageHeader
          title={course?.title ?? 'Kurs'}
          subtitle={`${enrollment.progress}% tamamlanıb · ${completedIds.length}/${lessons.length} dərs`}
          icon={<BookOpen className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Sol sütun — pleyer */}
        <div className="space-y-5 xl:col-span-2">
          <div className="animate-fade-up animate-delay-100">
            <VideoPlayer
              youtubeId={current.youtubeId}
              title={current.title}
              badge={`Dərs ${current.order}/${lessons.length}`}
            />
          </div>

          <Panel className="animate-fade-up animate-delay-200">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white">{current.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone="brand">{current.moduleTitle}</Badge>
                  <Badge tone="neutral">{LESSON_TYPE_LABEL[current.type]}</Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" /> {current.durationMin} dəq
                  </span>
                  {isCompleted && (
                    <Badge tone="success" icon={<CheckCircle2 className="h-3 w-3" />}>
                      Tamamlandı
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-300">{current.description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                variant={isCompleted ? 'success' : 'primary'}
                loading={toggling}
                onClick={handleToggle}
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
              >
                {isCompleted ? 'Tamamlandı işarəsini sil' : 'Dərsi tamamlandı kimi işarələ'}
              </Button>
              <Button
                variant="glass"
                disabled={index >= lessons.length - 1}
                onClick={() => goTo(lessons[index + 1].id)}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Növbəti dərs
              </Button>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
              <Button
                variant="ghost"
                size="sm"
                disabled={index <= 0}
                onClick={() => goTo(lessons[index - 1].id)}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Əvvəlki dərs
              </Button>
              <span className="text-xs text-slate-500">
                {index + 1} / {lessons.length}
              </span>
            </div>
          </Panel>

          <Panel className="animate-fade-up animate-delay-300">
            <Tabs
              tabs={[
                { value: 'notes', label: 'Dərs qeydləri' },
                { value: 'discussion', label: 'Müzakirə' },
                { value: 'mine', label: 'Qeydlərim' },
              ]}
              value={tab}
              onChange={setTab}
              className="mb-5"
            />

            {tab === 'notes' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-300">{current.description}</p>
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Resurslar
                  </p>
                  <div className="space-y-2">
                    {current.resources.map((resource) => (
                      <a
                        key={resource.title}
                        href={resource.url}
                        className="glass flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-white/10"
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500/15 text-brand-300">
                          <FileText className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-slate-200">
                          {resource.title}
                        </span>
                        <Download className="h-4 w-4 text-slate-400" />
                      </a>
                    ))}
                    {current.resources.length === 0 && (
                      <p className="text-sm text-slate-400">Bu dərs üçün resurs yoxdur.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {tab === 'discussion' && (
              <div className="space-y-4">
                {COMMENTS.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar name={c.name} gradient={c.gradient} size={40} ring />
                    <div className="min-w-0 flex-1 rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-white">{c.name}</span>
                        <span className="text-[11px] text-slate-500">
                          {relativeTime(new Date(Date.now() - c.minutesAgo * 60000).toISOString())}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-300">{c.text}</p>
                    </div>
                  </div>
                ))}

                <div className="space-y-3 border-t border-white/10 pt-4">
                  <Textarea
                    label="Şərhiniz"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Müzakirəyə qoşulun..."
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSendComment}
                    leftIcon={<Send className="h-4 w-4" />}
                  >
                    Şərh göndər
                  </Button>
                </div>
              </div>
            )}

            {tab === 'mine' && (
              <div className="space-y-3">
                <Textarea
                  label="Şəxsi qeydlərim"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Bu dərs üzrə qeydlərinizi buraya yazın..."
                  hint="Qeydlər yalnız sizə görünür və brauzerinizdə saxlanılır."
                />
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleSaveNotes}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Yadda saxla
                </Button>
              </div>
            )}
          </Panel>
        </div>

        {/* Sağ sütun — silabus */}
        <div className="xl:col-span-1">
          <Panel className="animate-fade-up animate-delay-200 xl:sticky xl:top-24">
            <div className="mb-4 flex items-center gap-4">
              <Ring value={enrollment.progress} size={68} label="Kurs" />
              <div className="min-w-0">
                <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                  <BookOpen className="h-4 w-4 text-brand-300" /> Kurs silabusu
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  {lessons.length} dərs · {modules.length} modul
                </p>
              </div>
            </div>
            <Progress value={enrollment.progress} showLabel className="mb-4" />

            <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              {modules.map((module, mi) => {
                const moduleDone = module.items.filter((l) => completedIds.includes(l.id)).length
                const modulePercent = percent(moduleDone, module.items.length)
                return (
                  <div key={module.title}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-md bg-brand-500/15 text-[11px] font-bold text-brand-300">
                        {mi + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-200">
                        {module.title}
                      </span>
                      <span className="shrink-0 text-[11px] text-slate-500">{modulePercent}%</span>
                    </div>
                    <div className="space-y-1">
                      {module.items.map((lesson) => {
                        const active = lesson.id === current.id
                        const done = completedIds.includes(lesson.id)
                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => goTo(lesson.id)}
                            className={cn(
                              'flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-all',
                              active
                                ? 'border-brand-400/40 bg-brand-500/15'
                                : 'border-white/8 bg-white/[0.02] hover:bg-white/[0.06]',
                            )}
                          >
                            <span
                              className={cn(
                                'grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold',
                                done
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-white/8 text-slate-400',
                              )}
                            >
                              {done ? <CheckCircle2 className="h-3 w-3" /> : lesson.order}
                            </span>
                            <span
                              className={cn(
                                'min-w-0 flex-1 truncate text-xs',
                                active ? 'font-semibold text-white' : 'text-slate-300',
                              )}
                            >
                              {lesson.title}
                            </span>
                            <span className="shrink-0 text-[10px] text-slate-500">
                              {lesson.durationMin} dəq
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
