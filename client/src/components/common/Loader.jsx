export default function Loader({ label = "Loading…" }) {
  return (
    <div className="flex items-center justify-center py-10 text-slate-500 text-sm">
      <span className="w-4 h-4 border-2 border-slate-300 border-t-brand-600 rounded-full animate-spin mr-2" />
      {label}
    </div>
  );
}
