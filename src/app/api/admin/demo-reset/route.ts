import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCanonicalDemoData } from "@/lib/demoSeed";

export async function POST(){
  const session=await getServerSession(authOptions);
  if(!session?.user || (session.user as any).role!=="ADMIN") return NextResponse.json({error:"Forbidden"},{status:403});
  try{
    const result=await prisma.$transaction(async tx=>{
      const currentId=(session.user as any).id;
      const current=await tx.user.findUnique({where:{id:currentId}});
      await tx.user.deleteMany({where:{isDemo:true,id:{not:currentId}}});
      if(current?.isDemo){ await tx.notification.deleteMany({where:{userId:currentId}}); await tx.auditLog.deleteMany({where:{userId:currentId}}); }
      const data=await createCanonicalDemoData(tx,current?.isDemo && current.role==="ADMIN" ? currentId : undefined);
      await tx.auditLog.create({data:{userId:(session.user as any).id,action:"DEMO_RESET",resourceType:"DEMO_DATA",metadataJson:JSON.stringify({reset:true})}});
      return {student:data.student.email,company:data.company.email,institution:data.institution.email,academician:data.academician.email,admin:data.admin.email};
    });
    return NextResponse.json({ok:true,accounts:result});
  }catch(error){ console.error(error); return NextResponse.json({error:"Demo reset failed"},{status:500}); }
}
