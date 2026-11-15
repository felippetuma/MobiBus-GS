"use client"
import { useState } from "react"

type AbaId = "temperatura" | "pneus" | "emergencia" | "frota"

interface NavCarta {
  id: AbaId
  codigo: string
  titulo: string
  subtitulo: string
  corAtiva: string
  corTexto: string
  corBadge: string
  rotacaoBase: string
  icone: React.ReactNode
}

const Secao2 = () => {
  const [abaAtiva, setAbaAtiva] = useState<AbaId>("temperatura")

  const navCartas: NavCarta[] = [
    {
      id: "temperatura",
      codigo: "01",
      titulo: "Temperatura",
      subtitulo: "Sensor DHT11",
      corAtiva: "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sky-500/35",
      corTexto: "text-sky-600",
      corBadge: "bg-sky-100 text-sky-700",
      rotacaoBase: "-rotate-2",
      icone: (
        <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
          <path d="M12 10v5" />
          <circle cx="12" cy="17" r="1.5" fill="currentColor" />
          <path d="M17 6h2M17 10h3M17 14h2" />
        </svg>
      ),
    },
    {
      id: "pneus",
      codigo: "02",
      titulo: "Pressão Pneus",
      subtitulo: "Calibragem PSI",
      corAtiva: "bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-purple-600/35",
      corTexto: "text-purple-600",
      corBadge: "bg-purple-100 text-purple-700",
      rotacaoBase: "rotate-1",
      icone: (
        <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
        </svg>
      ),
    },
    {
      id: "emergencia",
      codigo: "03",
      titulo: "Emergência",
      subtitulo: "Alerta Crítico",
      corAtiva: "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-600/35",
      corTexto: "text-rose-600",
      corBadge: "bg-rose-100 text-rose-700",
      rotacaoBase: "-rotate-1",
      icone: (
        <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 18v-6a5 5 0 1 1 10 0v6" />
          <path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v1Z" />
          <path d="M21 12h1M18.5 4.5 18 5M2 12h1M12 2v1M4.9 4.9l.7.7M12 11v3" />
        </svg>
      ),
    },
    {
      id: "frota",
      codigo: "04",
      titulo: "Frota Ativa",
      subtitulo: "Painel Central",
      corAtiva: "bg-gradient-to-br from-zinc-800 to-zinc-950 text-white shadow-zinc-900/30",
      corTexto: "text-zinc-800",
      corBadge: "bg-zinc-200 text-zinc-800",
      rotacaoBase: "rotate-2",
      icone: (
        <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 6v6M15 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
          <circle cx="7" cy="18" r="2" />
          <path d="M9 18h5" />
          <circle cx="16" cy="18" r="2" />
        </svg>
      ),
    },
  ]

  return (
    <section className="relative z-20 min-h-screen w-full bg-white text-zinc-900 rounded-t-3xl shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-16">
        
       
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-10 pb-12 border-b border-zinc-200">
          <div className="max-w-md">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
              Monitoramento IoT & Central
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mt-1">
              Operação MobiBus
            </h2>
            <p className="text-zinc-500 mt-2 text-sm sm:text-base">
              Escolha uma carta ao lado para inspecionar os módulos de telemetria e despacho da frota.
            </p>
          </div>

          
          <nav aria-label="Navegação de módulos" className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {navCartas.map((carta) => {
              const ativo = abaAtiva === carta.id
              return (
                <button
                  key={carta.id}
                  onClick={() => setAbaAtiva(carta.id)}
                  className={`group relative flex flex-col justify-between w-full sm:w-40 h-52 p-4 rounded-2xl border-2 transition-all duration-300 text-left cursor-pointer select-none ${
                    ativo
                      ? `${carta.corAtiva} border-transparent shadow-xl -translate-y-3 rotate-0 scale-105 z-10`
                      : `bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300 text-zinc-800 shadow-md hover:-translate-y-2 hover:rotate-0 ${carta.rotacaoBase}`
                  }`}
                >
                
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded-md tracking-wider ${
                        ativo ? "bg-white/20 text-white" : carta.corBadge
                      }`}
                    >
                      #{carta.codigo}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        ativo ? "bg-white animate-pulse" : "bg-zinc-300"
                      }`}
                    />
                  </div>

                 
                  <div
                    className={`my-auto mx-auto w-16 h-16 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 ${
                      ativo
                        ? "bg-white/15 border-white/25 text-white"
                        : `bg-zinc-50 border-zinc-200/80 ${carta.corTexto}`
                    }`}
                  >
                    {carta.icone}
                  </div>

                  <div className="w-full pt-2 border-t border-current/10">
                    <span className="block font-bold text-sm leading-tight">
                      {carta.titulo}
                    </span>
                    <span
                      className={`block text-[11px] mt-0.5 ${
                        ativo ? "text-white/80" : "text-zinc-400"
                      }`}
                    >
                      {carta.subtitulo}
                    </span>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        
        <div className="mt-12">
          {abaAtiva === "temperatura" && (
            <div className="p-8 rounded-3xl bg-sky-50/70 border border-sky-100">
              <h3 className="text-2xl font-bold text-sky-950">
                Monitoramento de Temperatura Interna (RF04 / RN05)
              </h3>
              <p className="text-zinc-600 mt-2 max-w-2xl">
                O sensor DHT22 embarcado no ESP32 mede continuamente a temperatura do veículo. Leituras acima de 32 °C disparam estado de Atenção na central para prevenir superaquecimento ou falha no ar-condicionado.
              </p>
            </div>
          )}

          {abaAtiva === "pneus" && (
            <div className="p-8 rounded-3xl bg-purple-50/70 border border-purple-100">
              <h3 className="text-2xl font-bold text-purple-950">
                Pressão dos Pneus em Tempo Real (RF05 / RF07)
              </h3>
              <p className="text-zinc-600 mt-2 max-w-2xl">
                Detecta variações fora da faixa segura antes que ocorra uma pane mecânica ou acidente, gerando alertas preventivos automáticos com suavização por média móvel.
              </p>
            </div>
          )}

          {abaAtiva === "emergencia" && (
            <div className="p-8 rounded-3xl bg-rose-50/70 border border-rose-100">
              <h3 className="text-2xl font-bold text-rose-950">
                Acionamento de Emergência pelo Motorista (RF06)
              </h3>
              <p className="text-zinc-600 mt-2 max-w-2xl">
                Ao pressionar o botão físico no painel do ônibus, o dispositivo entra em estado de Falha (LED vermelho e buzzer contínuo) e exibe o alerta crítico na central em até 5 segundos para envio imediato de ônibus reserva e mecânico.
              </p>
            </div>
          )}

          {abaAtiva === "frota" && (
            <div className="p-8 rounded-3xl bg-zinc-100 border border-zinc-200">
              <h3 className="text-2xl font-bold text-zinc-900">
                Gestão e Despacho da Frota (RF01 a RF10)
              </h3>
              <p className="text-zinc-600 mt-2 max-w-2xl">
                A central acompanha cada veículo por ID, placa e linha, gerenciando o ciclo completo dos chamados: Aberto, Equipe a caminho e Resolvido, registrando o tempo médio de resposta.
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  )
}

export default Secao2
