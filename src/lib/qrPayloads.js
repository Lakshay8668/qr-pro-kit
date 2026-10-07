// src/lib/qrPayloads.js
// Turns form data into the exact string that gets encoded into the QR.
// These follow the standard QR "special format" conventions that every
// phone camera / scanner app already knows how to parse.

function escapeWifi(value = "") {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

export const QR_TYPES = [
  { id: "url", label: "Website / Link" },
  { id: "text", label: "Plain text" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone call" },
  { id: "sms", label: "SMS" },
  { id: "wifi", label: "Wi-Fi" },
  { id: "vcard", label: "Contact card (vCard)" },
];

export function buildPayload(type, data = {}) {
  switch (type) {
    case "url":
      return data.url?.trim() || "";

    case "text":
      return data.text || "";

    case "email": {
      const params = [];
      if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
      if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);
      const query = params.length ? `?${params.join("&")}` : "";
      return `mailto:${data.to || ""}${query}`;
    }

    case "phone":
      return `tel:${data.phone || ""}`;

    case "sms":
      return `SMSTO:${data.phone || ""}:${data.message || ""}`;

    case "wifi":
      return `WIFI:T:${data.security || "WPA"};S:${escapeWifi(data.ssid)};P:${escapeWifi(
        data.password || ""
      )};${data.hidden ? "H:true;" : ""}`;

    case "vcard":
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${data.lastName || ""};${data.firstName || ""};;;`,
        `FN:${[data.firstName, data.lastName].filter(Boolean).join(" ")}`,
        data.org ? `ORG:${data.org}` : null,
        data.title ? `TITLE:${data.title}` : null,
        data.phone ? `TEL;TYPE=CELL:${data.phone}` : null,
        data.email ? `EMAIL:${data.email}` : null,
        data.website ? `URL:${data.website}` : null,
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\n");

    default:
      return "";
  }
}

// Only "url" supports the dynamic/editable mode in v1 — that's the one
// use case (restaurant menu, offer page, client landing page) where the
// destination actually needs to change after printing.
export const SUPPORTS_DYNAMIC = (type) => type === "url";
