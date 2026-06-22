import { Outlet } from "react-router-dom";
import Sidebar from "../../Sidebar/Sidebar";

export const DashboardLayout = () => {
    return (
        <div className="flex gap-2">
            <Sidebar></Sidebar>
            <Outlet />
        </div>
    );
};
