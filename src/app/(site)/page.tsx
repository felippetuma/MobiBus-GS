import Header from "@/components/Header"
import Secao2 from "@/components/Secao2"

const page = () => {
  return (
    <main className="relative">
      <div className="sticky top-0 z-0">
        <Header />
      </div>

      <Secao2 />
    </main>
  )
}

export default page
