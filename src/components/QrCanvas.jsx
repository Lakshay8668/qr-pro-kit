// src/components/QrCanvas.jsx
// Renders the QR to a <canvas>, optionally with a logo dropped in the
// center. Forces error-correction level "H" whenever a logo is present —
// anything lower and the logo makes the code unscannable.

import { forwardRef, useEffect, useRef } from "react";
import QRCode from "qrcode";

const QrCanvas = forwardRef(function QrCanvas({
  value,
  size = 256,
  fgColor = "#000000",
  bgColor = "#ffffff",
  errorCorrectionLevel = "M",
  logoSrc = null,
  logoScale = 0.22,
}, forwardedRef) {
  const canvasRef = useRef(null);
  const ref = forwardedRef || canvasRef;

  useEffect(() => {
    if (!value || !ref.current) return;

    const ecLevel = logoSrc ? "H" : errorCorrectionLevel;

    QRCode.toCanvas(
      ref.current,
      value,
      {
        width: size,
        margin: 1,
        errorCorrectionLevel: ecLevel,
        color: { dark: fgColor, light: bgColor },
      },
      (err) => {
        if (err || !logoSrc) return;
        const ctx = ref.current.getContext("2d");
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const logoSize = size * logoScale;
          const pos = (size - logoSize) / 2;
          // white pad behind the logo so it stays readable on any QR color
          const pad = 6;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(pos - pad, pos - pad, logoSize + pad * 2, logoSize + pad * 2);
          ctx.drawImage(img, pos, pos, logoSize, logoSize);
        };
        img.src = logoSrc;
      }
    );
  }, [value, size, fgColor, bgColor, errorCorrectionLevel, logoSrc, logoScale]);

  return <canvas ref={ref} role="img" aria-label="QR code" />;
});

export default QrCanvas;

// Download helper — call from a parent button.
export function downloadCanvasPng(canvas, filename = "qr-code.png") {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
