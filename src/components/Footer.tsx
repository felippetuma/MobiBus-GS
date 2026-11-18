"use client"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

const Footer = () => {
  const isHome = usePathname() === "/"
  const router = useRouter()

  const irParaInicio = () => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" })
      document.documentElement.scrollTo({ top: 0, behavior: "smooth" })
      document.body.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      router.push("/")
    }
  }

  const irParaIntegrantes = () => {
    if (isHome) {
      const secao = document.getElementById("integrantes")
      if (secao) {
        secao.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    } else {
      router.push("/#integrantes")
    }
  }

  return (
    <footer className="relative z-20 w-full bg-zinc-950 text-zinc-400 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-zinc-800/80">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <button
              type="button"
              onClick={irParaInicio}
              className="hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Image
                src="/icons/mobibus-branco.svg"
                alt="Logo MobiBus"
                width={130}
                height={34}
              />
            </button>
            <p className="text-sm text-zinc-500 mt-3 max-w-sm">
              Monitoramento inteligente de ônibus públicos em tempo real com telemetria IoT e gestão de frota.
            </p>
          </div>

          <nav aria-label="Links do rodapé" className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-zinc-300">
            <button
              type="button"
              onClick={irParaInicio}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Início
            </button>
            <button
              type="button"
              onClick={irParaIntegrantes}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Integrantes
            </button>
            <Link href="/login" className="hover:text-white transition-colors">
              Painel da Central
            </Link>
            <a
              href="https://github.com/felippetuma/MobiBus-GS"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
          </nav>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>
            © 2026 MobiBus • CitizenTech • FIAP Engenharia de Software
          </p>
          <p>
            ODS 9 • ODS 11 • ODS 13
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
