import { PrismaClient } from "@prisma/client";
import { createCanonicalDemoData } from "../src/lib/demoSeed";

async function main(){
 const prisma=new PrismaClient();
 try{
  await prisma.$transaction(async tx=>{ await tx.user.deleteMany({where:{isDemo:true}}); await createCanonicalDemoData(tx); });
  console.log("Canonical Academia Connect demo seeded. Use the Demo launcher for direct judge access.");
 } finally { await prisma.$disconnect(); }
}
main().catch(e=>{console.error(e);process.exit(1)});
