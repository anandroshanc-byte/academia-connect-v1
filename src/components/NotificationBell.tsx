"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<{ notifications: any[]; unreadCount: number }>({ notifications: [], unreadCount: 0 });
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch("/api/notifications", { cache: "no-store" });
    if (res.ok) setData(await res.json());
  }

  useEffect(() => {
    load();
    const refresh = () => { if (document.visibilityState === "visible") load(); };
    const timer = window.setInterval(refresh, 30000);
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); document.removeEventListener("mousedown", close); document.removeEventListener("visibilitychange", refresh); };
  }, []);

  async function markRead(id: string) {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setData((d) => ({ ...d, unreadCount: Math.max(0, d.unreadCount - (d.notifications.find(n => n.id === id)?.readAt ? 0 : 1)), notifications: d.notifications.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n) }));
  }

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
    setData((d) => ({ ...d, unreadCount: 0, notifications: d.notifications.map(n => ({ ...n, readAt: new Date().toISOString() })) }));
  }

  return <div className="relative" ref={ref}>
    <button aria-label={`Notifications${data.unreadCount ? `, ${data.unreadCount} unread` : ""}`} onClick={() => setOpen(v => !v)} className="relative w-10 h-10 rounded-xl border border-slate-200/70 bg-white/60 hover:bg-white grid place-items-center transition-colors">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5 text-slate-600"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
      {data.unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-4 h-4 px-1 rounded-full bg-brand-600 text-white text-[9px] font-bold grid place-items-center">{data.unreadCount > 9 ? "9+" : data.unreadCount}</span>}
    </button>
    {open && <div className="absolute right-0 top-12 w-[min(360px,calc(100vw-2rem))] card p-2 shadow-2xl z-50">
      <div className="flex items-center justify-between px-3 py-2"><div><p className="font-bold">Notifications</p><p className="text-[11px] text-slate-400">Recent activity and important updates</p></div>{data.unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-brand-600 font-semibold">Mark all read</button>}</div>
      <div className="max-h-96 overflow-auto mt-1">
        {data.notifications.length === 0 ? <p className="p-6 text-center text-sm text-slate-400">Nothing new. Humanity survives another day.</p> : data.notifications.map(n => {
          const content = <div className={`rounded-xl p-3 transition-colors ${n.readAt ? "" : "bg-brand-50/70"}`}><div className="flex gap-2"><span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.readAt ? "bg-slate-200" : "bg-brand-600"}`} /><div className="min-w-0"><p className="text-sm font-semibold text-ink">{n.title}</p><p className="text-xs text-slate-500 mt-0.5">{n.message}</p><p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p></div></div></div>;
          return n.href ? <Link href={n.href} key={n.id} onClick={() => !n.readAt && markRead(n.id)}>{content}</Link> : <div key={n.id} onClick={() => !n.readAt && markRead(n.id)}>{content}</div>;
        })}
      </div>
    </div>}
  </div>;
}
