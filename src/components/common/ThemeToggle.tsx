import { Moon, Sun } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { toggleTheme } from '../../features/ui/uiSlice'
import { cn } from '../../lib/utils'

/** Gündüz / gecə rejimi düyməsi */
export function ThemeToggle({ className }: { className?: string }) {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((s) => s.ui.theme)
  const isLight = theme === 'light'

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      aria-label={isLight ? 'Gecə rejiminə keç' : 'Gündüz rejiminə keç'}
      title={isLight ? 'Gecə rejimi' : 'Gündüz rejimi'}
      className={cn(
        'relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white',
        className,
      )}
    >
      <Sun
        className={cn(
          'absolute h-[18px] w-[18px] transition-all duration-300',
          isLight ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100',
        )}
      />
      <Moon
        className={cn(
          'absolute h-[18px] w-[18px] transition-all duration-300',
          isLight ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0',
        )}
      />
    </button>
  )
}
