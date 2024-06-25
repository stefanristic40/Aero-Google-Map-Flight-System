import React from "react";

function Airplane({ className, style, onClick }) {
  const styles = {
    filter: "drop-shadow(2px 2px 2px #222)",
    ...style,
  };

  return (
    <img
      src="/images/airplane.png"
      alt="Airplane"
      style={styles}
      className={`${className}  `}
      onClick={onClick}
    />
  );
}

export default Airplane;
