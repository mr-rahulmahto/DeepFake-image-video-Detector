import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ChevronRight, AlertCircle } from "lucide-react";
import { useForensic } from "@/contexts/ForensicContext";
import ProgressLoader from "./ProgressLoader";

interface ModuleWrapperProps {
  moduleName: string;
  children: (props: { results: any; isAnalyzing: boolean }) => React.ReactNode;
  generateResults: (file: File) => any;
  stages?: { duration: number }[];
}

const DEFAULT_STAGES = [
  { duration: 600 }, { duration: 800 }, { duration: 900 }, { duration: 700 }, { duration: 400 },
];

export default function ModuleWrapper({ moduleName, children, generateResults, stages = DEFAULT_STAGES }: ModuleWrapperProps) {
  const { file } = useForensic();
  const [results, setResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const runAnalysis = useCallback(async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setResults(null);

    const CHUNK_SIZE = 5 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    console.log(`[KRYPSIS:${moduleName}] Processing ${file.name} — ${totalChunks} chunks @ 5MB`);

    for (let s = 0; s < stages.length; s++) {
      setAnalysisStage(s);
      const steps = 25;
      const stepDuration = stages[s].duration / steps;
      for (let step = 0; step < steps; step++) {
        setAnalysisProgress(((s * steps + step) / (stages.length * steps)) * 100);
        await new Promise((r) => setTimeout(r, stepDuration));
      }
    }

    setResults(generateResults(file));
    setIsAnalyzing(false);
    setAnalysisStage(stages.length - 1);
    setAnalysisProgress(100);
  }, [file, generateResults, moduleName, stages]);

  return (
    <div className="space-y-5">
      {/* Start Analysis Button */}
      {file && !isAnalyzing && !results && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={runAnalysis}
          className="w-full py-3.5 rounded-lg font-display font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary-glow active:scale-[0.99]"
          style={{ boxShadow: "0 0 16px hsl(var(--primary) / 0.2)" } as React.CSSProperties}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Activity className="w-4 h-4" />
          START {moduleName} ANALYSIS
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      )}

      {!file && !results && (
        <div className="glass-card p-6 flex items-center gap-3 text-xs font-mono text-muted-foreground">
          <AlertCircle className="w-4 h-4 text-muted-foreground/50" />
          Upload evidence on the Dashboard to begin {moduleName} analysis.
        </div>
      )}

      {/* Progress */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <ProgressLoader stage={analysisStage} progress={analysisProgress} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Module content */}
      {children({ results, isAnalyzing })}
    </div>
  );
}
