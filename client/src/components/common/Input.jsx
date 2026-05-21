export default function Input({ label, error, ...rest }) {
  return (
    <label className="block">
      {" "}
      {label && (
        <span className="text-sm text-slate-600 mb-1 block">{label}</span>
      )}{" "}
      <input className="input" {...rest} />{" "}
      {error && (
        <span className="text-xs text-rose-500 mt-1 block">{error}</span>
      )}{" "}
    </label>
  );
}
