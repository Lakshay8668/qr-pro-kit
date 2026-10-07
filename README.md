# QR Pro Kit — dynamic links, 7 QR types, logo + scan tracking

Drop these files into your existing `qrcodegenerator-tan-one` Vite+React
project. This kit adds everything that turns a plain QR image generator
into a real product:

- Editable/dynamic links (edit the destination after the QR is printed)
- 7 QR types: URL, text, email, phone, SMS, Wi-Fi, vCard
- Logo embedding (auto-forces high error correction so it still scans)
- Scan counts per link
- A simple login-gated dashboard to manage every QR you've made

## 1. Install dependencies

```
npm install firebase react-router-dom qrcode
```

## 2. Create the Firebase project (5 min, free)

1. Go to https://console.firebase.google.com → **Add project**
2. Once created, click the **</>** (web app) icon → register the app →
   copy the `firebaseConfig` values into your `.env` file (see
   `.env.example` in this kit — rename to `.env`)
3. In the left sidebar: **Build → Firestore Database → Create database**
   → start in **production mode**
4. **Build → Authentication → Get started → Email/Password** → enable it
5. Still in Authentication → **Users** tab → **Add user** → create
   yourself an account (this is the only login the dashboard accepts —
   no public sign-up, by design)
6. Back in Firestore → **Rules** tab → paste the contents of
   `firestore.rules` from this kit → **Publish**

## 3. Where these files go

Copy the `src/` contents straight into your project's `src/` folder,
matching the same subfolders (`lib/`, `components/`, `pages/`).

## 4. Wire up routing

Your generator currently has no router. Add one in `main.jsx` or `App.jsx`:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App"; // your existing generator UI
import Dashboard from "./pages/Dashboard";
import RedirectHandler from "./pages/RedirectHandler";

<BrowserRouter>
  <Routes>
    <Route path="/" element={<App />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/q/:id" element={<RedirectHandler />} />
  </Routes>
</BrowserRouter>
```

On Vercel, add a `vercel.json` with a rewrite so deep links like
`/q/abc123` and `/dashboard` don't 404 on refresh:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

## 5. Wire it into your generator form

In your existing generator component:

```jsx
import { useState } from "react";
import QrTypeForm from "./components/QrTypeForm";
import QrCanvas, { downloadCanvasPng } from "./components/QrCanvas";
import { buildPayload, SUPPORTS_DYNAMIC } from "./lib/qrPayloads";
import { createLink, dynamicUrlFor } from "./lib/links";
import { useAuth } from "./lib/useAuth";

const [type, setType] = useState("url");
const [data, setData] = useState({});
const [isDynamic, setIsDynamic] = useState(false);
const [payload, setPayload] = useState("");
const { user } = useAuth();

async function handleGenerate() {
  if (isDynamic && SUPPORTS_DYNAMIC(type) && user) {
    const id = await createLink({ destination: data.url, label: data.url, ownerId: user.uid });
    setPayload(dynamicUrlFor(id));
  } else {
    setPayload(buildPayload(type, data));
  }
}

// <QrTypeForm type={type} setType={setType} data={data} setData={setData} />
// {SUPPORTS_DYNAMIC(type) && (
//   <label><input type="checkbox" checked={isDynamic} onChange={e => setIsDynamic(e.target.checked)} />
//     Make this editable (requires sign-in)</label>
// )}
// <button onClick={handleGenerate}>Generate QR Code</button>
// {payload && <QrCanvas value={payload} fgColor={color} bgColor={bgColor} logoSrc={logoDataUrl} />}
```

For the logo upload, read the file as a data URL with a plain
`FileReader` and pass it as `logoSrc` to `QrCanvas`.

## Notes

- Only **URL** type supports dynamic/editable mode in v1 — that's the
  one case (menus, offers, client landing pages) where the destination
  actually needs to change after printing. Wi-Fi/vCard/etc. stay static.
- `/q/:id` is a client-side redirect (loads your app, looks up Firestore,
  then forwards the phone). It adds a fraction of a second vs a pure
  server redirect — invisible in practice, and needs zero server infra.
- Dashboard is single-admin only for now (just you). If you later want to
  give each client their own login, that's a bigger step — say the word
  and I'll build the multi-tenant version.
