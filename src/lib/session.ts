import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@/lib/roles";
import { requireVerifiedOrganization } from "@/lib/organization";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const err: any = new Error("Not authenticated"); err.status = 401; throw err;
  }
  return user;
}

export async function requireRole(role: Role) {
  const user = await requireUser();
  if (user.role !== role) {
    const err: any = new Error("Forbidden"); err.status = 403; throw err;
  }
  return user;
}

export async function requireVerifiedRole(role: Role) {
  const user = await requireRole(role);
  await requireVerifiedOrganization(user.id, user.role as Role);
  return user;
}
