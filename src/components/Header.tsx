"use client"
import Image from "next/image"
import { useRef } from "react"
import { gsap, useGSAP } from "@/lib/gsap"

const Header = () => {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.extScroll', {autoAlpha: 0, duration: 0.8, ease:"power1.out"});
    gsap.to('.intScroll', {y: 10, duration: 1.2, delay: 0.3, ease:"power1.inOut", yoyo: true, repeat: -1});
  }, { scope: root });

  return (
    <div ref={root} className="relative w-full h-dvh select-none outline-none">
        <Image
          src="/images/capa.png"
          alt="Capa"
          fill
          priority
          sizes="100vw"
          draggable={false}
          className="object-cover object-center pointer-events-none"
        />
        <a href="#projeto" className="absolute flex gap-2 items-center text-sm uppercase bottom-6 left-1/2 -translate-x-1/2 text-white/60">
          <div className="flex h-7 w-4 justify-center rounded-full border-2 border-white/50 pt-1 extScroll">
            <span className="block size-1.5 rounded-full bg-white intScroll"/>
          </div>
          Scroll
        </a>

    </div>
  )
}

export default Header
