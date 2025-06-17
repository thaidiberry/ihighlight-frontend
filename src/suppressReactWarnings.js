const suppressedErrorPattern = /ResizeObserver loop (limit exceeded|completed with undelivered notifications)/;

function suppressResizeObserverErrors() {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (
      args[0] &&
      typeof args[0] === "string" &&
      suppressedErrorPattern.test(args[0])
    ) {
      return;
    }
    originalConsoleError(...args);
  };

  window.addEventListener("error", (e) => {
    if (e.message && suppressedErrorPattern.test(e.message)) {
      e.preventDefault();
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    if (
      reason &&
      reason.message &&
      suppressedErrorPattern.test(reason.message)
    ) {
      event.preventDefault();
    }
  });
}

suppressResizeObserverErrors();
