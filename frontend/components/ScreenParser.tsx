import React, { useState } from "react";
import { api } from "../services/api";
import { Camera, RefreshCcw, Copy, CheckCircle2 } from "lucide-react";
import HintPanel from "./HintPanel";
import successSound from "../music/success.mp3";

const ScreenParser: React.FC = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [problemId, setProblemId] = useState(null);

  // const handleCapture = async () => {
  //   setIsCapturing(true);
  //   // Simulate screenshot delay
  //   await new Promise(r => setTimeout(r, 1500));
  //   const result = await api.extractProblem();
  //   setExtractedText(result.text);
  //   setIsCapturing(false);
  // };

  const handleCapture = async () => {
    try {
      setIsCapturing(true);

      // 1. Ask for screen share (Google Meet style)
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const video = document.createElement("video");
      video.srcObject = stream;

      await video.play();

      // 2. Capture frame
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      const image = canvas.toDataURL("image/png");

      // 3. Stop sharing
      stream.getTracks().forEach((track) => track.stop());

      // 4. Send to backend
      const data = await api.extractScreenProblem(image);

      // 5. Update UI
      setExtractedText(data.extracted_text);
      setProblemId(data.problem_id);

      const audio = new Audio(successSound);
      audio.play();
    } catch (err) {
      console.error("Screen capture failed:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  const copyToClipboard = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Screen Parsing</h2>
        <p className="text-zinc-400">
          Capture mathematical or logical problems directly from your screen for
          instant analysis.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div
              className={`p-6 rounded-full ${isCapturing ? "bg-indigo-600 animate-pulse" : "bg-zinc-800"} transition-all`}
            >
              <Camera
                className={`w-12 h-12 ${isCapturing ? "text-white" : "text-zinc-500"}`}
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-100">Ready to Scan</h3>
              <p className="text-zinc-500 text-sm max-w-xs mx-auto mt-1">
                Make sure the problem is clearly visible in the window before
                capturing.
              </p>
            </div>
            <button
              onClick={handleCapture}
              disabled={isCapturing}
              className={`px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                isCapturing
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20"
              }`}
            >
              {isCapturing ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : null}
              {isCapturing ? "Parsing Screen..." : "Capture Screen Problem"}
            </button>
          </div>

          {extractedText && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative group overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                  Extracted Problem
                </h4>
                <button
                  onClick={copyToClipboard}
                  className="text-zinc-500 hover:text-white transition-colors p-2"
                >
                  {copied ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="bg-zinc-950/50 p-6 rounded-xl border border-zinc-800/50 min-h-[150px]">
                <p className="text-zinc-100 leading-relaxed font-mono whitespace-pre-wrap">
                  {extractedText}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {extractedText ? (
            <HintPanel problemId={extractedText} />
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-2xl p-6 h-full flex items-center justify-center text-center">
              <p className="text-zinc-600 text-sm">
                Capture a problem to activate the adaptive hint engine.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenParser;
