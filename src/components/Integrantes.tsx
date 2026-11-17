import Image from "next/image"

interface Integrante {
  nome: string
  cargo: string
  disciplinas: string
  foto: string
  corDestaque: string
  linkedin: string
}

const Integrantes = () => {
  const equipe: Integrante[] = [
    {
      nome: "Davi Toyota",
      cargo: "Front-end & Interface",
      disciplinas: "Front-end Design & Web Development",
      foto: "/integrantes/davitoyota.png",
      corDestaque: "from-sky-500 to-blue-600",
      linkedin: "https://www.linkedin.com/in/davitoyota/",
    },
    {
      nome: "Felippe Tuma",
      cargo: "Web & Edge Computing",
      disciplinas: "Web Development & IoT (ESP32)",
      foto: "/integrantes/felippetuma.png",
      corDestaque: "from-purple-600 to-indigo-700",
      linkedin: "https://www.linkedin.com/in/felippetuma/",
    },
    {
      nome: "Felipe Motta",
      cargo: "Storytelling & Pitch",
      disciplinas: "Storytelling & Inspiração Empreendedora",
      foto: "/integrantes/felipemotta.png",
      corDestaque: "from-amber-500 to-orange-600",
      linkedin: "https://www.linkedin.com/in/felipe-motta-8967933b4/",
    },
    {
      nome: "Renan Martins",
      cargo: "Python & Modelagem",
      disciplinas: "Computational Thinking & Differentiated Problem Solving",
      foto: "/integrantes/renanmartins.png",
      corDestaque: "from-emerald-500 to-teal-600",
      linkedin: "https://www.linkedin.com/in/renansilvaa/",
    },
    {
      nome: "Yan da Silva",
      cargo: "Software, UX & Edge",
      disciplinas: "Software & Total Experience Design • IoT",
      foto: "/integrantes/yandasilva.png",
      corDestaque: "from-rose-500 to-red-600",
      linkedin: "https://www.linkedin.com/in/yan-silva-609803371/",
    },
  ]

  return (
    <section
      id="integrantes"
      className="relative z-20 w-full bg-zinc-50 text-zinc-900 py-24 border-t border-zinc-200"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
            CitizenTech • FIAP Global Solution
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mt-2">
            Equipe MobiBus
          </h2>
          <p className="text-zinc-500 mt-3 text-sm sm:text-base">
            Conheça os integrantes responsáveis pelo desenvolvimento da plataforma de monitoramento e telemetria de ônibus públicos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {equipe.map((membro) => (
            <div
              key={membro.nome}
              className="group bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col"
            >
              <div className={`h-2 w-full bg-gradient-to-r ${membro.corDestaque}`} />

              <div className="pt-6 px-6 flex justify-center">
                <div className="relative w-36 h-36 rounded-full overflow-hidden ring-4 ring-zinc-100 shadow-md bg-zinc-100">
                  <Image
                    src={membro.foto}
                    alt={`Foto de ${membro.nome}`}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between text-center">
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 leading-tight">
                    {membro.nome}
                  </h3>
                  <p className="text-xs font-semibold text-sky-600 mt-1">
                    {membro.cargo}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex flex-col items-center gap-3">
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {membro.disciplinas}
                  </p>

                  <a
                    href={membro.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`LinkedIn de ${membro.nome}`}
                    className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-zinc-100 hover:bg-[#0A66C2] text-zinc-700 hover:text-white text-xs font-semibold transition-colors duration-300"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Integrantes
