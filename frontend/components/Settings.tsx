import React, { useState, useEffect } from "react";
import { User, Mail, Shield, Save, LogOut, Camera } from "lucide-react";
import { UserProfile } from "../types";
import { api } from "@/services/api";

interface SettingsProps {
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
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

  const handleSave = async () => {
    try {
      await api.updateProfile({
        name: profile.name,
        email: profile.email,
      });

      alert("Settings saved successfully!");
    } catch (error) {
      alert("Failed to update profile");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-white mb-2">My Profile</h2>
        <p className="text-zinc-400">
          Manage your account settings and learning preferences.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
            <div className="relative inline-block group">
              <div className="w-32 h-32 bg-zinc-800 rounded-full flex items-center justify-center border-4 border-zinc-950 mb-4 mx-auto overflow-hidden">
                <User className="w-16 h-16 text-zinc-600" />
              </div>
              {/* <button className="absolute bottom-4 right-0 p-2 bg-indigo-600 rounded-full text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4" />
              </button> */}
            </div>
            <h3 className="text-xl font-bold text-white mb-6">
              {profile.name}
            </h3>
            <div className="flex flex-col gap-2">
              {/* <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-semibold transition-colors">
                Change Avatar
              </button> */}
              <button
                onClick={onLogout}
                className="w-full py-2 text-red-400 hover:bg-red-400/10 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h4 className="text-lg font-bold text-zinc-200 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" /> Account Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-600/50 transition-all text-zinc-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-600/50 transition-all text-zinc-200"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
              <p className="text-xs text-zinc-500">
                Joined on {profile.joinedDate}
              </p>
              <button
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
