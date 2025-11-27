-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "roles" JSONB NOT NULL DEFAULT '[]',
    "avatarUrl" TEXT,
    "passwordChangedAt" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL,
    "appName" TEXT NOT NULL DEFAULT 'Sistem Pondok',
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PondokProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PondokProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PDFLayoutSettings" (
    "id" TEXT NOT NULL,
    "lembagaId" TEXT,
    "showLogo" BOOLEAN NOT NULL DEFAULT true,
    "logoUrl" TEXT,
    "logoSize" INTEGER NOT NULL DEFAULT 30,
    "headerText" TEXT,
    "schoolName" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "showPondokName" BOOLEAN NOT NULL DEFAULT true,
    "pondokNameSize" INTEGER NOT NULL DEFAULT 14,
    "footerText" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PDFLayoutSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncMetadata" (
    "id" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "lastModified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lembaga" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "logoUrl" TEXT,
    "jenjang" TEXT,
    "tags" TEXT,

    CONSTRAINT "Lembaga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LembagaGradeCategory" (
    "id" TEXT NOT NULL,
    "lembagaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groupName" TEXT,
    "gradeType" TEXT NOT NULL DEFAULT 'LETTER',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LembagaGradeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Santri" (
    "id" TEXT NOT NULL,
    "nis" TEXT NOT NULL,
    "nisn" TEXT,
    "nama" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthPlace" TEXT,
    "birthDate" TIMESTAMP(3),
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "bpjsNumber" TEXT,
    "kkNumber" TEXT,
    "nikNumber" TEXT,
    "previousSchool" TEXT,
    "entryDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "fatherName" TEXT,
    "fatherNik" TEXT,
    "fatherPhone" TEXT,
    "fatherJob" TEXT,
    "fatherIncome" TEXT,
    "motherName" TEXT,
    "motherNik" TEXT,
    "motherPhone" TEXT,
    "motherJob" TEXT,
    "motherIncome" TEXT,
    "waliName" TEXT,
    "waliNik" TEXT,
    "waliPhone" TEXT,
    "waliJob" TEXT,
    "waliRelation" TEXT,
    "waliPassword" TEXT,
    "lembagaId" TEXT NOT NULL,
    "kelasId" TEXT,
    "asramaId" TEXT,
    "halqohId" TEXT,
    "userId" TEXT,

    CONSTRAINT "Santri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kelas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "lembagaId" TEXT NOT NULL,
    "ketuaKelasId" TEXT,
    "waliKelasId" TEXT,
    "nextKelasId" TEXT,

    CONSTRAINT "Kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JamPelajaran" (
    "id" TEXT NOT NULL,
    "lembagaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "JamPelajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JadwalPelajaran" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "mapelId" TEXT,
    "jamPelajaranId" TEXT NOT NULL,

    CONSTRAINT "JadwalPelajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asrama" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "gender" TEXT,
    "address" TEXT,
    "ketuaAsramaId" TEXT,
    "musyrifId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asrama_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Halqoh" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ustadzId" TEXT,
    "schedule" TEXT,
    "level" TEXT,
    "maxCapacity" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Halqoh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UstadzProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "nik" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "birthPlace" TEXT,
    "birthDate" TIMESTAMP(3),
    "hireDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "specialization" TEXT,
    "education" TEXT,

    CONSTRAINT "UstadzProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lembagaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicCalendar" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "academicYear" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lembagaId" TEXT,

    CONSTRAINT "AcademicCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLembaga" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "lembagaId" TEXT NOT NULL,

    CONSTRAINT "EventLembaga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapelGroup" (
    "id" TEXT NOT NULL,
    "lembagaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapelGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mapel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "kelasId" TEXT NOT NULL,
    "ustadzId" TEXT,
    "groupId" TEXT,

    CONSTRAINT "Mapel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ujian" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "description" TEXT,
    "semester" TEXT,
    "academicYearId" TEXT,
    "mapelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ujian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nilai" (
    "id" TEXT NOT NULL,
    "gradeType" TEXT NOT NULL DEFAULT 'NUMERIC',
    "score" DOUBLE PRECISION,
    "letterGrade" TEXT,
    "category" TEXT NOT NULL DEFAULT 'UJIAN',
    "semester" TEXT,
    "academicYearId" TEXT,
    "santriId" TEXT NOT NULL,
    "mapelId" TEXT,
    "ujianId" TEXT,
    "lembagaId" TEXT,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nilai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeWeight" (
    "id" TEXT NOT NULL,
    "lembagaId" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GradeWeight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "mapelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionBank" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "points" INTEGER NOT NULL DEFAULT 1,
    "explanation" TEXT,
    "imageUrl" TEXT,
    "mapelId" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionBank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamQuestion" (
    "id" TEXT NOT NULL,
    "ujianId" TEXT NOT NULL,
    "questionBankId" TEXT,
    "directQuestion" TEXT,
    "directType" TEXT,
    "directOptions" TEXT,
    "directAnswer" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "itemType" TEXT NOT NULL DEFAULT 'QUESTION',

    CONSTRAINT "ExamQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tahfidz" (
    "id" TEXT NOT NULL,
    "santriId" TEXT NOT NULL,
    "ustadzId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "surah" TEXT NOT NULL,
    "ayatStart" INTEGER NOT NULL,
    "ayatEnd" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "grade" TEXT,
    "note" TEXT,
    "semester" TEXT,
    "academicYearId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tahfidz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Billing" (
    "id" TEXT NOT NULL,
    "santriId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "description" TEXT,
    "academicYear" TEXT,
    "month" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Billing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "billingId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "note" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KelasHistory" (
    "id" TEXT NOT NULL,
    "santriId" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "academicYear" TEXT NOT NULL,
    "semester" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "KelasHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViolationCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViolationCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViolationRecord" (
    "id" TEXT NOT NULL,
    "santriId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "sanction" TEXT,
    "status" TEXT NOT NULL,
    "reportedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViolationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AchievementRecord" (
    "id" TEXT NOT NULL,
    "santriId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "rank" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AchievementRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IbadahRecord" (
    "id" TEXT NOT NULL,
    "santriId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "prayer" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IbadahRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PiketSchedule" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "asramaId" TEXT,
    "kelasId" TEXT,
    "day" TEXT NOT NULL,
    "santriId" TEXT NOT NULL,
    "area" TEXT,
    "role" TEXT,
    "piketAreaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PiketSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PiketArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PiketArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySchedule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "days" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keuangan" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "proofUrl" TEXT,
    "division" TEXT,

    CONSTRAINT "Keuangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tagihan" (
    "id" TEXT NOT NULL,
    "santriId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "paidDate" TIMESTAMP(3),

    CONSTRAINT "Tagihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialCategoryAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "FinancialCategoryAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "category" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "location" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "price" DOUBLE PRECISION,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceLog" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "cost" DOUBLE PRECISION,
    "performer" TEXT,

    CONSTRAINT "MaintenanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PSBRegistration" (
    "id" TEXT NOT NULL,
    "registrationNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nisn" TEXT,
    "gender" TEXT NOT NULL,
    "birthPlace" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "motherName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "santriId" TEXT,

    CONSTRAINT "PSBRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentArchive" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "number" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "sender" TEXT,
    "recipient" TEXT,
    "fileUrl" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "DocumentArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadioSchedule" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "host" TEXT,
    "topic" TEXT,
    "streamUrl" TEXT,

    CONSTRAINT "RadioSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeSetting" (
    "id" TEXT NOT NULL,
    "lembagaId" TEXT NOT NULL,
    "gradeValue" DOUBLE PRECISION NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GradeSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_userId_permissionId_key" ON "UserPermission"("userId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "PDFLayoutSettings_lembagaId_key" ON "PDFLayoutSettings"("lembagaId");

-- CreateIndex
CREATE UNIQUE INDEX "SyncMetadata_dataType_key" ON "SyncMetadata"("dataType");

-- CreateIndex
CREATE INDEX "LembagaGradeCategory_lembagaId_idx" ON "LembagaGradeCategory"("lembagaId");

-- CreateIndex
CREATE UNIQUE INDEX "LembagaGradeCategory_lembagaId_name_key" ON "LembagaGradeCategory"("lembagaId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Santri_nis_key" ON "Santri"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "Santri_userId_key" ON "Santri"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Kelas_ketuaKelasId_key" ON "Kelas"("ketuaKelasId");

-- CreateIndex
CREATE UNIQUE INDEX "Asrama_ketuaAsramaId_key" ON "Asrama"("ketuaAsramaId");

-- CreateIndex
CREATE UNIQUE INDEX "UstadzProfile_userId_key" ON "UstadzProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UstadzProfile_nik_key" ON "UstadzProfile"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "EventLembaga_eventId_lembagaId_key" ON "EventLembaga"("eventId", "lembagaId");

-- CreateIndex
CREATE INDEX "MapelGroup_lembagaId_idx" ON "MapelGroup"("lembagaId");

-- CreateIndex
CREATE UNIQUE INDEX "MapelGroup_lembagaId_name_key" ON "MapelGroup"("lembagaId", "name");

-- CreateIndex
CREATE INDEX "GradeWeight_lembagaId_idx" ON "GradeWeight"("lembagaId");

-- CreateIndex
CREATE UNIQUE INDEX "GradeWeight_lembagaId_examType_key" ON "GradeWeight"("lembagaId", "examType");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_receiptNumber_key" ON "Payment"("receiptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "IbadahRecord_santriId_date_prayer_key" ON "IbadahRecord"("santriId", "date", "prayer");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_code_key" ON "Asset"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PSBRegistration_registrationNo_key" ON "PSBRegistration"("registrationNo");

-- CreateIndex
CREATE UNIQUE INDEX "PSBRegistration_santriId_key" ON "PSBRegistration"("santriId");

-- CreateIndex
CREATE INDEX "GradeSetting_lembagaId_idx" ON "GradeSetting"("lembagaId");

-- CreateIndex
CREATE UNIQUE INDEX "GradeSetting_lembagaId_gradeValue_key" ON "GradeSetting"("lembagaId", "gradeValue");

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PDFLayoutSettings" ADD CONSTRAINT "PDFLayoutSettings_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LembagaGradeCategory" ADD CONSTRAINT "LembagaGradeCategory_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Santri" ADD CONSTRAINT "Santri_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Santri" ADD CONSTRAINT "Santri_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Santri" ADD CONSTRAINT "Santri_asramaId_fkey" FOREIGN KEY ("asramaId") REFERENCES "Asrama"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Santri" ADD CONSTRAINT "Santri_halqohId_fkey" FOREIGN KEY ("halqohId") REFERENCES "Halqoh"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Santri" ADD CONSTRAINT "Santri_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kelas" ADD CONSTRAINT "Kelas_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kelas" ADD CONSTRAINT "Kelas_ketuaKelasId_fkey" FOREIGN KEY ("ketuaKelasId") REFERENCES "Santri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kelas" ADD CONSTRAINT "Kelas_waliKelasId_fkey" FOREIGN KEY ("waliKelasId") REFERENCES "UstadzProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kelas" ADD CONSTRAINT "Kelas_nextKelasId_fkey" FOREIGN KEY ("nextKelasId") REFERENCES "Kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JamPelajaran" ADD CONSTRAINT "JamPelajaran_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JadwalPelajaran" ADD CONSTRAINT "JadwalPelajaran_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JadwalPelajaran" ADD CONSTRAINT "JadwalPelajaran_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "Mapel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JadwalPelajaran" ADD CONSTRAINT "JadwalPelajaran_jamPelajaranId_fkey" FOREIGN KEY ("jamPelajaranId") REFERENCES "JamPelajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asrama" ADD CONSTRAINT "Asrama_ketuaAsramaId_fkey" FOREIGN KEY ("ketuaAsramaId") REFERENCES "Santri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asrama" ADD CONSTRAINT "Asrama_musyrifId_fkey" FOREIGN KEY ("musyrifId") REFERENCES "UstadzProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Halqoh" ADD CONSTRAINT "Halqoh_ustadzId_fkey" FOREIGN KEY ("ustadzId") REFERENCES "UstadzProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UstadzProfile" ADD CONSTRAINT "UstadzProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicYear" ADD CONSTRAINT "AcademicYear_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicCalendar" ADD CONSTRAINT "AcademicCalendar_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLembaga" ADD CONSTRAINT "EventLembaga_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "AcademicCalendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLembaga" ADD CONSTRAINT "EventLembaga_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapelGroup" ADD CONSTRAINT "MapelGroup_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mapel" ADD CONSTRAINT "Mapel_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mapel" ADD CONSTRAINT "Mapel_ustadzId_fkey" FOREIGN KEY ("ustadzId") REFERENCES "UstadzProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mapel" ADD CONSTRAINT "Mapel_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MapelGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ujian" ADD CONSTRAINT "Ujian_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ujian" ADD CONSTRAINT "Ujian_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "Mapel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "Mapel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_ujianId_fkey" FOREIGN KEY ("ujianId") REFERENCES "Ujian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LembagaGradeCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeWeight" ADD CONSTRAINT "GradeWeight_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionCategory" ADD CONSTRAINT "QuestionCategory_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "Mapel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionBank" ADD CONSTRAINT "QuestionBank_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "Mapel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionBank" ADD CONSTRAINT "QuestionBank_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "QuestionCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_ujianId_fkey" FOREIGN KEY ("ujianId") REFERENCES "Ujian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "QuestionBank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tahfidz" ADD CONSTRAINT "Tahfidz_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tahfidz" ADD CONSTRAINT "Tahfidz_ustadzId_fkey" FOREIGN KEY ("ustadzId") REFERENCES "UstadzProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tahfidz" ADD CONSTRAINT "Tahfidz_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Billing" ADD CONSTRAINT "Billing_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Billing" ADD CONSTRAINT "Billing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BillingCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_billingId_fkey" FOREIGN KEY ("billingId") REFERENCES "Billing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TransactionCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KelasHistory" ADD CONSTRAINT "KelasHistory_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KelasHistory" ADD CONSTRAINT "KelasHistory_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViolationRecord" ADD CONSTRAINT "ViolationRecord_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViolationRecord" ADD CONSTRAINT "ViolationRecord_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ViolationCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AchievementRecord" ADD CONSTRAINT "AchievementRecord_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IbadahRecord" ADD CONSTRAINT "IbadahRecord_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PiketSchedule" ADD CONSTRAINT "PiketSchedule_asramaId_fkey" FOREIGN KEY ("asramaId") REFERENCES "Asrama"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PiketSchedule" ADD CONSTRAINT "PiketSchedule_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PiketSchedule" ADD CONSTRAINT "PiketSchedule_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PiketSchedule" ADD CONSTRAINT "PiketSchedule_piketAreaId_fkey" FOREIGN KEY ("piketAreaId") REFERENCES "PiketArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tagihan" ADD CONSTRAINT "Tagihan_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialCategoryAccess" ADD CONSTRAINT "FinancialCategoryAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PSBRegistration" ADD CONSTRAINT "PSBRegistration_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeSetting" ADD CONSTRAINT "GradeSetting_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga"("id") ON DELETE CASCADE ON UPDATE CASCADE;
