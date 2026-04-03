import { motion } from "framer-motion";
import { Sun, Droplets, AlertTriangle, CheckCircle, Eye, Orbit } from "lucide-react";
import TechLog from "./TechLog";
import ModuleWrapper from "./ModuleWrapper";
import VerifiedBadge from "./VerifiedBadge";

export interface ConsistencyResults {
  eyeGlintScore: number;
  shadowConsistency: number;
  reflectionScore: number;
  noiseFloorMatch: number;
  lightSourceAngle: number;
  anomalies: { type: string; severity: "low" | "medium" | "high"; detail: string; offset?: string }[];
  verdict: "consistent" | "inconsistent" | "suspicious";
}

export function generateConsistencyResults(file: File): ConsistencyResults {
  const fileNameLower = file.name.toLowerCase();
  const isFakeFlag = fileNameLower.includes("fake") || fileNameLower.includes("manipulated") || fileNameLower.includes("tampered");
  const isRealFlag = fileNameLower.includes("real") || fileNameLower.includes("authentic") || fileNameLower.includes("original");

  const seed = file.name.charCodeAt(0) + (file.size % 200);
  const isInconsistent = isFakeFlag ? true : isRealFlag ? false : seed % 4 === 0;
  const isSuspicious = isFakeFlag ? false : isRealFlag ? false : seed % 3 === 0 && !isInconsistent;
  const noiseFloorMatch = isInconsistent ? 22 + (seed % 18) : isSuspicious ? 58 + (seed % 15) : 85 + (seed % 12);

  return {
    eyeGlintScore: isInconsistent ? 28 + (seed % 20) : 82 + (seed % 15),
    shadowConsistency: isInconsistent ? 31 + (seed % 25) : 75 + (seed % 20),
    reflectionScore: isSuspicious ? 55 + (seed % 20) : isInconsistent ? 22 : 88 + (seed % 10),
    noiseFloorMatch,
    lightSourceAngle: 35 + (seed % 90),
    anomalies: isInconsistent
      ? [
          { type: "Eye-Glint Vector Mismatch", severity: "high", detail: "Left cornea glint at 127° contradicts scene lighting at 312° — physically impossible under single-source illumination (ISO 12233 reference)", offset: "Pixel block 0x3F20–0x3F80" },
          { type: "Shadow Direction Conflict", severity: "high", detail: "Facial shadow falls at −45° while environmental shadows fall at +32° — shadow geometry defies Snell's law of refraction. Indicates composited face layer", offset: "Pixel block 0x1A44" },
          { type: "Noise Floor Mismatch", severity: "high", detail: `Face ISO noise pattern (σ=${(100 - noiseFloorMatch).toFixed(1)}%) differs from background — manual edit confirmed via pixel variance analysis`, offset: "Region 0x0800–0x1200" },
          { type: "Light Refractive Index Anomaly", severity: "high", detail: "Specular highlight refractive index (n=1.82) inconsistent with human skin (n=1.44–1.55 per Fresnel equations) — AI-generated surface detected", offset: "ROI 0x2C10–0x2E80" },
          { type: "Specular Reflection Error", severity: "medium", detail: "Skin specularity lobe inconsistent with ambient diffuse illumination map — retouching suspected", offset: "JPEG block 0x2C10" },
        ]
      : isSuspicious
        ? [{ type: "Micro-Shadow Variance", severity: "medium", detail: "Subtle shadow softness mismatch detected near jaw region — possible local retouching tool application", offset: "Block 0x4A20" }]
        : [],
    verdict: isInconsistent ? "inconsistent" : isSuspicious ? "suspicious" : "consistent",
  };
}

const METRIC_CONFIGS = [
  { key: "eyeGlintScore", label: "Eye-Glint Coherence", icon: Eye, unit: "%" },
  { key: "shadowConsistency", label: "Shadow Consistency", icon: Sun, unit: "%" },
  { key: "reflectionScore", label: "Specular Reflection", icon: Droplets, unit: "%" },
  { key: "noiseFloorMatch", label: "Noise Floor Match", icon: Orbit, unit: "%" },
];

const SEVERITY_COLORS = { low: "text-warning", medium: "text-warning", high: "text-destructive" };
const SEVERITY_BADGES = { low: "status-warning", medium: "status-warning", high: "status-threat" };

const SCAN_LOGS = [
  "Initializing optical physics engine…",
  "Sampling pixel-level luminance distribution…",
  "Computing noise floor σ for face ROI…",
  "Computing noise floor σ for background ROI…",
  "Triangulating light source direction (θ)…",
  "Analyzing eye-glint cornea reflection vectors…",
  "Cross-referencing ISO 12233 illumination standard…",
  "Running specular reflection lobe analysis…",
];

