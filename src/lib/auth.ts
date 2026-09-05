import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  providers: [CredentialsProvider({
    name: "Credentials",
    credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" }, demoRole: { label: "Demo role", type: "text" } },
    async authorize(credentials) {
      const demoRole = typeof credentials?.demoRole === "string" ? credentials.demoRole.toUpperCase() : "";
      const email = typeof credentials?.email === "string" ? credentials.email.toLowerCase().trim() : "";
      if (demoRole) {
        const demoEmails: Record<string, string> = {
          STUDENT: "ananya@academiaconnect.demo",
          ACADEMICIAN: "faculty@academiaconnect.demo",
          INSTITUTION: "institution@academiaconnect.demo",
          COMPANY: "talent@ayurtech.demo",
          ADMIN: "admin@academiaconnect.demo",
        };
        const demoEmail = demoEmails[demoRole];
        if (!demoEmail) return null;
        const demoUser = await prisma.user.findUnique({ where: { email: demoEmail }, include: { companyProfile: true, institutionProfile: true, academicianProfile: true } });
        if (!demoUser || !demoUser.isDemo || demoUser.role !== demoRole) return null;
        const verified = demoUser.role === "COMPANY" ? demoUser.companyProfile?.verificationStatus === "VERIFIED" : demoUser.role === "INSTITUTION" ? demoUser.institutionProfile?.verificationStatus === "VERIFIED" : demoUser.role === "ACADEMICIAN" ? demoUser.academicianProfile?.verificationStatus === "VERIFIED" : true;
        return { id: demoUser.id, email: demoUser.email, name: demoUser.name, role: demoUser.role, verified, isDemo: true } as any;
      }
      if (!email || !credentials?.password) return null;
      const limit = rateLimit(`login:${email}`, 8, 60_000);
      if (!limit.ok) return null;
      const user = await prisma.user.findUnique({ where: { email }, include: { companyProfile: true, institutionProfile: true, academicianProfile: true } });
      if (!user || !(await bcrypt.compare(credentials.password, user.password))) return null;
      const verified = user.role === "COMPANY" ? user.companyProfile?.verificationStatus === "VERIFIED" : user.role === "INSTITUTION" ? user.institutionProfile?.verificationStatus === "VERIFIED" : user.role === "ACADEMICIAN" ? user.academicianProfile?.verificationStatus === "VERIFIED" : true;
      return { id: user.id, email: user.email, name: user.name, role: user.role, verified, isDemo: user.isDemo } as any;
    }
  })],
  callbacks: {
    async jwt({ token, user }) { if (user) { token.id=(user as any).id; token.role=(user as any).role; token.verified=(user as any).verified; token.isDemo=(user as any).isDemo; } return token; },
    async session({ session, token }) { if (session.user) { (session.user as any).id=token.id; (session.user as any).role=token.role; (session.user as any).verified=token.verified; (session.user as any).isDemo=token.isDemo; } return session; }
  },
  secret: process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === "development" ? "academiaconnect-local-dev-fallback-change-me" : undefined)
};
