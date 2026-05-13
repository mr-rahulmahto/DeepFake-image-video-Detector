import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileDown,
  Image,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Music,
  Shield,
  Video,
} from "lucide-react";
import { useAuth } from "@/integrations/supabase/auth";

export type SidebarPage = "dashboard" | "video" | "image" | "audio" | "physics" | "export";

interface AppSidebarProps {
  currentPage: SidebarPage;
  onPageChange: (page: SidebarPage) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const NAV_ITEMS: { id: SidebarPage; label: string; code: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", code: "MAIN", icon: LayoutDashboard },
  { id: "video", label: "Video Intelligence", code: "V-SCAN", icon: Video },
  { id: "physics", label: "Physics Validator", code: "L-VALID", icon: Eye },
  { id: "image", label: "Image Metadata", code: "M-EXTRACT", icon: Image },
  { id: "audio", label: "Audio Signals", code: "A-SPECTRA", icon: Music },
  { id: "export", label: "Neural Verdict", code: "VERDICT", icon: FileDown },
];

export default function AppSidebar({ currentPage, onPageChange, collapsed, onToggle }: AppSidebarProps) {
  const { user, signOut } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isMobile && !collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{
          width: isMobile ? 260 : (collapsed ? 72 : 260),
          x: isMobile && collapsed ? -260 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`flex flex-col border-r border-border/80 overflow-hidden bg-sidebar/95 backdrop-blur-xl
          ${isMobile ? "fixed inset-y-0 left-0 z-50 shadow-2xl" : "relative flex-shrink-0 z-20"}`}
        style={{ minHeight: "100vh" } as React.CSSProperties}
      >
        <div className="flex items-center gap-3 px-3 py-5 border-b border-border/80 overflow-hidden min-w-[260px]">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary-dim border border-primary/30">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <motion.div
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success"
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          {(!collapsed || isMobile) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
              <div className="text-base font-display text-white whitespace-nowrap tracking-wider">
                KRYPSIS<span className="text-primary"> LAB</span>
              </div>
              <div className="text-[9px] font-mono text-muted-foreground whitespace-nowrap tracking-[0.28em]">FORENSIC SUITE v6.0</div>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto min-w-[260px]">
          <div className="px-3 pb-2">
            {(!collapsed || isMobile) && <span className="text-xs font-mono text-muted-foreground/55 uppercase tracking-widest">Analysis Modules</span>}
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  if (isMobile) onToggle();
                }}
                title={collapsed && !isMobile ? item.label : undefined}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden hover:bg-primary/5"
                style={{
                  ...(isActive ? {
                    background: "linear-gradient(90deg, hsl(var(--primary) / 0.14), hsl(var(--primary) / 0.045))",
                    borderLeft: "2px solid hsl(var(--primary))",
                  } : {
                    borderLeft: "2px solid transparent",
                  }),
                } as React.CSSProperties}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-y-2 right-2 w-1 rounded-full bg-primary/60 pointer-events-none"
                  />
                )}
                <Icon
                  className="w-5 h-5 flex-shrink-0 transition-colors"
                  style={{ color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" } as React.CSSProperties}
                />
                {(!collapsed || isMobile) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-start overflow-hidden">
                    <span
                      className="text-sm font-medium whitespace-nowrap"
                      style={{ color: isActive ? "hsl(var(--primary))" : "hsl(var(--sidebar-foreground))" } as React.CSSProperties}
                    >
                      {item.label}
                    </span>
                    <span className="text-[9px] font-mono whitespace-nowrap text-muted-foreground tracking-widest">
                      {item.code}
                    </span>
                  </motion.div>
                )}
              </button>
            );
          })}
        </nav>

        {(!collapsed || isMobile) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-2 mb-3 p-3 rounded-lg bg-secondary/70 border border-border min-w-[244px]">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-mono text-primary">SYSTEM PULSE</span>
            </div>
            {[
              { label: "Engine", val: "ONLINE", color: "text-success" },
              { label: "Chain", val: "SEALED", color: "text-success" },
              { label: "Capacity", val: "500MB", color: "text-accent" },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex justify-between text-xs font-mono py-0.5">
                <span className="text-muted-foreground">{label}</span>
                <span className={color}>{val}</span>
              </div>
            ))}
          </motion.div>
        )}

        <div className="border-t border-border/80 p-2 space-y-1 min-w-[260px]">
          {(!collapsed || isMobile) && user && (
            <div className="px-2 py-2 flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Lock className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs font-mono text-muted-foreground truncate">{user.email}</span>
            </div>
          )}
          <button
            onClick={signOut}
            title="Sign Out"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {(!collapsed || isMobile) && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>

        {!isMobile && (
          <button
            onClick={onToggle}
            className="absolute top-6 -right-3 w-6 h-6 rounded-full flex items-center justify-center z-[60] transition-all hover:scale-110 bg-secondary border border-border"
          >
            {collapsed ? <ChevronRight className="w-3 h-3 text-muted-foreground" /> : <ChevronLeft className="w-3 h-3 text-muted-foreground" />}
          </button>
        )}
      </motion.aside>

      {isMobile && collapsed && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 w-10 h-10 rounded-lg flex items-center justify-center z-[40] transition-all bg-background/80 backdrop-blur-md border border-border text-foreground md:hidden shadow-lg hover:bg-background"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
