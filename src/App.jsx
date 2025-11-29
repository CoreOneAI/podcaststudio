import React, { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const BUILD_STAMP =
  import.meta.env.VITE_BUILD_STAMP ||
  new Date().toISOString().slice(0, 10);

function getFirebaseConfig() {
  const cfg = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  };
  const missing = ["apiKey", "authDomain", "projectId", "appId"].filter(
    (k) => !cfg[k]
  );
  return { cfg, missing };
}

function useFirebase() {
  const { cfg, missing } = useMemo(() => getFirebaseConfig(), []);
  const ready = missing.length === 0;

  const app = useMemo(() => {
    if (!ready) return null;
    if (!getApps().length) return initializeApp(cfg);
    return getApps()[0];
  }, [ready, cfg]);

  const auth = useMemo(() => (app ? getAuth(app) : null), [app]);
  const db = useMemo(() => (app ? getFirestore(app) : null), [app]);

  return { ready, missing, app, auth, db };
}

function useAuth(auth) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setStatus("ready");
    });
    return () => unsub();
  }, [auth]);

  return { user, status };
}

function AppShell({ user, onSignOut, children }) {
  return (
    <div style={styles.shell}>
      <header style={styles.header}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>Encore Studio</div>

          <TopLink to="/dashboard">Dashboard</TopLink>
          <TopLink to="/shows">Shows</TopLink>
          <TopLink to="/guests">Guests</TopLink>
          <TopLink to="/stories">Story Inbox</TopLink>
          <TopLink to="/assistant">AI Assistant</TopLink>
          <TopLink to="/calendar">Calendar</TopLink>
          <TopLink to="/board">Board</TopLink>
          <TopLink to="/guide">Guide</TopLink>
          <TopLink to="/video-room">Video Room</TopLink>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontSize: 12, opacity: 0.85 }}>
            Build: <b>{BUILD_STAMP}</b>
          </div>
          {user ? (
            <button onClick={onSignOut} style={styles.button}>
              Sign out
            </button>
          ) : (
            <span style={{ fontSize: 12, opacity: 0.75 }}>Not signed in</span>
          )}
        </div>
      </header>

      <main style={styles.main}>{children}</main>
    </div>
  );
}

function TopLink({ to, children }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        textDecoration: "none",
        color: isActive ? "#93c5fd" : "#e5e7eb",
        fontWeight: 700,
      })}
    >
      {children}
    </NavLink>
  );
}

function RequireAuth({ user, status, children }) {
  const loc = useLocation();
  if (status !== "ready") return <div style={styles.card}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return children;
}

function Login({ auth }) {
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from || "/dashboard";

  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, pw);
      } else {
        await createUserWithEmailAndPassword(auth, email, pw);
      }
      nav(from, { replace: true });
    } catch (e2) {
      setErr(e2?.message || "Auth error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.center}>
      <div style={{ ...styles.card, maxWidth: 460 }}>
        <h2 style={{ marginTop: 0 }}>Sign in</h2>
        <p style={{ opacity: 0.8, marginTop: -6 }}>
          Use your team login to access the portal.
        </p>

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button
            style={{
              ...styles.chip,
              ...(mode === "signin" ? styles.chipActive : null),
            }}
            onClick={() => setMode("signin")}
            type="button"
          >
            Sign in
          </button>
          <button
            style={{
              ...styles.chip,
              ...(mode === "signup" ? styles.chipActive : null),
            }}
            onClick={() => setMode("signup")}
            type="button"
          >
            Create account
          </button>
        </div>

        <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            type="email"
            autoComplete="email"
            required
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
          />

          {err ? <div style={styles.error}>{err}</div> : null}

          <button disabled={busy} style={styles.primary} type="submit">
            {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
          Public story submission page:{" "}
          <NavLink to="/share-story" style={{ color: "#93c5fd" }}>
            /share-story
          </NavLink>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ db }) {
  const [showsCount, setShowsCount] = useState(0);
  const [guestsCount, setGuestsCount] = useState(0);
  const [storiesCount, setStoriesCount] = useState(0);

  useEffect(() => {
    const qs = query(collection(db, "shows"));
    const qg = query(collection(db, "guests"));
    const qst = query(collection(db, "stories"));
    const u1 = onSnapshot(qs, (snap) => setShowsCount(snap.size));
    const u2 = onSnapshot(qg, (snap) => setGuestsCount(snap.size));
    const u3 = onSnapshot(qst, (snap) => setStoriesCount(snap.size));
    return () => (u1(), u2(), u3());
  }, [db]);

  return (
    <div style={{ display: "grid", gap: 14, maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ margin: 0 }}>Dashboard</h2>
      <div style={styles.grid3}>
        <Stat title="Shows" value={showsCount} />
        <Stat title="Guests" value={guestsCount} />
        <Stat title="Stories" value={storiesCount} />
      </div>

      <div style={styles.card}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>What’s live right now</div>
        <div style={{ opacity: 0.8 }}>
          Firebase Auth + Firestore are active. This portal is the real deployed app (not a one-page demo).
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div style={styles.card}>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 900 }}>{value}</div>
    </div>
  );
}

