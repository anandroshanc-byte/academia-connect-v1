"use client";

import Link from "next/link";
import { Box, Button, Card, CardActionArea, CardContent, Chip, Container, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

type Metric = { label: string; value: string };
type Action = { label: string; href: string; primary?: boolean };
type Section = { title: string; body: string; href: string };

export default function WorkspaceLanding({ eyebrow, title, description, metrics, actions, sections }: { eyebrow: string; title: string; description: string; metrics: Metric[]; actions: Action[]; sections: Section[] }) {
  return <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
    <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, bgcolor: "#e8f0e8", border: 1, borderColor: "divider" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={3} justifyContent="space-between" alignItems={{ md: "flex-end" }}><Box sx={{ maxWidth: 760 }}><Typography variant="overline" color="primary">{eyebrow}</Typography><Typography variant="h1" sx={{ mt: 1 }}>{title}</Typography><Typography color="text.secondary" sx={{ mt: 2, maxWidth: 700 }}>{description}</Typography></Box><Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>{actions.map((action) => <Button key={action.href} component={Link} href={action.href} variant={action.primary ? "contained" : "outlined"}>{action.label}</Button>)}</Stack></Stack>
+    </Paper>
+    <Grid container spacing={2} sx={{ mt: 2 }}>{metrics.map((metric) => <Grid item xs={12} sm={4} key={metric.label}><Paper sx={{ p: 2.5, height: "100%" }}><Typography variant="h2">{metric.value}</Typography><Typography variant="overline" color="text.secondary">{metric.label}</Typography></Paper></Grid>)}</Grid>
    <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 5, mb: 2 }}><Box><Typography variant="overline" color="primary">Operational workspace</Typography><Typography variant="h2" sx={{ mt: 0.5 }}>Move the work forward</Typography></Box><Divider sx={{ flex: 1 }} /></Stack>
    <Grid container spacing={2}>{sections.map((section) => <Grid item xs={12} md={4} key={section.title}><Card sx={{ height: "100%" }}><CardActionArea component={Link} href={section.href} sx={{ height: "100%" }}><CardContent sx={{ minHeight: 190, display: "flex", flexDirection: "column" }}><Chip label="WORKSPACE" size="small" color="success" sx={{ alignSelf: "flex-start" }} /><Typography variant="h3" sx={{ mt: 2 }}>{section.title}</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{section.body}</Typography><Button color="primary" endIcon={<ArrowForwardIcon />} sx={{ mt: "auto", alignSelf: "flex-start", px: 0 }}>Open workspace</Button></CardContent></CardActionArea></Card></Grid>)}</Grid>
  </Container>;
}
