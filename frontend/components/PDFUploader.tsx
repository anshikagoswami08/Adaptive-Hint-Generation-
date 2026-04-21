import React, { useState } from "react";
import { api } from "../services/api";
import {
  FileUp,
  FileText,
  Loader2,
  PlayCircle,
  HelpCircle,
  BrainCircuit,
  Sparkles,
} from "lucide-react";
import HintPanel from "./HintPanel";

const PDFUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedContent, setExtractedContent] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setExtractedContent(null);
      setShowHints(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);

    try {
      const result = await api.uploadPDF(file);

      if (result.questions_json?.error) {
        setExtractedContent("AI failed to extract questions.");
        return;
      }

      // Format questions for display
      const formatted = result.questions_json
        ?.map((q: any, i: number) => `${i + 1}. ${q.question}`)
        .join("\n\n");

      setExtractedContent(formatted || "No questions found.");
    } catch (error) {
      console.error("Upload failed:", error);
      setExtractedContent("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleHints = () => {
    setShowHints(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-white mb-2">
          PDF Learning Mode
        </h2>
        <p className="text-zinc-400">
          Upload textbooks, assignments, or study sheets to extract problems and
          generate hints.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Upload Controls */}
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-6">
          <div
            className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all ${
              file
                ? "border-indigo-600/50 bg-indigo-600/5"
                : "border-zinc-800 bg-zinc-900/50"
            }`}
          >
            <input
              type="file"
              id="pdf-upload"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="pdf-upload" className="cursor-pointer block">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                  file
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                <FileUp className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-300 truncate">
                {file ? file.name : "Choose PDF File"}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Maximum 10MB</p>
            </label>

            {file && (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="mt-6 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {isUploading ? "Extracting..." : "Parse Document"}
              </button>
            )}
          </div>

          {extractedContent && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2 mb-2">
                Quick Actions
              </p>
              <button className="w-full flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-zinc-800">
                <HelpCircle className="w-4 h-4" /> Generate Practice
              </button>
              <button className="w-full flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-zinc-800">
                <PlayCircle className="w-4 h-4" /> Summarize Concepts
              </button>
            </div>
          )}
        </div>

        {/* Center/Right Combined: Content and Hints Below */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 min-h-[400px] flex flex-col shadow-xl">
            {extractedContent ? (
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-indigo-600/20 rounded-lg">
                    <FileText className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="font-bold text-xl text-zinc-100">
                    Extracted Problems & Text
                  </h3>
                </div>

                <div className="flex-1 bg-zinc-950/50 rounded-2xl p-6 border border-zinc-800/50 mb-8 max-h-[400px] overflow-y-auto">
                  <p className="text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
                    {extractedContent}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-4 py-4 border-t border-zinc-800/50">
                  <button
                    onClick={toggleHints}
                    className={`group px-10 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all ${
                      showHints
                        ? "bg-zinc-800 text-zinc-500 cursor-default"
                        : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
                    }`}
                  >
                    <BrainCircuit
                      className={`w-5 h-5 ${!showHints && "group-hover:rotate-12 transition-transform"}`}
                    />
                    {showHints
                      ? "Analyzing Problems..."
                      : "Generate Adaptive Hints"}
                  </button>
                  {!showHints && (
                    <p className="text-xs text-zinc-500 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" /> AI will identify complex
                      parts and prepare stepping stones
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                  <FileText className="w-10 h-10 text-zinc-600" />
                </div>
                <h3 className="text-xl font-bold text-zinc-400">
                  No Document Parsed Yet
                </h3>
                <p className="text-sm text-zinc-500 max-w-xs mt-2">
                  Upload and parse a PDF file from the sidebar to view content
                  here.
                </p>
              </div>
            )}
          </div>

          {/* Adaptive Hints Section Below */}
          {showHints && (
            <div className="animate-in slide-in-from-top-6 fade-in duration-700">
              <div className="bg-zinc-950/50 border border-zinc-800 border-dashed rounded-3xl p-2">
                <HintPanel problemId={extractedContent || ""}  />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFUploader;
