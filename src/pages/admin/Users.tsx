import { useEffect, useMemo, useState } from 'react'
import {
  Ban,
  BookOpen,
  CheckCircle,
  Eye,
  GraduationCap,
  Pencil,
  Trash2,
  UserPlus,
  UserX,
  Users as UsersIcon,
} from 'lucide-react'
import type { Course, Role, User, UserStatus } from '../../types'
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
  SectionTitle,
  Select,
  TableWrap,
  Tabs,
  Td,
  Textarea,
  Th,
} from '../../components/ui'
import { PageHeader, StatCard } from '../../components/common'
import { useAppDispatch, useAuth } from '../../app/hooks'
import { pushToast } from '../../features/ui/uiSlice'
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetCoursesQuery,
  useGetEnrollmentsQuery,
  useGetPaymentsQuery,
  useGetUsersQuery,
  useToggleUserStatusMutation,
  useUpdateUserMutation,
} from '../../features/api/apiSlice'
import {
  ENROLLMENT_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  ROLE_LABEL,
  formatAZN,
  formatDate,
  getErrMsg,
} from '../../lib/utils'

const STATUS_LABEL: Record<UserStatus, string> = {
  active: 'Aktiv',
  blocked: 'Bloklanmış',
  pending: 'Təsdiq gözləyir',
  rejected: 'Rədd edildi',
}

const ROLE_TONE: Record<Role, 'accent' | 'brand' | 'neon'> = {
  student: 'accent',
  teacher: 'brand',
  admin: 'neon',
}

const PAGE_SIZE = 8

interface CreateForm {
  fullName: string
  email: string
  password: string
  role: Role
  phone: string
  city: string
  bio: string
  status: UserStatus
}

interface EditForm {
  fullName: string
  role: Role
  phone: string
  city: string
  bio: string
  status: UserStatus
  specialization: string
  experienceYears: string
  rating: string
  xp: string
  level: string
  balance: string
}

const EMPTY_CREATE: CreateForm = {
  fullName: '',
  email: '',
  password: '',
  role: 'student',
  phone: '',
  city: '',
  bio: '',
  status: 'active',
}

