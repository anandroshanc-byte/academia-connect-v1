"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, Chip, CircularProgress, Container, Grid, Paper, Stack, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import GavelIcon from "@mui/icons-material/Gavel";
import DemoReset from "@/components/DemoReset";

type QueueItem = { id: string; companyName?: string; institutionName?: string; verificationStatus: string; user?: { name: string; email: string } };
type Opportunity = { id: string; title: string; approvalStatus: string; type: string; company?: { companyName: string; user?: { name: string; email: string } } };
type AdminData = { companies: QueueItem[]; institutions: QueueItem[]; opportunities: Opportunity[] };

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData>({ companies: [], institutions: [], opportunities: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [verification, opportunities] = await Promise.all([fetch("/api/admin/verification", { cache: "no-store" }), fetch("/api/admin/opportunities", { cache: "no-store" })]);
      if (!verification.ok || !opportunities.ok) throw new Error("Admin data could not be loaded.");
      const verificationData = await verification.json();
      setData({ ...verificationData, opportunities: await opportunities.json() });
      setError("");
    } catch (reason: any) { setError(reason.message || "Admin data could not be loaded."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function decide(type: "COMPANY" | "INSTITUTION", id: string, decision: "VERIFIED" | "REJECTED") {
    setBusy(id);
    const response = await fetch("/api/admin/verification", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, id, decision }) });
    setBusy("");
    if (!response.ok) setError((await response.json().catch(() => ({}))).error || "Verification update failed.");
    await load();
  }

  async function moderate(id: string, decision: "APPROVED" | "REJECTED") {
    setBusy(id);
    const response = await fetch("/api/admin/opportunities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, decision }) });
    setBusy("");
    if (!response.ok) setError((await response.json().catch(() => ({}))).error || "Moderation update failed.");
    await load();
  }

  const pending = data.opportunities.filter((item) => item.approvalStatus === "PENDING").length;
  const verified = data.companies.filter((item) => item.verificationStatus === "VERIFIED").length + data.institutions.filter((item) => item.verificationStatus === "VERIFIED").length;
  return <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
    <Paper sx={{ p: { xs: 3, md: 5 }, bgcolor: "primary.dark", color: "primary.contrastText", borderRadius: 3 }}><Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={3} alignItems={{ md: "center" }}><Box><Typography variant="overline" sx={{ color: "rgba(255,255,255,.68)" }}>Admin control center</Typography><Typography variant="h1" sx={{ mt: 1, color: "inherit" }}>Trust, moderation and platform health.</Typography><Typography sx={{ mt: 2, maxWidth: 720, color: "rgba(255,255,255,.72)" }}>Review the live demo ecosystem, approve opportunity publishing, and keep organization verification transparent.</Typography></Box><GavelIcon sx={{ fontSize: 64, color: "secondary.light", display: { xs: "none", md: "block" } }} /></Stack></Paper>
    <Grid container spacing={2} sx={{ mt: 2 }}><Grid item xs={12} sm={4}><Metric value={data.companies.length + data.institutions.length} label="Demo organizations" /></Grid><Grid item xs={12} sm={4}><Metric value={verified} label="Verified organizations" /></Grid><Grid item xs={12} sm={4}><Metric value={pending} label="Awaiting moderation" /></Grid></Grid>
    {error && <Alert severity="error" sx={{ mt: 2 }} action={<Button color="inherit" onClick={load}>Retry</Button>}>{error}</Alert>}
    {loading ? <Box sx={{ display: "grid", placeItems: "center", py: 8 }}><CircularProgress /></Box> : <Grid container spacing={2} sx={{ mt: 2 }}><Grid item xs={12} md={6}><Queue title="Company verification" items={data.companies} type="COMPANY" busy={busy} decide={decide} /></Grid><Grid item xs={12} md={6}><Queue title="Institution verification" items={data.institutions} type="INSTITUTION" busy={busy} decide={decide} /></Grid><Grid item xs={12}><Paper sx={{ p: { xs: 2, md: 3 } }} id="moderation"><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="overline" color="primary">Opportunity moderation</Typography><Typography variant="h2" sx={{ mt: 0.5 }}>Publishing control</Typography></Box><Chip label={`${data.opportunities.length} demo records`} color="info" /></Stack><Stack spacing={1.5} sx={{ mt: 2 }}>{data.opportunities.map((item) => <Paper key={item.id} variant="outlined" sx={{ p: 2 }}><Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}><Box><Typography variant="h4">{item.title}</Typography><Typography variant="body2" color="text.secondary">{item.company?.companyName} · {item.type.replaceAll("_", " ")}</Typography></Box><Stack direction="row" spacing={1} alignItems="center"><Chip label={item.approvalStatus} color={item.approvalStatus === "APPROVED" ? "success" : item.approvalStatus === "PENDING" ? "warning" : "error"} size="small" />{item.approvalStatus === "PENDING" && <><Button size="small" variant="contained" disabled={busy === item.id} onClick={() => moderate(item.id, "APPROVED")}>Approve</Button><Button size="small" color="error" variant="outlined" disabled={busy === item.id} onClick={() => moderate(item.id, "REJECTED")}>Reject</Button></>}</Stack></Stack></Paper>)}</Stack></Paper></Grid></Grid>}
    <Box sx={{ mt: 3 }}><DemoReset /></Box>
  </Container>;
}

function Metric({ value, label }: { value: number; label: string }) { return <Paper sx={{ p: 2.5 }}><Typography variant="h2">{value}</Typography><Typography variant="overline" color="text.secondary">{label}</Typography></Paper>; }

function Queue({ title, items, type, busy, decide }: { title: string; items: QueueItem[]; type: "COMPANY" | "INSTITUTION"; busy: string; decide: (type: "COMPANY" | "INSTITUTION", id: string, decision: "VERIFIED" | "REJECTED") => void }) { return <Paper sx={{ p: { xs: 2, md: 3 }, height: "100%" }} id={type === "COMPANY" ? "verification" : undefined}><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="overline" color="primary">Verification queue</Typography><Typography variant="h2" sx={{ mt: 0.5 }}>{title}</Typography></Box><Chip label={items.length} color="info" /></Stack><Stack spacing={1.5} sx={{ mt: 2 }}>{items.length === 0 ? <Typography color="text.secondary">No demo records found.</Typography> : items.map((item) => <Paper key={item.id} variant="outlined" sx={{ p: 2 }}><Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5}><Box><Typography variant="h4">{type === "COMPANY" ? item.companyName : item.institutionName}</Typography><Typography variant="body2" color="text.secondary">{item.user?.name} · {item.user?.email}</Typography></Box><Stack direction="row" spacing={1} alignItems="center"><Chip label={item.verificationStatus} size="small" color={item.verificationStatus === "VERIFIED" ? "success" : item.verificationStatus === "PENDING" ? "warning" : "error"} icon={item.verificationStatus === "VERIFIED" ? <CheckCircleOutlineIcon /> : undefined} />{item.verificationStatus === "PENDING" && <><Button size="small" variant="contained" disabled={busy === item.id} onClick={() => decide(type, item.id, "VERIFIED")}>Approve</Button><Button size="small" variant="outlined" color="error" disabled={busy === item.id} onClick={() => decide(type, item.id, "REJECTED")}>Reject</Button></>}</Stack></Stack></Paper>)}</Stack></Paper>; }
