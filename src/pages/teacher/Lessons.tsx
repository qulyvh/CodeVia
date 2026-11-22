import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  FolderKanban,
  Layers,
  Pencil,
  Play,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import type { Lesson, LessonType } from '../../types'
import { useAppDispatch, useAuth } from '../../app/hooks'
import {
  useCreateLessonMutation,
  useDeleteLessonMutation,
  useGetCoursesQuery,
  useGetEnrollmentsQuery,
  useGetLessonsQuery,
  useUpdateLessonMutation,
} from '../../features/api/apiSlice'
import { pushToast } from '../../features/ui/uiSlice'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  IconButton,
  Input,
  Loader,
  Modal,
  Panel,
  Ring,
  SectionTitle,
  Select,
  Textarea,
  Toggle,
} from '../../components/ui'
import { PageHeader, VideoPlayer } from '../../components/common'
import { LESSON_TYPE_LABEL, getErrMsg } from '../../lib/utils'

const NEW_MODULE = '__new_module__'

const LESSON_TONE = {
  video: 'brand',
  live: 'danger',
  project: 'neon',
  quiz: 'warning',
} as const

interface LessonForm {
  moduleTitle: string
  customModule: string
  title: string
  description: string
  durationMin: string
  youtubeId: string
  type: LessonType
  isFree: boolean
  resourceTitle: string
  resourceUrl: string
}

const EMPTY_LESSON_FORM: LessonForm = {
  moduleTitle: NEW_MODULE,
  customModule: '',
  title: '',
  description: '',
  durationMin: '20',
  youtubeId: '',
  type: 'video',
  isFree: false,
  resourceTitle: '',
  resourceUrl: '',
}

