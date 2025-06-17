import React from "react";

export default function PostError({ error, setError }) {
  return (
    <div className="postError">
      <div className="postError_error">{error}</div>
      <button
        className="black_btn"
        onClick={() => {
          setError("");
        }}
      >
        Try again
      </button>
    </div>
  );
}
