
import { Outlet } from "react-router-dom"

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Outlet />
    </div>
  )
}

export default Layout