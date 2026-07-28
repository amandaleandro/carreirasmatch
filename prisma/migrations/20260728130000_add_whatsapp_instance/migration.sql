-- Suporte a múltiplos números/instâncias da Evolution API (rotação e
-- failover, pra não depender de um único número que pode ser banido).
CREATE TABLE "WhatsappInstance" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "instanceName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsappInstance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WhatsappInstance_instanceName_key" ON "WhatsappInstance"("instanceName");
