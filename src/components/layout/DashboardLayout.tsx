import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  Star,
  UserCircle,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import type { Role } from '../../types'
import { useAppDispatch, useAuth } from '../../app/hooks'
import { logout, ROLE_HOME } from '../../features/auth/authSlice'
import { api, useGetNotificationsQuery, useMarkNotificationReadMutation } from '../../features/api/apiSlice'
import { cn, relativeTime, ROLE_LABEL } from '../../lib/utils'
import { Avatar, IconButton } from '../ui'
import { Logo } from '../common'
import { ThemeToggle } from '../common/ThemeToggle'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
  section?: string
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  student: [
    { to: '/panel/telebe', label: 'İdarə paneli', icon: LayoutDashboard, end: true, section: 'Əsas' },
    { to: '/panel/telebe/kurslar', label: 'Kurslarım', icon: BookOpen },
    { to: '/panel/telebe/cedvel', label: 'Dərs cədvəlim', icon: CalendarDays },
    { to: '/panel/telebe/qiymetler', label: 'Qiymətlər & Tapsırıqlar', icon: ClipboardList, section: 'Təhsil' },
    { to: '/panel/telebe/odenisler', label: 'Ödənişlərim', icon: CreditCard },
    { to: '/panel/telebe/profil', label: 'Profil', icon: UserCircle, section: 'Hesab' },
  ],
  teacher: [
    { to: '/panel/muellim', label: 'İdarə paneli', icon: LayoutDashboard, end: true, section: 'Əsas' },
    { to: '/panel/muellim/kurslar', label: 'Kurslarım', icon: BookOpen },
    { to: '/panel/muellim/dersler', label: 'Dərslər & Silabus', icon: FolderKanban, section: 'Tədris' },
    { to: '/panel/muellim/telebe', label: 'Tələbələrim', icon: Users },
    { to: '/panel/muellim/cedvel', label: 'Dərs cədvəli', icon: CalendarDays },
    { to: '/panel/muellim/gelir', label: 'Gəlir & Ödənişlər', icon: Wallet, section: 'Maliyyə' },
    { to: '/panel/muellim/profil', label: 'Profil', icon: UserCircle, section: 'Hesab' },
  ],
  admin: [
    { to: '/panel/admin', label: 'İdarə paneli', icon: LayoutDashboard, end: true, section: 'Əsas' },
    { to: '/panel/admin/analitika', label: 'Analitika', icon: BarChart3 },
    { to: '/panel/admin/istifadeciler', label: 'İstifadəçilər', icon: Users, section: 'İdarəetmə' },
    { to: '/panel/admin/muellimler', label: 'Müəllimlər', icon: Star },
    { to: '/panel/admin/muraciatlar', label: 'Müraciətlər', icon: ClipboardCheck },
    { to: '/panel/admin/kurslar', label: 'Kurslar', icon: BookOpen },
    { to: '/panel/admin/qeydiyyatlar', label: 'Qeydiyyatlar', icon: ClipboardList },
    { to: '/panel/admin/odenisler', label: 'Ödənişlər', icon: Receipt, section: 'Maliyyə & Sistem' },
    { to: '/panel/admin/parametrler', label: 'Parametrlər', icon: Settings },
  ],
}

export function DashboardLayout() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)

  const { data: notifications = [] } = useGetNotificationsQuery(user?.id ?? '', {
    skip: !user?.id,
  })
  const [markRead] = useMarkNotificationReadMutation()
  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  if (!user) return null
  const nav = NAV_BY_ROLE[user.role]
  const sections = Array.from(new Set(nav.map((n) => n.section ?? '')))

  const handleLogout = () => {
    dispatch(logout())
    dispatch(api.util.resetApiState())
    navigate('/')
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-[72px] items-center border-b border-white/10 px-5', collapsed && 'justify-center px-3')}>
        <Link to="/">
          <Logo compact={collapsed} />
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section}>
            {section && !collapsed && (
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                {section}
              </p>
            )}
            <div className="space-y-1">
              {nav
                .filter((n) => (n.section ?? '') === section)
                .map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        cn(
                          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all',
                          isActive
                            ? 'bg-brand-grad-soft text-white shadow-glow'
                            : 'text-slate-400 hover:bg-white/6 hover:text-white',
                          collapsed && 'justify-center px-2',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-grad" />
                          )}
                          <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-brand-300')} />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </>
                      )}
                    </NavLink>
                  )
                })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl bg-white/[0.04] p-3',
            collapsed && 'justify-center',
          )}
        >
          <Avatar name={user.fullName} gradient={user.avatar} src={user.photo} size={36} ring />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{user.fullName}</p>
              <p className="truncate text-xs text-slate-400">{ROLE_LABEL[user.role]}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={cn(
            'mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300',
            collapsed && 'justify-center',
          )}
        >
          <LogOut className="h-[18px] w-[18px]" />
          {!collapsed && 'Çıxış'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      {/* desktop sidebar */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 border-r border-white/10 bg-ink-900/70 backdrop-blur-xl transition-all duration-300 lg:block',
          collapsed ? 'w-[84px]' : 'w-[268px]',
        )}
      >
        {sidebar}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-[92px] grid h-6 w-6 place-items-center rounded-full border border-white/15 bg-ink-800 text-slate-300 transition-colors hover:text-white"
          aria-label="Yan paneli yığ"
        >
          <ChevronLeft className={cn('h-3.5 w-3.5 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </aside>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="glass-strong absolute left-0 top-0 h-full w-[280px] animate-slide-in-right">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between gap-4 border-b border-white/10 bg-ink-950/80 px-5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Menyu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-bold text-white">{ROLE_LABEL[user.role]} paneli</p>
              <p className="text-xs text-slate-400">CodeVia Academy LMS</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="relative">
              <IconButton onClick={() => setBellOpen((v) => !v)} className="relative">
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </IconButton>
              {bellOpen && (
                <div className="glass-strong absolute right-0 top-12 w-[320px] animate-scale-in rounded-2xl p-2 shadow-2xl">
                  <div className="flex items-center justify-between px-3 py-2">
                    <p className="text-sm font-bold text-white">Bildirişlər</p>
                    <button onClick={() => setBellOpen(false)} className="text-slate-400 hover:text-white">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {notifications.length === 0 && (
                      <p className="px-3 py-6 text-center text-xs text-slate-500">
                        Bildiriş yoxdur
                      </p>
                    )}
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className="flex w-full gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/6"
                      >
                        <span
                          className={cn(
                            'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                            n.read ? 'bg-slate-600' : 'bg-brand-400',
                          )}
                        />
                        <span className="min-w-0">
                          <span className="block text-xs font-bold text-white">{n.title}</span>
                          <span className="block truncate text-xs text-slate-400">{n.body}</span>
                          <span className="mt-0.5 block text-[10px] text-slate-500">
                            {relativeTime(n.date)}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to={ROLE_HOME[user.role]} className="hidden sm:block">
              <Avatar name={user.fullName} gradient={user.avatar} src={user.photo} size={36} ring />
            </Link>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-5 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
