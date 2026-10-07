// src/pages/Dashboard.jsx
// Mount at route path "/dashboard". Lists every dynamic link you've
// created, live scan counts included, with inline destination editing.

import { useEffect, useState } from "react";
import { useAuth } from "../lib/useAuth";
import { subscribeToMyLinks, updateDestination, renameLink, deleteLink, dynamicUrlFor } from "../lib/links";

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
    } catch {
      setError("Couldn't sign in. Check your email and password.");
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 320, margin: "80px auto", display: "grid", gap: 10 }}>
      <h2>Dashboard login</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p style={{ color: "#C1613D", fontSize: 13 }}>{error}</p>}
      <button type="submit">Sign in</button>
    </form>
  );
}

function LinkRow({ link }) {
  const [destination, setDestination] = useState(link.destination);
  const [saved, setSaved] = useState(false);
  const url = dynamicUrlFor(link.id);

  const save = async () => {
    if (destination === link.destination) return;
    await updateDestination(link.id, destination);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <tr>
      <td>
        <input
          type="text"
          defaultValue={link.label}
          onBlur={(e) => e.target.value !== link.label && renameLink(link.id, e.target.value)}
          style={{ width: 140 }}
        />
      </td>
      <td>
        <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} onBlur={save} style={{ width: 240 }} />
        {saved && <span style={{ color: "#5DCAA5", fontSize: 12, marginLeft: 6 }}>saved</span>}
      </td>
      <td style={{ textAlign: "center" }}>{link.scans ?? 0}</td>
      <td>
        <a href={url} target="_blank" rel="noreferrer">
          {url.replace(window.location.origin, "")}
        </a>
      </td>
      <td>
        <button onClick={() => navigator.clipboard.writeText(url)}>Copy</button>
        <button onClick={() => deleteLink(link.id)} style={{ marginLeft: 6 }}>
          Delete
        </button>
      </td>
    </tr>
  );
}

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const [links, setLinks] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToMyLinks(user.uid, setLinks);
    return unsub;
  }, [user]);

  if (loading) return null;
  if (!user) return <LoginForm />;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Your QR links</h2>
        <button onClick={logout}>Sign out</button>
      </div>
      {links.length === 0 ? (
        <p>No dynamic QR codes yet — create one as "editable" from the generator.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: 12, color: "#888" }}>
              <th>Label</th>
              <th>Destination</th>
              <th>Scans</th>
              <th>QR link</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <LinkRow key={link.id} link={link} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
