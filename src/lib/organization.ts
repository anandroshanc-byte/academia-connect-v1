import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/roles";

export async function isVerifiedOrganization(userId: string, role: Role): Promise<boolean> {
  if (role === "COMPANY") {
    const profile = await prisma.companyProfile.findUnique({ where: { userId }, select: { verificationStatus: true } });
    return profile?.verificationStatus === "VERIFIED";
  }
  if (role === "INSTITUTION") {
    const profile = await prisma.institutionProfile.findUnique({ where: { userId }, select: { verificationStatus: true } });
    return profile?.verificationStatus === "VERIFIED";
  }
  if (role === "ACADEMICIAN") {
    const profile = await prisma.academicianProfile.findUnique({ where: { userId }, select: { verificationStatus: true } });
    return profile?.verificationStatus === "VERIFIED";
  }
  return true;
}

export async function requireVerifiedOrganization(userId: string, role: Role) {
  if (!["COMPANY", "INSTITUTION", "ACADEMICIAN"].includes(role)) return;
  if (!(await isVerifiedOrganization(userId, role))) {
    const err: any = new Error("Your organization account is pending verification.");
    err.status = 403;
    throw err;
  }
}
