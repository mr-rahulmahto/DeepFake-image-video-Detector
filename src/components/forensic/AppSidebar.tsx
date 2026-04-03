import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, LayoutDashboard, Video, Image, Music, FileDown, LogOut, ChevronLeft, ChevronRight, Lock, Activity, Eye, Menu } from "lucide-react";
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
          width: isMobile ? 240 : (collapsed ? 64 : 240),
          x: isMobile && collapsed ? -240 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`flex flex-col border-r border-border overflow-hidden bg-background 
          ${isMobile ? "fixed inset-y-0 left-0 z-50 shadow-2xl" : "relative flex-shrink-0"}`}
        style={{ minHeight: "100vh" } as React.CSSProperties}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-3 py-5 border-b border-border overflow-hidden min-w-[240px]">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary-dim border border-primary/25">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <motion.div
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-success"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          {(!collapsed || isMobile) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
              <div className="text-sm font-display text-white whitespace-nowrap tracking-wider">
                KRYPSIS<span className="text-primary">™</span>
              </div>
              <div className="text-xs font-mono text-muted-foreground whitespace-nowrap" style={{ fontSize: "9px" } as React.CSSProperties}>FORENSIC SUITE v6.0</div>
            </motion.div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto min-w-[240px]">
          <div className="px-2 pb-2">
            {(!collapsed || isMobile) && <span className="text-xs font-mono text-muted-foreground/50 uppercase tracking-widest">Modules</span>}
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
                className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden"
                style={{
                  ...(isActive ? {
                    background: `hsl(var(--sidebar-accent))`,
                    borderLeft: `2px solid hsl(var(--primary))`,
                  } : {
                    borderLeft: "2px solid transparent",
                  })
                } as React.CSSProperties}
              >
                {isActive && (
                  <motion.div layoutId="sidebar-active" className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{ background: "hsl(var(--primary) / 0.06)" } as React.CSSProperties} />
                )}
                <Icon className="w-6 h-8 flex-shrink-0 transition-colors "
                  style={{ color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" } as React.CSSProperties} />
                {(!collapsed || isMobile) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 5 }} className="flex flex-col items-start overflow-hidden">
                    <span className="text-sm font-medium whitespace-nowrap"
                      style={{ color: isActive ? "hsl(var(--primary))" : "hsl(var(--sidebar-foreground))" } as React.CSSProperties}>
                      {item.label}
                    </span>
                    <span className="text-xs font-mono whitespace-nowrap" style={{ color: "hsl(var(--muted-foreground))", fontSize: "9px" } as React.CSSProperties}>
                      {item.code}
                    </span>
                  </motion.div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Live status */}
        {(!collapsed || isMobile) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mx-2 mb-3 px-3 py-2.5 rounded-lg bg-secondary border border-border min-w-[224px]">
            <div className="flex items-center gap-2 mb-1.5">
              <Activity className="w-3 h-3 text-primary" />
              <span className="text-xs font-mono text-primary">SYSTEM STATUS</span>
            </div>
            {[{ label: "Engine", val: "ONLINE", color: "text-success" }, { label: "Neural-Link", val: "READY", color: "text-success" }, { label: "Capacity", val: "500MB", color: "text-success" }].map(({ label, val, color }) => (
              <div key={label} className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">{label}</span>
                <span className={color}>{val}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* User + sign out */}
        <div className="border-t border-border p-2 space-y-1 min-w-[240px]">
          {(!collapsed || isMobile) && user && (
            <div className="px-2 py-1.5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Lock className="w-3 h-3 text-primary" />
              </div>
              <span className="text-xs font-mono text-muted-foreground truncate">{user.email}</span>
            </div>
          )}
          <button onClick={signOut} title="Sign Out"
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {(!collapsed || isMobile) && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>

        {/* Toggle button for desktop */}
        {!isMobile && (
          <button onClick={onToggle}
            className="absolute top-6 -right-3 w-6 h-6 rounded-full flex items-center justify-center z-[60] transition-all hover:scale-110 bg-secondary border border-border">
            {collapsed ? <ChevronRight className="w-3 h-3 text-muted-foreground" /> : <ChevronLeft className="w-3 h-3 text-muted-foreground" />}
          </button>
        )}
      </motion.aside>

      {/* Hamburger Menu for Mobile (Positioned fixed over the app when sidebar is collapsed) */}
      {isMobile && collapsed && (
        <button onClick={onToggle}
          className="fixed top-4 left-4 w-10 h-10 rounded-lg flex items-center justify-center z-[40] transition-all bg-background/80 backdrop-blur-md border border-border text-foreground md:hidden shadow-lg hover:bg-background">
          <Menu className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
