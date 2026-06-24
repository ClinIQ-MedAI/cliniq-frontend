import React from "react";
import "./Header.css";
import { Menu } from "lucide-react";

export default function Header({ setIsSidebarOpen }) {
    return (
        <header className="app-header bg-white px-2 sticky flex items-center">
            <div
                className="header-left p-3 cursor-pointer hover:scale-105 focus:scale-90 md:hidden"
                onClick={() => setIsSidebarOpen(true)}
            >
                <Menu />
            </div>

            <div className="hidden md:block"></div>
            <div className="header-right">
                <div className="search">
                    <input placeholder="Search" aria-label="Search" />
                </div>

                <button className="icon-btn" aria-label="Notifications">
                    🔔
                </button>
                <button className="icon-btn" aria-label="Theme toggle">
                    🌙
                </button>
                <div className="avatar">
                    <div className="avatar-circle">DR</div>
                </div>
            </div>
        </header>
    );
}
