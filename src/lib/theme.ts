import { createTheme } from "@mui/material/styles";

const forest = "#185c3b";
const ink = "#1d2923";
const ivory = "#f5f3ec";
const sage = "#e4eee6";
const gold = "#a87835";

export const academiaTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: forest, dark: "#10432b", light: "#4b8b68", contrastText: "#fff" },
    secondary: { main: gold, dark: "#7c5725", light: "#d1ac72", contrastText: "#fff" },
    background: { default: ivory, paper: "#fffdf8" },
    text: { primary: ink, secondary: "#607168" },
    success: { main: "#2e7d52" },
    warning: { main: "#a87835" },
    error: { main: "#b44b3d" },
    info: { main: "#397978" },
    divider: "rgba(29, 41, 35, 0.12)",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
    h1: { fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.08 },
    h2: { fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" },
    h3: { fontSize: "1.25rem", fontWeight: 800 },
    h4: { fontSize: "1.05rem", fontWeight: 800 },
    body1: { lineHeight: 1.65 },
    body2: { lineHeight: 1.55 },
    button: { textTransform: "none", fontWeight: 700 },
    overline: { fontWeight: 800, letterSpacing: "0.14em", fontSize: "0.68rem" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: ivory },
        "a": { color: "inherit", textDecoration: "none" },
        "*": { boxSizing: "border-box" },
      },
    },
    MuiAppBar: { styleOverrides: { root: { backgroundColor: "rgba(245,243,236,0.94)", color: ink, boxShadow: "0 1px 0 rgba(29,41,35,0.12)" } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiCard: { styleOverrides: { root: { border: "1px solid rgba(29,41,35,0.11)", boxShadow: "0 2px 12px rgba(29,41,35,0.045)" } } },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 8, minHeight: 40 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 700 } } },
    MuiLinearProgress: { styleOverrides: { root: { height: 8, borderRadius: 8, backgroundColor: sage } } },
  },
});
