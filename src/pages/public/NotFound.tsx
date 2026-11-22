import { Link } from 'react-router-dom'
import { ArrowRight, Home } from 'lucide-react'
import { Button } from '../../components/ui'
import { GradientBlobs, Logo } from '../../components/common'

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-5 py-20">
      <div className="absolute inset-0 grid-bg" />
      <GradientBlobs />
      <div className="relative text-center animate-fade-up">
        <div className="flex justify-center">
          <Logo />
        </div>

        <p className="mt-8 text-7xl font-extrabold leading-none gradient-text sm:text-9xl">404</p>
        <h1 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">Səhifə tapılmadı</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
          Axtardığınız səhifə mövcud deyil və ya köçürülüb. Zəhmət olmasa ana səhifəyə qayıdın və ya
          kurslarımıza nəzər salın.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/">
            <Button size="lg" leftIcon={<Home className="h-4 w-4" />}>
              Ana səhifəyə qayıt
            </Button>
          </Link>
          <Link to="/kurslar">
            <Button size="lg" variant="secondary" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Kurslara bax
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
