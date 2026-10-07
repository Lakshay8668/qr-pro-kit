// src/lib/links.js
// All reads/writes for dynamic (editable) QR links live here.
// Collection: "links"  { destination, label, scans, createdAt, ownerId }

import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";

const linksCol = collection(db, "links");

// Create a new dynamic link, returns the new doc's short id.
export async function createLink({ destination, label, ownerId }) {
  const docRef = await addDoc(linksCol, {
    destination,
    label: label || "Untitled",
    scans: 0,
    ownerId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Build the actual URL that gets encoded into the QR image.
export function dynamicUrlFor(id) {
  return `${window.location.origin}/q/${id}`;
}

// Used by the /q/:id redirect page.
export async function resolveAndTrack(id) {
  const ref = doc(db, "links", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  // Fire-and-forget scan counter — don't block the redirect on this.
  updateDoc(ref, { scans: increment(1), lastScannedAt: serverTimestamp() }).catch(() => {});
  return snap.data();
}

export async function updateDestination(id, destination) {
  await updateDoc(doc(db, "links", id), { destination });
}

export async function renameLink(id, label) {
  await updateDoc(doc(db, "links", id), { label });
}

export async function deleteLink(id) {
  await deleteDoc(doc(db, "links", id));
}

// Live list of links for the dashboard, newest first.
export function subscribeToMyLinks(ownerId, callback) {
  const q = query(linksCol, where("ownerId", "==", ownerId));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => {
      const aa = a.createdAt?.toMillis?.() || 0;
      const bb = b.createdAt?.toMillis?.() || 0;
      return bb - aa;
    });
    callback(rows);
  });
}
