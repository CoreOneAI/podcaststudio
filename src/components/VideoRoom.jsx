import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

export default function VideoRoom() {
  const { roomName } = useParams();
  const videoRef = useRef(null);
  const [hasCam, setHasCam] = useState(null); // null | true | false
  const [camOn, setCamOn] = useState(false);

  const inviteUrl = useMemo(() => {
    const base = window.location.origin;
    return `${base}/video-room/${encodeURIComponent(roomName || "room")}`;
  }, [roomName]);

  const stopStream = () => {
    const el = videoRef.current;
    if (el?.srcObject) {
      const stream = el.srcObject;
      stream.getTracks().forEach((t) => t.stop());
      el.srcObject = null;
    }
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setHasCam(false);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setHasCam(true);
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamOn(true);
    } catch (e) {
      console.error("Camera error:", e);
      setHasCam(false);
      setCamOn(false);
    }
  };

  const toggleCamera = async () => {
    if (camOn) {
      stopStream();
      setCamOn(false);
      return;
    }
    await startCamera();
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      alert("Invite link copied.");
    } catch {
      prompt("Copy this invite link:", inviteUrl);
    }
  };

  useEffect(() => {
    return () => stopStream();
  }, []);

  const shareText = encodeURIComponent(`Join my interview room: ${inviteUrl}`);
  const whatsappShare = `https://wa.me/?text=${shareText}`;
  const googleMeet = `https://meet.google.com/new`;

  return (
    <div style={{ padding: 16, maxWidth: 980, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Guest Interview Room</h1>
          <p style={{ marginTop: 6, opacity: 0.8 }}>
            Room: <b>{roomName}</b>
          </p>
        </div>
        <button onClick={copyInvite} style={{ padding: "10px 12px", borderRadius: 10 }}>
          Copy Invite Link
        </button>
      </header>

      <div
        style={{
          marginTop: 16,
          borderRadius: 16,
          overflow: "hidden",
          background: "#111827",
          border: "1px solid #1f2937",
        }}
      >
        <div style={{ padding: 12, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ opacity: 0.85 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8, opacity: 0.8 }}>
              Camera Preview
            </div>
            <div style={{ fontSize: 14 }}>
              {hasCam === false ? "Camera unavailable / blocked" : camOn ? "Camera is on" : "Camera is off"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={toggleCamera} style={{ padding: "10px 12px", borderRadius: 10 }}>
              {camOn ? "Turn Camera Off" : "Turn Camera On"}
            </button>

            <a
              href={googleMeet}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                display: "inline-block",
                background: "#374151",
                color: "white",
                textDecoration: "none",
              }}
            >
              Start Google Meet
            </a>

            <a
              href={whatsappShare}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                display: "inline-block",
                background: "#065f46",
                color: "white",
                textDecoration: "none",
              }}
            >
              Share via WhatsApp
            </a>
          </div>
        </div>

        <div style={{ position: "relative", aspectRatio: "16 / 9", background: "#0b1220" }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", display: camOn ? "block" : "none" }}
          />
          {!camOn && (
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#9ca3af", padding: 18, textAlign: "center" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#e5e7eb" }}>Ready when you are</div>
                <div style={{ marginTop: 8 }}>
                  Turn on camera for a preview, or use the buttons above to launch a meeting and share the invite.
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: 12, borderTop: "1px solid #1f2937" }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Invite Link</div>
          <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13, wordBreak: "break-all" }}>
            {inviteUrl}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
            Vonage Video API can be added next (requires a secure token endpoint; don’t generate tokens in the browser).
          </div>
        </div>
      </div>
    </div>
  );
}
