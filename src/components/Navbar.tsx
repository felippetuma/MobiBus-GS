"use client"
import { Menu } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

const Navbar = () => {
  const isHome = usePathname() === "/"

  return (
    <nav className={`absolute inset-x-0 top-0 z-10 flex text-center pt-6 justify-center items-center transition-colors duration-300 ${isHome ? "text-white" : "text-black"}`}>
      <Link href='/' className="absolute md:left-20 hover:-translate-y-1"><Image src="/icons/mobibus-branco.svg" alt="Logo Branca do MobiBus" width={126} height={32} className={isHome ? "" : "brightness-0"} /></Link>
      <div className="hidden md:flex items-center justify-center md:gap-3">
        <Link href="/">Inicio</Link>
      </div>
        <Link href="/login" className={`absolute hidden md:flex items-center justify-center right-16 w-22 h-10 rounded-full text-center font-semibold shadow-sm ${isHome ? "bg-zinc-300/20 hover:shadow-white" : "bg-black/10 hover:shadow-black/30"} hover:-translate-y-1 duration-300`}>Login</Link>
        <button className="absolute md:hidden flex items-center justify-center right-6 cursor-pointer">
          <Menu size={22}/>
        </button>
    </nav>
  )
}

export default Navbar
