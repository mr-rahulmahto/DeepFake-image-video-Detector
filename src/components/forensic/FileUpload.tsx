import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileVideo, FileImage, FileAudio, X, ShieldAlert, Cpu, ScanLine } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

const ACCEPT = "video/*,image/*,audio/*";

export default function FileUpload({ onFileSelect, selectedFile, onClear }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("video/")) return <FileVideo className="w-8 h-8" style={{ color: "hsl(var(--primary))" }} />;
    if (file.type.startsWith("image/")) return <FileImage className="w-8 h-8" style={{ color: "hsl(var(--accent))" }} />;
    if (file.type.startsWith("audio/")) return <FileAudio className="w-8 h-8" style={{ color: "hsl(var(--warning))" }} />;
    return <ShieldAlert className="w-8 h-8" style={{ color: "hsl(var(--muted-foreground))" }} />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className={`relative border border-dashed rounded-lg p-6 sm:p-10 text-center cursor-pointer transition-all duration-300 group overflow-hidden
              ${isDragging
                ? "border-primary bg-primary/10 glow-cyan"
                : "border-border hover:border-primary/50 hover:bg-secondary/30"
              }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div className="absolute inset-0 cyber-grid opacity-35 pointer-events-none" />
            <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-primary opacity-70" />
            <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-primary opacity-70" />
            <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-primary opacity-70" />
            <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-primary opacity-70" />

            <motion.div
              animate={{ y: isDragging ? -8 : 0 }}
              className="relative flex flex-col items-center gap-4"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                {isDragging && (
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-primary"
                    animate={{ scale: [1, 1.5, 1.5], opacity: [1, 0, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
              <div>
                <p className="text-xl font-display font-semibold text-foreground">
                  {isDragging ? "Release to seal evidence" : "Drop media evidence for intake"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports video, image, and audio / up to 500MB / encrypted in transit
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs font-mono">
                {["MP4", "MOV", "JPG", "PNG", "MP3", "WAV"].map((ext) => (
                  <span key={ext} className="px-2 py-0.5 rounded bg-secondary/80 text-muted-foreground border border-border">
                    .{ext}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-accent">
                <ScanLine className="w-3 h-3" />
                HASH / MIME / SIZE PRECHECK
              </div>
            </motion.div>

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
            />
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card-cyan p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
              {getFileIcon(selectedFile)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-semibold text-foreground truncate">{selectedFile.name}</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-0.5">
                <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">{formatSize(selectedFile.size)}</span>
                <span className="text-[10px] sm:text-xs font-mono text-muted-foreground uppercase">{selectedFile.type.split("/")[1]}</span>
                <span className="flex items-center gap-1 text-[10px] sm:text-xs status-active px-2 py-0.5 rounded">
                  <Cpu className="w-3 h-3" /> Evidence Loaded
                </span>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
