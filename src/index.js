import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import "./styles/icons/icons.css";
import "./styles/dark.css";
import App from "./App";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./reducers";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./suppressReactWarnings"; // <-- ✅ Make sure this file exists

if (process.env.NODE_ENV === "development") {
  const observerError = "ResizeObserver loop completed with undelivered notifications.";

  const originalError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    if (typeof message === "string" && message.includes(observerError)) {
      return true; // prevent default handling
    }
    if (originalError) return originalError(message, source, lineno, colno, error);
    return false;
  };

  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args.length && typeof args[0] === "string" && args[0].includes(observerError)) return;
    originalConsoleError(...args);
  };
}






const store = createStore(rootReducer, composeWithDevTools());

const router = createBrowserRouter([
  {
    path: "*",
    element: <App />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  // 🔄 Optionally replace StrictMode with Fragment if suppression isn't working
  // <React.Fragment>
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      />
    </Provider>
  </React.StrictMode>
  // </React.Fragment>
);
