import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  BookOpen,
  Check,
  CircleDollarSign,
  Eye,
  Layers,
  ListChecks,
  Pencil,
  Play,
  Plus,
  Save,
  Target,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react'
import type {
  Course,
  CourseLevel,
  CourseMode,
  CourseStatus,
  EnrollmentStatus,
  Lesson,
  LessonType,
} from '../../types'
import { useAppDispatch } from '../../app/hooks'
import {
  useCreateLessonMutation,
  useDeleteCourseMutation,
  useDeleteEnrollmentMutation,
  useDeleteLessonMutation,
  useGetCourseQuery,
  useGetEnrollmentsQuery,
  useGetLessonsQuery,
  useGetPaymentsQuery,
  useGetQuizQuery,
  useGetUsersQuery,
  useUpdateCourseMutation,
  useUpdateEnrollmentMutation,
  useUpdateLessonMutation,
} from '../../features/api/apiSlice'
import { pushToast } from '../../features/ui/uiSlice'
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  IconButton,
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
  Textarea,
  Th,
  Toggle,
} from '../../components/ui'
import { CoverImage, PageHeader, StatCard, VideoPlayer } from '../../components/common'
import { CourseCard } from '../../components/common/CourseCard'
import {
  ENROLLMENT_STATUS_LABEL,
  LESSON_TYPE_LABEL,
  LEVEL_LABEL,
  MODE_LABEL,
  formatAZN,
  formatDate,
  getErrMsg,
} from '../../lib/utils'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

type EditorTab = 'umumi' | 'silabus' | 'telebe' | 'test' | 'statistika'

const CATEGORY_OPTIONS = [
  'Frontend',
  'Backend',
  'Data & AI',
  'Dizayn',
  'Kibertəhlükəsizlik',
  'Mobil',
  'DevOps',
  'Marketinq',
  'Keyfiyyət (QA)',
]

const STATUS_TONE = {
  published: 'success',
  draft: 'warning',
  archived: 'neutral',
} as const

const STATUS_LABEL: Record<CourseStatus, string> = {
  published: 'Dərc edilmiş',
  draft: 'Qaralama',
  archived: 'Arxivlənmiş',
}

const LESSON_TONE = {
  video: 'brand',
  live: 'danger',
  project: 'neon',
  quiz: 'warning',
} as const

const splitList = (value: string): string[] =>
  value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

const listToText = (value: string[]): string => value.join('\n')

const textToList = (value: string): string[] =>
  value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

/* ================================================================== */
/* ÜMUMİ MƏLUMAT                                                      */
/* ================================================================== */
interface CourseEditForm {
  title: string
  category: string
  level: CourseLevel
  mode: CourseMode
  durationWeeks: string
  lessonsPerWeek: string
  totalHours: string
  basePrice: string
  oldPrice: string
  summary: string
  description: string
  tech: string
  tags: string
  outcomes: string
  requirements: string
  coverPrompt: string
  popular: boolean
}

