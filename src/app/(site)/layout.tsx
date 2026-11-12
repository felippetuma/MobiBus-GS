import Navbar from "@/components/Navbar"

const layoutSite = ({children}: {children: React.ReactNode}) => {
  return (
    <>
      <Navbar/>
      {children}  
    </>
  )
}

export default layoutSite
