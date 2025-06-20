import React, { useEffect, useRef } from "react";

export default function GoogleSignInButton({ onSuccess, onError }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    const ref = buttonRef.current;
    if (!ref || !window.google) return;

    ref.innerHTML = "";
    void ref.offsetHeight;

    try {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_MAILING_ID,
        callback: (response) => {
          if (response.credential) {
            onSuccess(response.credential);
          } else if (onError) {
            onError(response);
          }
        },
        ux_mode: "popup", 
      });

      window.google.accounts.id.renderButton(ref, {
        theme: "outline",
        size: "large",
        width: "100%",
      });
    } catch (err) {
      console.error("Google Button Init Error:", err);
      if (onError) onError(err);
    }

    return () => {
      if (ref) ref.innerHTML = "";
    };
  }, [onSuccess, onError]);

  return (
    <div
      className="google_button_wrapper"
      ref={buttonRef}
      style={{ width: "100%" }}
    />
  );
}