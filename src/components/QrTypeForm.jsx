// src/components/QrTypeForm.jsx
// Drop this inside your existing generator UI. It swaps the input fields
// based on the selected QR type and reports the raw field values up —
// your parent then calls buildPayload(type, data) to get the QR string.

import { QR_TYPES } from "../lib/qrPayloads";

export default function QrTypeForm({ type, setType, data, setData }) {
  const set = (key) => (e) => setData({ ...data, [key]: e.target.value });

  return (
    <div className="qr-type-form">
      <label>
        QR type
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {QR_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      {type === "url" && (
        <label>
          URL
          <input type="text" placeholder="https://example.com" value={data.url || ""} onChange={set("url")} />
        </label>
      )}

      {type === "text" && (
        <label>
          Text
          <textarea rows={3} value={data.text || ""} onChange={set("text")} />
        </label>
      )}

      {type === "email" && (
        <>
          <label>
            To
            <input type="email" value={data.to || ""} onChange={set("to")} />
          </label>
          <label>
            Subject (optional)
            <input type="text" value={data.subject || ""} onChange={set("subject")} />
          </label>
          <label>
            Body (optional)
            <textarea rows={2} value={data.body || ""} onChange={set("body")} />
          </label>
        </>
      )}

      {type === "phone" && (
        <label>
          Phone number
          <input type="tel" placeholder="+91..." value={data.phone || ""} onChange={set("phone")} />
        </label>
      )}

      {type === "sms" && (
        <>
          <label>
            Phone number
            <input type="tel" value={data.phone || ""} onChange={set("phone")} />
          </label>
          <label>
            Message (optional)
            <textarea rows={2} value={data.message || ""} onChange={set("message")} />
          </label>
        </>
      )}

      {type === "wifi" && (
        <>
          <label>
            Network name (SSID)
            <input type="text" value={data.ssid || ""} onChange={set("ssid")} />
          </label>
          <label>
            Password
            <input type="text" value={data.password || ""} onChange={set("password")} />
          </label>
          <label>
            Security
            <select value={data.security || "WPA"} onChange={set("security")}>
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">None</option>
            </select>
          </label>
        </>
      )}

      {type === "vcard" && (
        <>
          <div className="row2">
            <label>
              First name
              <input type="text" value={data.firstName || ""} onChange={set("firstName")} />
            </label>
            <label>
              Last name
              <input type="text" value={data.lastName || ""} onChange={set("lastName")} />
            </label>
          </div>
          <label>
            Organization
            <input type="text" value={data.org || ""} onChange={set("org")} />
          </label>
          <label>
            Title
            <input type="text" value={data.title || ""} onChange={set("title")} />
          </label>
          <label>
            Phone
            <input type="tel" value={data.phone || ""} onChange={set("phone")} />
          </label>
          <label>
            Email
            <input type="email" value={data.email || ""} onChange={set("email")} />
          </label>
          <label>
            Website
            <input type="text" value={data.website || ""} onChange={set("website")} />
          </label>
        </>
      )}
    </div>
  );
}
