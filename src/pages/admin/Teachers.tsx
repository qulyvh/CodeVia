import { useMemo, useState } from 'react'
import {
  Ban,
  BookOpen,
  CheckCircle,
  GraduationCap,
  Pencil,
  Star,
  Trash2,
  Users,
  Wallet,
} from 'lucide-react'
import type { User } from '../../types'
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Input,
  Loader,
  Modal,
  Panel,
  Progress,
  Rating,
  SectionTitle,
  TableWrap,
  Td,
  Th,
} from '../../components/ui'
import { PageHeader, StatCard } from '../../components/common'
import { useAppDispatch } from '../../app/hooks'
import { pushToast } from '../../features/ui/uiSlice'
import {
  useDeleteUserMutation,
  useGetCoursesQuery,
  useGetEnrollmentsQuery,
  useGetPaymentsQuery,
  useGetTeacherStatsQuery,
  useGetUsersQuery,
  useToggleUserStatusMutation,
  useUpdateUserMutation,
} from '../../features/api/apiSlice'
import { formatAZN, getErrMsg } from '../../lib/utils'

interface TeacherEditForm {
  fullName: string
  specialization: string
  experienceYears: string
  phone: string
  rating: string
}

/* Müəllimin statistikası — kənar komponent (map içində hook çağırışı olmasın) */
function TeacherStatsBlock({ teacherId }: { teacherId: string }) {
  const { data: stats, isLoading } = useGetTeacherStatsQuery(teacherId)

  if (isLoading || !stats) {
    return <div className="h-16 animate-pulse rounded-xl bg-white/5" />
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
          <span>Orta irəliləyiş</span>
          <span className="font-semibold text-white">{stats.avgProgress}%</span>
        </div>
        <Progress value={stats.avgProgress} tone="brand" />
      </div>
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
        <span className="text-xs text-slate-400">Ümumi gəlir</span>
        <span className="text-sm font-bold text-emerald-300">{formatAZN(stats.revenue)}</span>
      </div>
    </div>
  )
}

