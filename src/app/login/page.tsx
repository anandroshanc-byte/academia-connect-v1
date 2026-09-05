"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Alert, Box, Button, CircularProgress, Container, Paper, Stack, TextField, Typography } from "@mui/material";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function handleSubmit(event: React.FormEvent) { event.preventDefault(); setError(null); setLoading(true); const result = await signIn("credentials", { redirect: false, email, password }); setLoading(false); if (result?.error) { setError("Invalid email or password."); return; } router.push("/"); router.refresh(); }
  return <Container maxWidth="sm" sx={{ py: { xs: 4, md: 9 } }}><Paper sx={{ p: { xs: 3, md: 5 } }}><Stack spacing={1}><Typography variant="overline" color="primary">ACADEMIA CONNECT</Typography><Typography variant="h1" sx={{ fontSize: "2.5rem" }}>Welcome back.</Typography><Typography color="text.secondary">Continue your capability, research or industry workspace.</Typography></Stack><Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}><Stack spacing={2.5}><TextField label="Email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} fullWidth autoComplete="email" /><TextField label="Password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} fullWidth autoComplete="current-password" />{error && <Alert severity="error">{error}</Alert>}<Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>{loading ? <><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />Logging in...</> : "Log in"}</Button></Stack></Box><Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: "center" }}>No account yet? <Box component={Link} href="/signup" sx={{ color: "primary.main", fontWeight: 800 }}>Create one</Box></Typography></Paper></Container>;
}
