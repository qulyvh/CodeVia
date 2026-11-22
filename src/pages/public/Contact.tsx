import { useState } from 'react'
import type { FormEvent } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Building2,
  ChevronDown,
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  Phone,
  Send,
} from 'lucide-react'
import { useAppDispatch } from '../../app/hooks'
import { pushToast } from '../../features/ui/uiSlice'
import { CAMPUSES, cn, generatedImage } from '../../lib/utils'
import { Badge, Button, Input, Panel, SectionTitle, Textarea } from '../../components/ui'
import { GradientBlobs } from '../../components/common'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const INFO: { icon: LucideIcon; label: string; value: string; href?: string }[] = [
  { icon: MapPin, label: 'Ünvan', value: 'Bakı, Nizami küç. 203' },
  { icon: Phone, label: 'Telefon', value: '+994 12 310 40 40', href: 'tel:+994123104040' },
  { icon: Mail, label: 'E-poçt', value: 'info@codevia.az', href: 'mailto:info@codevia.az' },
  { icon: Clock, label: 'İş saatları', value: 'B.e – C, 09:00 – 20:00' },
]

const SOCIALS: { label: string; href: string }[] = [
  { label: 'Facebook', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'LinkedIn', href: '#' },
  { label: 'YouTube', href: '#' },
]

const FAQ = [
  {
    q: 'Kurslara necə qoşula bilərəm?',
    a: 'Kurs səhifəsindən «Qoşul» düyməsini basın, qəbul testini keçin, paket və cədvəl seçin. Ödəniş təsdiqləndikdən sonra kurs şəxsi kabinetdə görünür.',
  },
  {
    q: 'Ödəniş üsulları hansılardır?',
    a: 'Bank kartı ilə tam ödəniş və ya Pro/Elite paketlər üçün hissə-hissə (installment) seçimi mövcuddur. Bu simulyasiya mühitində real ödəniş yoxdur.',
  },
  {
    q: 'Filiallara gəlmək mütləqdir?',
    a: 'Xeyr. Onlayn qruplara ölkənin hər yerindən qoşula bilərsiniz. Oflayn və hibrid formatlar Bakı, Sumqayıt və Gəncə filiallarında keçirilir.',
  },
  {
    q: 'Kursu bitirdikdə sertifikat verilir?',
    a: 'Bəli, bütün dərsləri tamamlayan tələbələrə CodeVia Academy-nin rəsmi sertifikatı verilir və şəxsi kabinetdən yüklənə bilər.',
  },
]

interface ContactErrors {
  name?: string
  email?: string
  message?: string
}

export default function Contact() {
  const dispatch = useAppDispatch()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<ContactErrors>({})
  const [open, setOpen] = useState<number | null>(0)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const next: ContactErrors = {}
    if (!name.trim()) next.name = 'Adınızı daxil edin.'
    if (!email.trim()) next.email = 'E-poçtu daxil edin.'
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Düzgün e-poçt ünvanı daxil edin.'
    if (!message.trim()) next.message = 'Mesajınızı yazın.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    dispatch(
      pushToast({
        type: 'success',
        title: 'Mesajınız göndərildi',
        message: 'Ən qısa zamanda sizinlə əlaqə saxlayacağıq.',
      }),
    )
    setName('')
    setEmail('')
    setSubject('')
    setMessage('')
    setErrors({})
  }

  return (
    <section className="relative overflow-hidden py-10 lg:py-16">
      <div className="absolute inset-0 grid-bg" />
      <GradientBlobs />
      <div className="relative mx-auto w-full max-w-7xl px-5">
        <div className="max-w-2xl animate-fade-up">
          <Badge tone="brand" icon={<Mail className="h-3.5 w-3.5" />}>
            Əlaqə
          </Badge>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
            Bizimlə <span className="gradient-text">əlaqə saxlayın</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
            Suallarınız var? Formu doldurun və ya filiallarımızla birbaşa əlaqə saxlayın — komandamız ən
            qısa zamanda cavab verir.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* ---------------- Sol: kontakt məlumatları ---------------- */}
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {INFO.map((item) => {
                const Icon = item.icon
                const content = (
                  <>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-brand-500/15 text-brand-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                      <p className="mt-0.5 truncate text-sm font-semibold text-white">{item.value}</p>
                    </div>
                  </>
                )
                return item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className="panel panel-hover flex items-center gap-3 p-4"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={item.label} className="panel flex items-center gap-3 p-4">
                    {content}
                  </div>
                )
              })}
            </div>

            <Panel className="rounded-3xl">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-brand-500/15 text-brand-300">
                  <Building2 className="h-5 w-5" />
                </span>
                <h3 className="text-base font-bold text-white">Filiallarımız</h3>
              </div>
              <ul className="mt-4 space-y-2">
                {CAMPUSES.map((c) => (
                  <li
                    key={c}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2 text-sm text-slate-300"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-brand-400" />
                    {c}
                  </li>
                ))}
              </ul>
            </Panel>

            <div className="relative overflow-hidden rounded-3xl border border-white/10">
              <img
                src={generatedImage(
                  'minimal stylized city map of Baku with a glowing location pin marker, dark navy tech UI style, clean vector illustration, no text',
                  'landscape_16_9',
                )}
                alt="CodeVia Academy filiallarının xəritəsi"
                className="h-64 w-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <Badge tone="brand" icon={<MapPin className="h-3.5 w-3.5" />}>
                  Bakı, Nizami küç. 203
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-300 transition-all hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-white"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* ---------------- Sağ: əlaqə forması ---------------- */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-[36px] bg-brand-grad opacity-15 blur-3xl" />
            <div className="relative animate-fade-up animate-delay-100">
              <Panel className="rounded-3xl">
                <h2 className="text-xl font-extrabold text-white">Mesaj göndərin</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Formu doldurun, komandamız sizinlə əlaqə saxlayacaq.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                  <Input
                    label="Ad"
                    name="name"
                    placeholder="Adınız"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                    required
                  />
                  <Input
                    label="E-poçt"
                    name="email"
                    type="email"
                    placeholder="ad@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    required
                  />
                  <Input
                    label="Mövzu"
                    name="subject"
                    placeholder="Mövzu"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                  <Textarea
                    label="Mesaj"
                    name="message"
                    placeholder="Mesajınızı buraya yazın..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    error={errors.message}
                    required
                  />
                  <Button type="submit" full size="lg" leftIcon={<Send className="h-4 w-4" />}>
                    Mesajı göndər
                  </Button>
                </form>
              </Panel>
            </div>
          </div>
        </div>

        {/* ---------------- FAQ ---------------- */}
        <div className="mx-auto mt-16 max-w-4xl">
          <SectionTitle
            icon={<HelpCircle className="h-5 w-5" />}
            title="Tez-tez verilən suallar"
            subtitle="Ən çox soruşulan suallar"
          />
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={item.q} className="panel overflow-hidden p-0">
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-bold text-white">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-brand-300 transition-transform',
                      open === i && 'rotate-180',
                    )}
                  />
                </button>
                {open === i && (
                  <p className="animate-fade-in border-t border-white/10 px-5 py-4 text-sm leading-relaxed text-slate-400">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Zəhmət olmasa bütün vacib sahələri doldurun — bu, komandamızın sizə daha tez cavab verməsinə
          kömək edir.
        </p>
      </div>
    </section>
  )
}
