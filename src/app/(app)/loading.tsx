import { Loader2 } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 
          className="h-8 w-8 animate-spin" 
          style={{ color: "var(--color-accent)" }} 
        />
        <p className="text-sm font-medium" style={{ color: "var(--color-text-placeholder)" }}>
          Memuat data...
        </p>
      </div>
    </div>
  );
}
