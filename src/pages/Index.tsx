import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Cpu,
  Database,
  Eye,
  FileCheck2,
  Fingerprint,
  Hash,
  Image,
  Lock,
  Music,
  Radio,
  Scan,
  Server,
  Shield,
  Video,
} from "lucide-react";
import FileUpload from "@/components/forensic/FileUpload";
import DeepfakeEngine from "@/components/forensic/DeepfakeEngine";
import ConsistencyAnalyst from "@/components/forensic/ConsistencyAnalyst";
import ExifGpsLab from "@/components/forensic/ExifGpsLab";
import AudioSpectrogram from "@/components/forensic/AudioSpectrogram";
import NeuralLinkHub from "@/components/forensic/NeuralLinkHub";
import AppSidebar, { type SidebarPage } from "@/components/forensic/AppSidebar";
import { ForensicProvider, useForensic } from "@/contexts/ForensicContext";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/82 backdrop-blur-xl">
      <div className="pl-16 pr-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {[{ label: "ENGINE", status: "ONLINE" }, { label: "CHAIN", status: "SEALED" }, { label: "500MB", status: "INTAKE" }].map(({ label, status }) => (
            <div key={label} className="hidden md:flex items-center gap-2 text-xs font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-success" style={{ boxShadow: "0 0 6px hsl(var(--success))" }} />
              <span className="text-muted-foreground">{label}</span>
              <span className="text-success">{status}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono bg-primary-dim border border-primary/20">
            <Shield className="w-3 h-3 text-primary" />
            <span className="text-primary">EVIDENCE LOCKED</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5 text-xs font-mono status-secure px-3 py-1.5 rounded">
            <Lock className="w-3 h-3" />
            <span className="hidden sm:inline">SECURE</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function ModuleHeader({ code, title, icon: Icon }: { code: string; title: string; icon: typeof Cpu }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center bg-primary-dim border border-primary/25 shadow-[0_0_24px_hsl(var(--primary)/0.08)]">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-xl sm:text-2xl font-display text-white tracking-wide truncate">{title}</h2>
        <span className="text-[10px] sm:text-xs font-mono text-muted-foreground tracking-widest truncate block">{code}</span>
      </div>
      <div className="hidden sm:flex ml-auto items-center gap-2 shrink-0">
        <div className="pulse-dot" />
        <span className="text-xs font-mono text-primary">ACTIVE</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="glass-card p-4 space-y-1 evidence-panel">
      <div className="relative text-xs font-mono text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="relative text-xl font-bold font-mono text-primary">{value}</div>
      {sublabel && <div className="relative text-xs text-muted-foreground font-mono">{sublabel}</div>}
    </div>
  );
}

