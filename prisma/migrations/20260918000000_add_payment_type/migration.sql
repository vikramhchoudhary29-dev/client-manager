CREATE TYPE "PaymentType" AS ENUM ('ADVANCE', 'PROJECT_PAYMENT');
ALTER TABLE "Payment" ADD COLUMN "type" "PaymentType" NOT NULL DEFAULT 'PROJECT_PAYMENT';
CREATE INDEX "Payment_type_idx" ON "Payment"("type");
