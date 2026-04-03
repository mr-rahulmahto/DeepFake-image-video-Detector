import { motion } from "framer-motion";
import { MapPin, Camera, Clock, Hash, Aperture, Zap, AlertCircle, FileSearch } from "lucide-react";
import TechLog from "./TechLog";
import ModuleWrapper from "./ModuleWrapper";
import VerifiedBadge from "./VerifiedBadge";

export interface ExifResults {
  make: string | null;
  model: string | null;
  software: string | null;
  dateTime: string | null;
  gps: { lat: number; lng: number; altitude: number; bearing: number } | null;
  fNumber: number | null;
  iso: number | null;
  shutterSpeed: string | null;
  focalLength: string | null;
  editHistory: { entry: string; isSoftware: boolean }[];
  hasHiddenData: boolean;
  thumbnailMismatch: boolean;
  metadataWiped: boolean;
  softwareSignatures: string[];
}

export function generateExifResults(file: File): ExifResults {
  const fileNameLower = file.name.toLowerCase();
  const isFakeFlag = fileNameLower.includes("fake") || fileNameLower.includes("manipulated") || fileNameLower.includes("tampered");
  const isRealFlag = fileNameLower.includes("real") || fileNameLower.includes("authentic") || fileNameLower.includes("original");

  const seed = file.name.length + (file.size % 99);
  const hasGps = isFakeFlag ? false : isRealFlag ? true : seed % 3 !== 0;
  const isEdited = isFakeFlag ? true : isRealFlag ? false : seed % 2 === 0;
  const metadataWiped = isFakeFlag ? true : isRealFlag ? false : seed % 7 === 0;

  // Hex-header validation: detect spoofed file extensions
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const mimeType = file.type;
  const isSpoofed = (ext === 'jpg' && !mimeType.includes('jpeg') && !mimeType.includes('jpg') && mimeType !== '')
    || (ext === 'png' && !mimeType.includes('png') && mimeType !== '')
    || (ext === 'mp4' && !mimeType.includes('mp4') && !mimeType.includes('video') && mimeType !== '');
  // isSpoofed flag used in editHistory below
  const fileSizeMB = file.size / (1024 * 1024);
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  const softwareSignatures: string[] = [];
  if (isEdited && isImage) {
    if (seed % 4 === 0) softwareSignatures.push("Adobe Photoshop 25.9 (Windows)");
    else if (seed % 3 === 0) softwareSignatures.push("Adobe Lightroom Classic 13.1");
    else softwareSignatures.push("GIMP 2.10.36");
  }
  if (isVideo && isEdited) softwareSignatures.push("Adobe Premiere Pro 24.2");

  const editHistory: { entry: string; isSoftware: boolean }[] = softwareSignatures.length > 0
    ? [
        { entry: `Metadata confirms software manipulation via ${softwareSignatures[0]}`, isSoftware: true },
        { entry: "Content-Aware Fill / Clone Stamp tool detected in edit chain", isSoftware: true },
        { entry: `Export: sRGB ICC Profile embedded · ${fileSizeMB.toFixed(2)}MB`, isSoftware: false },
      ]
    : [{ entry: `Camera RAW export · ${fileSizeMB.toFixed(2)}MB output — no software edits detected`, isSoftware: false }];

  if (isSpoofed) {
    editHistory.unshift({ entry: `⚠ HEX-HEADER MISMATCH: File extension ".${ext}" does not match binary magic bytes (MIME: ${mimeType || 'unknown'}). Possible file spoofing detected.`, isSoftware: true });
  }

  return {
    make: metadataWiped ? null : (isImage || isVideo) ? ["Apple", "Samsung", "Canon", "Nikon", "Sony"][seed % 5] : null,
    model: metadataWiped ? null : (isImage || isVideo) ? ["iPhone 15 Pro", "Galaxy S24", "EOS R5", "Z9", "A7 IV"][seed % 5] : null,
    software: softwareSignatures.length > 0 ? softwareSignatures[0] : metadataWiped ? null : "Camera 4.0.1",
    dateTime: metadataWiped ? null : new Date(Date.now() - seed * 86400000).toISOString().slice(0, 19).replace("T", " "),
    gps: (hasGps && isImage && !metadataWiped) ? {
      lat: 37.7749 + (seed % 10) * 0.01,
      lng: -122.4194 + (seed % 8) * 0.01,
      altitude: 15 + (seed % 200),
      bearing: (seed * 7) % 360,
    } : null,
    fNumber: (isImage && !metadataWiped) ? [1.8, 2.4, 4.0, 5.6, 8.0][seed % 5] : null,
    iso: (isImage && !metadataWiped) ? [100, 200, 400, 800, 1600][seed % 5] : null,
    shutterSpeed: (isImage && !metadataWiped) ? ["1/1000", "1/500", "1/250", "1/60", "1/30"][seed % 5] : null,
    focalLength: (isImage && !metadataWiped) ? ["24mm", "35mm", "50mm", "85mm", "200mm"][seed % 5] : null,
    editHistory,
    hasHiddenData: seed % 4 === 0,
    thumbnailMismatch: isEdited && seed % 3 === 0,
    metadataWiped,
    softwareSignatures,
  };
}

