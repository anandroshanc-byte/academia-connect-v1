import { prisma } from "@/lib/prisma";

type NotificationInput = {
  userId: string;
  type: string;
  title: string;
  message: string;
  href?: string;
};

export async function createNotification(input: NotificationInput) {
  return prisma.notification.create({ data: input });
}

export async function createNotifications(inputs: NotificationInput[]) {
  if (!inputs.length) return;
  return prisma.notification.createMany({ data: inputs });
}
