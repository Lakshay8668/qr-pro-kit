import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import QrTypeForm from "./components/QrTypeForm";
import QrCanvas, { downloadCanvasPng } from "./components/QrCanvas";
import { buildPayload, SUPPORTS_DYNAMIC } from "./lib/qrPayloads";
import { createLink, dynamicUrlFor } from "./lib/links";
import { useAuth } from "./lib/useAuth";

export default function App() {
  const [type, setType] = useState("url");
  const [data, setData] = useState({});
  const [isDynamic, setIsDynamic] = useState(false);
  const [payload, setPayload] = useState("");
  const [color, setColor] = useState("#111827");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [logo, setLogo] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const canvasRef = useRef(null);
  const { user } = useAuth();

  const generate = async () => {
    setError(""); setNotice("");
    const staticPayload = buildPayload(type, data);
    if (!staticPayload) { setError("Please fill in the required information."); return; }
    try {
      if (isDynamic) {
        if (!user) { setError("Sign in from Dashboard first to create an editable QR."); return; }
        if (!SUPPORTS_DYNAMIC(type)) { setError("Editable mode is currently available for Website / Link only."); return; }
        const id = await createLink({ destination: data.url.trim(), label: data.url.trim(), ownerId: user.uid });
        setPayload(dynamicUrlFor(id));
        setNotice("Editable QR created. You can change its destination from Dashboard.");
      } else {
        setPayload(staticPayload);
        setNotice("QR generated successfully.");
      }
    } catch (e) {
      setError(e?.message || "Could not generate QR. Check your Firebase configuration.");
    }
  };

  const uploadLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  };

  const download = () => {
    if (!canvasRef.current) return;
    downloadCanvasPng(canvasRef.current, `qr-${type}.png`);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">QR<span>Pro</span></Link>
        <nav><Link to="/dashboard">Dashboard</Link></nav>
      </header>
      <section className="hero">
        <div><p className="eyebrow">QR CODE GENERATOR</p><h1>Create QR codes that actually work for your business.</h1><p className="sub">Generate seven QR types, add your logo, download instantly, or create editable dynamic links.</p></div>
      </section>
      <section className="workspace">
        <div className="card form-card">
          <div className="card-title"><div><h2>Create QR</h2><p>Choose a type and enter your details.</p></div></div>
          <QrTypeForm type={type} setType={setType} data={data} setData={setData} />
          {SUPPORTS_DYNAMIC(type) && <label className="check"><input type="checkbox" checked={isDynamic} onChange={e => setIsDynamic(e.target.checked)} /> Make this QR editable later</label>}
          <div className="options-grid">
            <label>QR color<input type="color" value={color} onChange={e => setColor(e.target.value)} /></label>
            <label>Background<input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} /></label>
          </div>
          <label>Logo (optional)<input type="file" accept="image/*" onChange={uploadLogo} /></label>
          {error && <div className="alert error">{error}</div>}
          {notice && <div className="alert success">{notice}</div>}
          <button className="primary" onClick={generate}>Generate QR Code</button>
        </div>
        <div className="card preview-card">
          <div className="card-title"><div><h2>Preview</h2><p>{payload ? "Ready to download" : "Your QR will appear here"}</p></div></div>
          <div className="qr-stage">
            {payload ? <QrCanvas value={payload} size={300} fgColor={color} bgColor={bgColor} logoSrc={logo} ref={canvasRef} /> : <div className="empty-qr"><div>QR</div><span>Generate a code</span></div>}
          </div>
          <button className="secondary" disabled={!payload} onClick={download}>Download PNG</button>
          {payload && <p className="payload">{payload}</p>}
        </div>
      </section>
    </main>
  );
}