/* Müəllimin kursları — kənar komponent */
function TeacherCoursesList({ teacherId }: { teacherId: string }) {
  const { data: courses = [], isLoading } = useGetCoursesQuery()
  const list = courses.filter((c) => c.teacherId === teacherId)

  if (isLoading) return <Loader label="Kurslar yüklənir..." />
  if (list.length === 0) return <p className="text-sm text-slate-500">Bu müəllimin kursu yoxdur.</p>

  return (
    <ul className="space-y-2">
      {list.map((c) => (
        <li
          key={c.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{c.title}</p>
            <p className="text-xs text-slate-400">
              {c.category} • {c.studentCount} tələbə
            </p>
          </div>
          <span className="text-sm font-bold text-brand-200">{formatAZN(c.basePrice)}</span>
        </li>
      ))}
    </ul>
  )
}

export default function AdminTeachers() {
  const dispatch = useAppDispatch()

  const { data: users = [], isLoading } = useGetUsersQuery()
  const { data: courses = [] } = useGetCoursesQuery()
  const { data: enrollments = [] } = useGetEnrollmentsQuery(undefined)
  const { data: payments = [] } = useGetPaymentsQuery(undefined)
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation()
  const [deleteUser] = useDeleteUserMutation()
  const [toggleStatus] = useToggleUserStatusMutation()

  const [coursesTarget, setCoursesTarget] = useState<User | null>(null)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [editForm, setEditForm] = useState<TeacherEditForm | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  const teachers = useMemo(() => users.filter((u) => u.role === 'teacher'), [users])

  const courseIdsOf = (teacherId: string) =>
    courses.filter((c) => c.teacherId === teacherId).map((c) => c.id)

  const studentCountOf = (teacherId: string) => {
    const ids = courseIdsOf(teacherId)
    return new Set(enrollments.filter((e) => ids.includes(e.courseId)).map((e) => e.studentId))
      .size
  }

  const revenueOf = (teacherId: string) => {
    const ids = courseIdsOf(teacherId)
    return payments
      .filter((p) => ids.includes(p.courseId) && p.status === 'paid')
      .reduce((s, p) => s + p.amount, 0)
  }

  const totals = useMemo(() => {
    const allTeacherCourseIds = courses
      .filter((c) => teachers.some((t) => t.id === c.teacherId))
      .map((c) => c.id)
    const students = new Set(
      enrollments.filter((e) => allTeacherCourseIds.includes(e.courseId)).map((e) => e.studentId),
    ).size
    const revenue = payments
      .filter((p) => allTeacherCourseIds.includes(p.courseId) && p.status === 'paid')
      .reduce((s, p) => s + p.amount, 0)
    const avgRating = teachers.length
      ? teachers.reduce((s, t) => s + (t.rating ?? 0), 0) / teachers.length
      : 0
    return { students, revenue, avgRating: Math.round(avgRating * 10) / 10 }
  }, [teachers, courses, enrollments, payments])

  const openEdit = (t: User) => {
    setEditTarget(t)
    setEditForm({
      fullName: t.fullName,
      specialization: t.specialization ?? '',
      experienceYears: String(t.experienceYears ?? ''),
      phone: t.phone,
      rating: String(t.rating ?? ''),
    })
  }

  const handleUpdate = async () => {
    if (!editTarget || !editForm) return
    try {
      await updateUser({
        id: editTarget.id,
        patch: {
          fullName: editForm.fullName,
          specialization: editForm.specialization,
          experienceYears: Number(editForm.experienceYears) || 0,
          phone: editForm.phone,
          rating: Number(editForm.rating) || 0,
        },
      }).unwrap()
      setEditTarget(null)
      setEditForm(null)
      dispatch(pushToast({ type: 'success', title: 'Yeniləndi', message: 'Müəllim məlumatları saxlanıldı.' }))
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const handleToggle = async (t: User) => {
    try {
      await toggleStatus(t.id).unwrap()
      dispatch(
        pushToast({
          type: 'success',
          title: 'Status dəyişdirildi',
          message: t.status === 'active' ? 'Müəllim bloklandı.' : 'Müəllim aktivləşdirildi.',
        }),
      )
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteUser(deleteTarget.id).unwrap()
      setDeleteTarget(null)
      dispatch(pushToast({ type: 'success', title: 'Silindi', message: 'Müəllim silindi.' }))
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  if (isLoading) return <Loader label="Müəllimlər yüklənir..." />

  return (
    <div className="space-y-7">
      <PageHeader
        icon={<GraduationCap className="h-6 w-6" />}
        title="Müəllimlər"
        subtitle="Müəllim heyətini idarə edin, kurs və gəlir göstəricilərini izləyin"
      />

      <div className="grid animate-fade-up gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Müəllim sayı"
          value={teachers.length}
          icon={<GraduationCap className="h-5 w-5" />}
          tone="brand"
        />
        <StatCard
          label="Orta reytinq"
          value={totals.avgRating.toFixed(1)}
          icon={<Star className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          label="Ümumi tələbə"
          value={totals.students}
          icon={<Users className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="Ümumi gəlir"
          value={formatAZN(totals.revenue)}
          icon={<Wallet className="h-5 w-5" />}
          tone="emerald"
        />
      </div>

      {teachers.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="h-6 w-6" />}
          title="Müəllim tapılmadı"
          message="Sistemdə heç bir müəllim hesabı yoxdur."
        />
      ) : (
        <div className="grid animate-fade-up animate-delay-100 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {teachers.map((t) => (
            <div key={t.id} className="panel flex flex-col gap-4 p-5">
              <div className="flex items-start gap-3">
                <Avatar name={t.fullName} gradient={t.avatar} size={52} ring />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-white">{t.fullName}</p>
                  <p className="truncate text-xs text-slate-400">
                    {t.specialization || 'Ümumi'} • {t.experienceYears ?? 0} il təcrübə
                  </p>
                  <div className="mt-1.5">
                    <Rating value={t.rating ?? 0} />
                  </div>
                </div>
                <Badge tone={t.status === 'active' ? 'success' : 'danger'}>
                  {t.status === 'active' ? 'Aktiv' : 'Bloklanmış'}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge tone="brand" icon={<BookOpen className="h-3 w-3" />}>
                  {courses.filter((c) => c.teacherId === t.id).length} kurs
                </Badge>
                <Badge tone="accent" icon={<Users className="h-3 w-3" />}>
                  {studentCountOf(t.id)} tələbə
                </Badge>
              </div>

              <TeacherStatsBlock teacherId={t.id} />

              <div className="mt-auto flex flex-wrap gap-2">
                <Button
                  size="xs"
                  variant="secondary"
                  leftIcon={<BookOpen className="h-3.5 w-3.5" />}
                  onClick={() => setCoursesTarget(t)}
                >
                  Kurslarını gör
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  leftIcon={<Pencil className="h-3.5 w-3.5" />}
                  onClick={() => openEdit(t)}
                >
                  Redaktə
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  leftIcon={
                    t.status === 'active' ? (
                      <Ban className="h-3.5 w-3.5" />
                    ) : (
                      <CheckCircle className="h-3.5 w-3.5" />
                    )
                  }
                  onClick={() => handleToggle(t)}
                >
                  {t.status === 'active' ? 'Blokla' : 'Aktiv et'}
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  className="text-rose-300"
                  leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                  onClick={() => setDeleteTarget(t)}
                >
                  Sil
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Xülasə cədvəli */}
      <Panel className="animate-fade-up animate-delay-200">
        <SectionTitle
          icon={<GraduationCap className="h-5 w-5" />}
          title="Müəllim xülasəsi"
          subtitle="Cədvəl görünüşündə ümumi göstəricilər"
        />
        <TableWrap>
          <thead>
            <tr>
              <Th>Müəllim</Th>
              <Th>İxtisas</Th>
              <Th>Kurs</Th>
              <Th>Tələbə</Th>
              <Th>Reytinq</Th>
              <Th>Gəlir</Th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.id} className="transition-colors hover:bg-white/[0.03]">
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={t.fullName} gradient={t.avatar} size={34} />
                    <span className="font-semibold text-white">{t.fullName}</span>
                  </div>
                </Td>
                <Td>{t.specialization || 'Ümumi'}</Td>
                <Td>{courses.filter((c) => c.teacherId === t.id).length}</Td>
                <Td>{studentCountOf(t.id)}</Td>
                <Td>
                  <Rating value={t.rating ?? 0} />
                </Td>
                <Td>
                  <span className="font-semibold text-emerald-300">{formatAZN(revenueOf(t.id))}</span>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Panel>

      {/* Kurslar modalı */}
      <Modal
        open={Boolean(coursesTarget)}
        onClose={() => setCoursesTarget(null)}
        title={`${coursesTarget?.fullName ?? ''} — kursları`}
        size="lg"
      >
        {coursesTarget && <TeacherCoursesList teacherId={coursesTarget.id} />}
      </Modal>

      {/* Redaktə modalı */}
      <Modal
        open={Boolean(editTarget && editForm)}
        onClose={() => {
          setEditTarget(null)
          setEditForm(null)
        }}
        title="Müəllimi redaktə et"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setEditTarget(null)
                setEditForm(null)
              }}
            >
              Ləğv et
            </Button>
            <Button loading={updating} onClick={handleUpdate}>
              Yadda saxla
            </Button>
          </>
        }
      >
        {editForm && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Ad və soyad"
              value={editForm.fullName}
              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
            />
            <Input
              label="Telefon"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
            <Input
              label="İxtisas"
              value={editForm.specialization}
              onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
            />
            <Input
              label="Təcrübə (il)"
              type="number"
              value={editForm.experienceYears}
              onChange={(e) => setEditForm({ ...editForm, experienceYears: e.target.value })}
            />
            <Input
              label="Reytinq"
              type="number"
              step="0.1"
              value={editForm.rating}
              onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Müəllimi silmək?"
        message={`${deleteTarget?.fullName ?? ''} adlı müəllim silinəcək. Bu əməliyyat geri qaytarıla bilməz.`}
        confirmLabel="Sil"
      />
    </div>
  )
}
