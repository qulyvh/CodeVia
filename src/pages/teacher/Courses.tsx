import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  Pencil,
  Plus,
  Search,
  Settings2,
  Trash2,
} from 'lucide-react'
import type { Course, CourseLevel, CourseMode, CourseStatus } from '../../types'
import { useAppDispatch, useAuth } from '../../app/hooks'
import {
  useCreateCourseMutation,
  useDeleteCourseMutation,
  useGetCoursesQuery,
  useGetLessonsQuery,
  useUpdateCourseMutation,
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
  Rating,
  Select,
  Tabs,
  Textarea,
} from '../../components/ui'
import { CoverImage, PageHeader } from '../../components/common'
import { LEVEL_LABEL, MODE_LABEL, formatAZN, getErrMsg } from '../../lib/utils'

/* Kateqoriyalar (Azərbaycan dilində) */
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

type StatusTab = 'all' | CourseStatus

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

interface CourseFormState {
  title: string
  category: string
  level: CourseLevel
  mode: CourseMode
  basePrice: string
  durationWeeks: string
  lessonsPerWeek: string
  totalHours: string
  summary: string
  description: string
  tech: string
  tags: string
  coverPrompt: string
}

const EMPTY_FORM: CourseFormState = {
  title: '',
  category: CATEGORY_OPTIONS[0],
  level: 'baslangic',
  mode: 'online',
  basePrice: '300',
  durationWeeks: '12',
  lessonsPerWeek: '2',
  totalHours: '48',
  summary: '',
  description: '',
  tech: '',
  tags: '',
  coverPrompt: '',
}

function formFromCourse(course: Course): CourseFormState {
  return {
    title: course.title,
    category: course.category,
    level: course.level,
    mode: course.mode,
    basePrice: String(course.basePrice),
    durationWeeks: String(course.durationWeeks),
    lessonsPerWeek: String(course.lessonsPerWeek),
    totalHours: String(course.totalHours),
    summary: course.summary,
    description: course.description,
    tech: course.tech.join(', '),
    tags: course.tags.join(', '),
    coverPrompt: course.coverPrompt,
  }
}

const splitList = (value: string): string[] =>
  value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

/* Dərs sayğacı — hər kurs üçün ayrıca hook çağırışı */
function LessonCounter({ courseId }: { courseId: string }) {
  const { data: lessons = [] } = useGetLessonsQuery(courseId)
  return <span>{lessons.length} dərs</span>
}

