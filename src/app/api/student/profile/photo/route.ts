import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({error:"Unauthorized"},{status:401});
  const form = await req.formData();
  const action = form.get("action");
  const profile = await prisma.studentProfile.findUnique({where:{userId:(session.user as any).id}});
  if (!profile) return NextResponse.json({error:"Profile not found"},{status:404});
  if (action === "remove") {
    await prisma.studentProfile.update({where:{id:profile.id},data:{profilePhotoUrl:null}});
    return NextResponse.json({ok:true,url:null});
  }
  if (action === "reset-demo") {
    if (!(session.user as any).isDemo) return NextResponse.json({error:"Demo photo reset is only available for demo accounts"},{status:403});
    await prisma.studentProfile.update({where:{id:profile.id},data:{profilePhotoUrl:"/demo/ananya.svg"}});
    return NextResponse.json({ok:true,url:"/demo/ananya.svg"});
  }
  const file = form.get("photo");
  if (!(file instanceof File)) return NextResponse.json({error:"Image is required"},{status:400});
  if (!file.type.startsWith("image/")) return NextResponse.json({error:"Only image files are allowed"},{status:400});
  if (file.size > 2 * 1024 * 1024) return NextResponse.json({error:"Maximum image size is 2 MB"},{status:400});
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const dir = path.join(process.cwd(),"public","uploads");
  await fs.mkdir(dir,{recursive:true});
  const name = `${crypto.randomUUID()}.${ext}`;
  await fs.writeFile(path.join(dir,name), Buffer.from(await file.arrayBuffer()));
  await prisma.studentProfile.update({where:{id:profile.id},data:{profilePhotoUrl:`/uploads/${name}`}});
  return NextResponse.json({ok:true,url:`/uploads/${name}`});
}
