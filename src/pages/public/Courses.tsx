import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  CreditCard,
  GraduationCap,
  MapPin,
  Radio,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react'
import { useGetCoursesQuery, useGetUsersQuery } from '../../features/api/apiSlice'
import { CATEGORIES } from '../../data/seed'
import { cn, formatAZN, LEVEL_LABEL, MODE_LABEL } from '../../lib/utils'
import { Badge, Button, EmptyState, Input, Panel, Select, SkeletonCard } from '../../components/ui'
import { CourseCard } from '../../components/common/CourseCard'
import { GradientBlobs, StatCard } from '../../components/common'

type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'new'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'popular', label: 'Populyar' },
  { value: 'price-asc', label: 'Qiymət: artan' },
  { value: 'price-desc', label: 'Qiymət: azalan' },
  { value: 'rating', label: 'Reytinq' },
  { value: 'new', label: 'Yeni' },
]

export default function Courses() {
  const [params, setParams] = useSearchParams()
  const { data: courses = [], isLoading } = useGetCoursesQuery()
  const { data: users = [] } = useGetUsersQuery()

  const q = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const mode = params.get('mode') ?? ''
  const level = params.get('level') ?? ''
  const sort = (params.get('sort') as SortKey | null) ?? 'popular'

  const teacherName = (id: string) => users.find((u) => u.id === id)?.fullName ?? '—'

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value)
      else next.delete(key)
    })
    setParams(next, { replace: true })
  }

  const clearFilters = () => {
    const next = new URLSearchParams()
    if (sort !== 'popular') next.set('sort', sort)
    setParams(next, { replace: true })
  }

  const activeFilterCount = [q, category, mode, level].filter(Boolean).length

  const filterGroups: {
    key: 'category' | 'mode' | 'level'
    label: string
    value: string
    options: { value: string; label: string }[]
  }[] = [
    {
      key: 'category',
      label: 'Kateqoriya',
      value: category,
      options: [
        { value: '', label: 'Hamısı' },
        ...CATEGORIES.map((c) => ({ value: c.name, label: c.name })),
      ],
    },
    {
      key: 'mode',
      label: 'Format',
      value: mode,
      options: [
        { value: '', label: 'Hamısı' },
        { value: 'online', label: MODE_LABEL.online },
        { value: 'offline', label: MODE_LABEL.offline },
        { value: 'hybrid', label: MODE_LABEL.hybrid },
      ],
    },
    {
      key: 'level',
      label: 'Səviyyə',
      value: level,
      options: [
        { value: '', label: 'Hamısı' },
        { value: 'baslangic', label: LEVEL_LABEL.baslangic },
        { value: 'orta', label: LEVEL_LABEL.orta },
        { value: 'pesekar', label: LEVEL_LABEL.pesekar },
      ],
    },
  ]

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    const list = courses.filter((c) => {
      if (category && c.category !== category) return false
      if (mode && c.mode !== mode) return false
      if (level && c.level !== level) return false
      if (term) {
        const haystack = [c.title, c.summary, c.category, ...c.tech, ...c.tags]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })
    switch (sort) {
      case 'price-asc':
        return [...list].sort((a, b) => a.basePrice - b.basePrice)
      case 'price-desc':
        return [...list].sort((a, b) => b.basePrice - a.basePrice)
      case 'rating':
        return [...list].sort((a, b) => b.rating - a.rating)
      case 'new':
        return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      default:
        return [...list].sort((a, b) => b.studentCount - a.studentCount)
    }
  }, [courses, category, mode, level, q, sort])

  const onlineCount = courses.filter((c) => c.mode === 'online').length
  const offlineCount = courses.filter((c) => c.mode === 'offline').length
  const avgPrice = courses.length
    ? courses.reduce((sum, c) => sum + c.basePrice, 0) / courses.length
    : 0

  return (
    <div>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden border-b border-white/10 pb-12 pt-14 sm:pt-16">
        <div className="absolute inset-0 grid-bg" />
        <GradientBlobs />
        <div className="relative mx-auto w-full max-w-7xl px-5">
          <div className="animate-fade-up">
            <Badge tone="brand" icon={<Sparkles className="h-3.5 w-3.5" />}>
              Karyeranı dəyişən praktik proqramlar
            </Badge>
            <div className="mt-5 flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-brand-grad-soft text-brand-200 shadow-glow">
                <GraduationCap className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Kurslar
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-400">
                  Frontend, Backend, Data, Dizayn, Kibertəhlükəsizlik və daha çoxu — sənə uyğun
                  proqramı seç, qəbul testini keç və qoşul.
                </p>
              </div>
            </div>
          </div>

          <div className="animate-delay-100 relative mt-8 max-w-2xl animate-fade-up">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="Kurs, texnologiya və ya açar söz axtarın..."
              aria-label="Kurs axtar"
              className="[&_input]:h-12 [&_input]:pl-11 [&_input]:text-base"
            />
          </div>

          <div className="animate-delay-200 mt-4 flex animate-fade-up flex-wrap items-center gap-3">
            <Badge tone="accent">{filtered.length} kurs tapıldı</Badge>
            <span className="text-xs text-slate-500">
              Ümumi {courses.length} kurs · {onlineCount} onlayn · {offlineCount} oflayn
            </span>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-300 transition-colors hover:text-brand-200"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Filtrləri sıfırla
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- Statistika ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-5 pt-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Aktiv kurs"
            value={courses.length}
            icon={<BookOpen className="h-5 w-5" />}
            tone="brand"
          />
          <StatCard
            label="Onlayn kurs"
            value={onlineCount}
            icon={<Radio className="h-5 w-5" />}
            tone="accent"
            hint="Canlı yayım + video arxiv"
          />
          <StatCard
            label="Oflayn kurs"
            value={offlineCount}
            icon={<MapPin className="h-5 w-5" />}
            tone="neon"
            hint="Bakı, Sumqayıt, Gəncə"
          />
          <StatCard
            label="Orta kurs qiyməti"
            value={formatAZN(avgPrice)}
            icon={<CreditCard className="h-5 w-5" />}
            tone="emerald"
            hint="Paket seçiminə görə dəyişir"
          />
        </div>
      </section>

      {/* ---------------- Filtrlər ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-5 py-10">
        <Panel className="border-white/10 bg-white/[0.03]">
          <div className="space-y-5">
            {filterGroups.map((group) => (
              <div key={group.key}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((option) => {
                    const active = group.value === option.value
                    return (
                      <button
                        key={option.value || 'all'}
                        type="button"
                        onClick={() => update({ [group.key]: option.value })}
                        className={cn(
                          'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all',
                          active
                            ? 'border-brand-400/50 bg-brand-500/20 text-white shadow-glow'
                            : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.07] hover:text-white',
                        )}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
              <p className="text-xs text-slate-500">Nəticə: {filtered.length} kurs</p>
              <Select
                label="Sıralama"
                value={sort}
                onChange={(e) => update({ sort: e.target.value })}
                className="sm:w-56"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Panel>
      </section>

      {/* ---------------- Kurs şəbəkəsi ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-5 pb-20">
        {isLoading ? (
          <SkeletonCard count={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Kurs tapılmadı"
            message="Seçilmiş filtrlərə uyğun kurs yoxdur. Filtrləri dəyişin və ya sıfırlayın."
            icon={<Search className="h-6 w-6" />}
            action={
              <Button
                variant="secondary"
                leftIcon={<RotateCcw className="h-4 w-4" />}
                onClick={clearFilters}
              >
                Filtrləri sıfırla
              </Button>
            }
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course, i) => (
              <div
                key={course.id}
                className={cn(
                  'animate-fade-up',
                  i % 3 === 1 && 'animate-delay-100',
                  i % 3 === 2 && 'animate-delay-200',
                )}
              >
                <CourseCard course={course} teacherName={teacherName(course.teacherId)} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
