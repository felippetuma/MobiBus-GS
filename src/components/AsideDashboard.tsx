"use client"

import { CirclePlus, Home, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/dashboard/onibus/novo", label: "Cadastrar ônibus", icon: CirclePlus },
  { href: "/dashboard/config", label: "Configurações", icon: Settings },
];

const AsideDashboard = () => {
  const pathname = usePathname();
  const router = useRouter();

  const exit = () => {
    localStorage.removeItem("logged");
    router.push("/login");
  }

  return (
    <aside className="fixed inset-x-4 bottom-4 z-40 flex h-14 flex-row items-center justify-between rounded-full border border-zinc-300 bg-zinc-100 px-6 shadow-md md:sticky md:inset-x-auto md:bottom-auto md:top-4 md:m-4 md:h-[calc(100dvh-2rem)] md:w-14 md:flex-col md:self-start md:px-0 md:py-4">
        <Image src="/icons/mobibus-icone-branco.svg" alt="Logo Branca do MobiBus" width={28} height={28} className="hidden brightness-0 size-7 object-contain md:block" />
        <div className="flex flex-1 items-center justify-center gap-4 md:flex-col">
            {links.map(({ href, label, icon: Icon }) => {
                const active = href === "/dashboard"
                    ? pathname === href || (pathname.startsWith("/dashboard/onibus/") && !pathname.startsWith("/dashboard/onibus/novo"))
                    : pathname.startsWith(href);
                return (
                    <Link key={href} href={href} aria-label={label} aria-current={active ? "page" : undefined}
                        className={`flex size-9 items-center justify-center rounded-full transition-colors ${active ? "bg-blue-mobi text-white" : "hover:bg-zinc-200"}`}>
                        <Icon size={18}/>
                    </Link>
                )
            })}
        </div>
        <button type="button" onClick={exit} aria-label="Sair" className="cursor-pointer text-red-500 hover:text-red-700 md:pb-5"><LogOut size={18}/></button>
    </aside>
  )
}

export default AsideDashboard
