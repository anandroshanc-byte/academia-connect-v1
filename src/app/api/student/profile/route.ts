import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const skillSchema = z.object({ skillId: z.string().min(1).max(100), proficiency: z.number().int().min(1).max(4) });
const urlOrEmpty = z.string().url().max(500).optional().nullable().or(z.literal(""));
const updateSchema = z.object({
  degreeType: z.string().min(1).max(80), specialization: z.string().min(1).max(120), year: z.number().int().min(1).max(8),
  cgpa: z.number().min(0).max(10).optional().nullable(), location: z.string().max(120).optional().nullable(),
  institutionId: z.string().optional().nullable(), bio: z.string().max(600).optional().nullable(),
  githubUrl: urlOrEmpty, linkedinUrl: urlOrEmpty, portfolioUrl: urlOrEmpty, resumeUrl: urlOrEmpty,
  discoverability: z.enum(["PRIVATE","MATCHED_ONLY","APPLIED_ONLY","PUBLIC"]).default("MATCHED_ONLY"),
  careerInterests: z.array(z.string().max(100)).max(10).default([]), projectSkillIds: z.array(z.string().max(100)).max(50).default([]),
  experienceSkillIds: z.array(z.string().max(100)).max(50).default([]), skills: z.array(skillSchema).max(50).default([])
});

export async function GET(){
  let user; try { user=await requireRole("STUDENT"); } catch(e:any){ return NextResponse.json({error:e.message},{status:e.status??401}); }
  const profile=await prisma.studentProfile.findUnique({where:{userId:user.id},include:{skills:true,institution:true,user:{select:{name:true,email:true}}}});
  return NextResponse.json(profile);
}

export async function PATCH(req:NextRequest){
  let user; try { user=await requireRole("STUDENT"); } catch(e:any){ return NextResponse.json({error:e.message},{status:e.status??401}); }
  const parsed=updateSchema.safeParse(await req.json().catch(()=>null)); if(!parsed.success) return NextResponse.json({error:parsed.error.issues[0]?.message??"Invalid input"},{status:400});
  const d=parsed.data; const profile=await prisma.studentProfile.findUnique({where:{userId:user.id}}); if(!profile) return NextResponse.json({error:"Profile not found"},{status:404});
  let institutionName=profile.institutionName; if(d.institutionId){ const inst=await prisma.institutionProfile.findUnique({where:{id:d.institutionId,verificationStatus:"VERIFIED"}}); if(!inst)return NextResponse.json({error:"Invalid verified institution"},{status:400}); institutionName=inst.institutionName; }
  const existing=await prisma.studentSkill.findMany({where:{studentId:profile.id}}); const verification=new Map(existing.map(s=>[s.skillId,s.verification]));
  await prisma.$transaction([prisma.studentProfile.update({where:{id:profile.id},data:{degreeType:d.degreeType,specialization:d.specialization,degree:`${d.degreeType} ${d.specialization}`,year:d.year,cgpa:d.cgpa??null,location:d.location??null,institutionId:d.institutionId??null,institutionName:institutionName??null,bio:d.bio??null,githubUrl:d.githubUrl||null,linkedinUrl:d.linkedinUrl||null,portfolioUrl:d.portfolioUrl||null,resumeUrl:d.resumeUrl||null,discoverability:d.discoverability,careerInterests:JSON.stringify(d.careerInterests),projectSkillIds:JSON.stringify(d.projectSkillIds),experienceSkillIds:JSON.stringify(d.experienceSkillIds)}}),prisma.studentSkill.deleteMany({where:{studentId:profile.id}}),...(d.skills.length?[prisma.studentSkill.createMany({data:d.skills.map(s=>({studentId:profile.id,skillId:s.skillId,proficiency:s.proficiency,verification:verification.get(s.skillId)??1}))})]:[])]);
  return NextResponse.json(await prisma.studentProfile.findUnique({where:{id:profile.id},include:{skills:true,institution:true,user:{select:{name:true,email:true}}}}));
}
