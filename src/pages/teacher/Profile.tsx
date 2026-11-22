import { useEffect, useState } from 'react'
import {
  Award,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Lock,
  Mail,
  Quote,
  Save,
  ShieldCheck,
  UserCircle,
  Users,
} from 'lucide-react'
import { useAppDispatch, useAuth } from '../../app/hooks'
import {
  useGetTeacherStatsQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
} from '../../features/api/apiSlice'
import { pushToast } from '../../features/ui/uiSlice'
import {
  Badge,
  Button,
  Input,
  Loader,
  Panel,
  Rating,
  SectionTitle,
  Textarea,
  Toggle,
} from '../../components/ui'
import { PageHeader, ProfilePhotoCard } from '../../components/common'
import { getErrMsg, ROLE_LABEL } from '../../lib/utils'

/* --- Tələbə rəyləri (statik nümunə) --- */
interface Testimonial {
  name: string
  course: string
  rating: number
  text: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Aysel Rzayeva',
    course: 'React & TypeScript',
    rating: 5,
    text: 'Dərslər son dərəcə aydın və praktikdir. Hər mövzu real layihə nümunəsi ilə izah olunur.',
  },
  {
    name: 'Orxan Nəbiyev',
    course: 'Frontend Əsasları',
    rating: 5,
    text: 'Müəllim hər suala səbirlə cavab verir və kodu canlı izah edir. Kursu bitirdikdən sonra işə düzəldim.',
  },
  {
    name: 'Günel Həsənova',
    course: 'React & TypeScript',
    rating: 4,
    text: 'Tapşırıqlar çox faydalıdır, xüsusilə kod baxışı (code review) hissəsi mənə çox şey qazandırdı.',
  },
]

