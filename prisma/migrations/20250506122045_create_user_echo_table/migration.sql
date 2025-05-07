-- CreateTable
CREATE TABLE "UserEcho" (
    "user_id" TEXT NOT NULL,
    "phrases" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEcho_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "UserEcho" ADD CONSTRAINT "UserEcho_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
