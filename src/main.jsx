import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";

const TabletDemo = React.lazy(() => import('./TabletViewer.jsx'));

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {window.location.pathname === '/tablet' ? <React.Suspense fallback={<p>A carregar o estúdio…</p>}><TabletDemo /></React.Suspense> : <App />}
  </React.StrictMode>,
);
