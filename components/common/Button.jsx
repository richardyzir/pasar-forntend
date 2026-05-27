export default function Button({
  children,
  variant = "primary",
  size = "",
  block = false,
  disabled = false,
  loading = false,
  type = "button",
  className = "",
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${size ? `btn-${size}` : ""} ${block ? "btn-block" : ""} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}>
      {loading ? <span className="spinner" /> : children}
    </button>
  );
}
