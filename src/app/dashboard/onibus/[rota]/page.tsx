import { Suspense } from "react"
import BusPanel from "@/components/BusPanel"

const Detail = async ({ params }: { params: Promise<{ rota: string }> }) => {
  const { rota } = await params
  return (
    <BusPanel route={decodeURIComponent(rota)} />
  )
}

const OnibusPage = ({ params }: { params: Promise<{ rota: string }> }) => {
  return (
    <Suspense fallback={null}>
      <Detail params={params} />
    </Suspense>
  )
}

export default OnibusPage
