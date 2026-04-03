import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Cpu, Eye, Hash, Radio, Fingerprint,
  Scan, Video, Image, Music, Lock,
} from "lucide-react";
import FileUpload from "@/components/forensic/FileUpload";
import DeepfakeEngine from "@/components/forensic/DeepfakeEngine";
import ConsistencyAnalyst from "@/components/forensic/ConsistencyAnalyst";
import ExifGpsLab from "@/components/forensic/ExifGpsLab";
import AudioSpectrogram from "@/components/forensic/AudioSpectrogram";
import NeuralLinkHub from "@/components/forensic/NeuralLinkHub";
import AppSidebar, { type SidebarPage } from "@/components/forensic/AppSidebar";
import { ForensicProvider, useForensic } from "@/contexts/ForensicContext";
import { useAuth } from "@/integrations/supabase/auth";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="pl-16 pr-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {[{ label: "ENGINE", status: "ONLINE" }, { label: "NEURAL-LINK", status: "READY" }, { label: "500MB", status: "PEAK" }].map(({ label, status }) => (
            <div key={label} className="hidden md:flex items-center gap-2 text-xs font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-success" style={{ boxShadow: "0 0 6px hsl(var(--success))" }} />
              <span className="text-muted-foreground">{label}</span>
              <span className="text-success">{status}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono bg-primary-dim border border-primary/15">
            <Shield className="w-3 h-3 text-primary" />
            <span className="text-primary">DATA INTEGRITY GUARANTEE</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5 text-xs font-mono status-active px-3 py-1.5 rounded-full">
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
      <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center bg-primary-dim border border-primary/20">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-base sm:text-lg font-display text-white tracking-wide truncate">{title}</h2>
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
    <div className="glass-card p-4 space-y-1">
      <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-xl font-bold font-mono text-primary">{value}</div>
      {sublabel && <div className="text-xs text-muted-foreground font-mono">{sublabel}</div>}
    </div>
  );
}

function DashboardPage() {
  const { file, setFile, clearFile, evidenceId } = useForensic();

  return (
    <div className="space-y-6">
      <ModuleHeader code="MAIN · COMMAND CENTER" title="Dashboard" icon={Shield} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Engine Status" value="ONLINE" sublabel="500MB peak support" />
        <StatCard label="Analysis Mode" value="60 FPS" sublabel="Zero hallucination" />
        <StatCard label="Modules Active" value="5 / 5" sublabel="All systems ready" />
        <StatCard label="Evidence ID" value={evidenceId.split("-").slice(0, 2).join("-")} sublabel="Encrypted chain" />
      </div>

      <div className="glass-card-primary p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-2">
            <Scan className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-display font-semibold text-white truncate">Evidence Intake — Secure Upload</span>
          </div>
          <span className="text-[10px] sm:text-xs font-mono text-muted-foreground shrink-0">MAX 500MB · AES-256</span>
        </div>
        <FileUpload onFileSelect={setFile} selectedFile={file} onClear={clearFile} />

        {file && (
          <div className="glass-card p-4 space-y-2">
            <div className="text-xs font-mono text-primary uppercase tracking-wider">Evidence Loaded</div>
            <p className="text-sm font-mono text-foreground">
              File ready for analysis. Navigate to any module and press <strong>"Start Analysis"</strong> to begin independent forensic scanning.
            </p>
          </div>
        )}
      </div>

      {/* Quick module status cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Video Intelligence", code: "V-SCAN", icon: Video, status: file ? "READY" : "AWAITING" },
          { label: "Physics Validator", code: "L-VALID", icon: Eye, status: file ? "READY" : "AWAITING" },
          { label: "Image Metadata", code: "M-EXTRACT", icon: Image, status: file ? "READY" : "AWAITING" },
          { label: "Audio Signals", code: "A-SPECTRA", icon: Music, status: file ? "READY" : "AWAITING" },
          { label: "Neural Verdict", code: "VERDICT", icon: Fingerprint, status: file ? "READY" : "AWAITING" },
        ].map(({ label, code, icon: Icon, status }) => (
          <div key={label} className="glass-card p-4 flex items-center gap-3">
            <div className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center bg-primary-dim border border-primary/15">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{label}</div>
              <div className="text-[10px] sm:text-xs font-mono text-muted-foreground truncate">{code}</div>
            </div>
            <div className={`text-[10px] sm:text-xs font-mono font-bold shrink-0 ${status === "READY" ? "text-success" : "text-muted-foreground/40"}`}>{status}</div>
            <div className={`w-2 h-2 shrink-0 rounded-full ${status === "READY" ? "bg-success" : "bg-muted-foreground/20"}`}
              style={status === "READY" ? { boxShadow: "0 0 4px hsl(var(--success))" } : {}} />
          </div>
        ))}
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
            <ModuleHeader code="V-SCAN · DEEPFAKE TEMPORAL SCANNER" title="Video Intelligence" icon={Video} />
            <DeepfakeEngine />
          </div>
        );
      case "physics":
        return (
          <div className="space-y-5">
            <ModuleHeader code="L-VALID · LUMINANCE & NOISE FLOOR" title="Physics Validator" icon={Eye} />
            <ConsistencyAnalyst />
          </div>
        );
      case "image":
        return (
          <div className="space-y-5">
            <ModuleHeader code="M-EXTRACT · BINARY HEADER INSPECTION" title="Image Metadata" icon={Hash} />
            <ExifGpsLab />
          </div>
        );
      case "audio":
        return (
          <div className="space-y-5">
            <ModuleHeader code="A-SPECTRA · ACOUSTIC FINGERPRINTING" title="Audio Signals" icon={Radio} />
            <AudioSpectrogram />
          </div>
        );
      case "export":
        return (
          <div className="space-y-5">
            <ModuleHeader code="VERDICT · NEURAL-LINK™ VERDICT" title="Neural Verdict" icon={Fingerprint} />
            <NeuralLinkHub />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background cyber-grid flex">
      <AppSidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />

      <div className="flex-1 flex flex-col min-w-0">
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

        <div className="text-center text-xs font-mono text-muted-foreground/20 py-3 border-t border-border">
          KRYPSIS™ FORENSIC SUITE v6.0 · ZERO-HALLUCINATION · TRUTH PROTOCOL
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
