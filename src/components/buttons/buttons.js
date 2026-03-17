import React from "react";

export const ButtonComponent = ({
  label,
  type = "button",
  onClick,
  disabled = false,
}) => {
  const buttonStyle = {
    backgroundColor: "#ffffff",
    color: "black",
    width: "200px",
    height: "50px",
    padding: "10px 20px",
    border: "black solid 2px",
    borderRadius: "10px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "16px",
    opacity: disabled ? 0.6 : 1,
    display: "block",
    margin: "0 auto",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={buttonStyle}
    >
      {label}
    </button>
  );
};