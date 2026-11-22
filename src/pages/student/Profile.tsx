import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Award,
  Bell,
  BookOpen,
  CheckCircle2,
  Clock,
  Lock,
  Save,
  ShieldCheck,
  UserCircle,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAppDispatch, useAuth } from '../../app/hooks'
import {
  useGetCoursesQuery,
  useGetEnrollmentsQuery,
  useGetStudentStatsQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
} from '../../features/api/apiSlice'
import { pushToast } from '../../features/ui/uiSlice'
import {
  Badge,
  Button,
  ConfirmDialog,
  Input,
  Loader,
  Panel,
  Ring,
  SectionTitle,
  Textarea,
  Toggle,
} from '../../components/ui'
import { PageHeader, ProfilePhotoCard } from '../../components/common'
import { getErrMsg, percent, ROLE_LABEL } from '../../lib/utils'

export default function StudentProfile() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()

  const { data: users = [] } = useGetUsersQuery()
  const { data: stats, isLoading: statsLoading } = useGetStudentStatsQuery(user?.id ?? '', {
    skip: !user?.id,
  })
  const { data: enrollments = [] } = useGetEnrollmentsQuery(
    { studentId: user?.id },
    { skip: !user?.id },
  )
  const { data: courses = [] } = useGetCoursesQuery()
  const [updateUser, { isLoading: saving }] = useUpdateUserMutation()

  const me = users.find((u) => u.id === user?.id)

  const [form, setForm] = useState({ fullName: '', phone: '', city: '', bio: '' })
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [twoFactor, setTwoFactor] = useState(false)
  const [notify, setNotify] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (!me) return
    setForm({ fullName: me.fullName, phone: me.phone, city: me.city, bio: me.bio })
  }, [me])

  const overall = percent(stats?.lessonsDone ?? 0, stats?.totalLessons ?? 0)
  const courseOf = (id: string) => courses.find((c) => c.id === id)
  const totalHours = enrollments.reduce((s, e) => s + (courseOf(e.courseId)?.totalHours ?? 0), 0)

  const handleSave = async () => {
    if (!user) return
    try {
      await updateUser({ id: user.id, patch: form }).unwrap()
      dispatch(pushToast({ type: 'success', title: 'Profil yeniləndi' }))
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const handlePassword = () => {
    if (pw.current.length < 6 || pw.next.length < 6) {
      dispatch(pushToast({ type: 'error', title: 'Şifrə ən azı 6 simvol olmalıdır' }))
      return
    }
    if (pw.next !== pw.confirm) {
      dispatch(pushToast({ type: 'error', title: 'Yeni şifrələr uyğun gəlmir' }))
      return
    }
    setPw({ current: '', next: '', confirm: '' })
    dispatch(pushToast({ type: 'success', title: 'Şifrə uğurla dəyişdirildi' }))
  }

  const handleToggle = (label: string, value: boolean) => {
    dispatch(
      pushToast({ type: 'info', title: `${label}: ${value ? 'aktiv edildi' : 'deaktiv edildi'}` }),
    )
  }

  const header = (
    <PageHeader
      title="Profil"
      subtitle="Şəxsi məlumatlarınızı, təhlükəsizliyi və statistikanızı idarə edin"
      icon={<UserCircle className="h-6 w-6" />}
    />
  )

  if (statsLoading) {
    return (
      <div className="animate-fade-up">
        {header}
        <Loader label="Profil yüklənir..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">{header}</div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sol — avatar blokı */}
        <Panel className="animate-fade-up animate-delay-100 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            {user && <ProfilePhotoCard user={user} photo={me?.photo} />}
            <h3 className="mt-4 text-lg font-bold text-white">{user?.fullName ?? 'Tələbə'}</h3>
            <p className="mt-0.5 text-sm text-slate-400">{user?.email ?? '—'}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <Badge tone="brand">{user ? ROLE_LABEL[user.role] : 'Tələbə'}</Badge>
              <Badge tone="neon" icon={<Award className="h-3 w-3" />}>
                {stats?.level ?? 'Səviyyə 1'}
              </Badge>
            </div>

            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <Ring value={overall} size={72} label="Ümumi" />
              <div className="text-left">
                <p className="text-sm font-bold text-white">{stats?.xp ?? 0} XP</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {stats?.lessonsDone ?? 0} dərs tamamlanıb
                </p>
              </div>
            </div>
          </div>
        </Panel>

        {/* Sağ — profil forması */}
        <Panel className="animate-fade-up animate-delay-200 lg:col-span-2">
          <SectionTitle
            title="Şəxsi məlumatlar"
            subtitle="Məlumatlarınızı yeniləyə bilərsiniz"
            icon={<UserCircle className="h-5 w-5" />}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Ad və soyad"
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              required
            />
            <Input label="E-poçt" value={user?.email ?? ''} disabled hint="E-poçt dəyişdirilə bilməz" />
            <Input
              label="Telefon"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+994 50 000 00 00"
            />
            <Input
              label="Şəhər"
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              placeholder="Bakı"
            />
            <div className="sm:col-span-2">
              <Textarea
                label="Haqqımda"
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Özünüz haqqında qısa məlumat..."
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button
              variant="primary"
              loading={saving}
              onClick={handleSave}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Yadda saxla
            </Button>
          </div>

          <div className="divider my-6" />

          <SectionTitle
            title="Şifrənin dəyişdirilməsi"
            subtitle="Təhlükəsizlik üçün güclü şifrə seçin"
            icon={<Lock className="h-5 w-5" />}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Cari şifrə"
              type="password"
              value={pw.current}
              onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
              placeholder="••••••••"
            />
            <Input
              label="Yeni şifrə"
              type="password"
              value={pw.next}
              onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
              placeholder="••••••••"
              hint="Ən azı 6 simvol"
            />
            <Input
              label="Yeni şifrə (təkrar)"
              type="password"
              value={pw.confirm}
              onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
              placeholder="••••••••"
            />
          </div>
          <div className="mt-5 flex justify-end">
            <Button
              variant="secondary"
              onClick={handlePassword}
              leftIcon={<Lock className="h-4 w-4" />}
            >
              Şifrəni dəyiş
            </Button>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Statistika */}
        <Panel className="animate-fade-up animate-delay-300 lg:col-span-2">
          <SectionTitle
            title="Statistika"
            subtitle="Təhsilinizin ümumi göstəriciləri"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
              <BookOpen className="h-4 w-4 text-brand-300" />
              <p className="mt-2 text-xl font-extrabold text-white">{enrollments.length}</p>
              <p className="text-xs text-slate-500">Qeydiyyat</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              <p className="mt-2 text-xl font-extrabold text-white">
                {stats?.completedCourses ?? 0}
              </p>
              <p className="text-xs text-slate-500">Tamamlanmış</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
              <Clock className="h-4 w-4 text-accent-300" />
              <p className="mt-2 text-xl font-extrabold text-white">{totalHours}</p>
              <p className="text-xs text-slate-500">Saat</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
              <Award className="h-4 w-4 text-amber-300" />
              <p className="mt-2 text-xl font-extrabold text-white">{stats?.avgGrade ?? 0}</p>
              <p className="text-xs text-slate-500">Orta bal</p>
            </div>
          </div>

          <div className="mt-5 h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.weeklyActivity ?? []} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="profileArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: '#0d1326',
                    border: '1px solid rgba(255,255,255,.1)',
                    borderRadius: 12,
                    color: '#fff',
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fill="url(#profileArea)"
                  name="Dəqiqə"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <div className="space-y-6 lg:col-span-1">
          {/* Təhlükəsizlik */}
          <Panel className="animate-fade-up animate-delay-300">
            <SectionTitle
              title="Təhlükəsizlik"
              subtitle="Hesab təhlükəsizliyi ayarları"
              icon={<ShieldCheck className="h-5 w-5" />}
            />
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-brand-300" /> İki addımlı doğrulama
                </span>
                <Toggle checked={twoFactor} onChange={(v) => { setTwoFactor(v); handleToggle('İki addımlı doğrulama', v) }} />
              </div>
              <div className="divider" />
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <Bell className="h-4 w-4 text-accent-300" /> Bildirişlər
                </span>
                <Toggle checked={notify} onChange={(v) => { setNotify(v); handleToggle('Bildirişlər', v) }} />
              </div>
            </div>
          </Panel>

          {/* Təhlükəli zona */}
          <Panel className="animate-fade-up animate-delay-500 border-rose-400/25">
            <SectionTitle
              title="Təhlükəli zona"
              subtitle="Bu əməliyyat geri qaytarıla bilməz"
              icon={<AlertTriangle className="h-5 w-5" />}
            />
            <p className="mb-4 text-sm text-slate-400">
              Hesabınızı sildikdə bütün qeydiyyat, ödəniş və tərəqqi məlumatlarınız silinəcək.
            </p>
            <Button
              variant="danger"
              leftIcon={<AlertTriangle className="h-4 w-4" />}
              onClick={() => setDeleteOpen(true)}
            >
              Hesabı sil
            </Button>
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false)
          dispatch(
            pushToast({
              type: 'error',
              title: 'Hesab silinməsi bu mühitdə mümkün deyil',
            }),
          )
        }}
        title="Hesabı sil"
        message="Hesabınızı silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz."
        confirmLabel="Hesabı sil"
      />
    </div>
  )
}
