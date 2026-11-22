import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  GraduationCap,
  Languages,
  Mail,
  MapPin,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react'
import { useGetCoursesQuery, useGetUsersQuery } from '../../features/api/apiSlice'
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Loader,
  Panel,
  Rating,
  SectionTitle,
} from '../../components/ui'
import { CourseCard } from '../../components/common/CourseCard'
import { GradientBlobs } from '../../components/common'
import { formatAZN } from '../../lib/utils'

export default function TeacherDetail() {
  const { id } = useParams()
  const { data: users = [], isLoading } = useGetUsersQuery()
  const { data: courses = [] } = useGetCoursesQuery()

  const teacher = users.find((u) => u.id === id && u.role === 'teacher')

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-5 py-16">
        <Loader label="Müəllim profili yüklənir..." />
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-20">
        <EmptyState
          icon={<GraduationCap className="h-6 w-6" />}
          title="Müəllim tapılmadı"
          message="Axtardığınız müəllim profili mövcud deyil və ya silinib."
          action={
            <Link to="/muellimler">
              <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Müəllimlərə qayıt
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  const mine = courses.filter((c) => c.teacherId === teacher.id)
  const students = mine.reduce((sum, c) => sum + c.studentCount, 0)

  return (
    <div className="relative">
      <section className="relative overflow-hidden pb-14 pt-10">
        <div className="absolute inset-0 grid-bg" />
        <GradientBlobs />
        <div className="relative mx-auto w-full max-w-7xl px-5">
          <Link
            to="/muellimler"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Müəllimlər
          </Link>

          <Panel className="mt-5 animate-fade-up">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar
                name={teacher.fullName}
                gradient={teacher.avatar}
                src={teacher.photo}
                size={104}
                ring
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                  {teacher.fullName}
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  {teacher.specialization || 'Ümumi ixtisas'}
                </p>
                <div className="mt-2">
                  <Rating value={teacher.rating ?? 0} size={16} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge tone="brand" icon={<Briefcase className="h-3 w-3" />}>
                    {teacher.experienceYears ?? 0} il təcrübə
                  </Badge>
                  {teacher.hourlyRate ? (
                    <Badge tone="success" icon={<Wallet className="h-3 w-3" />}>
                      {formatAZN(teacher.hourlyRate)}/saat
                    </Badge>
                  ) : null}
                  {teacher.city ? (
                    <Badge tone="neutral" icon={<MapPin className="h-3 w-3" />}>
                      {teacher.city}
                    </Badge>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:grid-cols-1 sm:gap-2">
                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-center">
                  <BookOpen className="mx-auto h-4 w-4 text-brand-300" />
                  <p className="mt-1.5 text-lg font-extrabold text-white">{mine.length}</p>
                  <p className="text-[11px] text-slate-500">Kurs</p>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-center">
                  <Users className="mx-auto h-4 w-4 text-accent-300" />
                  <p className="mt-1.5 text-lg font-extrabold text-white">{students}</p>
                  <p className="text-[11px] text-slate-500">Tələbə</p>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-center">
                  <GraduationCap className="mx-auto h-4 w-4 text-neon-300" />
                  <p className="mt-1.5 text-lg font-extrabold text-white">
                    {(teacher.rating ?? 0).toFixed(1)}
                  </p>
                  <p className="text-[11px] text-slate-500">Reytinq</p>
                </div>
              </div>
            </div>
          </Panel>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Panel className="animate-fade-up animate-delay-100">
                <SectionTitle
                  title="Müəllim haqqında"
                  subtitle="Təcrübə və tədris yanaşması"
                  icon={<Sparkles className="h-5 w-5" />}
                />
                <p className="text-sm leading-relaxed text-slate-300">
                  {teacher.bio || 'Bu müəllim hələ təqdimat əlavə etməyib.'}
                </p>

                {teacher.skills && teacher.skills.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Bacarıqlar
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {teacher.skills.map((s) => (
                        <Badge key={s} tone="brand">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Panel>

              <Panel className="animate-fade-up animate-delay-200">
                <SectionTitle
                  title="Tədris etdiyi kurslar"
                  subtitle={`${mine.length} aktiv kurs`}
                  icon={<BookOpen className="h-5 w-5" />}
                />
                {mine.length === 0 ? (
                  <p className="text-sm text-slate-500">Hazırda aktiv kurs yoxdur.</p>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {mine.map((c) => (
                      <CourseCard key={c.id} course={c} compact />
                    ))}
                  </div>
                )}
              </Panel>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <Panel className="animate-fade-up animate-delay-200">
                <SectionTitle
                  title="Əlaqə & təhsil"
                  subtitle="Əlavə məlumatlar"
                  icon={<GraduationCap className="h-5 w-5" />}
                />
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3 text-slate-300">
                    <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                    <span>
                      <span className="block text-xs uppercase tracking-wide text-slate-500">
                        Təhsil
                      </span>
                      {teacher.education || '—'}
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <Languages className="mt-0.5 h-4 w-4 shrink-0 text-accent-300" />
                    <span>
                      <span className="block text-xs uppercase tracking-wide text-slate-500">
                        Dillər
                      </span>
                      {teacher.languages?.length ? teacher.languages.join(', ') : '—'}
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-neon-300" />
                    <span className="break-all">
                      <span className="block text-xs uppercase tracking-wide text-slate-500">
                        E-poçt
                      </span>
                      {teacher.email}
                    </span>
                  </li>
                </ul>
              </Panel>

              <Panel className="animate-fade-up animate-delay-300">
                <SectionTitle
                  title="Kursa yazıl"
                  subtitle="Bu müəllimin kurslarına qoşulun"
                  icon={<BookOpen className="h-5 w-5" />}
                />
                <Link to="/kurslar">
                  <Button full variant="primary" leftIcon={<BookOpen className="h-4 w-4" />}>
                    Bütün kurslara bax
                  </Button>
                </Link>
              </Panel>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
