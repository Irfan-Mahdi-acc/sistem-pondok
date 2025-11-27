-- CreateTable
CREATE TABLE "PDFLayoutSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "showLogo" BOOLEAN NOT NULL DEFAULT true,
    "logoSize" INTEGER NOT NULL DEFAULT 30,
    "headerText" TEXT,
    "showPondokName" BOOLEAN NOT NULL DEFAULT true,
    "pondokNameSize" INTEGER NOT NULL DEFAULT 14,
    "footerText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