function GeneralTab({ course }: { course: Course }) {
  const dispatch = useAppDispatch()
  const [updateCourse, { isLoading }] = useUpdateCourseMutation()
  const [form, setForm] = useState<CourseEditForm>(() => ({
    title: course.title,
    category: course.category,
    level: course.level,
    mode: course.mode,
    durationWeeks: String(course.durationWeeks),
    lessonsPerWeek: String(course.lessonsPerWeek),
    totalHours: String(course.totalHours),
    basePrice: String(course.basePrice),
    oldPrice: course.oldPrice ? String(course.oldPrice) : '',
    summary: course.summary,
    description: course.description,
    tech: course.tech.join(', '),
    tags: course.tags.join(', '),
    outcomes: listToText(course.outcomes),
    requirements: listToText(course.requirements),
    coverPrompt: course.coverPrompt,
    popular: course.popular,
  }))

  const preview: Course = {
    ...course,
    title: form.title,
    category: form.category,
    level: form.level,
    mode: form.mode,
    durationWeeks: Number(form.durationWeeks) || 0,
    totalHours: Number(form.totalHours) || 0,
    basePrice: Number(form.basePrice) || 0,
    oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
    summary: form.summary,
    tech: splitList(form.tech),
    tags: splitList(form.tags),
    popular: form.popular,
    coverPrompt: form.coverPrompt || course.coverPrompt,
  }

  const handleSave = async () => {
    try {
      await updateCourse({
        id: course.id,
        patch: {
          title: form.title.trim(),
          category: form.category,
          level: form.level,
          mode: form.mode,
          durationWeeks: Number(form.durationWeeks) || 1,
          lessonsPerWeek: Number(form.lessonsPerWeek) || 1,
          totalHours: Number(form.totalHours) || 0,
          basePrice: Number(form.basePrice) || 0,
          oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
          summary: form.summary.trim(),
          description: form.description.trim(),
          tech: splitList(form.tech),
          tags: splitList(form.tags),
          outcomes: textToList(form.outcomes),
          requirements: textToList(form.requirements),
          coverPrompt: form.coverPrompt.trim(),
          popular: form.popular,
        },
      }).unwrap()
      dispatch(pushToast({ type: 'success', title: 'Uğurlu', message: 'Kurs məlumatları yadda saxlanıldı.' }))
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Panel className="animate-fade-up space-y-4 xl:col-span-2">
        <SectionTitle title="Kurs məlumatları" subtitle="Bütün sahələri redaktə edə bilərsiniz" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Kursun adı"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Select
            label="Kateqoriya"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Səviyyə"
            value={form.level}
            onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as CourseLevel }))}
          >
            <option value="baslangic">Başlanğıc</option>
            <option value="orta">Orta</option>
            <option value="pesekar">Peşəkar</option>
          </Select>
          <Select
            label="Tədris rejimi"
            value={form.mode}
            onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value as CourseMode }))}
          >
            <option value="online">Onlayn</option>
            <option value="offline">Oflayn</option>
            <option value="hybrid">Hibrid</option>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Müddət (həftə)"
            type="number"
            min={1}
            value={form.durationWeeks}
            onChange={(e) => setForm((f) => ({ ...f, durationWeeks: e.target.value }))}
          />
          <Input
            label="Həftədə dərs"
            type="number"
            min={1}
            value={form.lessonsPerWeek}
            onChange={(e) => setForm((f) => ({ ...f, lessonsPerWeek: e.target.value }))}
          />
          <Input
            label="Ümumi saat"
            type="number"
            min={0}
            value={form.totalHours}
            onChange={(e) => setForm((f) => ({ ...f, totalHours: e.target.value }))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Baza qiymət (₼)"
            type="number"
            min={0}
            value={form.basePrice}
            onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
          />
          <Input
            label="Köhnə qiymət (₼)"
            type="number"
            min={0}
            value={form.oldPrice}
            onChange={(e) => setForm((f) => ({ ...f, oldPrice: e.target.value }))}
            hint="Endirim göstərmək üçün (istəyə bağlı)"
          />
        </div>

        <Textarea
          label="Xülasə"
          rows={2}
          value={form.summary}
          onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
        />
        <Textarea
          label="Ətraflı təsvir"
          rows={4}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Texnologiyalar"
            value={form.tech}
            onChange={(e) => setForm((f) => ({ ...f, tech: e.target.value }))}
            hint="Vergüllə ayırın"
          />
          <Input
            label="Teqlər"
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            hint="Vergüllə ayırın"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Textarea
            label="Nəticələr (outcomes)"
            rows={4}
            value={form.outcomes}
            onChange={(e) => setForm((f) => ({ ...f, outcomes: e.target.value }))}
            hint="Hər sətirdə bir nəticə"
          />
          <Textarea
            label="Tələblər (requirements)"
            rows={4}
            value={form.requirements}
            onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
            hint="Hər sətirdə bir tələb"
          />
        </div>

        <Input
          label="Cover şəkil promptu"
          value={form.coverPrompt}
          onChange={(e) => setForm((f) => ({ ...f, coverPrompt: e.target.value }))}
        />

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-white">Populyar kurs</p>
            <p className="text-xs text-slate-500">Ana səhifədə önə çıxarılsın</p>
          </div>
          <Toggle
            checked={form.popular}
            onChange={(v) => setForm((f) => ({ ...f, popular: v }))}
          />
        </div>

        <div className="flex justify-end">
          <Button loading={isLoading} onClick={handleSave} leftIcon={<Save className="h-4 w-4" />}>
            Yadda saxla
          </Button>
        </div>
      </Panel>

      <div className="space-y-6">
        <Panel className="animate-fade-up animate-delay-100">
          <SectionTitle title="Canlı önizləmə" subtitle="Tələbələrin gördüyü kart" />
          <CourseCard course={preview} />
        </Panel>
        <Panel className="animate-fade-up animate-delay-200">
          <SectionTitle title="Örtük şəkli" subtitle="Avtomatik yaradılan cover" />
          <CoverImage prompt={preview.coverPrompt} title={preview.title} tech={preview.tech} />
        </Panel>
      </div>
    </div>
  )
}

