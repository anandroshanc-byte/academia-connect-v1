"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

type Role = "STUDENT" | "COMPANY" | "INSTITUTION";
const degrees = ["BAMS", "BHMS", "BUMS", "BSMS", "BNYS", "B.Pharm", "M.Pharm", "B.Sc", "M.Sc", "PhD", "Other"];
const specializations = ["Ayurveda", "Dravyaguna & Rasashastra", "Kayachikitsa", "Shalya Tantra", "Shalakya Tantra", "Swasthavritta", "Homoeopathy", "Unani Medicine", "Siddha Medicine", "Yoga & Naturopathy", "Pharmacy", "Pharmacognosy", "Phytochemistry", "Biotechnology", "Clinical Research", "Healthcare Informatics", "Other"];

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = (["STUDENT", "COMPANY", "INSTITUTION"] as string[]).includes(params.get("role") ?? "") ? params.get("role") as Role : "STUDENT";
  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [degreeType, setDegreeType] = useState("BAMS"); const [specialization, setSpecialization] = useState(specializations[0]); const [year, setYear] = useState(1);
  const [companyName, setCompanyName] = useState(""); const [companyWebsite, setCompanyWebsite] = useState(""); const [companyRegistrationId, setCompanyRegistrationId] = useState("");
  const [institutionId, setInstitutionId] = useState(""); const [institutionName, setInstitutionName] = useState(""); const [institutionWebsite, setInstitutionWebsite] = useState(""); const [institutionalId, setInstitutionalId] = useState("");
  const [institutions, setInstitutions] = useState<{id:string; institutionName:string}[]>([]); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false);

  useEffect(() => { fetch("/api/institutions").then(r => r.ok ? r.json() : []).then(setInstitutions).catch(() => setInstitutions([])); }, []);
  useEffect(() => { const found = institutions.find(i => i.id === institutionId); if (found) setInstitutionName(found.institutionName); }, [institutionId, institutions]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null); setLoading(true);
    const res = await fetch("/api/signup", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({
      name,email,password,role,degreeType,specialization,year,companyName,companyWebsite,companyRegistrationId,institutionId,institutionName,institutionWebsite,institutionalId
    })});
    if (!res.ok) { const b=await res.json().catch(()=>({})); setError(b.error ?? "Could not create account."); setLoading(false); return; }
    const created = await res.json();
    if (created.verificationRequired) { setLoading(false); setError("Account created. Your organization account is pending admin verification before it can publish or access protected data."); router.push("/login"); return; }
    const result = await signIn("credentials", { redirect:false, email, password }); setLoading(false);
    if (result?.error) { router.push("/login"); return; }
    router.push("/student/dashboard"); router.refresh();
  }

  return <div className="min-h-[calc(100vh-9rem)] grid lg:grid-cols-[0.9fr_1.1fr] max-w-6xl mx-auto">
    <aside className="hidden lg:flex p-10 flex-col justify-center bg-brand-700 text-white rounded-3xl my-8 mr-6 relative overflow-hidden">
      <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10"/><div className="absolute -left-16 bottom-0 w-48 h-48 rounded-full bg-white/10"/>
      <span className="text-sm font-semibold uppercase tracking-[.2em] text-white/70">Academia Connect</span>
      <h1 className="text-4xl font-bold mt-4 leading-tight">Turn your skills into the right opportunity.</h1>
      <p className="mt-5 text-white/75">Assess what you know, close the gaps, and find internships that fit your actual readiness.</p>
      <div className="mt-8 space-y-3 text-sm">{["Assess your skills","Improve your gaps","Match with verified opportunities"].map((x,i)=><div key={x} className="flex gap-3 items-center"><span className="w-7 h-7 rounded-full bg-white/15 grid place-items-center">{i+1}</span>{x}</div>)}</div>
    </aside>
    <div className="px-4 sm:px-6 py-10 lg:py-16 max-w-xl w-full">
      <h2 className="text-3xl font-bold text-ink">Create your account</h2><p className="text-slate-500 mt-1">Set up the information we need for your role.</p>
      <div className="grid grid-cols-3 gap-2 mt-6">{(["STUDENT","COMPANY","INSTITUTION"] as Role[]).map(r=><button key={r} type="button" onClick={()=>setRole(r)} className={`btn-secondary !py-2.5 ${role===r?"!bg-brand-600 !text-white !border-brand-600":""}`}>{r[0]+r.slice(1).toLowerCase()}</button>)}</div>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div><label className="label">Full name</label><input className="input" required value={name} onChange={e=>setName(e.target.value)} /></div>
        <div><label className="label">Email</label><input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} /><p className="hint">Use an institutional/work email for organization accounts.</p></div>
        <div><label className="label">Password</label><input className="input" type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} /></div>
        {role === "STUDENT" && <>
          <div className="grid sm:grid-cols-2 gap-4"><div><label className="label">Degree program</label><select className="input" value={degreeType} onChange={e=>setDegreeType(e.target.value)}>{degrees.map(d=><option key={d}>{d}</option>)}</select></div><div><label className="label">Specialization</label><select className="input" value={specialization} onChange={e=>setSpecialization(e.target.value)}>{specializations.map(s=><option key={s}>{s}</option>)}</select></div></div>
          <div><label className="label">Current year</label><select className="input" value={year} onChange={e=>setYear(Number(e.target.value))}>{[1,2,3,4,5].map(y=><option key={y} value={y}>Year {y}</option>)}</select></div>
          <div><label className="label">Institution</label><select className="input" required value={institutionId} onChange={e=>setInstitutionId(e.target.value)}><option value="">Select your institution</option>{institutions.map(i=><option key={i.id} value={i.id}>{i.institutionName}</option>)}</select><p className="hint">Only verified institutions appear here.</p></div>
        </>}
        {role === "COMPANY" && <div className="card p-5 space-y-4 bg-slate-50"><p className="font-semibold">Company verification</p><p className="text-sm text-slate-500">Your account stays pending until an admin verifies the organization.</p><input className="input" required placeholder="Company name" value={companyName} onChange={e=>setCompanyName(e.target.value)}/><input className="input" placeholder="Company website" value={companyWebsite} onChange={e=>setCompanyWebsite(e.target.value)}/><input className="input" required placeholder="CIN / GSTIN / registration ID" value={companyRegistrationId} onChange={e=>setCompanyRegistrationId(e.target.value)}/></div>}
        {role === "INSTITUTION" && <div className="card p-5 space-y-4 bg-slate-50"><p className="font-semibold">Institution verification</p><p className="text-sm text-slate-500">Institution accounts require verification before accessing student data.</p><input className="input" required placeholder="Institution name" value={institutionName} onChange={e=>setInstitutionName(e.target.value)}/><input className="input" placeholder="Official website" value={institutionWebsite} onChange={e=>setInstitutionWebsite(e.target.value)}/><input className="input" required placeholder="Institutional identifier / AISHE etc." value={institutionalId} onChange={e=>setInstitutionalId(e.target.value)}/></div>}
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
        <button disabled={loading} className="btn-primary w-full !py-2.5">{loading?"Creating account…":role==="STUDENT"?"Create student account":"Submit for verification"}</button>
      </form><p className="text-sm text-slate-500 mt-6 text-center">Already have an account? <Link href="/login" className="text-brand-600 font-medium">Log in</Link></p>
    </div>
  </div>;
}
export default function SignupPage(){ return <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading…</div>}><SignupForm/></Suspense>; }
