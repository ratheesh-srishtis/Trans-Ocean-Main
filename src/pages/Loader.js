// Loader.js
import React from "react";
import { Oval } from "react-loader-spinner";

const Loader = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div style={styles.overlay}>
      <Oval
        height={80}
        width={80}
        color="#007ac1fb"
        ariaLabel="loading"
        visible={true}
      />
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(5px)",
    zIndex: 9999,
  },
};

export default Loader;