/* ================================================================== */
/* SİLABUS & DƏRSLƏR                                                   */
/* ================================================================== */
const NEW_MODULE = '__new_module__'

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

function SyllabusTab({ course }: { course: Course }) {
  const dispatch = useAppDispatch()
  const { data: lessons = [] } = useGetLessonsQuery(course.id)
  const [createLesson, { isLoading: creating }] = useCreateLessonMutation()
  const [updateLesson, { isLoading: updating }] = useUpdateLessonMutation()
  const [deleteLesson, { isLoading: deleting }] = useDeleteLessonMutation()

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<LessonForm>(EMPTY_LESSON_FORM)
  const [editing, setEditing] = useState<Lesson | null>(null)
  const [preview, setPreview] = useState<Lesson | null>(null)
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null)

  const modules: { title: string; items: Lesson[] }[] = []
  lessons.forEach((l) => {
    const found = modules.find((m) => m.title === l.moduleTitle)
    if (found) found.items.push(l)
    else modules.push({ title: l.moduleTitle, items: [l] })
  })
  modules.forEach((m) => m.items.sort((a, b) => a.order - b.order))
  const moduleNames = modules.map((m) => m.title)
  const totalMinutes = lessons.reduce((s, l) => s + l.durationMin, 0)

  const openCreate = (moduleTitle?: string) => {
    setEditing(null)
    setForm({ ...EMPTY_LESSON_FORM, moduleTitle: moduleTitle ?? moduleNames[0] ?? NEW_MODULE })
    setFormOpen(true)
  }

  const openEdit = (lesson: Lesson) => {
    setEditing(lesson)
    setForm({
      moduleTitle: lesson.moduleTitle,
      customModule: '',
      title: lesson.title,
      description: lesson.description,
      durationMin: String(lesson.durationMin),
      youtubeId: lesson.youtubeId,
      type: lesson.type,
      isFree: lesson.isFree,
      resourceTitle: lesson.resources[0]?.title ?? '',
      resourceUrl: lesson.resources[0]?.url ?? '',
    })
    setFormOpen(true)
  }

  const resolvedModule = (): string =>
    form.moduleTitle === NEW_MODULE ? form.customModule.trim() : form.moduleTitle

  const buildPayload = (): Omit<Lesson, 'id' | 'order' | 'moduleOrder'> => ({
    courseId: course.id,
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
  })

  const handleSubmit = async () => {
    if (!form.title.trim() || !resolvedModule()) {
      dispatch(
        pushToast({ type: 'error', title: 'Xəta', message: 'Modul və dərs adı daxil edilməlidir.' }),
      )
      return
    }
    try {
      if (editing) {
        await updateLesson({ id: editing.id, patch: buildPayload() }).unwrap()
        dispatch(pushToast({ type: 'success', title: 'Uğurlu', message: 'Dərs yeniləndi.' }))
      } else {
        await createLesson(buildPayload()).unwrap()
        dispatch(pushToast({ type: 'success', title: 'Uğurlu', message: 'Yeni dərs əlavə edildi.' }))
      }
      setFormOpen(false)
      setEditing(null)
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
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

  return (
    <div className="space-y-6">
      <Panel className="animate-fade-up">
        <SectionTitle
          title="Silabus"
          subtitle={`${modules.length} modul · ${lessons.length} dərs · ${Math.round(totalMinutes / 60)} saat`}
          icon={<Layers className="h-5 w-5" />}
          action={
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => openCreate()}>
              Yeni dərs
            </Button>
          }
        />
        {lessons.length === 0 ? (
          <EmptyState
            icon={<Layers className="h-6 w-6" />}
            title="Silabus boşdur"
            message="Kursa ilk dərsi əlavə edərək silabusu formalaşdırın."
            action={
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => openCreate()}>
                Yeni dərs əlavə et
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {modules.map((mod) => (
              <div key={mod.title} className="rounded-2xl border border-white/10 bg-white/[0.02]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-white">{mod.title}</p>
                    <p className="text-xs text-slate-500">
                      {mod.items.length} dərs · {mod.items.reduce((s, l) => s + l.durationMin, 0)} dəq
                    </p>
                  </div>
                  <Button
                    size="xs"
                    variant="ghost"
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                    onClick={() => openCreate(mod.title)}
                  >
                    Dərs əlavə et
                  </Button>
                </div>
                <div className="divide-y divide-white/5">
                  {mod.items.map((lesson) => (
                    <div key={lesson.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-xs font-bold text-slate-300">
                        {lesson.order}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{lesson.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge tone={LESSON_TONE[lesson.type]}>{LESSON_TYPE_LABEL[lesson.type]}</Badge>
                          {lesson.isFree && <Badge tone="success">Pulsuz önizləmə</Badge>}
                          <span className="text-xs text-slate-500">{lesson.durationMin} dəq</span>
                          {lesson.youtubeId && (
                            <span className="font-mono text-[11px] text-slate-500">{lesson.youtubeId}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="xs"
                          variant="secondary"
                          leftIcon={<Eye className="h-3.5 w-3.5" />}
                          onClick={() => setPreview(lesson)}
                        >
                          Bax
                        </Button>
                        <IconButton onClick={() => openEdit(lesson)} aria-label="Redaktə et">
                          <Pencil className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          onClick={() => setDeletingLesson(lesson)}
                          aria-label="Sil"
                          className="hover:bg-rose-500/15 hover:text-rose-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Dərsi redaktə et' : 'Yeni dərs'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
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
              {moduleNames.map((m) => (
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
                placeholder="Məsələn: Giriş"
              />
            )}
          </div>

          <Input
            label="Dərsin adı"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
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
              className="sm:col-span-1"
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

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview?.title ?? 'Dərs'}
        size="lg"
      >
        {preview && (
          <VideoPlayer
            youtubeId={preview.youtubeId || 'bMknfKXIFA8'}
            title={preview.title}
            badge={LESSON_TYPE_LABEL[preview.type]}
          />
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

/* ================================================================== */
/* TƏLƏBƏLƏR                                                            */
/* ================================================================== */
function StudentsTab({ course }: { course: Course }) {
  const dispatch = useAppDispatch()
  const { data: enrollments = [] } = useGetEnrollmentsQuery({ courseId: course.id })
  const { data: users = [] } = useGetUsersQuery()
  const [updateEnrollment] = useUpdateEnrollmentMutation()
  const [deleteEnrollment, { isLoading: deleting }] = useDeleteEnrollmentMutation()

  const [grading, setGrading] = useState<{ id: string; name: string } | null>(null)
  const [gradeValue, setGradeValue] = useState('')
  const [gradeNote, setGradeNote] = useState('')
  const [deletingEnrollment, setDeletingEnrollment] = useState<{ id: string; name: string } | null>(null)

  const userMap = new Map(users.map((u) => [u.id, u]))

  const openGrade = (id: string, name: string, current: number | null) => {
    setGrading({ id, name })
    setGradeValue(current !== null ? String(current) : '')
    setGradeNote('')
  }

  const saveGrade = async () => {
    if (!grading) return
    try {
      await updateEnrollment({
        id: grading.id,
        patch: { grade: gradeValue.trim() ? Number(gradeValue) : null, note: gradeNote.trim() },
      }).unwrap()
      dispatch(pushToast({ type: 'success', title: 'Uğurlu', message: 'Bal yadda saxlanıldı.' }))
      setGrading(null)
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const changeStatus = async (id: string, status: EnrollmentStatus) => {
    try {
      await updateEnrollment({ id, patch: { status } }).unwrap()
      dispatch(pushToast({ type: 'success', title: 'Uğurlu', message: 'Status yeniləndi.' }))
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const confirmDelete = async () => {
    if (!deletingEnrollment) return
    try {
      await deleteEnrollment(deletingEnrollment.id).unwrap()
      dispatch(pushToast({ type: 'success', title: 'Uğurlu', message: 'Qeydiyyat silindi.' }))
      setDeletingEnrollment(null)
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  if (enrollments.length === 0) {
    return (
      <Panel className="animate-fade-up">
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="Bu kursda tələbə yoxdur"
          message="Kursa hələ heç kim qeydiyyatdan keçməyib."
        />
      </Panel>
    )
  }

  return (
    <Panel className="animate-fade-up">
      <SectionTitle
        title="Kursun tələbələri"
        subtitle={`${enrollments.length} qeydiyyat`}
        icon={<Users className="h-5 w-5" />}
      />
      <TableWrap>
        <thead>
          <tr>
            <Th>Tələbə</Th>
            <Th>Paket</Th>
            <Th>Rejim</Th>
            <Th>Qeydiyyat tarixi</Th>
            <Th className="w-[150px]">İrəliləyiş</Th>
            <Th>Bal</Th>
            <Th>Status</Th>
            <Th>Əməliyyat</Th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map((e) => {
            const student = userMap.get(e.studentId)
            const name = student?.fullName ?? 'Naməlum tələbə'
            return (
              <tr key={e.id} className="transition-colors hover:bg-white/[0.03]">
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={name} gradient={student?.avatar} size={36} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{name}</p>
                      <p className="truncate text-xs text-slate-500">{student?.email}</p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <Badge tone="neon">{e.packageTier.toUpperCase()}</Badge>
                </Td>
                <Td>{MODE_LABEL[e.mode]}</Td>
                <Td>{formatDate(e.createdAt)}</Td>
                <Td>
                  <Progress value={e.progress} showLabel />
                </Td>
                <Td>
                  {e.grade !== null ? (
                    <Badge tone={e.grade >= 80 ? 'success' : e.grade >= 60 ? 'warning' : 'danger'}>
                      {e.grade}
                    </Badge>
                  ) : (
                    <span className="text-xs text-slate-500">—</span>
                  )}
                </Td>
                <Td>
                  <Select
                    value={e.status}
                    onChange={(ev) => changeStatus(e.id, ev.target.value as EnrollmentStatus)}
                    className="w-[140px]"
                  >
                    {(['pending', 'active', 'completed', 'cancelled'] as EnrollmentStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {ENROLLMENT_STATUS_LABEL[s]}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Button size="xs" variant="secondary" onClick={() => openGrade(e.id, name, e.grade)}>
                      Bal ver
                    </Button>
                    <IconButton
                      onClick={() => setDeletingEnrollment({ id: e.id, name })}
                      aria-label="Qeydiyyatı sil"
                      className="hover:bg-rose-500/15 hover:text-rose-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </Td>
              </tr>
            )
          })}
        </tbody>
      </TableWrap>

      <Modal
        open={Boolean(grading)}
        onClose={() => setGrading(null)}
        title="Bal ver"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setGrading(null)}>
              Ləğv et
            </Button>
            <Button onClick={saveGrade} leftIcon={<Check className="h-4 w-4" />}>
              Yadda saxla
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">{grading?.name}</p>
          <Input
            label="Bal (0–100)"
            type="number"
            min={0}
            max={100}
            value={gradeValue}
            onChange={(e) => setGradeValue(e.target.value)}
          />
          <Textarea
            label="Qeyd"
            rows={3}
            value={gradeNote}
            onChange={(e) => setGradeNote(e.target.value)}
            placeholder="Tələbə haqqında qısa rəy"
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingEnrollment)}
        onClose={() => setDeletingEnrollment(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Qeydiyyatı sil"
        message={`${deletingEnrollment?.name ?? ''} adlı tələbənin qeydiyyatını silmək istəyirsiniz?`}
        confirmLabel="Sil"
      />
    </Panel>
  )
}

/* ================================================================== */
/* TEST (QƏBUL)                                                        */
/* ================================================================== */
function QuizTab({ course }: { course: Course }) {
  const { data: quiz, isLoading } = useGetQuizQuery(course.id)

  if (isLoading) return <Loader label="Test yüklənir..." />
  if (!quiz) {
    return (
      <Panel className="animate-fade-up">
        <EmptyState
          icon={<ListChecks className="h-6 w-6" />}
          title="Bu kurs üçün qəbul testi yoxdur"
          message="Qəbul testi təyin edilməyib. Test əlavə etmək üçün administratorla əlaqə saxlayın."
        />
      </Panel>
    )
  }

  return (
    <Panel className="animate-fade-up space-y-4">
      <SectionTitle
        title="Qəbul testi"
        subtitle={`${quiz.questions.length} sual · Keçid balı: ${quiz.passScore}`}
        icon={<ListChecks className="h-5 w-5" />}
      />
      {quiz.questions.map((q, i) => (
        <div key={q.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-white">
              {i + 1}. {q.question}
            </p>
            <Badge tone="neutral">{q.topic}</Badge>
          </div>
          <div className="mt-3 space-y-2">
            {q.options.map((opt, oi) => (
              <div
                key={oi}
                className={
                  oi === q.correctIndex
                    ? 'flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2'
                    : 'flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2'
                }
              >
                <span className="text-xs font-bold text-slate-400">{String.fromCharCode(65 + oi)}</span>
                <span className="text-sm text-slate-200">{opt}</span>
                {oi === q.correctIndex && (
                  <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-emerald-300">
                    <Check className="h-3.5 w-3.5" /> Düzgün cavab
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </Panel>
  )
}

/* ================================================================== */
/* STATİSTİKA                                                          */
/* ================================================================== */
function StatsTab({ course }: { course: Course }) {
  const { data: enrollments = [] } = useGetEnrollmentsQuery({ courseId: course.id })
  const { data: payments = [] } = useGetPaymentsQuery()

  const students = new Set(enrollments.map((e) => e.studentId)).size
  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length)
    : 0
  const graded = enrollments.filter((e) => e.grade !== null)
  const avgGrade = graded.length
    ? Math.round(graded.reduce((s, e) => s + (e.grade ?? 0), 0) / graded.length)
    : 0
  const revenue = payments
    .filter((p) => p.courseId === course.id && p.status === 'paid')
    .reduce((s, p) => s + p.amount, 0)

  const statusData = [
    { name: 'Aktiv', key: 'active', value: enrollments.filter((e) => e.status === 'active').length, color: '#6366f1' },
    { name: 'Tamamlanan', key: 'completed', value: enrollments.filter((e) => e.status === 'completed').length, color: '#10b981' },
    { name: 'Gözləmədə', key: 'pending', value: enrollments.filter((e) => e.status === 'pending').length, color: '#f59e0b' },
    { name: 'Ləğv', key: 'cancelled', value: enrollments.filter((e) => e.status === 'cancelled').length, color: '#f43f5e' },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tələbə sayı" value={students} icon={<Users className="h-5 w-5" />} tone="brand" />
        <StatCard
          label="Orta irəliləyiş"
          value={`${avgProgress}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="Orta bal"
          value={avgGrade || '—'}
          icon={<Award className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          label="Gəlir"
          value={formatAZN(revenue)}
          icon={<CircleDollarSign className="h-5 w-5" />}
          tone="emerald"
        />
      </div>

      <Panel className="animate-fade-up animate-delay-100">
        <SectionTitle
          title="Qeydiyyat statuslarının bölgüsü"
          subtitle="Tələbələrin hazırkı vəziyyəti"
          icon={<Target className="h-5 w-5" />}
        />
        {statusData.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">Məlumat yoxdur.</p>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3}>
                  {statusData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#0d1326',
                    border: '1px solid rgba(255,255,255,.1)',
                    borderRadius: 12,
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          {statusData.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-2 text-xs text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
              {s.name}: {s.value}
            </span>
          ))}
        </div>
      </Panel>
    </div>
  )
}

/* ================================================================== */
/* ƏSAS KOMPONENT                                                      */
/* ================================================================== */
export default function TeacherCourseEditor() {
  const { courseId = '' } = useParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { data: course, isLoading } = useGetCourseQuery(courseId, { skip: !courseId })
  const [updateCourse, { isLoading: toggling }] = useUpdateCourseMutation()
  const [deleteCourse, { isLoading: deleting }] = useDeleteCourseMutation()
  const [tab, setTab] = useState<EditorTab>('umumi')
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (isLoading) return <Loader label="Kurs yüklənir..." />

  if (!course) {
    return (
      <EmptyState
        icon={<BookOpen className="h-6 w-6" />}
        title="Kurs tapılmadı"
        message="Bu kurs mövcud deyil və ya silinib."
        action={
          <Link to="/panel/muellim/kurslar">
            <Button leftIcon={<ArrowLeft className="h-4 w-4" />}>Kurslarım</Button>
          </Link>
        }
      />
    )
  }

  const toggleStatus = async () => {
    const next: CourseStatus = course.status === 'published' ? 'archived' : 'published'
    try {
      await updateCourse({ id: course.id, patch: { status: next } }).unwrap()
      dispatch(
        pushToast({
          type: 'success',
          title: 'Uğurlu',
          message: next === 'published' ? 'Kurs dərc edildi.' : 'Kurs arxivləndi.',
        }),
      )
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCourse(course.id).unwrap()
      dispatch(pushToast({ type: 'success', title: 'Uğurlu', message: 'Kurs silindi.' }))
      navigate('/panel/muellim/kurslar')
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  return (
    <div className="space-y-6">
      <Link
        to="/panel/muellim/kurslar"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Kurslarım
      </Link>

      <PageHeader
        icon={<BookOpen className="h-6 w-6" />}
        title={course.title}
        subtitle={`${course.category} · ${LEVEL_LABEL[course.level]} · ${MODE_LABEL[course.mode]}`}
        actions={
          <>
            <Badge tone={STATUS_TONE[course.status]}>{STATUS_LABEL[course.status]}</Badge>
            <Button
              variant={course.status === 'published' ? 'secondary' : 'primary'}
              loading={toggling}
              onClick={toggleStatus}
              leftIcon={<Play className="h-4 w-4" />}
            >
              {course.status === 'published' ? 'Arxivlə' : 'Kursu dərc et'}
            </Button>
            <Button
              variant="danger"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => setConfirmDelete(true)}
            >
              Sil
            </Button>
          </>
        }
      />

      <Panel className="animate-fade-up">
        <Tabs<EditorTab>
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'umumi', label: 'Ümumi məlumat' },
            { value: 'silabus', label: 'Silabus & Dərslər' },
            { value: 'telebe', label: 'Tələbələr' },
            { value: 'test', label: 'Test (Qəbul)' },
            { value: 'statistika', label: 'Statistika' },
          ]}
        />
      </Panel>

      <div key={course.id}>
        {tab === 'umumi' && <GeneralTab course={course} />}
        {tab === 'silabus' && <SyllabusTab course={course} />}
        {tab === 'telebe' && <StudentsTab course={course} />}
        {tab === 'test' && <QuizTab course={course} />}
        {tab === 'statistika' && <StatsTab course={course} />}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Kursu sil"
        message={`"${course.title}" kursunu tamamilə silmək istədiyinizə əminsiniz?`}
        confirmLabel="Sil"
      />
    </div>
  )
}
