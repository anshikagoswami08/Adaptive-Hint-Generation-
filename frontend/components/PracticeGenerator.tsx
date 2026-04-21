import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { PracticeProblem } from "../types";
import { Target, RefreshCw, Zap, Trophy, Bookmark } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import ReactMarkdown from "react-markdown";
import HintPanel from "./HintPanel";

interface TokenPayload {
  sub: string;
}

type TopicMastery = {
  topic: string;
  score: number;
};

const PracticeGenerator: React.FC = () => {
  const [problem, setProblem] = useState<PracticeProblem | null>(null);
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<TopicMastery[]>([]);
  const [showHints, setShowHints] = useState(false);

  const token = localStorage.getItem("token");
  let userId: number | null = null;

  if (token) {
    const decoded = jwtDecode<TokenPayload>(token);
    userId = parseInt(decoded.sub);
  }

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const stats = await api.getDashboard(userId);

        console.log(stats);

        // Sort by weakest first (recommended)
        const sortedMastery = [...stats.mastery].sort(
          (a, b) => a.score - b.score,
        );

        setTopics(sortedMastery);
        console.log(topics);
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      }
    };

    fetchDashboard();
  }, []);

  const generateNew = async (selectedTopic?: string) => {
    try {
      setLoading(true);

      // ✅ If no topic passed → pick weakest topic
      let topicToUse = selectedTopic;

      if (!topicToUse && topics.length > 0) {
        const weakest = topics.reduce((min, curr) =>
          curr.score < min.score ? curr : min,
        );
        topicToUse = weakest.topic;
      }

      const data = await api.generatePractice(topicToUse);

      const mappedProblem: PracticeProblem = {
        id: String(data.problem_id),
        title: data.title,
        content: data.description,
        difficulty:
          data.mastery_score < 30
            ? "Easy"
            : data.mastery_score < 70
              ? "Medium"
              : "Hard",
      };

      setProblem(mappedProblem);
    } catch (error) {
      console.error("Error generating practice:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Practice Lab</h2>
          <p className="text-zinc-400">
            Master concepts through AI-generated problems tailored to your skill
            level.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {problem ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8">
                <Bookmark className="w-6 h-6 text-zinc-700 hover:text-indigo-400 cursor-pointer transition-colors" />
              </div>
              <div className="flex items-center gap-2 mb-6">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    problem.difficulty === "Hard"
                      ? "bg-red-500/10 text-red-400"
                      : problem.difficulty === "Medium"
                        ? "bg-orange-500/10 text-orange-400"
                        : "bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {problem.difficulty}
                </span>
                <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                  ID: {problem.id}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">
                {problem.title}
              </h3>
              <div className="bg-zinc-950/50 p-8 rounded-2xl border border-zinc-800/50 mb-8">
                {/* <p className="text-xl text-zinc-200 font-medium leading-relaxed font-mono">
                  {problem.content}
                </p> */}

                <div className="text-xl text-zinc-200 font-medium leading-relaxed font-mono">
                  <ReactMarkdown>{problem.content}</ReactMarkdown>
                </div>
              </div>

              <div className="flex-col justify-center items-center gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowHints((prev) => !prev)}
                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all"
                  >
                    {showHints ? "Hide Hints" : "Show Hints"}
                  </button>

                  <button
                    onClick={() => {
                      setShowHints(false); // reset hints when new problem
                      generateNew();
                    }}
                    disabled={loading}
                    className="px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl font-bold flex items-center gap-2 transition-all"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {showHints && (
                  <div className="animate-in slide-in-from-top-6 fade-in duration-700 mt-6">
                    <div className="bg-zinc-950/50 border border-zinc-800 border-dashed rounded-3xl p-2">
                      <HintPanel problemId={problem.id} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center">
                <Target className="w-10 h-10 text-zinc-600" />
              </div>
              <div className="max-w-xs">
                <h3 className="text-xl font-bold text-zinc-200">
                  Start Practice Session
                </h3>
                <p className="text-zinc-500 text-sm mt-2">
                  We'll generate a custom problem based on your current
                  progress.
                </p>
              </div>
              <button
                onClick={() => generateNew()}
                disabled={loading}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Zap className="w-5 h-5" />
                )}
                Generate Initial Problem
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">
              Focus Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {topics.map((item) => (
                <span
                  key={item.topic}
                  onClick={() => generateNew(item.topic)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all
        ${
          item.score < 40
            ? "bg-red-500/10 text-red-400"
            : item.score < 70
              ? "bg-orange-500/10 text-orange-400"
              : "bg-emerald-500/10 text-emerald-400"
        }
        hover:bg-indigo-600 hover:text-white
      `}
                >
                  {item.topic} ({item.score}%)
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeGenerator;