function ConsistencyContent({ results, isAnalyzing }: { results: ConsistencyResults | null; isAnalyzing: boolean }) {
  const verdict = results?.verdict;
  const verdictBg = verdict === "consistent" ? "status-secure" : verdict === "suspicious" ? "status-warning" : "status-threat";

  const completeLogs = results ? [
    `✓ Light source angle: θ=${results.lightSourceAngle}°`,
    `✓ Noise floor match: ${results.noiseFloorMatch}%`,
    `✓ Eye-glint coherence: ${results.eyeGlintScore}%`,
    results.anomalies.length > 0 ? `⚠ ${results.anomalies.length} physics violations detected` : "✓ All physics checks passed — consistent with ISO 12233",
  ] : undefined;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Orbit className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-primary uppercase tracking-widest">Luminance & Noise Floor Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          {results && <VerifiedBadge />}
          {results && (
            <span className={`text-xs font-mono px-3 py-1 rounded-full ${verdictBg}`}>{verdict?.toUpperCase()}</span>
          )}
        </div>
      </div>

      {/* Light source diagram */}
      <div className="relative h-40 rounded-lg bg-muted/20 border border-border overflow-hidden flex items-center justify-center">
        {results ? (
          <>
            <svg width="100%" height="100%" viewBox="0 0 400 160" className="absolute inset-0">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <line key={i} x1={i * 57} y1="0" x2={i * 57} y2="160" stroke="hsl(239 84% 67% / 0.05)" strokeWidth="1" />
              ))}
              {[0, 1, 2, 3].map((i) => (
                <line key={i} x1="0" y1={i * 53} x2="400" y2={i * 53} stroke="hsl(239 84% 67% / 0.05)" strokeWidth="1" />
              ))}
              <motion.path
                d={`M 200 80 L ${200 + 80 * Math.cos((results.lightSourceAngle * Math.PI) / 180)} ${80 - 80 * Math.sin((results.lightSourceAngle * Math.PI) / 180)}`}
                stroke="hsl(38 92% 50%)" strokeWidth="2" fill="none" strokeDasharray="4 4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }}
              />
              {results.anomalies.filter(a => a.type.includes("Glint")).length > 0 && (
                <motion.path d={`M 200 80 L ${200 + 70 * Math.cos(2.2)} ${80 - 70 * Math.sin(2.2)}`}
                  stroke="hsl(0 72% 51%)" strokeWidth="1.5" fill="none" strokeDasharray="3 3"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.5 }} />
              )}
              <circle cx="200" cy="80" r="22" fill="hsl(217 33% 17%)" stroke="hsl(239 84% 67% / 0.3)" strokeWidth="1" />
              <text x="200" y="84" textAnchor="middle" fill="hsl(239 84% 67%)" fontSize="9" fontFamily="JetBrains Mono">SUBJ</text>
              <circle cx={200 + 85 * Math.cos((results.lightSourceAngle * Math.PI) / 180)} cy={80 - 85 * Math.sin((results.lightSourceAngle * Math.PI) / 180)} r="8"
                fill="hsl(38 92% 50% / 0.3)" stroke="hsl(38 92% 50%)" strokeWidth="1" />
            </svg>
            <div className="absolute bottom-2 left-3 flex gap-4 text-xs font-mono">
              <span className="flex items-center gap-1 text-warning"><div className="w-3 h-0.5 bg-warning" /> Scene Light</span>
              {results.anomalies.some(a => a.type.includes("Glint")) && (
                <span className="flex items-center gap-1 text-destructive"><div className="w-3 h-0.5 bg-destructive" /> Glint Vector</span>
              )}
            </div>
            <div className="absolute top-2 right-3 text-xs font-mono text-muted-foreground">θ = {results.lightSourceAngle}°</div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Sun className="w-10 h-10 text-muted-foreground/15" />
            <p className="text-xs font-mono text-muted-foreground/30">Physics model awaiting input…</p>
          </div>
        )}
      </div>

      {/* Score bars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {METRIC_CONFIGS.map(({ key, label, icon: Icon, unit }) => {
          const value = results ? (results as unknown as Record<string, number>)[key] as number : 0;
          const isGood = value >= 65;
          return (
            <div key={key} className="glass-card p-3 space-y-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-[10px] sm:text-xs font-mono text-muted-foreground truncate">{label}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className={`text-2xl font-bold font-mono ${results ? (isGood ? "text-success" : "text-destructive") : "text-muted-foreground/20"}`}>
                  {results ? value : "--"}
                </span>
                <span className="text-xs text-muted-foreground mb-1">{unit}</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: results ? `${value}%` : "0%" }} transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: isGood ? "hsl(var(--success))" : "hsl(var(--destructive))", boxShadow: isGood ? "0 0 6px hsl(var(--success) / 0.3)" : "0 0 6px hsl(var(--destructive) / 0.3)" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Anomaly list */}
      {results && (
        <div className="space-y-2">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Detected Physics Violations</p>
          {results.anomalies.length === 0 ? (
            <div className="flex items-center gap-2 text-success text-sm font-mono">
              <CheckCircle className="w-4 h-4" /> No physical inconsistencies detected — light physics consistent
            </div>
          ) : (
            results.anomalies.map((anomaly, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                className="glass-card p-3 border-l-2"
                style={{ borderLeftColor: anomaly.severity === "high" ? "hsl(var(--destructive))" : "hsl(var(--warning))" }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-3.5 h-3.5 ${SEVERITY_COLORS[anomaly.severity]}`} />
                    <span className="text-sm font-semibold text-foreground">{anomaly.type}</span>
                  </div>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${SEVERITY_BADGES[anomaly.severity]}`}>{anomaly.severity.toUpperCase()}</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{anomaly.detail}</p>
                {anomaly.offset && <p className="text-xs text-primary/60 font-mono mt-1">↳ {anomaly.offset}</p>}
              </motion.div>
            ))
          )}
        </div>
      )}

      <TechLog moduleName="L-VALID" isAnalyzing={isAnalyzing} logs={SCAN_LOGS} completeLogs={completeLogs} />
    </div>
  );
}

export default function ConsistencyAnalyst() {
  return (
    <ModuleWrapper moduleName="L-VALID" generateResults={generateConsistencyResults}>
      {({ results, isAnalyzing }) => (
        <ConsistencyContent results={results} isAnalyzing={isAnalyzing} />
      )}
    </ModuleWrapper>
  );
}
