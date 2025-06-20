import React, { useEffect, useRef } from "react";

export default function GoogleSignInButton({ onSuccess, onError }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    const ref = buttonRef.current;
    if (!ref || !window.google) return;

    // Force fresh render each mount
    ref.innerHTML = "";
    void ref.offsetHeight;

    try {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_MAILING_ID,

        // ▶︎ merged callback: adds helpful logs, keeps original flow
        callback: (response) => {
          console.log("Google Sign-In response:", response);

          if (response?.credential) {
            // quick JWT-payload peek (handy for local debugging)
            try {
              const parts = response.credential.split(".");
              const payload = JSON.parse(atob(parts[1]));
              console.log("Decoded payload:", payload);
            } catch (decodeErr) {
              console.warn("Could not decode ID-token payload:", decodeErr);
            }

            onSuccess(response.credential);        // original success path
          } else {
            onError?.(response);                   // original error path
          }
        },

        ux_mode: "popup",                          // keep popup mode
      });

      window.google.accounts.id.renderButton(ref, {
        theme: "outline",
        size: "large",
        width: "100%",
      });
    } catch (err) {
      console.error("Google Button Init Error:", err);
      onError?.(err);
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
