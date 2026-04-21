import React, { useState } from "react";
import { api } from "../services/api";
import {
  ChevronRight,
  BrainCircuit,
  History,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface HintPanelProps {
  problemId: string;
}

const HintPanel: React.FC<HintPanelProps> = ({ problemId }) => {
  const [level, setLevel] = useState(0);
  const [hints, setHints] = useState<{ level: number; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const getNextHint = async () => {
    if (level >= 3) return;
    setLoading(true);
    const nextLevel = level + 1;
    console.log(problemId);
    console.log(nextLevel);
    const response = await api.generatePDFHint(problemId, nextLevel);
    setHints((prev) => [
      ...prev,
      { level: response.level, text: response.hint },
    ]);
    console.log(hints);
    setLevel(nextLevel);
    setLoading(false);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col h-full shadow-2xl">
      <div className="bg-indigo-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <BrainCircuit className="w-5 h-5" />
          <span className="font-bold tracking-tight">Adaptive Hints</span>
        </div>
        <div className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-tighter">
          Level {level}/3
        </div>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        {hints.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Sparkles className="w-10 h-10 text-indigo-400 mx-auto opacity-50" />
            <p className="text-zinc-500 text-sm">
              Struggling? Let the AI break down the steps for you.
            </p>
          </div>
        ) : (
          hints.map((hint, i) => (
            <div
              key={i}
              className="animate-in slide-in-from-right-4 duration-300"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                  Level {hint.level}
                </span>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-2xl text-sm text-zinc-200 leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ ...props }) => (
                      <h1
                        className="text-lg font-bold text-white mt-4 mb-2"
                        {...props}
                      />
                    ),
                    h2: ({ ...props }) => (
                      <h2
                        className="text-md font-semibold text-indigo-400 mt-4 mb-2"
                        {...props}
                      />
                    ),
                    h3: ({ ...props }) => (
                      <h3
                        className="text-sm font-semibold text-indigo-300 mt-3 mb-1"
                        {...props}
                      />
                    ),
                    strong: ({ ...props }) => (
                      <strong className="font-semibold text-white" {...props} />
                    ),
                    hr: () => <hr className="border-zinc-700 my-4" />,
                    table: ({ ...props }) => (
                      <div className="overflow-x-auto my-3">
                        <table
                          className="w-full border-collapse text-xs"
                          {...props}
                        />
                      </div>
                    ),
                    th: ({ ...props }) => (
                      <th
                        className="border border-zinc-700 px-2 py-1 bg-zinc-900 text-left"
                        {...props}
                      />
                    ),
                    td: ({ ...props }) => (
                      <td
                        className="border border-zinc-700 px-2 py-1"
                        {...props}
                      />
                    ),
                    code(props) {
                      const { children, className } = props;
                      const isInline = !className;

                      return isInline ? (
                        <code className="bg-zinc-900 px-1 py-0.5 rounded text-indigo-300">
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-zinc-900 p-4 rounded-xl overflow-x-auto my-3">
                          <code className="text-indigo-300">{children}</code>
                        </pre>
                      );
                    },
                    p: ({ ...props }) => <p className="mb-2" {...props} />,
                    li: ({ ...props }) => (
                      <li className="ml-5 list-disc mb-1" {...props} />
                    ),
                  }}
                >
                  {hint.text}
                </ReactMarkdown>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-5 bg-zinc-950/50 border-t border-zinc-800 space-y-3">
        {level < 3 ? (
          <button
            onClick={getNextHint}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            {loading ? "Processing..." : level === 0 ? "Get Hint" : "Next Hint"}
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <div className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <AlertCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-200">
              Full solution available. Try solving with the hints first!
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] px-2">
          <History className="w-3 h-3" />
          <span>Session Log</span>
        </div>
      </div>
    </div>
  );
};

export default HintPanel;
