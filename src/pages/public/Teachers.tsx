import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, GraduationCap, Sparkles, Users } from 'lucide-react'
import { useGetCoursesQuery, useGetUsersQuery } from '../../features/api/apiSlice'
import { Avatar, Badge, EmptyState, Input, Panel, Rating, SkeletonCard } from '../../components/ui'
import { GradientBlobs } from '../../components/common'

export default function Teachers() {
  const { data: users = [], isLoading } = useGetUsersQuery()
  const { data: courses = [] } = useGetCoursesQuery()
  const [q, setQ] = useState('')

  const teachers = useMemo(
    () => users.filter((u) => u.role === 'teacher' && u.status === 'active'),
    [users],
  )

  const search = q.trim().toLowerCase()
  const list = useMemo(
    () =>
      teachers.filter(
        (t) =>
          !search ||
          t.fullName.toLowerCase().includes(search) ||
          (t.specialization ?? '').toLowerCase().includes(search) ||
          (t.skills ?? []).some((s) => s.toLowerCase().includes(search)),
      ),
    [teachers, search],
  )

  const coursesOf = (id: string) => courses.filter((c) => c.teacherId === id)
  const studentsOf = (id: string) =>
    coursesOf(id).reduce((sum, c) => sum + c.studentCount, 0)

  return (
    <div className="relative">
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden pb-12 pt-14 sm:pt-20">
        <div className="absolute inset-0 grid-bg" />
        <GradientBlobs />
        <div className="relative mx-auto w-full max-w-7xl px-5">
          <div className="max-w-2xl animate-fade-up">
            <Badge tone="brand" icon={<Sparkles className="h-3.5 w-3.5" />}>
              Sənayedə çalışan mütəxəssislər
            </Badge>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Müəllim <span className="gradient-text">heyətimiz</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
              CodeVia Academy müəllimləri real layihə təcrübəsinə malik mütəxəssislərdir. Onların
              ixtisası, təcrübəsi və reytinqi ilə tanış olun.
            </p>
          </div>

          <div className="mt-8 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="panel p-4">
              <GraduationCap className="h-5 w-5 text-brand-300" />
              <p className="mt-2 text-2xl font-extrabold text-white">{teachers.length}</p>
              <p className="text-xs text-slate-500">Müəllim</p>
            </div>
            <div className="panel p-4">
              <BookOpen className="h-5 w-5 text-accent-300" />
              <p className="mt-2 text-2xl font-extrabold text-white">
                {new Set(teachers.map((t) => t.specialization).filter(Boolean)).size}
              </p>
              <p className="text-xs text-slate-500">İxtisas sahəsi</p>
            </div>
            <div className="panel col-span-2 p-4 sm:col-span-1">
              <Users className="h-5 w-5 text-neon-300" />
              <p className="mt-2 text-2xl font-extrabold text-white">
                {teachers.reduce((sum, t) => sum + studentsOf(t.id), 0)}
              </p>
              <p className="text-xs text-slate-500">Tələbə</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Siyahı ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-5 pb-20">
        <Panel className="mb-8 animate-fade-up">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-md">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ad, ixtisas və ya texnologiya üzrə axtar..."
                aria-label="Müəllim axtar"
              />
            </div>
            <p className="text-sm text-slate-400">
              {list.length} müəllim tapıldı
            </p>
          </div>
        </Panel>

        {isLoading ? (
          <SkeletonCard count={6} />
        ) : list.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="h-6 w-6" />}
            title="Müəllim tapılmadı"
            message="Axtarışınıza uyğun müəllim yoxdur. Axtarış sözünü dəyişərək yenidən yoxlayın."
          />
        ) : (
          <div className="grid animate-fade-up gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((t) => (
              <Link
                key={t.id}
                to={`/muellimler/${t.id}`}
                className="panel group flex flex-col gap-4 p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-400/40 hover:shadow-glow"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={t.fullName} gradient={t.avatar} src={t.photo} size={56} ring />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold text-white transition-colors group-hover:text-brand-200">
                      {t.fullName}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {t.specialization || 'Ümumi ixtisas'}
                    </p>
                    <div className="mt-1.5">
                      <Rating value={t.rating ?? 0} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge tone="brand" icon={<BookOpen className="h-3 w-3" />}>
                    {coursesOf(t.id).length} kurs
                  </Badge>
                  <Badge tone="accent" icon={<Users className="h-3 w-3" />}>
                    {studentsOf(t.id)} tələbə
                  </Badge>
                  <Badge tone="neutral">{t.experienceYears ?? 0} il təcrübə</Badge>
                </div>

                {t.skills && t.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {t.skills.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-slate-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300">
                  Profilə bax
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
