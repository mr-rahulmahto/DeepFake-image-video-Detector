import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";

interface TechLogProps {
  moduleName: string;
  isAnalyzing: boolean;
  logs: string[];
  completeLogs?: string[];
}

export default function TechLog({ moduleName, isAnalyzing, logs, completeLogs }: TechLogProps) {
  const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!isAnalyzing) {
      if (completeLogs && completeLogs.length > 0) {
        setDisplayedLogs(completeLogs);
      }
      indexRef.current = 0;
      return;
    }
    setDisplayedLogs([]);
    indexRef.current = 0;

    const interval = setInterval(() => {
      if (indexRef.current < logs.length) {
        setDisplayedLogs(prev => [...prev, logs[indexRef.current]]);
        indexRef.current++;
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isAnalyzing, logs, completeLogs]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedLogs]);

  if (displayedLogs.length === 0 && !isAnalyzing) return null;

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-secondary border-b border-border">
        <Terminal className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-mono text-primary uppercase tracking-widest">{moduleName} · Live Technical Log</span>
        {isAnalyzing && (
          <motion.div
            className="ml-auto w-2 h-2 rounded-full bg-success"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        )}
      </div>
      <div
        ref={scrollRef}
        className="bg-background p-3 max-h-36 overflow-y-auto font-mono text-xs space-y-0.5"
      >
        <AnimatePresence>
          {displayedLogs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2"
            >
              <span className="text-muted-foreground/40 select-none">{">"}</span>
              <span className={log.startsWith("✓") ? "text-success" : log.startsWith("⚠") ? "text-warning" : log.startsWith("✗") ? "text-destructive" : "text-muted-foreground"}>
                {log}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {isAnalyzing && (
          <motion.div
            className="flex gap-2 text-primary"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <span className="select-none">{">"}</span>
            <span>Processing…</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
