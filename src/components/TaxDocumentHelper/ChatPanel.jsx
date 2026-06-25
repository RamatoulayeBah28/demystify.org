"use client";

import { useEffect, useRef, useState } from "react";

// Best-effort Somali voice detection for the Web Speech API. Availability
// depends entirely on the user's own device/OS voice packs, not on us —
// if none is found, we show that plainly rather than speak with the
// wrong voice and mispronounce Somali text.
function useSomaliVoice() {
  const [voice, setVoice] = useState(undefined); // undefined = still checking

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      const id = setTimeout(() => setVoice(null), 0);
      return () => clearTimeout(id);
    }
    const findVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      setVoice(voices.find((v) => v.lang?.toLowerCase().startsWith("so")) ?? null);
    };
    const id = setTimeout(findVoice, 0);
    window.speechSynthesis.addEventListener("voiceschanged", findVoice);
    return () => {
      clearTimeout(id);
      window.speechSynthesis.removeEventListener("voiceschanged", findVoice);
    };
  }, []);

  return voice;
}

// Hidden instruction that kicks off the conversation with a greeting
// grounded in the user's actual uploaded document (via the documentType/
// fieldValues already sent on every request), instead of a static,
// generic opening line. Written in English for clarity to the model, with
// an explicit language override since there's no real user message yet
// for the system prompt's "mirror the user's language" rule to read.
const KICKOFF_MESSAGE =
  "Please start our conversation: briefly introduce yourself, then summarize in 2-3 short sentences what you can see on the document I uploaded (use the document context provided), then invite me to ask a question. Reply in Somali.";

async function requestReply(messagesForApi, documentType, fieldValues) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: messagesForApi, documentType, fieldValues }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Chat request failed.");
  return data.reply;
}

export default function ChatPanel({ documentType, fieldValues }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const somaliVoice = useSomaliVoice();
  const listRef = useRef(null);
  const kickedOffRef = useRef(false);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, sending]);

  // Greets with a summary of the user's actual document the first time
  // the panel is opened, instead of showing a generic static line.
  useEffect(() => {
    if (!open || !documentType || messages.length > 0 || kickedOffRef.current) return;
    kickedOffRef.current = true;
    const kickoffMessages = [{ role: "user", content: KICKOFF_MESSAGE, hidden: true }];
    (async () => {
      setSending(true);
      setError(null);
      try {
        const reply = await requestReply(kickoffMessages, documentType, fieldValues);
        setMessages([...kickoffMessages, { role: "assistant", content: reply }]);
      } catch {
        setError("Waan ka xunnahay, khalad ayaa dhacay. Fadlan isku day mar kale.");
      } finally {
        setSending(false);
      }
    })();
  }, [open, documentType, fieldValues, messages.length]);

  const speak = (text) => {
    if (!somaliVoice) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = somaliVoice;
    utterance.lang = somaliVoice.lang;
    window.speechSynthesis.speak(utterance);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setError(null);
    try {
      const reply = await requestReply(nextMessages, documentType, fieldValues);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setError("Waan ka xunnahay, khalad ayaa dhacay. Fadlan isku day mar kale.");
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-[10px] rounded-full bg-dm-accent px-5 py-[14px] text-base font-semibold text-white shadow-[0_14px_36px_rgba(31,61,92,0.32)]"
      >
        <i className="fa-solid fa-comment-dots" /> Su&apos;aal weydii
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex h-[560px] w-[380px] flex-col overflow-hidden rounded-[20px] border border-dm-line bg-dm-panel shadow-[0_22px_60px_rgba(31,61,92,0.22)] animate-[dm-pop_0.18s_ease]">
      <div className="flex items-center justify-between border-b border-dm-line px-[18px] py-[14px]">
        <div>
          <div className="font-serif text-lg font-semibold leading-none text-dm-ink">Caawiye Canshuur</div>
          <div className="mt-0.5 text-xs text-dm-muted">Tax helper chat</div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-dm-bg text-sm text-dm-muted"
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-[16px] py-[14px]">
        {messages.filter((m) => !m.hidden).map((m, i) => (
          <div key={i} className={`mb-3 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[280px] rounded-[14px] px-4 py-[10px] text-[15px] leading-[1.5] ${
                m.role === "user" ? "bg-dm-accent text-white" : "bg-dm-bg text-dm-ink"
              }`}
            >
              {m.content}
              {m.role === "assistant" && somaliVoice && (
                <button
                  type="button"
                  onClick={() => speak(m.content)}
                  className="mt-2 flex items-center gap-[6px] text-xs font-semibold text-dm-accent"
                >
                  <i className="fa-solid fa-volume-high" /> Dhageyso
                </button>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="mb-3 flex justify-start">
            <div className="rounded-[14px] bg-dm-bg px-4 py-[10px] text-[15px] text-dm-muted">...</div>
          </div>
        )}
        {error && (
          <div className="mb-3 rounded-[14px] bg-[#fdecec] px-4 py-3 text-[14px] leading-[1.5] text-[#8a2c2c]">
            {error}
          </div>
        )}
        {somaliVoice === null && (
          <div className="text-center text-[11px] text-dm-muted">
            Codka Soomaaliga lama helin aaladaadan. (Somali voice isn’t available on this device.)
          </div>
        )}
      </div>

      <div className="flex items-end gap-[10px] border-t border-dm-line p-[14px]">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Qor su’aalkaaga..."
          className="flex-1 resize-none rounded-[12px] border border-dm-line bg-dm-bg px-[14px] py-[10px] text-[15px] text-dm-ink outline-none"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !input.trim()}
          className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-full bg-dm-accent text-white disabled:opacity-40"
        >
          <i className="fa-solid fa-arrow-up" />
        </button>
      </div>
    </div>
  );
}
