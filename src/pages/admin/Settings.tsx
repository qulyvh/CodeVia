import { useState } from 'react'
import {
  Bell,
  Building,
  CalendarClock,
  Coins,
  Database,
  Languages,
  Mail,
  MapPin,
  Palette,
  Percent,
  Phone,
  RefreshCw,
  Save,
  Server,
  Settings as SettingsIcon,
  ShieldCheck,
} from 'lucide-react'
import type { PackageOption, ScheduleSlot } from '../../types'
import {
  Badge,
  Button,
  ConfirmDialog,
  Input,
  Panel,
  SectionTitle,
  Select,
  Tabs,
  Textarea,
  Toggle,
} from '../../components/ui'
import { PageHeader } from '../../components/common'
import { useAppDispatch } from '../../app/hooks'
import { pushToast } from '../../features/ui/uiSlice'
import { useGetAdminStatsQuery, useResetDatabaseMutation } from '../../features/api/apiSlice'
import {
  CAMPUSES,
  PACKAGES,
  SLOT_LABEL,
  WEEKDAYS,
  formatAZN,
  formatDate,
  getErrMsg,
  packagePrice,
  todayISO,
} from '../../lib/utils'

type SettingsTab = 'umumi' | 'qiymetler' | 'cedvel' | 'bildirisler' | 'sistem'

const SLOTS = Object.keys(SLOT_LABEL) as ScheduleSlot[]