export default function TeacherProfile() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()

  const { data: users = [] } = useGetUsersQuery()
  const { data: stats, isLoading: statsLoading } = useGetTeacherStatsQuery(user?.id ?? '', {
    skip: !user?.id,
  })
  const [updateUser, { isLoading: saving }] = useUpdateUserMutation()

  const me = users.find((u) => u.id === user?.id)

  const toList = (value: string) =>
    value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    city: '',
    specialization: '',
    experienceYears: '',
    hourlyRate: '',
    education: '',
    skills: '',
    languages: '',
    bio: '',
  })
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [prefs, setPrefs] = useState({
    newEnrollment: true,
    weeklyReport: false,
    publicProfile: true,
  })

  useEffect(() => {
    if (!me) return
    setForm({
      fullName: me.fullName,
      phone: me.phone,
      city: me.city,
      specialization: me.specialization ?? '',
      experienceYears: me.experienceYears !== undefined ? String(me.experienceYears) : '',
      hourlyRate: me.hourlyRate !== undefined ? String(me.hourlyRate) : '',
      education: me.education ?? '',
      skills: (me.skills ?? []).join(', '),
      languages: (me.languages ?? []).join(', '),
      bio: me.bio,
    })
  }, [me])

  const rating = me?.rating ?? stats?.avgRating ?? 0
  const experience = me?.experienceYears ?? 0

  const handleSave = async () => {
    if (!user) return
    try {
      await updateUser({
        id: user.id,
        patch: {
          fullName: form.fullName.trim(),
          phone: form.phone,
          city: form.city,
          specialization: form.specialization,
          experienceYears: Number(form.experienceYears) || 0,
          hourlyRate: Number(form.hourlyRate) || 0,
          education: form.education,
          skills: toList(form.skills),
          languages: toList(form.languages),
          bio: form.bio,
        },
      }).unwrap()
      dispatch(
        pushToast({
          type: 'success',
          title: 'Profil yeniləndi',
          message: 'Məlumatlarınız uğurla yadda saxlanıldı.',
        }),
      )
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const handlePassword = () => {
    if (pw.current.length < 6 || pw.next.length < 6) {
      dispatch(
        pushToast({ type: 'error', title: 'Şifrə səhvdir', message: 'Şifrə ən azı 6 simvol olmalıdır.' }),
      )
      return
    }
    if (pw.next !== pw.confirm) {
      dispatch(
        pushToast({ type: 'error', title: 'Uyğunsuzluq', message: 'Yeni şifrələr bir-birinə uyğun gəlmir.' }),
      )
      return
    }
    setPw({ current: '', next: '', confirm: '' })
    dispatch(pushToast({ type: 'success', title: 'Şifrə dəyişdirildi', message: 'Yeni şifrə uğurla təyin edildi.' }))
  }

  const handlePref = (label: string, value: boolean) => {
    dispatch(
      pushToast({
        type: 'info',
        title: label,
        message: value ? 'Aktiv edildi.' : 'Deaktiv edildi.',
      }),
    )
  }

  const header = (
    <PageHeader
      title="Profil"
      subtitle="Şəxsi məlumatlarınızı və hesab ayarlarınızı idarə edin"
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
        {/* Sol — şəxsiyyət kartı */}
        <Panel className="animate-fade-up animate-delay-100 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            {user && <ProfilePhotoCard user={user} photo={me?.photo} />}
            <h3 className="mt-4 text-lg font-bold text-white">
              {me?.fullName ?? user?.fullName ?? 'Müəllim'}
            </h3>
            <p className="mt-0.5 text-sm text-slate-400">{user?.email ?? '—'}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <Badge tone="brand" icon={<Award className="h-3 w-3" />}>
                {user ? ROLE_LABEL[user.role] : 'Müəllim'}
              </Badge>
              <Badge tone="neon" icon={<Briefcase className="h-3 w-3" />}>
                {experience} il təcrübə
              </Badge>
            </div>
            <div className="mt-3">
              <Rating value={rating} size={16} />
            </div>
          </div>

          <div className="mt-5">
            <Input
              label="İxtisas"
              value={form.specialization}
              onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))}
              placeholder="Məs. Frontend / React & TypeScript"
              hint="Dəyişikliyi sağdaki formadan yadda saxlayın"
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-center">
              <BookOpen className="mx-auto h-4 w-4 text-brand-300" />
              <p className="mt-2 text-xl font-extrabold text-white">{stats?.courses ?? 0}</p>
              <p className="text-xs text-slate-500">Kurs</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-center">
              <Users className="mx-auto h-4 w-4 text-accent-300" />
              <p className="mt-2 text-xl font-extrabold text-white">{stats?.students ?? 0}</p>
              <p className="text-xs text-slate-500">Tələbə</p>
            </div>
          </div>

          <div className="divider my-6" />

          {/* Tələbə rəyləri */}
          <SectionTitle
            title="Tələbə rəyləri"
            subtitle="Tələbələrin fikirləri"
            icon={<Quote className="h-5 w-5" />}
          />
          <div className="space-y-4">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white">{t.name}</span>
                  <Rating value={t.rating} size={13} />
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{t.course}</p>
                <p className="mt-2 text-sm text-slate-300">{t.text}</p>
              </div>
            ))}
          </div>
        </Panel>

        {/* Sağ — formalar */}
        <div className="space-y-6 lg:col-span-2">
          {/* Şəxsi məlumatlar */}
          <Panel className="animate-fade-up animate-delay-200">
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
              <Input
                label="E-poçt"
                value={user?.email ?? ''}
                disabled
                hint="E-poçt dəyişdirilə bilməz"
              />
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
              <Input
                label="İxtisas"
                value={form.specialization}
                onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))}
                placeholder="Məs. Frontend / React & TypeScript"
              />
              <Input
                label="Təcrübə (il)"
                type="number"
                min={0}
                max={60}
                value={form.experienceYears}
                onChange={(e) => setForm((p) => ({ ...p, experienceYears: e.target.value }))}
                placeholder="9"
              />
              <Input
                label="Saatlıq haqqı (AZN)"
                type="number"
                min={0}
                value={form.hourlyRate}
                onChange={(e) => setForm((p) => ({ ...p, hourlyRate: e.target.value }))}
                placeholder="35"
              />
              <div className="sm:col-span-2">
                <Input
                  label="Təhsil"
                  value={form.education}
                  onChange={(e) => setForm((p) => ({ ...p, education: e.target.value }))}
                  placeholder="Məs. ADA University — Kompüter Elmləri"
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Bacarıqlar (vergüllə ayırın)"
                  value={form.skills}
                  onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))}
                  placeholder="React, TypeScript, Node.js"
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Dillər (vergüllə ayırın)"
                  value={form.languages}
                  onChange={(e) => setForm((p) => ({ ...p, languages: e.target.value }))}
                  placeholder="Azərbaycan, İngilis, Rus"
                />
              </div>
              <div className="sm:col-span-2">
                <Textarea
                  label="Haqqımda"
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Tələbələr üçün qısa təqdimat..."
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
          </Panel>

          {/* Şifrənin dəyişdirilməsi */}
          <Panel className="animate-fade-up animate-delay-300">
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
              <Button variant="secondary" onClick={handlePassword} leftIcon={<Lock className="h-4 w-4" />}>
                Şifrəni dəyiş
              </Button>
            </div>
          </Panel>

          {/* Bildiriş və görünürlük */}
          <Panel className="animate-fade-up animate-delay-500">
            <SectionTitle
              title="Bildiriş və görünürlük"
              subtitle="Hesab ayarlarınızı fərdiləşdirin"
              icon={<ShieldCheck className="h-5 w-5" />}
            />
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <Bell className="h-4 w-4 text-brand-300" /> Yeni qeydiyyat bildirişləri
                </span>
                <Toggle
                  checked={prefs.newEnrollment}
                  onChange={(v) => {
                    setPrefs((p) => ({ ...p, newEnrollment: v }))
                    handlePref('Yeni qeydiyyat bildirişləri', v)
                  }}
                />
              </div>
              <div className="divider" />
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <Mail className="h-4 w-4 text-accent-300" /> Həftəlik hesabat e-poçtu
                </span>
                <Toggle
                  checked={prefs.weeklyReport}
                  onChange={(v) => {
                    setPrefs((p) => ({ ...p, weeklyReport: v }))
                    handlePref('Həftəlik hesabat e-poçtu', v)
                  }}
                />
              </div>
              <div className="divider" />
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <Building2 className="h-4 w-4 text-neon-300" /> Profilimin ictimai görünməsi
                </span>
                <Toggle
                  checked={prefs.publicProfile}
                  onChange={(v) => {
                    setPrefs((p) => ({ ...p, publicProfile: v }))
                    handlePref('Profilimin ictimai görünməsi', v)
                  }}
                />
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
