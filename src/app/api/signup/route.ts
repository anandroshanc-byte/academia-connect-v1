import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8).max(128),
  role: z.enum(["STUDENT", "COMPANY", "INSTITUTION"]),
  degreeType: z.string().trim().optional(),
  specialization: z.string().trim().optional(),
  year: z.number().int().min(1).max(8).optional(),
  companyName: z.string().trim().max(200).optional(),
  companyWebsite: z.string().url().optional().or(z.literal("")),
  companyRegistrationId: z.string().trim().max(100).optional(),
  institutionName: z.string().trim().max(200).optional(),
  institutionId: z.string().optional(),
  institutionWebsite: z.string().url().optional().or(z.literal("")),
  institutionalId: z.string().trim().max(100).optional()
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = rateLimit(`signup:${ip}`, 8, 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Too many signup attempts. Please try again shortly." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  const d = parsed.data;

  if (d.role === "STUDENT" && (!d.degreeType || !d.specialization)) return NextResponse.json({ error: "Degree and specialization are required." }, { status: 400 });
  if (d.role === "COMPANY" && (!d.companyName || !d.companyRegistrationId || !d.companyWebsite)) return NextResponse.json({ error: "Company name, official website and registration identifier are required." }, { status: 400 });
  if (d.role === "INSTITUTION" && (!d.institutionName || !d.institutionalId || !d.institutionWebsite)) return NextResponse.json({ error: "Institution name, official website and institutional identifier are required." }, { status: 400 });
  const domain = (email: string) => email.split("@")[1]?.toLowerCase().replace(/^www\./, "") ?? "";
  const siteDomain = (url: string | undefined) => { try { return new URL(url || "").hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; } };
  const emailDomain = domain(d.email);
  const genericDomains = new Set(["gmail.com","yahoo.com","outlook.com","hotmail.com","icloud.com","proton.me","protonmail.com"]);
  if ((d.role === "COMPANY" || d.role === "INSTITUTION") && genericDomains.has(emailDomain)) return NextResponse.json({ error: "Use an official work or institutional email for organization registration." }, { status: 400 });
  if (d.role === "COMPANY" && siteDomain(d.companyWebsite) && siteDomain(d.companyWebsite) !== emailDomain) return NextResponse.json({ error: "Company email domain should match the company website domain." }, { status: 400 });
  if (d.role === "INSTITUTION" && siteDomain(d.institutionWebsite) !== emailDomain) return NextResponse.json({ error: "Institutional email domain should match the official institution website domain." }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: d.email } });
  if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  let institutionName = d.institutionName;
  if (d.role === "STUDENT" && d.institutionId) {
    const inst = await prisma.institutionProfile.findUnique({ where: { id: d.institutionId, verificationStatus: "VERIFIED" } });
    if (!inst) return NextResponse.json({ error: "Please select a verified institution." }, { status: 400 });
    institutionName = inst.institutionName;
  }

  const passwordHash = await bcrypt.hash(d.password, 12);
  const user = await prisma.user.create({
    data: {
      name: d.name,
      email: d.email,
      password: passwordHash,
      role: d.role,
      emailVerifiedAt: null,
      ...(d.role === "STUDENT" && { studentProfile: { create: {
        degreeType: d.degreeType!, specialization: d.specialization!, degree: `${d.degreeType} ${d.specialization}`,
        year: d.year ?? 1, institutionId: d.institutionId ?? null, institutionName: institutionName ?? null
      } } }),
      ...(d.role === "COMPANY" && { companyProfile: { create: {
        companyName: d.companyName!, website: d.companyWebsite || null, registrationId: d.companyRegistrationId!, verificationStatus: "PENDING"
      } } }),
      ...(d.role === "INSTITUTION" && { institutionProfile: { create: {
        institutionName: d.institutionName!, officialWebsite: d.institutionWebsite || null, institutionalId: d.institutionalId!, verificationStatus: "PENDING"
      } } })
    }
  });

  await prisma.auditLog.create({ data: { userId: user.id, action: "ACCOUNT_CREATED", resourceType: "User", resourceId: user.id } });
  return NextResponse.json({ id: user.id, email: user.email, verificationRequired: d.role !== "STUDENT" }, { status: 201 });
}
