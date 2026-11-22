import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  LayoutDashboard,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Phone,
  UserPlus,
  X,
} from 'lucide-react'
import { useAppDispatch, useAuth } from '../../app/hooks'
import { logout, ROLE_HOME } from '../../features/auth/authSlice'
import { cn, ROLE_LABEL } from '../../lib/utils'
import { Avatar, Button } from '../ui'
import { Logo } from '../common'
import { ThemeToggle } from '../common/ThemeToggle'

const NAV = [
  { to: '/', label: 'Ana səhifə' },
  { to: '/kurslar', label: 'Kurslar' },
  { to: '/muellimler', label: 'Müəllimlər' },
  { to: '/haqqimizda', label: 'Haqqımızda' },
  { to: '/elaqe', label: 'Əlaqə' },
]

const FOOTER_LINKS = {
  'Platforma': [
    { to: '/kurslar', label: 'Bütün kurslar' },
    { to: '/kurslar?mode=online', label: 'Onlayn kurslar' },
    { to: '/kurslar?mode=offline', label: 'Oflayn kurslar' },
    { to: '/haqqimizda', label: 'Haqqımızda' },
  ],
  'Tələbələr üçün': [
    { to: '/giris', label: 'Şəxsi kabinet' },
    { to: '/qeydiyyat', label: 'Qeydiyyat' },
    { to: '/elaqe', label: 'Dəstək' },
    { to: '/kurslar', label: 'Karyera yolları' },
  ],
}

export function PublicLayout() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          scrolled ? 'border-b border-white/10 bg-ink-950/85 backdrop-blur-xl' : 'bg-transparent',
        )}
      >
        <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-4 px-5">
          <Link to="/">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-xl px-4 py-2 text-sm font-semibold transition-all',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle />
            {user ? (
              <>
                <Link to={ROLE_HOME[user.role]}>
                  <Button variant="glass" size="sm" leftIcon={<LayoutDashboard className="h-4 w-4" />}>
                    {ROLE_LABEL[user.role]} paneli
                  </Button>
                </Link>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3">
                  <Avatar name={user.fullName} gradient={user.avatar} src={user.photo} size={30} />
                  <span className="text-xs font-semibold text-white">
                    {user.fullName.split(' ')[0]}
                  </span>
                  <button
                    onClick={() => {
                      dispatch(logout())
                      navigate('/')
                    }}
                    className="text-slate-400 transition-colors hover:text-rose-400"
                    title="Çıxış"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/giris">
                  <Button variant="ghost" size="sm" leftIcon={<LogIn className="h-4 w-4" />}>
                    Daxil ol
                  </Button>
                </Link>
                <Link to="/qeydiyyat">
                  <Button size="sm" leftIcon={<UserPlus className="h-4 w-4" />}>
                    Qeydiyyat
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menyu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="animate-fade-in border-t border-white/10 bg-ink-950/95 px-5 py-4 backdrop-blur-xl lg:hidden">
            <div className="flex flex-col gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold',
                      isActive ? 'bg-white/10 text-white' : 'text-slate-300',
                    )
                  }
                >
                  {item.label}
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </NavLink>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <div className="mb-1 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
                <span className="text-sm font-semibold text-slate-300">Görünüş</span>
                <ThemeToggle />
              </div>
              {user ? (
                <>
                  <Link to={ROLE_HOME[user.role]}>
                    <Button full leftIcon={<LayoutDashboard className="h-4 w-4" />}>
                      {ROLE_LABEL[user.role]} paneli
                    </Button>
                  </Link>
                  <Button
                    full
                    variant="ghost"
                    leftIcon={<LogOut className="h-4 w-4" />}
                    onClick={() => {
                      dispatch(logout())
                      navigate('/')
                    }}
                  >
                    Çıxış
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/giris">
                    <Button full variant="secondary" leftIcon={<LogIn className="h-4 w-4" />}>
                      Daxil ol
                    </Button>
                  </Link>
                  <Link to="/qeydiyyat">
                    <Button full leftIcon={<UserPlus className="h-4 w-4" />}>
                      Qeydiyyat
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="relative mt-20 border-t border-white/10 bg-ink-900/60">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-slate-400">
              CodeVia Academy — Azərbaycanda IT sahəsində praktikaya əsaslanan müasir təhsil
              platforması. Onlayn və oflayn formatda peşəkar kurslar.
            </p>
            <div className="mt-5 flex flex-col gap-2 text-sm text-slate-400">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-400" /> Bakı, Nizami küç. 203
              </span>
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-400" /> +994 12 310 40 40
              </span>
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-400" /> info@codevia.az
              </span>
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-bold uppercase tracking-wide text-white">{title}</h4>
              <ul className="mt-4 flex flex-col gap-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-slate-400 transition-colors hover:text-brand-300"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-white">Filiallar</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-slate-400">
              <li>Bakı — Nizami filialı</li>
              <li>Bakı — Yasamal filialı</li>
              <li>Sumqayıt filialı</li>
              <li>Gəncə filialı</li>
            </ul>
          </div>
        </div>
        <div className="divider" />
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} CodeVia Academy. Bütün hüquqlar qorunur.</span>
          <span>React, TypeScript, Tailwind CSS, Redux Toolkit & RTK Query ilə hazırlanıb</span>
        </div>
      </footer>
    </div>
  )
}