function DashboardPage() {
  const { file, setFile, clearFile, evidenceId } = useForensic();
  const moduleStatus = [
    { label: "Video Intelligence", code: "V-SCAN", icon: Video, status: file ? "READY" : "AWAITING" },
    { label: "Physics Validator", code: "L-VALID", icon: Eye, status: file ? "READY" : "AWAITING" },
    { label: "Image Metadata", code: "M-EXTRACT", icon: Image, status: file ? "READY" : "AWAITING" },
    { label: "Audio Signals", code: "A-SPECTRA", icon: Music, status: file ? "READY" : "AWAITING" },
    { label: "Neural Verdict", code: "VERDICT", icon: Fingerprint, status: file ? "READY" : "AWAITING" },
  ];

  return (
    <div className="space-y-6">
      <ModuleHeader code="MAIN / COMMAND CENTER" title="Evidence Operations Dashboard" icon={Shield} />

      <section className="glass-card-primary evidence-panel p-5 sm:p-7">
        <div className="relative grid gap-6 lg:grid-cols-[1.25fr_0.75fr] items-stretch">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-mono text-accent">
              <Activity className="w-3.5 h-3.5" />
              LIVE CASE WORKSPACE
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-display leading-none tracking-wide text-white">
                Verify media evidence with a field-grade forensic console.
              </h1>
              <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground">
                Upload images, video, or audio, then route the same evidence through temporal, metadata, physics, acoustic, and verdict modules without breaking chain-of-custody.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Case Seal", value: evidenceId.split("-").slice(0, 2).join("-") },
                { label: "Pipeline", value: "5 Modules" },
                { label: "Mode", value: "Local Scan" },
                { label: "State", value: file ? "Loaded" : "Standby" },
              ].map((item) => (
                <div key={item.label} className="metric-strip px-3 py-2">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{item.label}</div>
                  <div className="text-sm font-mono text-foreground truncate">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[220px] rounded-lg border border-border bg-background/45 overflow-hidden">
            <div className="absolute inset-0 cyber-grid opacity-60" />
            <div className="absolute left-4 right-4 top-4 forensic-divider" />
            <div className="absolute inset-x-6 top-10 grid grid-cols-3 gap-2">
              {[Database, Scan, FileCheck2].map((Icon, index) => (
                <div key={index} className="h-16 rounded border border-primary/20 bg-primary/5 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
              ))}
            </div>
            <div className="absolute left-6 right-6 bottom-6 space-y-3">
              {moduleStatus.slice(0, 4).map((item) => (
                <div key={item.code} className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${file ? "bg-success" : "bg-muted-foreground/30"}`} />
                  <div className="h-1.5 flex-1 rounded bg-secondary overflow-hidden">
                    <div className={`h-full ${file ? "w-full bg-primary" : "w-1/3 bg-muted-foreground/20"}`} />
                  </div>
                  <span className="w-16 text-right text-[10px] font-mono text-muted-foreground">{item.code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Engine Status" value="ONLINE" sublabel="500MB intake support" />
        <StatCard label="Analysis Mode" value="60 FPS" sublabel="Frame-level inspection" />
        <StatCard label="Modules Active" value="5 / 5" sublabel="All systems ready" />
        <StatCard label="Evidence ID" value={evidenceId.split("-").slice(0, 2).join("-")} sublabel="Chain preserved" />
      </div>

      <div className="glass-card-primary p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-2">
            <Scan className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-display font-semibold text-white truncate">Evidence Intake - Secure Upload</span>
          </div>
          <span className="text-[10px] sm:text-xs font-mono text-muted-foreground shrink-0">MAX 500MB / AES-256</span>
        </div>
        <FileUpload onFileSelect={setFile} selectedFile={file} onClear={clearFile} />

        {file && (
          <div className="metric-strip p-4 space-y-2">
            <div className="text-xs font-mono text-primary uppercase tracking-wider">Evidence Loaded</div>
            <p className="text-sm font-mono text-foreground">
              File ready for analysis. Navigate to any module and press <strong>"Start Analysis"</strong> to begin independent forensic scanning.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {moduleStatus.map(({ label, code, icon: Icon, status }) => (
          <div key={label} className="glass-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center bg-primary-dim border border-primary/20">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{label}</div>
              <div className="text-[10px] sm:text-xs font-mono text-muted-foreground truncate">{code}</div>
            </div>
            <div className={`text-[10px] sm:text-xs font-mono font-bold shrink-0 ${status === "READY" ? "text-success" : "text-muted-foreground/40"}`}>{status}</div>
            <div
              className={`w-2 h-2 shrink-0 rounded-full ${status === "READY" ? "bg-success" : "bg-muted-foreground/20"}`}
              style={status === "READY" ? { boxShadow: "0 0 4px hsl(var(--success))" } : {}}
            />
          </div>
        ))}
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center bg-accent/10 border border-accent/20">
            <Server className="w-4 h-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">Case Archive</div>
            <div className="text-[10px] sm:text-xs font-mono text-muted-foreground truncate">SEALED EXPORT</div>
          </div>
          <div className="text-[10px] sm:text-xs font-mono font-bold shrink-0 text-accent">ARMED</div>
        </div>
      </div>
    </div>
  );
}

function IndexContent() {
  const [currentPage, setCurrentPage] = useState<SidebarPage>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />;
      case "video":
        return (
          <div className="space-y-5">
            <ModuleHeader code="V-SCAN / DEEPFAKE TEMPORAL SCANNER" title="Video Intelligence" icon={Video} />
            <DeepfakeEngine />
          </div>
        );
      case "physics":
        return (
          <div className="space-y-5">
            <ModuleHeader code="L-VALID / LUMINANCE & NOISE FLOOR" title="Physics Validator" icon={Eye} />
            <ConsistencyAnalyst />
          </div>
        );
      case "image":
        return (
          <div className="space-y-5">
            <ModuleHeader code="M-EXTRACT / BINARY HEADER INSPECTION" title="Image Metadata" icon={Hash} />
            <ExifGpsLab />
          </div>
        );
      case "audio":
        return (
          <div className="space-y-5">
            <ModuleHeader code="A-SPECTRA / ACOUSTIC FINGERPRINTING" title="Audio Signals" icon={Radio} />
            <AudioSpectrogram />
          </div>
        );
      case "export":
        return (
          <div className="space-y-5">
            <ModuleHeader code="VERDICT / NEURAL-LINK VERDICT" title="Neural Verdict" icon={Fingerprint} />
            <NeuralLinkHub />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background forensic-shell flex relative">
      <AppSidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <TopBar />

        <main className="flex-1 px-4 md:px-8 py-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        <div className="text-center text-xs font-mono text-muted-foreground/30 py-3 border-t border-border/80 bg-background/60 backdrop-blur">
          KRYPSIS FORENSIC SUITE v6.0 / CHAIN-OF-CUSTODY / TRUTH PROTOCOL
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  return (
    <ForensicProvider>
      <IndexContent />
    </ForensicProvider>
  );
}
