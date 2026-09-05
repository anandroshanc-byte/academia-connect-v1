import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Academia Connect — Academia–Industry Portal",
  description: "Academia–Industry Portal connecting AYUSH academia, research and industry through skill intelligence and explainable matching.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <footer style={{ borderTop: "1px solid rgba(29,41,35,0.12)", padding: "24px", textAlign: "center", color: "#607168", fontSize: 13 }}>
            Academia Connect · Skill intelligence for academia, research and industry · Built for the SIH26044 challenge
          </footer>
        </Providers>
      </body>
    </html>
  );
}
