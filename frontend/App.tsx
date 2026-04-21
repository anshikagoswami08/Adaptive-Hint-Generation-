import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ScreenParser from "./components/ScreenParser";
import Chatbot from "./components/Chatbot";
import PDFUploader from "./components/PDFUploader";
import PracticeGenerator from "./components/PracticeGenerator";
import Settings from "./components/Settings";
import Auth from "./components/Auth";
import { ViewMode } from "./types";
import { User, Search, Command } from "lucide-react";
import { UserProfile } from "./types";
import { api } from "@/services/api";

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentMode, setCurrentMode] = useState<ViewMode>("dashboard");
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    joinedDate: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getProfile();
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentMode("dashboard");
  };

  const renderContent = () => {
    switch (currentMode) {
      case "dashboard":
      case "progress":
        return <Dashboard />;
      case "screen":
        return <ScreenParser />;
      case "chat":
        return <Chatbot />;
      case "pdf":
        return <PDFUploader />;
      case "practice":
        return <PracticeGenerator />;
      case "settings":
        return <Settings onLogout={handleLogout} />;
      default:
        return <Dashboard />;
    }
  };

  // If not logged in, show the Auth (Login/Register) screen
  if (!isLoggedIn) {
    return <Auth onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <Sidebar
        currentMode={currentMode}
        setMode={setCurrentMode}
        onLogout={handleLogout}
      />

      <main className="ml-64 p-8 pt-6 min-h-screen relative">
        {/* Universal Top Nav */}
        <header className="flex items-center justify-end mb-8 pb-6 border-b border-zinc-900">
          <div className="flex items-center">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setCurrentMode("settings")}
            >
              <div className="text-right">
                <p className="text-sm font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">
                  {profile.name}
                </p>
                <p className="text-[10px] text-zinc-500 font-bold tracking-widest">
                  {profile.email}
                </p>
              </div>
              <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700 group-hover:border-indigo-600/50 transition-all">
                <User className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400" />
              </div>
            </div>
          </div>
        </header>

        <div className="pb-12">{renderContent()}</div>
      </main>

      {/* Background Decorative elements */}
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
    </div>
  );
};

export default App;
