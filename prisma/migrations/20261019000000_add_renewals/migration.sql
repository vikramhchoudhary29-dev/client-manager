CREATE TABLE "Renewal" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "serviceName" TEXT NOT NULL,
  "renewalDate" TIMESTAMP(3) NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'UPCOMING',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Renewal_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Renewal_renewalDate_idx" ON "Renewal"("renewalDate");
CREATE INDEX "Renewal_status_idx" ON "Renewal"("status");
ALTER TABLE "Renewal" ADD CONSTRAINT "Renewal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
