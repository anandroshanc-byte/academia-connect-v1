"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Alert, Box, Button, Card, CardActionArea, CardContent, Chip, Container, Grid, InputAdornment, LinearProgress, Paper, Skeleton, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

type Match = { opportunity: any; eligible: boolean; isNearMatch: boolean; compatibilityScore: number; matchedSkills: any[]; missingSkills: any[]; weakSkills: any[]; reasonForRecommendation: string };

export default function StudentDashboard() {
  const { status } = useSession({ required: true });
  const [results, setResults] = useState<Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/opportunities", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || "Could not load opportunities");
      return response.json();
    }).then(setResults).catch((reason) => setError(reason.message));
  }, [status]);

  const filtered = useMemo(() => (results || []).filter((match) => {
    const opportunity = match.opportunity;
    const text = `${opportunity.title} ${opportunity.role} ${opportunity.company?.companyName || ""}`.toLowerCase();
    return (!query || text.includes(query.toLowerCase())) && (filter === "all" || (filter === "eligible" && match.eligible) || (filter === "near" && match.isNearMatch));
  }), [results, filter, query]);

  if (status === "loading" || (!results && !error)) return <Container maxWidth="lg" sx={{ py: 6 }}><Skeleton variant="rounded" height={170} /><Grid container spacing={2} sx={{ mt: 1 }}><Grid item xs={12} sm={4}><Skeleton variant="rounded" height={100} /></Grid><Grid item xs={12} sm={4}><Skeleton variant="rounded" height={100} /></Grid><Grid item xs={12} sm={4}><Skeleton variant="rounded" height={100} /></Grid></Grid></Container>;
  if (error) return <Container maxWidth="md" sx={{ py: 8 }}><Alert severity="error" action={<Button color="inherit" component={Link} href="/student/profile">Complete profile</Button>}>{error}</Alert></Container>;

  const eligible = (results || []).filter((match) => match.eligible).length;
  const nearMatches = (results || []).filter((match) => match.isNearMatch).length;
  return <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
    <Paper sx={{ p: { xs: 3, md: 5 }, color: "primary.contrastText", bgcolor: "primary.dark", borderRadius: 3, position: "relative", overflow: "hidden" }}>
      <Box sx={{ position: "relative", zIndex: 1, maxWidth: 760 }}><Typography variant="overline" sx={{ color: "rgba(255,255,255,.65)" }}>Student capability workspace</Typography><Typography variant="h1" sx={{ mt: 1, color: "inherit" }}>Find work that fits your readiness.</Typography><Typography sx={{ mt: 2, color: "rgba(255,255,255,.72)", maxWidth: 680 }}>Recommendations use eligibility, skills, evidence and career direction. Every match includes the reason behind its score.</Typography><Stack direction="row" spacing={1.5} sx={{ mt: 4, flexWrap: "wrap", rowGap: 1.5 }}><Metric label="Eligible matches" value={eligible} /><Metric label="Near matches" value={nearMatches} /><Button component={Link} href="/student/capability" variant="contained" color="secondary">Review capability</Button></Stack></Box>
    </Paper>
    <Grid container spacing={2} sx={{ mt: 2 }}><Grid item xs={12} md={4}><Summary title="Capability readiness" value="78%" detail="Evidence-backed profile signal" progress={78} href="/student/capability" /></Grid><Grid item xs={12} md={4}><Summary title="Application activity" value="1 shortlisted" detail="Track your active pipeline" href="/student/applications" /></Grid><Grid item xs={12} md={4}><Summary title="Priority improvement" value="Herbal formulation" detail="Close the gap to strengthen matches" href="/student/improve" /></Grid></Grid>
    <Paper sx={{ mt: 4, p: { xs: 2, md: 3 } }}><Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ md: "center" }}><Box><Typography variant="overline" color="primary">Opportunity intelligence</Typography><Typography variant="h2" sx={{ mt: 0.5 }}>Recommended for you</Typography></Box><TextField value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search opportunities" size="small" aria-label="Search opportunities" InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} sx={{ width: { xs: "100%", md: 280 } }} /></Stack><Tabs value={filter} onChange={(_, value) => setFilter(value)} sx={{ mt: 2, borderBottom: 1, borderColor: "divider" }} aria-label="Opportunity filters"><Tab label="All" value="all" /><Tab label={`Eligible (${eligible})`} value="eligible" /><Tab label={`Near matches (${nearMatches})`} value="near" /></Tabs><Grid container spacing={2} sx={{ mt: 1 }}>{filtered.length === 0 ? <Grid item xs={12}><Typography color="text.secondary" sx={{ py: 5, textAlign: "center" }}>No opportunities match this view.</Typography></Grid> : filtered.map((match) => <Grid item xs={12} md={6} key={match.opportunity.id}><OpportunityCard match={match} /></Grid>)}</Grid></Paper>
  </Container>;
}

function Metric({ label, value }: { label: string; value: number }) { return <Box sx={{ px: 2, py: 1.25, border: "1px solid rgba(255,255,255,.18)", borderRadius: 1.5, minWidth: 130 }}><Typography variant="h3" color="inherit">{value}</Typography><Typography variant="caption" sx={{ color: "rgba(255,255,255,.65)" }}>{label}</Typography></Box>; }

function Summary({ title, value, detail, progress, href }: { title: string; value: string; detail: string; progress?: number; href: string }) { return <Card><CardActionArea component={Link} href={href}><CardContent sx={{ minHeight: 150 }}><Typography variant="overline" color="text.secondary">{title}</Typography><Typography variant="h3" sx={{ mt: 1 }}>{value}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{detail}</Typography>{progress !== undefined && <LinearProgress variant="determinate" value={progress} sx={{ mt: 2 }} />}</CardContent></CardActionArea></Card>; }

function OpportunityCard({ match }: { match: Match }) { const opportunity = match.opportunity; return <Card><CardActionArea component={Link} href={`/student/opportunities/${opportunity.id}`}><CardContent><Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start"><Box><Chip label={opportunity.type.replaceAll("_", " ")} size="small" color="info" sx={{ mb: 1 }} /><Typography variant="h3">{opportunity.title}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{opportunity.company?.companyName} · {opportunity.location || "Flexible"}</Typography></Box><Chip label={`${match.compatibilityScore}/100`} color={match.eligible ? "success" : "warning"} /></Stack><Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}><Chip label={match.eligible ? "Eligibility checked" : "Eligibility needs review"} size="small" variant="outlined" /><Chip label={`${match.matchedSkills.length} skills matched`} size="small" variant="outlined" /><Chip label={`${match.missingSkills.length + match.weakSkills.length} gaps`} size="small" variant="outlined" /></Stack><Typography variant="body2" color="text.secondary" sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>{match.reasonForRecommendation}</Typography></CardContent></CardActionArea></Card>; }
