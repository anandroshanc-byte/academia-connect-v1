import bcrypt from "bcryptjs";

/**
 * Creates the canonical Academia Connect judge dataset.
 * This function is intentionally idempotent only when called after demo data
 * has been isolated/cleared by the caller (seed.ts or the admin reset route).
 */
export async function createCanonicalDemoData(prisma: any, preserveAdminId?: string) {
  const password = await bcrypt.hash("demo-account-internal-credential", 10);

  const admin = preserveAdminId
    ? await prisma.user.findUniqueOrThrow({ where: { id: preserveAdminId } })
    : await prisma.user.create({
        data: {
          name: "Academia Connect Admin",
          email: "admin@academiaconnect.demo",
          password,
          role: "ADMIN",
          isDemo: true,
          emailVerifiedAt: new Date(),
        },
      });

  const institution = await prisma.user.create({
    data: {
      name: "Dr. Anita Rao",
      email: "institution@academiaconnect.demo",
      password,
      role: "INSTITUTION",
      isDemo: true,
      institutionProfile: {
        create: {
          institutionName: "VJ Institute of Technology · AYUSH Innovation Cell",
          profilePhotoUrl: "/demo/anita.svg",
          officialWebsite: "https://vjit.edu",
          institutionalId: "VJIT-AYUSH-DEMO-001",
          verificationStatus: "VERIFIED",
        },
      },
    },
    include: { institutionProfile: true },
  });

  const academician = await prisma.user.create({
    data: {
      name: "Prof. Meera Nair",
      email: "faculty@academiaconnect.demo",
      password,
      role: "ACADEMICIAN",
      isDemo: true,
      academicianProfile: {
        create: {
          institutionName: "VJ Institute of Technology · AYUSH Innovation Cell",
          profilePhotoUrl: "/demo/meera.svg",
          institutionId: institution.institutionProfile.id,
          verificationStatus: "VERIFIED",
        },
      },
    },
  });

  const company = await prisma.user.create({
    data: {
      name: "Priya Menon",
      email: "talent@ayurtech.demo",
      password,
      role: "COMPANY",
      isDemo: true,
      companyProfile: {
        create: {
          companyName: "AyurTech Research Labs",
          description: "AYUSH-focused research, formulation quality and evidence technology company.",
          profilePhotoUrl: "/demo/priya.svg",
          website: "https://ayurtech.demo",
          registrationId: "CIN-AYURTECH-DEMO",
          verificationStatus: "VERIFIED",
        },
      },
    },
    include: { companyProfile: true },
  });

  const student = await prisma.user.create({
    data: {
      name: "Ananya Iyer",
      email: "ananya@academiaconnect.demo",
      password,
      role: "STUDENT",
      isDemo: true,
      studentProfile: {
        create: {
          degreeType: "BAMS",
          specialization: "Dravyaguna & Rasashastra",
          degree: "Bachelor of Ayurvedic Medicine and Surgery",
          year: 3,
          cgpa: 8.6,
          location: "Bengaluru",
          institutionName: "VJ Institute of Technology · AYUSH Innovation Cell",
          institutionId: institution.institutionProfile.id,
          bio: "AYUSH student focused on evidence-based herbal research, formulation quality and responsible digital health." ,
          profilePhotoUrl: "/demo/ananya.svg",
          careerInterests: JSON.stringify([
            "Clinical & AYUSH Research",
            "Herbal Formulation Research",
            "Pharmacovigilance",
          ]),
          projectSkillIds: JSON.stringify(["research-methodology", "phytochemistry", "herbal-formulation"]),
          experienceSkillIds: JSON.stringify(["clinical-research", "quality-control"]),
          projectsJson: JSON.stringify([
            {
              title: "AYUSH Formulation Insight",
              description:
                "Prototype for extracting research patterns from herbal formulation literature.",
              skills: ["Python", "NLP", "SQL"],
            },
          ]),
          certificationsJson: JSON.stringify([
            {
              title: "Applied Machine Learning",
              issuer: "Academia Connect Academy",
              year: 2026,
            },
          ]),
          achievementsJson: JSON.stringify([
            "AYUSH innovation challenge finalist",
            "Research poster presenter",
          ]),
          skills: {
            create: [
              { skillId: "ayurveda-fundamentals", proficiency: 4, verification: 3 },
              { skillId: "pharmacognosy", proficiency: 3, verification: 3 },
              { skillId: "phytochemistry", proficiency: 3, verification: 2 },
              { skillId: "herbal-formulation", proficiency: 2, verification: 2 },
              { skillId: "clinical-research", proficiency: 3, verification: 2 },
              { skillId: "research-methodology", proficiency: 3, verification: 3 },
              { skillId: "quality-control", proficiency: 2, verification: 1 },
            ],
          },
        },
      },
    },
  });

  const opp = await prisma.opportunity.create({
    data: {
      companyId: company.companyProfile.id,
      title: "AYUSH Clinical Evidence Research Intern",
      role: "Clinical & Evidence Research Intern",
      type: "RESEARCH",
      description:
        "Support evidence mapping, clinical research documentation and structured analysis of AYUSH interventions and outcomes.",
      careerPathId: "ayush-clinical-research",
      degrees: JSON.stringify([
        "BAMS",
        "BHMS",
        "BUMS",
        "BSMS",
        "BNYS",
        "B.Pharm",
        "M.Pharm",
        "M.Sc",
      ]),
      minYear: 3,
      minCgpa: 7.5,
      location: "Bengaluru",
      remoteAllowed: true,
      duration: "12 weeks",
      stipend: "₹25,000 / month",
      approvalStatus: "APPROVED",
      status: "open",
      deadline: new Date("2026-10-15"),
      skillRequirements: {
        create: [
          { skillId: "clinical-research", requiredProficiency: 3, weight: 9, type: "Mandatory" },
          { skillId: "research-methodology", requiredProficiency: 3, weight: 8, type: "Mandatory" },
          { skillId: "pharmacognosy", requiredProficiency: 3, weight: 7, type: "Preferred" },
          { skillId: "phytochemistry", requiredProficiency: 2, weight: 6, type: "Preferred" },
          { skillId: "statistical-analysis", requiredProficiency: 2, weight: 4, type: "Preferred" },
        ],
      },
    },
  });

  const opp2 = await prisma.opportunity.create({
    data: {
      companyId: company.companyProfile.id,
      title: "AYUSH Herbal Quality Intelligence Project",
      role: "Research Data & Quality Intern",
      type: "LIVE_PROJECT",
      description:
        "Create a structured quality and evidence workflow for herbal raw-material and formulation research.",
      careerPathId: "herbal-formulation",
      degrees: JSON.stringify(["B.Pharm", "M.Pharm", "BAMS", "M.Sc Biotechnology", "B.Sc Life Sciences"]),
      minYear: 2,
      minCgpa: 7,
      location: "Remote",
      remoteAllowed: true,
      duration: "8 weeks",
      approvalStatus: "APPROVED",
      status: "open",
      deadline: new Date("2026-10-30"),
      skillRequirements: {
        create: [
          { skillId: "quality-control", requiredProficiency: 2, weight: 8, type: "Mandatory" },
          { skillId: "phytochemistry", requiredProficiency: 2, weight: 7, type: "Mandatory" },
          { skillId: "lab-techniques", requiredProficiency: 3, weight: 6, type: "Preferred" },
          { skillId: "statistical-analysis", requiredProficiency: 2, weight: 4, type: "Preferred" },
        ],
      },
    },
  });

  const studentProfile = await prisma.studentProfile.findUniqueOrThrow({
    where: { userId: student.id },
  });

  await prisma.assessmentAttempt.create({
    data: {
      studentId: studentProfile.id,
      assessmentType: "AYUSH Research Readiness",
      score: 78,
      answersJson: JSON.stringify({
        attempt: 1,
        competencies: {
          ayurvedaFundamentals: 88,
          pharmacognosy: 76,
          researchMethodology: 82,
          herbalFormulation: 58,
        },
        verified: true,
      }),
    },
  });

  await prisma.application.create({
    data: {
      studentId: studentProfile.id,
      opportunityId: opp.id,
      status: "shortlisted",
      score: 78,
    },
  });

  await prisma.feedback.create({
    data: {
      studentId: studentProfile.id,
      opportunityId: opp.id,
      rating: 5,
      technicalScore: 4,
      communicationScore: 5,
      teamworkScore: 5,
      problemSolvingScore: 4,
      comments: "Strong research curiosity and clear technical evidence.",
      source: "INDUSTRY",
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: student.id,
        type: "NEW_MATCH",
        title: "84% capability alignment",
        message:
          "AYUSH Clinical Evidence Research Intern is your strongest current match. Herbal formulation is the main improvement gap.",
        href: `/student/opportunities/${opp.id}`,
      },
      {
        userId: student.id,
        type: "SKILL_VERIFIED",
        title: "Research methodology evidence verified",
        message:
          "Your assessment and research evidence now strengthen your research methodology capability signal.",
        href: "/student/profile",
      },
      {
        userId: company.id,
        type: "APPLICATION_RECEIVED",
        title: "Ananya Iyer entered the pipeline",
        message: "A verified student profile is ready for explainable candidate review.",
        href: `/company/opportunities/${opp.id}`,
      },
      {
        userId: institution.id,
        type: "SKILL_GAP_INSIGHT",
        title: "Priority gap identified",
        message:
          "Herbal formulation is a high-priority capability gap for your AYUSH research cohort.",
        href: "/institution/dashboard",
      },
      {
        userId: academician.id,
        type: "COLLABORATION",
        title: "Research profile connected",
        message:
          "Ananya's herbal research interests align with your AYUSH research collaboration workspace.",
        href: "/academician/dashboard",
      },
      {
        userId: admin.id,
        type: "PLATFORM_ACTIVITY",
        title: "Demo environment ready",
        message: "All five canonical judge workspaces are connected and seeded.",
        href: "/admin/dashboard",
      },
    ],
  });

  return { admin, student, institution, academician, company, opp, opp2 };
}
