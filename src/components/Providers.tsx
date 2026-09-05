"use client";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { academiaTheme } from "@/lib/theme";
export default function Providers({ children }: { children: React.ReactNode }) {
 return <SessionProvider><ThemeProvider theme={academiaTheme}><CssBaseline />{children}</ThemeProvider></SessionProvider>;
}
