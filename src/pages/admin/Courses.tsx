import { useMemo, useState } from 'react'
import {
  Archive,
  BookOpen,
  CheckCircle,
  Eye,
  FileText,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Star,
  Trash2,
} from 'lucide-react'
import type { Course, CourseLevel, CourseMode, CourseStatus } from '../../types'
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
  SectionTitle,
  Select,
  TableWrap,
  Tabs,
  Td,
  Textarea,
  Th,
  Toggle,
} from '../../components/ui'
import { CoverImage, PageHeader, StatCard } from '../../components/common'
import { CourseCard } from '../../components/common/CourseCard'
import { useAppDispatch } from '../../app/hooks'
import { pushToast } from '../../features/ui/uiSlice'
import {
  useCreateCourseMutation,
  useDeleteCourseMutation,
  useGetCoursesQuery,
  useGetLessonsQuery,
  useGetUsersQuery,
  useUpdateCourseMutation,
} from '../../features/api/apiSlice'
import { LEVEL_LABEL, MODE_LABEL, formatAZN, getErrMsg } from '../../lib/utils'

const splitComma = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
const splitLines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)

interface CourseForm {
  title: string
  category: string
  level: CourseLevel
  mode: CourseMode
  status: CourseStatus
  teacherId: string
  summary: string
  description: string
  durationWeeks: string
  lessonsPerWeek: string
  totalHours: string
  basePrice: string
  oldPrice: string
  rating: string
  reviewCount: string
  studentCount: string
  tags: string
  outcomes: string
  requirements: string
  tech: string
  coverPrompt: string
  accent: string
  popular: boolean
}

const EMPTY_FORM: CourseForm = {
  title: '',
  category: '',
  level: 'baslangic',
  mode: 'online',
  status: 'draft',
  teacherId: '',
  summary: '',
  description: '',
  durationWeeks: '12',
  lessonsPerWeek: '2',
  totalHours: '120',
  basePrice: '599',
  oldPrice: '',
  rating: '0',
  reviewCount: '0',
  studentCount: '0',
  tags: '',
  outcomes: '',
  requirements: '',
  tech: '',
  coverPrompt: '',
  accent: 'from-brand-500 to-accent-400',
  popular: false,
}

