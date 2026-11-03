export function Footer() {
  return (
    <footer className="h-12 border-t border-border px-6 flex items-center justify-between text-xs text-muted-foreground bg-card">
      <p>© {new Date().getFullYear()} Rope4 Outdoor Education. All rights reserved.</p>
      <div className="flex items-center gap-4">
        <span>Support: contact@rope4.org</span>
        <span>Build: MVP-1.0</span>
      </div>
    </footer>
  );
}

