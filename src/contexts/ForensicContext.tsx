import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

interface ForensicContextType {
  file: File | null;
  setFile: (f: File | null) => void;
  evidenceId: string;
  clearFile: () => void;
}

function generateEvidenceId() {
  return `KRP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

const ForensicContext = createContext<ForensicContextType | null>(null);

export function ForensicProvider({ children }: { children: ReactNode }) {
  const [file, setFileState] = useState<File | null>(null);
  const [evidenceId] = useState(generateEvidenceId);

  const setFile = useCallback((f: File | null) => {
    if (f && f.size > MAX_FILE_SIZE) {
      alert(`File exceeds 500MB limit (${(f.size / (1024 * 1024)).toFixed(1)}MB). Please select a smaller file.`);
      return;
    }
    setFileState(f);
  }, []);

  const clearFile = useCallback(() => {
    setFileState(null);
  }, []);

  return (
    <ForensicContext.Provider value={{ file, setFile, evidenceId, clearFile }}>
      {children}
    </ForensicContext.Provider>
  );
}

export function useForensic() {
  const ctx = useContext(ForensicContext);
  if (!ctx) throw new Error("useForensic must be used within ForensicProvider");
  return ctx;
}
