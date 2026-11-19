import { Suspense } from "react"
import BusForm from "@/components/BusForm"

const Edit = async ({ params }: { params: Promise<{ rota: string }> }) => {
  const { rota } = await params
  return <BusForm editing={decodeURIComponent(rota)} />
}

const EditarOnibusPage = ({ params }: { params: Promise<{ rota: string }> }) => {
  return (
    <Suspense fallback={null}>
      <Edit params={params} />
    </Suspense>
  )
}

export default EditarOnibusPage
