import { useState } from "react";
import { motion } from "framer-motion";
import { FileDown, Shield, CheckCircle, AlertTriangle, Hash, Clock, Fingerprint, Lock } from "lucide-react";
import type { NeuralResults } from "./NeuralLinkHub";

interface ExportReportProps {
  results: NeuralResults | null;
  fileName: string;
  evidenceId: string;
}

export default function ExportReport({ results, fileName, evidenceId }: ExportReportProps) {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = async () => {
    if (!results) return;
    setExporting(true);

    const { default: jsPDF } = await import("jspdf");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = 210;
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const addLine = (thickness = 0.3, color = [30, 40, 50]) => {
      doc.setDrawColor(...(color as [number, number, number]));
      doc.setLineWidth(thickness);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;
    };

    const addText = (text: string, size: number, bold = false, color = [200, 220, 240]) => {
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setTextColor(...(color as [number, number, number]));
      doc.text(text, margin, y);
      y += size * 0.45;
    };

    const addKV = (key: string, value: string, alertLevel: "ok" | "warn" | "critical" = "ok") => {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 140, 160);
      doc.text(key + ":", margin, y);

      const valueColor: [number, number, number] =
        alertLevel === "critical" ? [220, 60, 60] :
        alertLevel === "warn" ? [220, 160, 40] :
        [60, 200, 180];
      doc.setTextColor(...valueColor);
      doc.text(value, margin + 55, y);
      y += 5.5;
    };

    // Background — Deep-Space Blue
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 297, "F");

    // Header stripe
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 38, "F");
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 36.5, 210, 1.5, "F");

    y = 10;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(99, 102, 241);
    doc.text("KRYPSIS™ FORENSIC EVIDENCE REPORT", margin, y);
    y += 8;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 160, 180);
    doc.text("MULTIMEDIA FORENSIC SUITE · PROFESSIONAL EDITION", margin, y);
    doc.text(`Generated: ${new Date().toISOString().replace("T", " ").slice(0, 19)} UTC`, pageWidth - margin, y, { align: "right" });
    y = 46;

    // Evidence metadata block
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(margin, y, contentWidth, 28, 2, 2, "F");
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentWidth, 28, 2, 2, "S");
    y += 5;

    const col2 = margin + contentWidth / 2 + 4;

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(99, 102, 241);
    doc.text("EVIDENCE ID", margin + 4, y);
    doc.text("BLOCKCHAIN HASH", col2, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(210, 220, 240);
    doc.text(evidenceId, margin + 4, y);
    doc.setFontSize(6.5);
    doc.setTextColor(140, 180, 200);
    doc.text(results.blockchainHash, col2, y, { maxWidth: 90 });
    y += 6;

    doc.setFontSize(8);
    doc.setTextColor(99, 102, 241);
    doc.text("FILE ANALYZED", margin + 4, y);
    doc.text("VERDICT", col2, y);
    y += 4;
    doc.setTextColor(210, 220, 240);
    doc.text(fileName, margin + 4, y, { maxWidth: 80 });

    const verdictColor: [number, number, number] =
      results.verdict === "AUTHENTIC" ? [60, 200, 100] :
      results.verdict === "SUSPICIOUS" ? [220, 160, 40] : [220, 60, 60];
    doc.setTextColor(...verdictColor);
    doc.setFont("helvetica", "bold");
    doc.text(results.verdict, col2, y);
    y += 10;

    // Neural-Link Score
    y += 2;
    addText("NEURAL-LINK™ AUTHENTICITY SCORE", 10, true, [99, 102, 241]);
    y += 1;
    addLine(0.3, [51, 65, 85]);

    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    const scoreColor: [number, number, number] =
      results.authenticityScore >= 70 ? [60, 200, 100] :
      results.authenticityScore >= 40 ? [220, 160, 40] : [220, 60, 60];
    doc.setTextColor(...scoreColor);
    doc.text(`${results.authenticityScore}%`, margin, y + 6);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 140, 160);
    doc.text("Multi-vector forensic authenticity index", margin + 30, y + 1);
    doc.text("Higher = more authentic. Score < 40% indicates high manipulation probability.", margin + 30, y + 6);
    y += 14;

    // Risk Matrix
    addText("MULTI-VECTOR RISK MATRIX", 10, true, [99, 102, 241]);
    addLine(0.3, [51, 65, 85]);

    results.riskVectors.forEach((v) => {
      addKV(v.name, `${v.score}% — ${v.status.toUpperCase()}`,
        v.status === "critical" ? "critical" : v.status === "warn" ? "warn" : "ok");
    });
    y += 3;

    // Point-of-Failure List
    addText("POINT-OF-FAILURE EVIDENCE LOG", 10, true, [99, 102, 241]);
    addLine(0.3, [51, 65, 85]);

    if (results.pointsOfFailure.length === 0) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 200, 100);
      doc.text("✓ No forensic failures detected. Media appears authentic.", margin, y);
      y += 6;
    } else {
      results.pointsOfFailure.forEach((pof, i) => {
        const c: [number, number, number] = pof.severity === "critical" ? [220, 60, 60] : [220, 160, 40];
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(120, 140, 160);
        doc.text(`[${String(i + 1).padStart(2, "0")}]`, margin, y);
        doc.setTextColor(...c);
        const label = `${pof.location}: ${pof.detail}`;
        const lines = doc.splitTextToSize(label, contentWidth - 14);
        doc.text(lines, margin + 10, y);
        y += lines.length * 4.5;
        if (y > 260) { doc.addPage(); doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 297, "F"); y = 16; }
      });
    }
    y += 3;

    // AI Model Fingerprint
    if (results.modelFingerprint) {
      if (y + 15 > 270) { doc.addPage(); doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 297, "F"); y = 16; }
      addText("AI MODEL FINGERPRINT", 10, true, [99, 102, 241]);
      addLine(0.3, [51, 65, 85]);
      addKV("Detected Model", results.modelFingerprint, "critical");
      addKV("Match Confidence", `${results.modelConfidence}%`, "warn");
      y += 3;
    }

    // Footer
    y = 277;
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 270, 210, 27, "F");
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 269.5, 210, 1, "F");

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 120, 140);
    doc.text("KRYPSIS™ FORENSIC SUITE — FOR AUTHORIZED INVESTIGATIVE USE ONLY", margin, y);
    doc.text(`Evidence ID: ${evidenceId}`, pageWidth - margin, y, { align: "right" });
    y += 4;
    doc.text("This report was generated by an automated forensic system. All findings should be verified by a certified forensic expert.", margin, y, { maxWidth: 140 });
    doc.text(`Report Hash: ${results.blockchainHash.slice(0, 20)}...`, pageWidth - margin, y, { align: "right" });

    doc.save(`KRYPSIS_Evidence_${evidenceId}.pdf`);
    setExporting(false);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileDown className="w-4 h-4 text-warning" />
        <span className="text-xs font-mono text-warning uppercase tracking-widest">Evidence Report Export · Court-Ready PDF</span>
      </div>

      {results ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Evidence ID", value: evidenceId, icon: Hash },
              { label: "Verdict", value: results.verdict, icon: Shield,
                color: results.verdict === "AUTHENTIC" ? "text-success" : results.verdict === "SUSPICIOUS" ? "text-warning" : "text-destructive" },
              { label: "Authenticity", value: `${results.authenticityScore}%`, icon: Fingerprint },
              { label: "Failures Found", value: String(results.riskVectors.filter(v => v.status !== "safe").length), icon: AlertTriangle },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="glass-card p-4 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-mono text-muted-foreground">{label}</span>
                </div>
                <div className={`text-base font-bold font-mono ${color ?? "text-primary"}`}>{value}</div>
              </div>
            ))}
          </div>

          <div className="glass-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Chain-of-Custody Hash</span>
              <span className="ml-auto status-active text-xs font-mono px-2 py-0.5 rounded-full">IMMUTABLE</span>
            </div>
            <div className="bg-muted/40 rounded-lg px-3 py-2 border border-border">
              <p className="text-xs font-mono text-primary break-all">{results.blockchainHash}</p>
            </div>
            <p className="text-xs font-mono text-muted-foreground">
              SHA-256 integrity hash sealed at analysis time. Any post-investigation modification invalidates this record.
            </p>
          </div>

          <div className="glass-card p-4 space-y-3">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Point-of-Failure Evidence Log</p>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {results.riskVectors.filter(v => v.status !== "safe").length === 0 ? (
                <div className="flex items-center gap-2 text-success text-sm font-mono">
                  <CheckCircle className="w-4 h-4" /> No forensic failures detected
                </div>
              ) : (
                results.riskVectors.filter(v => v.status !== "safe").map((v, i) => (
                  <div key={i} className={`flex items-start gap-2 text-xs font-mono px-3 py-2 rounded-lg
                    ${v.status === "critical" ? "status-threat" : "status-warning"}`}>
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{v.name}: {v.score}% risk level detected</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <motion.button
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-4 rounded-xl font-bold text-sm font-mono flex items-center justify-center gap-3 transition-all"
            style={{
              background: exported
                ? "hsl(var(--success) / 0.2)"
                : exporting
                  ? "hsl(var(--secondary))"
                  : "linear-gradient(135deg, hsl(var(--warning) / 0.8), hsl(var(--accent)))",
              color: exported ? "hsl(var(--success))" : exporting ? "hsl(var(--muted-foreground))" : "hsl(var(--primary-foreground))",
              border: exported ? "1px solid hsl(var(--success) / 0.4)" : "none",
              boxShadow: !exporting && !exported ? "0 0 20px hsl(var(--warning) / 0.3)" : "none",
            } as React.CSSProperties}
            whileHover={!exporting ? { scale: 1.01 } : {}}
            whileTap={!exporting ? { scale: 0.99 } : {}}
          >
            {exported ? (
              <><CheckCircle className="w-5 h-5" /> REPORT EXPORTED SUCCESSFULLY</>
            ) : exporting ? (
              <>
                <motion.div
                  className="w-4 h-4 rounded-full border-2 border-muted/30 border-t-muted-foreground"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
                GENERATING PDF...
              </>
            ) : (
              <><FileDown className="w-5 h-5" /> EXPORT FORENSIC EVIDENCE REPORT</>
            )}
          </motion.button>

          <p className="text-xs font-mono text-muted-foreground/50 text-center">
            Evidence ID {evidenceId} · PDF includes full chain-of-custody hash
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }}>
            <FileDown className="w-16 h-16 text-warning/30" />
          </motion.div>
          <p className="text-sm font-mono text-muted-foreground/50 text-center">
            Run a forensic analysis first to generate an evidence report
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground/40">
            <Clock className="w-3.5 h-3.5" />
            Awaiting analysis results…
          </div>
        </div>
      )}
    </div>
  );
}
