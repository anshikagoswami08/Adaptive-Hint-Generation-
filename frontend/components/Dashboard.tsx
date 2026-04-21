import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { UserStats } from "../types";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, Target, Brain, Award } from "lucide-react";

interface TokenPayload {
  sub: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  let userId: number | null = null;

  if (token) {
    const decoded = jwtDecode<TokenPayload>(token);
    userId = parseInt(decoded.sub);
  }

  // useEffect(() => {
  //   const fetchStats = async () => {
  //     const data = await api.getUserStats();
  //     setStats(data);
  //     setLoading(false);
  //   };
  //   fetchStats();
  // }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!userId) return;

      try {
        const data = await api.getDashboard(userId);
        console.log(data);
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 animate-pulse">
        Loading analytics...
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Attempted",
      value: stats.totalProblems,
      icon: Brain,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Avg. Hints/Problem",
      value: stats.avgHints,
      icon: Target,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      label: "Accuracy Rate",
      value: `${stats.accuracy}%`,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Current Level",
      value: stats.difficultyLevel,
      icon: Award,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-white mb-2">
          Learning Progress
        </h2>
        <p className="text-zinc-400">
          Track your adaptive learning milestones and activity.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <h3 className="text-zinc-400 text-sm font-medium mb-1">
                {stat.label}
              </h3>
              <p className="text-2xl font-bold text-white tracking-tight">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6">
            Problems Solved (Weekly)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.progressData}>
                <defs>
                  <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#71717a"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis stroke="#71717a" axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ color: "#818cf8" }}
                />
                <Area
                  type="monotone"
                  dataKey="solved"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSolved)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6">Recent Mastery</h3>
          <div className="space-y-6">
            {stats.mastery?.map((item: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400 font-medium">
                    {item.topic}
                  </span>
                  <span className="text-indigo-400 font-bold">
                    {item.score}%
                  </span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
