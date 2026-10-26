import { Header } from '../../src/components/Header';

export default function App() {
  return (
    <div className="w-[320px] bg-primary text-onPrimary font-sans">
      <Header />
      <main className="p-4 space-y-3">
        <div className="p-3 bg-surface border border-border rounded-lg">
          <p className="text-sm font-medium text-onPrimary">Theme & Foundation Active</p>
          <p className="text-xs text-onSurface mt-1">
            Semantic tokens (bg-primary, bg-surface, text-onPrimary) verified.
          </p>
        </div>
        <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
          <span className="text-xs text-onSurface">Status</span>
          <span className="text-xs font-medium text-accent">Connected</span>
        </div>
      </main>
    </div>
  );
}