/* ------------------------------------------------------------------ */
/* Dərsin sətri — təkrar istifadə olunan komponent                     */
/* ------------------------------------------------------------------ */
function LessonRow({
  lesson,
  onEdit,
  onPreview,
  onDelete,
}: {
  lesson: Lesson
  onEdit: (lesson: Lesson) => void
  onPreview: (lesson: Lesson) => void
  onDelete: (lesson: Lesson) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-xs font-bold text-slate-300">
        {lesson.order}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{lesson.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge tone={LESSON_TONE[lesson.type]}>{LESSON_TYPE_LABEL[lesson.type]}</Badge>
          {lesson.isFree && <Badge tone="success">Pulsuz önizləmə</Badge>}
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Clock className="h-3 w-3" /> {lesson.durationMin} dəq
          </span>
          {lesson.youtubeId && (
            <span className="font-mono text-[11px] text-slate-500">{lesson.youtubeId}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="xs" variant="secondary" leftIcon={<Eye className="h-3.5 w-3.5" />} onClick={() => onPreview(lesson)}>
          Bax
        </Button>
        <IconButton onClick={() => onEdit(lesson)} aria-label="Redaktə et">
          <Pencil className="h-4 w-4" />
        </IconButton>
        <IconButton
          onClick={() => onDelete(lesson)}
          aria-label="Sil"
          className="hover:bg-rose-500/15 hover:text-rose-300"
        >
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Dərs formu modalı                                                   */
/* ------------------------------------------------------------------ */
function LessonFormModal({
  open,
  onClose,
  courseId,
  existingModules,
  editing,
}: {
  open: boolean
  onClose: () => void
  courseId: string
  existingModules: string[]
  editing: Lesson | null
}) {
  const dispatch = useAppDispatch()
  const [createLesson, { isLoading: creating }] = useCreateLessonMutation()
  const [updateLesson, { isLoading: updating }] = useUpdateLessonMutation()

  const [form, setForm] = useState<LessonForm>(() =>
    editing
      ? {
          moduleTitle: editing.moduleTitle,
          customModule: '',
          title: editing.title,
          description: editing.description,
          durationMin: String(editing.durationMin),
          youtubeId: editing.youtubeId,
          type: editing.type,
          isFree: editing.isFree,
          resourceTitle: editing.resources[0]?.title ?? '',
          resourceUrl: editing.resources[0]?.url ?? '',
        }
      : { ...EMPTY_LESSON_FORM, moduleTitle: existingModules[0] ?? NEW_MODULE },
  )

  const resolvedModule = (): string =>
    form.moduleTitle === NEW_MODULE ? form.customModule.trim() : form.moduleTitle

  const handleSubmit = async () => {
    if (!form.title.trim() || !resolvedModule()) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: 'Modul və dərs adı daxil edilməlidir.' }))
      return
    }
    const payload: Omit<Lesson, 'id' | 'order' | 'moduleOrder'> = {
      courseId,
      moduleTitle: resolvedModule(),
      title: form.title.trim(),
      description: form.description.trim(),
      durationMin: Number(form.durationMin) || 0,
      youtubeId: form.youtubeId.trim(),
      type: form.type,
      isFree: form.isFree,
      resources:
        form.resourceTitle.trim() && form.resourceUrl.trim()
          ? [{ title: form.resourceTitle.trim(), url: form.resourceUrl.trim() }]
          : [],
    }
    try {
      if (editing) {
        await updateLesson({ id: editing.id, patch: payload }).unwrap()
        dispatch(pushToast({ type: 'success', title: 'Uğurlu', message: 'Dərs yeniləndi.' }))
      } else {
        await createLesson(payload).unwrap()
        dispatch(pushToast({ type: 'success', title: 'Uğurlu', message: 'Yeni dərs əlavə edildi.' }))
      }
      onClose()
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Dərsi redaktə et' : 'Yeni dərs'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Ləğv et
          </Button>
          <Button loading={creating || updating} onClick={handleSubmit} leftIcon={<Save className="h-4 w-4" />}>
            Yadda saxla
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Modul"
            value={form.moduleTitle}
            onChange={(e) => setForm((f) => ({ ...f, moduleTitle: e.target.value }))}
          >
            {existingModules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
            <option value={NEW_MODULE}>Yeni modul…</option>
          </Select>
          {form.moduleTitle === NEW_MODULE && (
            <Input
              label="Yeni modulun adı"
              value={form.customModule}
              onChange={(e) => setForm((f) => ({ ...f, customModule: e.target.value }))}
            />
          )}
        </div>

        <Input label="Dərsin adı" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        <Textarea
          label="Təsvir"
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Müddət (dəqiqə)"
            type="number"
            min={1}
            value={form.durationMin}
            onChange={(e) => setForm((f) => ({ ...f, durationMin: e.target.value }))}
          />
          <Select
            label="Növ"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as LessonType }))}
          >
            <option value="video">Video dərs</option>
            <option value="live">Canlı dərs</option>
            <option value="project">Layihə</option>
            <option value="quiz">Test</option>
          </Select>
          <Input
            label="YouTube ID"
            value={form.youtubeId}
            onChange={(e) => setForm((f) => ({ ...f, youtubeId: e.target.value }))}
            hint="YouTube video ID, məsələn: bMknfKXIFA8"
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-white">Pulsuz önizləmə</p>
            <p className="text-xs text-slate-500">Qeydiyyatsız istifadəçilər də baxa bilər</p>
          </div>
          <Toggle checked={form.isFree} onChange={(v) => setForm((f) => ({ ...f, isFree: v }))} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Resurs adı"
            value={form.resourceTitle}
            onChange={(e) => setForm((f) => ({ ...f, resourceTitle: e.target.value }))}
            hint="İstəyə bağlı"
          />
          <Input
            label="Resurs linki"
            value={form.resourceUrl}
            onChange={(e) => setForm((f) => ({ ...f, resourceUrl: e.target.value }))}
            hint="İstəyə bağlı"
          />
        </div>
      </div>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/* Əsas komponent                                                      */
/* ------------------------------------------------------------------ */
export default function TeacherLessons() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const teacherId = user?.id ?? ''

  const { data: allCourses = [], isLoading: coursesLoading } = useGetCoursesQuery()
  const courses = allCourses.filter((c) => c.teacherId === teacherId)

  const [selectedCourseId, setSelectedCourseId] = useState('')
  const activeCourseId = selectedCourseId || courses[0]?.id || ''

  const { data: lessons = [], isLoading: lessonsLoading } = useGetLessonsQuery(activeCourseId, {
    skip: !activeCourseId,
  })
  const { data: enrollments = [] } = useGetEnrollmentsQuery({ courseId: activeCourseId }, { skip: !activeCourseId })
  const [deleteLesson, { isLoading: deleting }] = useDeleteLessonMutation()

  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Lesson | null>(null)
  const [preview, setPreview] = useState<Lesson | null>(null)
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null)

  const activeCourse = courses.find((c) => c.id === activeCourseId)

  const filtered = lessons.filter((l) =>
    search.trim() ? l.title.toLowerCase().includes(search.trim().toLowerCase()) : true,
  )

  const modules: { title: string; items: Lesson[] }[] = []
  filtered.forEach((l) => {
    const found = modules.find((m) => m.title === l.moduleTitle)
    if (found) found.items.push(l)
    else modules.push({ title: l.moduleTitle, items: [l] })
  })
  modules.forEach((m) => m.items.sort((a, b) => a.order - b.order))

  const moduleNames = Array.from(new Set(lessons.map((l) => l.moduleTitle)))
  const freeCount = lessons.filter((l) => l.isFree).length
  const totalMinutes = lessons.reduce((s, l) => s + l.durationMin, 0)
  const avgCompletion = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length)
    : 0

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (lesson: Lesson) => {
    setEditing(lesson)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingLesson) return
    try {
      await deleteLesson(deletingLesson.id).unwrap()
      dispatch(pushToast({ type: 'success', title: 'Uğurlu', message: 'Dərs silindi.' }))
      setDeletingLesson(null)
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  if (coursesLoading) return <Loader label="Dərslər yüklənir..." />

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FolderKanban className="h-6 w-6" />}
        title="Dərslər & Silabus"
        subtitle="Kurslarınızın modul və dərslərini idarə edin."
        actions={
          courses.length > 0 ? (
            <div className="w-full max-w-xs">
              <Select value={activeCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
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

      {courses.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-6 w-6" />}
          title="Kurs tapılmadı"
          message="Silabus yaratmaq üçün əvvəlcə kurs yaradın."
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Sol tərəf — modul ağacı */}
          <div className="space-y-5 xl:col-span-2">
            <Panel className="animate-fade-up">
              <SectionTitle
                title={activeCourse?.title ?? 'Silabus'}
                subtitle={`${modules.length} modul · ${filtered.length} dərs`}
                icon={<Layers className="h-5 w-5" />}
                action={
                  <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
                    Yeni dərs
                  </Button>
                }
              />
              <div className="mb-4">
                <Input
                  placeholder="Dərs axtar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {lessonsLoading ? (
                <Loader label="Silabus yüklənir..." />
              ) : modules.length === 0 ? (
                <EmptyState
                  icon={<Layers className="h-6 w-6" />}
                  title={lessons.length === 0 ? 'Silabus boşdur' : 'Nəticə tapılmadı'}
                  message={
                    lessons.length === 0
                      ? 'Bu kursa ilk dərsi əlavə edin.'
                      : 'Axtarışa uyğun dərs tapılmadı.'
                  }
                  action={
                    <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
                      Yeni dərs əlavə et
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {modules.map((mod) => {
                    const isCollapsed = collapsed[mod.title] === true
                    const minutes = mod.items.reduce((s, l) => s + l.durationMin, 0)
                    return (
                      <div key={mod.title} className="rounded-2xl border border-white/10 bg-white/[0.02]">
                        <button
                          type="button"
                          onClick={() => setCollapsed((m) => ({ ...m, [mod.title]: !isCollapsed }))}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left"
                        >
                          {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          )}
                          <span className="flex-1">
                            <span className="block text-sm font-bold text-white">{mod.title}</span>
                            <span className="text-xs text-slate-500">
                              {mod.items.length} dərs · {minutes} dəq · Orta tamamlama {avgCompletion}%
                            </span>
                          </span>
                        </button>
                        {!isCollapsed && (
                          <div className="divide-y divide-white/5 border-t border-white/10">
                            {mod.items.map((lesson) => (
                              <LessonRow
                                key={lesson.id}
                                lesson={lesson}
                                onEdit={openEdit}
                                onPreview={setPreview}
                                onDelete={setDeletingLesson}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </Panel>
          </div>

          {/* Sağ tərəf — xülasə */}
          <div className="space-y-5">
            <Panel className="animate-fade-up animate-delay-100">
              <SectionTitle title="Silabus xülasəsi" subtitle="Ümumi göstəricilər" />
              <div className="space-y-3">
                <SummaryRow label="Modul sayı" value={String(modules.length)} />
                <SummaryRow label="Dərs sayı" value={String(lessons.length)} />
                <SummaryRow label="Ümumi saat" value={`${Math.round(totalMinutes / 60)} saat`} />
                <SummaryRow label="Pulsuz dərs" value={String(freeCount)} />
              </div>
              <div className="mt-5 flex flex-col items-center gap-2">
                <Ring value={avgCompletion} size={110} label="tamamlama" />
                <p className="text-center text-xs text-slate-400">
                  Tələbələrin orta tamamlama faizi
                </p>
              </div>
            </Panel>

            <Panel className="animate-fade-up animate-delay-200">
              <Button full leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
                Yeni dərs əlavə et
              </Button>
              {preview && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Son seçilmiş dərs
                  </p>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    <Play className="h-4 w-4 text-brand-300" />
                    <span className="truncate text-sm text-slate-200">{preview.title}</span>
                  </div>
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}

      <LessonFormModal
        key={`${formOpen ? 'open' : 'closed'}-${editing?.id ?? 'new'}-${activeCourseId}`}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        courseId={activeCourseId}
        existingModules={moduleNames}
        editing={editing}
      />

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview?.title ?? 'Dərs'}
        size="lg"
      >
        {preview && (
          <div className="space-y-3">
            <VideoPlayer
              youtubeId={preview.youtubeId || 'bMknfKXIFA8'}
              title={preview.title}
              badge={LESSON_TYPE_LABEL[preview.type]}
            />
            {preview.description && <p className="text-sm text-slate-400">{preview.description}</p>}
            {preview.resources.length > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <FileText className="h-4 w-4 text-accent-300" />
                <span className="text-sm text-slate-300">{preview.resources[0].title}</span>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingLesson)}
        onClose={() => setDeletingLesson(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Dərsi sil"
        message={`"${deletingLesson?.title ?? ''}" dərsini silmək istədiyinizə əminsiniz?`}
        confirmLabel="Sil"
      />
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  )
}
