-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "degreeType" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "cgpa" REAL,
    "location" TEXT,
    "institutionName" TEXT,
    "profilePhotoUrl" TEXT,
    "institutionId" TEXT,
    "bio" TEXT,
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "portfolioUrl" TEXT,
    "resumeUrl" TEXT,
    "discoverability" TEXT NOT NULL DEFAULT 'MATCHED_ONLY',
    "careerInterests" TEXT NOT NULL DEFAULT '[]',
    "projectSkillIds" TEXT NOT NULL DEFAULT '[]',
    "experienceSkillIds" TEXT NOT NULL DEFAULT '[]',
    "projectsJson" TEXT NOT NULL DEFAULT '[]',
    "certificationsJson" TEXT NOT NULL DEFAULT '[]',
    "achievementsJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentProfile_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "InstitutionProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "proficiency" INTEGER NOT NULL,
    "verification" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "StudentSkill_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "description" TEXT,
    "profilePhotoUrl" TEXT,
    "website" TEXT,
    "registrationId" TEXT,
    "verificationDocumentUrl" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CompanyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InstitutionProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "officialWebsite" TEXT,
    "profilePhotoUrl" TEXT,
    "institutionalId" TEXT,
    "verificationDocumentUrl" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InstitutionProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AcademicianProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "institutionName" TEXT,
    "profilePhotoUrl" TEXT,
    "institutionId" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AcademicianProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INTERNSHIP',
    "description" TEXT,
    "careerPathId" TEXT,
    "degrees" TEXT,
    "minYear" INTEGER,
    "maxYear" INTEGER,
    "minCgpa" REAL,
    "location" TEXT,
    "remoteAllowed" BOOLEAN NOT NULL DEFAULT false,
    "duration" TEXT,
    "stipend" TEXT,
    "deadline" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'open',
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Opportunity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "CompanyProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SkillRequirement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opportunityId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "requiredProficiency" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "SkillRequirement_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'applied',
    "score" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Application_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssessmentAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "answersJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssessmentAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "rating" INTEGER,
    "technicalScore" INTEGER,
    "communicationScore" INTEGER,
    "teamworkScore" INTEGER,
    "problemSolvingScore" INTEGER,
    "comments" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feedback_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "href" TEXT,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "metadataJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE INDEX "StudentProfile_institutionId_idx" ON "StudentProfile"("institutionId");

-- CreateIndex
CREATE INDEX "StudentSkill_skillId_idx" ON "StudentSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSkill_studentId_skillId_key" ON "StudentSkill"("studentId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyProfile_userId_key" ON "CompanyProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionProfile_userId_key" ON "InstitutionProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicianProfile_userId_key" ON "AcademicianProfile"("userId");

-- CreateIndex
CREATE INDEX "Opportunity_companyId_status_approvalStatus_idx" ON "Opportunity"("companyId", "status", "approvalStatus");

-- CreateIndex
CREATE INDEX "Opportunity_deadline_idx" ON "Opportunity"("deadline");

-- CreateIndex
CREATE INDEX "SkillRequirement_skillId_idx" ON "SkillRequirement"("skillId");

-- CreateIndex
CREATE INDEX "Application_opportunityId_status_idx" ON "Application"("opportunityId", "status");

-- CreateIndex
CREATE INDEX "Application_studentId_status_idx" ON "Application"("studentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Application_studentId_opportunityId_key" ON "Application"("studentId", "opportunityId");

-- CreateIndex
CREATE INDEX "AssessmentAttempt_studentId_assessmentType_idx" ON "AssessmentAttempt"("studentId", "assessmentType");

-- CreateIndex
CREATE INDEX "Feedback_studentId_idx" ON "Feedback"("studentId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");