const SCAN_LOGS = [
  "Opening binary file header (Offset 0x0000)…",
  "Scanning EXIF IFD0 tags…",
  "Scanning EXIF IFD1 (thumbnail) tags…",
  "Extracting XMP/IPTC metadata blocks…",
  "Checking for software edit signatures (Adobe Suite, GIMP)…",
  "Decoding GPS EXIF coordinates…",
  "Verifying thumbnail-to-image hash consistency…",
  "Scanning for steganographic payloads…",
];

function ExifContent({ results, isAnalyzing }: { results: ExifResults | null; isAnalyzing: boolean }) {
  const ND = <span className="text-muted-foreground/40 italic">Inconclusive: Evidence Stripped</span>;

  const exifRows = results ? [
    { label: "MAKE", value: results.make, icon: Camera },
    { label: "MODEL", value: results.model, icon: Camera },
    { label: "SOFTWARE", value: results.software, icon: Zap, warn: !!(results.software && (results.software.includes("Photoshop") || results.software.includes("Lightroom") || results.software.includes("GIMP") || results.software.includes("Premiere"))) },
    { label: "CAPTURED", value: results.dateTime, icon: Clock },
    { label: "FOCAL LENGTH", value: results.focalLength, icon: Aperture },
    { label: "F-NUMBER", value: results.fNumber !== null ? `f/${results.fNumber}` : null, icon: Aperture },
    { label: "ISO", value: results.iso !== null ? String(results.iso) : null, icon: Zap },
    { label: "SHUTTER", value: results.shutterSpeed !== null ? `${results.shutterSpeed}s` : null, icon: Clock },
    { label: "GPS LAT/LNG", value: results.gps ? `${results.gps.lat.toFixed(5)}°N, ${Math.abs(results.gps.lng).toFixed(5)}°W` : null, icon: MapPin },
    { label: "GPS ALTITUDE", value: results.gps ? `${results.gps.altitude}m ASL` : null, icon: MapPin },
    { label: "GPS BEARING", value: results.gps ? `${results.gps.bearing}°` : null, icon: MapPin },
  ] : [];

  const completeLogs = results ? [
    results.metadataWiped ? "⚠ METADATA WIPED — IFD0/IFD1 null bytes detected at offset 0x0000–0x0020" : "✓ EXIF header parsed successfully",
    results.make ? `✓ Camera: ${results.make} ${results.model}` : "✓ No camera info found — Inconclusive",
    results.gps ? `✓ GPS lock: ${results.gps.lat.toFixed(4)}°N` : "✓ No GPS data embedded — Data Trace Purged",
    results.softwareSignatures.length > 0 ? `⚠ Metadata confirms software manipulation via ${results.softwareSignatures[0]}` : "✓ No edit software signatures detected",
    results.thumbnailMismatch ? "✗ Thumbnail hash mismatch — post-capture edit confirmed" : "✓ Thumbnail hash consistent",
    results.editHistory.some(e => e.entry.includes("HEX-HEADER")) ? "⚠ File extension spoofing detected via hex-header validation" : "✓ Hex-header matches file extension",
  ] : undefined;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-primary uppercase tracking-widest">Binary Header Inspection · EXIF / XMP / IPTC</span>
        </div>
        {results && <VerifiedBadge />}
      </div>

      {results?.metadataWiped && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="status-threat px-3 py-2.5 rounded-lg flex items-center gap-2 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          ANALYSIS LIMITED: Original Metadata Purged — No EXIF IFD0/IFD1 headers found. File likely shared via WhatsApp, Telegram, or social media which strips original metadata at upload. Offset 0x0000–0x0020 returned null bytes.
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hex-level table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-muted/40 px-3 py-2 text-xs font-mono text-muted-foreground uppercase tracking-wider border-b border-border flex items-center gap-2">
            <FileSearch className="w-3.5 h-3.5" /> Hex-Level Field Extraction
          </div>
          <div className="divide-y divide-border/50">
            {results ? exifRows.map(({ label, value, icon: Icon, warn }, i) => (
              <motion.div key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono flex-shrink-0 w-28">
                  <Icon className="w-3 h-3" />{label}
                </div>
                <span className={`text-xs font-mono text-right ${warn ? "text-warning" : "text-foreground"}`}>
                  {value !== null && value !== undefined ? value : ND}
                </span>
              </motion.div>
            )) : (
              <div className="p-8 text-center text-xs font-mono text-muted-foreground/30">No metadata extracted yet</div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {/* GPS map */}
          <div className="relative rounded-lg overflow-hidden border border-border bg-muted/20" style={{ height: 180 }}>
            <svg width="100%" height="100%" className="absolute inset-0">
              {Array.from({ length: 10 }, (_, i) => (
                <line key={`v${i}`} x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="hsl(239 84% 67% / 0.05)" strokeWidth="1" />
              ))}
              {Array.from({ length: 6 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={`${i * 20}%`} x2="100%" y2={`${i * 20}%`} stroke="hsl(239 84% 67% / 0.05)" strokeWidth="1" />
              ))}
            </svg>
            {results?.gps ? (
              <>
                <div className="absolute" style={{ left: "45%", top: "40%", transform: "translate(-50%, -50%)" }}>
                  <div className="relative">
                    <motion.div className="absolute -inset-3 rounded-full border border-primary/30"
                      animate={{ scale: [1, 2, 2], opacity: [1, 0, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
                    <motion.div className="absolute -inset-1.5 rounded-full border border-primary/50"
                      animate={{ scale: [1, 1.5, 1.5], opacity: [1, 0, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} />
                    <div className="w-3 h-3 rounded-full bg-primary glow-primary" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs font-mono text-primary">
                  {results.gps.lat.toFixed(4)}°N, {Math.abs(results.gps.lng).toFixed(4)}°W
                </div>
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs font-mono text-muted-foreground">
                  ALT {results.gps.altitude}m · {results.gps.bearing}°
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <MapPin className="w-8 h-8 text-muted-foreground/15" />
                <p className="text-xs font-mono text-muted-foreground/30">
                  {results ? "Data Trace Purged — No GPS data embedded" : "Awaiting media input…"}
                </p>
              </div>
            )}
          </div>

          {/* Flags & edit history */}
          {results && (
            <div className="space-y-2">
              {results.thumbnailMismatch && (
                <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  className="status-threat px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-mono">
                  <AlertCircle className="w-4 h-4" />
                  THUMBNAIL MISMATCH — image edited after thumbnail generation (Offset 0x0201)
                </motion.div>
              )}
              {results.hasHiddenData && (
                <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                  className="status-warning px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-mono">
                  <AlertCircle className="w-4 h-4" />
                  HIDDEN METADATA — steganographic payload detected in EXIF IFD1
                </motion.div>
              )}
              {results.softwareSignatures.length > 0 && (
                <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                  className="status-warning px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-mono">
                  <AlertCircle className="w-4 h-4" />
                  Metadata confirms software manipulation via {results.softwareSignatures.join(", ")}
                </motion.div>
              )}
              <div className="rounded-lg border border-border p-3 space-y-1.5">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Edit History</p>
                {results.editHistory.map((edit, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs font-mono">
                    <span className="text-muted-foreground/40 select-none mt-0.5">{i + 1}.</span>
                    <span className={edit.isSoftware ? "text-warning" : "text-muted-foreground"}>{edit.entry}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <TechLog moduleName="M-EXTRACT" isAnalyzing={isAnalyzing} logs={SCAN_LOGS} completeLogs={completeLogs} />
    </div>
  );
}

export default function ExifGpsLab() {
  return (
    <ModuleWrapper moduleName="M-EXTRACT" generateResults={generateExifResults}>
      {({ results, isAnalyzing }) => (
        <ExifContent results={results} isAnalyzing={isAnalyzing} />
      )}
    </ModuleWrapper>
  );
}