export default function AdminSettings() {
  const dispatch = useAppDispatch()
  const { data: stats } = useGetAdminStatsQuery()
  const [resetDatabase, { isLoading: resetting }] = useResetDatabaseMutation()

  const [tab, setTab] = useState<SettingsTab>('umumi')

  /* Ümumi */
  const [platform, setPlatform] = useState({
    name: 'CodeVia Academy',
    email: 'destek@codevia.az',
    phone: '+994 12 345 67 89',
    address: 'Bakı, Nizami küçəsi 203, AZ1010',
    lang: 'az',
  })
  const [general, setGeneral] = useState({
    registration: true,
    onlinePayment: true,
    autoCert: false,
  })

  /* Qiymətlər & paketlər */
  const [pkgs, setPkgs] = useState<PackageOption[]>(() =>
    PACKAGES.map((p) => ({ ...p, features: [...p.features] })),
  )
  const [currency, setCurrency] = useState('AZN')
  const [discount, setDiscount] = useState('0')

  /* Cədvəl */
  const [slotOn, setSlotOn] = useState<Record<ScheduleSlot, boolean>>({
    seher: true,
    gunorta: true,
    axsam: true,
    heftesonu: false,
  })
  const [activeDays, setActiveDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [capacities, setCapacities] = useState<Record<string, string>>(() =>
    Object.fromEntries(CAMPUSES.map((c, i) => [c, String(20 + i * 10)])),
  )
  const [lessonDuration, setLessonDuration] = useState('90')

  /* Bildirişlər */
  const [notif, setNotif] = useState({ email: true, sms: false, push: true, welcome: true })
  const [template, setTemplate] = useState(
    'Salam {ad}! CodeVia Academy-ə xoş gəldiniz. Qeydiyyatınız uğurla tamamlandı, kursunuz artıq aktivdir.',
  )

  /* Sistem */
  const [maintenance, setMaintenance] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  const save = (message: string) => {
    dispatch(pushToast({ type: 'success', title: 'Yadda saxlanıldı', message }))
  }

  const updatePkg = (tier: PackageOption['tier'], patch: Partial<PackageOption>) => {
    setPkgs((list) => list.map((p) => (p.tier === tier ? { ...p, ...patch } : p)))
  }

  const toggleDay = (value: number) => {
    setActiveDays((days) =>
      days.includes(value) ? days.filter((d) => d !== value) : [...days, value].sort((a, b) => a - b),
    )
  }

  const handleReset = async () => {
    try {
      await resetDatabase().unwrap()
      setResetOpen(false)
      dispatch(
        pushToast({
          type: 'success',
          title: 'Baza sıfırlandı',
          message: 'Bütün məlumatlar ilkin vəziyyətinə qaytarıldı.',
        }),
      )
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  const handleTestLoad = async () => {
    try {
      await resetDatabase().unwrap()
      dispatch(
        pushToast({
          type: 'success',
          title: 'İlkin məlumatlar yükləndi',
          message: 'Nümunə məlumat bazası yenidən hazırlandı.',
        }),
      )
    } catch (e) {
      dispatch(pushToast({ type: 'error', title: 'Xəta', message: getErrMsg(e) }))
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader
        icon={<SettingsIcon className="h-6 w-6" />}
        title="Parametrlər"
        subtitle="Platformanın ümumi konfiqurasiyasını idarə edin"
      />

      <Panel className="animate-fade-up">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'umumi', label: 'Ümumi' },
            { value: 'qiymetler', label: 'Qiymətlər & Paketlər' },
            { value: 'cedvel', label: 'Cədvəl' },
            { value: 'bildirisler', label: 'Bildirişlər' },
            { value: 'sistem', label: 'Sistem' },
          ]}
        />
      </Panel>

      {/* ---------------- Ümumi ---------------- */}
      {tab === 'umumi' && (
        <div className="space-y-5 animate-fade-up">
          <Panel>
            <SectionTitle
              title="Platforma məlumatları"
              subtitle="Ümumi əlaqə və brend məlumatları"
              icon={<Building className="h-5 w-5" />}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Platformanın adı"
                value={platform.name}
                onChange={(e) => setPlatform({ ...platform, name: e.target.value })}
              />
              <Input
                label="Dəstək e-poçtu"
                type="email"
                value={platform.email}
                onChange={(e) => setPlatform({ ...platform, email: e.target.value })}
              />
              <Input
                label="Telefon"
                value={platform.phone}
                onChange={(e) => setPlatform({ ...platform, phone: e.target.value })}
              />
              <Input
                label="Ünvan"
                value={platform.address}
                onChange={(e) => setPlatform({ ...platform, address: e.target.value })}
              />
              <Select
                label="Standart dil"
                value={platform.lang}
                onChange={(e) => setPlatform({ ...platform, lang: e.target.value })}
              >
                <option value="az">Azərbaycan</option>
                <option value="en">İngilis</option>
                <option value="ru">Rus</option>
              </Select>
            </div>
            <div className="mt-4 flex flex-wrap gap-6 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {platform.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {platform.phone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {platform.address}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5" /> Dil: {platform.lang.toUpperCase()}
              </span>
            </div>
          </Panel>

          <Panel>
            <SectionTitle
              title="Funksional açarlar"
              subtitle="Qeydiyyat, ödəniş və sertifikat davranışı"
              icon={<ShieldCheck className="h-5 w-5" />}
            />
            <div className="space-y-4">
              <Toggle
                checked={general.registration}
                onChange={(v) => setGeneral({ ...general, registration: v })}
                label="Qeydiyyat açıqdır"
              />
              <Toggle
                checked={general.onlinePayment}
                onChange={(v) => setGeneral({ ...general, onlinePayment: v })}
                label="Onlayn ödəniş aktivdir"
              />
              <Toggle
                checked={general.autoCert}
                onChange={(v) => setGeneral({ ...general, autoCert: v })}
                label="Avtomatik sertifikat"
              />
            </div>
            <div className="mt-5">
              <Button
                leftIcon={<Save className="h-4 w-4" />}
                onClick={() => save('Ümumi parametrlər yeniləndi.')}
              >
                Yadda saxla
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* ---------------- Qiymətlər & Paketlər ---------------- */}
      {tab === 'qiymetler' && (
        <div className="space-y-5 animate-fade-up">
          <Panel>
            <SectionTitle
              title="Valyuta və endirim"
              subtitle="Qiymət göstərilməsi və ümumi endirim faizi"
              icon={<Coins className="h-5 w-5" />}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Valyuta"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="AZN">AZN — Azərbaycan manatı (₼)</option>
                <option value="USD">USD — ABŞ dolları ($)</option>
                <option value="EUR">EUR — Avro (€)</option>
              </Select>
              <Input
                label="Endirim faizi (%)"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
          </Panel>

          <div className="grid gap-5 lg:grid-cols-3">
            {pkgs.map((pkg) => (
              <Panel key={pkg.tier} hover className="flex flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <Badge tone={pkg.highlight ? 'neon' : 'brand'}>
                    {pkg.name}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {formatAZN(packagePrice(599, pkg.tier))}
                  </span>
                </div>

                <Input
                  label="Paket adı"
                  value={pkg.name}
                  onChange={(e) => updatePkg(pkg.tier, { name: e.target.value })}
                />
                <div className="mt-3">
                  <Input
                    label="Slogan"
                    value={pkg.tagline}
                    onChange={(e) => updatePkg(pkg.tier, { tagline: e.target.value })}
                  />
                </div>
                <div className="mt-3">
                  <Input
                    label="Əmsal (multiplier)"
                    type="number"
                    step="0.05"
                    value={pkg.multiplier}
                    onChange={(e) => updatePkg(pkg.tier, { multiplier: Number(e.target.value) })}
                  />
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Xüsusiyyətlər
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pkg.features.map((f) => (
                      <Badge key={f} tone="neutral">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4 border-t border-white/10 pt-4">
                  <Toggle
                    checked={pkg.highlight}
                    onChange={(v) => updatePkg(pkg.tier, { highlight: v })}
                    label="Önə çıxarılan paket"
                  />
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-xs text-slate-500">
                    599 ₼ əsas qiymət üzrə canlı önizləmə
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-white">
                    {formatAZN(Math.round(599 * pkg.multiplier))}
                  </p>
                </div>
              </Panel>
            ))}
          </div>

          <div className="flex justify-end">
            <Button
              leftIcon={<Save className="h-4 w-4" />}
              onClick={() => save('Qiymət və paket parametrləri yeniləndi.')}
            >
              Paketləri yadda saxla
            </Button>
          </div>
        </div>
      )}

      {/* ---------------- Cədvəl ---------------- */}
      {tab === 'cedvel' && (
        <div className="space-y-5 animate-fade-up">
          <Panel>
            <SectionTitle
              title="Dərs vaxtı blokları"
              subtitle="Aktiv dərs cədvəli seçimləri"
              icon={<CalendarClock className="h-5 w-5" />}
            />
            <div className="space-y-4">
              {SLOTS.map((s) => (
                <div
                  key={s}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
                >
                  <span className="text-sm text-slate-200">{SLOT_LABEL[s]}</span>
                  <Toggle
                    checked={slotOn[s]}
                    onChange={(v) => setSlotOn({ ...slotOn, [s]: v })}
                  />
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input
                label="Dərs müddəti (dəq)"
                type="number"
                value={lessonDuration}
                onChange={(e) => setLessonDuration(e.target.value)}
              />
              <div>
                <p className="label">Həftənin dərs günləri</p>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      className={
                        activeDays.includes(d.value)
                          ? 'rounded-lg border border-brand-400/40 bg-brand-500/15 px-3 py-1.5 text-xs font-semibold text-white'
                          : 'rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white'
                      }
                    >
                      {d.short}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          <Panel>
            <SectionTitle
              title="Filialların tutumu"
              subtitle="Hər filial üzrə maksimum tələbə sayı"
              icon={<Building className="h-5 w-5" />}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {CAMPUSES.map((c) => (
                <Input
                  key={c}
                  label={c}
                  type="number"
                  value={capacities[c] ?? ''}
                  onChange={(e) => setCapacities({ ...capacities, [c]: e.target.value })}
                />
              ))}
            </div>
            <div className="mt-5">
              <Button
                leftIcon={<Save className="h-4 w-4" />}
                onClick={() => save('Cədvəl parametrləri yeniləndi.')}
              >
                Yadda saxla
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* ---------------- Bildirişlər ---------------- */}
      {tab === 'bildirisler' && (
        <div className="space-y-5 animate-fade-up">
          <Panel>
            <SectionTitle
              title="Bildiriş kanalları"
              subtitle="İstifadəçilərə göndərilən xəbərdarlıqlar"
              icon={<Bell className="h-5 w-5" />}
            />
            <div className="space-y-4">
              <Toggle
                checked={notif.email}
                onChange={(v) => setNotif({ ...notif, email: v })}
                label="E-poçt bildirişləri"
              />
              <Toggle
                checked={notif.sms}
                onChange={(v) => setNotif({ ...notif, sms: v })}
                label="SMS bildirişləri"
              />
              <Toggle
                checked={notif.push}
                onChange={(v) => setNotif({ ...notif, push: v })}
                label="Tətbiq daxili bildirişlər"
              />
              <Toggle
                checked={notif.welcome}
                onChange={(v) => setNotif({ ...notif, welcome: v })}
                label="Qeydiyyatdan sonra xoş gəldin mesajı"
              />
            </div>
          </Panel>

          <Panel>
            <SectionTitle
              title="Xoş gəldin şablonu"
              subtitle="{ad} yerinə istifadəçinin adı yazılacaq"
              icon={<Mail className="h-5 w-5" />}
            />
            <Textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              hint="Şablonda {ad}, {kurs} kimi dəyişənlərdən istifadə edə bilərsiniz."
            />
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                leftIcon={<Save className="h-4 w-4" />}
                onClick={() => save('Bildiriş şablonu yeniləndi.')}
              >
                Yadda saxla
              </Button>
              <Button
                variant="secondary"
                leftIcon={<Bell className="h-4 w-4" />}
                onClick={() =>
                  dispatch(
                    pushToast({
                      type: 'info',
                      title: 'Nümunə göndərildi',
                      message: 'Test bildirişi uğurla göndərildi.',
                    }),
                  )
                }
              >
                Nümunə göndər
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* ---------------- Sistem ---------------- */}
      {tab === 'sistem' && (
        <div className="space-y-5 animate-fade-up">
          <Panel>
            <SectionTitle
              title="Sistem məlumatları"
              subtitle="Cari baza üzrə qısa statistika"
              icon={<Server className="h-5 w-5" />}
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoRow label="İstifadəçilər" value={stats?.students ?? 0} hint="Tələbələr" />
              <InfoRow label="Müəllimlər" value={stats?.teachers ?? 0} hint="Aktiv müəllimlər" />
              <InfoRow label="Kurslar" value={stats?.courses ?? 0} hint="Ümumi kurs sayı" />
              <InfoRow
                label="Aktiv qeydiyyatlar"
                value={stats?.activeEnrollments ?? 0}
                hint="Davam edən"
              />
              <InfoRow
                label="Ümumi gəlir"
                value={formatAZN(stats?.revenue ?? 0)}
                hint="Ödənilmiş ödənişlər"
              />
              <InfoRow
                label="Gözləyən ödənişlər"
                value={stats?.pendingPayments ?? 0}
                hint="Təsdiq gözləyən"
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">Versiya</p>
                <p className="font-semibold text-white">1.0.0</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">Texnologiya</p>
                <p className="font-semibold text-white">React 19 • TypeScript</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-500">Son yenilənmə</p>
                <p className="font-semibold text-white">{formatDate(todayISO())}</p>
              </div>
            </div>
          </Panel>

          <Panel>
            <SectionTitle
              title="Baxım və məlumatlar"
              subtitle="Sistemin texniki idarəetməsi"
              icon={<Database className="h-5 w-5" />}
            />
            <div className="space-y-4">
              <Toggle
                checked={maintenance}
                onChange={setMaintenance}
                label="Baxım rejimi"
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                loading={resetting}
                onClick={handleTestLoad}
              >
                İlkin məlumatları yüklə
              </Button>
              <Button
                variant="danger"
                leftIcon={<Database className="h-4 w-4" />}
                onClick={() => setResetOpen(true)}
              >
                Verilənlər bazasını sıfırla
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap gap-6 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5" /> Endirim: {discount || 0}%
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5" /> Tema: Tünd (neon)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Baxım rejimi:{' '}
                {maintenance ? 'aktiv' : 'deaktiv'}
              </span>
            </div>
          </Panel>
        </div>
      )}

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        loading={resetting}
        title="Verilənlər bazasını sıfırlamaq?"
        message="Bütün istifadəçilər, kurslar, qeydiyyatlar və ödənişlər silinəcək və ilkin vəziyyətinə qaytarılacaq."
        confirmLabel="Sıfırla"
      />
    </div>
  )
}

function InfoRow({
  label,
  value,
  hint,
}: {
  label: string
  value: number | string
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-extrabold text-white">{value}</p>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
