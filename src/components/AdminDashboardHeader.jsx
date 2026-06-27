import { Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { Sun } from "lucide-react";

export const AdminDashboardHeader = () => {
    const { theme, toggle } = useTheme();
    return (
        <header className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-t1">Dashboard Overview</h2>
            <div className="flex items-center gap-4">
                {/* Theme Toggle Button */}
                <button
                    onClick={() => toggle()}
                    className="p-2 text-t2 hover:text-primary hover:bg-subtle rounded-full transition-colors"
                >
                    {theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
                </button>

                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    SA
                </div>
            </div>
        </header>
    );
};
