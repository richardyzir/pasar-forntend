import { useState } from "react";
import { formatNumber, unformatNumber } from "../../utils/format";

export default function PriceInput({
  label,
  value,
  onChange,
  disabled,
  ...props
}) {
  const [display, setDisplay] = useState(formatNumber(value));

  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const num = parseInt(raw) || 0;
    setDisplay(formatNumber(num));
    onChange(num);
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-secondary)",
            fontSize: "0.8rem",
            fontWeight: 600,
          }}>
          Rp
        </span>
        <input
          type="text"
          className="form-input"
          value={display}
          onChange={handleChange}
          onFocus={handleFocus}
          disabled={disabled}
          style={{ paddingLeft: 35, fontWeight: 600 }}
          {...props}
        />
      </div>
    </div>
  );
}
