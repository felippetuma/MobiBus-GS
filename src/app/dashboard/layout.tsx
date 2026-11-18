import AsideDashboard from "@/components/AsideDashboard";
import AuthVerify from "@/components/AuthVerify";

const layoutDashboard = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthVerify>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1">
          <AsideDashboard />
          <main className="min-w-0 flex-1 pb-24 md:pb-0">{children}</main>
        </div>
      </div>
    </AuthVerify>
  )
}

export default layoutDashboard
