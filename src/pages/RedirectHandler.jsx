// src/pages/RedirectHandler.jsx
// Mount this at route path "/q/:id" (react-router). This is what every
// scan of a dynamic QR actually hits — it looks up the current
// destination, counts the scan, then sends the phone there.

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { resolveAndTrack } from "../lib/links";

export default function RedirectHandler() {
  const { id } = useParams();
  const [status, setStatus] = useState("loading"); // loading | notfound

  useEffect(() => {
    let cancelled = false;
    resolveAndTrack(id).then((data) => {
      if (cancelled) return;
      if (!data) {
        setStatus("notfound");
        return;
      }
      window.location.replace(data.destination);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === "notfound") {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "sans-serif" }}>
        <h2>This QR code isn't active</h2>
        <p>The link it pointed to may have been removed.</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "sans-serif" }}>
      Redirecting…
    </div>
  );
}
