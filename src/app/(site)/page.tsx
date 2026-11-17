import Header from "@/components/Header"
import Secao2 from "@/components/Secao2"
import Integrantes from "@/components/Integrantes"

const page = () => {
  return (
    <main className="relative">
      <div className="sticky top-0 z-0">
        <Header />
      </div>

      <Secao2 />
      <Integrantes />
    </main>
  )
}

export default page
