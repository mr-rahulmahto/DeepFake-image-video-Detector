import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle, Fingerprint } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type Mode = "login" | "signup";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Account created successfully. You are now logged in.");
        setTimeout(() => navigate("/"), 1200);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Micro-dot grid */}
      <div className="absolute inset-0 cyber-grid opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)" }} />

      {/* Scan line — indigo */}
      <motion.div
        className="absolute inset-x-0 h-0.5 pointer-events-none z-10"
        style={{ background: "linear-gradient(90deg, transparent 10%, hsl(var(--primary) / 0.4) 50%, transparent 90%)", boxShadow: "0 0 20px hsl(var(--primary) / 0.2)" }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-20">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 relative bg-primary-dim border border-primary/30"
            style={{ boxShadow: "0 0 40px hsl(var(--primary) / 0.15)" }}>
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
              <Fingerprint className="w-10 h-10 text-primary relative z-10" />
              <motion.div
                className="absolute inset-x-0 h-0.5 z-20 bg-primary"
                style={{ boxShadow: "0 0 12px hsl(var(--primary) / 0.8), 0 0 30px hsl(var(--primary) / 0.4)" }}
                animate={{ top: ["10%", "90%", "10%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <motion.div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success"
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            KRYPSIS<span className="text-primary">™</span>
          </h1>
          <p className="text-xs font-mono text-muted-foreground tracking-[0.3em] mt-2">
            BIOMETRIC ACCESS PORTAL
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-3">
            {["AES-256", "E2E ENCRYPTED", "ZERO-TRUST"].map((tag) => (
              <span key={tag} className="text-[10px] sm:text-xs font-mono text-primary/40 px-2 py-0.5 rounded border border-primary/10">{tag}</span>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="glass-card-primary p-5 sm:p-8 space-y-5 sm:space-y-6">
          {/* Mode toggle */}
          <div className="flex rounded-xl overflow-hidden border border-border p-1 gap-1 bg-secondary/30">
            {(["login", "signup"] as Mode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(null); setSuccess(null); }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold font-mono transition-all duration-200"
                style={mode === m ? {
                  background: "hsl(var(--primary) / 0.12)",
                  color: "hsl(var(--primary))",
                  border: "1px solid hsl(var(--primary) / 0.25)",
                } : { color: "hsl(var(--muted-foreground))" }}>
                {m === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Operator Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@krypsis.io"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground/50 text-sm font-mono focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPassword ? "text" : "password"} required minLength={6} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground/50 text-sm font-mono focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="status-threat px-3 py-2.5 rounded-lg flex items-center gap-2 text-xs font-mono">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="status-secure px-3 py-2.5 rounded-lg flex items-center gap-2 text-xs font-mono">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />{success}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm font-mono flex items-center justify-center gap-2 transition-all"
              style={{
                background: loading ? "hsl(var(--secondary))" : "hsl(var(--primary))",
                color: loading ? "hsl(var(--muted-foreground))" : "hsl(var(--primary-foreground))",
                boxShadow: !loading ? "0 0 16px hsl(var(--primary) / 0.25)" : "none",
              }}
              whileHover={!loading ? { scale: 1.01, backgroundColor: "hsl(239 84% 56%)" } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}>
              {loading ? (
                <>
                  <motion.div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground"
                    animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  {mode === "login" ? "BIOMETRIC ACCESS" : "CREATE ACCOUNT"}
                </>
              )}
            </motion.button>
          </form>

          <div className="border-t border-border pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-xl bg-secondary border border-border">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-success" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs font-bold font-mono text-success truncate">DATA INTEGRITY GUARANTEE</div>
                <div className="text-[10px] sm:text-xs font-mono text-muted-foreground leading-snug">AES-256 encrypted · Zero data retention · Chain-of-custody preserved</div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs font-mono text-muted-foreground/20 mt-6 tracking-widest">
          KRYPSIS FORENSICS SUITE · AUTHORIZED ACCESS ONLY
        </p>
      </motion.div>
    </div>
  );
}
