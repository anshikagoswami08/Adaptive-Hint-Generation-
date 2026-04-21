import React from "react";
import { ViewMode } from "../types";
import {
  LayoutDashboard,
  Monitor,
  MessageSquare,
  FileText,
  Target,
  BarChart3,
  Bot,
  Settings,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  currentMode: ViewMode;
  setMode: (mode: ViewMode) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentMode,
  setMode,
  onLogout,
}) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "screen", label: "Screen Mode", icon: Monitor },
    { id: "chat", label: "Chatbot", icon: MessageSquare },
    { id: "pdf", label: "PDF Mode", icon: FileText },
    { id: "practice", label: "Practice Mode", icon: Target },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="p-2 bg-indigo-600 rounded-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <h1 className="font-bold text-lg text-zinc-100 tracking-tight">
          AI Assistant
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setMode(item.id as ViewMode)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-600/20"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-red-400/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
