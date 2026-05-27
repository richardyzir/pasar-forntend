export default function Input({
  label,
  error,
  type = "text",
  icon,
  className = "",
  ...props
}) {
  const inputClass = `form-input ${error ? "error" : ""} ${icon ? "search" : ""} ${className}`;

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div className={icon ? "search-wrapper" : ""}>
        {icon && <span className="search-icon">{icon}</span>}
        {type === "textarea" ? (
          <textarea
            className={`form-textarea ${error ? "error" : ""} ${className}`}
            {...props}
          />
        ) : (
          <input type={type} className={inputClass} {...props} />
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
