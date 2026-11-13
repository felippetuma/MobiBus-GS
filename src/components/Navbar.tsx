"use client"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const Navbar = () => {
  const isHome = usePathname() === "/"
  const [open, setOpen] = useState(false);
  const light = isHome || open // texto/logo claros: home ou menu aberto (fundo preto)


  return (
    <nav className={`absolute inset-x-0 top-0 z-10 flex text-center pt-6 justify-center items-center transition-colors duration-300 ${light ? "text-white" : "text-black"}`}>
      <Link href='/' onClick={() => setOpen(false)} className="absolute z-50 md:left-20 hover:-translate-y-1"><Image src="/icons/mobibus-branco.svg" alt="Logo Branca do MobiBus" width={126} height={32} className={light ? "" : "brightness-0"} /></Link>
      <div className="hidden md:flex items-center justify-center md:gap-3">
        <Link href="/">Inicio</Link>
      </div>
      <Link href="/login" className={`absolute hidden md:flex items-center justify-center right-16 w-22 h-10 rounded-full text-center font-semibold shadow-sm ${isHome ? "bg-zinc-300/20 hover:shadow-white" : "bg-black/10 hover:shadow-black/30"} hover:-translate-y-1 duration-300`}>Login</Link>
      <button onClick={() => setOpen(!open)} aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} className="absolute z-50 md:hidden flex items-center justify-center right-6 cursor-pointer">
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden flex flex-col items-center justify-center gap-6 bg-zinc-950/95 text-white text-xl font-medium">
          <Link href="/" onClick={() => setOpen(false)}>Inicio</Link>
          <Link href="/login" onClick={() => setOpen(false)} className="relative top-40 bg-zinc-800/80 px-20 py-4 rounded-full">Login</Link>
        </div>
      )}
    </nav>
  )
}

export default Navbar
