"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, Stack, Typography } from "@mui/material";

export default function DemoLauncher(){
  const [open,setOpen]=useState(false); const [loading,setLoading]=useState<string|null>(null); const [error,setError]=useState(""); const router=useRouter();
    async function enter(role: string) {
      setLoading(role);
      setError("");
      const result = await signIn("credentials", { redirect: false, demoRole: role });
      if (result?.error) {
        setError("Demo account is unavailable. Run the database seed first.");
        setLoading(null);
        return;
      }
      setOpen(false);
      setLoading(null);
      router.push(destination[role]);
    }
  return <>
    <Button variant="outlined" color="primary" onClick={() => setOpen(true)} aria-haspopup="dialog">Demo access</Button>
    <Dialog open={open} onClose={() => !loading && setOpen(false)} fullWidth maxWidth="md" aria-labelledby="demo-dialog-title">
      <DialogTitle id="demo-dialog-title" sx={{ pb: 1 }}><Stack spacing={1}><Chip label="JUDGE ACCESS" color="success" size="small" sx={{ alignSelf: "flex-start" }} /><Typography variant="h2">Enter a live workspace</Typography><Typography variant="body2" color="text.secondary">Five seeded accounts, real relationships and no password prompt.</Typography></Stack></DialogTitle>
      <DialogContent dividers><Grid container spacing={1.5}>{demos.map(([role, label, name, description]) => <Grid item xs={12} sm={6} md={4} key={role}>
        <Paper component="button" type="button" onClick={() => enter(role)} disabled={Boolean(loading)} variant="outlined" sx={{ width: "100%", minHeight: 170, textAlign: "left", p: 2, display: "flex", flexDirection: "column", alignItems: "flex-start", cursor: "pointer", bgcolor: "background.paper", borderColor: "divider", "&:hover": { borderColor: "primary.main", bgcolor: "#f2f7f1" }, "&:disabled": { opacity: 0.6, cursor: "wait" } }}>
          <Typography variant="overline" color="primary">{label}</Typography><Typography variant="h4" sx={{ mt: 2 }}>{name}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{description}</Typography><Typography variant="button" color="primary" sx={{ mt: "auto", pt: 2 }}>{loading === role ? "Entering..." : "Enter workspace"}</Typography>
        </Paper>
      </Grid>)}</Grid>{error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}</DialogContent>
      <DialogActions><Button onClick={() => setOpen(false)} disabled={Boolean(loading)}>Close</Button></DialogActions>
    </Dialog>
  </>;
}
const demos = [
  ["STUDENT", "Student", "Ananya Iyer", "Skills, gaps, improvement and matching"],
  ["ACADEMICIAN", "Academician", "Prof. Meera Nair", "Research, expertise and collaboration"],
  ["INSTITUTION", "Institution", "Dr. Anita Rao", "Demand, gaps, interventions and outcomes"],
  ["COMPANY", "Company", "Priya Menon", "Requirements, ranked talent and hiring"],
  ["ADMIN", "Admin", "Academia Connect Admin", "Verification, moderation and platform health"],
] as const;

const destination: Record<string, string> = {
  STUDENT: "/student/dashboard", 
  COMPANY: "/company/dashboard", 
  INSTITUTION: "/institution/dashboard", 
  ACADEMICIAN: "/academician/dashboard", 
  ADMIN: "/admin/dashboard",
};
