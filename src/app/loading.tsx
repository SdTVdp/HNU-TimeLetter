import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#fdfbf7]">
      <div className="relative">
        <div className="absolute inset-0 bg-red-100 rounded-full blur-xl animate-pulse" />
        <Loader2 className="w-12 h-12 text-red-800 animate-spin relative z-10" />
      </div>
      <p className="mt-4 text-stone-500 font-serif text-sm tracking-widest animate-pulse">
        正在载入回忆...
      </p>
    </div>
  );
}
