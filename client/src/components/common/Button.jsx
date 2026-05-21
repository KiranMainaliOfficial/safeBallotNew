export default function Button({ className = "", children, ...rest }) {
  return (
    <button className={`btn-primary ${className}`} {...rest}>
      {children}
    </button>
  );
}
