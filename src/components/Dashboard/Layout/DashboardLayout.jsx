import { Outlet } from "react-router-dom"
import Sidebar from "../../Sidebar/Sidebar"
import Header from "../../Header/Header"

export const DashboardLayout = ()=>{
    return  <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
        <main className="app-main">
            <Header />
            <Outlet/>
        </main>
    </div>
}