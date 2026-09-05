"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  AppBar, Avatar, Box, Button, Chip, Divider, Drawer, IconButton,
  List, ListItemButton, ListItemText, Stack, Toolbar, Typography, useMediaQuery, useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationBell from "@/components/NotificationBell";
import DemoLauncher from "@/components/DemoLauncher";

type NavItem = [string, string];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const role = (session?.user as any)?.role as string | undefined;
  const isDemo = (session?.user as any)?.isDemo;
  const home = role === "STUDENT" ? "/student/dashboard" : role === "COMPANY" ? "/company/dashboard" : role === "INSTITUTION" ? "/institution/dashboard" : role === "ACADEMICIAN" ? "/academician/dashboard" : role === "ADMIN" ? "/admin/dashboard" : "/";
  const links: NavItem[] = role === "STUDENT"
    ? [["Dashboard", "/student/dashboard"], ["Capability", "/student/capability"], ["Assessment", "/student/assessment"], ["Improve", "/student/improve"], ["Opportunities", "/student/opportunities"], ["Applications", "/student/applications"], ["Profile", "/student/profile"]]
    : role === "COMPANY"
      ? [["Overview", "/company/dashboard"], ["Talent", "/company/talent"], ["Opportunities", "/company/opportunities"], ["Collaboration", "/company/collaboration"], ["Profile", "/company/profile"]]
      : role === "INSTITUTION"
        ? [["Overview", "/institution/dashboard"], ["Students", "/institution/students"], ["Intelligence", "/institution/intelligence"], ["Programs", "/institution/programs"], ["Profile", "/institution/profile"]]
        : role === "ACADEMICIAN"
          ? [["Overview", "/academician/dashboard"], ["Research", "/academician/research"], ["Collaboration", "/academician/collaboration"], ["Mentorship", "/academician/mentorship"], ["Profile", "/academician/profile"]]
          : role === "ADMIN" ? [["Overview", "/admin/dashboard"], ["Verification", "/admin/dashboard#verification"], ["Moderation", "/admin/dashboard#moderation"]] : [];

  const nav = (compact = false) => <List disablePadding sx={{ display: compact ? "block" : "flex", gap: compact ? 0 : 0.5 }}>
    {links.map(([label, href]) => <ListItemButton key={label} component={Link} href={href} selected={pathname === href.split("#")[0]} onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 1.5, px: compact ? 2 : 1.25, py: compact ? 1.2 : 0.75, minWidth: compact ? "auto" : "unset" }}>
      <ListItemText primary={label} primaryTypographyProps={{ fontSize: 13, fontWeight: 700, noWrap: true }} />
    </ListItemButton>)}
  </List>;

  return <AppBar position="sticky" elevation={0} component="header">
    <Toolbar sx={{ minHeight: { xs: 64, md: 72 }, maxWidth: 1440, width: "100%", mx: "auto", px: { xs: 2, md: 4 }, gap: 2 }}>
      {session && mobile && <IconButton aria-label="Open navigation" onClick={() => setDrawerOpen(true)} color="inherit" edge="start"><MenuIcon /></IconButton>}
      <Button component={Link} href={home} color="inherit" sx={{ p: 0, textAlign: "left", minWidth: "fit-content", mr: "auto" }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: "primary.dark", width: 38, height: 38, fontSize: 12, fontWeight: 900 }}>AC</Avatar>
          <Box sx={{ display: { xs: "none", sm: "block" } }}><Typography fontWeight={800} lineHeight={1.1}>Academia Connect</Typography><Typography variant="overline" color="text.secondary" sx={{ fontSize: 8 }}>Academia-Industry Portal</Typography></Box>
        </Stack>
      </Button>
      {status !== "loading" && session ? <Stack direction="row" spacing={1} alignItems="center">
        {isDemo && <Chip label="DEMO MODE ACTIVE" color="success" size="small" sx={{ display: { xs: "none", sm: "inline-flex" }, fontSize: 10, letterSpacing: ".05em" }} />}
        {!mobile && nav()}
        <NotificationBell />
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", lg: "block" }, maxWidth: 120 }} noWrap>{session.user?.name}</Typography>
        <Button variant="outlined" size="small" onClick={() => signOut({ callbackUrl: `${window.location.origin}/` })}>Sign out</Button>
      </Stack> : <Stack direction="row" spacing={1} alignItems="center"><DemoLauncher/><Button component={Link} href="/login" variant="outlined" size="small">Log in</Button><Button component={Link} href="/signup" variant="contained" size="small">Get started</Button></Stack>}
    </Toolbar>
    <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}><Box sx={{ width: 280, p: 2 }} role="presentation"><Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}><Avatar variant="rounded" sx={{ bgcolor: "primary.dark" }}>AC</Avatar><Typography fontWeight={800}>Academia Connect</Typography></Stack><Divider sx={{ mb: 1 }} />{isDemo && <Chip label="DEMO MODE ACTIVE" color="success" size="small" sx={{ mb: 1 }} />}{nav(true)}</Box></Drawer>
  </AppBar>;
}