/* Silabus önizləməsi — kənar komponent (hook təkrarı olmadan) */
function SyllabusPreview({ courseId }: { courseId: string }) {
  const { data: lessons = [], isLoading } = useGetLessonsQuery(courseId)

  if (isLoading) return <Loader label="Dərslər yüklənir..." />
  if (lessons.length === 0) return <p className="text-sm text-slate-500">Bu kurs üçün dərs əlavə edilməyib.</p>

  const modules = Array.from(new Set(lessons.map((l) => l.moduleTitle)))

  return (
    <div className="space-y-4">
      {modules.map((m) => (
        <div key={m}>
          <p className="mb-2 text-sm font-bold text-white">{m}</p>
          <ul className="space-y-1.5">
            {lessons
              .filter((l) => l.moduleTitle === m)
              .map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm"
                >
                  <span className="truncate text-slate-300">{l.title}</span>
                  <span className="shrink-0 text-xs text-slate-500">{l.durationMin} dəq</span>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default function AdminCourses() {
  const dispatch = useAppDispatch()

  const { data: courses = [], isLoading } = useGetCoursesQuery()
  const { data: users = [] } = useGetUsersQuery()
  const [createCourse, { isLoading: creating }] = useCreateCourseMutation()
  const [updateCourse] = useUpdateCourseMutation()
  const [deleteCourse] = useDeleteCourseMutation()

  const [view, setView] = useState<'table' | 'grid'>('table')
  const [statusTab, setStatusTab] = useState<'all' | CourseStatus>('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [modeFilter, setModeFilter] = useState('')
  const [search, setSearch] = useState('')
  const [popularOnly, setPopularOnly] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CourseForm>(EMPTY_FORM)
  const [detail, setDetail] = useState<Course | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null)

  const teacherMap = useMemo(() => new Map(users.map((u) => [u.id, u.fullName])), [users])
  const teachers = useMemo(() => users.filter((u) => u.role === 'teacher'), [users])
  const categories = useMemo(
    () => Array.from(new Set(courses.map((c) => c.category))).sort(),
    [courses],
  )

  const counts = useMemo(
    () => ({
      all: courses.length,
      published: courses.filter((c) => c.status === 'published').length,
      draft: courses.filter((c) => c.status === 'draft').length,
      archived: courses.filter((c) => c.status === 'archived').length,
    }),
    [courses],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return courses.filter((c) => {
      if (statusTab !== 'all' && c.status !== statusTab) return false
      if (categoryFilter && c.category !== categoryFilter) return false
      if (levelFilter && c.level !== levelFilter) return false
      if (modeFilter && c.mode !== modeFilter) return false
      if (popularOnly && !c.popular) return false
      if (q && !c.title.toLowerCase().includes(q) && !c.category.toLowerCase().includes(q))
        return false
      return true
    })
  }, [courses, statusTab, categoryFilter, levelFilter, modeFilter, popularOnly, search])

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  const openEdit = (c: Course) => {
    setEditingId(c.id)
    setForm({
      title: c.title,
      category: c.category,
      level: c.level,
      mode: c.mode,
      status: c.status,
      teacherId: c.teacherId,
      summary: c.summary,
      description: c.description,
      durationWeeks: String(c.durationWeeks),
      lessonsPerWeek: String(c.lessonsPerWeek),
      totalHours: String(c.totalHours),
      basePrice: String(c.basePrice),
      oldPrice: c.oldPrice ? String(c.oldPrice) : '',
      rating: String(c.rating),
      reviewCount: String(c.reviewCount),
      studentCount: String(c.studentCount),
      tags: c.tags.join(', '),
      outcomes: c.outcomes.join('\n'),
      requirements: c.requirements.join('\n'),
      tech: c.tech.join(', '),
      coverPrompt: c.coverPrompt,
      accent: c.accent,
      popular: c.popular,
    })
    setFormOpen(true)
  }

  const buildPayload = (): Omit<Course, 'id' | 'slug' | 'createdAt'> => ({
    title: form.title,
    category: form.category,
    level: form.level,
    mode: form.mode,
    status: form.status,
    teacherId: form.teacherId,
    summary: form.summary,
    description: form.description,
    durationWeeks: Number(form.durationWeeks) || 0,
    lessonsPerWeek: Number(form.lessonsPerWeek) || 0,
    totalHours: Number(form.totalHours) || 0,
    basePrice: Number(form.basePrice) || 0,
    oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
    rating: Number(form.rating) || 0,
    reviewCount: Number(form.reviewCount) || 0,
    studentCount: Number(form.studentCount) || 0,
    tags: splitComma(form.tags),
    outcomes: splitLines(form.outcomes),
    requirements: splitLines(form.requirements),
    tech: splitComma(form.tech),
    coverPrompt: form.coverPrompt,
    accent: form.accent,
    popular: form.popular,
  })

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.category.trim() || !form.teacherId) {
      dispatch(
        pushToast({ type: 'error', title: 'Xəta', message: 'Ad, kateqoriya və müəllim mütləqdir.' }),
      )
      return
    }
    try {
      await createCourse(buildPayload()).unwrap()
      setFormOpen(false)
      setEditingId(null)
      dispatch(pushToast({ type: 'success', title: 'Kurs yaradıldı', message: 'Yeni kurs əlavə edildi.' }))
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const handleUpdate = async () => {
    if (!editingId) return
    try {
      await updateCourse({ id: editingId, patch: buildPayload() }).unwrap()
      setFormOpen(false)
      dispatch(pushToast({ type: 'success', title: 'Yeniləndi', message: 'Kurs məlumatları saxlanıldı.' }))
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const handleStatusToggle = async (c: Course) => {
    const next: CourseStatus = c.status === 'published' ? 'draft' : 'published'
    try {
      await updateCourse({ id: c.id, patch: { status: next } }).unwrap()
      dispatch(
        pushToast({
          type: 'success',
          title: 'Status dəyişdirildi',
          message: next === 'published' ? 'Kurs dərc edildi.' : 'Kurs qaralamaya keçirildi.',
        }),
      )
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const handlePopularToggle = async (c: Course) => {
    try {
      await updateCourse({ id: c.id, patch: { popular: !c.popular } }).unwrap()
      dispatch(pushToast({ type: 'success', title: 'Yeniləndi', message: 'Populyar statusu dəyişdirildi.' }))
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteCourse(deleteTarget.id).unwrap()
      setDeleteTarget(null)
      dispatch(pushToast({ type: 'success', title: 'Silindi', message: 'Kurs silindi.' }))
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  if (isLoading) return <Loader label="Kurslar yüklənir..." />

  return (
    <div className="space-y-7">
      <PageHeader
        icon={<BookOpen className="h-6 w-6" />}
        title="Kurslar"
        subtitle="Kurikulumu idarə edin, kursları dərc edin və qiymətləri tənzimləyin"
        actions={
          <>
            <div className="flex gap-1">
              <IconButton
                onClick={() => setView('table')}
                className={view === 'table' ? 'border-brand-400/40 text-white' : undefined}
                aria-label="Cədvəl görünüşü"
              >
                <List className="h-4 w-4" />
              </IconButton>
              <IconButton
                onClick={() => setView('grid')}
                className={view === 'grid' ? 'border-brand-400/40 text-white' : undefined}
                aria-label="Kart görünüşü"
              >
                <LayoutGrid className="h-4 w-4" />
              </IconButton>
            </div>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              Yeni kurs
            </Button>
          </>
        }
      />

      <div className="grid animate-fade-up gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Kurs sayı" value={counts.all} icon={<BookOpen className="h-5 w-5" />} tone="brand" />
        <StatCard
          label="Dərc edilmiş"
          value={counts.published}
          icon={<CheckCircle className="h-5 w-5" />}
          tone="emerald"
        />
        <StatCard label="Qaralama" value={counts.draft} icon={<FileText className="h-5 w-5" />} tone="amber" />
        <StatCard
          label="Arxiv"
          value={counts.archived}
          icon={<Archive className="h-5 w-5" />}
          tone="rose"
        />
      </div>

      <Panel className="animate-fade-up animate-delay-100 space-y-4">
        <Tabs
          value={statusTab}
          onChange={setStatusTab}
          tabs={[
            { value: 'all', label: 'Hamısı', count: counts.all },
            { value: 'published', label: 'Dərc edilmiş', count: counts.published },
            { value: 'draft', label: 'Qaralama', count: counts.draft },
            { value: 'archived', label: 'Arxiv', count: counts.archived },
          ]}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">Bütün kateqoriyalar</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          <Select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
            <option value="">Bütün səviyyələr</option>
            <option value="baslangic">Başlanğıc</option>
            <option value="orta">Orta</option>
            <option value="pesekar">Peşəkar</option>
          </Select>
          <Select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}>
            <option value="">Bütün rejimlər</option>
            <option value="online">Onlayn</option>
            <option value="offline">Oflayn</option>
            <option value="hybrid">Hibrid</option>
          </Select>
          <Input
            placeholder="Kurs adı ilə axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Toggle checked={popularOnly} onChange={setPopularOnly} label="Yalnız populyar kurslar" />
      </Panel>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="Kurs tapılmadı"
          message="Filtrləri dəyişdirin və ya yeni kurs əlavə edin."
        />
      ) : view === 'grid' ? (
        <div className="grid animate-fade-up animate-delay-200 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <CourseCard key={c.id} course={c} teacherName={teacherMap.get(c.teacherId)} />
          ))}
        </div>
      ) : (
        <Panel className="animate-fade-up animate-delay-200">
          <TableWrap>
            <thead>
              <tr>
                <Th>Kurs</Th>
                <Th>Müəllim</Th>
                <Th>Səviyyə</Th>
                <Th>Rejim</Th>
                <Th>Qiymət</Th>
                <Th>Tələbə</Th>
                <Th>Reytinq</Th>
                <Th>Status</Th>
                <Th className="text-right">Əməliyyatlar</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-white/[0.03]">
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 shrink-0">
                        <CoverImage
                          prompt={c.coverPrompt}
                          title={c.title}
                          ratio=""
                          className="h-full w-full rounded-xl"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{c.title}</p>
                        <p className="text-xs text-slate-400">{c.category}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <span className="text-sm">{teacherMap.get(c.teacherId) ?? '—'}</span>
                  </Td>
                  <Td>
                    <Badge tone="neutral">{LEVEL_LABEL[c.level]}</Badge>
                  </Td>
                  <Td>
                    <Badge
                      tone={c.mode === 'online' ? 'accent' : c.mode === 'offline' ? 'warning' : 'neon'}
                    >
                      {MODE_LABEL[c.mode]}
                    </Badge>
                  </Td>
                  <Td>
                    <span className="font-semibold text-white">{formatAZN(c.basePrice)}</span>
                  </Td>
                  <Td>{c.studentCount}</Td>
                  <Td>
                    <Rating value={c.rating} count={c.reviewCount} />
                  </Td>
                  <Td>
                    <Badge
                      tone={
                        c.status === 'published'
                          ? 'success'
                          : c.status === 'draft'
                            ? 'warning'
                            : 'neutral'
                      }
                    >
                      {c.status === 'published'
                        ? 'Dərc edilmiş'
                        : c.status === 'draft'
                          ? 'Qaralama'
                          : 'Arxiv'}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="xs"
                        variant="ghost"
                        leftIcon={<Eye className="h-3.5 w-3.5" />}
                        onClick={() => setDetail(c)}
                      >
                        Bax
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        leftIcon={<Pencil className="h-3.5 w-3.5" />}
                        onClick={() => openEdit(c)}
                      >
                        Redaktə
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => handleStatusToggle(c)}
                      >
                        {c.status === 'published' ? 'Qaralama' : 'Dərc et'}
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        className={c.popular ? 'text-amber-300' : undefined}
                        leftIcon={<Star className="h-3.5 w-3.5" />}
                        onClick={() => handlePopularToggle(c)}
                      >
                        Populyar
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        className="text-rose-300"
                        leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                        onClick={() => setDeleteTarget(c)}
                      >
                        Sil
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Panel>
      )}

      {/* Create/Edit modalı */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Kursu redaktə et' : 'Yeni kurs'}
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Ləğv et
            </Button>
            <Button loading={creating} onClick={editingId ? handleUpdate : handleSubmit}>
              Yadda saxla
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Kurs adı"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            label="Kateqoriya"
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <Select
            label="Müəllim"
            required
            value={form.teacherId}
            onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
          >
            <option value="">Müəllim seçin</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName}
              </option>
            ))}
          </Select>
          <Select
            label="Səviyyə"
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value as CourseLevel })}
          >
            <option value="baslangic">Başlanğıc</option>
            <option value="orta">Orta</option>
            <option value="pesekar">Peşəkar</option>
          </Select>
          <Select
            label="Rejim"
            value={form.mode}
            onChange={(e) => setForm({ ...form, mode: e.target.value as CourseMode })}
          >
            <option value="online">Onlayn</option>
            <option value="offline">Oflayn</option>
            <option value="hybrid">Hibrid</option>
          </Select>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as CourseStatus })}
          >
            <option value="draft">Qaralama</option>
            <option value="published">Dərc edilmiş</option>
            <option value="archived">Arxiv</option>
          </Select>
          <Textarea
            label="Qısa təsvir"
            className="sm:col-span-2"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
          />
          <Textarea
            label="Ətraflı təsvir"
            className="sm:col-span-2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Müddət (həftə)"
            type="number"
            value={form.durationWeeks}
            onChange={(e) => setForm({ ...form, durationWeeks: e.target.value })}
          />
          <Input
            label="Həftədə dərs"
            type="number"
            value={form.lessonsPerWeek}
            onChange={(e) => setForm({ ...form, lessonsPerWeek: e.target.value })}
          />
          <Input
            label="Ümumi saat"
            type="number"
            value={form.totalHours}
            onChange={(e) => setForm({ ...form, totalHours: e.target.value })}
          />
          <Input
            label="Baza qiymət (₼)"
            type="number"
            value={form.basePrice}
            onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
          />
          <Input
            label="Köhnə qiymət (₼)"
            type="number"
            value={form.oldPrice}
            onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
          />
          <Input
            label="Reytinq"
            type="number"
            step="0.1"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
          />
          <Input
            label="Rəy sayı"
            type="number"
            value={form.reviewCount}
            onChange={(e) => setForm({ ...form, reviewCount: e.target.value })}
          />
          <Input
            label="Tələbə sayı"
            type="number"
            value={form.studentCount}
            onChange={(e) => setForm({ ...form, studentCount: e.target.value })}
          />
          <Input
            label="Teqlər (vergüllə)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
          <Input
            label="Texnologiyalar (vergüllə)"
            value={form.tech}
            onChange={(e) => setForm({ ...form, tech: e.target.value })}
          />
          <Textarea
            label="Nəticələr (hər sətir bir element)"
            className="sm:col-span-2"
            value={form.outcomes}
            onChange={(e) => setForm({ ...form, outcomes: e.target.value })}
          />
          <Textarea
            label="Tələblər (hər sətir bir element)"
            className="sm:col-span-2"
            value={form.requirements}
            onChange={(e) => setForm({ ...form, requirements: e.target.value })}
          />
          <Input
            label="Örtük promptu"
            className="sm:col-span-2"
            hint="Şəkil avtomatik yaradılır — ingilis dilində qısa təsvir yazın."
            value={form.coverPrompt}
            onChange={(e) => setForm({ ...form, coverPrompt: e.target.value })}
          />
          <Input
            label="Aksent (gradient sinfi)"
            value={form.accent}
            onChange={(e) => setForm({ ...form, accent: e.target.value })}
          />
          <div className="flex items-end">
            <Toggle
              checked={form.popular}
              onChange={(v) => setForm({ ...form, popular: v })}
              label="Populyar kimi işarələ"
            />
          </div>
        </div>
      </Modal>

      {/* Detal modalı */}
      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Kurs detalları"
        size="xl"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                if (detail) openEdit(detail)
                setDetail(null)
              }}
            >
              Redaktə et
            </Button>
            <Button variant="secondary" onClick={() => setDetail(null)}>
              Bağla
            </Button>
          </>
        }
      >
        {detail && (
          <div className="space-y-5">
            <CoverImage prompt={detail.coverPrompt} title={detail.title} tech={detail.tech} />
            <div className="flex flex-wrap gap-2">
              <Badge tone="brand">{detail.category}</Badge>
              <Badge tone="neutral">{LEVEL_LABEL[detail.level]}</Badge>
              <Badge
                tone={detail.mode === 'online' ? 'accent' : detail.mode === 'offline' ? 'warning' : 'neon'}
              >
                {MODE_LABEL[detail.mode]}
              </Badge>
              {detail.popular && <Badge tone="warning">Populyar</Badge>}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{detail.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{detail.summary}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">Qiymət</p>
                <p className="font-bold text-white">{formatAZN(detail.basePrice)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">Müddət</p>
                <p className="font-bold text-white">{detail.durationWeeks} həftə</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">Ümumi saat</p>
                <p className="font-bold text-white">{detail.totalHours} saat</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">Müəllim</p>
                <p className="font-bold text-white">{teacherMap.get(detail.teacherId) ?? '—'}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">{detail.description}</p>
            {detail.outcomes.length > 0 && (
              <div>
                <SectionTitle title="Nəticələr" />
                <ul className="space-y-1.5">
                  {detail.outcomes.map((o) => (
                    <li key={o} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <SectionTitle title="Silabus" subtitle="Dərs proqramı önizləməsi" />
              <SyllabusPreview courseId={detail.id} />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Kursu silmək?"
        message={`«${deleteTarget?.title ?? ''}» kursu və ona aid dərslər silinəcək.`}
        confirmLabel="Sil"
      />
    </div>
  )
}
