import { motion } from "framer-motion";
import { Zap, Eye, Layers, CheckCircle2 } from "lucide-react";

interface ProgressLoaderProps {
  stage: number;
  progress: number;
}

const STAGES = [
  { label: "Initializing Engine", icon: Zap, desc: "WebGPU acceleration ready" },
  { label: "Data Chunking", icon: Layers, desc: "Streaming 512KB blocks" },
  { label: "Physics-Consistency Scan", icon: Eye, desc: "Shadow/light analysis active" },
  { label: "Neural-Link Analysis", icon: Zap, desc: "Multi-vector vectorization" },
  { label: "Generating Forensic Report", icon: CheckCircle2, desc: "Compiling evidence matrix" },
];

export default function ProgressLoader({ stage, progress }: ProgressLoaderProps) {
  return (
    <div className="w-full space-y-6">
      {/* Main progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-mono text-primary uppercase tracking-widest">
            {STAGES[stage]?.label ?? "Processing"}
          </span>
          <span className="text-xs font-mono text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            style={{ boxShadow: "0 0 8px hsl(var(--primary) / 0.4)" } as React.CSSProperties}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-xs text-muted-foreground font-mono">{STAGES[stage]?.desc}</p>
      </div>

      {/* Stage indicators */}
      <div className="flex items-center justify-between relative">
        <div className="absolute inset-x-0 top-1/2 h-px bg-border -translate-y-1/2" />
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const isComplete = i < stage;
          const isActive = i === stage;
          return (
            <div key={i} className="relative flex flex-col items-center gap-2 z-10">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300
                  ${isComplete ? "bg-primary border-primary" : isActive ? "bg-primary/20 border-primary animate-pulse-glow" : "bg-secondary border-border"}`}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Icon className={`w-3.5 h-3.5 ${isComplete || isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
                  style={isComplete ? { color: "hsl(var(--primary-foreground))" } : {}}
                />
              </motion.div>
              <span className={`text-xs font-mono whitespace-nowrap hidden md:block
                ${isActive ? "text-primary" : isComplete ? "text-muted-foreground" : "text-muted-foreground/40"}`}>
                {i + 1}
              </span>
            </div>
          );
        })}
      </div>

      {/* Live log stream */}
      <div className="bg-secondary rounded-lg p-3 border border-border font-mono text-xs space-y-1 max-h-28 overflow-hidden">
        {Array.from({ length: Math.min(stage + 2, STAGES.length) }, (_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: i < stage ? 0.4 : 1, x: 0 }}
            className={`flex gap-2 ${i < stage ? "text-muted-foreground" : "text-primary"}`}
          >
            <span className="text-muted-foreground/60 select-none">{">"}</span>
            <span>{i < stage ? "✓" : "→"}</span>
            <span>{STAGES[i]?.label}</span>
            {i < stage && <span className="text-success ml-auto">DONE</span>}
            {i === stage && (
              <motion.span
                className="ml-auto text-warning"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                ACTIVE
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