function Shows({ db }) {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    const qy = query(collection(db, "shows"), orderBy("createdAt", "desc"));
    return onSnapshot(qy, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [db]);

  const create = async (e) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    await addDoc(collection(db, "shows"), {
      title: cleanTitle,
      description: desc.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: "active",
    });
    setTitle("");
    setDesc("");
  };

  const remove = async (id) => deleteDoc(doc(db, "shows", id));

  return (
    <div style={styles.page}>
      <h2 style={{ marginTop: 0 }}>Shows</h2>

      <div style={styles.card}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Create show</div>
        <form onSubmit={create} style={{ display: "grid", gap: 10 }}>
          <input
            style={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Show title"
            required
          />
          <textarea
            style={{ ...styles.input, minHeight: 90 }}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description (optional)"
          />
          <button style={styles.primary} type="submit">
            Create show
          </button>
        </form>
      </div>

      <div style={styles.card}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>All shows</div>
        {items.length === 0 ? (
          <div style={{ opacity: 0.8 }}>No shows yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {items.map((s) => (
              <div key={s.id} style={styles.row}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>{s.title}</div>
                  {s.description ? (
                    <div style={{ opacity: 0.75, marginTop: 4 }}>{s.description}</div>
                  ) : null}
                </div>
                <button style={styles.button} onClick={() => remove(s.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Guests({ db }) {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const qy = query(collection(db, "guests"), orderBy("createdAt", "desc"));
    return onSnapshot(qy, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [db]);

  const add = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "guests"), {
      name: name.trim(),
      email: email.trim(),
      createdAt: serverTimestamp(),
    });
    setName("");
    setEmail("");
  };

  const remove = async (id) => deleteDoc(doc(db, "guests", id));

  return (
    <div style={styles.page}>
      <h2 style={{ marginTop: 0 }}>Guests</h2>

      <div style={styles.card}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Add guest</div>
        <form onSubmit={add} style={{ display: "grid", gap: 10 }}>
          <input
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            required
          />
          <input
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional)"
            type="email"
          />
          <button style={styles.primary} type="submit">
            Save guest
          </button>
        </form>
      </div>

      <div style={styles.card}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Guest list</div>
        {items.length === 0 ? (
          <div style={{ opacity: 0.8 }}>No guests yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {items.map((g) => (
              <div key={g.id} style={styles.row}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>{g.name}</div>
                  {g.email ? <div style={{ opacity: 0.75 }}>{g.email}</div> : null}
                </div>
                <button style={styles.button} onClick={() => remove(g.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StoriesInbox({ db }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const qy = query(collection(db, "stories"), orderBy("createdAt", "desc"));
    return onSnapshot(qy, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [db]);

  const setStatus = async (id, status) => {
    await updateDoc(doc(db, "stories", id), { status, updatedAt: serverTimestamp() });
  };

  const remove = async (id) => deleteDoc(doc(db, "stories", id));

  return (
    <div style={styles.page}>
      <h2 style={{ marginTop: 0 }}>Story Inbox</h2>
      <div style={styles.card}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>
          Public submissions automatically land here
        </div>
        <div style={{ opacity: 0.8 }}>
          The public form is at <b>/share-story</b>.
        </div>
      </div>

      <div style={styles.card}>
        {items.length === 0 ? (
          <div style={{ opacity: 0.8 }}>No stories submitted yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((s) => (
              <div key={s.id} style={{ ...styles.card, background: "#0b1220" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 900 }}>{s.title || "Untitled story"}</div>
                    <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                      From: {s.name || "Anonymous"} {s.email ? `(${s.email})` : ""}
                      {" • "}
                      Status: <b>{s.status || "new"}</b>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button style={styles.button} onClick={() => setStatus(s.id, "reviewed")}>
                      Mark reviewed
                    </button>
                    <button style={styles.button} onClick={() => setStatus(s.id, "published")}>
                      Mark published
                    </button>
                    <button style={styles.button} onClick={() => remove(s.id)}>
                      Delete
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: 10, whiteSpace: "pre-wrap", opacity: 0.9 }}>
                  {s.body || "(No content)"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ShareStory({ db }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    const safeBody = body.trim();
    if (!safeBody) {
      setErr("Please write your story.");
      return;
    }
    try {
      await addDoc(collection(db, "stories"), {
        name: name.trim(),
        email: email.trim(),
        title: title.trim(),
        body: safeBody,
        status: "new",
        publicId: uuidv4(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSent(true);
      setName("");
      setEmail("");
      setTitle("");
      setBody("");
    } catch (e2) {
      setErr(e2?.message || "Could not submit story.");
    }
  };

  return (
    <div style={styles.center}>
      <div style={{ ...styles.card, maxWidth: 900 }}>
        <h2 style={{ marginTop: 0 }}>Share your story</h2>
        <p style={{ opacity: 0.8, marginTop: -6 }}>
          Your submission goes directly into the Encore Studio Story Inbox.
        </p>

        {sent ? <div style={styles.ok}>Submitted. Thank you!</div> : null}
        {err ? <div style={styles.error}>{err}</div> : null}

        <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
          <div style={styles.grid2}>
            <input
              style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
            />
            <input
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional)"
              type="email"
            />
          </div>

          <input
            style={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Story title (optional)"
          />

          <textarea
            style={{ ...styles.input, minHeight: 180 }}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your story…"
            required
          />

          <button style={styles.primary} type="submit">
            Submit story
          </button>
        </form>

        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
          Note: For public submission to work, your Firestore rules must allow
          <b> create</b> on <b>/stories</b> without login (example provided).
        </div>
      </div>
    </div>
  );
}

function AIAssistant() {
  const [mode, setMode] = useState("manual"); // manual | ai
  const [prompt, setPrompt] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const runAI = async () => {
    setErr("");
    setOut("");
    if (!geminiKey) {
      setErr("Missing VITE_GEMINI_API_KEY (Netlify env var).");
      return;
    }
    const p = prompt.trim();
    if (!p) return;

    setBusy(true);
    try {
      // WARNING: this calls Gemini from the browser and exposes your key in the client bundle.
      // Production-safe approach: proxy through a Netlify Function endpoint.
      const url =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        encodeURIComponent(geminiKey);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: p }] }],
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Gemini error: ${res.status} ${t}`);
      }

      const json = await res.json();
      const text =
        json?.candidates?.[0]?.content?.parts?.map((x) => x?.text).join("") ||
        "No response.";
      setOut(text);
    } catch (e2) {
      setErr(e2?.message || "AI request failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={{ marginTop: 0 }}>AI Assistant</h2>

      <div style={styles.card}>
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <button
            style={{ ...styles.chip, ...(mode === "manual" ? styles.chipActive : null) }}
            onClick={() => setMode("manual")}
            type="button"
          >
            Manual
          </button>
          <button
            style={{ ...styles.chip, ...(mode === "ai" ? styles.chipActive : null) }}
            onClick={() => setMode("ai")}
            type="button"
          >
            AI Generate
          </button>
        </div>

        <textarea
          style={{ ...styles.input, minHeight: 150 }}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            mode === "manual"
              ? "Write your notes / outline…"
              : "Ask AI to generate episode ideas, titles, guest questions, etc…"
          }
        />

        {mode === "ai" ? (
          <button style={styles.primary} onClick={runAI} disabled={busy}>
            {busy ? "Thinking…" : "Generate"}
          </button>
        ) : (
          <div style={{ opacity: 0.8, marginTop: 10 }}>
            Manual mode stores nothing automatically. (We can wire saves to Firestore next.)
          </div>
        )}

        {err ? <div style={styles.error}>{err}</div> : null}
        {out ? (
          <div style={{ ...styles.card, marginTop: 12, whiteSpace: "pre-wrap" }}>
            {out}
          </div>
        ) : null}

        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 10 }}>
          Security note: calling Gemini directly from the browser exposes your API key. If you want it locked down,
          we’ll move this to a Netlify Function.
        </div>
      </div>
    </div>
  );
}

function CalendarPage() {
  return (
    <div style={styles.page}>
      <h2 style={{ marginTop: 0 }}>Calendar</h2>
      <div style={styles.card}>
        This page is ready to wire to Firestore events. (Next step: create events collection + UI.)
      </div>
    </div>
  );
}

function BoardPage() {
  return (
    <div style={styles.page}>
      <h2 style={{ marginTop: 0 }}>Board</h2>
      <div style={styles.card}>
        Kanban board wiring is next (columns + cards in Firestore).
      </div>
    </div>
  );
}

function GuidePage() {
  return (
    <div style={styles.page}>
      <h2 style={{ marginTop: 0 }}>User Guide</h2>
      <div style={styles.card}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Quick start</div>
        <ol style={{ marginTop: 0, opacity: 0.9 }}>
          <li>Sign in → create a show</li>
          <li>Add guests</li>
          <li>Collect stories via /share-story</li>
          <li>Review stories in Story Inbox</li>
        </ol>
      </div>
    </div>
  );
}

function VideoRoomPage() {
  return (
    <div style={styles.page}>
      <h2 style={{ marginTop: 0 }}>Guest Interview Room</h2>
      <div style={styles.card}>
        Your package includes <b>twilio-video</b>, but proper video rooms require a secure token server.
        Next step is adding a Netlify Function to mint Twilio tokens.
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={styles.page}>
      <h2 style={{ marginTop: 0 }}>Not Found</h2>
      <div style={styles.card}>That route doesn’t exist.</div>
    </div>
  );
}

export default function App() {
  const { ready, missing, auth, db } = useFirebase();
  const { user, status } = useAuth(auth);

  if (!ready) {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <h2 style={{ marginTop: 0 }}>Firebase not configured</h2>
          <div style={{ opacity: 0.85 }}>
            Missing: <b>{missing.join(", ")}</b>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
            In Netlify, set Vite env vars with the <b>VITE_</b> prefix (example: VITE_FIREBASE_API_KEY).
          </div>
        </div>
      </div>
    );
  }

  const doSignOut = async () => {
    await signOut(auth);
  };

  return (
    <BrowserRouter>
      <AppShell user={user} onSignOut={doSignOut}>
        <Routes>
          {/* Public */}
          <Route path="/share-story" element={<ShareStory db={db} />} />
          <Route path="/login" element={<Login auth={auth} />} />

          {/* Protected */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth user={user} status={status}>
                <Dashboard db={db} />
              </RequireAuth>
            }
          />
          <Route
            path="/shows"
            element={
              <RequireAuth user={user} status={status}>
                <Shows db={db} />
              </RequireAuth>
            }
          />
          <Route
            path="/guests"
            element={
              <RequireAuth user={user} status={status}>
                <Guests db={db} />
              </RequireAuth>
            }
          />
          <Route
            path="/stories"
            element={
              <RequireAuth user={user} status={status}>
                <StoriesInbox db={db} />
              </RequireAuth>
            }
          />
          <Route
            path="/assistant"
            element={
              <RequireAuth user={user} status={status}>
                <AIAssistant />
              </RequireAuth>
            }
          />
          <Route
            path="/calendar"
            element={
              <RequireAuth user={user} status={status}>
                <CalendarPage />
              </RequireAuth>
            }
          />
          <Route
            path="/board"
            element={
              <RequireAuth user={user} status={status}>
                <BoardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/guide"
            element={
              <RequireAuth user={user} status={status}>
                <GuidePage />
              </RequireAuth>
            }
          />
          <Route
            path="/video-room"
            element={
              <RequireAuth user={user} status={status}>
                <VideoRoomPage />
              </RequireAuth>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

const styles = {
  shell: { minHeight: "100vh", background: "#0b1220", color: "#e5e7eb" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid #1f2937",
    background: "#111827",
    position: "sticky",
    top: 0,
    zIndex: 10,
    flexWrap: "wrap",
    gap: 12,
  },
  main: { padding: 16 },
  page: { maxWidth: 1100, margin: "0 auto" },
  center: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 16,
    background: "#0b1220",
    color: "#e5e7eb",
  },
  card: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 16,
    padding: 16,
  },
  grid3: { display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" },
  grid2: { display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" },
  row: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #1f2937",
    background: "#0b1220",
  },
  label: { fontSize: 12, opacity: 0.85 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #374151",
    background: "#0b1220",
    color: "#e5e7eb",
    outline: "none",
  },
  button: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #374151",
    background: "#111827",
    color: "#e5e7eb",
    cursor: "pointer",
    fontWeight: 700,
  },
  primary: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #2563eb",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontWeight: 900,
    marginTop: 6,
  },
  chip: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid #374151",
    background: "#0b1220",
    color: "#e5e7eb",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 12,
  },
  chipActive: { borderColor: "#93c5fd", color: "#93c5fd" },
  error: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.35)",
    color: "#fecaca",
    fontSize: 13,
    whiteSpace: "pre-wrap",
  },
  ok: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    background: "rgba(34,197,94,0.12)",
    border: "1px solid rgba(34,197,94,0.35)",
    color: "#bbf7d0",
    fontSize: 13,
  },
};
