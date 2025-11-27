-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PDFLayoutSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PDFLayoutSettings_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PDFLayoutSettings" ("createdAt", "footerText", "headerText", "id", "logoSize", "pondokNameSize", "showLogo", "showPondokName", "updatedAt") SELECT "createdAt", "footerText", "headerText", "id", "logoSize", "pondokNameSize", "showLogo", "showPondokName", "updatedAt" FROM "PDFLayoutSettings";
DROP TABLE "PDFLayoutSettings";
ALTER TABLE "new_PDFLayoutSettings" RENAME TO "PDFLayoutSettings";
CREATE UNIQUE INDEX "PDFLayoutSettings_lembagaId_key" ON "PDFLayoutSettings"("lembagaId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
