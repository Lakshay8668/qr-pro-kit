import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import App from "./App";
import Dashboard from "./pages/Dashboard";
import RedirectHandler from "./pages/RedirectHandler";
import "./styles.css";

function NotFound() {
  return <div className="center-page"><h2>Page not found</h2><Link to="/">Back to QR Pro</Link></div>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/q/:id" element={<RedirectHandler />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