/* İstifadəçinin qeydiyyat və ödəniş detalları (kənar komponent — hook təkrarı olmadan) */
function UserDetailPanel({ userId, courses }: { userId: string; courses: Course[] }) {
  const { data: enrollments = [], isLoading } = useGetEnrollmentsQuery({ studentId: userId })
  const { data: payments = [] } = useGetPaymentsQuery({ studentId: userId })

  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses])
  const paidTotal = payments
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-5">
      <div>
        <SectionTitle title="Qeydiyyatlar" subtitle={`Cəmi ${enrollments.length} qeydiyyat`} />
        {isLoading ? (
          <Loader label="Yüklənir..." />
        ) : enrollments.length === 0 ? (
          <p className="text-sm text-slate-500">Qeydiyyat tapılmadı.</p>
        ) : (
          <ul className="space-y-2">
            {enrollments.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {courseMap.get(e.courseId)?.title ?? 'Kurs'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(e.startDate)} • {ENROLLMENT_STATUS_LABEL[e.status]}
                  </p>
                </div>
                <span className="text-xs font-semibold text-brand-200">{e.progress}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <SectionTitle
          title="Ödənişlər"
          subtitle={`Ödənilən məbləğ: ${formatAZN(paidTotal)}`}
        />
        {payments.length === 0 ? (
          <p className="text-sm text-slate-500">Ödəniş tapılmadı.</p>
        ) : (
          <ul className="space-y-2">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{p.invoiceNo}</p>
                  <p className="text-xs text-slate-400">{formatDate(p.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{formatAZN(p.amount)}</p>
                  <p className="text-xs text-slate-400">{PAYMENT_STATUS_LABEL[p.status]}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default function AdminUsers() {
  const dispatch = useAppDispatch()
  const { user: me } = useAuth()

  const { data: users = [], isLoading } = useGetUsersQuery()
  const { data: courses = [] } = useGetCoursesQuery()
  const [createUser, { isLoading: creating }] = useCreateUserMutation()
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation()
  const [deleteUser] = useDeleteUserMutation()
  const [toggleStatus] = useToggleUserStatusMutation()

  const [roleTab, setRoleTab] = useState<'all' | Role>('all')
  const [statusFilter, setStatusFilter] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
  const [viewTarget, setViewTarget] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  useEffect(() => {
    setPage(1)
  }, [roleTab, statusFilter, cityFilter, search])

  const cities = useMemo(
    () => Array.from(new Set(users.map((u) => u.city).filter(Boolean))).sort(),
    [users],
  )

  const counts = useMemo(
    () => ({
      all: users.length,
      student: users.filter((u) => u.role === 'student').length,
      teacher: users.filter((u) => u.role === 'teacher').length,
      admin: users.filter((u) => u.role === 'admin').length,
      blocked: users.filter((u) => u.status === 'blocked').length,
    }),
    [users],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (roleTab !== 'all' && u.role !== roleTab) return false
      if (statusFilter && u.status !== statusFilter) return false
      if (cityFilter && u.city !== cityFilter) return false
      if (q && !u.fullName.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q))
        return false
      return true
    })
  }, [users, roleTab, statusFilter, cityFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const openEdit = (u: User) => {
    setEditTarget(u)
    setEditForm({
      fullName: u.fullName,
      role: u.role,
      phone: u.phone,
      city: u.city,
      bio: u.bio,
      status: u.status,
      specialization: u.specialization ?? '',
      experienceYears: String(u.experienceYears ?? ''),
      rating: String(u.rating ?? ''),
      xp: String(u.xp ?? ''),
      level: u.level ?? '',
      balance: String(u.balance ?? ''),
    })
  }

  const handleCreate = async () => {
    if (!createForm.fullName.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      dispatch(
        pushToast({ type: 'error', title: 'Xəta', message: 'Ad, e-poçt və şifrə mütləqdir.' }),
      )
      return
    }
    try {
      await createUser({
        fullName: createForm.fullName,
        email: createForm.email.trim().toLowerCase(),
        password: createForm.password,
        role: createForm.role,
        phone: createForm.phone,
        city: createForm.city,
        bio: createForm.bio,
        status: createForm.status,
        ...(createForm.role === 'student' ? { xp: 0, level: 'Səviyyə 1', balance: 0 } : {}),
        ...(createForm.role === 'teacher'
          ? { specialization: '', experienceYears: 0, rating: 0 }
          : {}),
      }).unwrap()
      setCreateOpen(false)
      setCreateForm(EMPTY_CREATE)
      dispatch(
        pushToast({
          type: 'success',
          title: 'İstifadəçi yaradıldı',
          message: 'Yeni hesab uğurla əlavə edildi.',
        }),
      )
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const handleUpdate = async () => {
    if (!editTarget || !editForm) return
    const patch: Partial<User> = {
      fullName: editForm.fullName,
      role: editForm.role,
      phone: editForm.phone,
      city: editForm.city,
      bio: editForm.bio,
      status: editForm.status,
    }
    if (editForm.role === 'teacher') {
      patch.specialization = editForm.specialization
      patch.experienceYears = Number(editForm.experienceYears) || 0
      patch.rating = Number(editForm.rating) || 0
    }
    if (editForm.role === 'student') {
      patch.xp = Number(editForm.xp) || 0
      patch.level = editForm.level || 'Səviyyə 1'
      patch.balance = Number(editForm.balance) || 0
    }
    try {
      await updateUser({ id: editTarget.id, patch }).unwrap()
      setEditTarget(null)
      setEditForm(null)
      dispatch(pushToast({ type: 'success', title: 'Yeniləndi', message: 'Məlumatlar saxlanıldı.' }))
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const handleToggle = async (target: User) => {
    try {
      await toggleStatus(target.id).unwrap()
      dispatch(
        pushToast({
          type: 'success',
          title: 'Status dəyişdirildi',
          message:
            target.status === 'active' ? 'Hesab bloklandı.' : 'Hesab yenidən aktivləşdirildi.',
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
      dispatch(pushToast({ type: 'success', title: 'Silindi', message: 'İstifadəçi silindi.' }))
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  if (isLoading) return <Loader label="İstifadəçilər yüklənir..." />

  return (
    <div className="space-y-7">
      <PageHeader
        icon={<UsersIcon className="h-6 w-6" />}
        title="İstifadəçilər"
        subtitle="Bütün hesabları idarə edin, rol və statusları tənzimləyin"
        actions={
          <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Yeni istifadəçi
          </Button>
        }
      />

      <div className="grid animate-fade-up gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ümumi istifadəçi"
          value={counts.all}
          icon={<UsersIcon className="h-5 w-5" />}
          tone="brand"
        />
        <StatCard
          label="Tələbələr"
          value={counts.student}
          icon={<BookOpen className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="Müəllimlər"
          value={counts.teacher}
          icon={<GraduationCap className="h-5 w-5" />}
          tone="neon"
        />
        <StatCard
          label="Bloklanmış hesablar"
          value={counts.blocked}
          icon={<UserX className="h-5 w-5" />}
          tone="rose"
        />
      </div>

      <Panel className="animate-fade-up animate-delay-100 space-y-4">
        <Tabs
          value={roleTab}
          onChange={setRoleTab}
          tabs={[
            { value: 'all', label: 'Hamısı', count: counts.all },
            { value: 'student', label: 'Tələbələr', count: counts.student },
            { value: 'teacher', label: 'Müəllimlər', count: counts.teacher },
            { value: 'admin', label: 'Adminlər', count: counts.admin },
          ]}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Bütün statuslar</option>
            <option value="active">Aktiv</option>
            <option value="blocked">Bloklanmış</option>
          </Select>
          <Select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
            <option value="">Bütün şəhərlər</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
          <Input
            placeholder="Ad və ya e-poçt ilə axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Panel>

      {pageRows.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="h-6 w-6" />}
          title="Nəticə tapılmadı"
          message="Filtrləri dəyişdirərək yenidən cəhd edin və ya yeni istifadəçi yaradın."
        />
      ) : (
        <Panel className="animate-fade-up animate-delay-200">
          <TableWrap>
            <thead>
              <tr>
                <Th>İstifadəçi</Th>
                <Th>Rol</Th>
                <Th>Telefon</Th>
                <Th>Şəhər</Th>
                <Th>Qoşulma tarixi</Th>
                <Th>Status</Th>
                <Th className="text-right">Əməliyyatlar</Th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((u) => {
                const isSelf = u.id === me?.id
                return (
                  <tr key={u.id} className="transition-colors hover:bg-white/[0.03]">
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={u.fullName} gradient={u.avatar} size={38} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{u.fullName}</p>
                          <p className="truncate text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <Badge tone={ROLE_TONE[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                    </Td>
                    <Td>{u.phone || '—'}</Td>
                    <Td>{u.city || '—'}</Td>
                    <Td>{formatDate(u.createdAt)}</Td>
                    <Td>
                      <Badge tone={u.status === 'active' ? 'success' : 'danger'}>
                        {STATUS_LABEL[u.status]}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="xs"
                          variant="ghost"
                          leftIcon={<Eye className="h-3.5 w-3.5" />}
                          onClick={() => setViewTarget(u)}
                        >
                          Bax
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          leftIcon={<Pencil className="h-3.5 w-3.5" />}
                          onClick={() => openEdit(u)}
                        >
                          Redaktə
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          disabled={isSelf}
                          title={isSelf ? 'Öz hesabınızı bloklaya bilməzsiniz' : undefined}
                          leftIcon={
                            u.status === 'active' ? (
                              <Ban className="h-3.5 w-3.5" />
                            ) : (
                              <CheckCircle className="h-3.5 w-3.5" />
                            )
                          }
                          onClick={() => handleToggle(u)}
                        >
                          {u.status === 'active' ? 'Blokla' : 'Aktiv et'}
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          disabled={isSelf}
                          title={isSelf ? 'Öz hesabınızı silə bilməzsiniz' : undefined}
                          className="text-rose-300"
                          leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                          onClick={() => setDeleteTarget(u)}
                        >
                          Sil
                        </Button>
                      </div>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </TableWrap>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Səhifə {safePage} / {totalPages} • {filtered.length} nəticə
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
              >
                Əvvəlki
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
              >
                Sonrakı
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {/* Yeni istifadəçi modalı */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Yeni istifadəçi"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Ləğv et
            </Button>
            <Button loading={creating} onClick={handleCreate}>
              Yarat
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Ad və soyad"
            required
            value={createForm.fullName}
            onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
          />
          <Input
            label="E-poçt"
            required
            type="email"
            value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
          />
          <Input
            label="Şifrə"
            required
            type="text"
            value={createForm.password}
            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
          />
          <Select
            label="Rol"
            value={createForm.role}
            onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as Role })}
          >
            <option value="student">Tələbə</option>
            <option value="teacher">Müəllim</option>
            <option value="admin">Administrator</option>
          </Select>
          <Input
            label="Telefon"
            value={createForm.phone}
            onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
          />
          <Input
            label="Şəhər"
            value={createForm.city}
            onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
          />
          <Select
            label="Status"
            value={createForm.status}
            onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as UserStatus })}
          >
            <option value="active">Aktiv</option>
            <option value="blocked">Bloklanmış</option>
          </Select>
          <Textarea
            label="Bio"
            className="sm:col-span-2"
            value={createForm.bio}
            onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })}
          />
        </div>
      </Modal>

      {/* Profilə baxış modalı */}
      <Modal
        open={Boolean(viewTarget)}
        onClose={() => setViewTarget(null)}
        title="İstifadəçi profili"
        size="xl"
      >
        {viewTarget && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar name={viewTarget.fullName} gradient={viewTarget.avatar} size={64} ring />
              <div className="min-w-0">
                <p className="text-lg font-bold text-white">{viewTarget.fullName}</p>
                <p className="text-sm text-slate-400">{viewTarget.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone={ROLE_TONE[viewTarget.role]}>{ROLE_LABEL[viewTarget.role]}</Badge>
                  <Badge tone={viewTarget.status === 'active' ? 'success' : 'danger'}>
                    {STATUS_LABEL[viewTarget.status]}
                  </Badge>
                  {viewTarget.city && <Badge tone="neutral">{viewTarget.city}</Badge>}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Bio</p>
                <p className="mt-1 text-sm text-slate-300">{viewTarget.bio || '—'}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Əlaqə</p>
                <p className="mt-1 text-sm text-slate-300">{viewTarget.phone || '—'}</p>
                <p className="text-xs text-slate-500">
                  Qoşulma: {formatDate(viewTarget.createdAt)}
                </p>
              </div>
              {viewTarget.role === 'teacher' && (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">İxtisas</p>
                  <p className="mt-1 text-sm text-slate-300">
                    {viewTarget.specialization || '—'} • {viewTarget.experienceYears ?? 0} il
                  </p>
                </div>
              )}
              {viewTarget.role === 'student' && (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Nailiyyət</p>
                  <p className="mt-1 text-sm text-slate-300">
                    {viewTarget.level ?? 'Səviyyə 1'} • {viewTarget.xp ?? 0} XP
                  </p>
                  <p className="text-xs text-slate-500">
                    Balans: {formatAZN(viewTarget.balance ?? 0)}
                  </p>
                </div>
              )}
            </div>

            <UserDetailPanel userId={viewTarget.id} courses={courses} />
          </div>
        )}
      </Modal>

      {/* Redaktə modalı */}
      <Modal
        open={Boolean(editTarget && editForm)}
        onClose={() => {
          setEditTarget(null)
          setEditForm(null)
        }}
        title="İstifadəçini redaktə et"
        size="lg"
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
            <Select
              label="Rol"
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}
            >
              <option value="student">Tələbə</option>
              <option value="teacher">Müəllim</option>
              <option value="admin">Administrator</option>
            </Select>
            <Input
              label="Telefon"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
            <Input
              label="Şəhər"
              value={editForm.city}
              onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
            />
            <Select
              label="Status"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as UserStatus })}
            >
              <option value="active">Aktiv</option>
              <option value="blocked">Bloklanmış</option>
            </Select>
            {editForm.role === 'teacher' && (
              <>
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
              </>
            )}
            {editForm.role === 'student' && (
              <>
                <Input
                  label="XP"
                  type="number"
                  value={editForm.xp}
                  onChange={(e) => setEditForm({ ...editForm, xp: e.target.value })}
                />
                <Input
                  label="Səviyyə"
                  value={editForm.level}
                  onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                />
                <Input
                  label="Balans"
                  type="number"
                  value={editForm.balance}
                  onChange={(e) => setEditForm({ ...editForm, balance: e.target.value })}
                />
              </>
            )}
            <Textarea
              label="Bio"
              className="sm:col-span-2"
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="İstifadəçini silmək?"
        message={`${deleteTarget?.fullName ?? ''} adlı istifadəçi və ona aid bütün qeydiyyat və ödənişlər silinəcək.`}
        confirmLabel="Sil"
      />
    </div>
  )
}
