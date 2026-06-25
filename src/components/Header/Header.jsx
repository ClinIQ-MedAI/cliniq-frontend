import React from "react";
import "./Header.css";
import { Menu } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { MoonIcon } from "lucide-react";
import { Sun } from "lucide-react";
import { Bell } from "lucide-react";
export default function Header({ setIsSidebarOpen }) {
    const { theme, toggle } = useTheme();
    return (
        <header className="app-header bg-card px-3 sticky flex items-center">
            <div
                className="header-left p-3 cursor-pointer hover:scale-105 focus:scale-90 md:hidden"
                onClick={() => setIsSidebarOpen(true)}
            >
                <Menu />
            </div>

            <div className="hidden md:block"></div>
            <div className="header-right">
                <div className="search">
                    <input
                        placeholder="Search"
                        aria-label="Search"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-page
           text-t1 placeholder:text-t3 focus:outline-none focus:border-[#185FA5] search-input"
                    />
                </div>

                <button className="icon-btn" aria-label="Notifications">
                    <Bell />
                </button>
                <button
                    className="icon-btn"
                    aria-label="Theme toggle"
                    onClick={() => toggle()}
                >
                    {theme === "light" ? <Sun /> : <MoonIcon className="" />}
                </button>
                <div className="avatar">
                    <div className="avatar-circle">DR</div>
                </div>
            </div>
        </header>
    );
}