function CourseFormFields({
  value,
  onChange,
}: {
  value: CourseFormState
  onChange: (patch: Partial<CourseFormState>) => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Kursun adı"
          required
          value={value.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Məsələn: React ilə Frontend Development"
        />
        <Select
          label="Kateqoriya"
          value={value.category}
          onChange={(e) => onChange({ category: e.target.value })}
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
          value={value.level}
          onChange={(e) => onChange({ level: e.target.value as CourseLevel })}
        >
          <option value="baslangic">Başlanğıc</option>
          <option value="orta">Orta</option>
          <option value="pesekar">Peşəkar</option>
        </Select>
        <Select
          label="Tədris rejimi"
          value={value.mode}
          onChange={(e) => onChange({ mode: e.target.value as CourseMode })}
        >
          <option value="online">Onlayn</option>
          <option value="offline">Oflayn</option>
          <option value="hybrid">Hibrid</option>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Baza qiymət (₼)"
          type="number"
          min={0}
          value={value.basePrice}
          onChange={(e) => onChange({ basePrice: e.target.value })}
        />
        <Input
          label="Müddət (həftə)"
          type="number"
          min={1}
          value={value.durationWeeks}
          onChange={(e) => onChange({ durationWeeks: e.target.value })}
        />
        <Input
          label="Həftədə dərs"
          type="number"
          min={1}
          value={value.lessonsPerWeek}
          onChange={(e) => onChange({ lessonsPerWeek: e.target.value })}
        />
        <Input
          label="Ümumi saat"
          type="number"
          min={1}
          value={value.totalHours}
          onChange={(e) => onChange({ totalHours: e.target.value })}
        />
      </div>

      <Textarea
        label="Qısa təsvir (xülasə)"
        value={value.summary}
        onChange={(e) => onChange({ summary: e.target.value })}
        rows={2}
        placeholder="Kursun bir-iki cümləlik xülasəsi"
      />
      <Textarea
        label="Ətraflı təsvir"
        value={value.description}
        onChange={(e) => onChange({ description: e.target.value })}
        rows={4}
        placeholder="Kursun məzmunu, kimlər üçün nəzərdə tutulduğu və s."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Texnologiyalar"
          value={value.tech}
          onChange={(e) => onChange({ tech: e.target.value })}
          placeholder="React, TypeScript, Redux"
          hint="Vergüllə ayırın"
        />
        <Input
          label="Teqlər"
          value={value.tags}
          onChange={(e) => onChange({ tags: e.target.value })}
          placeholder="frontend, javascript"
          hint="Vergüllə ayırın"
        />
      </div>

      <Input
        label="Cover şəkil promptu"
        value={value.coverPrompt}
        onChange={(e) => onChange({ coverPrompt: e.target.value })}
        placeholder="modern react code editor illustration"
        hint="Kurs üçün avtomatik yaradılan örtük şəklini təsvir edin"
      />
    </div>
  )
}

export default function TeacherCourses() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const teacherId = user?.id ?? ''

  const { data: allCourses = [], isLoading } = useGetCoursesQuery()
  const [createCourse, { isLoading: creating }] = useCreateCourseMutation()
  const [updateCourse, { isLoading: updating }] = useUpdateCourseMutation()
  const [deleteCourse, { isLoading: deleting }] = useDeleteCourseMutation()

  const [tab, setTab] = useState<StatusTab>('all')
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState<CourseFormState>(EMPTY_FORM)
  const [editing, setEditing] = useState<Course | null>(null)
  const [statsFor, setStatsFor] = useState<Course | null>(null)
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)

  const courses = allCourses.filter((c) => c.teacherId === teacherId)

  const counts = {
    all: courses.length,
    published: courses.filter((c) => c.status === 'published').length,
    draft: courses.filter((c) => c.status === 'draft').length,
    archived: courses.filter((c) => c.status === 'archived').length,
  }

  const visible = courses
    .filter((c) => (tab === 'all' ? true : c.status === tab))
    .filter((c) =>
      search.trim()
        ? `${c.title} ${c.category}`.toLowerCase().includes(search.trim().toLowerCase())
        : true,
    )

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setCreateOpen(true)
  }

  const openEdit = (course: Course) => {
    setForm(formFromCourse(course))
    setEditing(course)
  }

  const handleCreate = async () => {
    if (!form.title.trim()) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: 'Kursun adı daxil edilməlidir.' }))
      return
    }
    try {
      const payload: Omit<Course, 'id' | 'slug' | 'createdAt'> = {
        title: form.title.trim(),
        category: form.category,
        level: form.level,
        mode: form.mode,
        summary: form.summary.trim(),
        description: form.description.trim(),
        teacherId,
        durationWeeks: Number(form.durationWeeks) || 1,
        lessonsPerWeek: Number(form.lessonsPerWeek) || 1,
        totalHours: Number(form.totalHours) || 0,
        basePrice: Number(form.basePrice) || 0,
        rating: 5,
        reviewCount: 0,
        studentCount: 0,
        tags: splitList(form.tags),
        outcomes: [],
        requirements: [],
        tech: splitList(form.tech),
        coverPrompt: form.coverPrompt.trim() || form.title.trim(),
        accent: 'brand',
        status: 'draft',
        popular: false,
      }
      await createCourse(payload).unwrap()
      dispatch(
        pushToast({ type: 'success', title: 'Uğurlu', message: 'Yeni kurs qaralama kimi yaradıldı.' }),
      )
      setCreateOpen(false)
      setForm(EMPTY_FORM)
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const handleUpdate = async () => {
    if (!editing) return
    try {
      await updateCourse({
        id: editing.id,
        patch: {
          title: form.title.trim(),
          category: form.category,
          level: form.level,
          mode: form.mode,
          summary: form.summary.trim(),
          description: form.description.trim(),
          durationWeeks: Number(form.durationWeeks) || 1,
          lessonsPerWeek: Number(form.lessonsPerWeek) || 1,
          totalHours: Number(form.totalHours) || 0,
          basePrice: Number(form.basePrice) || 0,
          tech: splitList(form.tech),
          tags: splitList(form.tags),
          coverPrompt: form.coverPrompt.trim(),
        },
      }).unwrap()
      dispatch(pushToast({ type: 'success', title: 'Uğurlu', message: 'Kurs məlumatları yeniləndi.' }))
      setEditing(null)
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const handleDelete = async () => {
    if (!deletingCourse) return
    try {
      await deleteCourse(deletingCourse.id).unwrap()
      dispatch(pushToast({ type: 'success', title: 'Uğurlu', message: 'Kurs silindi.' }))
      setDeletingCourse(null)
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  if (isLoading) return <Loader label="Kurslar yüklənir..." />

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<BookOpen className="h-6 w-6" />}
        title="Kurslarım"
        subtitle="Kurslarınızı yaradın, redaktə edin və dərc edin."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Yeni kurs
          </Button>
        }
      />

      <Panel className="animate-fade-up">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs<StatusTab>
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'all', label: 'Hamısı', count: counts.all },
              { value: 'published', label: 'Dərc edilmiş', count: counts.published },
              { value: 'draft', label: 'Qaralama', count: counts.draft },
              { value: 'archived', label: 'Arxivlənmiş', count: counts.archived },
            ]}
          />
          <div className="w-full max-w-xs">
            <Input
              placeholder="Kurs axtar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Panel>

      {visible.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title={courses.length === 0 ? 'Hələ kursunuz yoxdur' : 'Nəticə tapılmadı'}
          message={
            courses.length === 0
              ? 'İlk kursunuzu yaradaraq tələbələri cəlb etməyə başlayın.'
              : 'Axtarış və filtr şərtlərinə uyğun kurs tapılmadı.'
          }
          action={
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              Yeni kurs yarat
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((course, i) => (
            <Panel
              key={course.id}
              className={`animate-fade-up flex flex-col p-4 ${i % 3 === 1 ? 'animate-delay-100' : i % 3 === 2 ? 'animate-delay-200' : ''}`}
            >
              <div className="relative">
                <CoverImage
                  prompt={course.coverPrompt}
                  title={course.title}
                  tech={course.tech}
                  ratio="aspect-[16/9]"
                />
                <div className="absolute right-3 top-3">
                  <Badge tone={STATUS_TONE[course.status]}>{STATUS_LABEL[course.status]}</Badge>
                </div>
              </div>

              <div className="mt-4 flex flex-1 flex-col">
                <h3 className="text-base font-bold text-white">{course.title}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone="brand">{course.category}</Badge>
                  <Badge tone="neutral">{LEVEL_LABEL[course.level]}</Badge>
                  <Badge tone="accent">{MODE_LABEL[course.mode]}</Badge>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-2 py-2">
                    <p className="text-base font-bold text-white">{course.studentCount}</p>
                    <p className="text-[10px] text-slate-500">Tələbə</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-2 py-2">
                    <p className="text-base font-bold text-white">
                      <LessonCounter courseId={course.id} />
                    </p>
                    <p className="text-[10px] text-slate-500">Dərs</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-2 py-2">
                    <p className="text-base font-bold text-white">{course.totalHours}</p>
                    <p className="text-[10px] text-slate-500">Saat</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <Rating value={course.rating} count={course.reviewCount} />
                  <span className="text-lg font-extrabold text-white">{formatAZN(course.basePrice)}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to={`/panel/muellim/kurslar/${course.id}`} className="flex-1">
                    <Button variant="outline" size="sm" full leftIcon={<Settings2 className="h-3.5 w-3.5" />}>
                      İdarə et
                    </Button>
                  </Link>
                  <IconButton onClick={() => openEdit(course)} aria-label="Redaktə et">
                    <Pencil className="h-4 w-4" />
                  </IconButton>
                  <IconButton onClick={() => setStatsFor(course)} aria-label="Statistika">
                    <BarChart3 className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    onClick={() => setDeletingCourse(course)}
                    aria-label="Sil"
                    className="hover:bg-rose-500/15 hover:text-rose-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* ---------------- Yeni kurs modalı ---------------- */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Yeni kurs"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Ləğv et
            </Button>
            <Button loading={creating} onClick={handleCreate} leftIcon={<Plus className="h-4 w-4" />}>
              Kursu yarat
            </Button>
          </>
        }
      >
        <CourseFormFields value={form} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} />
      </Modal>

      {/* ---------------- Redaktə modalı ---------------- */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Kursu redaktə et"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Ləğv et
            </Button>
            <Button loading={updating} onClick={handleUpdate}>
              Yadda saxla
            </Button>
          </>
        }
      >
        <CourseFormFields value={form} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} />
      </Modal>

      {/* ---------------- Statistika modalı ---------------- */}
      <Modal
        open={Boolean(statsFor)}
        onClose={() => setStatsFor(null)}
        title={statsFor ? `${statsFor.title} — Statistika` : 'Statistika'}
        size="md"
      >
        {statsFor && (
          <div className="space-y-5">
            <p className="text-sm text-slate-400">{statsFor.summary || 'Qısa təsvir yoxdur.'}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <p className="text-xl font-bold text-white">{statsFor.studentCount}</p>
                <p className="text-xs text-slate-500">Tələbə</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <p className="text-xl font-bold text-white">{statsFor.durationWeeks}</p>
                <p className="text-xs text-slate-500">Həftə</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <p className="text-xl font-bold text-white">{statsFor.lessonsPerWeek}</p>
                <p className="text-xs text-slate-500">Həftədə dərs</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <p className="text-xl font-bold text-white">{statsFor.totalHours}</p>
                <p className="text-xs text-slate-500">Saat</p>
              </div>
            </div>
            <div className="divider" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Reytinq</span>
              <Rating value={statsFor.rating} count={statsFor.reviewCount} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Qiymət</span>
              <span className="font-bold text-white">{formatAZN(statsFor.basePrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Yaradılma tarixi</span>
              <span className="text-slate-300">{statsFor.createdAt}</span>
            </div>
            <Link to={`/panel/muellim/kurslar/${statsFor.id}`}>
              <Button full variant="outline" leftIcon={<Search className="h-4 w-4" />}>
                Kurs redaktorunu aç
              </Button>
            </Link>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingCourse)}
        onClose={() => setDeletingCourse(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Kursu sil"
        message={`"${deletingCourse?.title ?? ''}" kursunu silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.`}
        confirmLabel="Sil"
      />
    </div>
  )
}
