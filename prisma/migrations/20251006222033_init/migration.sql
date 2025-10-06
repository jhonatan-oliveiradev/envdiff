-- CreateTable
CREATE TABLE "Comparison" (
    "id" TEXT NOT NULL,
    "greenUrl" TEXT NOT NULL,
    "blueUrl" TEXT NOT NULL,
    "viewports" TEXT NOT NULL,
    "ignoreSelectors" TEXT,
    "maskSelectors" TEXT,
    "pixelThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "visualResults" TEXT,
    "domDiff" TEXT,
    "httpDiff" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comparison_pkey" PRIMARY KEY ("id")
);
