export function Footer() {
  return (
    <footer className="h-12 shrink-0 border-t border-slate-200/80 px-6 flex items-center justify-between text-xs text-slate-500 bg-white shadow-[0_-1px_2px_rgba(0,0,0,0.01)]">
      <p>© {new Date().getFullYear()} Rope4 Outdoor Education. All rights reserved.</p>
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline">Support: contact@rope4.org</span>
        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-semibold">
          MVP-1.0
        </span>
      </div>
    </footer>
  );
}
