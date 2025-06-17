// src/setupDevOverlaySuppression.js

if (process.env.NODE_ENV === "development") {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("ResizeObserver loop completed with undelivered notifications")
    ) {
      // Suppress only this warning in console
      return;
    }
    originalConsoleError(...args);
  };

  // Suppress full-screen overlay
  window.addEventListener("error", (e) => {
    const message = e?.message || e?.error?.message || "";
    if (message.includes("ResizeObserver loop")) {
      e.stopImmediatePropagation();
    }
  });

  window.addEventListener("unhandledrejection", (e) => {
    const message = e?.reason?.message || "";
    if (message.includes("ResizeObserver loop")) {
      e.stopImmediatePropagation();
    }
  });
}
